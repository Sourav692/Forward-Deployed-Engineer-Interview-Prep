"""Signed local claim fixtures plus auditable trusted-context policy gates.

This envelope is NOT JWT/OIDC. Public fixture keys only. Production identity
must use a maintained verifier with issuer/audience/key/algorithm constraints.
"""
import base64,hashlib,hmac,json,sqlite3,uuid
from dataclasses import dataclass

FIXTURE_KEYS={'current':b'public-teaching-key-not-a-secret','next':b'public-rotation-fixture'}
def encode(value):return base64.urlsafe_b64encode(value).rstrip(b'=').decode()
def issue(claims,kid='current'):
 payload=encode(json.dumps({**claims,'kid':kid},sort_keys=True,separators=(',',':')).encode())
 return payload+'.'+encode(hmac.new(FIXTURE_KEYS[kid],payload.encode(),hashlib.sha256).digest())
def verify(token,now,audience='ai-app',keys=None):
 keys=FIXTURE_KEYS if keys is None else keys
 try:
  payload,signature=token.split('.')
  claims=json.loads(base64.b64decode(payload+'='*(-len(payload)%4),altchars=b'-_',validate=True))
  if not isinstance(claims,dict) or claims.get('kid') not in keys:raise ValueError()
  expected=encode(hmac.new(keys[claims['kid']],payload.encode(),hashlib.sha256).digest())
  if not hmac.compare_digest(signature,expected):raise ValueError()
  if claims.get('iss')!='fixture-idp' or claims.get('aud')!=audience:raise ValueError()
  if type(claims.get('exp')) not in (int,float) or not now<claims['exp']:raise ValueError()
  if claims.get('nbf',0)>now or not all(isinstance(claims.get(k),str) and claims[k] for k in ['tenant','sub']):raise ValueError()
  if not isinstance(claims.get('actions'),list) or not all(isinstance(a,str) for a in claims['actions']):raise ValueError()
  return Principal(claims['tenant'],claims['sub'],tuple(claims['actions']),claims.get('epoch'))
 except (ValueError,TypeError,KeyError,json.JSONDecodeError) as exc:raise PermissionError('invalid_identity') from exc
@dataclass(frozen=True)
class Principal:
 tenant:str
 user:str
 actions:tuple
 epoch:int

class Security:
 def __init__(self,knowledge):
  self.k=knowledge
  with self.k.db() as db:
   db.executescript('CREATE TABLE IF NOT EXISTS membership(tenant TEXT,user TEXT,epoch INTEGER,valid_until REAL,active INTEGER,PRIMARY KEY(tenant,user)); CREATE TABLE IF NOT EXISTS audit(event TEXT PRIMARY KEY,tenant TEXT,user TEXT,action TEXT,decision TEXT,refs TEXT);')
 def membership(self,tenant,user,epoch,valid_until,active=True):
  with self.k.db() as db:db.execute('INSERT INTO membership VALUES(?,?,?,?,?) ON CONFLICT(tenant,user) DO UPDATE SET epoch=excluded.epoch,valid_until=excluded.valid_until,active=excluded.active',(tenant,user,epoch,valid_until,int(active)))
 def context(self,token,hits,now,headers=None):
  # Caller headers never set tenant. The signed principal plus live membership do.
  principal=verify(token,now)
  with self.k.db() as db:
   member=db.execute('SELECT * FROM membership WHERE tenant=? AND user=?',(principal.tenant,principal.user)).fetchone()
   allowed=bool(member and member['active'] and member['epoch']==principal.epoch and now<member['valid_until'] and 'retrieve' in principal.actions)
  # Stage 3 rechecks resource versions/readers; hit text is never trusted.
  context=self.k.context(principal.tenant,principal.user,hits) if allowed else []
  with self.k.db() as db:
   decision='deny_scope' if not allowed else 'allow_context' if context else 'empty_context'
   # Record protected source identifiers, never the bearer or passage body.
   db.execute('INSERT INTO audit VALUES(?,?,?,?,?,?)',(str(uuid.uuid4()),principal.tenant,principal.user,'retrieve',decision,json.dumps([x['citation'] for x in context])))
  if not allowed:raise PermissionError('policy_denied')
  return context
 def egress(self,principal,provider,secret_ref):
  return 'generate' in principal.actions and provider=='approved-model' and secret_ref=='tenant/'+principal.tenant+'/provider'
