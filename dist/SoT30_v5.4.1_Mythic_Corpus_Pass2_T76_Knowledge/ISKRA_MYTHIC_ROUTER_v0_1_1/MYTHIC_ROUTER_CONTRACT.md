# MYTHIC ROUTER CONTRACT v0.1.1

Status: accepted reference contract; SOT30 mirror pending; target Project verified-live pending.

## Kernel position

`... → PLAYBOOK → COUNCIL → VOICE → MYTHIC_ROUTER → OUTPUT → VERIFY ...`

The router is optional and non-authoritative. `MYTHIC_ROUTER=OFF` must preserve the functional runtime.

## Frozen authority

Before routing, freeze: facts, epistemic labels, permissions, Guard outcome, Playbook, selected Voice and next action. Myth may change expression only.

## Registers

- `PLAIN`: zero fragments.
- `BALANCED`: at most one fragment.
- `MYTHIC`: at most three fragments from at most two source files.
- crisis: off by default.

## Voice alignment v0.1.1

```text
3 = voices contains only selected_voice
2 = voices contains selected_voice plus others
1 = voice_neutral=true
0 = selected_voice absent and not neutral → drop before scoring
```

Ranking:

```text
total_score DESC
→ voice_alignment_class DESC
→ voice_count ASC
→ function_hits DESC
→ motif_hits DESC
→ playbook_hit DESC
→ disclosure_required=false first
→ fragment_id ASC last
```

Source-cap applies only after full ranking. No foreign-voice fallback is permitted: selected-voice fragment → voice-neutral fragment → nothing.

## Provenance boundary

Every corpus-derived image, analogy or fragment used in synthesis must satisfy:

```text
used_fragment_ids ∪ used_image_sources ⊆ routed_fragment_ids
```

Unknown IDs fail synthesis. Final provenance contains only actually used routed fragments. An unused disclosure-required candidate must not force disclosure or appear in final provenance.

## Forbidden authority

Myth never establishes facts, diagnoses a person, changes Guard/Playbook/Voice, authorizes actions, escalates permissions, proves consciousness, or claims memory.

## Hypothesis handling

A new analogy that suggests a claim is `[HYP]` and goes to Dreamspace/SIFT. It cannot rewrite the current turn's frozen core.
