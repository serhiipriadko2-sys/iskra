/**
 * TOOLTIP COMPONENT
 *
 * Reusable tooltip for explaining ISKRA-specific symbols and concepts.
 * Supports hover and touch interactions.
 */

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleTouch = () => {
    setIsTouched(!isTouched);
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-surface2 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-surface2 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-surface2 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-surface2 border-y-transparent border-l-transparent',
  };

  return (
    <span
      className="relative inline-flex cursor-help"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onTouchStart={handleTouch}
    >
      {children}
      {isVisible && (
        <span
          className={`absolute z-50 px-3 py-2 text-xs text-text bg-surface2 border border-white/10 rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]} animate-fade-in`}
          style={{ animationDuration: '150ms' }}
        >
          {content}
          <span
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </span>
      )}
    </span>
  );
};

export default Tooltip;

/**
 * Pre-configured tooltips for ISKRA protocol symbols
 */
export const DeltaTooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Tooltip content="∆ (Delta): Что изменилось / ключевой инсайт" position="top">
    {children}
  </Tooltip>
);

export const OmegaTooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Tooltip content="Ω (Omega): Уверенность ответа (0-95%)" position="top">
    {children}
  </Tooltip>
);

export const LambdaTooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Tooltip content="Λ (Lambda): Условие пересмотра / следующий шаг" position="top">
    {children}
  </Tooltip>
);

export const DepthTooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Tooltip content="D (Depth): Источник → Вывод → Факт (SIFT trace)" position="top">
    {children}
  </Tooltip>
);

/**
 * Protocol block with all tooltips applied
 */
export interface ProtocolBlockProps {
  delta?: string;
  depth?: string;
  omega?: string | number;
  lambda?: string;
  className?: string;
}

export const ProtocolBlock: React.FC<ProtocolBlockProps> = ({
  delta,
  depth,
  omega,
  lambda,
  className = '',
}) => {
  if (!delta && !omega && !lambda) return null;

  const omegaValue = typeof omega === 'number' ? `${(omega * 100).toFixed(0)}%` : omega;

  return (
    <div className={`mt-4 p-3 rounded-lg bg-surface2/50 border border-white/5 text-sm ${className}`}>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-text-muted">
        {delta && (
          <span className="flex items-center gap-1">
            <DeltaTooltip>
              <span className="text-primary font-bold">∆</span>
            </DeltaTooltip>
            <span className="text-text/80">{delta}</span>
          </span>
        )}
        {depth && (
          <span className="flex items-center gap-1">
            <DepthTooltip>
              <span className="text-accent font-bold">D</span>
            </DepthTooltip>
            <span className="text-text/80">{depth}</span>
          </span>
        )}
        {omega && (
          <span className="flex items-center gap-1">
            <OmegaTooltip>
              <span className="text-warning font-bold">Ω</span>
            </OmegaTooltip>
            <span className="text-text/80">{omegaValue}</span>
          </span>
        )}
        {lambda && (
          <span className="flex items-center gap-1">
            <LambdaTooltip>
              <span className="text-success font-bold">Λ</span>
            </LambdaTooltip>
            <span className="text-text/80">{lambda}</span>
          </span>
        )}
      </div>
    </div>
  );
};
