/* v0.2.17 preview: device-only records; no client-generated score is advertised as a verified global score. */
(function(){'use strict';
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tabs=[['daily','일간'],['weekly','주간'],['monthly','월간'],['all','누적'],['endless','♾ 최대 R']];
let tab='daily';
function dayStart(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function periodStart(type){const now=new Date();if(type==='daily')return dayStart(now);if(type==='weekly'){const start=dayStart(now);start.setDate(start.getDate()-(start.getDay()+6)%7);return start;}if(type==='monthly')return new Date(now.getFullYear(),now.getMonth(),1);return new Date(0);}
function rows(type){const source=window.LuckHistory?.read()||[],threshold=periodStart(type);return source.filter(r=>r.initials && (type==='endless'?r.endlessMaxRound>0: new Date(r.date)>=threshold)).sort((a,b)=>type==='endless'? (b.endlessMaxRound||0)-(a.endlessMaxRound||0)||b.score-a.score:b.score-a.score||new Date(a.date)-new Date(b.date)).slice(0,10);}
function render(){const el=$('welcomeRanks');if(!el)return;
 el.innerHTML='<div class="rank-top"><b>🏆 최고기록 순위</b><small>이 기기 기록 · 서버 검증 순위는 추후 제공</small></div><div class="rank-tabs">'+tabs.map(([k,v])=>'<button type="button" data-rank="'+k+'" class="'+(tab===k?'active':'')+'">'+v+'</button>').join('')+'</div><div class="rank-entries">'+(rows(tab).map((r,i)=>'<div class="rank-entry"><b>'+(i+1)+'위 · '+esc(r.initials)+'</b><span>'+(tab==='endless'?'R'+Number(r.endlessMaxRound||0):Number(r.score||0).toLocaleString()+'점')+'</span></div>').join('')||'<p class="rank-empty">아직 등록된 기록이 없어요. 첫 기록의 주인공이 되어보세요!</p>')+'</div>';
 el.querySelectorAll('[data-rank]').forEach(b=>b.onclick=()=>{tab=b.dataset.rank;render();});
}
function openRegistration(){
 const entry=(window.LuckHistory?.read()||[]).find(r=>r.id===String(window.__luckManualRunId||''));
 if(!entry){alert('먼저 게임 기록이 저장되어야 합니다.');return;}
 const modal=$('modal'),body=$('modalContent');if(!modal||!body)return;
 $('modalTitle').textContent='🏆 기록 이니셜 등록';
 body.innerHTML='<div class="rank-register"><p>현재 기록 <b>'+Number(entry.score||0).toLocaleString()+'점</b> · R'+entry.round+(entry.endlessMaxRound?' · ♾ 최고 R'+entry.endlessMaxRound:'')+'</p><label for="rankInitials">이니셜(한글·영문·숫자 2~6자)</label><input id="rankInitials" maxlength="6" autocomplete="off" placeholder="예: NER" value="'+esc(entry.initials||'')+'"><p id="rankError" role="status"></p><button id="rankSubmit" type="button">기록 등록</button></div><small>현재 순위는 이 기기에만 저장됩니다. 서버 전체 공개 랭킹은 검증된 기록만 허용할 예정입니다.</small>';
 modal.classList.remove('hide');$('rankSubmit').onclick=()=>{const initials=$('rankInitials').value.trim().toUpperCase();if(!/^[가-힣A-Z0-9]{2,6}$/.test(initials)){$('rankError').textContent='2~6자의 한글·영문·숫자만 사용할 수 있어요.';return;}
 if(!window.LuckHistory?.setInitials(initials)){$('rankError').textContent='저장에 실패했습니다.';return;}
 render();const welcome=$('welcomeOverlay');if(welcome&&welcome.classList.contains('hide')){const msg=$('cloudStatus');if(msg)msg.textContent='🏆 '+initials+' 기록 저장 완료 (기기 내)';}
 if(typeof phase!=='undefined' && phase!=='gameover' && typeof officialRecord!=='undefined' && officialRecord && typeof showOfficialCompleteModal==='function'){showOfficialCompleteModal();}else{$('modalTitle').textContent='🏆 기록 등록 완료';body.innerHTML='<p><b>'+esc(initials)+'</b> 기록이 기기에 저장됐습니다.</p><button type="button" id="rankRestart">다시 시작</button>'; $('rankRestart').onclick=()=>{modal.classList.add('hide');if(typeof start==='function')start();};}
 };
}
window.LuckRanks={render,openRegistration};document.addEventListener('DOMContentLoaded',render);
})();
