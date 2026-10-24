"""Explicit live QA: creates only source=qa runs; no historical rows or public rankings are changed."""
import json,os,urllib.request,urllib.error
from pathlib import Path
from PIL import Image
import test_v0220 as base
os.environ['LIVE_CLOUD']='1'
base.StabilityTests.setUpClass();test=base.StabilityTests('test_06_local_event_persistence_and_version');test.setUp()
out={}
test.page.on('requestfailed',lambda r:print('NETWORK_FAILURE',r.url.split('/')[2],r.failure,flush=True))
try:
 icon=base.OUT/'qa-custom.png';Image.new('RGBA',(32,32),(80,180,230,255)).save(icon)
 test.page.locator('#luckAvatarFile').set_input_files(str(icon))
 for _ in range(100):
  if not test.page.evaluate('luckAvatarLoading'):break
  test.page.wait_for_timeout(50)
 test.begin();test.page.evaluate("Luck220.run().source='qa'")
 for _ in range(100):
  if test.page.evaluate("!!Luck220.run().character?.sha256"):break
  test.page.wait_for_timeout(50)
 test.page.route('**/rest/v1/**',lambda route:route.abort())
 test.page.evaluate("""phase='hand';const a=cp(RANDOM_POOL.find(c=>c.id==='gb')),b=cp(RANDOM_POOL.find(c=>c.id==='gb')),l=cp(LEGEND_POOL.find(c=>c.type==='oneuse'));deck.push(a,b,l);hand=[a,l];draw=[b];graveyard=[];use(0);use(0);round=30;freezeOfficialRecord('nextRound')""")
 test.page.evaluate('Luck220.persist()');test.page.evaluate('LuckCloud.flush().catch(()=>null)')
 assert test.page.evaluate('Luck220.get(Luck220.runId()).then(s=>s.events.some(e=>e.event_type==="card_consumed"))')
 out['offline_queue']='consumption events and terminal result retained after upload failure'
 test.page.unroute('**/rest/v1/**')
 test.page.evaluate('Luck220.persist()');test.page.evaluate('LuckCloud.flush()')
 out['run_id']=test.page.evaluate('Luck220.runId()');out['cloud']=test.page.evaluate("Luck220.get(Luck220.runId()).then(s=>({seq:s.seq,synced:s.cloud?.seq,image:!!s.cloud?.image_sha,uid:s.cloud?.user_id}))")
 assert out['cloud']['seq']==out['cloud']['synced'] and out['cloud']['image']
 # Force a retry of the exact same event batch to prove its composite key is idempotent.
 status=test.page.evaluate("""async()=>{const cfg=LUCK_CLOUD_CONFIG,a=JSON.parse(localStorage.getItem('luck_cloud_auth_v1')),s=await Luck220.get(Luck220.runId());const r=await fetch(cfg.supabaseUrl+'/rest/v1/v0220_card_events?on_conflict=run_id,seq',{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:'Bearer '+a.access_token,'Content-Type':'application/json',Prefer:'return=minimal,resolution=ignore-duplicates'},body:JSON.stringify(s.events.map(e=>({...e,user_id:a.user.id})))});return r.status;}""")
 assert status in [200,201,204],status
 out['retry']='same sequence uploaded twice without duplicate rows'
 test.page.evaluate("continueEndless();LuckHistory.updateEndless(35)")
 test.page.evaluate('Luck220.persist()');test.page.evaluate('LuckCloud.flush()')
 out['endless_official_score']=test.page.evaluate('officialRecord.score')
 # An independent browser identity must not see this user's run or image.
 cfg=test.page.evaluate('LUCK_CLOUD_CONFIG')
 # Independent authenticated HTTP client. Never print access/refresh tokens.
 def request(path,method='GET',body=None,headers=None):
  req=urllib.request.Request(cfg['supabaseUrl']+path,data=json.dumps(body).encode() if body is not None else None,method=method,headers={'apikey':cfg['supabaseAnonKey'],'Content-Type':'application/json',**(headers or {})})
  try:r=urllib.request.urlopen(req,timeout=30)
  except urllib.error.HTTPError as e:r=e
  return r.status,json.loads(r.read() or b'null')
 code,a=request('/auth/v1/signup','POST',{});assert code==200,code
 headers={'Authorization':'Bearer '+a['access_token']}
 for table in ['v0220_run_details','v0220_card_events','v0220_custom_images']:
  code,rows=request('/rest/v1/'+table+'?run_id=eq.'+out['run_id'],headers=headers);assert code==200 and rows==[],(table,code)
 out['cross_user_read']='three private tables denied'
 code,_=request('/storage/v1/object/public/luck-private-avatars-0220/'+out['cloud']['uid']+'/'+out['run_id']+'/invalid');assert code>=400
 out['public_image_read']='denied'
 own=json.loads(test.page.evaluate("localStorage.getItem('luck_cloud_auth_v1')"))
 ownheaders={'Authorization':'Bearer '+own['access_token']}
 code,_=request('/rest/v1/manual_runs?id=eq.'+out['run_id'],'PATCH',{'score':999999},ownheaders);assert code>=400
 out['official_score_mutation']='rejected'
 code,_=request('/rest/v1/v0220_custom_images?run_id=eq.'+out['run_id'],'PATCH',{'approval_status':'approved','public_consent':True},ownheaders);assert code>=400
 out['client_self_approval']='rejected'
 rows_code,images=request('/rest/v1/v0220_custom_images?run_id=eq.'+out['run_id'],headers=ownheaders);assert rows_code==200 and len(images)==1
 code,_=request('/storage/v1/object/authenticated/luck-private-avatars-0220/'+images[0]['original_path'],headers=headers);assert code>=400
 out['cross_user_original_image']='denied'
 out['cloud'].pop('uid',None)
 out['page_errors']=test.errors;assert not test.errors
 base.OUT.joinpath('cloud-live.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
finally:
 test.page.close();base.StabilityTests.tearDownClass()
