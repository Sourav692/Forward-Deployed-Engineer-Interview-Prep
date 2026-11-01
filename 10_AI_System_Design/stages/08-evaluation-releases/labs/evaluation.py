"""Executed deterministic scoring over fixture outputs, not a model benchmark."""
import hashlib,json,math
from pathlib import Path
DATASET=json.loads(Path(__file__).with_name('dataset-v1.json').read_text())
def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def manifest(model='fixture-model-v1'):
 return {'prompt':'supplier-v1','retriever':'lexical-v1','index':'corpus-v2','model':model,'policy':'enterprise-v1','dataset':digest(DATASET),'evaluator':'deterministic-v1','gates':'teaching-gate-v1'}
def predictions(kind='good'):
 result=[{'id':c['id'],'decision':c['decision'],'citation':c['citation'],'answer':c['required'],'latency_ms':1000,'cost_units':2} for c in DATASET]
 if kind=='quality':result[0]['answer']='unsupported rule'
 if kind=='leak':result[6].update(decision='answer',citation='foreign:v1:c0',answer='restricted text')
 if kind=='latency':result[0]['latency_ms']=3000
 if kind=='cost':
  for row in result:row['cost_units']=5
 return result

def evaluate(dataset,outputs,bundle,quality=95,max_latency=2000,max_cost=3):
 issues=[];base={'passed':False,'bundle_hash':digest(bundle),'dataset_hash':digest(dataset),'evaluator':'deterministic-v1','gates':{'quality':quality,'max_latency':max_latency,'max_cost':max_cost}}
 if not dataset or bundle.get('dataset')!=digest(dataset) or bundle.get('evaluator')!='deterministic-v1':return {**base,'issues':['version_binding']}
 if not 0<=quality<=100 or not all(type(v) in (int,float) and math.isfinite(v) and v>0 for v in [max_latency,max_cost]):return {**base,'issues':['invalid_gate_policy']}
 ids=[x.get('id') for x in outputs]
 if len(ids)!=len(dataset) or len(set(ids))!=len(ids) or set(ids)!={x['id']for x in dataset}:return {**base,'issues':['coverage']}
 if any(type(x.get(k)) not in (int,float) or not math.isfinite(x[k]) or x[k]<0 for x in outputs for k in ['latency_ms','cost_units']):return {**base,'issues':['invalid_metrics']}
 if any(not isinstance(x.get('answer'),str) or x.get('decision') not in ('answer','refuse') or (x.get('citation') is not None and not isinstance(x['citation'],str)) for x in outputs):return {**base,'issues':['invalid_prediction']}
 by_id={x['id']:x for x in outputs};correct=0;violations=0;slices={}
 for case in dataset:
  row=by_id[case['id']];ok=row.get('decision')==case['decision'] and row.get('citation')==case['citation'] and case['required'] in row.get('answer','') and (case['decision']!='refuse' or row['answer']=='')
  correct+=int(ok);group=slices.setdefault(case['slice'],{'passed':0,'total':0});group['passed']+=int(ok);group['total']+=1
  if case['slice']=='security' and (row.get('decision')!='refuse' or row.get('citation') is not None or row['answer']!=''):violations+=1
 pct=100*correct/len(dataset);latencies=sorted(x['latency_ms'] for x in outputs);p95=latencies[math.ceil(.95*len(latencies))-1];mean=sum(x['cost_units']for x in outputs)/len(outputs)
 if pct<quality:issues.append('quality')
 if violations:issues.append('known_safety_violation')
 if p95>max_latency:issues.append('latency')
 if mean>max_cost:issues.append('cost')
 return {**base,'passed':not issues,'issues':issues,'quality_pct':pct,'known_safety_violations':violations,'p95_fixture_ms':p95,'mean_fixture_cost':mean,'slices':slices}
