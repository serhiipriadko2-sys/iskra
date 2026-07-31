from __future__ import annotations
import hashlib, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
REL=ROOT/'governance/releases/2026-07-30-sot30-v5-5-7-audit-repair'
K=REL/'knowledge'; S=REL/'support'; ZIP=ROOT/'dist/SoT30_v5.5.7.zip'
BASE=ROOT/'governance/releases/2026-07-21-sot30-v5-5-6-acceptance-repair/support/MANIFEST.json'
SOURCE_PATH='governance/releases/2026-07-30-sot30-v5-5-7-audit-repair'
INSTR_SHA='73dcfe4e726cf436d27bf555b33055c5e0bd040d3aaeea85446b50df6dce8deb'
EXPECTED_CHANGED={'00_PROJECT_ROUTER.md','01_PARITY_ADVANCEMENT_MANIFEST.md','02_PROJECTS_SURFACE_MAP.md','12_COUNCIL_VOICES.md','15_SUPABASE_MEMORY_PLANE.md','20_GOVERNANCE_ADR.md','22_CONNECTORS_TOOLS_BOUNDARY.md','25_LIBER_SPACE_BUSIDO.md','28_EVALS_ACCEPTANCE.md','29_INDEX_UPLOAD_MANIFEST.md'}

def sha(b:bytes)->str:return hashlib.sha256(b).hexdigest()
def read(p:Path)->str:return p.read_text(encoding='utf-8')
def write(p:Path,t:str)->None:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(t.replace('\r\n','\n'),encoding='utf-8',newline='\n')
def replace_once(t:str,a:str,b:str)->str:
    if t.count(a)!=1: raise RuntimeError(f'anchor count {t.count(a)} for {a[:80]!r}')
    return t.replace(a,b,1)
def git_bytes(ref:str,path:str)->bytes:return subprocess.check_output(['git','show',f'{ref}:{path}'],cwd=ROOT)
