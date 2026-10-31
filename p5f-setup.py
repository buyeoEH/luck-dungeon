"""Prepare immutable control inputs from the previous evidence archive."""
from pathlib import Path
import json,shutil
R=Path(__file__).resolve().parent;E=R.parent/'p5-next-evidence'
for name,src,field,value in [('forks','branches','choice',1),('fixed','fixed','reward_policy','restock')]:
 rows=[x for l in (E/'approved'/f'{src}.jsonl').open() if (x:=json.loads(l))[field]==value]
 assert len(rows)==(7442 if name=='forks' else 2800)
 (R/f'p5f-control-{name}.json').write_text(json.dumps(rows))
shutil.copy(E/'input/p5c-jobs.json',R/'p5c-jobs.json');print('7442 fork and2800 fixed controls ready')
