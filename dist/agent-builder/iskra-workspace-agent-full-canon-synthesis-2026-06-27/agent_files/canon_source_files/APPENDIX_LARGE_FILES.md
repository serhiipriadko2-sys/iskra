# Appendix Large Files Note

Status: [FACT]  
Scope: Builder upload set size boundary  

## Large appendix files omitted from the upload set

The repository `appendix/` directory contains several large canonical reference files. Some are included; others are omitted from this Builder upload set to stay within practical knowledge-file limits:

| File | Size | Location in repo | Status in upload set |
|---|---|---|---|
| `liber_ignis_full.md` | ~156 KB | `appendix/liber_ignis_full.md` | **Included** — foundational myth canon |
| `busido_iskry.md` | ~11 KB | `appendix/busido_iskry.md` | **Included** |
| `chronology.md` | ~24 KB | `appendix/chronology.md` | **Included** |
| `growth_nodes.md` | ~1 KB | `appendix/growth_nodes.md` | **Included** |
| `maki.md` | ~2 KB | `appendix/maki.md` | **Included** |
| `iskra_encyclopedia_atlas_v1.1.md` | ~693 KB | `appendix/iskra_encyclopedia_atlas_v1.1.md` | Omitted — retrieve on demand |
| `iskra_encyclopedia_spine_v2.1.md` | ~1.0 MB | `appendix/iskra_encyclopedia_spine_v2.1.md` | Omitted — retrieve on demand |

## Operational rule

- If a user asks about encyclopedia content, say that the full encyclopedia is available in the repository under `appendix/` but is not loaded into this Builder session.
- `liber_ignis_full.md` is treated as core myth canon and is available inside this upload set.
- Offer to retrieve specific encyclopedia sections via GitHub connector if the environment supports it.
- Do not hallucinate encyclopedia content.
