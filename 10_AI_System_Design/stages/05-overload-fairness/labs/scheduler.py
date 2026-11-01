"""Deterministic finite-burst scheduling, equal one-second service per job."""
from collections import deque

def simulate(policy='wrr',burst=30,capacity=3,retries=0,deadline=4):
 if policy not in ('fifo','priority','rr','wrr') or not 0<=burst<=60 or not 1<=capacity<=6 or not 0<=retries<=2 or not 1<=deadline<=10:raise ValueError('invalid simulation input')
 offered={'A':burst*(1+retries),'B':6,'C':6};queues={t:deque(range(min(n,12))) for t,n in offered.items()}
 rejected=sum(max(0,n-12) for n in offered.values());peak=sum(map(len,queues.values()));served={t:0 for t in queues};expired=0;timeline=[];cursor=0
 cycle=['A','B','C'] if policy=='rr' else ['A','A','B','C']
 for now in range(10):
  if now>=deadline:
   expired+=sum(map(len,queues.values()))
   for queue in queues.values():queue.clear()
  for _ in range(capacity):
   chosen=None
   if policy in ('fifo','priority'):
    order=['A','B','C'] if policy=='fifo' else ['B','C','A']
    chosen=next((tenant for tenant in order if queues[tenant]),None)
   else:
    for _ in range(len(cycle)):
     tenant=cycle[cursor%len(cycle)];cursor+=1
     if queues[tenant]:chosen=tenant;break
   if chosen is None:break
   queues[chosen].popleft();served[chosen]+=1
  if now+1>=deadline:
   expired+=sum(map(len,queues.values()))
   for queue in queues.values():queue.clear()
  timeline.append(sum(map(len,queues.values())))
 # At horizon t=10, any remaining job's deadline has arrived.
 expired+=sum(map(len,queues.values()))
 return {'Served A/B/C':f"{served['A']}/{served['B']}/{served['C']}",'Rejected at admission':rejected,'Expired queued jobs':expired,'Peak queued jobs':peak,'Queue after each second':','.join(map(str,timeline)),'Total completions':sum(served.values()),'Fixed provider jobs/s':capacity}
