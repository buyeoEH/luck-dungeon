"""Observe application API usage; never interpret media buffered ranges as PCM RAM."""
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
import json,hashlib,subprocess
R=Path(__file__).resolve().parent;D=R/'_site/downloads';V='0.3.0-rc.1';rows=[]
INIT="""window.__audioProbe={made:[],decodeCalls:0};const NativeAudio=window.Audio;window.Audio=function(...args){const a=new NativeAudio(...args);__audioProbe.made.push(a);return a;};window.Audio.prototype=NativeAudio.prototype;Object.setPrototypeOf(window.Audio,NativeAudio);if(window.BaseAudioContext){const p=BaseAudioContext.prototype,old=p.decodeAudioData;p.decodeAudioData=function(...args){__audioProbe.decodeCalls++;return old.apply(this,args);};}"""
SNAP="""()=>({decodeCalls:__audioProbe.decodeCalls,created:__audioProbe.made.map(a=>({id:a.dataset.id,preload:a.preload,paused:a.paused,source:a.src.startsWith('data:')?'data':a.src.startsWith('http')?'http':'file',currentTime:a.currentTime,readyState:a.readyState,buffered:Array.from({length:a.buffered.length},(_,i)=>[a.buffered.start(i),a.buffered.end(i)])})),scene:LuckGameAudio.snapshot()})"""
with sync_playwright() as pw:
 b=pw.chromium.launch()
 for mode in ['embedded','external']:
  folder=D/('LUCK-v'+V+'-'+mode);context=b.new_context();context.add_init_script(INIT);p=context.new_page();requests=[]
  if mode=='external':
   def route(r):
    u=urlsplit(r.request.url);f=folder/u.path.lstrip('/')
    if u.hostname!='release.test' or not f.is_relative_to(folder) or not f.is_file():return r.abort()
    if '/assets/audio/' in u.path:requests.append({'path':u.path,'range_requested':r.request.headers.get('range'),'test_response':200})
    r.fulfill(path=str(f))
   p.route('**/*',route);p.goto('https://release.test/index.html')
  else:
   context.set_offline(True);p.goto((folder/'index.html').as_uri(),wait_until='domcontentloaded')
  before=p.evaluate(SNAP);assert before['decodeCalls']==0 and len(before['created'])==0
  p.evaluate('LuckGameAudio.setBgmEnabled(true)');p.locator('#welcomeNormal').click();p.wait_for_timeout(450);after=p.evaluate(SNAP);assert after['decodeCalls']==0;assert any(x['id'].startswith('bgm_') for x in after['created']);assert all(x['preload']=='none' for x in after['created']);assert any(not x['paused'] and x['currentTime']>0 for x in after['created'])
  p.evaluate('LuckGameAudio.setBgmEnabled(false)');stopped=p.evaluate(SNAP);assert all(x['paused'] for x in stopped['created'])
  assert p.evaluate('LUCK_BUILD.audio_strategy.default')=='embedded';assert p.evaluate('LUCK_RELEASE_MEDIA.approval_status')==('approved_embedded_default' if mode=='embedded' else 'approved_external_web_artifact')
  rows.append({'mode':mode,'before_touch':before,'after_touch':after,'after_bgm_off':stopped,'media_requests':requests,'actual_RAM_measured':False});context.close()
 b.close()
O=R/'audio-final-results';O.mkdir(exist_ok=True);(O/'runtime-observation.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
protected=[]
for path in ['p5-rewards.js','v030-p1.js','v030_p1_patch.py','v0219_patch.py','v0220-core.js','v030-reference-ai.js','luck-audio.js']:
 old=subprocess.check_output(['git','show','c0a64ea44d6008ac12c2b93dbe8887528b5eb09f:'+path]);now=(R/path).read_bytes();assert now==old,path;protected.append({'file':path,'unchanged':True,'sha256':hashlib.sha256(now).hexdigest()})
(O/'protected-game-files.json').write_text(json.dumps(protected,indent=2));print('approved default and external web playback passed; zero application decodeAudioData calls;7 protected game sources unchanged')
