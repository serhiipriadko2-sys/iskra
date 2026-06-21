import {
  heroContent,
  whatIsContent,
  telosContent,
  metricsContent,
  productContent,
  startContent,
} from '../lib/content';
import { architectureNodes, techStack } from '../lib/architecture';
import { voices } from '../lib/voices';
import type { TreeNodeData } from '../lib/treeData';
import { CognitiveCycleSimulator } from './CognitiveCycleSimulator';
import { EcosystemMap } from './EcosystemMap';

interface NodeContentProps {
  node: TreeNodeData;
}

function Card({ icon, title, text }: { icon?: string; title: string; text: string }) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-iskra-surface/40">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h4 className="font-serif text-lg text-iskra-text">{title}</h4>
      </div>
      <p className="text-sm text-iskra-muted leading-relaxed">{text}</p>
    </div>
  );
}

function WhatIsContent() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {whatIsContent.paragraphs.map((p, i) => (
          <p key={i} className="text-iskra-muted leading-relaxed">{p}</p>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {whatIsContent.cards.map((c) => (
          <Card key={c.title} icon={c.icon} title={c.title} text={c.text} />
        ))}
      </div>
    </div>
  );
}

function TelosContent() {
  return (
    <div className="space-y-6">
      <blockquote className="border-l-2 border-iskra-primary pl-4 italic text-iskra-text">
        {telosContent.mantra}
      </blockquote>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-iskra-accent mb-3">Пять векторов Телоса</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {telosContent.vectors.map((v) => (
            <div key={v.label} className="p-3 rounded-lg border border-white/10 bg-iskra-surface/40">
              <span className="text-iskra-primary font-medium">{v.label}</span>
              <span className="text-iskra-muted text-sm ml-2">{v.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-iskra-accent mb-3">{telosContent.delta.title}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {telosContent.delta.items.map((item) => (
            <Card key={item.label} icon={item.sigil} title={item.label} text={item.text} />
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-iskra-accent mb-3">{telosContent.responseFormat.title}</h4>
        <ol className="space-y-2">
          {telosContent.responseFormat.steps.map((s) => (
            <li key={s.label} className="flex gap-3 text-sm">
              <span className="text-iskra-primary font-mono shrink-0">{s.label}</span>
              <span className="text-iskra-muted">{s.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function PrinciplesContent() {
  return (
    <div className="space-y-6">
      <p className="text-iskra-muted leading-relaxed">{heroContent.description}</p>
      <div className="grid grid-cols-1 gap-3">
        {whatIsContent.cards.map((c) => (
          <Card key={c.title} icon={c.icon} title={c.title} text={c.text} />
        ))}
      </div>
    </div>
  );
}

function ArchitectureContent() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-iskra-muted leading-relaxed mb-6">
          Искра управляется иерархическим когнитивным рантаймом. Любой запрос проходит строго последовательную цепочку проверок и трансформаций, прежде чем превратиться в финальный ответ. Ниже представлена схема этой цепочки и её интерактивный симулятор.
        </p>
      </div>

      <div className="border-t border-white/5 pt-6">
        <h4 className="font-mono text-xs uppercase tracking-wider text-iskra-accent mb-4">Уровни когнитивного контроля</h4>
        <ol className="relative border-l border-white/10 ml-2 space-y-4">
          {architectureNodes.map((n) => (
            <li key={n.id} className="ml-5">
              <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full" style={{ background: n.color }} />
              <h4 className="font-mono text-sm text-iskra-text">{n.label} <span className="text-xs text-iskra-muted">— {n.simpleLabel}</span></h4>
              <p className="text-xs text-iskra-muted mt-1">{n.description}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-white/5 pt-6">
        <h4 className="font-mono text-xs uppercase tracking-wider text-iskra-accent mb-4">Интерактивный симулятор цикла обработки</h4>
        <CognitiveCycleSimulator />
      </div>

      <div className="border-t border-white/5 pt-6">
        <h4 className="font-mono text-xs uppercase tracking-wider text-iskra-accent mb-3">Технологический стек</h4>
        <div className="flex flex-wrap gap-2">
          {techStack.map((t) => (
            <span key={t.name} className="px-3 py-1 rounded-full text-xs border border-white/10 bg-iskra-surface/40 text-iskra-text">
              {t.name} <span className="text-iskra-muted">— {t.role}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricsContent() {
  return (
    <div className="space-y-6">
      <p className="text-iskra-muted leading-relaxed">{metricsContent.description}</p>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-iskra-accent mb-3">IskraMetrics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {metricsContent.iskraMetrics.map((m) => (
            <div key={m.key} className="p-3 rounded-lg border border-white/10 bg-iskra-surface/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-iskra-text">{m.simpleLabel}</span>
                <span className="text-xs font-mono" style={{ color: m.color }}>{m.value}</span>
              </div>
              <p className="text-xs text-iskra-muted">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-iskra-accent mb-3">EvalMetrics</h4>
        <div className="flex flex-wrap gap-2">
          {metricsContent.evalMetrics.map((m) => (
            <span key={m.key} className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-iskra-surface/40 text-iskra-text">
              {m.label}: <span className="text-iskra-muted">{m.text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductContent() {
  return (
    <div className="space-y-6">
      <p className="text-iskra-muted leading-relaxed">{productContent.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {productContent.features.map((f) => (
          <Card key={f.title} title={f.title} text={f.text} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {productContent.stats.map((s) => (
          <div key={s.label} className="p-3 rounded-lg border border-white/10 bg-iskra-surface/40 text-center">
            <div className="text-xl font-serif text-iskra-primary">{s.value}</div>
            <div className="text-xs text-iskra-muted uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StartContent() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-iskra-muted leading-relaxed mb-6">
          Искра — открытый проект. Ниже описаны четыре шага, чтобы склонировать и запустить систему на вашем компьютере, а также представлена интерактивная карта папок и файлов репозитория, раскрывающая внутреннее устройство проекта.
        </p>
        <ol className="space-y-4">
          {startContent.steps.map((s) => (
            <li key={s.label} className="p-4 rounded-xl border border-white/10 bg-iskra-surface/40">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs text-iskra-primary">{s.label}</span>
                <h4 className="font-serif text-iskra-text">{s.title}</h4>
              </div>
              <code className="block text-xs font-mono text-iskra-muted bg-black/30 p-2 rounded break-all">{s.code}</code>
            </li>
          ))}
        </ol>
        <p className="text-xs text-iskra-muted mt-3">{startContent.note}</p>
        <div className="flex flex-wrap gap-3 mt-4">
          {startContent.links.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full text-xs border border-white/10 bg-iskra-surface/40 hover:border-iskra-primary/50 text-iskra-text transition-colors"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 pt-6">
        <h4 className="font-mono text-xs uppercase tracking-wider text-iskra-accent mb-4">Интерактивный обозреватель репозитория</h4>
        <EcosystemMap />
      </div>
    </div>
  );
}

function VoiceDetail({ id }: { id: string }) {
  const voice = voices.find((v) => v.id === id);
  if (!voice) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-4xl">{voice.symbol}</span>
        <div>
          <h3 className="font-serif text-2xl text-iskra-text">{voice.name}</h3>
          <p className="text-sm text-iskra-muted">{voice.archetype}</p>
        </div>
      </div>
      <p className="text-iskra-muted leading-relaxed">{voice.description}</p>
      <Card title="Формула" text={voice.formula} />
      <Card title="Телос" text={voice.telos} />
      <div className="p-4 rounded-xl border border-iskra-primary/30 bg-iskra-primary/10">
        <p className="text-sm text-iskra-text">{voice.simpleExplanation}</p>
      </div>
    </div>
  );
}

export function NodeContent({ node }: NodeContentProps) {
  if (node.group === 'leaves') {
    return <VoiceDetail id={node.id} />;
  }

  switch (node.id) {
    case 'what-is':
      return <WhatIsContent />;
    case 'telos':
      return <TelosContent />;
    case 'principles':
      return <PrinciplesContent />;
    case 'architecture':
      return <ArchitectureContent />;
    case 'metrics':
      return <MetricsContent />;
    case 'product':
    case 'iskra-space':
      return <ProductContent />;
    case 'start':
    case 'soil':
      return <StartContent />;
    case 'voices':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {voices.map((v) => (
            <Card key={v.id} icon={v.symbol} title={v.name} text={v.simpleExplanation} />
          ))}
        </div>
      );
    default:
      return <p className="text-iskra-muted leading-relaxed">{node.description}</p>;
  }
}
