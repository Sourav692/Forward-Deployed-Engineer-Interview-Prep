"""Clean extraction: verify links/artifacts and run Python tests sequentially."""
import json,re,subprocess,sys,tempfile,zipfile
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
class Reader(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id'in d:self.ids.append(d['id'])
  if tag=='a' and 'href'in d:self.links.append(d['href'])
with tempfile.TemporaryDirectory(prefix='ai-stage-package-') as td:
 target=Path(td).resolve()
 with zipfile.ZipFile(sys.argv[1]) as z:
  assert z.testzip() is None
  for name in z.namelist():assert (target/name).resolve().is_relative_to(target),name
  z.extractall(target)
 root=target/'10_AI_System_Design'
 def check(base,link):
  u=urlsplit(link)
  if u.scheme or u.netloc:return
  file=(base/unquote(u.path)).resolve() if u.path else None
  if file:assert file.is_relative_to(target) and file.is_file(),(base,link)
  if u.fragment and file and file.suffix=='.html':
   r=Reader();r.feed(file.read_text());assert unquote(u.fragment)in r.ids,link
 for page in root.rglob('guide.html'):
  r=Reader();r.feed(page.read_text());assert len(r.ids)==len(set(r.ids))
  for link in r.links:
   check(page.parent,link)
   if link.startswith('#'):assert link[1:]in r.ids,link
 for doc in root.rglob('*.md'):
  for link in re.findall(r'\[[^\]]+\]\(([^)]+)\)',doc.read_text()):check(doc.parent,link)
 for state in sorted(root.glob('stages/*/stage-state.json')):
  for artifact in json.loads(state.read_text())['artifacts']:check(state.parent,artifact)
 for test in sorted(root.glob('stages/*/labs/test_*.py')):
  result=subprocess.run([sys.executable,str(test)],cwd=target,capture_output=True,text=True,timeout=60)
  assert result.returncode==0,result.stdout+result.stderr
  print('PASS:',test.relative_to(root))
 print('PASS: clean archive artifacts, HTML/Markdown links, anchors, sequential Python labs.')
