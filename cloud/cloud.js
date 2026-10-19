/* v0.2.18: private run sync, opt-in public initials, generated bot activity. */
(function(){'use strict';
const cfg=window.LUCK_CLOUD_CONFIG||{},configured=/^https:\/\//.test(cfg.supabaseUrl||'')&&!!cfg.supabaseAnonKey;
const K='luck_cloud_auth_v1',Q='luck_cloud_queue_v1',$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let auth=null,authReady=null,flushing=null;
function status(s){if($('cloudStatus'))$('cloudStatus').textContent=s;}
function read(k,f){try{return JSON.parse(localStorage.getItem(k)||'null')??f;}catch{return f;}}
function store(k,v){localStorage.setItem(k,JSON.stringify(v));}
async function req(path,method='GET',body=null,token=null){
 if(!configured)throw Error('온라인 연결 설정 없음');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const r=await fetch(cfg.supabaseUrl.replace(/\/$/,'')+path,{method,signal:controller.signal,headers:{apikey:cfg.supabaseAnonKey,...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json',Prefer:'return=minimal,resolution=merge-duplicates'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!r.ok)throw Error('서버 응답 '+r.status);return r.status===204?null:await r.json().catch(()=>null);
 }finally{clearTimeout(timer);}
}
async function session(){
 auth=auth||read(K,null);if(auth?.access_token&&auth.expires_at>Date.now()/1000+90)return auth;
 if(authReady)return authReady;
 authReady=(async()=>{
 let a;if(auth?.refresh_token){try{a=await req('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:auth.refresh_token});}catch(e){if(!/응답 (400|401)/.test(e.message))throw e;}}
 if(!a)a=await req('/auth/v1/signup','POST',{});
 if(!a?.access_token||!a?.user?.id)throw Error('익명 저장 연결을 확인해 주세요');
 auth={...a,expires_at:Math.floor(Date.now()/1000)+a.expires_in};store(K,auth);return auth;
 })().finally(()=>authReady=null);return authReady;
}
function enqueue(run){const q=read(Q,[]).filter(x=>x.id!==run.id);q.push(run);store(Q,q.slice(-200));status('☁️ 업로드 대기 '+q.length+'건');}
function manual(item,user){return {id:item.id,user_id:user,created_at:item.date,version:item.version,outcome:item.outcome,reason:item.reason||'',round:item.round,score:item.score,play_ms:item.playMs,enemy_count:item.enemyCount,enemy_hp:item.enemyHp,enemy_limit:item.enemyLimit,hp_limit:item.hpLimit,deck_size:item.deckSize,stats:item.stats||{},deck:item.deck||[],log_text:item.log||'',initials:item.initials||null,endless_max_round:item.endlessMaxRound||0};}
function publicRow(item){return {run_id:item.id,initials:item.initials,created_at:item.date,version:item.version,outcome:item.outcome,round:item.round,score:item.score,play_ms:item.playMs,endless_max_round:item.endlessMaxRound||0};}
async function flush(){
 if(flushing)return flushing;
 flushing=(async()=>{if(!read(Q,[]).length)return;const a=await session();
 while(read(Q,[]).length){const item=read(Q,[])[0];await req('/rest/v1/manual_runs?on_conflict=id','POST',[manual(item,a.user.id)],a.access_token);
 if(item.initials)await req('/rest/v1/leaderboard_entries?on_conflict=run_id','POST',[publicRow(item)],a.access_token);
 // Keep a newer update queued while an older revision was in flight.
 store(Q,read(Q,[]).filter(x=>x.id!==item.id||JSON.stringify(x)!==JSON.stringify(item)));
 }status('☁️ 동기화 완료');})().catch(e=>{status('☁️ 업로드 대기 · '+e.message+' · 온라인 기록에서 재시도');throw e;}).finally(()=>flushing=null);
 return flushing;
}
function record(run){enqueue(run);flush().catch(()=>{});}
async function register(run){enqueue(run);await flush();}
async function list(){const a=await session();return await req('/rest/v1/manual_runs?select=id,created_at,version,initials,outcome,round,score,endless_max_round&order=created_at.desc&limit=200','GET',null,a.access_token);}
function since(type){const d=new Date(Date.now()+9*3600000);let t=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());if(type==='weekly')t-=((d.getUTCDay()+6)%7)*86400000;if(type==='monthly')t=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1);return new Date(t-9*3600000).toISOString();}
async function ranks(type='all'){const time=['daily','weekly','monthly'].includes(type)?'&created_at=gte.'+encodeURIComponent(since(type)):'';return await req('/rest/v1/leaderboard_entries?select=initials,score,round,outcome,created_at,endless_max_round,version&version=eq.0.2.18'+time+(type==='endless'?'&endless_max_round=gt.0&order=endless_max_round.desc,score.desc,created_at.asc':'&order=score.desc,created_at.asc')+'&limit=10');}
async function activity(){const batches=await req('/rest/v1/autolab_batches?select=batch_id,github_run_id,git_sha,analysis,runs_ingested,rounds_ingested,events_ingested,completed_at&status=eq.complete&analysis->>game_version=eq.0.2.18&order=completed_at.desc&limit=1');const b=batches[0];if(!b)return null;
 const events=await req('/rest/v1/autolab_events?select=strategy,seed,round,event_type,payload&batch_id=eq.'+encodeURIComponent(b.batch_id)+'&order=strategy.asc,seed.asc,event_index.desc&limit=60');return {batch:b,events};}
async function showRecords(){status('☁️ 기록 조회 중');try{await flush();const [runs,ai]=await Promise.all([list(),activity()]);$('modalTitle').textContent='☁️ 온라인 기록 · AI 활동 (v0.2.18)';
 const b=ai?.batch,groups=b?.analysis?.strategies||[];
 $('modalContent').innerHTML='<h3>내 온라인 플레이 기록 '+runs.length+'건</h3><div style="max-height:25vh;overflow:auto">'+(runs.map(x=>'<p>'+esc(x.initials||'미등록')+' · v'+esc(x.version)+' · R'+x.round+' · '+Number(x.score).toLocaleString()+'점</p>').join('')||'<p>종료된 직접 플레이가 아직 없습니다.</p>')+'</div><h3>AutoLab 봇 활동</h3><p>규칙 기반 전략 봇 · 실제 v0.2.18 게임 엔진</p>'+(b?'<p>'+b.runs_ingested+'회 · 라운드 '+b.rounds_ingested+'건 · 행동 '+b.events_ingested+'건</p><p><a target="_blank" rel="noopener" href="https://github.com/buyeoEH/luck-dungeon/actions/runs/'+encodeURIComponent(b.github_run_id)+'">GitHub Actions 실행·원본 로그</a></p><pre style="max-height:30vh;overflow:auto;white-space:pre-wrap">'+esc(JSON.stringify(groups,null,2))+'</pre><details><summary>최근 행동 로그 '+ai.events.length+'건</summary><pre style="max-height:30vh;overflow:auto;white-space:pre-wrap">'+esc(ai.events.map(e=>e.strategy+' #'+e.seed+' R'+e.round+' '+e.event_type+' '+JSON.stringify(e.payload)).join('\n'))+'</pre></details>':'<p>v0.2.18 Actions 테스트 결과 업로드를 기다리고 있습니다. 이전 버전과 섞어 표시하지 않습니다.</p>');$('modal').classList.remove('hide');status('☁️ 연결 확인 완료');
 }catch(e){status('☁️ 조회 실패 · '+e.message);}}
function boot(){status(configured?'☁️ 온라인 연결 가능':'☁️ 기기 저장만 사용');if(configured&&read(Q,[]).length)flush().catch(()=>{});window.addEventListener('online',()=>flush().catch(()=>{}));if($('cloudRecordsBtn'))$('cloudRecordsBtn').onclick=showRecords;}
window.LuckCloud={configured,record,register,flush,list,ranks,activity,showRecords};document.addEventListener('DOMContentLoaded',boot);
})();
