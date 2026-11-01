"""Render complete Markdown plus stage-specific offline interactions.

Authoring only: uv run --with markdown python tools/render_stage.py <stage-dir>
The resulting HTML has no Python, package, build, or network dependency.
"""
from pathlib import Path
import html
import json
import re
import sys
import markdown

stage=Path(sys.argv[1]);root=stage.parents[1]
ui=json.loads((stage/'lesson-ui.json').read_text())
source=(stage/'guide.md').read_text()
prior=(root/'stages/01-mvp/guide.html').read_text()
style=re.search(r'<style>(.*?)</style>',prior,re.S).group(1)
style=re.sub(r'^/\*.*?\*/\s*','',style,flags=re.S)
style='/* Hallmark · v2.0.0 · theme: Grid (repository) · shape: Long Document · hero: compact document header · signature: request state walkthrough · scope: app · genre: editorial */\n'+style
style+='''\nselect{font:inherit;color:var(--ink);background:var(--paper);border:1px solid var(--muted);min-height:48px;padding:.5rem;max-width:100%}.sim-result{min-height:7rem;font-variant-numeric:tabular-nums}.sim-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.sim-controls input{margin-top:.5rem}.sim-controls>label:first-child:nth-last-child(5),.sim-controls>label:first-child:nth-last-child(3){grid-column:1/-1}.walkthrough,.simulation{background:var(--surface);padding:1.5rem;margin-block:2rem}.flow-steps{list-style:none;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}.sim-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-block:1rem}.sim-result dt{font-weight:600}.sim-result dd{margin:0 0 1rem}.flow-steps>li:first-child:nth-last-child(7){grid-column:1/-1}@media(max-width:600px){.sim-controls,.flow-steps{grid-template-columns:minmax(0,1fr)}}@media print{.simulation,.walkthrough{display:none!important}}'''
for note in ui.get('style_notes',[]):style=style.replace('\n','\n'+note+'\n',1)
body=markdown.markdown(source,extensions=['fenced_code','tables','toc'])
body=re.sub(r'<h1.*?</h1>','',body,count=1,flags=re.S)

def svg(diagram,index):
    nodes=diagram['nodes'];height=90*len(nodes)+35;items=[]
    for n,node in enumerate(nodes):
        y=n*90+15
        items.append(f'<rect class="node" x="15" y="{y}" width="330" height="60"/><text x="180" y="{y+25}">{html.escape(node[0])}</text><text x="180" y="{y+46}">{html.escape(node[1])}</text>')
        if n<len(nodes)-1:items.append(f'<path class="flow" style="marker-end:url(#diagram-arrow-{index})" d="M180 {y+60}V{y+87}"/>')
    return f'''<figure><svg viewBox="0 0 360 {height}" style="max-width:30rem" role="img" aria-labelledby="diagram-title-{index} diagram-desc-{index}"><title id="diagram-title-{index}">{html.escape(diagram['title'])}</title><desc id="diagram-desc-{index}">{html.escape(diagram['description'])}</desc><defs><marker id="diagram-arrow-{index}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs>{''.join(items)}</svg><figcaption>{html.escape(diagram['description'])}</figcaption></figure>'''
for i,d in enumerate(ui['diagrams']):
    body=re.sub(r'<pre><code class="language-mermaid">.*?</code></pre>',lambda _:svg(d,i),body,count=1,flags=re.S)

def table(match):
    value=match.group(0);labels=re.findall(r'<th>(.*?)</th>',value,re.S)
    def row(match):
        ix=[0]
        def cell(match):
            label=re.sub('<[^>]+>','',labels[ix[0]]);ix[0]+=1
            return f'<td data-label="{html.escape(label,quote=True)}">{match.group(1)}</td>'
        return re.sub(r'<td>(.*?)</td>',cell,match.group(0),flags=re.S)
    value=re.sub(r'<tr>.*?</tr>',row,value,flags=re.S)
    return '<div class="table-scroll" tabindex="0" role="region" aria-label="Lesson table">'+value+'</div>'
body=re.sub(r'<table>.*?</table>',table,body,flags=re.S)
# Stable anchors intentionally shared across the separate offline files.
body=re.sub(r'id="request-walkthrough[^\"]*"','id="request-walkthrough"',body,count=1)
body=re.sub(r'id="lab[^\"]*"','id="lab"',body,count=1)
branches=''.join(f'<option value="{i}">{html.escape(branch["label"])}</option>' for i,branch in enumerate(ui['branches']))
steps=''.join(f'<li><button type="button" data-flow-step="{i}">{i+1}. {html.escape(label)}</button></li>' for i,label in enumerate(ui['step_labels']))
walk=f'''<div class="walkthrough" id="walkthrough-controls" hidden><label for="flow-case">Request outcome</label><select id="flow-case">{branches}</select><ol class="flow-steps" aria-label="Clickable request flow">{steps}</ol><div class="flow-navigation"><button id="flow-previous" type="button">Previous</button><button id="flow-next" type="button">Next</button><button id="flow-reset" type="button">Reset walkthrough</button></div><div role="status" aria-live="polite" aria-atomic="true"><h4 id="flow-title"></h4><dl>{''.join(f'<dt>{title}</dt><dd id="flow-{field}"></dd>' for field,title in [('owner','Responsible component'),('input','Input'),('output','Output and state'),('failure','Possible failure')])}</dl></div></div>'''
controls=[]
for control in ui['controls']:
    name=control['id'];label=html.escape(control['label'])
    if control['type']=='select':
        options=''.join(f'<option value="{v}">{html.escape(t)}</option>' for v,t in control['options'])
        controls.append(f'<label for="{name}">{label}<select id="{name}" data-param="{name}">{options}</select></label>')
    else:
        controls.append(f'<label for="{name}">{label}: <output id="{name}-value"></output><input id="{name}" data-param="{name}" type="range" min="{control["min"]}" max="{control["max"]}" step="{control["step"]}" value="{control["default"]}"></label>')
lab=f'''<div class="simulation" id="simulation-controls" hidden><h4>{html.escape(ui['lab_title'])}</h4><p>{html.escape(ui['lab_assumptions'])}</p><div class="sim-controls">{''.join(controls)}</div><div class="sim-actions"><button type="button" id="sim-reset">Reset experiment</button>{''.join(f'<button type="button" data-case="{i}">{html.escape(c["name"])}</button>' for i,c in enumerate(ui['cases']))}</div><dl id="sim-result" class="sim-result" role="status" aria-live="polite" aria-atomic="true"></dl></div>'''
for anchor,panel in [('request-walkthrough',walk),('lab',lab)]:
    pattern=rf'(<h[34] id="{anchor}">.*?</h[34]>)'
    body,count=re.subn(pattern,lambda m:m.group(0)+panel,body,count=1,flags=re.S)
    assert count==1,anchor
body=re.sub(r'(<h2\b)',r'</section><section class="learning-phase">\1',body)
body=body.replace('</section>','',1)+'</section>'
assert body.count('<section class="learning-phase">')==5
script=(stage/'labs/simulator.js').read_text()
script+='''\nconst config=JSON.parse(document.getElementById('lesson-config').textContent);
let step=0;const buttons=[...document.querySelectorAll('[data-flow-step]')],branch=document.getElementById('flow-case');
function renderFlow(){const item=config.branches[Number(branch.value)].steps[step];document.getElementById('flow-title').textContent=`Step ${step+1} of ${buttons.length}: ${config.step_labels[step]}`;for(const name of ['owner','input','output','failure'])document.getElementById('flow-'+name).textContent=item[name];buttons.forEach((b,i)=>{if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});document.getElementById('flow-previous').disabled=step===0;document.getElementById('flow-next').disabled=step===buttons.length-1;}
buttons.forEach((b,i)=>b.addEventListener('click',()=>{step=i;renderFlow()}));document.getElementById('flow-previous').onclick=()=>{step=Math.max(0,step-1);renderFlow()};document.getElementById('flow-next').onclick=()=>{step=Math.min(buttons.length-1,step+1);renderFlow()};document.getElementById('flow-reset').onclick=()=>{step=0;branch.value='0';renderFlow()};branch.onchange=()=>{step=0;renderFlow()};document.getElementById('walkthrough-controls').hidden=false;renderFlow();
function params(){const p={};for(const c of config.controls){const el=document.getElementById(c.id);p[c.id]=c.type==='select'?el.value:Number(el.value);const o=document.getElementById(c.id+'-value');if(o)o.value=String(p[c.id]);}return p;}
function renderSim(){const result=simulate(params()),dl=document.getElementById('sim-result');dl.replaceChildren();for(const [name,value]of Object.entries(result)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=String(value);dl.append(dt,dd);}}
function apply(values){for(const c of config.controls)document.getElementById(c.id).value=String(values[c.id]??c.default);renderSim();}
for(const el of document.querySelectorAll('[data-param]'))el.addEventListener('input',renderSim);document.getElementById('sim-reset').onclick=()=>apply({});document.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>apply(config.cases[Number(b.dataset.case)].params));document.getElementById('simulation-controls').hidden=false;apply({});'''
nav=''.join(f'<a href="#{slug}">{label}</a>' for slug,label in [('1-understand-the-problem','Understand the problem'),('2-learn-and-design','Learn and design'),('3-observe-and-experiment','Observe and experiment'),('4-think-like-a-staff-engineer','Think like a Staff engineer'),('5-validate-and-carry-forward','Validate and carry forward'),('request-walkthrough','Request walkthrough'),('lab','Experiment')])
serialized=json.dumps(ui).replace('<','\\u003c')
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Complete offline Staff AI system design lesson: {html.escape(ui['title'])}"><title>Stage {ui['stage']}: {html.escape(ui['title'])}</title><style>{style}</style></head><body><a class="skip" href="#content">Skip to content</a><nav class="top-nav" aria-label="Course"><a href="guide.md">Read the Markdown</a><a href="stage-plan.md">Stage plan</a></nav><header><h1>{html.escape(ui['title'])}</h1><p>{html.escape(ui['outcome'])}</p><a href="#request-walkthrough">Follow one request</a></header><div class="shell"><aside><p>Stage {ui['stage']} learning guide</p><nav aria-label="Learning phases">{nav}</nav><p>Illustrative workload.<br>Deterministic local exercises.<br>No paid services.</p></aside><main id="content"><article>{body}</article></main></div><footer><p>Educational baseline. <a href="validation.md">Verification and limitations</a>. <a href="font-licenses.txt">Embedded font licences</a>.</p></footer><script type="application/json" id="lesson-config">{serialized}</script><script>{script}</script></body></html>'''
(stage/'guide.html').write_text(page)
(stage/'font-licenses.txt').write_text((root/'stages/01-mvp/font-licenses.txt').read_text())
print('Rendered',stage)
