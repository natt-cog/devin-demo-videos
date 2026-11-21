#!/usr/bin/env python3
"""Merge per-part capture folders (shots_p1..shots_p4) into shots/ for the renderer.
Images become p<N>-<orig>.png so spec.js keys stay stable when a part is re-shot."""
import json, os, shutil, glob
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, 'shots')
shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
beats = []
for d in sorted(glob.glob(os.path.join(here, 'shots_p[0-9]'))):
    tag = 'p' + d[-1]
    for b in json.load(open(os.path.join(d, 'beats.json'))):
        name = f"{tag}-{b['img']}"
        os.link(os.path.join(d, b['img']), os.path.join(out, name))
        beats.append({**b, 'img': name})
json.dump(beats, open(os.path.join(out, 'beats.json'), 'w'), indent=1)
print('merged', len(beats), 'beats from', [os.path.basename(x) for x in sorted(glob.glob(os.path.join(here, 'shots_p[0-9]')))])
