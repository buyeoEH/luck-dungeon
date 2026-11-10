/* Put feedback in the active action/combat scene, not behind it. */
let guardActionReports=[],guardActionActive=false,guardToastTimer;
const guardEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function guardShieldIcon(){return '<svg class="guard-shield-icon" viewBox="0 0 64 72" aria-hidden="true"><path d="M32 4 58 14v20c0 17-12 28-26 34C18 62 6 51 6 34V14Z" fill="#123e53" stroke="#7dd3fc" stroke-width="4"/><path d="m18 34 10 10 19-22" fill="none" stroke="#a7f3d0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
function guardCueHtml(kind,title,detail){return '<section class="guard-cue '+kind+'">'+(['protected','acquired'].includes(kind)?guardShieldIcon():'<span class="guard-cue-symbol" aria-hidden="true">'+({debuff:'💢',theft_failed:'🤏',theft_success:'💎',unnecessary:'ℹ️'})[kind]+'</span>')+'<div><strong>'+guardEsc(title)+'</strong><p>'+guardEsc(detail)+'</p></div></section>';}
function guardActionHtml(rows){return rows.map(r=>{
 if(r.kind==='gain_protection')return guardCueHtml('acquired','보호 확보',r.text+' · 실제 손실을 막을 때만 소모');
 const name=r.kind==='resource'?'자원':'보석',kind=r.spent?'protected':r.after<r.before?'debuff':'unnecessary';
 return guardCueHtml(kind,r.spent?name+' '+r.preserved+' 보존 · 보호 '+r.spent+' 소모':r.after<r.before?name+' 획득 '+r.before+' → '+r.after:'실제 손실 없음 · 보호 유지','보호 없음 '+r.without+' / 보호 후 '+r.after+(r.spent?' · 종류별 '+r.own+' / 전체 '+r.all:''));
 }).join('');}
function guardCombatSteps(r){
 if(!r)return [];const rows=[],a=r.attack,c=r.combo,g=r.gauge;
 if(c.active&&(c.before>c.without||g.raw>g.without))rows.push({kind:'debuff',title:'연계 약화 · 보호 전 영향',detail:'연계 '+c.before+' → '+c.without+' / 게이지 '+g.raw+' → '+g.without+'P'});
 if(c.spent)rows.push({kind:'protected',title:'연계 보호 성공 · 보호 '+c.spent+' 소모',detail:'연계 '+c.preserved+' · 게이지 '+Math.max(0,g.after-g.without)+'P 보존 / 보호 후 '+g.after+'P · 변환 관통 +'+g.pierceBefore+' → +'+g.pierceAfter});
 else if(c.active&&c.before===c.after&&g.raw===g.after)rows.push({kind:'unnecessary',title:'연계 실제 손실 없음 · 보호 유지',detail:'연계와 게이지 효과가 같습니다.'});
 if(a.active&&a.before>a.without)rows.push({kind:'debuff',title:'공격력 약화 · 보호 전 영향',detail:'공격력 '+a.before+' → '+a.without});
 if(r.spent&&(a.preserved>0||a.spent>0))rows.push({kind:'protected',title:'화력 '+a.preserved+' 보존 · 보호 총 '+r.spent+' 소모',detail:'보호 없음 '+a.without+' → 보호 후 '+a.after+' / 실제 공격력 '+a.after});
 else if(a.active&&a.before===a.after)rows.push({kind:'unnecessary',title:'공격 실제 손실 없음 · 보호 유지',detail:'실제 공격력 '+a.after+' · 보호 소모 0'});
 return rows;
}
function guardTheftGroups(rows){
 const groups=[];
 for(const kind of ['protected','theft_success','theft_failed','unnecessary']){
  const list=(rows||[]).filter(x=>x.kind===kind);if(!list.length)continue;
  const stolen=list.reduce((n,x)=>n+(x.stolen||0),0),blocked=list.reduce((n,x)=>n+(x.blocked||0),0),spent=list.reduce((n,x)=>n+(x.spent||0),0);
  groups.push({kind,title:kind==='protected'?'보석 '+blocked+'개 약탈 차단':kind==='theft_success'?'보석 −'+stolen:kind==='theft_failed'?'약탈 실패':'보석 없음 · 보호 유지',detail:'생존 사냥꾼 '+list.length+'마리'+(spent?' · 보호 '+spent+' 소모':' · 보호 소모 0')+(kind==='theft_success'&&blocked?' · 보석 '+blocked+'개 차단':''),count:list.length,stolen,blocked,spent});
 }return groups;
}
async function guardPlaySteps(b,rows){
 for(const s of rows){if(pendingBattleScene!==b)return;
  const host=$('guardCinematicCue');if(host)host.innerHTML=guardCueHtml(s.kind,s.title,s.detail);
  cinBanner(s.title,s.kind==='protected'?'guard-protected':s.kind==='debuff'?'debuff':s.kind);cinFeed(s.detail);
  const hero=document.querySelector('.cin-hero');if(hero){hero.classList.remove('guard-hero-protected','guard-hero-weaken');void hero.offsetWidth;hero.classList.add(s.kind==='protected'?'guard-hero-protected':'guard-hero-weaken');}
  if(s.kind!=='unnecessary')window.LuckGameAudio?.statusCue?.(s.kind);
  await cinWait(s.kind==='unnecessary'?320:1000);
 }if(pendingBattleScene===b){const hero=document.querySelector('.cin-hero');hero?.classList.remove('guard-hero-protected','guard-hero-weaken');}
}
async function guardPlayCombatEffects(b){await guardPlaySteps(b,guardCombatSteps(b.protection));}
async function guardPlayTheftEffects(b){await guardPlaySteps(b,guardTheftGroups(b.thefts));if(pendingBattleScene===b)document.querySelector('.combat-cinematic')?.classList.add('guard-outcomes-ready');}
(function(){
 const emit=guardEmit;guardEmit=function(type,data){if(type==='protection_gain')guardActionReports.push({...data});return emit.apply(this,arguments);};
 const notice=guardNotice;guardNotice=function(kind,text){if(kind!=='acquired')notice.apply(this,arguments);let el=$('guardVisibleToast');if(!el){el=document.createElement('div');el.id='guardVisibleToast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.append(el);}el.innerHTML=guardCueHtml(kind,kind==='acquired'?'🛡 보호 확보':kind==='protected'?'🛡 보호 성공':kind==='debuff'?'💢 디버프 적용':kind==='theft_failed'?'약탈 실패':'디버프·보호 결과',text);el.classList.remove('hide');clearTimeout(guardToastTimer);guardToastTimer=setTimeout(()=>el.classList.add('hide'),kind==='unnecessary'?2200:4200);};
 const use0=use;use=function(i){const c=hand[i];if(phase!=='hand'||!c||['attack','specialAttack','curse'].includes(c.type)||!apCanUse(c))return use0.apply(this,arguments);
  guardActionReports=[];guardActionActive=true;
  if(c.protect)guardActionReports.push({kind:'gain_protection',text:Object.entries(c.protect).map(([k,n])=>({attack:'공격',resource:'자원',gem:'보석',combo:'연계',all:'전체'})[k]+' +'+n).join(' · ')});
  try{const result=use0.apply(this,arguments);if(c.protect&&!isVisualMode())guardNotice('acquired',guardActionReports[0].text+' · 미사용 보호 유지');return result;}finally{guardActionActive=false;}
 };
 const cardModal=showCardUseModal;showCardUseModal=function(){const out=cardModal.apply(this,arguments);if(guardActionActive&&guardActionReports.length)$('modalContent')?.insertAdjacentHTML('afterbegin',guardActionHtml(guardActionReports));return out;};
 const scene=showBattleCinematic;showBattleCinematic=function(){const out=scene.apply(this,arguments),root=$('modalContent')?.querySelector('.combat-cinematic');if(root){
  root.querySelectorAll(':scope > .guard-results,:scope > .guard-thefts').forEach(x=>x.remove());
  root.querySelector('.cin-army')?.insertAdjacentHTML('beforebegin','<div id="guardCinematicCue" aria-live="polite"></div>');
  root.querySelector('.cin-mvp')?.insertAdjacentHTML('beforebegin',guardCombatHtml(pendingBattleScene.protection)+guardTheftHtml(pendingBattleScene.thefts));
  $('modalContent').scrollTop=0;
 }return out;};
 const detail=debuffStatusHtml;debuffStatusHtml=function(){return detail.apply(this,arguments)+(guardLastCombat?'<h4>최근 전투 보호 결과</h4>'+guardCombatHtml(guardLastCombat):'');};
 const beforeStart=start;start=function(){guardActionReports=[];clearTimeout(guardToastTimer);$('guardVisibleToast')?.classList.add('hide');return beforeStart.apply(this,arguments);};
})();
