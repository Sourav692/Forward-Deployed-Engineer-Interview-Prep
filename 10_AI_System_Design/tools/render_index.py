"""Render the workspace landing page, index.html, from the curriculum map and stage records.

Authoring only: python3 tools/render_index.py
The page reuses the stage guides' reading system and embedded fonts, so it opens offline.
"""
from pathlib import Path
import collections
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
escape = html.escape
course = json.loads((ROOT / 'progress/curriculum-map.json').read_text())
overview = json.loads((ROOT / 'stages/00-enterprise-overview/stage-state.json').read_text())
prior = (ROOT / 'stages/01-mvp/guide.html').read_text()
style = re.search(r'<style>(.*?)</style>', prior, re.S)[1]
style = re.sub(r'/\* Hallmark.*?\*/\s*', '', style, flags=re.S).lstrip()
style = '''/* Hallmark · v2.0.0 · theme: Grid (repository) · shape: Index-First · hero: compact document header · signature: thirteen-stage route as a ruled index · scope: page · genre: editorial · typography: repository Inter and condensed Bricolage · offline embedded fonts */
/* Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V4 · weakest: E, an index page has no picture; the route's large stage numbers and customer pressures carry the page */
/* Hallmark · copy: source · stage names, pressures and counts come from progress/curriculum-map.json; Stage 0 wording from README.md */
''' + style
style += '''
.index-page{max-width:var(--container);margin:auto;padding-inline:var(--gutter)}
.index-page header{padding-inline:0}
.index-page h1{overflow-wrap:break-word;min-width:0;max-width:16ch}
.hero-actions{display:flex;flex-wrap:wrap;align-items:center;gap:1rem 2rem;margin-top:2rem}
.button{display:inline-block;background:var(--accent);color:var(--on-accent);padding:.8rem 1.4rem;min-height:48px;text-decoration:none;font-weight:600}
.button:hover{background:var(--ink);color:var(--paper)}
.button:active{transform:translateY(1px)}
.button:focus-visible,.route a:focus-visible,.index-page a:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.index-section{border-top:3px solid var(--ink);padding-block:2.5rem 4rem}
.index-section h2{overflow-wrap:break-word;min-width:0;margin-top:0}
.route{list-style:none;margin:0;padding:0}
.route li,.phases li{max-width:none}
.top-nav span{display:flex;flex-wrap:wrap;gap:1.5rem}
.route li{display:grid;grid-template-columns:7rem minmax(0,1fr) minmax(0,14rem);gap:1rem var(--gap);padding-block:1.5rem;border-bottom:1px solid var(--line);align-items:start}
.route .number{font-variant-numeric:tabular-nums;font-family:var(--font-display);font-size:clamp(2.5rem,5vw,4rem);line-height:.9;color:var(--accent)}
.route h3{margin:0 0 .4rem;font-size:1.5rem;overflow-wrap:break-word;min-width:0}
.route p{margin:0;max-width:62ch}
.route .modules{color:var(--muted);font-size:.9rem;margin-top:.4rem}
.route ul{list-style:none;margin:0;padding:0;font-size:.95rem}
.route ul li{display:block;padding:0 0 .35rem;border:0}
.phases{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--gap)}
.phases li{border-top:1px solid var(--line);padding-top:1rem;font-size:1.05rem}
.phases span{display:block;font-family:var(--font-display);font-size:2rem;color:var(--accent)}
.figures{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--gap);margin:0 0 2rem}
.figures div{border-top:1px solid var(--line);padding-top:1rem}
.figures dt{font-variant-numeric:tabular-nums;font-size:.95rem;color:var(--muted)}
.figures dd{font-variant-numeric:tabular-nums;margin:0;font-family:var(--font-display);font-size:clamp(3rem,7vw,5.5rem);line-height:1}
.index-section > p{max-width:65ch}
@media(max-width:900px){.route li{grid-template-columns:4.5rem minmax(0,1fr)}.route li > ul{grid-column:2}.phases{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:520px){.phases,.figures{grid-template-columns:minmax(0,1fr)}}
@media(prefers-reduced-motion:reduce){.button:active{transform:none}}
@media print{.hero-actions{display:none}.route li{break-inside:avoid}}
'''

modules = collections.Counter(m['primary_stage'] for m in course['modules'])
stages = [{'number': 0, 'name': overview['title'], 'dir': 'stages/00-enterprise-overview',
           'pressure': 'Alice’s supplier journey, the target architecture and the twelve-stage route.'}]
stages += [{'number': s['stage'], 'name': s['name'], 'dir': s['output_dir'], 'pressure': s['trigger']} for s in course['stages']]


def row(stage):
    n, folder = stage['number'], stage['dir']
    archive = f'dist/stage-{n:02d}-{Path(folder).name[3:]}.zip'
    links = [f'<li><a href="{folder}/guide.md">Markdown</a></li>', f'<li><a href="{folder}/validation.md">Validation</a></li>']
    if (ROOT / archive).is_file():
        links.append(f'<li><a href="{archive}">ZIP</a></li>')
    count = modules.get(n, 0)
    taught = f'<p class="modules">{count} module{"s" if count != 1 else ""} first taught</p>' if count else '<p class="modules">Orientation, no new modules</p>'
    return (f'<li><span class="number" aria-hidden="true">{n:02d}</span><div><h3><a href="{folder}/guide.html">'
            f'<span class="visually-hidden">Stage {n}: </span>{escape(stage["name"])}</a></h3><p>{escape(stage["pressure"])}</p>{taught}</div>'
            f'<ul aria-label="Stage {n} files">{"".join(links)}</ul></li>')


phases = ['Understand the problem', 'Learn and design', 'Observe and experiment', 'Think like a Staff engineer', 'Validate and carry forward']
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Offline course index: one enterprise AI platform designed across twelve stages."><title>Enterprise AI Platform: Staff AI system design course</title><style>{style}
.visually-hidden{{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}}</style></head><body>
<a class="skip" href="#content">Skip to content</a>
<nav class="top-nav" aria-label="Course"><a href="index.html">Enterprise AI Platform</a><span><a href="README.md">README</a> <a href="architecture/current-system.md">Current architecture</a></span></nav>
<div class="index-page">
<header><h1>One AI platform, built in twelve stages</h1><p>A supplier workflow grows from one hosted model to regional cells.</p><div class="hero-actions"><a class="button" href="stages/00-enterprise-overview/guide.html">Start with Stage 0</a><a href="#route">Browse the stages</a></div></header>
<main id="content">
<section class="index-section" id="route" aria-labelledby="route-title"><h2 id="route-title">The route</h2><ol class="route">{''.join(row(s) for s in stages)}</ol></section>
<section class="index-section" aria-labelledby="phases-title"><h2 id="phases-title">How a stage teaches</h2><ol class="phases">{''.join(f'<li><span aria-hidden="true">{i}</span>{p}</li>' for i, p in enumerate(phases, 1))}</ol></section>
<section class="index-section" aria-labelledby="scope-title"><h2 id="scope-title">What the route covers</h2><dl class="figures"><div><dt>Stages</dt><dd>{course['stage_count']}</dd></div><div><dt>Domains</dt><dd>{course['domain_count']}</dd></div><div><dt>Modules</dt><dd>{course['module_count']}</dd></div></dl><p>Each module is taught once, then revisited where the system needs it. The <a href="progress/coverage-status.csv">coverage record</a> lists what was written and checked, not what you have learned.</p></section>
<section class="index-section" aria-labelledby="offline-title"><h2 id="offline-title">Run it offline</h2><p>Open any guide in a browser; fonts, diagrams and labs are embedded. Python labs need Python 3.10 or later, simulator checks need Node.</p></section>
</main></div>
<footer><p>Workload, cost and timing figures are illustrative. <a href="README.md">README</a>. <a href="progress/curriculum-map.json">Curriculum map</a>. <a href="stages/00-enterprise-overview/font-licenses.txt">Embedded font licences</a>.</p></footer>
</body></html>
'''
(ROOT / 'index.html').write_text(page)
print('Rendered', ROOT / 'index.html')
