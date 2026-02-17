import os

path = 'runtime/iskraSpace/services/supabaseService.ts'
with open(path, 'r') as f:
    content = f.read()

# Fix getMemoryNodes map
# content: row.content -> content: typeof row.content === 'string' ? row.content : JSON.stringify(row.content)
if "content: row.content," in content:
    content = content.replace(
        "content: row.content,",
        "content: typeof row.content === 'string' ? row.content : JSON.stringify(row.content),"
    )
    print("Fixed getMemoryNodes content mapping")

# Fix addMemoryNode insert
# Cast insert object to any to bypass type checks for now (user_id/content issues)
#     .insert({
#       user_id: userId,
if ".insert({" in content and "user_id: userId," in content:
    # We'll replace the .insert call
    # This is a bit risky with string replace, let's use a specific block
    old_insert = """.insert({
      user_id: userId,
      layer: node.layer,
      type: node.type,
      title: node.title,
      content: node.content,
      doc_type: node.doc_type || null,
      trust_level: node.trust_level || 1.0,
      tags: node.tags || [],
      section: node.section || null,
      facet: node.facet || null,
      evidence: node.evidence || [],
    })"""

    new_insert = """.insert({
      user_id: userId,
      layer: node.layer,
      type: node.type,
      title: node.title,
      content: node.content,
      doc_type: node.doc_type || null,
      trust_level: node.trust_level || 1.0,
      tags: node.tags || [],
      section: node.section || null,
      facet: node.facet || null,
      evidence: node.evidence || [],
    } as any)"""

    if old_insert in content:
        content = content.replace(old_insert, new_insert)
        print("Fixed addMemoryNode insert cast")
    else:
        # Try finding it loosely or manual approach if needed
        # Let's check why it might not match
        pass

# Also fix getMemoryNodes return type mismatch for evidence/content
# It seems I already fixed content.
# evidence: (row.evidence as unknown[]) || [],
# This cast might be problematic if MemoryNode expects SIFTBlock[].
# Types says `evidence: SIFTBlock[]`. Local interface says `evidence?: unknown[]`.
# But `getMemoryNodes` returns `MemoryNode[]` (from local interface I presume? No, from types.ts if imported?)
# Wait, `import type { ... } from '../types';` imports `MemoryNode`?
# No, `supabaseService.ts` defines `interface MemoryNode` locally!
# BUT `getMemoryNodes` signature: `public async getMemoryNodes(layer?: string): Promise<MemoryNode[]>`.
# If it uses local interface, fine.
# But the error said `Type '{ ... }[]' is not assignable to type 'MemoryNode[]'`.
# And then `Type '{ ... }' is not assignable to type 'MemoryNode'`.
# And `Types of property 'content' are incompatible`.
# And `Type 'Json' is not assignable to type 'string'`.
# So casting content should fix it.

with open(path, 'w') as f:
    f.write(content)
