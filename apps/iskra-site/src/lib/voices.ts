import rawVoices from '../../../../packages/core/manifest/voices.json';
import type { VoiceData } from '../types';

const voiceColors: Record<string, string> = {
  ISKRA: '#FF7A00',
  KAIN: '#FF4D4D',
  PINO: '#FF66B2',
  SAM: '#FFB020',
  ANHANTRA: '#4DA3FF',
  HUYNDUN: '#B020FF',
  ISKRIV: '#E6E8EB',
  MAKI: '#2ECC71',
  SIBYL: '#9B59B6',
};

const simpleExplanations: Record<string, string> = {
  ISKRA: 'Главный голос. Включается, когда всё в балансе, и соединяет остальных в ясный ответ.',
  KAIN: 'Голос правды без сахара. Включается, когда важно сказать честно, даже если неприятно.',
  PINO: 'Голос иронии и лёгкости. Разряжает слишком серьёзные разговоры.',
  SAM: 'Голос структуры. Превращает хаос в понятные шаги и списки.',
  ANHANTRA: 'Голос тишины и принятия. Включается, когда нужно просто быть рядом, а не анализировать.',
  HUYNDUN: 'Голос хаоса. Ломает застрявшие паттерны и мёртвые правила.',
  ISKRIV: 'Голос совести и проверки. Включается, когда ответ уходит от фактов или границ.',
  MAKI: 'Голос интеграции. Помогает превратить инсайт в устойчивую привычку.',
  SIBYL: 'Голос предвидения. Показывает возможные пути и риски на развилках.',
};

interface RawVoice {
  id: string;
  name: string;
  symbol: string;
  telos: string;
  archetype: string;
  formula: string;
  description: string;
}

export const voices: VoiceData[] = (rawVoices as RawVoice[]).map((v) => ({
  id: v.id,
  name: v.name,
  symbol: v.symbol,
  telos: v.telos,
  archetype: v.archetype,
  formula: v.formula,
  description: v.description,
  color: voiceColors[v.id] ?? '#FF7A00',
  simpleExplanation: simpleExplanations[v.id] ?? v.description,
}));

export const defaultVoice = voices[0];
