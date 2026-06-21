import { useEffect, useMemo, useRef, useState } from 'react';
import { allTreeNodes, findNodeById } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';
import { ChevronDown, ChevronUp } from './icons';
import { useMediaQuery } from '../hooks/useMediaQuery';

type SiftStage = 'claim' | 'stop' | 'investigate' | 'find' | 'trace' | 'delta';
type ClaimLabel = 'FACT' | 'INTERP' | 'HYP';
type Lane = 'support' | 'contra' | 'context';
type SourceType = 'unknown' | 'primary' | 'secondary' | 'tertiary' | 'anecdotal';
type ReceiptVerdict = 'BLOCKER' | 'CAUTION' | 'REVIEW' | 'LOW_DRIFT';

interface ClaimSegment {
  text: string;
  label: ClaimLabel;
  reason: string;
}

interface SourceCard {
  title: string;
  type: SourceType;
  date: string;
  reliability: number;
  note: string;
}

interface Distortion {
  type: 'context_loss' | 'amplification' | 'misattribution' | 'temporal_drift' | 'low_drift';
  severity: number;
  description: string;
}

interface SiftReceipt {
  run_id: string;
  created_at: string;
  active_node_id: string | null;
  active_node_label: string;
  active_group: TreeNodeData['group'] | 'tree';
  stage: SiftStage;
  verdict: ReceiptVerdict;
  claim: string;
  claim_type: string;
  segments: ClaimSegment[];
  evidence_quality: number;
  omega: number;
  sources: Record<Lane, SourceCard & { quality: number }>;
  trace: Array<{
    lane: Lane;
    source: string;
    transformation: string;
    claim_segment: ClaimSegment;
    quality: number;
  }>;
  distortions: Distortion[];
  delta: {
    delta: string;
    depth: string;
    omega: string;
    lambda: string;
  };
}

interface SiftLabProps {
  activeNodeId: string | null;
  onReplayNodeSelect: (nodeId: string | null) => void;
}

const stageLabels: Record<SiftStage, string> = {
  claim: 'Claim',
  stop: 'Stop',
  investigate: 'Investigate',
  find: 'Find',
  trace: 'Trace',
  delta: '∆DΩΛ',
};

const tagColors: Record<ClaimLabel, string> = {
  FACT: '#4DA3FF',
  INTERP: '#FF7A00',
  HYP: '#9B59B6',
};

const sourceWeights: Record<SourceType, number> = {
  primary: 1,
  secondary: 0.74,
  tertiary: 0.48,
  anecdotal: 0.22,
  unknown: 0.3,
};

const laneLabels: Record<Lane, string> = {
  support: 'Поддерживает',
  contra: 'Противоречит',
  context: 'Контекст',
};

const laneTransform: Record<Lane, string> = {
  support: 'supports / narrows',
  contra: 'challenges / falsifies',
  context: 'bounds context',
};

const focusTags: Record<SiftStage, ClaimLabel[]> = {
  claim: ['FACT', 'INTERP', 'HYP'],
  stop: ['HYP'],
  investigate: ['FACT', 'HYP'],
  find: ['FACT'],
  trace: ['INTERP'],
  delta: ['FACT', 'INTERP', 'HYP'],
};

const focusLanes: Record<SiftStage, Lane[]> = {
  claim: ['support', 'contra', 'context'],
  stop: ['contra'],
  investigate: ['support', 'context'],
  find: ['support', 'contra'],
  trace: ['support', 'contra', 'context'],
  delta: ['support', 'contra', 'context'],
};

const initialSources: Record<Lane, SourceCard> = {
  support: { title: '', type: 'unknown', date: '', reliability: 55, note: '' },
  contra: { title: '', type: 'unknown', date: '', reliability: 55, note: '' },
  context: { title: '', type: 'unknown', date: '', reliability: 55, note: '' },
};

const sourceTypes: SourceType[] = ['unknown', 'primary', 'secondary', 'tertiary', 'anecdotal'];
const siftStages: SiftStage[] = ['claim', 'stop', 'investigate', 'find', 'trace', 'delta'];

function stageForNode(node: TreeNodeData | null): SiftStage {
  if (!node) return 'claim';
  if (node.group === 'soil') return 'delta';
  if (node.group === 'roots') return 'investigate';
  if (node.group === 'trunk') return 'claim';
  if (node.group === 'branches') return 'find';
  return 'trace';
}

function splitClaim(claim: string): string[] {
  const normalized = claim.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  return normalized
    .split(/(?<=[.!?;])\s+|,\s+|\s+(?=(?:но|однако|если|потому что|поэтому|следовательно|значит|while|because|therefore|if)\b)/iu)
    .map((part) => part.trim())
    .filter(Boolean);
}

function classifySegment(segment: string, fullClaim: string): ClaimSegment {
  const text = segment.toLowerCase();
  const full = fullClaim.toLowerCase();
  if (/\[FACT\]/i.test(segment)) return { text: segment, label: 'FACT', reason: 'ручная метка' };
  if (/\[INTERP\]/i.test(segment)) return { text: segment, label: 'INTERP', reason: 'ручная метка' };
  if (/\[HYP\]/i.test(segment)) return { text: segment, label: 'HYP', reason: 'ручная метка' };

  const fact = /(\d{4}|\d+[,.]?\d*\s?%|согласно|по данным|отчет|исследован|публикац|статистик|url|https?:\/\/|github|supabase|source|evidence|данные|лог|скрин|файл)/iu;
  const interp = /(значит|поэтому|следовательно|вывод|подтвержд|доказыва|показыва|свидетельству|лучше|хуже|эффективн|причин|из-за|влияет|confirmed|proves|means)/iu;
  const hyp = /(правда ли|возможно|вероятно|может|кажется|предполож|если|будет|станет|можно ли|должен|might|may|could|probably|seems|assume|hypothesis)/iu;

  if (hyp.test(text) || /^(правда ли|можно ли|is it true|does |do |can )/iu.test(text)) {
    return { text: segment, label: 'HYP', reason: 'вопрос, прогноз или недоказанное предположение' };
  }
  if (interp.test(text)) return { text: segment, label: 'INTERP', reason: 'вывод, причинность или оценка' };
  if (fact.test(text)) return { text: segment, label: 'FACT', reason: 'проверяемое наблюдение или источник' };
  if (full.includes('?') || hyp.test(full)) return { text: segment, label: 'INTERP', reason: 'часть вопроса требует проверки' };
  return { text: segment, label: 'HYP', reason: 'нет явной источниковой опоры' };
}

function recencyScore(dateValue: string): number {
  if (!dateValue) return 0.35;
  const sourceDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(sourceDate.getTime())) return 0.25;
  const ageDays = (Date.now() - sourceDate.getTime()) / 86400000;
  if (ageDays < -1) return 0.2;
  if (ageDays <= 30) return 1;
  if (ageDays <= 180) return 0.85;
  if (ageDays <= 365) return 0.7;
  if (ageDays <= 1095) return 0.5;
  return 0.32;
}

function sourceQuality(source: SourceCard): number {
  if (!source.title.trim() && !source.note.trim()) return 0;
  const title = source.title.trim() ? 1 : 0.52;
  const type = sourceWeights[source.type];
  const date = recencyScore(source.date);
  const reliability = Math.max(0, Math.min(source.reliability, 100)) / 100;
  return Math.round(title * 100 * (type * 0.42 + date * 0.23 + reliability * 0.35));
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function bestClaimSegment(segments: ClaimSegment[], lane: Lane): ClaimSegment {
  const preferred: Record<Lane, ClaimLabel> = {
    support: 'FACT',
    contra: 'HYP',
    context: 'INTERP',
  };
  return segments.find((segment) => segment.label === preferred[lane])
    ?? segments[0]
    ?? { text: 'claim не разобран', label: 'HYP', reason: 'empty claim' };
}

function detectDistortions(claim: string, claimType: string, segments: ClaimSegment[], sources: Record<Lane, SourceCard>): Distortion[] {
  const distortions: Distortion[] = [];
  const add = (type: Distortion['type'], severity: number, description: string) => {
    distortions.push({ type, severity, description });
  };

  const contextQuality = sourceQuality(sources.context);
  const unknownSource = (Object.keys(sources) as Lane[]).some((lane) => {
    const source = sources[lane];
    return Boolean(source.title.trim() || source.note.trim()) && source.type === 'unknown';
  });
  const missingTitle = (Object.keys(sources) as Lane[]).some((lane) => {
    const source = sources[lane];
    return Boolean(source.note.trim()) && !source.title.trim();
  });
  const staleCurrent = claimType === 'current_event' && (Object.keys(sources) as Lane[]).some((lane) => {
    const source = sources[lane];
    return !source.date || recencyScore(source.date) < 0.7;
  });
  const amplification = segments.filter((segment) => segment.label !== 'FACT').length > segments.filter((segment) => segment.label === 'FACT').length;
  const strongWords = /(доказал|доказано|гарантир|всегда|никогда|точно|confirmed|proves|guarantees|always|never)/iu.test(claim);

  if (contextQuality < 50) add('context_loss', 0.72, 'контекст слабый или отсутствует');
  if (amplification || strongWords) add('amplification', strongWords ? 0.82 : 0.58, 'claim может звучать сильнее evidence');
  if (unknownSource || missingTitle) add('misattribution', 0.64, 'источник не назван или имеет unknown type');
  if (staleCurrent) add('temporal_drift', 0.68, 'current_event требует свежей даты источника');
  if (!distortions.length) add('low_drift', 0.18, 'явных distortion-флагов не найдено');
  return distortions;
}

function receiptVerdict(evidenceQuality: number, distortions: Distortion[]): ReceiptVerdict {
  const actionable = distortions.filter((distortion) => distortion.type !== 'low_drift');
  const maxSeverity = actionable.reduce((max, distortion) => Math.max(max, distortion.severity), 0);
  const attributionRisk = actionable.some((distortion) => distortion.type === 'temporal_drift' || distortion.type === 'misattribution');
  if (evidenceQuality < 35 || maxSeverity >= 0.8) return 'BLOCKER';
  if (attributionRisk || evidenceQuality < 60 || maxSeverity >= 0.62) return 'CAUTION';
  if (evidenceQuality < 75 || actionable.length) return 'REVIEW';
  return 'LOW_DRIFT';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSiftStage(value: unknown): value is SiftStage {
  return typeof value === 'string' && siftStages.includes(value as SiftStage);
}

function isSourceType(value: unknown): value is SourceType {
  return typeof value === 'string' && sourceTypes.includes(value as SourceType);
}

function coerceReplaySource(value: unknown): SourceCard {
  const source = isRecord(value) ? value : {};
  const reliability = typeof source.reliability === 'number'
    ? Math.max(0, Math.min(source.reliability, 100))
    : 55;

  return {
    title: typeof source.title === 'string' ? source.title : '',
    type: isSourceType(source.type) ? source.type : 'unknown',
    date: typeof source.date === 'string' ? source.date : '',
    reliability,
    note: typeof source.note === 'string' ? source.note : '',
  };
}

function readReceiptNodeId(value: Record<string, unknown>): string | null {
  const candidate = value.active_node_id ?? value.active_node;
  if (candidate === null) return null;
  if (typeof candidate !== 'string') return null;
  return allTreeNodes.some((node) => node.id === candidate) ? candidate : null;
}

export function SiftLab({ activeNodeId, onReplayNodeSelect }: SiftLabProps) {
  const replayStageRef = useRef<SiftStage | null>(null);
  const activeNode = activeNodeId ? findNodeById(activeNodeId) : null;
  const nodeColor = activeNode?.color ?? '#FF7A00';
  const nodeStage = stageForNode(activeNode);
  const [stage, setStage] = useState<SiftStage>(nodeStage);
  const [claim, setClaim] = useState('Правда ли, что этот вывод подтвержден свежими источниками?');
  const [claimType, setClaimType] = useState('current_event');
  const [sources, setSources] = useState<Record<Lane, SourceCard>>(initialSources);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [replayInput, setReplayInput] = useState('');
  const [replayStatus, setReplayStatus] = useState<'idle' | 'loaded' | 'invalid'>('idle');
  const [replayedReceiptId, setReplayedReceiptId] = useState('');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [collapsed, setCollapsed] = useState(isMobile);

  useEffect(() => {
    if (replayStageRef.current) {
      setStage(replayStageRef.current);
      replayStageRef.current = null;
      return;
    }
    setStage(nodeStage);
  }, [activeNodeId, nodeStage]);

  const segments = useMemo(() => splitClaim(claim).map((segment) => classifySegment(segment, claim)), [claim]);
  const distortions = useMemo(() => detectDistortions(claim, claimType, segments, sources), [claim, claimType, segments, sources]);
  const evidenceQuality = useMemo(() => Math.round((
    sourceQuality(sources.support)
    + sourceQuality(sources.contra)
    + sourceQuality(sources.context)
  ) / 3), [sources]);
  const omega = Math.min(95, Math.round(evidenceQuality * 0.62 + (segments.length ? 22 : 0)));
  const focusedTags = focusTags[stage];
  const focusedLanes = focusLanes[stage];
  const verdict = useMemo(() => receiptVerdict(evidenceQuality, distortions), [evidenceQuality, distortions]);

  const traceLinks = useMemo(() => (Object.keys(sources) as Lane[])
    .filter((lane) => sources[lane].title.trim() || sources[lane].note.trim())
    .map((lane) => ({
      lane,
      source: sources[lane].title.trim() || `${laneLabels[lane]} source`,
      transform: laneTransform[lane],
      claim: bestClaimSegment(segments, lane),
      quality: sourceQuality(sources[lane]),
    })), [sources, segments]);

  const traceLinksForDisplay = useMemo(() => (traceLinks.length
    ? traceLinks
    : (Object.keys(sources) as Lane[]).map((lane) => ({
      lane,
      source: `${laneLabels[lane]} source`,
      transform: laneTransform[lane],
      claim: bestClaimSegment(segments, lane),
      quality: 0,
    }))), [sources, segments, traceLinks]);

  const receipt = useMemo<SiftReceipt>(() => {
    const sourceEntries: SiftReceipt['sources'] = {
      support: { ...sources.support, quality: sourceQuality(sources.support) },
      contra: { ...sources.contra, quality: sourceQuality(sources.contra) },
      context: { ...sources.context, quality: sourceQuality(sources.context) },
    };
    const trace = traceLinksForDisplay.map((link) => ({
      lane: link.lane,
      source: link.source,
      transformation: link.transform,
      claim_segment: link.claim,
      quality: link.quality,
    }));
    const signatureBase = JSON.stringify({
      activeNodeId,
      stage,
      claim,
      claimType,
      segments,
      sourceEntries,
      trace,
      distortions,
      evidenceQuality,
      omega,
      verdict,
    });

    return {
      run_id: `sift-${stableHash(signatureBase)}`,
      created_at: new Date().toISOString(),
      active_node_id: activeNode?.id ?? null,
      active_node_label: activeNode?.label ?? 'Древо Искры',
      active_group: activeNode?.group ?? 'tree',
      stage,
      verdict,
      claim,
      claim_type: claimType,
      segments,
      evidence_quality: evidenceQuality,
      omega,
      sources: sourceEntries,
      trace,
      distortions,
      delta: {
        delta: 'Claim размечен и связан с активным узлом дерева.',
        depth: `Trace graph: ${trace.length} lane(s); distortions: ${distortions.map((item) => item.type).join(', ')}.`,
        omega: `${omega}% по source quality; live-source confidence не заявлен.`,
        lambda: 'Добавить primary/context source или пересмотреть verdict.',
      },
    };
  }, [activeNode, activeNodeId, stage, claim, claimType, segments, sources, traceLinksForDisplay, distortions, evidenceQuality, omega, verdict]);
  const receiptJson = useMemo(() => JSON.stringify(receipt, null, 2), [receipt]);

  const updateSource = (lane: Lane, patch: Partial<SourceCard>) => {
    setSources((current) => ({
      ...current,
      [lane]: { ...current[lane], ...patch },
    }));
  };

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receiptJson);
      setCopiedReceipt(true);
      window.setTimeout(() => setCopiedReceipt(false), 1500);
    } catch {
      setCopiedReceipt(false);
    }
  };

  const replayReceipt = () => {
    try {
      const parsed: unknown = JSON.parse(replayInput);
      if (!isRecord(parsed) || typeof parsed.claim !== 'string') {
        throw new Error('Invalid SIFT receipt');
      }

      const nextNodeId = readReceiptNodeId(parsed);
      const nextNode = nextNodeId ? findNodeById(nextNodeId) : null;
      const nextStage = isSiftStage(parsed.stage) ? parsed.stage : stageForNode(nextNode);
      const parsedSources = isRecord(parsed.sources) ? parsed.sources : {};
      replayStageRef.current = nextStage;

      setClaim(parsed.claim);
      setClaimType(typeof parsed.claim_type === 'string' ? parsed.claim_type : 'general');
      setSources({
        support: coerceReplaySource(parsedSources.support),
        contra: coerceReplaySource(parsedSources.contra),
        context: coerceReplaySource(parsedSources.context),
      });
      setStage(nextStage);
      setReplayedReceiptId(typeof parsed.run_id === 'string' ? parsed.run_id : `sift-${stableHash(replayInput)}`);
      setReplayStatus('loaded');
      onReplayNodeSelect(nextNodeId);
    } catch {
      setReplayStatus('invalid');
      setReplayedReceiptId('');
    }
  };

  const clearReplay = () => {
    setReplayInput('');
    setReplayStatus('idle');
    setReplayedReceiptId('');
  };

  return (
    <aside className="fixed left-4 bottom-16 z-30 w-[calc(100vw-2rem)] max-w-[460px] md:bottom-4 lg:left-48">
      {collapsed ? (
        <div className="glass-panel rounded-2xl shadow-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: nodeColor }}>
                SIFT live lab
              </p>
              <p className="text-xs text-iskra-muted truncate">
                {activeNode ? `${activeNode.label} · ${activeNode.group}` : 'Древо Искры · no node'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex gap-2 font-mono text-[10px] text-iskra-muted">
                <span>Q {evidenceQuality}%</span>
                <span>Ω {omega}%</span>
              </div>
              <button
                onClick={() => setCollapsed(false)}
                className="p-1.5 rounded-full border border-white/10 text-iskra-muted hover:border-iskra-primary/50 hover:text-iskra-text transition"
                aria-label="Развернуть SIFT"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel max-h-[45vh] md:max-h-[62vh] overflow-hidden rounded-2xl shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: nodeColor }}>
                SIFT live lab
              </p>
              <p className="text-xs text-iskra-muted">
                {activeNode ? `${activeNode.label} · ${activeNode.group}` : 'Древо Искры · no node'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 font-mono text-[10px] text-iskra-muted">
                <span>Q {evidenceQuality}%</span>
                <span>Ω {omega}%</span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-full border border-white/10 text-iskra-muted hover:border-iskra-primary/50 hover:text-iskra-text transition"
                aria-label="Свернуть SIFT"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

        <div className="max-h-[calc(45vh-54px)] md:max-h-[calc(62vh-54px)] space-y-3 overflow-y-auto p-3 md:p-4">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(stageLabels) as SiftStage[]).map((item) => (
              <button
                key={item}
                onClick={() => setStage(item)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide transition ${
                  stage === item
                    ? 'border-iskra-primary bg-iskra-primary text-black'
                    : 'border-white/10 bg-iskra-surface/70 text-iskra-muted hover:border-iskra-primary/50 hover:text-iskra-text'
                }`}
              >
                {stageLabels[item]}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-iskra-muted">Claim</span>
            <textarea
              value={claim}
              onChange={(event) => setClaim(event.target.value)}
              className="min-h-[70px] w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-iskra-text outline-none focus:border-iskra-primary/60"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-iskra-muted">Claim type</span>
              <select
                value={claimType}
                onChange={(event) => setClaimType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-xs text-iskra-text outline-none"
              >
                <option value="current_event">current_event</option>
                <option value="statistic">statistic</option>
                <option value="quote">quote</option>
                <option value="scientific">scientific</option>
                <option value="historical">historical</option>
                <option value="general">general</option>
              </select>
            </label>
            <div className="rounded-xl border border-white/10 bg-black/20 p-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-iskra-muted">Verdict</p>
              <p className="mt-1 font-mono text-xs" style={{ color: verdict === 'BLOCKER' ? 'var(--iskra-danger)' : nodeColor }}>
                {verdict}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-relaxed">
            {segments.length ? segments.map((segment, index) => {
              const isFocused = focusedTags.includes(segment.label);
              return (
                <span
                  key={`${segment.label}-${index}`}
                  className={`mr-1 rounded px-1.5 py-0.5 transition ${isFocused ? 'text-black' : 'text-iskra-muted'}`}
                  style={{ backgroundColor: isFocused ? tagColors[segment.label] : `${tagColors[segment.label]}24` }}
                  title={segment.reason}
                >
                  [{segment.label}] {segment.text}
                </span>
              );
            }) : (
              <span className="text-iskra-muted">Введите claim, чтобы запустить SIFT Lens.</span>
            )}
          </div>

          <div className="grid gap-2">
            {(Object.keys(sources) as Lane[]).map((lane) => (
              <div
                key={lane}
                className={`rounded-xl border p-3 transition ${focusedLanes.includes(lane) ? 'bg-iskra-primary-dim' : 'bg-black/20'}`}
                style={{ borderColor: focusedLanes.includes(lane) ? `${nodeColor}80` : 'rgba(255,255,255,0.1)' }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-iskra-text">{laneLabels[lane]}</span>
                  <span className="font-mono text-[10px]" style={{ color: nodeColor }}>Q {sourceQuality(sources[lane])}%</span>
                </div>
                <input
                  value={sources[lane].title}
                  onChange={(event) => updateSource(lane, { title: event.target.value })}
                  placeholder="Источник или URL"
                  className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-iskra-text outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={sources[lane].type}
                    onChange={(event) => updateSource(lane, { type: event.target.value as SourceType })}
                    className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-iskra-text outline-none"
                  >
                    {sourceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input
                    value={sources[lane].date}
                    onChange={(event) => updateSource(lane, { date: event.target.value })}
                    type="date"
                    className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-iskra-text outline-none"
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={sources[lane].reliability}
                    onChange={(event) => updateSource(lane, { reliability: Number(event.target.value) })}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1 accent-iskra-primary"
                  />
                  <span className="w-8 text-right font-mono text-[10px] text-iskra-muted">{sources[lane].reliability}</span>
                </div>
                <textarea
                  value={sources[lane].note}
                  onChange={(event) => updateSource(lane, { note: event.target.value })}
                  placeholder="Короткое наблюдение"
                  className="mt-2 min-h-[42px] w-full resize-none rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-iskra-text outline-none"
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-iskra-muted">Trace graph</p>
            <div className="space-y-2">
              {traceLinksForDisplay.map((link) => (
                <div
                  key={link.lane}
                  className={`grid grid-cols-1 gap-1.5 text-[10px] sm:grid-cols-[1fr_auto_0.9fr_auto_1fr] ${
                    focusedLanes.includes(link.lane) ? 'text-iskra-text' : 'text-iskra-muted'
                  }`}
                >
                  <span className="min-w-0 break-words rounded border border-white/10 bg-black/25 p-1.5">{link.source} · Q {link.quality}%</span>
                  <span className="hidden sm:inline" style={{ color: nodeColor }}>→</span>
                  <span className="min-w-0 break-words rounded border border-white/10 bg-black/25 p-1.5">{link.transform}</span>
                  <span className="hidden sm:inline" style={{ color: nodeColor }}>→</span>
                  <span className="min-w-0 break-words rounded border border-white/10 bg-black/25 p-1.5">[{link.claim.label}] {link.claim.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {distortions.map((distortion) => (
                <span
                  key={distortion.type}
                  className="rounded-full border px-2 py-1 text-[10px]"
                  style={{
                    borderColor: distortion.type === 'low_drift' ? 'rgba(46,204,113,0.35)' : 'rgba(255,77,77,0.35)',
                    color: distortion.type === 'low_drift' ? 'var(--iskra-success)' : 'var(--iskra-danger)',
                  }}
                  title={distortion.description}
                >
                  {distortion.type} · {Math.round(distortion.severity * 100)}%
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-[11px] leading-relaxed text-iskra-muted">
            <p><span className="font-mono text-iskra-primary">∆</span> Claim связан с узлом: {activeNode?.label ?? 'Древо Искры'}.</p>
            <p><span className="font-mono text-iskra-primary">D</span> source → transformation → claim; distortions: {distortions.map((item) => item.type).join(', ')}.</p>
            <p><span className="font-mono text-iskra-primary">Ω</span> {omega}% по source quality; live-source confidence не заявлен.</p>
            <p><span className="font-mono text-iskra-primary">Λ</span> Добавить primary/context source или пересмотреть verdict.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-iskra-muted">SIFT Receipt</p>
              <button
                onClick={copyReceipt}
                className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-iskra-muted transition hover:text-iskra-text"
              >
                {copiedReceipt ? 'copied' : 'copy json'}
              </button>
            </div>
            <div className="mb-2 grid grid-cols-1 gap-2 text-[10px] sm:grid-cols-3">
              <span className="min-w-0 break-words rounded-lg border border-white/10 bg-black/25 p-1.5 text-iskra-muted">
                id <span className="block font-mono text-iskra-text">{receipt.run_id}</span>
              </span>
              <span className="min-w-0 break-words rounded-lg border border-white/10 bg-black/25 p-1.5 text-iskra-muted">
                node <span className="block font-mono text-iskra-text">{receipt.active_node_id ?? 'tree'}</span>
              </span>
              <span className="min-w-0 break-words rounded-lg border border-white/10 bg-black/25 p-1.5 text-iskra-muted">
                lanes <span className="block font-mono text-iskra-text">{receipt.trace.length}</span>
              </span>
            </div>
            <details className="group">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.16em] text-iskra-muted transition group-open:text-iskra-text">
                receipt payload
              </summary>
              <pre className="mt-2 max-h-44 overflow-auto rounded-lg border border-white/10 bg-black/35 p-2 text-[10px] leading-relaxed text-iskra-muted">{receiptJson}</pre>
            </details>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-iskra-muted">Replay receipt</p>
              {replayStatus !== 'idle' && (
                <span className={`rounded-full border px-2 py-1 text-[10px] ${replayStatus === 'loaded' ? 'border-iskra-success/40 text-iskra-success' : 'border-iskra-danger/40 text-iskra-danger'}`}>
                  {replayStatus}
                </span>
              )}
            </div>
            <textarea
              value={replayInput}
              onChange={(event) => {
                setReplayInput(event.target.value);
                setReplayStatus('idle');
              }}
              placeholder="Paste SIFT Receipt JSON"
              className="min-h-[76px] w-full resize-none rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[10px] leading-relaxed text-iskra-text outline-none focus:border-iskra-primary/60"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="min-w-0 text-[10px] text-iskra-muted">
                {replayedReceiptId ? (
                  <span className="break-words font-mono text-iskra-text">{replayedReceiptId}</span>
                ) : (
                  <span>Restores claim, lanes, stage, and node focus.</span>
                )}
              </div>
              <div className="flex flex-shrink-0 gap-1.5">
                <button
                  onClick={clearReplay}
                  className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-iskra-muted transition hover:text-iskra-text"
                >
                  clear
                </button>
                <button
                  onClick={replayReceipt}
                  disabled={!replayInput.trim()}
                  className="rounded-full border border-iskra-primary/50 bg-iskra-primary-dim px-2 py-1 text-[10px] text-iskra-text transition disabled:cursor-not-allowed disabled:opacity-35"
                >
                  load
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </aside>
  );
}
