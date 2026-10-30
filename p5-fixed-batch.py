from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json,subprocess,sys
reward=sys.argv[1] if len(sys.argv)>1 else 'reroll';out=sys.argv[2] if len(sys.argv)>2 else 'p5-fixed'
def work(w):
 while True:
  with Path(f'{out}-{w}-{reward}.log').open('a') as f:r=subprocess.run(['node','--expose-gc','--max-old-space-size=768','p5-fixed-run.cjs',str(w),reward,out],stdout=f,stderr=subprocess.STDOUT)
  assert r.returncode==0,(w,r.returncode)
  n=json.loads(Path(f'{out}/execution-{w}-{reward}.json').read_text())['runs']
  if n==700:return
with ThreadPoolExecutor(max_workers=4) as e:list(e.map(work,range(4)))
