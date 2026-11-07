"""Four independent real-engine workers; fail on any incomplete verification."""
import argparse,csv,gzip,json,subprocess,sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
R=Path(__file__).resolve().parent;O=R/'results-v030';O.mkdir(exist_ok=True)
def worker(i):
 with (O/f'worker-{i}.log').open('w') as log:return subprocess.run([sys.executable,str(R/'verify_v030.py'),'--shard',str(i),'--shards','4'],cwd=R,stdout=log,stderr=subprocess.STDOUT).returncode
ap=argparse.ArgumentParser();ap.add_argument('--merge-only',action='store_true');args=ap.parse_args()
if not args.merge_only:
 with ThreadPoolExecutor(max_workers=4) as pool:codes=list(pool.map(worker,range(4)))
 assert codes==[0]*4,{'worker_exit_codes':codes}
pairs=[];rows=[];execution=[]
with gzip.open(O/'benchmark-runs.jsonl.gz','wt',encoding='utf-8') as output:
 for i in range(4):
  d=O/f'worker-{i}';pairs+=json.loads((d/'paired-regression.json').read_text());execution.append(json.loads((d/'execution.json').read_text()))
  rows+=list(csv.DictReader((d/'benchmark.csv').open()))
  with gzip.open(d/'benchmark-runs.jsonl.gz','rt',encoding='utf-8') as src:
   for line in src:output.write(line)
assert len(pairs)==160 and len({r['seed'] for r in pairs})==160 and all(r['same'] for r in pairs)
assert len(rows)==1400 and len({(r['profile'],r['seed']) for r in rows})==1400
assert {r['persistent_draw'] for r in rows}=={'True'}
summary=[]
for profile in sorted({r['profile'] for r in rows}):
 for cohort in ['101-200','201-300']:
  group=[r for r in rows if r['profile']==profile and r['cohort']==cohort]
  assert len(group)==100
  summary.append({'profile':profile,'cohort':cohort,'runs':100,'clear_rate':sum(int(r['clear']) for r in group)/100,'within_limits_r30_rate':sum(int(r['within_limits_r30']) for r in group)/100,'deaths_r10_11':sum(not int(r['clear']) and 10<=int(r['round'])<=11 for r in group),'deaths_r19_21':sum(not int(r['clear']) and 19<=int(r['round'])<=21 for r in group),'deaths_r22_29':sum(not int(r['clear']) and 22<=int(r['round'])<=29 for r in group)})
(O/'paired-regression.json').write_text(json.dumps(sorted(pairs,key=lambda x:x['seed']),indent=2));(O/'summary.json').write_text(json.dumps(summary,indent=2));(O/'execution.json').write_text(json.dumps({'pairs_passed':160,'benchmark_runs':1400,'draw_policy':'always_ON','historical_policy_available':False,'workers':execution},indent=2))
with (O/'benchmark.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(sorted(rows,key=lambda x:(x['profile'],int(x['seed']))))
import shutil
shutil.copyfile(O/'worker-0/source-catalog.json',O/'source-catalog.json')
print(json.dumps({'pairs_passed':160,'benchmark_runs':1400,'draw_policy':'always_ON'}),flush=True)
