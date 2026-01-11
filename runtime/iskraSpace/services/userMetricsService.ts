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
 * - sleep: Ввод пользователя или HealthKit (реализовано через провайдер)
 * - energy: Последняя самооценка из журнала
 * - habits: Процент выполненных привычек за день
 *
 * @see types.ts - UserDailyMetrics
 * @see components/DayPulse.tsx - отображение ∆-Ритма
 */

import { UserDailyMetrics, Habit, JournalEntry } from '../types';
import { storageService } from './storageService';
import { safeStorage } from './storageCompat';

// --- HEALTH PROVIDER INTERFACES ---

export interface HealthData {
  sleepMinutes: number;
  steps?: number;
  updatedAt: string;
}

export interface HealthProvider {
  isAvailable(): boolean;
  requestPermissions(): Promise<boolean>;
  getDailyData(): Promise<HealthData | null>;
}

/**
 * Stub implementation for HealthKit/Health Connect.
 * Will be replaced by real bridge in Phase 3.
 */
class HealthKitStub implements HealthProvider {
  isAvailable(): boolean {
    // In future: check window.HealthKit or Capacitor plugin
    return false;
  }

  async requestPermissions(): Promise<boolean> {
    console.log('HealthKitStub: Permissions requested');
    return true;
  }

  async getDailyData(): Promise<HealthData | null> {
    console.log('HealthKitStub: Fetching data (mock)');
    return null;
  }
}

// --- SERVICE ---

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
};

class UserMetricsService {
  private healthProvider: HealthProvider;

  constructor(healthProvider?: HealthProvider) {
    this.healthProvider = healthProvider || new HealthKitStub();
  }

  /**
   * Получить все пользовательские метрики дня
   */
  async getUserDailyMetrics(): Promise<UserDailyMetrics> {
    // Try to sync with HealthKit if available
    await this.syncWithHealthKit();

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
   * Sync data from external health provider
   */
  private async syncWithHealthKit(): Promise<void> {
    if (!this.healthProvider.isAvailable()) return;

    try {
      const data = await this.healthProvider.getDailyData();
      if (data && data.sleepMinutes > 0) {
        // Convert minutes to score (e.g. 7-9 hours = 100)
        // Simple logic: 420-540 min = 100, linear drop otherwise
        let score = 0;
        if (data.sleepMinutes >= 420 && data.sleepMinutes <= 540) score = 100;
        else if (data.sleepMinutes < 420) score = Math.round((data.sleepMinutes / 420) * 100);
        else score = Math.max(0, 100 - Math.round(((data.sleepMinutes - 540) / 120) * 50));

        this.setSleepScore(score);
      }
    } catch (e) {
      console.warn('HealthKit sync failed:', e);
    }
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
   * Сон: пользовательский ввод (0-100) или данные HealthKit
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
   * Установить оценку сна (вызывается из UI или HealthKit)
   */
  setSleepScore(score: number): void {
    const today = this.getTodayString();
    safeStorage.setItem(STORAGE_KEYS.SLEEP_SCORE, String(Math.min(100, Math.max(0, score))));
    safeStorage.setItem(STORAGE_KEYS.SLEEP_DATE, today);
  }

  /**
   * Энергия: из последней записи в журнале за сегодня
   * Fallback: нейтральное значение 60
   */
  getEnergyScore(): number {
    try {
      const entries = storageService.getJournalEntries();
      const today = this.getTodayString();

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
