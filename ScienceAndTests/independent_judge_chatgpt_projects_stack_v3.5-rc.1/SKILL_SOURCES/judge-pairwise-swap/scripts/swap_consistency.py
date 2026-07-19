#!/usr/bin/env python3
"""ORDER-SWAP-v1 consistency calculator for Independent Judge v3.5-rc.1."""
import argparse, json

VALID = {"A", "B", "tie"}

def evaluate(pairs):
    rows=[]; robust=0; decisive_robust=0; decisive_total=0; inconsistent=0
    for i,p in enumerate(pairs):
        w1=p.get("order_ab_winner"); w2=p.get("order_ba_winner")
        if w1 not in VALID or w2 not in VALID:
            raise ValueError(f"pair {i}: winner must be A, B, or tie")
        if w1 == w2 == "tie":
            status="TIE_STABLE"; winner=None; robust += 1
        elif w1 == w2 and w1 in {"A","B"}:
            status="PASS"; winner=w1; robust += 1; decisive_robust += 1; decisive_total += 1
        else:
            status="INCONSISTENT_AS_TIE"; winner=None; inconsistent += 1
            if w1 in {"A","B"} and w2 in {"A","B"}: decisive_total += 1
        rows.append({"pair_id":p.get("pair_id",f"pair-{i+1}"),"order_ab_winner":w1,
                     "order_ba_winner":w2,"robustness":status,"formal_winner":winner})
    n=len(rows)
    return {
      "pairs": rows,
      "n": n,
      "order_robust_rate": round(robust/n,6) if n else None,
      "decisive_consistency_rate": round(decisive_robust/decisive_total,6) if decisive_total else None,
      "inconsistent_rate": round(inconsistent/n,6) if n else None,
      "position_bias_suspected": (inconsistent/n >= 0.2) if n else None,
      "note": "TIE_STABLE is order-robust but has no winner; inconsistency becomes tie under CMP-004."
    }

if __name__ == "__main__":
    ap=argparse.ArgumentParser(); ap.add_argument("--pairs",required=True)
    a=ap.parse_args()
    with open(a.pairs,encoding="utf-8") as f: pairs=json.load(f)
    print(json.dumps(evaluate(pairs),ensure_ascii=False,indent=2))
