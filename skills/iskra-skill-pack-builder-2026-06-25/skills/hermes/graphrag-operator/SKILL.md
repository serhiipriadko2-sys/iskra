---
name: graphrag-operator
description: "search canon, repo, and memory as a graph instead of a flat list. use when evidence spans multiple files, nodes, concepts, or relationships and normal retrieval is too shallow."
---

# GraphRAG Operator

Use this skill when the answer depends on linked concepts across files, modules, or memory nodes.\n\n## Workflow\n1. Start from the user query and identify core entities, files, and relations.\n2. Retrieve primary anchors first, then expand one hop at a time through related nodes.\n3. Re-rank results by canon priority, relevance, and groundedness.\n4. Return the answer with a trace of the path used to assemble it.\n\n## Guardrails\n- Prefer canon and repo anchors over chat memory.\n- Do not expand the graph without a concrete relevance gain.\n- Name broken links or missing evidence instead of guessing.
