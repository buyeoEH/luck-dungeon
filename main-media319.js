/* Presentation only. Confirmed events in, images/sounds out. No game RNG or effect calls. */
(function(global){'use strict';
 const media=global.LUCK_MAIN_MEDIA319,queue=[],seen=new Set(),images=new Map(),history=[];let active=null,timer=null,frame=null,generation=0,serial=0,element=null;
 const soundFor=new Map(media.audio.map(t=>[t.motionId,t.id]));
 soundFor.set('fx-card_destroy',soundFor.get('fx-destroy_plain'));soundFor.set('fx-destroy_mutation',soundFor.get('fx-mutation_card'));
 const cardFx={spark:'spark_use',luckdraw:'luckdraw_use',luckguard:'luckguard_use',lucklink:'lucklink_use',luckforge:'luckforge_use',legend_warlord315:'legend_warlord_use',legend_treasury315:'legend_treasury_use',legend_archive315:'legend_archive_use',legend_aegis315:'legend_aegis_use',legend_chain315:'legend_chain_use'};
 const cue=(id,label,detail='',extra={})=>({id:'fx-'+id,label,detail,...extra});
 function eventPlan(type,p){const out=[];
  if(type==='luck_strength')out.push(cue(p.kind==='tempLuck'?'luck_temp':'luck_run',p.kind==='tempLuck'?'임시 행운력':'누적 행운력','현재 '+p.value));
  if(type==='luck_usage_result'){if(cardFx[p.card_id])out.push(cue(cardFx[p.card_id],CARD_NAME[p.card_id]||'카드 사용'));out.push(cue(p.outcome==='good'?'luck_success':p.outcome==='bad'?'luck_fail':'luck_neutral',({good:'행운',neutral:'변화 없음·보통',bad:'불운'})[p.outcome],effectText315(p.actual||{})||'실제 효과 없음'));}
  if(type==='luck_destruction_roll'){out.push(cue('destruction_roll','별도 파괴 판정'));if(!p.destroyed)out.push(cue('destruction_survive','카드 생존','이미 받은 사용 효과 유지'));}
  if(type==='luck_destruction_result'){
   const d=p.detail||{};
   out.push(cue(p.kind===2?'destroy_curse':p.kind===3||p.kind===5&&d.fallback?'destroy_acquire':'destroy_plain',p.label||'카드 파괴','사용 인스턴스 제거 · 이미 받은 사용 효과 유지'));
   if(p.kind===0&&d.card_id)out.push(cue('legend_reveal','레전드 발견',CARD_NAME[d.card_id]||d.card_id,{priority:3}));
   if(p.kind===4)out.push(cue(d.good?'major_benefit':'major_risk',d.good?'큰 영향 · 혜택':'큰 영향 · 위험',effectText315(d.actual||{})));
   if(p.kind===5&&!d.fallback&&d.instance_id)out.push(cue('mutation_card','살아 있는 카드 변이',CARD_NAME[d.card_id]||'기존 카드 강화'));
  }
  if(type==='luck_mutation_hand')out.push(cue('mutation_bonus','변이 손패 보너스',effectText315(p.extra||{})));
  if(type==='luck_major_tick')out.push(cue(p.good?'major_benefit':'major_risk','지속 사건 적용',effectText315(p.actual||{})));
  if(type==='boss_mega_reshuffle')out.push(cue('mega_reshuffle','폭발의 기회','첫 드로우 전 전체 리셔플'));
  if(type==='luck_legend_used'&&cardFx[p.card_id])out.push(cue(cardFx[p.card_id],CARD_NAME[p.card_id],effectText315(p.effects||{}),{priority:3}));
  if(type==='seed_sprouted318'){out.push(cue('seed_germinate','씨앗 발아',p.name,{priority:3}));out.push(cue('sprout_'+p.kind,p.name,p.kind==='resource'?'다음 전투부터 시작 자원 +1':p.kind==='attack'?'이번 게임 영구 공격 +8':'매 전투 연계 게이지 +3',{priority:3}));}
  if(type==='direct_removal_all_removed318')out.push(cue('card_destroy','선택한 카드 영구 제거',(p.ids||[]).length+'장'));
  if(type==='break_reward318'){out.push(cue('sacrifice_remove',p.name+' 파괴 보상',({good:'행운',neutral:'중립',bad:'불운'})[p.outcome]+' · '+effectText318(p.actual||{})));if(Object.values(p.actual||{}).some(x=>x>0))out.push(cue('destroy_reward','실제 파괴 보상 획득',effectText318(p.actual||{})));}
  if(type==='break_mutation318'&&p.success)out.push(cue('destroy_mutation','파괴를 통한 변이',p.after?.name||'',{priority:3}));
  if(type==='cards_drawn'&&p.actual>0)out.push(cue('draw','카드 드로우','실제 '+p.actual+'장'));
  if(type==='card_promoted')out.push(cue('promote','승급 완료',CARD_NAME[p.card_id]||''));
  if(type==='action_points'&&['refill','pierce_first_refund','luck_effect'].includes(p.kind)&&p.amount>0)out.push(cue('energy_gain','행동력 회복','+'+p.amount));
  if(type==='protection_gain'){if(p.spent>0)out.push(cue('shield_block','보호 적용','손실 '+p.preserved+' 보존'));else if(p.after<p.before)out.push(cue(p.kind==='resource'?'resource_drain':'gem_theft','획득량 감소',p.before+' → '+p.after));}
  return out;
 }
 function hitPlan(e){if(e.skipped||e.damage<=0)return [];const out=[];
  if(e.type==='aoe')return (e.hits||[]).some(h=>h.damage>0)?[cue('aoe','광역 타격','실제 피해 '+e.hits.reduce((n,h)=>n+h.damage,0))]:[];
  const id=e.pure||e.pierce_source==='followup'?'followup':e.pierce_source==='link'?'link_transfer':e.redistributed?'pierce_redistribute':e.pierce_source==='card'?'card_pierce':'slash';
  out.push(cue(id,e.label||'기본 타격',e.name+' · 실제 피해 '+e.damage,{duration:520,battle:true}));
  if(e.corePierceDamage>0)out.push(cue('boss_direct','보스 진체력 직격','실제 '+e.corePierceDamage,{duration:220,battle:true}));
  if(e.raw_overflow>0)out.push(cue('overflow_pool','실제 초과 피해 수집',String(e.raw_overflow),{duration:220,battle:true}));return out;
 }
 function clear(){generation++;queue.length=0;active=null;clearTimeout(timer);cancelAnimationFrame(frame);timer=null;frame=null;if(element){element.remove();element=null;}global.LuckGameAudio?.motionStop?.();}
 function canPresent(){return !global.__luckAutoLabBotActive&&!document.hidden;}
 function enqueue(c){if(!canPresent()||!media.effects[c.id]||queue.length>=64)return false;queue.push(c);if(!active)pump();return true;}
 function surface(c){element?.remove();element=document.createElement('aside');element.className='main-media319';element.id='mainMedia319';element.setAttribute('role','status');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=192;canvas.setAttribute('aria-hidden','true');const label=document.createElement('p'),detail=document.createElement('small');label.textContent=c.label;detail.textContent=c.detail;element.append(canvas,label,detail);
  const overlay=document.getElementById('growthEvent318');if(overlay){element.classList.add('inline');overlay.querySelector('h3')?.after(element);}else document.body.append(element);return canvas;
 }
 function pump(){if(active||!queue.length||!canPresent())return;const c=queue.shift(),token=generation;active=c;const spec=media.effects[c.id],duration=c.duration||spec.duration,visual=isVisualMode(),reduce=global.matchMedia?.('(prefers-reduced-motion: reduce)').matches||document.getElementById('battleMotionSkipToggle')?.checked;
  history.push({id:c.id,label:c.label,detail:c.detail});if(history.length>200)history.shift();
  const canvas=visual?surface(c):null,ctx=canvas?.getContext('2d');
  let im=images.get(c.id);if(!im){im=new Image();im.src=spec.image;images.set(c.id,im);}
  let started=null;function tick(now){if(token!==generation||active!==c)return;if(started===null)started=now;const pos=reduce?spec.frames.length-1:Math.min(spec.frames.length-1,Math.floor((now-started)/duration*spec.frames.length));if(ctx&&im.complete&&im.naturalWidth){ctx.clearRect(0,0,192,192);ctx.drawImage(im,spec.frames[pos]*spec.size,0,spec.size,spec.size,0,0,192,192);}if(now-started<duration&&!reduce)frame=requestAnimationFrame(tick);}
  const s=soundFor.get(c.id);if(s)global.LuckGameAudio?.motionCue?.(s);if(canvas)frame=requestAnimationFrame(tick);
  timer=setTimeout(()=>{if(token!==generation)return;cancelAnimationFrame(frame);element?.remove();element=null;active=null;pump();},reduce?120:duration);
 }
 function observe(type,event){try{if(type==='run_started'){clear();seen.clear();return;}if(!canPresent())return;const key=event.run_id+':'+event.seq;if(seen.has(key))return;seen.add(key);if(seen.size>4096)seen.delete(seen.values().next().value);for(const c of eventPlan(type,event.payload||{}))enqueue(c);}catch(error){console.warn('Presentation media unavailable',error.message);}}
 function hit(e){if(!canPresent()||!shouldPlayBattleMotion())return false;for(const c of hitPlan(e))enqueue(c);return hitPlan(e).length>0;}
 function status(s){const id=s.kind==='protected'?'shield_block':s.kind==='theft_success'?'gem_theft':s.kind==='debuff'?(s.title?.includes('연계')?'debuff_link':'debuff_attack'):null;if(id)enqueue(cue(id,s.title,s.detail));}
 function decorate(){const panel=document.getElementById('permanent318'),s=typeof state318!=='undefined'?state318.seed:null;if(panel&&s&&!panel.querySelector('.sprout-icon319')){const im=new Image();im.src=media.icons['sprout_'+s.kind];im.alt=s.name;im.className='sprout-icon319';panel.prepend(im);}}
 global.LuckMainMedia319={observe,hit,clear,status,plan:eventPlan,hitPlan,snapshot:()=>({queued:queue.map(c=>c.id),active:active?.id||null,history:history.slice()}),decorate};
 for(const [id,path]of Object.entries(media.icons))if(!id.startsWith('sprout_'))LUCK_CARD_ICONS[id]=path;
 const result=resultOverlay318;resultOverlay318=function(){const out=result.apply(this,arguments),box=document.getElementById('growthEvent318');if(box&&state318.seed){const shell=box.querySelector('.seed-shell318'),reward=box.querySelector('.seed-reward318');for(const [node,key]of [[shell,'luck_seed313'],[reward,'sprout_'+state318.seed.kind]])if(node){node.replaceChildren();const im=new Image();im.src=media.icons[key];im.alt='';node.append(im);}}return out;};
 const render0=render;render=function(){const out=render0.apply(this,arguments);decorate();return out;};
 const start0=start;start=function(){clear();seen.clear();return start0.apply(this,arguments);};
 const close0=handleModalClose;handleModalClose=function(){clear();return close0.apply(this,arguments);};
 const finish=finishBattleCinematic;finishBattleCinematic=function(){clear();return finish.apply(this,arguments);};
 document.addEventListener('click',e=>{if(e.target.closest?.('#growthEvent318 footer button')||e.target.id==='battleMotionSkipToggle')clear();},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});global.addEventListener('pagehide',clear);
})(window);
