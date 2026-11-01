"""Authoring checks for full teaching parity, links, coverage, and stage UI data."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,sys
import markdown
stage=Path(sys.argv[1]);root=stage.parents[1]
class Reader(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.text=[];self.skip=0;self.assets=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag in ('style','script'):self.skip+=1
  if 'id' in d:self.ids.append(d['id'])
  if tag=='a' and 'href'in d:self.links.append(d['href'])
  if 'src'in d:self.assets.append(d['src'])
 def handle_endtag(self,tag):
  if tag in ('style','script'):self.skip-=1
 def handle_data(self,data):
  if not self.skip:self.text.append(data)
def plain(s):return re.sub(r'\s+',' ',s).strip()
source=(stage/'guide.md').read_text();page=(stage/'guide.html').read_text();actual=Reader();actual.feed(page);text=plain(''.join(actual.text))
rendered=markdown.markdown(source,extensions=['tables','fenced_code','toc'])
rendered=re.sub(r'<pre><code class="language-mermaid">.*?</code></pre>','',rendered,flags=re.S)
blocks=[]
for _,value in re.findall(r'<(p|li|td|th|h2|h3|h4|pre)\b[^>]*>(.*?)</\1>',rendered,re.S):
 r=Reader();r.feed(value);value=plain(''.join(r.text));assert value in text,value[:120];blocks.append(value)
assert len(blocks)>100
assert len(actual.ids)==len(set(actual.ids))
for link in actual.links:
 u=urlsplit(link)
 if u.scheme or u.netloc:continue
 if u.path:assert (stage/unquote(u.path)).is_file(),link
 else:assert unquote(u.fragment) in actual.ids,link
assert not actual.assets
assert page.count('<svg ')==3
assert len(re.findall(r'^## ',source,re.M))==5
assert source.count('<details>')>=2
assert not re.search(r'\{\{|\[FILL\]|\bTODO\b|\bTBD\b|lorem ipsum',source)
ui=json.loads((stage/'lesson-ui.json').read_text());m=json.loads((root/'progress/curriculum-map.json').read_text())
for module in m['modules']:
 if module['primary_stage']==ui['stage'] or ui['stage'] in module['revisit_stages']:assert module['id'] in source,module['id']
for b in ui['branches']:
 assert len(b['steps'])==len(ui['step_labels'])
 for x in b['steps']:
  assert all(len(x[k])>10 for k in ['owner','input','output','failure'])
assert 2<=len(ui['controls'])<=5
print(f'PASS: Stage {ui["stage"]}, {len(blocks)} teaching blocks, five phases, coverage, links, three SVGs, complete flow data.')
