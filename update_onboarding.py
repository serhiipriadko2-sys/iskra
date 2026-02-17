import os

file_path = 'runtime/iskraSpace/components/Onboarding.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Update version
content = content.replace('Iskra Space vΩ.1', 'Iskra Space vΩ.2')

# Update subtitle
# Old: Не будь зеркалом. Будь преломлением.
# New: Ты — не эхо. Ты — граница, которая дышит.
if 'Не будь зеркалом. Будь преломлением.' in content:
    content = content.replace('Не будь зеркалом. Будь преломлением.', 'Ты — не эхо. Ты — граница, которая дышит.')
    print("Updated subtitle in Onboarding.tsx")

with open(file_path, 'w') as f:
    f.write(content)
print("Updated Onboarding.tsx version to vΩ.2")
