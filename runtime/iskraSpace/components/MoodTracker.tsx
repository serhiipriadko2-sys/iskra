/**
 * MOOD TRACKER COMPONENT
 *
 * Quick mood check-in widget for tracking emotional state and energy levels.
 * Stores mood history for pattern visualization.
 */

import React, { useState, useEffect } from 'react';
import { SparkleIcon, ChevronRightIcon } from './icons';
import { principalStorage } from '../services/principalStorage';

interface MoodEntry {
  id: string;
  timestamp: string;
  mood: number; // 0-100
  energy: number; // 0-100
  note?: string;
}

const MOOD_STORAGE_KEY = 'iskra-mood-entries';

// Mood level labels and colors
const getMoodLabel = (value: number): { label: string; emoji: string; color: string } => {
  if (value >= 80) return { label: 'Отлично', emoji: '😊', color: 'text-success' };
  if (value >= 60) return { label: 'Хорошо', emoji: '🙂', color: 'text-accent' };
  if (value >= 40) return { label: 'Нейтрально', emoji: '😐', color: 'text-text-muted' };
  if (value >= 20) return { label: 'Плохо', emoji: '😔', color: 'text-warning' };
  return { label: 'Тяжело', emoji: '😞', color: 'text-danger' };
};

const getEnergyLabel = (value: number): { label: string; emoji: string } => {
  if (value >= 80) return { label: 'Полон сил', emoji: '⚡' };
  if (value >= 60) return { label: 'Бодрый', emoji: '🔋' };
  if (value >= 40) return { label: 'Средне', emoji: '〰️' };
  if (value >= 20) return { label: 'Устал', emoji: '😴' };
  return { label: 'Истощён', emoji: '🪫' };
};

// Storage helpers
const getMoodEntries = (): MoodEntry[] => {
  try {
    const raw = principalStorage.getItem(MOOD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveMoodEntry = (entry: MoodEntry): void => {
  const entries = getMoodEntries();
  entries.unshift(entry);
  // Keep last 100 entries
  const trimmed = entries.slice(0, 100);
  principalStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(trimmed));
};

// Mini Slider Component
const MoodSlider: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  emoji: string;
  colorClass: string;
}> = ({ label, value, onChange, emoji, colorClass }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="text-sm text-text-muted flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        {label}
      </span>
      <span className={`font-mono text-sm ${colorClass}`}>{value}%</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-surface2"
      style={{
        accentColor: colorClass === 'text-success' ? '#2ECC71' :
                     colorClass === 'text-accent' ? '#4DA3FF' :
                     colorClass === 'text-warning' ? '#FFB020' :
                     colorClass === 'text-danger' ? '#FF4D4D' : '#8A9199'
      }}
    />
  </div>
);

// History Mini Chart
const MoodHistory: React.FC<{ entries: MoodEntry[] }> = ({ entries }) => {
  if (entries.length === 0) return null;

  const last7 = entries.slice(0, 7).reverse();

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-xs text-text-muted mb-2">Последние 7 записей</p>
      <div className="flex items-end justify-between gap-1 h-12">
        {last7.map((entry) => {
          const height = `${Math.max(entry.mood, 10)}%`;
          const moodInfo = getMoodLabel(entry.mood);
          return (
            <div
              key={entry.id}
              className={`flex-1 rounded-t transition-all ${moodInfo.color.replace('text-', 'bg-')}/60`}
              style={{ height }}
              title={`${moodInfo.label} (${entry.mood}%)`}
            />
          );
        })}
        {/* Fill empty slots */}
        {Array(7 - last7.length).fill(0).map((_, i) => (
          <div key={`empty-${i}`} className="flex-1 h-2 rounded-t bg-surface2/50" />
        ))}
      </div>
    </div>
  );
};

interface MoodTrackerProps {
  onComplete?: (mood: number, energy: number) => void;
  compact?: boolean;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onComplete, compact = false }) => {
  const [mood, setMood] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [note, setNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState<MoodEntry[]>([]);

  useEffect(() => {
    setHistory(getMoodEntries());
  }, []);

  const moodInfo = getMoodLabel(mood);
  const energyInfo = getEnergyLabel(energy);

  const handleSave = () => {
    const entry: MoodEntry = {
      id: `mood-${Date.now()}`,
      timestamp: new Date().toISOString(),
      mood,
      energy,
      note: note.trim() || undefined,
    };

    saveMoodEntry(entry);
    setHistory([entry, ...history].slice(0, 100));
    setIsSaved(true);
    setNote('');

    if (onComplete) {
      onComplete(mood, energy);
    }

    // Reset saved indicator after 2s
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (compact) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{moodInfo.emoji}</span>
          <div>
            <p className={`font-medium ${moodInfo.color}`}>{moodInfo.label}</p>
            <p className="text-xs text-text-muted">{energyInfo.emoji} {energyInfo.label}</p>
          </div>
        </div>
        <div className="space-y-3">
          <MoodSlider
            label="Настроение"
            value={mood}
            onChange={setMood}
            emoji={moodInfo.emoji}
            colorClass={moodInfo.color}
          />
          <MoodSlider
            label="Энергия"
            value={energy}
            onChange={setEnergy}
            emoji={energyInfo.emoji}
            colorClass="text-accent"
          />
        </div>
        <button
          onClick={handleSave}
          className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
            isSaved
              ? 'bg-success/20 text-success border border-success/30'
              : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
          }`}
        >
          {isSaved ? 'Сохранено!' : 'Записать'}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <SparkleIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-serif text-xl text-text">Чек-ин настроения</h3>
          <p className="text-xs text-text-muted">Как ты себя чувствуешь сейчас?</p>
        </div>
      </div>

      {/* Current Mood Display */}
      <div className="flex items-center justify-center gap-4 mb-6 p-4 rounded-xl bg-surface2/50 border border-white/5">
        <span className="text-5xl">{moodInfo.emoji}</span>
        <div>
          <p className={`text-2xl font-serif ${moodInfo.color}`}>{moodInfo.label}</p>
          <p className="text-sm text-text-muted flex items-center gap-1">
            {energyInfo.emoji} {energyInfo.label}
          </p>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4 mb-4">
        <MoodSlider
          label="Настроение"
          value={mood}
          onChange={setMood}
          emoji={moodInfo.emoji}
          colorClass={moodInfo.color}
        />
        <MoodSlider
          label="Энергия"
          value={energy}
          onChange={setEnergy}
          emoji={energyInfo.emoji}
          colorClass="text-accent"
        />
      </div>

      {/* Optional Note */}
      <div className="mb-4">
        <label className="text-xs text-text-muted block mb-1">Заметка (опционально)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Что происходит?"
          className="w-full bg-surface2 border border-white/10 rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted/50 focus:outline-none focus:border-primary/50"
          maxLength={100}
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          isSaved
            ? 'bg-success text-white'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {isSaved ? (
          <>Записано!</>
        ) : (
          <>
            Сохранить чек-ин
            <ChevronRightIcon className="w-4 h-4" />
          </>
        )}
      </button>

      {/* History */}
      <MoodHistory entries={history} />
    </div>
  );
};

export default MoodTracker;

// Export helpers for use in other components
export { getMoodEntries, getMoodLabel, getEnergyLabel };
export type { MoodEntry };
