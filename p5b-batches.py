from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json,subprocess
R=Path(__file__).resolve().parent
def worker(w):
 while True:
  with (R/f'p5b-worker-{w}.log').open('a') as f:r=subprocess.run(['node','--expose-gc','--max-old-space-size=512','p5b-run.cjs',str(w),'4'],cwd=R,stdout=f,stderr=subprocess.STDOUT)
  assert r.returncode==0,(w,r.returncode)
  n=json.loads((R/f'p5b-results/execution-{w}.json').read_text())['runs'];print(w,n,flush=True)
  if n==1700:return
with ThreadPoolExecutor(max_workers=4) as e:list(e.map(worker,range(4)))
