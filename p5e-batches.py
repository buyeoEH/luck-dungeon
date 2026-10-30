from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import subprocess,json
R=Path(__file__).resolve().parent
def worker(w):
 while True:
  with (R/f'p5e-worker-{w}.log').open('a') as f:r=subprocess.run(['node','--expose-gc','--max-old-space-size=768','p5e-run.cjs',str(w),'4'],cwd=R,stdout=f,stderr=subprocess.STDOUT)
  assert r.returncode==0,(w,r.returncode)
  s=json.loads((R/f'p5e-results/execution-{w}.json').read_text());print(w,s['runs'],s['target'],flush=True)
  if s['runs']==s['target']:return
with ThreadPoolExecutor(max_workers=4) as e:list(e.map(worker,range(4)))
