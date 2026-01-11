/**
 * USER METRICS SERVICE — Расчёт пользовательских метрик дня
 *
 * Этот сервис вычисляет UserDailyMetrics (метрики ПОЛЬЗОВАТЕЛЯ),
 * которые формируют ∆-Ритм на главном экране.
 *
 * ВАЖНО: Это НЕ IskraMetrics (метрики AI-companion)!
 *
 * Источники данных:
 * - focus: Накопленное время фокус-сессий за день
 * - sleep: Ввод пользователя (TODO: HealthKit интеграция)
 * - energy: Последняя самооценка из журнала
 * - habits: Процент выполненных привычек за день
 *
 * @see types.ts - UserDailyMetrics
 * @see components/DayPulse.tsx - отображение ∆-Ритма
 */

import { UserDailyMetrics, Habit, JournalEntry } from '../types';
import { storageService } from './storageService';
import { safeStorage } from './storageCompat';

// Веса для расчёта ∆-Ритма (сумма = 1.0)
const DELTA_WEIGHTS = {
  focus: 0.25,   // Фокус важен, но не доминирует
  sleep: 0.30,   // Сон — основа всего
  energy: 0.20,  // Субъективная энергия
  habits: 0.25,  // Привычки формируют ритм
};

// localStorage ключи для хранения пользовательских метрик
const STORAGE_KEYS = {
  FOCUS_MINUTES_TODAY: 'iskra_focus_minutes_today',
  FOCUS_DATE: 'iskra_focus_date',
  SLEEP_SCORE: 'iskra_sleep_score',
  SLEEP_DATE: 'iskra_sleep_date',
  MOOD_ENTRIES: 'iskra-mood-entries', // Shared with MoodTracker component
};

// MoodEntry interface (matches MoodTracker component)
interface MoodEntry {
  id: string;
  timestamp: string;
  mood: number; // 0-100
  energy: number; // 0-100
  note?: string;
}

class UserMetricsService {
  /**
   * Получить все пользовательские метрики дня
   */
  getUserDailyMetrics(): UserDailyMetrics {
    const focus = this.getFocusScore();
    const sleep = this.getSleepScore();
    const energy = this.getEnergyScore();
    const habits = this.getHabitsScore();

    const deltaScore = this.calculateDeltaScore(focus, sleep, energy, habits);

    return {
      focus,
      sleep,
      energy,
      habits,
      deltaScore,
    };
  }

  /**
   * Расчёт ∆-Ритма из 4 компонентов
   */
  private calculateDeltaScore(
    focus: number,
    sleep: number,
    energy: number,
    habits: number
  ): number {
    const weighted =
      focus * DELTA_WEIGHTS.focus +
      sleep * DELTA_WEIGHTS.sleep +
      energy * DELTA_WEIGHTS.energy +
      habits * DELTA_WEIGHTS.habits;

    return Math.round(Math.min(100, Math.max(0, weighted)));
  }

  /**
   * Фокус: на основе накопленных минут фокус-сессий
   * Цель: 90 минут глубокого фокуса = 100%
   */
  getFocusScore(): number {
    const today = this.getTodayString();
    const storedDate = safeStorage.getItem(STORAGE_KEYS.FOCUS_DATE);

    // Если дата не сегодня, сбрасываем
    if (storedDate !== today) {
      safeStorage.setItem(STORAGE_KEYS.FOCUS_MINUTES_TODAY, '0');
      safeStorage.setItem(STORAGE_KEYS.FOCUS_DATE, today);
      return 0;
    }

    const minutes = parseInt(safeStorage.getItem(STORAGE_KEYS.FOCUS_MINUTES_TODAY) || '0', 10);
    // 90 минут = 100%
    const TARGET_FOCUS_MINUTES = 90;
    return Math.min(100, Math.round((minutes / TARGET_FOCUS_MINUTES) * 100));
  }

  /**
   * Добавить минуты фокуса (вызывается из FocusSession)
   */
  addFocusMinutes(minutes: number): void {
    const today = this.getTodayString();
    const storedDate = safeStorage.getItem(STORAGE_KEYS.FOCUS_DATE);

    if (storedDate !== today) {
      safeStorage.setItem(STORAGE_KEYS.FOCUS_MINUTES_TODAY, '0');
      safeStorage.setItem(STORAGE_KEYS.FOCUS_DATE, today);
    }

    const current = parseInt(safeStorage.getItem(STORAGE_KEYS.FOCUS_MINUTES_TODAY) || '0', 10);
    safeStorage.setItem(STORAGE_KEYS.FOCUS_MINUTES_TODAY, String(current + minutes));
  }

  /**
   * Сон: пользовательский ввод (0-100)
   * TODO: Интеграция с HealthKit/Health Connect
   */
  getSleepScore(): number {
    const today = this.getTodayString();
    const storedDate = safeStorage.getItem(STORAGE_KEYS.SLEEP_DATE);

    if (storedDate !== today) {
      // Если нет данных за сегодня, возвращаем нейтральное значение
      return 70; // Базовое значение "нормальный сон"
    }

    const score = parseInt(safeStorage.getItem(STORAGE_KEYS.SLEEP_SCORE) || '70', 10);
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Установить оценку сна (вызывается из UI)
   */
  setSleepScore(score: number): void {
    const today = this.getTodayString();
    safeStorage.setItem(STORAGE_KEYS.SLEEP_SCORE, String(Math.min(100, Math.max(0, score))));
    safeStorage.setItem(STORAGE_KEYS.SLEEP_DATE, today);
  }

  /**
   * Энергия: приоритет — MoodTracker, fallback — журнал
   *
   * Источники (в порядке приоритета):
   * 1. Последний mood check-in за сегодня (MoodTracker)
   * 2. Последняя запись в журнале за сегодня с userMetrics
   * 3. Нейтральное значение 60
   */
  getEnergyScore(): number {
    const today = this.getTodayString();

    // 1. Проверяем MoodTracker (приоритет)
    const moodData = this.getLatestMoodToday();
    if (moodData) {
      return moodData.energy;
    }

    // 2. Fallback: журнал
    try {
      const entries = storageService.getJournalEntries();

      // Находим последнюю запись за сегодня с userMetrics
      const todayEntries = entries
        .filter((e: JournalEntry) => e.timestamp.startsWith(today) && e.userMetrics?.energy !== undefined)
        .sort((a: JournalEntry, b: JournalEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (todayEntries.length > 0 && todayEntries[0].userMetrics) {
        return todayEntries[0].userMetrics.energy;
      }
    } catch (e) {
      console.warn('Failed to get energy from journal:', e);
    }

    return 60; // Нейтральное значение
  }

  /**
   * Получить последний mood check-in за сегодня
   */
  getLatestMoodToday(): MoodEntry | null {
    try {
      const raw = safeStorage.getItem(STORAGE_KEYS.MOOD_ENTRIES);
      if (!raw) return null;

      const entries: MoodEntry[] = JSON.parse(raw);
      const today = this.getTodayString();

      // Находим последнюю запись за сегодня
      const todayEntries = entries
        .filter((e) => e.timestamp.startsWith(today))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return todayEntries.length > 0 ? todayEntries[0] : null;
    } catch (e) {
      console.warn('Failed to get mood data:', e);
      return null;
    }
  }

  /**
   * Получить средний mood за сегодня (для анализа)
   */
  getAverageMoodToday(): { mood: number; energy: number; count: number } | null {
    try {
      const raw = safeStorage.getItem(STORAGE_KEYS.MOOD_ENTRIES);
      if (!raw) return null;

      const entries: MoodEntry[] = JSON.parse(raw);
      const today = this.getTodayString();

      const todayEntries = entries.filter((e) => e.timestamp.startsWith(today));

      if (todayEntries.length === 0) return null;

      const avgMood = Math.round(
        todayEntries.reduce((sum, e) => sum + e.mood, 0) / todayEntries.length
      );
      const avgEnergy = Math.round(
        todayEntries.reduce((sum, e) => sum + e.energy, 0) / todayEntries.length
      );

      return { mood: avgMood, energy: avgEnergy, count: todayEntries.length };
    } catch (e) {
      console.warn('Failed to calculate average mood:', e);
      return null;
    }
  }

  /**
   * Привычки: процент выполненных за сегодня
   */
  getHabitsScore(): number {
    try {
      const habits = storageService.getHabits();

      if (habits.length === 0) {
        return 75; // Нет привычек = нейтральное значение
      }

      const completed = habits.filter((h: Habit) => h.completedToday).length;
      return Math.round((completed / habits.length) * 100);
    } catch (e) {
      console.warn('Failed to get habits:', e);
      return 75;
    }
  }

  /**
   * Получить строку сегодняшней даты (YYYY-MM-DD)
   */
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }
}

export const userMetricsService = new UserMetricsService();
