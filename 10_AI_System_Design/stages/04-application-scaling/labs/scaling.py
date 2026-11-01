"""Bounded immutable-passage cache with a live policy/version gate on every use."""
from collections import OrderedDict
import json
import threading

class PassageCache:
 def __init__(self,capacity=2,ttl=30):
  if capacity<1 or ttl<=0:raise ValueError('positive cache bounds required')
  self.capacity=capacity;self.ttl=ttl;self.entries=OrderedDict();self.lock=threading.RLock();self.unavailable=False
  self.source_reads=0;self.policy_reads=0;self.hits=0
 def resolve(self,knowledge,tenant,user,hit,now):
  self.policy_reads+=1
  with knowledge.db() as db:
   row=db.execute('SELECT * FROM documents WHERE tenant=? AND doc=?',(tenant,hit['doc'])).fetchone()
   if not row or row['deleted'] or row['version']!=int(hit['version']) or user not in json.loads(row['readers']):return None
   key=(tenant,hit['doc'],int(hit['version']),int(hit['chunk']))
   with self.lock:
    item=None if self.unavailable else self.entries.get(key)
    if item and now<item[0]+self.ttl:
     self.entries.move_to_end(key);self.hits+=1;return dict(item[1])
    self.entries.pop(key,None)
   self.source_reads+=1
   stored=db.execute('SELECT text FROM search WHERE tenant=? AND doc=? AND version=? AND chunk=?',key).fetchone()
   if not stored:return None
   value={'citation':f'{key[1]}:v{key[2]}:c{key[3]}','text':stored['text']}
  if not self.unavailable:
   with self.lock:
    self.entries[key]=(now,value)
    while len(self.entries)>self.capacity:self.entries.popitem(last=False)
  return dict(value)

def capacity(replicas,hit_percent,offered,provider):
 if not 1<=replicas<=8 or not 0<=hit_percent<=100 or offered<0 or provider<=0:raise ValueError('invalid model input')
 app=replicas*0.7/0.025
 reads=2+4*(1-hit_percent/100)
 database=500/reads
 limits={'application':app,'database':database,'provider':provider}
 bottleneck=min(limits,key=limits.get);planned=limits[bottleneck]
 return {'Planned capacity (RPS)':round(planned,2),'Limiting budget':bottleneck,'Database demand (queries/s)':round(offered*reads,2),'Unserved offered rate (RPS)':round(max(0,offered-planned),2)}
