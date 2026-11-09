/* v0.3.2 presentation and observation. All combat formulas remain authoritative. */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let feedback={round:0,entries:[],settled:null},last=null,timer=null;
function reset(){feedback={round,entries:[],settled:null};last=null;clearTimeout(timer);timer=null;document.getElementById('linkMeter')?.classList.remove('link-gained','link-lost');}
function record(source,amount,kind,id){if(amount<=0)return;if(feedback.round!==round)reset();const e={round,source,amount,kind,id,raw:linkComboAttack+p1Round.gaugeBonus};feedback.entries.push(e);if(!window.__luckAutoLabBotActive)window.Luck220?.emit('link_feedback',e);}
const resetRun=p1ResetRun;p1ResetRun=function(){const r=resetRun.apply(this,arguments);reset();return r;};
const roundStart=p1RoundStart;p1RoundStart=function(){const r=roundStart.apply(this,arguments);reset();return r;};
const trigger=triggerLink;triggerLink=function(id,name,bonus,text,changes){const before=linkComboAttack,r=trigger.apply(this,arguments);if(r)record(name,linkComboAttack-before,'link',id);return r;};
const used=p1Used;p1Used=function(c,changes){const before=p1Round.gaugeBonus,r=used.apply(this,arguments);record(c.name+' · 게이지 효과',p1Round.gaugeBonus-before,'card',cardKey(c));return r;};
const resolved=p1BattleDone;p1BattleDone=function(scene,snapshot){const raw=linkComboAttack+p1Round.gaugeBonus,r=resolved.apply(this,arguments);feedback.settled={...scene.p1,earnedRaw:raw};return r;};
function model(){
 const fixed=feedback.round===round&&feedback.settled&&['battle','reward','gameover','complete'].includes(phase)?feedback.settled:null;
 const a=attackParts(),m=fixed?{...a.p1,...fixed}:a.p1,raw=fixed?fixed.earnedRaw:m.gaugeRaw;
 const milestones=Array.from({length:4},(_,i)=>(i+1)*m.step).concat([20,40,60,80],P1_EXTRAS?[50,70]:[]);
 const next=[...new Set(milestones)].sort((a,b)=>a-b).find(n=>n>m.gaugeNet);
 return {a,m,raw,fixed,next,loss:Math.max(0,raw-m.gaugeNet),last:feedback.entries.at(-1)};
}
function hint(){
 const rows=ACTION_LINKS.filter(l=>!roundLinkDone['a_'+l.id]).map(l=>{let n=0;for(let k=Math.min(l.seq.length-1,roundActionHistory.length);k>0;k--){if(roundActionHistory.slice(-k).every((x,i)=>x===l.seq[i])){n=k;break;}}const tag=l.seq[n],cards=hand.filter(c=>actionTag(c)===tag&&!['attack','specialAttack','curse'].includes(c.type));return {l,n,tag,cards};}).filter(x=>x.n>0).sort((a,b)=>b.n-a.n||a.l.seq.length-b.l.seq.length);
 const h=rows[0];if(!h)return '경제 → 드로우 등 순서 연계, 손패 조합, 연계 카드 효과로 획득';
 const usable=h.cards.filter(c=>apCanUse(c));return '다음 '+(TAG_KO[h.tag]||h.tag)+' → '+h.l.name+' +'+(h.l.bonus+deckLinkAmp())+'P · '+(usable.length?usable.map(c=>c.name).slice(0,2).join('/'):h.cards.length?'행동력 부족':'해당 카드가 손패에 없음');
}
function meterHtml(v){const {m,fixed,next}=v;
 const note=fixed?'전투 적용 완료 · 실제 관통 '+m.pierceHits+'회 / 피해 '+m.pierceDamage:v.last? v.last.source+' +'+v.last.amount+'P · '+(next?'다음 '+next+'P까지 '+(next-m.gaugeNet)+'P':'최대 구간 달성'):(next?'다음 '+next+'P까지 '+(next-m.gaugeNet)+'P':'최대 구간 달성');
 return '<div class="link-meter-heading"><b>🔗 <strong>'+m.gaugeNet+'</strong>P</b><span class="link-meter-benefit">공격 +'+m.attackPct+'% · 관통 +'+m.pierceBonus+'</span><button type="button" onclick="openLinkDetails()">연계 상세</button></div>'+
 '<div class="link-meter-track" role="meter" aria-label="디버프 후 연계 포인트, 80포인트 이상 최대 구간" aria-valuemin="0" aria-valuemax="'+Math.max(80,m.gaugeNet)+'" aria-valuenow="'+m.gaugeNet+'"><i class="link-meter-raw" style="width:'+Math.min(100,v.raw/80*100)+'%"></i><i class="link-meter-net" style="width:'+Math.min(100,m.gaugeNet/80*100)+'%"></i>'+[20,40,60].map(n=>'<span style="left:'+n/80*100+'%"></span>').join('')+'</div>'+
 '<div class="link-meter-notice" aria-live="polite" title="'+esc(note)+'">'+esc(note)+'</div>';
}

function allLinks(){const tags=tacticalTags();return [
 ...ACTION_LINKS.map(l=>({id:'a_'+l.id,l,condition:l.seq.map(t=>TAG_KO[t]||t).join(' → '),ready:false})),
 ...TACTICAL_LINKS.map(l=>({id:'t_'+l.id,l,condition:l.need.map(t=>TAG_KO[t]||t).join(' + '),ready:l.need.every(t=>tags.has(t))}))
 ].map(x=>'<li class="'+(roundLinkDone[x.id]?'link-done':'')+'"><b>'+esc(x.l.name)+'</b> <span>+'+(x.l.bonus+deckLinkAmp())+'P</span><small>'+esc(x.condition)+' · '+(roundLinkDone[x.id]?'✓ 이번 라운드 발동 완료':x.ready?'조건 충족 · 다음 효과 처리/전투 시작 시 발동':'미발동')+'</small></li>').join('');}
function detailsHtml(v){const {m,raw,fixed}=v;
 const steps=[20,40,60,80].map(n=>'<span class="'+(m.gaugeNet>=n?'achieved':'')+'">'+n+'P · 공격 +'+n/4+'%</span>').join('');
 const pierceSteps=[1,2,3,4].map(n=>n*m.step+'P → +'+n).join(' / ');
 let forecast='';if(!fixed&&phase==='battle'){const p=battlePreparationPlan();forecast='<p class="link-forecast">전투 예상: '+p.ap.p1.gaugeNet+'P · 공격 +'+p.ap.p1.attackPct+'% · 관통 +'+p.ap.p1.pierceBonus+'<br><small>전투 시작 시 추가 연계와 광역 처치 후 디버프를 반영한 예상이며, 아직 획득으로 확정하지 않습니다.</small></p>';}
 return '<div id="linkDetails"><div class="link-details-body"><h3>🔗 연계 공격 상세 · '+m.gaugeNet+'P</h3>'+
 '<p><b>포인트 흐름</b> 획득 '+raw+' → 디버프 후 '+m.gaugeNet+'P</p><p>순서·손패 연계는 포인트와 콤보 공격을 함께 올립니다. 증폭 문장·관통창 효과는 포인트만 올립니다. 일반 손패 콤보 보너스 자체는 포인트가 아닙니다.</p>'+
 '<div class="link-thresholds">'+steps+'</div><p>변환 관통: '+pierceSteps+' (상한 +4)</p><p>변환 관통도 관통으로 취급하므로, 관통이 1 이상이면 순수 연속타 조건은 충족하지 않습니다. 준비한 관통 수와 실제 적중 수는 적의 HP·초과 피해에 따라 다릅니다.</p><p>50P: 다음 라운드 콤보 보호 +1 · 70P: 시작 드로우 +1'+(!P1_EXTRAS?' (추가 보상 OFF)':'')+'</p>'+
 '<p><b>이번 공격 보너스</b> 게이지 비율 +'+m.percentBonus+' / 정점 +'+m.peakBonus+' → 공격 디버프 전 +'+(m.percentBonus+m.peakBonus)+'</p><p>연계의 직접 콤보 공격은 일반 콤보와 함께 디버프를 계산합니다. 위 게이지 추가 보너스와 별개이며 중복 가산하지 않습니다. 포인트·정점 예약은 매 라운드 초기화하며 연계별 발동은 라운드당 1회입니다.</p>'+forecast+
 '<p><b>최근 행동</b> '+(roundActionHistory.map(t=>TAG_KO[t]||t).join(' → ')||'아직 없음')+'</p><p class="link-next">'+esc(hint())+'</p>'+
 '<h4>이번 라운드 획득 내역</h4><ul class="link-ledger">'+(feedback.entries.length?feedback.entries.map(e=>'<li>'+esc(e.source)+' <b>+'+e.amount+'P</b></li>').join(''):'<li>아직 획득한 포인트가 없습니다.</li>')+'</ul><h4>전체 연계 조건</h4><ul class="link-conditions">'+allLinks()+'</ul></div></div>';
}
p1Hud=function(){return '';};
linkStatusHtml=function(){return '<div class="link-next">🔗 '+esc(hint())+'</div>';};
window.openLinkDetails=function(){const d=document.getElementById('linkDialog');if(!d||d.open)return;draw();d.showModal();document.getElementById('linkDialogClose').focus({preventScroll:true});};
window.closeLinkDetails=function(){document.getElementById('linkDialog')?.close();};
document.addEventListener('DOMContentLoaded',()=>{const d=document.getElementById('linkDialog');d?.addEventListener('close',()=>{document.querySelector('#linkMeter button')?.focus({preventScroll:true});});d?.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
function draw(){const el=document.getElementById('linkMeter'),detail=document.getElementById('linkDetailsHost');if(!el||!detail)return;const v=model(),scroll=detail.scrollTop;el.innerHTML=meterHtml(v);detail.innerHTML=detailsHtml(v);detail.scrollTop=scroll;
 const changed=last&&last.round===round&&!v.fixed&&(last.raw!==v.raw||last.net!==v.m.gaugeNet);if(changed){el.classList.remove('link-gained','link-lost');void el.offsetWidth;el.classList.add(v.m.gaugeNet<last.net?'link-lost':'link-gained');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('link-gained','link-lost'),950);}last={round,raw:v.raw,net:v.m.gaugeNet};}

const renderOriginal=render;render=function(){const r=renderOriginal.apply(this,arguments);draw();return r;};
window.LuckLinkView={beginCombat(){reset();draw();},snapshot:()=>JSON.parse(JSON.stringify(feedback)),model:()=>model(),draw};
})();
