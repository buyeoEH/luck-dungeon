"""Applied HUD, gem conversion and private cloud synchronization."""
from pathlib import Path
import re
R=Path(__file__).resolve().parent
CSS='''
.dashboard{align-items:flex-start}.dashboard>.dash-item:first-child{order:-1;flex:0 0 100%;font-weight:bold}
.gem-actions{flex:0 0 100%;display:flex;gap:4px;flex-wrap:wrap}.gem-actions:empty{display:none}\n.balance-flash{position:relative;border-radius:5px}.balance-up{animation:balance-up .8s ease-out}.balance-down{animation:balance-down .8s ease-out}
.balance-delta{position:absolute;right:0;top:-12px;font-size:12px;font-weight:bold;pointer-events:none;color:#a7f3d0}.balance-down .balance-delta{color:#fecaca}
@keyframes balance-up{0%,20%{background:#166534;box-shadow:0 0 15px #4ade80}100%{background:transparent;box-shadow:none}}
@keyframes balance-down{0%,20%{background:#9a3412;box-shadow:0 0 15px #fb923c}100%{background:transparent;box-shadow:none}}
@media(prefers-reduced-motion:reduce){.balance-up,.balance-down{animation-duration:.01ms}}
'''
JS='''
/* Observe rendered balances without consuming gameplay RNG. */
(function(){
 let previous=null, runId=null;
 const timers=new Map();
 function pulse(id,delta){const el=document.getElementById(id);if(!el)return;const box=id==='apHud'?el:el.parentElement;clearTimeout(timers.get(id));box.querySelector('.balance-delta')?.remove();box.classList.remove('balance-up','balance-down');void box.offsetWidth;box.classList.add('balance-flash',delta>0?'balance-up':'balance-down');const label=document.createElement('span');label.className='balance-delta';label.textContent=(delta>0?'+':'')+delta;box.appendChild(label);timers.set(id,setTimeout(()=>{box.classList.remove('balance-up','balance-down');label.remove();},850));}
 const original=render;render=function(){const result=original.apply(this,arguments);const now=[resource,gems,apState.points],id=window.__luckManualRunId;if(previous&&id===runId)now.forEach((v,i)=>{if(v!==previous[i])pulse(['res','gem','apHud'][i],v-previous[i]);});previous=now;runId=id;return result;};
})();
'''
def patch(P):
 g=(P/'game.js').read_text()
 a=g.index('function useGem(all) {');b=g.index('\nfunction next()',a)
 g=g[:a]+'''function useGem(all, target='ap') {
  if (!['hand','shop','battle'].includes(phase) || pendingBattleScene?.continuation || gems <= 0) return;
  if(target!=='ap' && !(target==='resource' && phase==='shop')) return;
  const n=all?gems:1;
  gems-=n;
  if(target==='resource'){resource+=2*n;log('💎 '+n+'개 → 자원 +'+(2*n));}
  else{apState.points+=n;apEvent('gem_exchange',n,{gems_spent:n});log('💎 '+n+'개 → 행동력 +'+n);}
  window.Luck220?.emit('gem_exchanged',{target,gems_spent:n,gain:target==='ap'?n:2*n});
  render();
}
''' +g[b:]
 a=g.index("  if ($('gemActionBox'))");b=g.index('\n}',a)
 g=g[:a]+'''  if ($('gemActionBox')) $('gemActionBox').innerHTML = gems>0&&['hand','shop','battle'].includes(phase)&&!pendingBattleScene?.continuation
    ? '<button onclick="useGem()" style="padding:2px 6px;font-size:10px">💎1 → ⚡1</button> <button onclick="useGem(true)" style="padding:2px 6px;font-size:10px">전부 → ⚡</button>'+(phase==='shop'?'<button onclick="useGem(false,\\'resource\\')" style="padding:2px 6px;font-size:10px">💎1 → 자원2</button>':'') : '';
''' +g[b:]
 (P/'game.js').write_text(g+JS)
 h=(P/'index.html').read_text()
 hud='<span class="dash-item" id="apHud" role="status" aria-live="polite"></span>'
 h=h.replace(hud,'')
 marker='<div class="dash-item">💎 <b id="gem">0</b> <span id="gemActionBox"></span></div>'
 assert marker in h
 h=h.replace(marker,'<div class="dash-item">💎 <b id="gem">0</b></div>'+hud+'<div class="dash-item gem-actions" id="gemActionBox"></div>').replace('💰 <b id="res">','💰 자원 <b id="res">').replace('💎 <b id="gem">','💎 보석 <b id="gem">')
 h=h.replace("connect-src 'none'","connect-src https://xkmfjutncwblfebgdmar.supabase.co")
 h=h.replace('</head>','<style>'+CSS+'</style></head>')
 h=h.replace('<span id="cloudStatus">','<span id="buildLabel">').replace('이 기기에만 테스트 기록 저장','플레이 기록 서버 자동 저장').replace('기기 자동 저장 · 종료 전 플레이도 보관합니다.','기기·서버 자동 저장 · 종료 전 플레이도 보관합니다.')
 h=h.replace('기기 저장 전용','서버 자동 저장').replace('게임 데이터를 자동 전송하지는 않아.','플레이 기록은 서버에 자동 저장돼.')
 h=h.replace('숙련의 손: 행동력 +1','보석 1개 → 행동력 +1 (이월 없음). 숙련의 손: 행동력 +1')
 (P/'index.html').write_text(h)
 history=(P/'history.js').read_text().replace('v0.3.0 개발판','v0.3.1 행동력 반영판').replace('기기 자동 저장 · 종료 전 플레이도 보관합니다.','기기·서버 자동 저장 · 종료 전 플레이도 보관합니다.').replace('이 기기·브라우저에만 저장됩니다.', '기기에 먼저 저장한 뒤 서버로 자동 동기화합니다. 연결이 끊기면 재접속 후 재전송합니다.')
 (P/'history.js').write_text(history)
 (P/'cloud/config.js').write_text((R/'cloud/config.js').read_text())
 c=(R/'v0220-cloud.js').read_text().replace('v0220_run_details','v031_run_details').replace('v0220_card_events','v031_card_events').replace('eq.0.2.20',"eq.'+encodeURIComponent(window.LUCK_BUILD.version)+'").replace('· v0.2.20',"· v'+window.LUCK_BUILD.version+'")
 c=c.replace(".filter(s=>s.source!=='bot')",".filter(s=>s.source!=='bot'&&s.version.startsWith('0.3.'))")
 # Avatar upload remains opt-in in this release; gameplay metadata is sufficient.
 c=c.replace(' await uploadImage(s,a);',' // Custom images stay on-device.\n')
 (P/'cloud/cloud.js').write_text(c)
