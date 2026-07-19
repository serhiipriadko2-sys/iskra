#!/usr/bin/env python3
"""Create separated blind batch and sealed identity manifest."""
import argparse, hashlib, json, random, string
from datetime import datetime, timezone
from pathlib import Path

def make(identities, seed=None):
    if len(identities) < 2: raise ValueError("at least two identities required")
    if len(identities) > 26: raise ValueError("maximum 26 identities")
    if len(set(identities)) != len(identities): raise ValueError("identities must be unique")
    rnd=random.Random(seed); shuffled=list(identities); rnd.shuffle(shuffled)
    labels=list(string.ascii_uppercase[:len(shuffled)])
    mapping=dict(zip(labels,shuffled))
    manifest={"created_at":datetime.now(timezone.utc).isoformat(),"method":"BLIND-MAPPING-v1",
              "seed":seed,"mapping":mapping}
    canonical=json.dumps(manifest,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()
    manifest["sha256_without_sha256_field"]=hashlib.sha256(canonical).hexdigest()
    batch={"method":"BLIND-MAPPING-v1","labels":labels,"identity_information_included":False}
    return batch,manifest

if __name__ == "__main__":
    ap=argparse.ArgumentParser(); ap.add_argument("--identities",required=True)
    ap.add_argument("--seed",type=int,default=None); ap.add_argument("--out-dir",required=True)
    a=ap.parse_args(); out=Path(a.out_dir); out.mkdir(parents=True,exist_ok=True)
    batch,manifest=make([x.strip() for x in a.identities.split(',') if x.strip()],a.seed)
    (out/'blind_batch_for_judge.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2)+"\n",encoding='utf-8')
    (out/'sealed_identity_manifest_KEEP_OUTSIDE_JUDGE.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding='utf-8')
    print(json.dumps({"blind_batch":str(out/'blind_batch_for_judge.json'),
                      "sealed_manifest":str(out/'sealed_identity_manifest_KEEP_OUTSIDE_JUDGE.json'),
                      "warning":"Never upload sealed manifest into Judge Project."},ensure_ascii=False,indent=2))
