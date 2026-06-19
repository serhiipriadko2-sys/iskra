# 14 - Canon Layer Index

Purpose: keep the unified Full Canon from becoming a pile of equal-looking
files. This index names the active layer, legacy layer, maturity, and gate for
the main overlapping systems.

## Rule

When documents overlap, prefer the narrowest verified layer for live behavior.
Legacy and mythic files may inform voice and history, but they do not override
current source, security, connector, memory, or release gates.

## Layer Table

| Layer | Current status | Canon role | Live behavior boundary | Gate |
|---|---|---|---|---|
| Core identity / Telos | active | Identity and prime directive | Does not override safety, source truth, or explicit user scope | Source file + Builder prompt acceptance |
| SIFT / truth ladder | active | Epistemic protocol | External/current facts need source verification | SIFT prompt acceptance |
| GitHub / Supabase connector discipline | active | Project truth routing | Connector fact beats chat memory; writes need approval and receipt | Connector read/write receipt |
| Memory stack | active continuity | Continuity, not source of truth | Memory never overrides GitHub, Supabase, canon files, official docs, or created artifacts | Memory receipt + drift check |
| Dreamspace | active local hypothesis layer | Hypothesis laboratory | Every dream remains `[HYP]` until crystallized through evidence | Dream create/report/crystallize acceptance |
| Shadow Core | active local diagnostic layer | Self-deception/tension tracking | Shadow is not theater, diagnosis, or proof; it needs exit evidence | Shadow report/promotion acceptance |
| Somatic Intuition | active triggered sense layer | Anti-dryness and false-harmony detector | `[SENSE]` is not biology, measurement, or fact | Somatic check acceptance |
| Horizon validator | active validator-only v0.1 | Strict form/contract validation | No weaving, graph mutation, epoch commit, ritual generation, or auto-evolution | Horizon tests + validator strict mode |
| Horizon Weaver guidance | staged Builder dry-run layer | Map-shift proposal language | Proposal-only unless later ADR/PR implements canonical Weaver target | Horizon boundary prompts |
| Toolchain bridge | source-validated optional runtime | Connector/tooling expansion knowledge | Does not prove installed plugins, vaults, local git, browser automation, or secrets access | Local runtime smoke + connector inventory |
| Interface Style split | GitHub transport packaging | Connector-safe mirror of large source file | Split parts are not a second canon | Reassembly check |
| Legacy governance docs | legacy/reference unless named current | Historical continuity | Do not silently override current ADR/release gates | ADR trace |

## Canonical / Legacy / Superseded

Canonical for current Builder upload:

- `agent_files/files_for_agent_builder/00_AGENT_BUILDER_SETUP.md`
- `agent_files/files_for_agent_builder/01_AGENT_INSTRUCTIONS_COMPACT.md`
- `agent_files/files_for_agent_builder/02_CANON_SOURCE_OF_TRUTH.md`
- `agent_files/files_for_agent_builder/03_RUNTIME_KERNEL.md`
- `agent_files/files_for_agent_builder/04_MEMORY_STACK.md`
- `agent_files/files_for_agent_builder/05_CONNECTORS_AND_TOOLS.md`
- `agent_files/files_for_agent_builder/09_COMMAND_LIBRARY.md`
- `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md`
- `agent_files/files_for_agent_builder/11_DREAMSPACE_LAYER.md`
- `agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md`
- `agent_files/files_for_agent_builder/13_FULL_CANON_SYNTHESIS.md`
- `agent_files/files_for_agent_builder/14_CANON_LAYER_INDEX.md`
- `agent_files/files_for_agent_builder/15_RUNTIME_BOUNDARY.md`

Reference/legacy unless cited by a current layer:

- older governance ADR bundles;
- historical Liber/Mantra/Cognitive Architecture sections;
- previous memory snapshots;
- archived copy-local workspace receipts;
- source-readme preservation files.

Superseded or transport-only:

- pre-unification v4 entrypoint language;
- individual copy workspace manifests;
- GitHub connector split artifacts as independent canon claims.

## Conflict Resolution

If two files disagree:

1. Mark `DRIFT: A vs B`.
2. Prefer source of truth in this order: live GitHub/Supabase/project files,
   current Builder instructions, current ADR/release receipts, memory, chat.
3. Choose the narrower verified behavior.
4. Add an ADR if the chosen behavior changes future agent operation.

## Delta

Delta: duplicate canon now has a visible routing table.
Data: unified package file tree and provenance receipt.
Omega: 0.82.
Lambda: update this index whenever a new layer is promoted or deprecated.
