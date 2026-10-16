#!/usr/bin/env python3
"""Upload AutoLab runs, shop/action diagnostics, round histories and report to Supabase.
Requires SUPABASE_URL and a server key in trusted GitHub Actions secrets.
"""
import csv,json,os,sys,uuid,urllib.request,urllib.error
from pathlib import Path

url=os.environ.get('SUPABASE_URL','').rstrip('/')
key=os.environ.get('SUPABASE_SECRET_KEY') or os.environ.get('SUPABASE_SERVICE_ROLE_KEY','')
if not url or not key:sys.exit('SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) are required')
source=Path(sys.argv[1] if len(sys.argv)>1 else 'results/runs.csv')
out=source.parent

def read_csv(path):
 if not path.exists():return []
 with path.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))

def integer(v):return int(float(v or 0))

def upload(table,rows,conflict=None):
 for i in range(0,len(rows),200):
  endpoint='/rest/v1/'+table+(('?on_conflict='+conflict) if conflict else '')
  request('POST',endpoint,rows[i:i+200],prefer='return=minimal'+(',resolution=merge-duplicates' if conflict else ''))
  print('Uploaded',table,min(i+200,len(rows)),'/',len(rows))

def request(method,path,data=None,prefer='return=minimal'):
 body=None if data is None else json.dumps(data,ensure_ascii=False).encode('utf-8')
 headers={'apikey':key,'Content-Type':'application/json','Prefer':prefer}
 # New sb_secret keys are not JWTs: send only apikey. Legacy service_role JWTs retain Bearer support.
 if not key.startswith('sb_secret_'):headers['Authorization']='Bearer '+key
 req=urllib.request.Request(url+path,data=body,headers=headers,method=method)
 try:
  with urllib.request.urlopen(req,timeout=45) as response:return response.status
 except urllib.error.HTTPError as e:
  # Response bodies can echo credentials or input data; keep failures safe for public Actions logs.
  raise SystemExit(f'Supabase {method} {path} failed: HTTP {e.code}') from None

raw=read_csv(source)
if not raw:sys.exit(f'No runs found in {source}')
run_id=os.environ.get('GITHUB_RUN_ID')
run_attempt=os.environ.get('GITHUB_RUN_ATTEMPT','1')
identity=f'{url}/{run_id}/{run_attempt}'
batch=str(uuid.uuid5(uuid.NAMESPACE_URL,identity)) if run_id else str(uuid.uuid4())

bot_runs=[{'batch_id':batch,'strategy':r['strategy'],'seed':integer(r['seed']),'round':integer(r['round']),'phase':r['phase'],'score':integer(r['score']),'cleared':r['cleared'] in ('1','true','True'),'enemies':integer(r['enemies']),'enemy_hp':integer(r['enemyHp']),'deck_size':integer(r['deck']),'damage':integer(r['damage']),'aoe_damage':integer(r['aoeDamage']),'pierce_damage':integer(r['pierceDamage']),'overkill_damage':integer(r['overkillDamage']),'promotions':integer(r['promotions']),'combo_triggers':integer(r['comboTriggers']),'cards_bought':integer(r['cardsBought']),'error':r['error']} for r in raw]
rounds=[{'batch_id':batch,'strategy':r['strategy'],'seed':integer(r['seed']),'round':integer(r['round']),'score':integer(r['score']),'enemy_hp':integer(r['enemyHp']),'enemy_count':integer(r['enemyCount']),'attack':integer(r['attack']),'damage':integer(r['damage']),'aoe_damage':integer(r['aoeDamage']),'deck':integer(r['deck'])} for r in read_csv(out/'rounds.csv')]
entries=[]
if (out/'events.jsonl').exists():
 with (out/'events.jsonl').open(encoding='utf-8') as f:
  for line in f:
   if not line.strip():continue
   e=json.loads(line)
   entries.append({'batch_id':batch,'strategy':e['strategy'],'seed':integer(e['seed']),'event_index':integer(e['eventIndex']),'round':integer(e.get('round')),'phase':e.get('phase'),'event_type':e['type'],'payload':{k:v for k,v in e.items() if k not in ('strategy','seed','eventIndex','round','phase','type')}})
analysis_path=out/'analysis.json'
analysis=json.loads(analysis_path.read_text(encoding='utf-8')) if analysis_path.exists() else {}
metadata={'batch_id':batch,'github_run_id':run_id,'github_run_attempt':run_attempt,'git_sha':os.environ.get('GITHUB_SHA'),'status':'uploading','analysis':analysis}
# Migration must exist. Upload batch first because diagnostic tables reference it.
upload('autolab_batches',[metadata],conflict='batch_id')
# The pre-existing bot_runs has its original schema and remains unchanged.
# Replays of a single GitHub run can create duplicate legacy bot_runs; avoid manually retrying uploads.
upload('bot_runs',bot_runs)
upload('autolab_rounds',rounds,conflict='batch_id,strategy,seed,round')
upload('autolab_events',entries,conflict='batch_id,strategy,seed,event_index')
request('PATCH','/rest/v1/autolab_batches?batch_id=eq.'+batch,{'status':'complete','runs_ingested':len(bot_runs),'rounds_ingested':len(rounds),'events_ingested':len(entries),'analysis':analysis,'completed_at':__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat()})
(out/'batch_id.txt').write_text(batch+'\n',encoding='utf-8')
print('AutoLab Supabase upload complete:',json.dumps({'batch_id':batch,'runs':len(bot_runs),'rounds':len(rounds),'events':len(entries)},ensure_ascii=False))
