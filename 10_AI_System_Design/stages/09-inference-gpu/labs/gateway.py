"""Approved-route fixture integrating prior security, release and budget slices.

Transport is injected and deterministic. No endpoint, model, tokeniser or GPU runs.
"""
from pathlib import Path
import json,sys,uuid,sqlite3
for previous in ['05-overload-fairness','06-enterprise-security','07-reliability-consistency','08-evaluation-releases']:sys.path.insert(0,str(Path(__file__).resolve().parents[2]/previous/'labs'))
from security import verify
from reliability import connection
class UnknownProvider(Exception):pass
class Gateway:
 def __init__(self,path,security,gate,releases,registry,transport):
  self.path=path;self.security=security;self.gate=gate;self.releases=releases;self.registry=registry;self.transport=transport
  with connection(path) as db:db.execute('CREATE TABLE IF NOT EXISTS inference_ops(tenant TEXT,user TEXT,key TEXT,payload TEXT,id TEXT,bundle TEXT,hits TEXT,state TEXT,answer TEXT,PRIMARY KEY(tenant,user,key))')
 def run(self,token,key,prompt,hits,now=1,input_tokens=1000,output_cap=300):
  principal=verify(token,now)
  if 'generate' not in principal.actions:raise PermissionError('generation_action_required')
  if not isinstance(key,str) or not key.strip() or len(key)>100 or not isinstance(prompt,str) or not prompt.strip() or len(prompt)>4000 or type(input_tokens) is not int or input_tokens<=0 or type(output_cap) is not int or output_cap<=0:raise ValueError('invalid_generation_envelope')
  payload=json.dumps({'prompt':prompt,'output_cap':output_cap},sort_keys=True)
  with connection(self.path) as db:old=db.execute('SELECT * FROM inference_ops WHERE tenant=? AND user=? AND key=?',(principal.tenant,principal.user,key)).fetchone()
  if old:
   if old['payload']!=payload:raise ValueError('key_conflict')
   original=json.loads(old['hits']);current=self.security.context(token,original,now)
   if not current or len(current)!=len(original):raise PermissionError('original_evidence_no_longer_allowed')
   return {'id':old['id'],'state':old['state'],'bundle':old['bundle'],'answer':old['answer']}
  context=self.security.context(token,hits,now)
  if not context:raise PermissionError('no_authorised_evidence')
  bundle=self.releases.route(principal.tenant,principal.user);profile=self.registry.get(bundle)
  if not profile or not profile['ready'] or not profile['private']:raise PermissionError('route_not_approved_ready_or_private')
  if not self.security.egress(principal,profile['provider'],'tenant/'+principal.tenant+'/provider'):raise PermissionError('egress_denied')
  if input_tokens+output_cap>profile['max_context'] or output_cap>profile['max_output']:raise ValueError('model_context_or_output_limit')
  allowed={c['citation']for c in context}
  op=str(uuid.uuid4());refs=[{k:h[k]for k in ['doc','version','chunk']}for h in hits if f"{h['doc']}:v{h['version']}:c{h['chunk']}" in allowed]
  with connection(self.path) as db:
   try:db.execute("INSERT INTO inference_ops VALUES(?,?,?,?,?,?,?,'prepared',NULL)",(principal.tenant,principal.user,key,payload,op,bundle,json.dumps(refs)))
   except sqlite3.IntegrityError:
    # A racing insertion never grants another provider call.
    raise ValueError('operation_already_reserved')
  grant=self.gate.reserve(principal.tenant,principal.user,key,payload,input_tokens+output_cap,now,now+4)
  if grant!='accepted':
   self._state(principal,key,'blocked',None);return {'id':op,'state':'blocked','reason':grant,'bundle':bundle,'answer':None}
  self._state(principal,key,'dispatching',None)
  try:answer=self.transport(profile,context,prompt)
  except UnknownProvider:
   self._state(principal,key,'unknown',None);self.gate.settle(principal.tenant,principal.user,key,'unknown')
   return {'id':op,'state':'unknown','bundle':bundle,'answer':None}
  self._state(principal,key,'completed',answer)
  self.gate.settle(principal.tenant,principal.user,key,'completed')
  return {'id':op,'state':'completed','bundle':bundle,'answer':answer}
 def _state(self,p,key,state,answer):
  with connection(self.path) as db:db.execute('UPDATE inference_ops SET state=?,answer=? WHERE tenant=? AND user=? AND key=?',(state,answer,p.tenant,p.user,key))
