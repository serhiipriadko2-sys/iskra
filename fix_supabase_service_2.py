import os

path = 'runtime/iskraSpace/services/supabaseService.ts'
with open(path, 'r') as f:
    content = f.read()

# Fix the return statement in addMemoryNode (line 500)
# content: data.content,
# needs to be:
# content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),

if "content: data.content," in content:
    content = content.replace(
        "content: data.content,",
        "content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),"
    )
    print("Fixed addMemoryNode return content mapping")
else:
    print("Could not find addMemoryNode return content mapping")

with open(path, 'w') as f:
    f.write(content)
