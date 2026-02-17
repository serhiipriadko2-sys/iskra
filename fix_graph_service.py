import os

path = 'runtime/iskraSpace/services/graphServiceSupabase.ts'
with open(path, 'r') as f:
    content = f.read()

# Fix rowToNode return object
# Need to add title and evidence
old_return = """      resonance_score: row.resonance_score || undefined,
      metadata: (row.metadata as Record<string, unknown>) || {}
    };"""

new_return = """      resonance_score: row.resonance_score || undefined,
      metadata: (row.metadata as Record<string, unknown>) || {},
      title: row.type, // Default title from type
      evidence: [] // Default empty evidence
    };"""

if old_return in content:
    content = content.replace(old_return, new_return)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Patched {path}")
else:
    print(f"Could not find replacement target in {path}")
