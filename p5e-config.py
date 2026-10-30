from pathlib import Path
import json,shutil,sys
R=Path(__file__).resolve().parent;B=Path(sys.argv[1]) if len(sys.argv)>1 else R.parent/'p5-followup';hashes={}
for p in (B/'p5c-results').glob('worker-*.jsonl'):
 for l in p.open():
  x=json.loads(l);k=f"{x['seed']}|{x['profile']}|{x['target']}"
  if k in hashes:assert hashes[k]==x['state_sha256']
  hashes[k]=x['state_sha256']
assert len(hashes)==7442
(R/'baseline-state-hashes.json').write_text(json.dumps(hashes));shutil.copy(B/'p5c-jobs.json',R/'p5c-jobs.json');print(len(hashes),'common states')
