function simulate(p){const recovery=p.fault==='crash'?p.lease:0;return {'Earliest safe recovery (s)':recovery,'Durable outcome':p.fault==='external'?'unknown: reconcile, no retry':p.fault==='crash'?'redelivered pure task':'completed','New worker attempts':p.fault==='external'?0:p.fault==='crash'?1:0,'Stale completion accepted':'no'};}
if(typeof module!=='undefined')module.exports=simulate;
