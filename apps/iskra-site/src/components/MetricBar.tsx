import { motion } from 'framer-motion';

interface MetricBarProps {
  label: string;
  simpleLabel: string;
  value: number;
  color: string;
  description: string;
}

export function MetricBar({ label, simpleLabel, value, color, description }: MetricBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline text-sm">
        <div>
          <span className="text-iskra-text font-medium">{simpleLabel}</span>
          <span className="text-iskra-muted font-mono text-xs ml-2">{label}</span>
        </div>
        <span className="font-mono text-iskra-muted">{value}%</span>
      </div>
      <div className="h-1.5 bg-iskra-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-iskra-muted leading-relaxed">{description}</p>
    </div>
  );
}
