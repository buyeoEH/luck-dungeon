/* Optional Supabase sync. Local game works even if cloud is not configured. */
(function(){'use strict';
const cfg=window.LUCK_CLOUD_CONFIG||{};
const configured=/^https:\/\//.test(cfg.supabaseUrl||'')&&!!cfg.supabaseAnonKey;
const K='luck_cloud_auth_v1',Q='luck_cloud_queue_v1';
let auth=null,ready=null;
const $=id=>document.getElementById(id);
function status(s){const e=$('cloudStatus');if(e)e.textContent=s;}
function storage(key,defaultValue){try{return JSON.parse(localStorage.getItem(key)||'null')??defaultValue;}catch{return defaultValue;}}
function store(key,val){localStorage.setItem(key,JSON.stringify(val));}
async function req(path,method='GET',body=null,token=null){
 const r=await fetch(cfg.supabaseUrl.replace(/\/$/,'')+path,{method,headers:{apikey:cfg.supabaseAnonKey,Authorization:'Bearer '+(token||cfg.supabaseAnonKey),...(body?{'Content-Type':'application/json',Prefer:'return=minimal'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!r.ok)throw Error('Cloud HTTP '+r.status+': '+(await r.text()).slice(0,220));
 return r.status===204?null:await r.json().catch(()=>null);
}
async function session(){
 if(!configured)return null;
 if(auth?.access_token&&auth?.expires_at>Date.now()/1000+90)return auth;
 auth=storage(K,null);
 if(auth?.refresh_token){try{const a=await req('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:auth.refresh_token});auth={...a,expires_at:Math.floor(Date.now()/1000)+a.expires_in};store(K,auth);return auth;}catch{auth=null;}}
 const a=await req('/auth/v1/signup','POST',{});if(!a?.access_token||!a?.user?.id)throw Error('Supabase 익명 로그인이 비활성화되어 있습니다.');
 auth={...a,expires_at:Math.floor(Date.now()/1000)+a.expires_in};store(K,auth);return auth;
}
function enqueue(run){const q=storage(Q,[]);if(!q.some(x=>x.id===run.id))q.push(run);store(Q,q.slice(-200));status('☁️ 업로드 대기 '+q.length+'건');}
async function flush(){if(!configured){status('☁️ 온라인 저장 미설정 · 기기 저장만 사용');return;}
 if(ready)return ready;
 ready=(async()=>{const a=await session();let q=storage(Q,[]);for(const item of q){
 const row={id:item.id,user_id:a.user.id,created_at:item.date,version:item.version,outcome:item.outcome,reason:item.reason,round:item.round,score:item.score,play_ms:item.playMs,enemy_count:item.enemyCount,enemy_hp:item.enemyHp,enemy_limit:item.enemyLimit,hp_limit:item.hpLimit,deck_size:item.deckSize,stats:item.stats,deck:item.deck,log_text:item.log};
 await req('/rest/v1/manual_runs?on_conflict=id','POST',[row],a.access_token);
 q=q.filter(x=>x.id!==item.id);store(Q,q);
 }status('☁️ 동기화 완료');})().catch(e=>{console.warn('Cloud sync failed:',e);status('☁️ 업로드 대기 · '+e.message);}).finally(()=>{ready=null;});return ready;
}
async function list(){const a=await session();if(!a)return [];return await req('/rest/v1/manual_runs?select=id,created_at,outcome,reason,round,score,enemy_count,enemy_hp&order=created_at.desc&limit=200','GET',null,a.access_token);}
async function botSummary(){if(!configured)return [];return await req('/rest/v1/bot_runs?select=strategy,round,score,cleared,aoe_damage,pierce_damage,damage&limit=5000');}
function record(run){enqueue(run);flush();}
function boot(){status(configured?'☁️ 온라인 연결 준비':'☁️ 온라인 저장 미설정 · 기기 저장만 사용');if(configured){flush();window.addEventListener('online',flush);}
 const b=$('cloudRecordsBtn');if(b)b.onclick=async()=>{status('☁️ 기록 조회 중');try{const runs=await list(), bots=await botSummary();const modal=$('modal'),title=$('modalTitle'),body=$('modalContent');title.textContent='☁️ AutoLab 온라인 기록';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const groups={};for(const x of bots){(groups[x.strategy]??=[]).push(x);}
 const stats=Object.entries(groups).map(([name,arr])=>`<tr><td>${esc(name)}</td><td>${arr.length}</td><td>${Math.round(arr.reduce((s,x)=>s+x.score,0)/arr.length).toLocaleString()}</td><td>${(100*arr.filter(x=>x.cleared).length/arr.length).toFixed(1)}%</td></tr>`).join('');
 body.innerHTML=`<p>내 온라인 플레이 기록 ${runs.length}건 · 서버 봇 기록 ${bots.length}건 (최대 5,000건 조회)</p><h4>전략별 봇 성과</h4><div style="overflow:auto"><table style="width:100%"><tr><th>전략</th><th>횟수</th><th>평균 점수</th><th>클리어율</th></tr>${stats||'<tr><td colspan="4">서버 봇 실행 기록 없음</td></tr>'}</table></div><h4>내 최근 기록</h4><div style="max-height:35vh;overflow:auto">${runs.map(x=>`<p>R${x.round} · ${Number(x.score).toLocaleString()}점 · ${esc(x.outcome)} · ${esc(x.created_at)}</p>`).join('')||'아직 기록이 없습니다.'}</div>`;modal.classList.remove('hide');status('☁️ 동기화 완료');}catch(e){status('☁️ 조회 실패: '+e.message);}};
}
window.LuckCloud={record,flush,list,botSummary,configured};document.addEventListener('DOMContentLoaded',boot);
})();
