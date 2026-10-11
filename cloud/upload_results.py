#!/usr/bin/env python3
"""Upload server bot results via Supabase REST; requires secret service role key."""
import csv,io,json,os,sys,uuid,urllib.request,urllib.error
from pathlib import Path
url=os.environ.get('SUPABASE_URL','').rstrip('/')
key=os.environ.get('SUPABASE_SERVICE_ROLE_KEY','')
if not url or not key:sys.exit('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables are required')
source=Path(sys.argv[1] if len(sys.argv)>1 else 'results/runs.csv')
with source.open(encoding='utf-8-sig',newline='') as f:items=list(csv.DictReader(f))
batch=str(uuid.uuid4())
def num(v):return int(float(v or 0))
rows=[{'batch_id':batch,'strategy':r['strategy'],'seed':num(r['seed']),'round':num(r['round']),'phase':r['phase'],'score':num(r['score']),'cleared':r['cleared'] in ('1','true','True'),'enemies':num(r['enemies']),'enemy_hp':num(r['enemyHp']),'deck_size':num(r['deck']),'damage':num(r['damage']),'aoe_damage':num(r['aoeDamage']),'pierce_damage':num(r['pierceDamage']),'overkill_damage':num(r['overkillDamage']),'promotions':num(r['promotions']),'combo_triggers':num(r['comboTriggers']),'cards_bought':num(r['cardsBought']),'error':r['error']} for r in items]
for i in range(0,len(rows),200):
 payload=json.dumps(rows[i:i+200]).encode()
 request=urllib.request.Request(url+'/rest/v1/bot_runs',data=payload,headers={'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'return=minimal'},method='POST')
 try:
  with urllib.request.urlopen(request,timeout=30) as response:print('Uploaded',min(i+200,len(rows)),'/',len(rows),response.status)
 except urllib.error.HTTPError as e:sys.exit('Upload failed: '+str(e.code)+' '+e.read().decode()[:500])
print('Batch ID:',batch)
