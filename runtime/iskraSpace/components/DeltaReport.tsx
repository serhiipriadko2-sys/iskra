
import React from 'react';
import { DeltaReportData } from '../types';
import { DeltaTooltip, DepthTooltip, OmegaTooltip, LambdaTooltip } from './Tooltip';

interface DeltaReportProps {
  data: DeltaReportData;
}

type TooltipComponent = React.FC<{ children: React.ReactNode }>;

const SYMBOL_TOOLTIPS: Record<string, TooltipComponent> = {
  '∆': DeltaTooltip,
  'D': DepthTooltip,
  'Ω': OmegaTooltip,
  'Λ': LambdaTooltip,
};

const Section: React.FC<{ symbol: string; title: string; children: React.ReactNode }> = ({ symbol, title, children }) => {
    const TooltipWrapper = SYMBOL_TOOLTIPS[symbol] || (({ children }: { children: React.ReactNode }) => <>{children}</>);

    return (
        <div>
            <h4 className="flex items-center font-serif text-xl text-accent mb-2">
                <TooltipWrapper>
                    <span className="text-2xl mr-3 cursor-help">{symbol}</span>
                </TooltipWrapper>
                {title}
            </h4>
            <p className="text-text-muted text-base ml-9">{children}</p>
        </div>
    );
};

const DeltaReport: React.FC<DeltaReportProps> = ({ data }) => {
  return (
    <div className="mt-8 pt-6 border-t border-border space-y-6">
        <h3 className="font-serif text-2xl text-text text-center">Протокол ∆DΩΛ</h3>
        <div className="space-y-4 p-4 bg-surface rounded-lg">
            <Section symbol="∆" title="Что изменилось (Дельта)">
                {data.delta}
            </Section>
            <Section symbol="D" title="Глубина опоры (Depth)">
                {data.depth}
            </Section>
            <Section symbol="Ω" title="Уверенность (Омега)">
                {data.omega}
            </Section>
            <Section symbol="Λ" title="Следующий шаг (Лямбда)">
                {data.lambda}
            </Section>
        </div>
    </div>
  );
};

export default DeltaReport;
