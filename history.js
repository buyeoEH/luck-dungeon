/* Luck Dungeon v0.2.17 — on-device manual run archive. */
(function(){
'use strict';
const KEY='luck_dungeon_manual_runs_v0216', LIMIT=200;
let lastSavedId=null;
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch(_){return [];}}
function textLog(){return [
 'Luck Dungeon v0.2.17 DEV LOG',
 'ROUND='+round+' PHASE='+phase+' SCORE='+scoreValue(),
 'DECK='+deck.length+' RES='+resource+' GEMS='+gems+' ENEMIES='+enemies.length+' ENEMY_HP='+total(),
 'STATS='+JSON.stringify(stats),
 'PERSISTENT_DRAW='+persistentDraw,
 'MODE='+(endlessMode?'ENDLESS':officialRecord?'OFFICIAL_COMPLETE':'OFFICIAL')+' PLAYTIME='+formatPlayTime(officialRecord?officialRecord.playMs:currentPlayMs()),
 'DECK_LIST='+deck.map(c=>c.name).join(', '),'--- LOG ---',...fullLogs
 ].join('\n');}
function save(outcome,reason=''){
 if(window.__luckAutoLabBotActive)return false;
 const id=String(window.__luckManualRunId||'');
 if(!id||lastSavedId===id)return false;
 const list=read();if(list.some(x=>x.id===id)){lastSavedId=id;return false;}
 const entry={id,date:new Date().toISOString(),source:'manual',version:'0.2.17',outcome,reason,round:round,score:officialRecord?officialRecord.score:scoreValue(),playMs:officialRecord?officialRecord.playMs:currentPlayMs(),enemyCount:enemies.length,enemyHp:total(),enemyLimit:gameOverEnemyLimit(round),hpLimit:gameOverHpLimit(round),deckSize:deck.length,stats:JSON.parse(JSON.stringify(stats)),deck:deck.map(c=>c.name),log:textLog()};
 list.unshift(entry);
 try{localStorage.setItem(KEY,JSON.stringify(list.slice(0,LIMIT)));lastSavedId=id;if(window.LuckCloud)window.LuckCloud.record(entry);return true;}
 catch(e){console.warn('LuckHistory: localStorage save failed',e);return false;}
}
function updateRun(patch){
 const id=String(window.__luckManualRunId||'');if(!id)return false;
 const records=read();const found=records.find(r=>r.id===id);if(!found)return false;
 Object.assign(found,patch);try{localStorage.setItem(KEY,JSON.stringify(records));return true;}catch{return false;}
}
function setInitials(initials){return updateRun({initials});}
function updateEndless(maxRound){
 const id=String(window.__luckManualRunId||'');const row=read().find(r=>r.id===id);
 return updateRun({endlessMaxRound:Math.max(row?.endlessMaxRound||0,maxRound)});
}
function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function csv(){const rows=read(),fields=['date','source','version','outcome','reason','round','score','playMs','enemyCount','enemyHp','enemyLimit','hpLimit','deckSize','damageDealt','aoeDamage','pierceDamage','overkillDamage','enemiesKilled','bossesKilled','promotions'];const esc=x=>'"'+String(x??'').replace(/"/g,'""')+'"';return [fields.join(','),...rows.map(r=>fields.map(f=>esc(f in r?r[f]:r.stats?.[f])).join(','))].join('\r\n');}
function view(){const rows=read();const esc=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const modal=document.getElementById('modal'),title=document.getElementById('modalTitle'),body=document.getElementById('modalContent');if(!modal||!body)return;
 title.textContent='📊 내 플레이 기록 ('+rows.length+'회)';
 body.innerHTML='<p style="font-size:12px">이 기기·브라우저에만 저장됩니다. 앱 데이터 삭제 시 기록이 사라질 수 있으니 정기적으로 내보내세요.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="historyCSV">CSV 내보내기</button><button id="historyJSON">전체 JSON 내보내기</button><button id="historyClear">기록 전체 삭제</button></div><div style="max-height:45vh;overflow:auto;margin-top:12px">'+(rows.length?rows.map((r,i)=>'<div style="border-bottom:1px solid #555;padding:8px 0"><b>'+esc(r.outcome==='clear'?'🏆 R30 클리어':'💀 패배')+' · R'+r.round+' · '+r.score.toLocaleString()+'점</b><div style="font-size:11px">'+esc(new Date(r.date).toLocaleString('ko-KR'))+' · '+esc(r.reason)+'</div><button data-export="'+i+'">로그 TXT 저장</button></div>').join(''):'아직 종료된 직접 플레이 기록이 없습니다.')+'</div>';
 modal.classList.remove('hide');
 body.querySelector('#historyCSV').onclick=()=>download('luck-manual-runs.csv','\ufeff'+csv(),'text/csv;charset=utf-8');
 body.querySelector('#historyJSON').onclick=()=>download('luck-manual-runs.json',JSON.stringify(rows,null,2),'application/json');
 body.querySelector('#historyClear').onclick=()=>{if(confirm('저장된 플레이 기록을 모두 삭제할까요?')){localStorage.removeItem(KEY);lastSavedId=null;view();}};
 body.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>{const r=rows[Number(b.dataset.export)];if(r)download('luck-R'+r.round+'-'+r.id+'.txt',r.log,'text/plain;charset=utf-8');});
}
window.LuckHistory={save,read,view,csv,setInitials,updateEndless};
document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('historyBtn');if(b)b.addEventListener('click',view);});
})();
