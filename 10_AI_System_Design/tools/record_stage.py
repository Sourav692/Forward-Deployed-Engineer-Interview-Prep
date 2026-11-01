"""Initialise lesson records or accept a stage after its explicit checks pass.

Finish is called only after static, Python/JS, browser, and design checks run.
"""
import csv,json,sys,zipfile,hashlib,re,os
from pathlib import Path
stage=Path(sys.argv[2]);root=stage.parents[1];mode=sys.argv[1]
ui=json.loads((stage/'lesson-ui.json').read_text());n=ui['stage'];m=json.loads((root/'progress/curriculum-map.json').read_text())
previous=next(x for x in m['stages'] if x['stage']==n-1)
prevstage=root/previous['output_dir'];previous_state=json.loads((prevstage/'stage-state.json').read_text())
assert previous_state['status']=='tested','Validate the preceding stage first.'
first=[x for x in m['modules'] if x['primary_stage']==n];revisit=[x for x in m['modules'] if n in x['revisit_stages']]
statefile=stage/'stage-state.json'
if mode=='init':
 state={'stage':n,'title':ui['title'],'status':'drafted','architecture_before':previous_state['architecture_version'],'architecture_after':(stage/'architecture-after.md').read_text(),'architecture_version':f'v0.{n}-stage-{n:02d}','first_taught_modules':[{'id':x['id'],'module':x['module'],'target_depth':x['target_depth']}for x in first],'revisited_modules':[{'id':x['id'],'first_teaching_stage':x['primary_stage'],'target_depth':x['target_depth']}for x in revisit],'learner_completion':'unassessed','validation':{k:False for k in ['module_coverage_checked','markdown_checked','html_offline_checked','diagram_consistency_checked','lab_cases_checked','request_walkthrough_checked','intermediate_checkpoints_checked','clean_package_checked']},'artifacts':['guide.md','guide.html','stage-plan.md','stage-state.json','validation.md','architecture-after.md','lesson-ui.json','font-licenses.txt','../../progress/curriculum-map.json','../../progress/coverage-status.csv']+['labs/'+x.name for x in sorted((stage/'labs').iterdir()) if x.is_file() and x.suffix in ('.py','.js','.json')],'assumptions':ui.get('assumptions',['Workload and timing figures are illustrative; fixture services and logical clocks are not production measurements.']),'unchecked':['Production deployment, identity, TLS, hosted APIs, real broker/network failures, load/SLO measurements, and learner mastery.']}
 state['decisions']=['../../architecture/decisions/'+p.name for p in sorted((root/'architecture/decisions').glob(f'ADR-{n:03d}-*.md'))]
 statefile.write_text(json.dumps(state,indent=2)+'\n')
else:
 state=json.loads(statefile.read_text());state['status']='tested'
 for k in state['validation']:state['validation'][k]=True
 state['validation']['evidence']='validation.md'
 statefile.write_text(json.dumps(state,indent=2)+'\n')
 # Current architecture changes only after the new stage has been produced/tested.
 snapshot=(stage/'architecture-after.md').read_text().split('\n',1)[1]
 snapshot=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda match:'['+match[1]+']('+os.path.relpath((stage/match[2]).resolve(),(root/'architecture').resolve())+')',snapshot)
 (root/'architecture/current-system.md').write_text('# Current System: Enterprise AI Platform\n\n'+snapshot+'\n\nLatest guide: [Stage '+str(n)+'](../'+stage.relative_to(root).as_posix()+'/guide.md). Full verification: [report](../'+stage.relative_to(root).as_posix()+'/validation.md). Learner mastery remains unassessed.\n')
 with (root/'progress/coverage-status.csv').open(newline='') as f:r=csv.DictReader(f);fields=list(r.fieldnames);rows=list(r)
 for row in rows:
  if int(row['primary_stage'])==n:
   row.update({'authored_stage':str(n),'status':'authored_and_checked','artifact':stage.relative_to(root).as_posix()+'/guide.md','evidence':'Mapped-depth guide, runnable lab/tests, browser walkthrough, deterministic cases, clean package; see stage validation.','learner_status':'unassessed'})
 with (root/'progress/coverage-status.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
 readme='# Enterprise AI Platform Learning Workspace\n\nStages 1 through '+str(n)+' are authored and locally checked. Workload figures are illustrative; learner mastery and production readiness remain unassessed.\n\n'
 for s in m['stages']:
  if s['stage']<=n:readme+=f'- Stage {s["stage"]}: [{s["name"]}]({s["output_dir"]}/guide.html), [Markdown]({s["output_dir"]}/guide.md), [validation]({s["output_dir"]}/validation.md).\n'
 readme+='\nOpen any HTML directly in a browser: fonts, diagrams, and interactions are embedded. Python labs require Python 3.10+ with SQLite; JavaScript simulator checks additionally require Node. Run the commands in each guide. The dist archives preserve supporting files and prerequisite lessons. Production integrations and load testing are not implied by local tests.\n'
 (root/'README.md').write_text(readme)
 archive=root/f'dist/stage-{n:02d}-{stage.name[3:]}.zip';archive.parent.mkdir(exist_ok=True)
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
  for path in sorted(root.rglob('*')):
   if not path.is_file() or any(x in ('dist','.hallmark','__pycache__') for x in path.relative_to(root).parts):continue
   if path.suffix in ('.pyc','.sqlite','.db'):continue
   z.write(path,path.as_posix())
 archive.with_suffix('.sha256').write_text(hashlib.sha256(archive.read_bytes()).hexdigest()+'  '+archive.name+'\n')
 print('Recorded tested stage and built',archive)
