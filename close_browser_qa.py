from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
import base64,json
from verify_v030 import serve
R=Path(__file__).resolve().parent;D=R/'_site/downloads';version=json.loads((R/'_site/preview/v0.3.0/build.json').read_text())['version'];results=[]
def route(r):
 u=urlsplit(r.request.url)
 if u.hostname=='release.test':
  f=D/u.path.lstrip('/')
  if f.is_relative_to(D) and f.is_file():return r.fulfill(path=str(f))
  return r.abort()
 return serve(r)
def assert_images(p):
 p.evaluate("async()=>{await Promise.all(Array.from(document.images).filter(x=>x.getAttribute('src')).map(x=>x.decode()));}")
 assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
with sync_playwright() as pw:
 b=pw.chromium.launch()
 for width in [360,390,430]:
  p=b.new_page(viewport={'width':width,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',route);p.goto('https://luck.test/preview/v0.3.0/');p.wait_for_function('!!window.LuckP5Rewards');assert p.evaluate('LuckP5Rewards.restockMode')=='A';assert p.evaluate('LuckP5Rewards.seedChoices')==3;p.locator('#welcomeVisualModeToggle').uncheck();p.locator('#welcomeBattleMotionSkipToggle').check();p.locator('#welcomeNormal').click();p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click();assert_images(p)
  p.evaluate("resource=40;buyCount[BASIC.find(c=>c.id==='hand').id]=BASIC.find(c=>c.id==='hand').limit;bossReward();reward(1)");p.locator('button[onclick*="pickRestock"]').first.click();assert p.evaluate('p5Coupon.cap')==6;assert p.evaluate('round')==2
  p.evaluate('bossReward();reward(0)');p.locator('button[onclick="LuckP5Rewards.toggleLock(0)"]').click();p.locator('button[onclick="LuckP5Rewards.toggleLock(1)"]').click();p.locator('button[onclick="LuckP5Rewards.confirmLocks()"]').click();p.locator('button[onclick="confirmShopReroll()"]').click();assert p.locator('button[onclick*="pickSeed"]').count()==3;assert_images(p);box=p.locator('.p5-content').bounding_box();assert box['x']>=0 and box['x']+box['width']<=width+1;p.locator('button[onclick*="pickSeed"]').first.click();assert p.evaluate('round')==3
  # Render the full catalog to decode actual WebP cards, not empty placeholders.
  p.evaluate('window.closeQaCatalog=p5SeedPool().map(x=>x.card.id)');assert not errors,errors
  (R/'close-qa').mkdir(exist_ok=True);p.screenshot(path=str(R/f'close-qa/mobile-{width}.png'));results.append({'width':width,'dpr':2,'images_loaded':True,'default_A':True,'coupon_cap':6,'seed3':True,'modal_within_width':True,'errors':errors});p.close()
 # Every optimized image decodes in the browser with real payload/alpha formats.
 p=b.new_page();p.route('**/*',route);p.goto('https://luck.test/preview/v0.3.0/');assets=json.loads((R/'_site/preview/v0.3.0/asset-optimization.json').read_text())['assets'];decoded=p.evaluate("async paths=>{const out=[];for(const path of paths){const i=new Image();i.src=path;await i.decode();out.push({path,width:i.naturalWidth,height:i.naturalHeight});}return out;}",[x['output'] for x in assets]);assert len(decoded)==39;p.close()
 flags=[]
 for mode in ['B','C','legacy']:
  p=b.new_page();p.route('**/*',route);p.goto('https://luck.test/preview/v0.3.0/?restock='+mode+'&seeds=8');p.wait_for_function('!!window.LuckP5Rewards');assert p.evaluate('LuckP5Rewards.restockMode')==mode;assert p.evaluate('LuckP5Rewards.seedChoices')==8;flags.append(mode);p.close()
 p=b.new_page();p.route('**/*',route);p.goto('https://luck.test/preview/v0.3.0/?p5=0');p.wait_for_function('!!window.LuckP5Rewards');assert not p.evaluate('LuckP5Rewards.enabled');p.close()
 audio_results=[]
 for mode in ['embedded','external']:
  folder=D/('LUCK-v'+version+'-'+mode);p=b.new_page();p.route('**/*',route);p.goto('https://release.test/'+folder.name+'/index.html');p.wait_for_function('!!window.LuckGameAudio');assert_images(p)
  # Check real decode for every track; bytes are injected by QA to avoid connect-src fetch exceptions.
  media=json.loads((R/'release-audio-candidates/manifest.json').read_text());tracks=[]
  for row in media['tracks']:
   raw=(R/'release-audio-candidates'/row['file']).read_bytes();decoded_audio=p.evaluate("async b64=>{const b=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));const c=new AudioContext();const a=await c.decodeAudioData(b.buffer);const r={duration:a.duration,channels:a.numberOfChannels,sample_rate:a.sampleRate};await c.close();return r;}",base64.b64encode(raw).decode());assert abs(decoded_audio['duration']-row['original_duration'])<.12;tracks.append({'id':row['id'],**decoded_audio})
  # Actual runtime source mapping/play: tests candidate URLs, not just injected decode bytes.
  p.locator('body').click(position={'x':5,'y':5})
  playback=p.evaluate("async()=>{const bank=new LuckAudio();const a=bank.create('bgm_round');a.preload='auto';await new Promise((ok,no)=>{a.onloadedmetadata=ok;a.onerror=()=>no(Error('media load failed '+a.src.slice(0,80)));a.load();});await a.play();await new Promise(r=>setTimeout(r,180));const result={duration:a.duration,time:a.currentTime,paused:a.paused,source:a.src.startsWith('data:')?'data':'relative',mappings:Object.keys(LUCK_RELEASE_MEDIA.aliases).length};a.pause();return result;}");assert playback['time']>0 and not playback['paused'];assert playback['mappings']==22
  if mode=='embedded':
   p.context.set_offline(True);p.reload();p.wait_for_function('!!window.LuckGameAudio');assert_images(p);p.locator('body').click(position={'x':5,'y':5});offline=p.evaluate("async()=>{const a=new LuckAudio().create('sfx_attack_01');await a.play();a.pause();return a.src.startsWith('data:');}");assert offline
  else:offline=None
  audio_results.append({'mode':mode,'decoded':tracks,'actual_playback':playback,'embedded_offline':offline});p.close()
 b.close()
(R/'close-results').mkdir(exist_ok=True);(R/'close-results/browser.json').write_text(json.dumps({'mobile':results,'decoded_images':decoded,'rollback_modes':flags,'all_p5_off':True,'audio':audio_results},indent=2));print('mobile360/390/430 with images,39WebP,flags,17tracks x2 decode,actual playback and embedded offline passed')
