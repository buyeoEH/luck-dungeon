from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import subprocess,json
R=Path(__file__).resolve().parent
def worker(w):
 while True:
  with (R/f'p5-worker-{w}.log').open('a') as f:
   c=subprocess.run(['node','--expose-gc','--max-old-space-size=256','p5-node-run.cjs',str(w),'4'],cwd=R,stdout=f,stderr=subprocess.STDOUT).returncode
  assert c==0,(w,c)
  n=json.loads((R/f'p5-results/execution-{w}.json').read_text())['runs'];print(w,n,flush=True)
  if n==5400:return
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(worker,range(4)))
