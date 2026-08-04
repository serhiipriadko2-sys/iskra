#!/usr/bin/env python3
import argparse
from pino_release.source import apply_source
from pino_release.build import build_release
from pino_release.verify import verify_release,selftest

def main()->int:
    ap=argparse.ArgumentParser();g=ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--source',action='store_true');g.add_argument('--build',metavar='REF');g.add_argument('--verify',action='store_true');g.add_argument('--selftest',action='store_true');a=ap.parse_args()
    if a.source: apply_source()
    elif a.build: build_release(a.build)
    elif a.verify: verify_release()
    else: selftest()
    return 0
if __name__=='__main__':raise SystemExit(main())
