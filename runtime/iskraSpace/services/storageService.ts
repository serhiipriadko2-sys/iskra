import type { MemoryMode } from '@iskra/runtime';
import { Task, JournalEntry, DuoSharePrefs, DuoCanvasNote, Habit, VoicePreferences, VoiceName, ResponseMode } from '../types';
import { memoryService } from './memoryService';
import { storageBoundary } from './storageBoundary';
import { symbiosisService, type SymbiosisState } from './symbiosisService';

const TASKS_KEY = 'iskra-space-tasks';
const JOURNAL_ENTRIES_KEY = 'iskra-space-journal-entries';
const DUO_PREFS_KEY = 'iskra-space-duo-prefs';
const DUO_CANVAS_NOTES_KEY = 'iskra-space-duo-canvas-notes';
const HABITS_KEY = 'iskra-space-habits';
const JOURNAL_PIN_KEY = 'iskra-journal-pin';
const ONBOARDING_KEY = 'iskra-onboarding-complete';
const TUTORIAL_KEY = 'iskra-tutorial-seen';
const USER_NAME_KEY = 'iskra-user-name';
const VOICE_PREFS_KEY = 'iskra-voice-preferences';
const LAST_VOICE_STATE_KEY = 'iskra-last-voice-state';
const RESPONSE_MODE_KEY = 'iskra-response-mode';

export const storageService = {
  // Tasks
  getTasks(): Task[] {
    try {
      const tasksJson = storageBoundary.getItem(TASKS_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error("Error reading tasks from localStorage", error);
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      storageBoundary.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage", error);
    }
  },

  // Habits
  getHabits(): Habit[] {
    try {
      const habitsJson = storageBoundary.getItem(HABITS_KEY);
      if (habitsJson) {
          return JSON.parse(habitsJson);
      }
      // Default habits if none exist
      const defaultHabits: Habit[] = [
          { id: 'h1', title: 'Утренний стакан воды', streak: 5, completedToday: false, ritualTag: 'WATER' },
          { id: 'h2', title: 'Чтение (15 мин)', streak: 2, completedToday: false, ritualTag: 'SUN' },
          { id: 'h3', title: 'Прогулка', streak: 12, completedToday: false, ritualTag: 'BALANCE' },
      ];
      return defaultHabits;
    } catch (error) {
        console.error("Error reading habits", error);
        return [];
    }
  },

  saveHabits(habits: Habit[]): void {
      try {
          storageBoundary.setItem(HABITS_KEY, JSON.stringify(habits));
      } catch (error) {
          console.error("Error saving habits", error);
      }
  },

  // Journal Entries
  getJournalEntries(): JournalEntry[] {
    try {
      const entriesJson = storageBoundary.getItem(JOURNAL_ENTRIES_KEY);
      const entries: JournalEntry[] = entriesJson ? JSON.parse(entriesJson) : [];
      // Sort by timestamp descending to show newest first
      return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error("Error reading journal entries from localStorage", error);
      return [];
    }
  },
  
  addJournalEntry(entry: JournalEntry): void {
    try {
      const entries = this.getJournalEntries();
      // Prepend the new entry to maintain sort order
      const updatedEntries = [entry, ...entries];
      storageBoundary.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
    } catch (error)      {
      console.error("Error adding journal entry to localStorage", error);
    }
  },

  // Journal Security
  getJournalPin(): string | null {
    return storageBoundary.getItem(JOURNAL_PIN_KEY);
  },

  saveJournalPin(pin: string): void {
    storageBoundary.setItem(JOURNAL_PIN_KEY, pin);
  },

  // Duo Preferences
  getDuoPrefs(): DuoSharePrefs {
    try {
      const prefsJson = storageBoundary.getItem(DUO_PREFS_KEY);
      if (prefsJson) {
        return JSON.parse(prefsJson);
      }
    } catch (error) {
      console.error("Error reading duo prefs from localStorage", error);
    }
    // Return default values if nothing is stored or an error occurs
    return {
      sleep: 'weekly_mean',
      focus: 'daily_score',
      habits: 'hidden',
    };
  },

  saveDuoPrefs(prefs: DuoSharePrefs): void {
    try {
      storageBoundary.setItem(DUO_PREFS_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error("Error saving duo prefs to localStorage", error);
    }
  },

  // Duo Canvas Notes
  getDuoCanvasNotes(): DuoCanvasNote[] {
    try {
      const notesJson = storageBoundary.getItem(DUO_CANVAS_NOTES_KEY);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error("Error reading duo canvas notes from localStorage", error);
      return [];
    }
  },

  saveDuoCanvasNotes(notes: DuoCanvasNote[]): void {
    try {
      storageBoundary.setItem(DUO_CANVAS_NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Error saving duo canvas notes to localStorage", error);
    }
  },

  // User Identity & Onboarding
  isOnboardingComplete(): boolean {
    return storageBoundary.getItem(ONBOARDING_KEY) === 'true' && symbiosisService.getProfile() !== null;
  },

  completeOnboarding(userName: string, memoryMode: MemoryMode): SymbiosisState {
    const state = symbiosisService.completeOnboarding(memoryMode);
    storageBoundary.setItem(ONBOARDING_KEY, 'true');
    storageBoundary.setItem(USER_NAME_KEY, userName);
    return state;
  },

  getSymbiosisState(): SymbiosisState | null {
    return symbiosisService.getState();
  },

  restoreSymbiosisState(state: unknown): boolean {
    const restored = symbiosisService.importState(state);
    if (restored) {
      storageBoundary.setItem(ONBOARDING_KEY, 'true');
    }
    return restored;
  },

  getUserName(): string {
    return storageBoundary.getItem(USER_NAME_KEY) || 'Спутник';
  },

  // Tutorial / Onboarding Tour
  hasSeenTutorial(): boolean {
    return storageBoundary.getItem(TUTORIAL_KEY) === 'true';
  },

  completeTutorial(): void {
    storageBoundary.setItem(TUTORIAL_KEY, 'true');
  },

  // Voice Preferences & State
  getVoicePreferences(): VoicePreferences {
      try {
          const raw = storageBoundary.getItem(VOICE_PREFS_KEY);
          return raw ? JSON.parse(raw) : {};
      } catch (_e) {
          return {};
      }
  },

  saveVoicePreferences(prefs: VoicePreferences): void {
      storageBoundary.setItem(VOICE_PREFS_KEY, JSON.stringify(prefs));
  },

  // Returns { mode: 'AUTO' | VoiceName, lastVoice: VoiceName }
  getLastVoiceState(): { mode: string, lastVoice: VoiceName } {
      try {
          const raw = storageBoundary.getItem(LAST_VOICE_STATE_KEY);
          if (raw) return JSON.parse(raw);
      } catch (_e) { /* intentionally empty */ }
      return { mode: 'AUTO', lastVoice: 'ISKRA' };
  },

  saveLastVoiceState(mode: string, lastVoice: VoiceName): void {
      storageBoundary.setItem(LAST_VOICE_STATE_KEY, JSON.stringify({ mode, lastVoice }));
  },

  // Response Mode (Simple / Deep / Debate)
  getResponseMode(): ResponseMode {
      const raw = storageBoundary.getItem(RESPONSE_MODE_KEY);
      if (raw === 'simple' || raw === 'deep' || raw === 'debate') {
          return raw;
      }
      return 'deep'; // Default to deep mode
  },

  saveResponseMode(mode: ResponseMode): void {
      storageBoundary.setItem(RESPONSE_MODE_KEY, mode);
  },

  // Data Management (Privacy & Sovereignty)
  exportAllData(): string {
    const data = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        user: this.getUserName(),
        tasks: this.getTasks(),
        habits: this.getHabits(),
        journal: this.getJournalEntries(),
        duo: {
            prefs: this.getDuoPrefs(),
            notes: this.getDuoCanvasNotes()
        },
        memory: {
            archive: memoryService.getArchive(),
            shadow: memoryService.getShadow()
        },
        voice: {
            prefs: this.getVoicePreferences(),
            state: this.getLastVoiceState()
        },
        responseMode: this.getResponseMode(),
        symbiosis: symbiosisService.exportState()
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonString: string): void {
      try {
          const data = JSON.parse(jsonString);
          
          if (data.tasks) this.saveTasks(data.tasks);
          if (data.habits) this.saveHabits(data.habits);
          if (data.journal) storageBoundary.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(data.journal));
          if (data.duo) {
              if (data.duo.prefs) this.saveDuoPrefs(data.duo.prefs);
              if (data.duo.notes) this.saveDuoCanvasNotes(data.duo.notes);
          }
          if (data.voice) {
              if (data.voice.prefs) this.saveVoicePreferences(data.voice.prefs);
              if (data.voice.state) {
                  const s = data.voice.state;
                  this.saveLastVoiceState(s.mode, s.lastVoice);
              }
          }
          if (data.memory) {
              memoryService.importMemory(data.memory);
          }
          if (data.responseMode) {
              this.saveResponseMode(data.responseMode);
          }

          // Force refresh to reload state
          window.location.reload();
      } catch (error) {
          console.error("Import failed:", error);
          throw new Error("Неверный формат файла или поврежденные данные.");
      }
  },

  clearAllData(): void {
    storageBoundary.clear();
    window.location.reload();
  }
};
