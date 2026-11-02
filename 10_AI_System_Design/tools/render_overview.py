"""Render Stage 0 as a standalone orientation, with no artificial simulation.

Authoring only: uv run --with markdown python tools/render_overview.py
The page reuses the established reading system; all fonts and code are embedded.
"""
from pathlib import Path
import html
import json
import re
import markdown

ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / 'stages/00-enterprise-overview'
data = json.loads((STAGE / 'overview.json').read_text())
source = (STAGE / 'guide.md').read_text()
prior = (ROOT / 'stages/01-mvp/guide.html').read_text()
style = re.search(r'<style>(.*?)</style>', prior, re.S)[1]
style = re.sub(r'/\* Hallmark.*?\*/\s*', '', style, flags=re.S).lstrip()
style = '''/* Hallmark · v2.0.0 · theme: Grid (repository) · shape: Long Document · hero: compact document header · signature: four-path enterprise architecture with stage focus · scope: app · genre: editorial */
/* Hallmark · pre-emit critique: P4 H4 E4 S5 R4 V3 · weakest: V, long teaching prose can blur the system; the connected architecture lanes and request states make the supplier workflow explicit */
/* Hallmark · waive 79 · compact orientation header followed immediately by the customer story · the enterprise overview is a reading document whose teaching starts in the first screen */
/* Hallmark · waive 77 · the final phase contains a stage index, recall and source evidence inside the reading column · the enterprise orientation preserves the established course reading measure */
/* Hallmark · waive 44c · short header followed by the five-phase enterprise overview · readers start the supplier use case without a promotional full-height hero */
/* Hallmark · answered F1 · ASCII quotes remain in exact identifiers and source expressions; explanatory prose uses typographic punctuation */
/* Hallmark · finish-review: in-thread · stage-link wrapping resolved; model lifecycle order corrected; existing reading layout retained */
/* Hallmark · copy: verbatim · source: full enterprise orientation required by user, preserving Markdown and HTML teaching equivalence */
''' + style
style += '''
.architecture-lanes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--gap);margin-block:2rem}.architecture-lane{min-width:0;border-top:3px solid var(--ink)}.architecture-lane h4{font-size:1.5rem;margin-block:1rem}.architecture-lane ol,.architecture-lane ul{padding-left:1.5rem}.map-node{padding:.75rem .75rem .75rem .5rem;border-bottom:1px solid var(--line);border-left:3px solid transparent}.map-node strong{display:block;font-weight:600}.map-node p{font-size:.95rem;margin:.3rem 0}.map-node.is-focus{border-left-color:var(--accent);background:var(--surface)}.map-node.is-focus::before{content:'Selected stage focus';display:block;color:var(--accent);font-size:.8rem}.map-tools,.walkthrough{padding:1.5rem;background:var(--surface);margin-block:1.5rem}.map-status{min-height:5rem}.map-actions,.flow-navigation{display:flex;align-items:center;flex-wrap:wrap;gap:.5rem;margin-block:1rem}.walkthrough select,.map-tools select{font:inherit;color:var(--ink);background:var(--paper);border:1px solid var(--muted);min-height:48px;padding:.5rem;width:100%;max-width:100%}.flow-steps{list-style:none;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}.flow-steps li:last-child{grid-column:1/-1}.flow-steps button{width:100%;text-align:left}.walkthrough dl{min-height:18rem}.walkthrough dt{font-weight:600}.walkthrough dd{margin:0 0 1rem}.map-tools button,.flow-navigation button,.flow-steps button{min-height:48px}.region-diagram-scroll{overflow-x:auto;max-width:100%}.region-diagram-scroll svg{min-width:620px}.diagram-steps{max-width:32rem}.diagram-steps text{font-family:var(--font-body)}a[href*='architecture/decisions/']{white-space:nowrap}
@media(max-width:700px){.architecture-lanes,.flow-steps{grid-template-columns:minmax(0,1fr)}.walkthrough,.map-tools{padding:1rem}.walkthrough dl{min-height:0}}
@media print{.map-tools,.walkthrough{display:none!important}.architecture-lanes{display:block}.architecture-lane{break-inside:auto}.map-node.is-focus{background:transparent;border-left-color:transparent}.map-node.is-focus::before{display:none}}
'''
escape = html.escape
body = markdown.markdown(source, extensions=['fenced_code', 'tables', 'toc'])
body = re.sub(r'<h1.*?</h1>', '', body, count=1, flags=re.S)


def steps_svg(title, description, nodes, number):
    """Focused vertical diagrams stay readable on phones and have a full text alternative."""
    height = len(nodes) * 90 + 25
    parts = []
    for index, (name, note) in enumerate(nodes):
        y = index * 90 + 10
        parts.append(f'<rect class="node" x="10" y="{y}" width="340" height="60"/><text x="180" y="{y+25}">{escape(name)}</text><text x="180" y="{y+46}">{escape(note)}</text>')
        if index < len(nodes) - 1:
            parts.append(f'<path class="flow" d="M180 {y+60}V{y+86}" style="marker-end:url(#arrow-{number})"/>')
    return f'<figure class="diagram-steps"><svg viewBox="0 0 360 {height}" role="img" aria-labelledby="svg-title-{number} svg-desc-{number}"><title id="svg-title-{number}">{escape(title)}</title><desc id="svg-desc-{number}">{escape(description)}</desc><defs><marker id="arrow-{number}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs>{"".join(parts)}</svg><figcaption>{escape(description)}</figcaption></figure>'


lanes = []
for lane in data['lanes']:
    nodes = ''.join(f'<li class="map-node" data-map-node="{node["id"]}" data-stages="{",".join(map(str,node["stages"]))}"><strong>{escape(node["title"])}</strong><p>{escape(node["description"])}</p></li>' for node in lane['nodes'])
    list_tag = 'ul' if lane['id'] == 'control' else 'ol'
    lanes.append(f'<section class="architecture-lane" aria-labelledby="lane-{lane["id"]}"><h4 id="lane-{lane["id"]}">{escape(lane["title"])}</h4><{list_tag}>{nodes}</{list_tag}><p>{escape(lane["connection"])}</p></section>')
options = '<option value="0">Show the whole target</option>' + ''.join(f'<option value="{s["number"]}">Stage {s["number"]}: {escape(s["title"])}</option>' for s in data['stages'])
map_panel = f'''<div class="map-tools" id="map-controls" hidden><label for="stage-view">Highlight roles introduced or substantially changed in a stage</label><select id="stage-view">{options}</select><div class="map-actions"><button id="map-reset" type="button">Reset architecture map</button><a id="stage-guide" href="../01-mvp/guide.html">Start Stage 1</a></div><p class="map-status" id="stage-summary" role="status" aria-live="polite" aria-atomic="true"></p></div>'''
architecture = f'<figure id="target-map"><figcaption>The whole target: customer requests inside a tenant-approved regional data boundary, supplied by knowledge, quality and platform paths. Hosted providers remain separately approved external processing boundaries.</figcaption>{map_panel}<div class="architecture-lanes">{"".join(lanes)}</div></figure>'

# The regional drawing has sibling US and EU cells: no EU content flow enters US-home.
regional = '''<figure><div class="region-diagram-scroll" tabindex="0" role="region" aria-label="Regional architecture; scroll horizontally on narrow screens"><svg viewBox="0 0 620 440" role="img" aria-labelledby="region-title region-desc"><title id="region-title">Approved regional placement</title><desc id="region-desc">An opaque placement directory selects EU cells for A/B and US-home for C. EU-primary copies to EU-secondary only. A promotion gate protects EU recovery; there is no EU-to-US data replication edge.</desc><defs><marker id="region-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><rect class="node" x="135" y="10" width="350" height="60"/><text x="310" y="35">Opaque placement directory</text><text x="310" y="56">No customer content in global control</text><path class="flow" style="marker-end:url(#region-arrow)" d="M245 70V90H155V115"/><path class="flow" style="marker-end:url(#region-arrow)" d="M375 70V90H465V115"/><rect class="node" x="15" y="120" width="280" height="60"/><text x="155" y="146">EU-primary</text><text x="155" y="167">Tenant A and Tenant B</text><rect class="node" x="325" y="120" width="280" height="60"/><text x="465" y="146">US-home</text><text x="465" y="167">Tenant C only</text><path class="flow" style="marker-end:url(#region-arrow)" d="M155 180V235"/><text x="155" y="215">EU-only async copies</text><rect class="node" x="15" y="240" width="280" height="60"/><text x="155" y="266">EU-secondary</text><text x="155" y="287">Eligible recovery target</text><path class="flow" style="marker-end:url(#region-arrow)" d="M155 300V355"/><rect class="node" x="15" y="360" width="590" height="60"/><text x="310" y="386">Verified promotion gate</text><text x="310" y="407">Fence, policy, audit, artifacts, lag and capacity</text></svg></div><figcaption>A/B data remains in EU cells; C uses US-home. The EU secondary is a recovery target, not an automatically active second writer.</figcaption></figure>'''
diagrams = [steps_svg('Before any platform exists', 'Alice manually finds policy, copies text into a drafting tool, and saves a reply. Stage 1 starts from requirements.', [('Alice’s supplier question','No enterprise API or saved-history service'),('Find and copy policy text','Manual permission and freshness handling'),('Draft and save manually','No implemented enterprise platform')],0), architecture, regional, steps_svg('Alice’s target request sequence', 'Identify and place; inspect and admit; gather current permitted evidence; select and reserve; generate; commit; reopen and observe. Denial or unknown outcomes stop the success path.', [(s['label'], ['Trusted tenant and allowed region','Original operation and bounded work','Current permitted source versions','Approved route and fresh budgets','Known result or uncertain outcome','Commit before saved-success response','Scoped replay and outcome evidence'][i]) for i,s in enumerate(data['branches'][0]['steps'])],3)]
for diagram in diagrams:
    body, count = re.subn(r'<pre><code class="language-mermaid">.*?</code></pre>', lambda _: diagram, body, count=1, flags=re.S)
    assert count == 1


def responsive_table(match):
    value = match[0]
    labels = re.findall(r'<th>(.*?)</th>', value, re.S)
    def row(match):
        index = [0]
        def cell(match):
            label = re.sub('<[^>]+>', '', labels[index[0]])
            index[0] += 1
            return f'<td data-label="{escape(label,quote=True)}">{match[1]}</td>'
        return re.sub(r'<td>(.*?)</td>', cell, match[0], flags=re.S)
    value = re.sub(r'<tr>.*?</tr>', row, value, flags=re.S)
    return '<div class="table-scroll" tabindex="0" role="region" aria-label="Overview table">' + value + '</div>'


body = re.sub(r'<table>.*?</table>', responsive_table, body, flags=re.S)
body = re.sub(r'id="follow-alices-request-from-start-to-finish"', 'id="request-walkthrough"', body, count=1)
# The typographic apostrophe is removed differently by some Markdown releases.
if 'id="request-walkthrough"' not in body:
    body = re.sub(r'(<h3 id=")[^"]*(">Follow Alice.*?</h3>)',r'\1request-walkthrough\2',body,count=1)
branches = ''.join(f'<option value="{i}">{escape(b["label"])}</option>' for i,b in enumerate(data['branches']))
buttons = ''.join(f'<li><button type="button" data-flow-step="{i}">{i+1}. {escape(label)}</button></li>' for i,label in enumerate(data['step_labels']))
walk = f'''<div class="walkthrough" id="walkthrough-controls" hidden><label for="flow-case">Request outcome</label><select id="flow-case">{branches}</select><ol class="flow-steps" aria-label="Request steps">{buttons}</ol><div class="flow-navigation"><button id="flow-previous" type="button">Previous</button><button id="flow-next" type="button">Next</button><button id="flow-reset" type="button">Reset walkthrough</button></div><div role="status" aria-live="polite" aria-atomic="true"><h4 id="flow-title"></h4><dl>{''.join(f'<dt>{label}</dt><dd id="flow-{key}"></dd>' for key,label in [('owner','Responsible component'),('input','Input'),('output','Output and state'),('failure','Failure or limit')])}</dl></div></div>'''
body,count = re.subn(r'(<h3 id="request-walkthrough">.*?</h3>)',lambda m:m[0]+walk,body,count=1,flags=re.S)
assert count == 1
body = re.sub(r'(<h2\b)',r'</section><section class="learning-phase">\1',body)
body = body.replace('</section>','',1) + '</section>'
assert body.count('<section class="learning-phase">') == 5
script = '''
const data=JSON.parse(document.getElementById('overview-config').textContent);
const stageView=document.getElementById('stage-view'),nodes=[...document.querySelectorAll('[data-map-node]')];
function renderMap(){const number=Number(stageView.value),stage=data.stages.find(s=>s.number===number),focused=[];for(const node of nodes){const selected=number>0&&node.dataset.stages.split(',').map(Number).includes(number);node.classList.toggle('is-focus',selected);if(selected)focused.push(node.querySelector('strong').textContent)}const link=document.getElementById('stage-guide');link.href=stage?stage.path:data.stages[0].path;link.textContent=stage?'Open Stage '+number:'Start Stage 1';document.getElementById('stage-summary').textContent=stage?'Stage '+number+': '+stage.title+'. Pressure: '+stage.pressure+' Focus: '+focused.join('; ')+'. All other roles remain visible.':'Whole target shown. Select a stage to connect its customer pressure to the highlighted roles. The map is a preview, not a deployed system.';}
stageView.addEventListener('change',renderMap);document.getElementById('map-reset').addEventListener('click',()=>{stageView.value='0';renderMap()});document.getElementById('map-controls').hidden=false;renderMap();
let step=0;const branch=document.getElementById('flow-case'),buttons=[...document.querySelectorAll('[data-flow-step]')];
function renderFlow(){const item=data.branches[Number(branch.value)].steps[step];document.getElementById('flow-title').textContent='Step '+(step+1)+' of '+buttons.length+': '+data.step_labels[step];for(const field of ['owner','input','output','failure'])document.getElementById('flow-'+field).textContent=item[field];buttons.forEach((button,i)=>{if(i===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});document.getElementById('flow-previous').disabled=step===0;document.getElementById('flow-next').disabled=step===buttons.length-1;}
buttons.forEach((button,i)=>button.addEventListener('click',()=>{step=i;renderFlow()}));document.getElementById('flow-previous').addEventListener('click',()=>{step=Math.max(0,step-1);renderFlow()});document.getElementById('flow-next').addEventListener('click',()=>{step=Math.min(buttons.length-1,step+1);renderFlow()});document.getElementById('flow-reset').addEventListener('click',()=>{step=0;branch.value='0';renderFlow()});branch.addEventListener('change',()=>{step=0;renderFlow()});document.getElementById('walkthrough-controls').hidden=false;renderFlow();
'''
nav = ''.join(f'<a href="#{anchor}">{label}</a>' for anchor,label in [('1-understand-the-problem','Customer and requirements'),('2-learn-and-design','Target architecture'),('3-observe-and-experiment','End-to-end flows'),('4-think-like-a-staff-engineer','Guarantees and limits'),('5-validate-and-carry-forward','The twelve-stage route')])
serialized = json.dumps(data, ensure_ascii=False).replace('<','\\u003c')
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Stage 0: the enterprise supplier use case, target requirements, complete architecture, customer journey, and twelve-stage learning map."><title>Stage 0: Enterprise Use Case and Target Architecture</title><style>{style}</style></head><body><a class="skip" href="#content">Skip to content</a><nav class="top-nav" aria-label="Course"><a href="guide.md">Read the Markdown</a><a href="../01-mvp/guide.html">Continue to Stage 1</a></nav><header><h1>Enterprise AI, End to End</h1><p>Follow Alice’s supplier workflow through the target architecture.</p><a href="#target-map">Explore the whole architecture</a></header><div class="shell"><aside><p>Stage 0 orientation</p><nav aria-label="Orientation contents">{nav}<a href="#target-map">Architecture map</a><a href="#request-walkthrough">Request walkthrough</a></nav><p>Read before Stage 1.<br>Illustrative requirements.<br>No model or cloud execution.</p></aside><main id="content"><article>{body}</article></main></div><footer><p><a href="validation.md">Verification and limits</a>. <a href="font-licenses.txt">Embedded font licences</a>. <a href="stage-plan.md">Orientation plan</a>.</p></footer><script type="application/json" id="overview-config">{serialized}</script><script>{script}</script></body></html>'''
(STAGE / 'guide.html').write_text(page)
(STAGE / 'font-licenses.txt').write_text((ROOT / 'stages/01-mvp/font-licenses.txt').read_text())
print('Rendered',STAGE)
