/* v0.3 device-only records. No requests to production or official rankings. */
(function(){'use strict';
const KEY='luck_local_v030_rankings',B=window.LUCK_BUILD;
const get=()=>{try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows:[];}catch{return[];}};
const current=r=>r&&r.version===B.version;
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
window.LuckCloud={
 configured:false,record(){},async flush(){},
 async list(){return(window.LuckHistory?.read()||[]).filter(current).map(r=>({...r,created_at:r.date,endless_max_round:r.endlessMaxRound||0}));},
 async register(r){if(!current(r)||!r.id)return false;const rows=get().filter(x=>!x||x.id!==r.id);rows.push({...r,created_at:r.date,endless_max_round:r.endlessMaxRound||0});localStorage.setItem(KEY,JSON.stringify(rows));return true;},
 async ranks(type='all'){
  let rows=get().filter(r=>current(r)&&r.initials);const now=new Date();
  if(['daily','weekly','monthly'].includes(type)){const k=new Date(now.getFullYear(),now.getMonth(),now.getDate());if(type==='weekly')k.setDate(k.getDate()-(k.getDay()+6)%7);if(type==='monthly')k.setDate(1);rows=rows.filter(r=>new Date(r.created_at||r.date)>=k);}
  if(type==='endless')rows=rows.filter(r=>r.endless_max_round>0).sort((a,b)=>b.endless_max_round-a.endless_max_round);else rows.sort((a,b)=>b.score-a.score);return rows.slice(0,10);
 },
 async activity(){return null;},
 showRecords(){const m=document.getElementById('modal'),t=document.getElementById('modalTitle'),b=document.getElementById('modalContent');if(!m||!b)return;t.textContent='📊 v'+B.version+' 기기 기록';const rows=(window.LuckHistory?.read()||[]).filter(current);b.innerHTML='<p>이 기기에만 저장합니다. 운영 서버·정식 랭킹에는 전송하지 않습니다. 이전 버전 기록은 자동 이관하지 않습니다.</p>'+rows.map(r=>'<p>'+safe(r.outcome==='clear'?'🏆 최종 클리어':'💀 게임 종료')+' · R'+r.round+' · '+Number(r.score||0).toLocaleString()+'점</p>').join('');m.classList.remove('hide');}
};
document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('cloudRecordsBtn');if(b)b.onclick=window.LuckCloud.showRecords;const s=document.getElementById('cloudStatus');if(s)s.textContent='🔒 v'+B.version+' 기기 저장 전용 · 정식 랭킹 미전송';});
})();
