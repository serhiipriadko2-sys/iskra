
import type { MemoryMode } from '@iskra/runtime';
import { Task, JournalEntry, DuoSharePrefs, DuoCanvasNote, Habit, VoicePreferences, VoiceName, ResponseMode } from '../types';
import { memoryService } from './memoryService';
import { principalStorage, type StorageMutation } from './principalStorage';
import { safeStorage } from './storageCompat';
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
const PRINCIPAL_LEGACY_KEYS = [
  TASKS_KEY,
  JOURNAL_ENTRIES_KEY,
  DUO_PREFS_KEY,
  DUO_CANVAS_NOTES_KEY,
  HABITS_KEY,
  JOURNAL_PIN_KEY,
  ONBOARDING_KEY,
  TUTORIAL_KEY,
  USER_NAME_KEY,
  VOICE_PREFS_KEY,
  LAST_VOICE_STATE_KEY,
  RESPONSE_MODE_KEY,
  'iskra-space-archive',
  'iskra-space-shadow',
  'iskra-space-mantra',
  'iskra-symbiosis-profile-v1',
  'iskra-symbiosis-consent-receipts-v1',
  'iskra-symbiosis-action-receipts-v1',
  'iskra-mood-entries',
  'iskra_focus_minutes_today',
  'iskra_focus_date',
  'iskra_sleep_score',
  'iskra_sleep_date',
  'iskra_audit_log',
  'iskra_last_playbook',
  'iskra_integrity_state',
  'iskra_guard_counters',
  'iskra-ritual-metrics-history',
  'iskra-canon-seeded-v2',
] as const;

function legacyPrincipalQueueKeys(principalId: string): string[] {
  return [
    `metrics_latest_${principalId}`,
    `chat_history_${principalId}`,
    `memory_archive_${principalId}`,
    `memory_shadow_${principalId}`,
    `memory_all_${principalId}`,
  ];
}

function clearLegacyPrincipalQueues(principalId: string): void {
  for (const key of legacyPrincipalQueueKeys(principalId)) {
    localStorage.removeItem(key);
  }
}
export const MAX_BACKUP_BYTES = 1024 * 1024;
const MAX_IMPORTED_ITEMS = 10_000;
const RITUAL_TAGS = new Set(['FIRE', 'WATER', 'SUN', 'BALANCE', 'DELTA']);
const SHARE_LEVELS = new Set(['hidden', 'daily_score', 'weekly_mean']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const isBoundedString = (value: unknown, max = 12_000): value is string =>
  typeof value === 'string' && value.length <= max;

const validArray = <T>(
  value: unknown,
  predicate: (item: unknown) => item is T,
): value is T[] =>
  Array.isArray(value) && value.length <= MAX_IMPORTED_ITEMS && value.every(predicate);

const isTask = (value: unknown): value is Task =>
  isRecord(value) &&
  isBoundedString(value.id, 256) &&
  isBoundedString(value.title) &&
  RITUAL_TAGS.has(String(value.ritualTag)) &&
  typeof value.done === 'boolean';

const isHabit = (value: unknown): value is Habit =>
  isRecord(value) &&
  isBoundedString(value.id, 256) &&
  isBoundedString(value.title) &&
  Number.isInteger(value.streak) &&
  (value.streak as number) >= 0 &&
  typeof value.completedToday === 'boolean' &&
  RITUAL_TAGS.has(String(value.ritualTag));

const isJournalEntry = (value: unknown): value is JournalEntry =>
  isRecord(value) &&
  isBoundedString(value.id, 256) &&
  isBoundedString(value.timestamp, 64) &&
  Number.isFinite(Date.parse(value.timestamp)) &&
  isBoundedString(value.text) &&
  isRecord(value.prompt) &&
  isBoundedString(value.prompt.question) &&
  isBoundedString(value.prompt.why);

const isDuoPrefs = (value: unknown): value is DuoSharePrefs =>
  isRecord(value) &&
  SHARE_LEVELS.has(String(value.sleep)) &&
  SHARE_LEVELS.has(String(value.focus)) &&
  SHARE_LEVELS.has(String(value.habits));

const isDuoCanvasNote = (value: unknown): value is DuoCanvasNote =>
  isRecord(value) &&
  isBoundedString(value.id, 256) &&
  isBoundedString(value.text) &&
  isBoundedString(value.color, 256);

function serializeImport(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error('invalid_backup_value');
  return serialized;
}

function backupByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export const storageService = {
  bindPrincipal(principalId: string): void {
    principalStorage.bind(principalId);
    try {
      principalStorage.migrateLegacy(PRINCIPAL_LEGACY_KEYS);
    } catch (error) {
      principalStorage.unbind();
      throw error;
    }
  },

  releasePrincipal(options: { clear?: boolean } = {}): void {
    const principalId = principalStorage.activePrincipal();
    try {
      if (options.clear && principalId) {
        try {
          principalStorage.clearBoundPrincipal();
          clearLegacyPrincipalQueues(principalId);
        } finally {
          safeStorage.clearBoundPrincipalFallback();
        }
      }
    } finally {
      principalStorage.unbind();
    }
  },

  // Tasks
  getTasks(): Task[] {
    try {
      const tasksJson = principalStorage.getItem(TASKS_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error("Error reading tasks from localStorage", error);
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      principalStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage", error);
    }
  },

  // Habits
  getHabits(): Habit[] {
    try {
      const habitsJson = principalStorage.getItem(HABITS_KEY);
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
          principalStorage.setItem(HABITS_KEY, JSON.stringify(habits));
      } catch (error) {
          console.error("Error saving habits", error);
      }
  },

  // Journal Entries
  getJournalEntries(): JournalEntry[] {
    try {
      const entriesJson = principalStorage.getItem(JOURNAL_ENTRIES_KEY);
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
      principalStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
    } catch (error)      {
      console.error("Error adding journal entry to localStorage", error);
    }
  },

  // Journal Security
  getJournalPin(): string | null {
    return principalStorage.getItem(JOURNAL_PIN_KEY);
  },

  saveJournalPin(pin: string): void {
    principalStorage.setItem(JOURNAL_PIN_KEY, pin);
  },

  // Duo Preferences
  getDuoPrefs(): DuoSharePrefs {
    try {
      const prefsJson = principalStorage.getItem(DUO_PREFS_KEY);
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
      principalStorage.setItem(DUO_PREFS_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error("Error saving duo prefs to localStorage", error);
    }
  },

  // Duo Canvas Notes
  getDuoCanvasNotes(): DuoCanvasNote[] {
    try {
      const notesJson = principalStorage.getItem(DUO_CANVAS_NOTES_KEY);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error("Error reading duo canvas notes from localStorage", error);
      return [];
    }
  },

  saveDuoCanvasNotes(notes: DuoCanvasNote[]): void {
    try {
      principalStorage.setItem(DUO_CANVAS_NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Error saving duo canvas notes to localStorage", error);
    }
  },

  // User Identity & Onboarding
  isOnboardingComplete(): boolean {
    return principalStorage.getItem(ONBOARDING_KEY) === 'true' && symbiosisService.getProfile() !== null;
  },

  completeOnboarding(userName: string, memoryMode: MemoryMode): SymbiosisState {
    const state = symbiosisService.completeOnboarding(memoryMode);
    principalStorage.setItem(ONBOARDING_KEY, 'true');
    principalStorage.setItem(USER_NAME_KEY, userName);
    return state;
  },

  getSymbiosisState(): SymbiosisState | null {
    return symbiosisService.getState();
  },

  restoreSymbiosisState(state: unknown): boolean {
    const restored = symbiosisService.importState(state);
    if (restored) {
      principalStorage.setItem(ONBOARDING_KEY, 'true');
    }
    return restored;
  },

  getUserName(): string {
    return principalStorage.getItem(USER_NAME_KEY) || 'Спутник';
  },

  // Tutorial / Onboarding Tour
  hasSeenTutorial(): boolean {
    return principalStorage.getItem(TUTORIAL_KEY) === 'true';
  },

  completeTutorial(): void {
    principalStorage.setItem(TUTORIAL_KEY, 'true');
  },

  // Voice Preferences & State
  getVoicePreferences(): VoicePreferences {
      try {
          const raw = principalStorage.getItem(VOICE_PREFS_KEY);
          return raw ? JSON.parse(raw) : {};
      } catch (_e) {
          return {};
      }
  },

  saveVoicePreferences(prefs: VoicePreferences): void {
      principalStorage.setItem(VOICE_PREFS_KEY, JSON.stringify(prefs));
  },

  // Returns { mode: 'AUTO' | VoiceName, lastVoice: VoiceName }
  getLastVoiceState(): { mode: string, lastVoice: VoiceName } {
      try {
          const raw = principalStorage.getItem(LAST_VOICE_STATE_KEY);
          if (raw) return JSON.parse(raw);
      } catch (_e) { /* intentionally empty */ }
      return { mode: 'AUTO', lastVoice: 'ISKRA' };
  },

  saveLastVoiceState(mode: string, lastVoice: VoiceName): void {
      principalStorage.setItem(LAST_VOICE_STATE_KEY, JSON.stringify({ mode, lastVoice }));
  },

  // Response Mode (Simple / Deep / Debate)
  getResponseMode(): ResponseMode {
      const raw = principalStorage.getItem(RESPONSE_MODE_KEY);
      if (raw === 'simple' || raw === 'deep' || raw === 'debate') {
          return raw;
      }
      return 'deep'; // Default to deep mode
  },

  saveResponseMode(mode: ResponseMode): void {
      principalStorage.setItem(RESPONSE_MODE_KEY, mode);
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
    const exported = JSON.stringify(data, null, 2);
    if (backupByteLength(exported) > MAX_BACKUP_BYTES) {
      throw new Error('backup_export_too_large');
    }
    return exported;
  },

  importAllData(jsonString: string): void {
      try {
          if (backupByteLength(jsonString) > MAX_BACKUP_BYTES) {
            throw new Error('backup_too_large');
          }
          const data: unknown = JSON.parse(jsonString);
          if (!isRecord(data) || data.version !== '1.0.0') throw new Error('unsupported_backup_version');

          const mutations: StorageMutation[] = [];
          if (data.tasks !== undefined) {
            if (!validArray(data.tasks, isTask)) throw new Error('invalid_tasks');
            mutations.push({ key: TASKS_KEY, value: serializeImport(data.tasks) });
          }
          if (data.habits !== undefined) {
            if (!validArray(data.habits, isHabit)) throw new Error('invalid_habits');
            mutations.push({ key: HABITS_KEY, value: serializeImport(data.habits) });
          }
          if (data.journal !== undefined) {
            if (!validArray(data.journal, isJournalEntry)) throw new Error('invalid_journal');
            mutations.push({ key: JOURNAL_ENTRIES_KEY, value: serializeImport(data.journal) });
          }
          if (data.duo !== undefined) {
            if (!isRecord(data.duo)) throw new Error('invalid_duo');
            if (data.duo.prefs !== undefined) {
              if (!isDuoPrefs(data.duo.prefs)) throw new Error('invalid_duo_prefs');
              mutations.push({ key: DUO_PREFS_KEY, value: serializeImport(data.duo.prefs) });
            }
            if (data.duo.notes !== undefined) {
              if (!validArray(data.duo.notes, isDuoCanvasNote)) throw new Error('invalid_duo_notes');
              mutations.push({ key: DUO_CANVAS_NOTES_KEY, value: serializeImport(data.duo.notes) });
            }
          }
          if (data.voice !== undefined) {
            if (!isRecord(data.voice)) throw new Error('invalid_voice');
            if (data.voice.prefs !== undefined) {
              if (!isRecord(data.voice.prefs)) throw new Error('invalid_voice_prefs');
              mutations.push({ key: VOICE_PREFS_KEY, value: serializeImport(data.voice.prefs) });
            }
            if (data.voice.state !== undefined) {
              if (
                !isRecord(data.voice.state) ||
                !isBoundedString(data.voice.state.mode, 64) ||
                !isBoundedString(data.voice.state.lastVoice, 64)
              ) {
                throw new Error('invalid_voice_state');
              }
              mutations.push({ key: LAST_VOICE_STATE_KEY, value: serializeImport(data.voice.state) });
            }
          }
          if (data.memory !== undefined) {
            const prepared = memoryService.prepareImport(data.memory);
            mutations.push(
              { key: 'iskra-space-archive', value: serializeImport(prepared.archive) },
              { key: 'iskra-space-shadow', value: serializeImport(prepared.shadow) },
            );
          }
          if (data.responseMode !== undefined) {
            if (data.responseMode !== 'simple' && data.responseMode !== 'deep' && data.responseMode !== 'debate') {
              throw new Error('invalid_response_mode');
            }
            mutations.push({ key: RESPONSE_MODE_KEY, value: data.responseMode });
          }

          principalStorage.applyTransaction(mutations);
          window.location.reload();
      } catch (error) {
          console.error("Import failed:", error);
          throw new Error("Неверный формат файла или поврежденные данные.");
      }
  },

  clearAllData(): void {
    try {
      localStorage.clear();
    } finally {
      safeStorage.clearAllFallbacks();
      principalStorage.unbind();
    }
    window.location.reload();
  }
};
