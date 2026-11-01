#!/usr/bin/env python3
"""Validate course mapping and optionally inspect generated stage artifacts (stdlib only)."""
import argparse, json, csv, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((root/'references/curriculum-map.json').read_text(encoding='utf-8'))
mods=manifest['modules']; stages=manifest['stages']; errors=[]
if len(mods)!=56:errors.append(f'Expected 56 modules; got {len(mods)}')
if len(stages)!=12:errors.append(f'Expected 12 stages; got {len(stages)}')
if len({m['domain_id'] for m in mods})!=18:errors.append('Expected 18 domains')
if len({m['id'] for m in mods})!=len(mods):errors.append('Duplicate module ID')
if {s['stage'] for s in stages}!=set(range(1,13)):errors.append('Stages must be 1–12')
for m in mods:
 if not 1<=m['primary_stage']<=12: errors.append('Bad first-teaching stage '+m['id'])
 if m['target_depth'] not in ('D0','D1','D2','D3'): errors.append('Bad target depth '+m['id'])
 if any(x<=m['primary_stage'] or x>12 for x in m['revisit_stages']): errors.append('Bad revisit ordering '+m['id'])
# CSV must exactly match manifest
with (root/'references/coverage-matrix.csv').open(newline='',encoding='utf-8') as f:rows=list(csv.DictReader(f))
if len(rows)!=len(mods):errors.append('CSV row count mismatch')
rowmap={r['module_id']:r for r in rows}
for m in mods:
 r=rowmap.get(m['id'])
 if not r:errors.append('Missing CSV module '+m['id']);continue
 if str(m['primary_stage'])!=r['primary_stage'] or m['target_depth']!=r['depth_target']:errors.append('CSV mismatch '+m['id'])
parser=argparse.ArgumentParser();parser.add_argument('--workspace',type=pathlib.Path);args=parser.parse_args()
if args.workspace:
 ws=args.workspace; verified=[];drafted=[]
 for s in stages:
  d=ws/s['output_dir']; state=d/'stage-state.json'
  if not state.exists():continue
  try:st=json.loads(state.read_text(encoding='utf-8'))
  except Exception as e:errors.append(f'Unreadable stage state {state}: {e}');continue
  needed=[d/'guide.md',d/'guide.html',d/'stage-plan.md']
  if not all(q.exists() and q.stat().st_size>100 for q in needed): errors.append('Missing or tiny lesson artifact '+str(d));continue
  drafted.extend(m['id'] for m in mods if m['primary_stage']==s['stage'])
  checks=st.get('validation',{})
  if st.get('status')=='tested' and all(checks.get(k) is True for k in ['module_coverage_checked','markdown_checked','html_offline_checked','diagram_consistency_checked']):verified.extend(m['id'] for m in mods if m['primary_stage']==s['stage'])
 print(f'Workspace coverage: drafted modules={len(set(drafted))}/56; validated modules={len(set(verified))}/56')
if errors:
 for e in errors:print('ERROR:',e,file=sys.stderr)
 sys.exit(1)
print('PASS: 12 stages, 18 domains, 56 uniquely mapped modules; CSV consistent.')
