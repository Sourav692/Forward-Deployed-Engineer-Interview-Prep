"""Single-device memory arithmetic. No GPU allocation or throughput benchmark."""
def memory_plan(context=4096,active=8,bits=16,vram=24):
 if type(context) is not int or type(active) is not int or context<=0 or active<=0 or bits not in (4,16) or vram<=0:raise ValueError('invalid memory assumptions')
 gib=2**30
 weights=8_000_000_000*bits/8/gib
 kv=2*32*8*128*2*context*active/gib
 total=weights+kv+4
 return {'Raw weights (GiB)':round(weights,2),'FP16 KV cache (GiB)':round(kv,2),'Assumed total (GiB)':round(total,2),'Memory decision':'within assumed VRAM' if total<=vram else 'exceeds assumed VRAM','Throughput claim':'none: profile real hardware and workload'}
