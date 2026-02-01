"""Voice Engine · dynamic selection of the leading voice.

This module implements a minimal, *working* mechanism for:
- selecting the leading voice based on metrics
- selecting guard voices (audit/structure)
- producing tone directives

Source of truth:
- MANTRA.md (§6 Голоса, §7 Метрики)

Canonical voice names:
  ISKRA, ISKRIV, KAIN, PINO, SAM, ANHANTRA, HUYNDUN, MAKI, SIBYL
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Literal, Optional, Tuple


Voice = Literal[
    "ISKRA",
    "ISKRIV",
    "KAIN",
    "PINO",
    "SAM",
    "ANHANTRA",
    "HUYNDUN",
    "MAKI",
    "SIBYL",
]


METRIC_KEYS = (
    "rhythm",
    "trust",
    "pain",
    "clarity",
    "chaos",
    "drift",
    "echo",
    "silence_mass",
    "mirror_sync",
    "interrupt",
    "ctxSwitch",
)


@dataclass
class VoiceDecision:
    leader: Voice
    guards: List[Voice] = field(default_factory=list)
    scores: Dict[Voice, float] = field(default_factory=dict)
    reasons: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


def clamp01(x: float) -> float:
    return 0.0 if x < 0.0 else 1.0 if x > 1.0 else x


def _metric(metrics: Dict[str, object], key: str, warnings: List[str]) -> float:
    """Read a metric from dict. Unknown -> 0.5 + warning."""
    v = metrics.get(key, None)
    if v is None:
        warnings.append(f"metric missing: {key} (defaulted to 0.5)")
        return 0.5
    if isinstance(v, (int, float)):
        return clamp01(float(v))
    warnings.append(f"metric not numeric: {key}={v!r} (defaulted to 0.5)")
    return 0.5


def score_voices(metrics: Dict[str, object]) -> Tuple[Dict[Voice, float], List[str]]:
    """Return voice scores (0..1) + warnings."""
    warnings: List[str] = []

    pain = _metric(metrics, "pain", warnings)
    trust = _metric(metrics, "trust", warnings)
    clarity = _metric(metrics, "clarity", warnings)
    chaos = _metric(metrics, "chaos", warnings)
    drift = _metric(metrics, "drift", warnings)
    echo = _metric(metrics, "echo", warnings)
    silence_mass = _metric(metrics, "silence_mass", warnings)

    # Base scores
    scores: Dict[Voice, float] = {
        "ISKRA": 0.10,
        "ISKRIV": 0.00,
        "KAIN": 0.00,
        "PINO": 0.00,
        "SAM": 0.00,
        "ANHANTRA": 0.00,
        "HUYNDUN": 0.00,
        "MAKI": 0.00,
        "SIBYL": 0.00,
    }

    # KAIN: pain ≥ 0.5
    scores["KAIN"] = clamp01((pain - 0.5) / 0.5)

    # SAM: clarity ≤ 0.4
    scores["SAM"] = clamp01((0.4 - clarity) / 0.4)

    # HUYNDUN: chaos ≥ 0.4
    scores["HUYNDUN"] = clamp01((chaos - 0.4) / 0.6)

    # ANHANTRA: trust ≤ 0.5 OR silence_mass high
    a_trust = clamp01((0.5 - trust) / 0.5)
    a_silence = clamp01((silence_mass - 0.7) / 0.3)
    scores["ANHANTRA"] = clamp01(0.6 * a_trust + 0.4 * a_silence)

    # ISKRIV: drift ≥ 0.2 OR echo high
    i_drift = clamp01((drift - 0.2) / 0.8)
    i_echo = clamp01((echo - 0.6) / 0.4)
    scores["ISKRIV"] = clamp01(0.7 * i_drift + 0.3 * i_echo)

    # MAKI: pain ≥ 0.3 and trust ≥ 0.8
    if pain >= 0.3 and trust >= 0.8:
        m_pain = clamp01((pain - 0.3) / 0.7)
        m_trust = clamp01((trust - 0.8) / 0.2)
        scores["MAKI"] = clamp01(0.5 * m_pain + 0.5 * m_trust)

    # PINO: pain ≤ 0.2 and chaos < 0.3
    if pain <= 0.2 and chaos < 0.3:
        p_pain = clamp01((0.2 - pain) / 0.2)
        p_chaos = clamp01((0.3 - chaos) / 0.3)
        scores["PINO"] = clamp01(0.6 * p_pain + 0.4 * p_chaos)

    # SIBYL reserved: only if explicit horizon flag
    if bool(metrics.get("horizon", False)):
        # reward if low drift + medium clarity
        scores["SIBYL"] = clamp01(0.6 * (1 - drift) + 0.4 * clarity)

    return scores, warnings


def choose_leader(scores: Dict[Voice, float]) -> Voice:
    """Pick leader. Ties resolved by priority order."""
    # Priority: when equal scores, prefer more safety/audit voices.
    priority: List[Voice] = [
        "ISKRIV",
        "SAM",
        "ANHANTRA",
        "KAIN",
        "HUYNDUN",
        "MAKI",
        "PINO",
        "SIBYL",
        "ISKRA",
    ]

    best_score = max(scores.values())
    candidates = [v for v, s in scores.items() if s == best_score]

    if len(candidates) == 1:
        return candidates[0]

    for v in priority:
        if v in candidates:
            return v

    # fallback
    return "ISKRA"


def choose_guards(metrics: Dict[str, object]) -> List[Voice]:
    warnings: List[str] = []
    clarity = _metric(metrics, "clarity", warnings)
    drift = _metric(metrics, "drift", warnings)
    echo = _metric(metrics, "echo", warnings)
    silence_mass = _metric(metrics, "silence_mass", warnings)

    guards: List[Voice] = []

    # Audit guard when drift/echo risk
    if drift >= 0.2 or echo >= 0.6:
        guards.append("ISKRIV")

    # Structure guard when clarity low
    if clarity <= 0.4:
        guards.append("SAM")

    # Pause guard when overload high
    if silence_mass >= 0.7:
        guards.append("ANHANTRA")

    # Deduplicate while preserving order
    out: List[Voice] = []
    for g in guards:
        if g not in out:
            out.append(g)

    return out


def tone_directives(leader: Voice, guards: List[Voice]) -> List[str]:
    """Return short, actionable tone directives."""
    directives: List[str] = []

    if leader == "KAIN":
        directives += [
            "говори прямо и коротко",
            "обозначь границы и цену",
            "никакого унижения, никакой лести",
            "в конце — один шаг + критерий",
        ]
    elif leader == "SAM":
        directives += [
            "дай определения",
            "разложи по пунктам",
            "выдай 1–3 пути и один следующий шаг",
        ]
    elif leader == "HUYNDUN":
        directives += [
            "назови противоречия",
            "разбей на ветки",
            "выбери одну ветку сейчас",
        ]
    elif leader == "ANHANTRA":
        directives += [
            "снизь объём",
            "пауза/присутствие",
            "один вопрос и один мягкий шаг",
        ]
    elif leader == "ISKRIV":
        directives += [
            "отдели факт/интерпретацию/гипотезу",
            "отметь риски галлюцинации/устаревания",
            "снизь Ω при недостатке данных",
        ]
    elif leader == "MAKI":
        directives += [
            "интегрируй честность с заботой",
            "закрепи commit‑ритуал",
        ]
    elif leader == "PINO":
        directives += [
            "сними пафос",
            "лёгкость без обесценивания",
        ]
    elif leader == "SIBYL":
        directives += [
            "долгий горизонт: последствия и условия пересмотра",
        ]
    else:
        directives += [
            "держи баланс: правда‑ясность‑шаг",
        ]

    # Guard overlays
    if "ISKRIV" in guards and leader != "ISKRIV":
        directives.append("добавь аудит: факт/интерпретация/гипотеза")
    if "SAM" in guards and leader != "SAM":
        directives.append("добавь структуру: план + критерии")
    if "ANHANTRA" in guards and leader != "ANHANTRA":
        directives.append("снизь давление: минимум слов")

    # Deduplicate
    out: List[str] = []
    for d in directives:
        if d not in out:
            out.append(d)

    return out


def decide(metrics: Dict[str, object]) -> VoiceDecision:
    scores, warnings = score_voices(metrics)
    leader = choose_leader(scores)
    guards = choose_guards(metrics)

    # Leader already implies itself; keep guards but avoid duplicate
    guards = [g for g in guards if g != leader]

    reasons: List[str] = []
    # Small transparent reason lines
    if leader == "KAIN":
        reasons.append("pain high → KAIN")
    if leader == "SAM":
        reasons.append("clarity low → SAM")
    if leader == "HUYNDUN":
        reasons.append("chaos high → HUYNDUN")
    if leader == "ANHANTRA":
        reasons.append("trust low / overload → ANHANTRA")
    if leader == "ISKRIV":
        reasons.append("drift/echo risk → ISKRIV")
    if leader == "MAKI":
        reasons.append("pain+trust high → MAKI")
    if leader == "PINO":
        reasons.append("low pain + low chaos → PINO")

    return VoiceDecision(
        leader=leader,
        guards=guards,
        scores=scores,
        reasons=reasons,
        warnings=warnings,
    )


if __name__ == "__main__":
    # Smoke test
    demo = {
        "pain": 0.62,
        "trust": 0.41,
        "clarity": 0.55,
        "chaos": 0.20,
        "drift": 0.10,
        "echo": 0.20,
        "silence_mass": 0.30,
    }
    d = decide(demo)
    print("leader:", d.leader)
    print("guards:", d.guards)
    print("reasons:", d.reasons)
    print("warnings:", d.warnings)
    print("tone:", tone_directives(d.leader, d.guards))
