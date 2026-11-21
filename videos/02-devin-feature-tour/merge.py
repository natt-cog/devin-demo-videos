#!/usr/bin/env python3
"""Merge per-part capture folders into shots/ for the renderer.
shots_p<N> plus optional re-take folders shots_p<N>_<x> (in name order) become one part:
images are renumbered p<N>-0000.png, p<N>-0001.png, ... so spec.js keys stay stable."""
import json, os, shutil, glob, re
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, 'shots')
shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
beats, used = [], []
for n in sorted({re.match(r'shots_p(\d)', os.path.basename(d)).group(1) for d in glob.glob(os.path.join(here, 'shots_p[0-9]*'))}):
    i = 0
    for d in sorted(glob.glob(os.path.join(here, f'shots_p{n}')) + glob.glob(os.path.join(here, f'shots_p{n}_*'))):
        used.append(os.path.basename(d))
        for b in json.load(open(os.path.join(d, 'beats.json'))):
            name = f"p{n}-{i:04d}.png"; i += 1
            os.link(os.path.join(d, b['img']), os.path.join(out, name))
            beats.append({**b, 'img': name})
json.dump(beats, open(os.path.join(out, 'beats.json'), 'w'), indent=1)
print('merged', len(beats), 'beats from', used)
