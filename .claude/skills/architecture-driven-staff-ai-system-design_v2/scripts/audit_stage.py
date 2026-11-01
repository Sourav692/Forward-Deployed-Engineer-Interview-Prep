#!/usr/bin/env python3
"""Conservative structural audit of one authored stage; not content-quality proof."""
import argparse, json, pathlib, re, sys

base=pathlib.Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--workspace',required=True,type=pathlib.Path)
parser.add_argument('--stage',required=True,type=int,choices=range(1,13),metavar='1..12')
args=parser.parse_args()
mapping=json.loads((base/'references/curriculum-map.json').read_text())
row=next(s for s in mapping['stages'] if s['stage']==args.stage)
d=args.workspace/row['output_dir']
errors=[]; warnings=[]
required=['stage-plan.md','guide.md','guide.html','stage-state.json','module-evidence.md','stage-review.md']
for name in required:
    if not (d/name).is_file():errors.append(f'Missing {name}')
if not errors:
    md=(d/'guide.md').read_text(encoding='utf-8')
    html=(d/'guide.html').read_text(encoding='utf-8')
    evidence=(d/'module-evidence.md').read_text(encoding='utf-8')
    state=json.loads((d/'stage-state.json').read_text())
    for title in ['Understand the Problem','Learn and Design','Observe and Experiment','Think Like a Staff Engineer','Validate and Carry Forward']:
        if title.lower() not in md.lower():errors.append(f'Missing phase {title} in Markdown')
    assigned=[m for m in mapping['modules'] if m['primary_stage']==args.stage]
    for m in assigned:
        # IDs in evidence table do not prove that the concept is adequately explained.
        if not re.search(r'(?<![0-9])'+re.escape(m['id'])+r'(?![0-9])',evidence):
            errors.append(f'No module evidence row: {m["id"]}')
    if '<html' not in html.lower() or '</html>' not in html.lower():errors.append('HTML document is incomplete')
    for loc in ['#understand','#design','#experiment','#staff','#validate']:
        if loc not in html:warnings.append('HTML may lack nav target '+loc)
    if 'mermaid' not in md.lower():warnings.append('No Mermaid diagram identified')
    if 'svg' not in html.lower():warnings.append('No inline SVG identified')
    if state.get('learner_completion') not in ('unassessed','in_progress','passed','not_started'):
        warnings.append('Unrecognized learner_completion state')
    if state.get('learner_completion')=='passed':
        warnings.append('Learner marked passed: verify actual assessment evidence separately')
print(f'Stage {args.stage}: {d}')
for x in errors:print('ERROR:',x)
for x in warnings:print('WARNING:',x)
if not errors:print('PASS: structural checks only; factual correctness, interactivity and lab runtime require separate verification.')
sys.exit(bool(errors))
