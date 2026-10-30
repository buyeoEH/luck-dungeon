from pathlib import Path
import json
R=Path(__file__).resolve().parent;reference=[]
for p in sorted((R/'p5b-results').glob('worker-*.jsonl')):
 for line in p.read_text().splitlines():
  r=json.loads(line)
  if r['experiment']=='mixed':reference.append(r)
assert len(reference)==2800
jobs=[]
for r in sorted(reference,key=lambda r:(r['seed'],r['profile'])):
 prefix=[x['choice'] for x in r['rewards']]
 for i in range(len(prefix)):
  for choice in range(4):jobs.append({'profile':r['profile'],'seed':r['seed'],'target':i,'choice':choice,'prefix':prefix[:i],'reference_choice':prefix[i],'reference_clear':r['clear'],'reference_round':r['round']})
assert len(jobs)==29768
(R/'p5c-jobs.json').write_text(json.dumps(jobs));print(len(jobs),'branches',len(jobs)//4,'moments')
