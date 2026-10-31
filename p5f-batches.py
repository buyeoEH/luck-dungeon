from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json,subprocess,sys
kind=sys.argv[1] if len(sys.argv)>1 else 'fork'
def worker(w):
 while True:
  with Path(f'p5f-{kind}-{w}.log').open('a') as f:r=subprocess.run(['node','--expose-gc','--max-old-space-size=768','p5f-run.cjs',str(w),kind],stdout=f,stderr=subprocess.STDOUT)
  assert r.returncode==0,(w,r.returncode)
  x=json.loads(Path(f'p5f-{kind}/execution-{w}.json').read_text())
  if x['runs']==x['target']:return
with ThreadPoolExecutor(max_workers=4) as e:list(e.map(worker,range(4)))
