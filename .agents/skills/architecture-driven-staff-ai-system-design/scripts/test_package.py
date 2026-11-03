#!/usr/bin/env python3
"""Self-check skill source, install layouts and offline demo (Python stdlib)."""
import pathlib,sys,subprocess,json,re
root=pathlib.Path(__file__).resolve().parents[1]
required=['SKILL.md','README.md','references/curriculum-map.json','references/coverage-matrix.csv','references/stage-contracts.md','templates/stage-lesson.md','templates/html-shell.html','templates/adr.md','examples/stage-05-traffic-simulation.html']
required += ['references/review-workflow.md','references/review-rubric.md','references/lesson-quality-contract.md','templates/module-evidence.md','templates/stage-review.md','templates/improvement-plan.md','scripts/audit_stage.py','scripts/test_audit_stage.py']
issues=[f'Missing {x}' for x in required if not (root/x).is_file()]
front=(root/'SKILL.md').read_text(encoding='utf-8')
if not re.match(r'^---\nname: [a-z0-9-]+\ndescription: .+\n---\n',front):issues.append('SKILL.md frontmatter invalid')
html=(root/'examples/stage-05-traffic-simulation.html').read_text(encoding='utf-8')
for needle in ['type="range"','id="reset"','addEventListener','<svg','aria-live','<table']:
 if needle not in html:issues.append('HTML lab lacks '+needle)
if 'src="https://' in html or 'href="https://' in html:issues.append('Offline HTML example has external dependency')
r=subprocess.run([sys.executable,str(root/'scripts/validate_skill.py')],capture_output=True,text=True)
if r.returncode:issues.append('Curriculum validation failed: '+r.stdout+r.stderr)
r=subprocess.run([sys.executable,str(root/'scripts/test_audit_stage.py')],capture_output=True,text=True)
if r.returncode:issues.append('Review audit behavior failed: '+r.stdout+r.stderr)
if issues:
 print('FAIL\n'+'\n'.join(issues));sys.exit(1)
print('PASS: skill layout, YAML frontmatter, 12/18/56 curriculum offline demonstration and read-only review audit checks')
