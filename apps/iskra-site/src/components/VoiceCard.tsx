import { GlassCard } from './GlassCard';
import type { VoiceData } from '../types';

interface VoiceCardProps {
  voice: VoiceData;
  onClick?: () => void;
  isActive?: boolean;
}

export function VoiceCard({ voice, onClick, isActive }: VoiceCardProps) {
  return (
    <GlassCard
      className={`cursor-pointer transition-all duration-300 ${
        isActive ? 'ring-1 ring-white/20 scale-[1.02]' : ''
      }`}
      borderColor={voice.color}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-medium" style={{ color: voice.color }}>
          {voice.name} <span className="ml-1">{voice.symbol}</span>
        </h3>
        <span className="text-xs font-mono text-iskra-muted uppercase">{voice.archetype}</span>
      </div>
      <p className="text-sm text-iskra-text mb-3 leading-relaxed">{voice.simpleExplanation}</p>
      <p className="text-xs text-iskra-muted italic">{voice.telos}</p>
    </GlassCard>
  );
}
