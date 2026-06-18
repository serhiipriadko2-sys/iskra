interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  borderColor?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = true, borderColor, onClick }: GlassCardProps) {
  return (
    <div
      className={`glass-card p-6 md:p-8 ${hover ? '' : 'hover:transform-none'} ${className}`}
      style={borderColor ? { borderLeftWidth: '3px', borderLeftColor: borderColor } : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
