#!/usr/bin/env python3
"""LUCK Dungeon v0.2.19 consolidated LOCAL playtest build.
Builds using the ORIGINAL v0.2.18 source and keeps its interface and assets.
Python standard library only. Source can be local v0.2.18 ZIP/directory or pinned GitHub snapshot.
"""
import argparse, base64, html, io, json, mimetypes, re, shutil, sys, tempfile, urllib.request, zipfile
from pathlib import Path

PIN = '4fddbc5c6126358c47fbf6dd37bcc64f99477491'
URL = f'https://codeload.github.com/buyeoEH/luck-dungeon/zip/{PIN}'
VERSION='0.2.19'


def once(text, old, new, label):
    n=text.count(old)
    if n!=1:
        raise ValueError(f'게임 버전 불일치 — {label}: 기준 문자열 {n}회 탐지(필요 1회). v0.2.18 온라인/오디오 원본을 사용하세요.')
    return text.replace(old,new,1)


def adjust_price(text, card_id, original, new):
    # Only change this card's exact opening id,price field; not in generated sprites.
    pat=re.compile(r"(\{\s*id:\s*['\"]"+re.escape(card_id)+r"['\"],\s*name:\s*['\"][^'\"]+['\"],\s*price:\s*)"+str(original)+r'\b')
    result,count=pat.subn(lambda m:m.group(1)+str(new),text)
    if count!=1: raise ValueError(f'가격 패치 실패: {card_id}, 기존 {original}: {count}개')
    return result


def patch_game(src):
    # Update visible build marker but never rewrite identifiers used by online leaderboard.
    src=src.replace('v0.2.18 · Original UI Playtest','v0.2.19 · Integrated Local Playtest')
    prices=[('thief',18,14),('mage',18,14),('pike',16,13),('master',20,16),
            ('dice',13,11),('ag2',17,14),('rg',10,8),('cg',12,10),
            ('d5',14,12),('potion',14,12),('box',16,14)]
    for cid,old,new in prices: src=adjust_price(src,cid,old,new)
    src=once(src,"endlessMaxRound: 0 }; }", "endlessMaxRound: 0, v0219PureHits:0, v0219PureDamage:0, v0219MixedLuck:{}, v0219Links:{}, v0219Purchases:{}, v0219Uses:{} }; }", "통합 테스트 통계")
    src=once(src,"  hand.splice(i, 1);\n  stats.cardsUsed++;", "  hand.splice(i, 1);\n  stats.cardsUsed++;\n  stats.v0219Uses[c.baseId||c.id]=(stats.v0219Uses[c.baseId||c.id]||0)+1;", "일반 카드 사용 통계")
    src=once(src,"  hand=hand.filter(x=>x.id!==id);\n  stats.cardsUsed++;", "  hand=hand.filter(x=>x.id!==id);\n  stats.cardsUsed++;\n  stats.v0219Uses[c.baseId||c.id]=(stats.v0219Uses[c.baseId||c.id]||0)+1;", "선택형 카드 사용 통계")
    src=once(src,"  stats.cardsBought++;", "  stats.cardsBought++;\n  stats.v0219Purchases[id]=(stats.v0219Purchases[id]||0)+1;", "카드 구매 통계")
    src=once(src,"  roundLinkDone[id]=true; const b=bonus+deckLinkAmp(); linkComboAttack+=b; stats.linkComboTriggers++;", "  roundLinkDone[id]=true; const b=bonus+deckLinkAmp(); linkComboAttack+=b; stats.linkComboTriggers++; stats.v0219Links[id]=(stats.v0219Links[id]||0)+1;", "연계 발동 통계")

    # v0.2.18 baseline promo definitions are retained in their original order.
    new_promos="""
  // v0.2.19 integrated experiment: optional long-term growth for single-step lines.
  { id:'p_raider2',tier:2,branch:'약탈',from:{raider:1,thief:1,chain:1},cost:{res:9,gem:1},card:{id:'raiderking',name:'약탈왕검',type:'specialAttack',atk:24,res:7,passive:'res',text:'약탈 2차 · 공격 +24 / 손패 등장 시 자원 +7'} },
  { id:'p_scholar2',tier:2,branch:'마법',from:{scholar:1,mage:1,d5:1},cost:{res:9,gem:1},card:{id:'wisdomsword',name:'현자의 마법검',type:'specialAttack',atk:25,draw:5,passive:'draw',text:'마법 2차 · 공격 +25 / 손패 등장 시 드로우 +5'} },
  { id:'p_armor2',tier:2,branch:'방어',from:{ag2:1,ag:1,gg:1},cost:{res:9,gem:1},card:{id:'stararmor',name:'성채의 갑주',type:'protection',atk:12,res:4,protect:{attack:6,gem:2},text:'방어 2차 · 공격 +12 / 자원 +4 / 공격 보호 +6 / 보석 보호 +2'} },
  { id:'p_masterlink2',tier:2,branch:'순수 연계',from:{combo:1,master:1,sam:1},cost:{res:10,gem:1},card:{id:'masterlink',name:'연계 대검',type:'attack',atk:30,linkAmp:8,text:'공격 +30 / 행동 연계 공격 보너스 +8 / 광역·관통 없는 전술용'} },
  // Mixed luck: dedicated role-specific outcome tables; no destruction or legend.
  { id:'p_luck_link',tier:2,branch:'운빨 연계',from:{fateblade:1,combo:1,coin:1},cost:{res:9,gem:1},card:{id:'lucklink',name:'운명의 연계검',type:'random',atk:18,linkAmp:5,mixedTag:'luck',text:'운빨+연계 · 공격 +18 / 연계 증폭 +5 / 50% +18공격, 35% +7공격, 15% -5공격'} },
  { id:'p_luck_draw',tier:1,branch:'운빨 드로우',from:{dice:1,d5:1},cost:{res:6},card:{id:'luckdraw',name:'확률의 서',type:'random',mixedTag:'luck',text:'운빨+드로우 · 50% 5장, 35% 2장, 15% 0장 추가 드로우 · 카드 소멸 없음'} },
  { id:'p_luck_guard',tier:1,branch:'운빨 보호',from:{coin:1,ag:1},cost:{res:6},card:{id:'luckguard',name:'도박사의 방패',type:'random',mixedTag:'luck',text:'운빨+보호 · 50% 전체 보호 +3, 35% +1, 15% 변화 없음'} },
  { id:'p_luck_forge',tier:2,branch:'운빨 경제',from:{luckminer:1,gold:1},cost:{res:9,gem:1},card:{id:'luckforge',name:'황금 운명검',type:'random',atk:17,mixedTag:'luck',text:'운빨+경제검 · 영구 공격 +17 / 50% 자원 +10, 35% +5, 15% +1'} },
"""
    src=once(src,"  // v0.2.17 · 운빨 승급도 랜덤 상점 재료가 필요합니다.",new_promos+"\n  // v0.2.17 · 운빨 승급도 랜덤 상점 재료가 필요합니다.","신규 승급 삽입")
    src=once(src,"// v0.2.18: the six *new* cards alone receive additional files; original icons are unchanged.","// v0.2.19: original artwork preserved; added cards reuse family illustration.","기존 아이콘 위치")
    src=once(src,"function luckIcon(card, kind) {", """// Preserve existing icon mapping: new experimental cards reuse their parent art.
Object.entries({raiderking:'raider',wisdomsword:'scholar',stararmor:'ag2',masterlink:'linkhero',lucklink:'fateblade',luckdraw:'d8',luckguard:'ag',luckforge:'royalgold'}).forEach(([id,parent])=>{
  if(!LUCK_CARD_ICONS[id]) LUCK_CARD_ICONS[id]=LUCK_CARD_ICONS[parent]||LUCK_CARD_ICONS['sword'];
});
function luckIcon(card, kind) {""","신규 카드 가족 아이콘")

    # Dedicated mixed luck effects: one manual play of a card causes exactly one event; no automatic recursion.
    src=once(src,"if (c.baseId === 'fateblade' || c.baseId === 'luckminer') {", "if (['fateblade','luckminer','lucklink','luckdraw','luckguard','luckforge'].includes(c.baseId)) {", "전용 운빨 진입")
    old="""    } else {
      const rolled = [7,4,1][outcome], actual = gain('resource',rolled);
      resource += actual;
      changes.push('⛏️ 자원 결과 +' + rolled + ' (디버프 적용 획득 +' + actual + ')');
    }
    const label ="""
    new="""    } else if (c.baseId === 'lucklink') {
      const n = [18,7,-5][outcome]; tempAttack+=n;
      changes.push('🔗 이번 전투 연계 공격 '+(n>=0?'+':'')+n);
    } else if (c.baseId === 'luckdraw') {
      const wanted=[5,2,0][outcome],got=wanted?drawCards(wanted):0;
      changes.push('🃏 추가 드로우 '+got+'장');
    } else if (c.baseId === 'luckguard') {
      const n=[3,1,0][outcome];prot.all+=n;
      changes.push('🛡 전체 보호 +'+n);
    } else {
      const rolled=c.baseId==='luckforge'?[10,5,1][outcome]:[7,4,1][outcome];
      const actual = gain('resource',rolled); resource += actual;
      changes.push('⛏️ 자원 결과 +' + rolled + ' (디버프 적용 획득 +' + actual + ')');
    }
    const label ="""
    src=once(src,old,new,"전용 운빨 사건표")
    src=once(src,"    const label = ['✨ 좋은 결과','➖ 보통 결과','🌧 낮은 결과'][outcome];", "    const label = ['✨ 좋은 결과','➖ 보통 결과','🌧 낮은 결과'][outcome];\n    const statKey=c.baseId+':'+outcome;stats.v0219MixedLuck[statKey]=(stats.v0219MixedLuck[statKey]||0)+1;", "혼합 운빨 사건 통계")

    # Make ordered action chaining systematic; every chain one trigger per round.
    src=once(src,"const ACTION_LINKS = [", """const ACTION_LINKS = [
  {id:'luck_economy',name:'운명의 투자',seq:['luck','economy'],bonus:10,text:'운빨 → 경제'},
  {id:'economy_luck',name:'예측 불가 채굴',seq:['economy','luck'],bonus:10,text:'경제 → 운빨'},
  {id:'luck_draw',name:'운명의 순환',seq:['luck','draw'],bonus:11,text:'운빨 → 드로우'},
  {id:'draw_luck',name:'우연의 연쇄',seq:['draw','luck'],bonus:11,text:'드로우 → 운빨'},
  {id:'guard_luck',name:'수호의 도박',seq:['protect','luck'],bonus:11,text:'보호 → 운빨'},
  {id:'luck_guard',name:'행운의 수호',seq:['luck','protect'],bonus:11,text:'운빨 → 보호'},""","운빨 행동 연계")
    src=once(src,"const TACTICAL_LINKS = [", """const TACTICAL_LINKS = [
  {id:'attack_link',name:'검술의 전개',need:['attack','link'],bonus:13,text:'공격 카드 + 연계 카드'},
  {id:'attack_luck',name:'우연한 강타',need:['attack','luck'],bonus:11,text:'공격 카드 + 운빨 카드'},
  {id:'luck_link',name:'운명의 연계',need:['luck','link'],bonus:13,text:'운빨 카드 + 연계 카드'},
  {id:'draw_luck',name:'확률의 기동',need:['draw','luck'],bonus:9,text:'드로우 카드 + 운빨 카드'},""","운빨 전술 콤보")
    src=once(src,"    if(c.type==='aoeAttack'||c.passive==='aoe'||c.aoe||c.perEnemy) tags.add('aoe');", """    if((c.atk||0)>0 && (c.type==='attack'||c.type==='specialAttack'||c.type==='random')) tags.add('attack');
    if(c.type==='random') tags.add('luck');
    if(c.draw>0 || c.type==='draw' || c.type==='drawFilter') tags.add('draw');
    if(c.type==='aoeAttack'||c.passive==='aoe'||c.aoe||c.perEnemy) tags.add('aoe');""","콤보 태그 확장")
    src=once(src,"const TAG_KO={aoe:'광역',pierce:'관통',link:'연계',draw:'드로우',economy:'경제',protect:'보호'};",
        "const TAG_KO={aoe:'광역',pierce:'관통',link:'연계',draw:'드로우',economy:'경제',protect:'보호',attack:'공격',luck:'운빨'};", "연계 태그 표시")

    # Controlled multi-attack only for NO aoe AND NO pierce. Each blow independently resolves;
    # never convert overkill into another enemy (that distinction belongs to Pierce).
    anchor="""    const singleActual = parts.reduce((sum, part) => sum + Number((part.match(/ (\\d+)$/) || [0,0])[1]), 0);"""
    replacement="""    // v0.2.19: Pure-attack route. Additional *separate* strikes, not overkill transfer.
    // Only counts as this archetype when the current fight uses zero AoE and zero Pierce.
    // Each independent hit is limited to 55% of final attack; high base power unlocks more.
    // Never consumes extra cards, resources or gems, and applies to boss HP as normal.
    if(startPierce===0 && aoeTotal===0 && hit>=55 && deckAtk()>=35){
      const extras = hit>=210 ? 4 : hit>=145 ? 3 : hit>=95 ? 2 : 1;
      for(let k=0;k<extras && enemies.length;k++){
        const t=enemies[0],before=t.hp, blow=Math.max(1,Math.floor(hit*.55));
        const dmg=Math.min(before,blow);t.hp-=dmg;
        parts.push(t.name+' '+dmg);
        stats.v0219PureHits++;stats.v0219PureDamage+=dmg;
        battleEvents.push({type:'strike',label:'기본 연속타 '+(k+2),id:battleEnemyIndex.get(t),name:t.name,before,damage:dmg,after:t.hp,killed:t.hp===0});
        if(t.hp===0){ killedEnemies.push(t.name); if(t.boss){bossKilled=true;killedBossZones.add(t.debuffZone);} enemies.shift(); }
        // If the target survives, the next independent strike hits it again.
      }
    }
    const singleActual = parts.reduce((sum, part) => sum + Number((part.match(/ (\\d+)$/) || [0,0])[1]), 0);"""
    src=once(src,anchor,replacement,"순수 공격 연속타")
    # Amend tutorial to accurately explain the new no-Pierce route.
    src=src.replace('광역·관통·승급을 활용해 적 누적을 관리하세요.','공격력 연속타·연계·광역·관통 등 다양한 전략으로 적 누적을 관리하세요.')
    src=src.replace('관통 N은 적 처치 후 남은 피해를 다음 적에게 전달하는 최대 N회입니다.','관통 N은 초과 피해 전달입니다. 관통·광역이 없어도 일정 공격력 이상이면 독립 연속타가 발동합니다.')
    return src


def patch_history(src):
    src=src.replace('Luck Dungeon v0.2.18 DEV LOG','Luck Dungeon v0.2.19 DEV LOG')
    src=src.replace("version:'0.2.18'","version:'0.2.19'")
    src=src.replace("'🏆 R30 클리어':'💀 패배'","'🏆 최종 클리어 · R30':'💀 도전 종료'")
    # Explicit clear status in exported CSV for comparison.
    src=src.replace("'date','source','version','outcome'","'date','source','version','outcome'")
    return src


def patch_rankings(src):
    src=src.replace("'<span>'+(tab==='endless'?", "'<em class=\"luck-clear-tag\">'+(r.outcome==='clear'?'🏆 클리어':'💀 종료')+'</em><span>'+(tab==='endless'?")
    src=src.replace("'+Number(entry.score||0).toLocaleString()+'점</b> · R'+entry.round+'", "'+Number(entry.score||0).toLocaleString()+'점</b> · '+(entry.outcome==='clear'?'🏆 최종 클리어':'💀 게임 종료')+' · R'+entry.round+'")
    src=src.replace("v0.2.18 · 플레이어 제출 기록", "v0.2.19 · 이 브라우저에서 직접 등록한 테스트 기록")
    return src


def offline_cloud():
    return r'''/* v0.2.19 isolated local test cloud adapter: no network or live database writes. */
(function(){'use strict';
const KEY='luck_local_0219_rankings';
const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
window.LuckCloud={
 configured:false, record(){},async flush(){},
 async list(){return(window.LuckHistory?.read()||[]).map(r=>({...r,created_at:r.date,endless_max_round:r.endlessMaxRound||0}));},
 async register(r){const rows=get().filter(x=>x.id!==r.id);rows.push({...r,created_at:r.date,endless_max_round:r.endlessMaxRound||0});localStorage.setItem(KEY,JSON.stringify(rows));},
 async ranks(type='all'){let rows=get().filter(r=>r.initials);const now=new Date();if(['daily','weekly','monthly'].includes(type)){const k=new Date(now.getFullYear(),now.getMonth(),now.getDate());if(type==='weekly')k.setDate(k.getDate()-(k.getDay()+6)%7);if(type==='monthly')k.setDate(1);rows=rows.filter(r=>new Date(r.created_at||r.date)>=k)}if(type==='endless')rows=rows.filter(r=>r.endless_max_round>0).sort((a,b)=>b.endless_max_round-a.endless_max_round);else rows.sort((a,b)=>b.score-a.score);return rows.slice(0,10)},
 async activity(){return null},
 showRecords(){const m=document.getElementById('modal'),t=document.getElementById('modalTitle'),b=document.getElementById('modalContent');if(!m||!b)return;t.textContent='📊 v0.2.19 로컬 기록';const rows=(window.LuckHistory?.read()||[]);b.innerHTML='<p>로컬 테스트입니다. 서버에 기록을 전송하지 않습니다.</p>'+rows.map(r=>'<p>'+safe(r.outcome==='clear'?'🏆 최종 클리어':'💀 게임 종료')+' · R'+r.round+' · '+Number(r.score||0).toLocaleString()+'점</p>').join('');m.classList.remove('hide')}
};
document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('cloudRecordsBtn');if(b)b.onclick=window.LuckCloud.showRecords;const s=document.getElementById('cloudStatus');if(s)s.textContent='🔒 0.2.19 독립 로컬 테스트';});
})();'''


def ui_patch_js():
    return r'''/* v0.2.19 compact UI: all original player controls stay intact. */
(function(){'use strict';
function addToggles(){
 document.querySelectorAll('.link-hud').forEach(box=>{
   if(box.classList.contains('luck-link-init'))return;box.classList.add('luck-link-init');
   const h=box.querySelector('strong');if(!h)return;h.tabIndex=0;h.setAttribute('role','button');h.setAttribute('aria-label','연계 전술 전체 보기 또는 접기');
   const act=()=>box.classList.toggle('luck-expanded');
   h.addEventListener('click',act);h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act()}});
 });
 for(const selector of ['#hand .card','#basicShop .shop-card','#randomShop .shop-card','#promoList .promo-card']){
  document.querySelectorAll(selector).forEach(box=>{
   if(box.querySelector('.luck-info-toggle'))return;
   const name=box.querySelector('h3,b');if(!name)return;
   const btn=document.createElement('button');btn.type='button';btn.className='luck-info-toggle';btn.textContent='ⓘ 설명';btn.setAttribute('aria-expanded','false');
   btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const on=box.classList.toggle('luck-expanded');btn.textContent=on?'접기':'ⓘ 설명';btn.setAttribute('aria-expanded',String(on));});
   name.insertAdjacentElement('afterend',btn);
  });
 }
}
function boot(){
 const label=document.createElement('div');label.className='luck-test-marker';label.innerHTML='🧪 v0.2.19 통합 로컬 테스트 · 기록은 브라우저에 저장';
 const app=document.querySelector('#app');if(app)app.prepend(label);
 const historyTitle=document.querySelector('.log-title');
 if(historyTitle){const btn=document.createElement('button');btn.type='button';btn.className='mini-btn';btn.textContent='📜 로그 펼치기';historyTitle.prepend(btn);document.body.classList.add('luck-log-collapsed');btn.onclick=()=>{let on=document.body.classList.toggle('luck-log-collapsed');btn.textContent=on?'📜 로그 펼치기':'📜 로그 접기';};}
 const enemy=document.getElementById('enemySection');if(enemy){let btn=document.createElement('button');btn.type='button';btn.className='mini-btn';btn.textContent='👹 적 상세 펼치기';enemy.prepend(btn);enemy.classList.add('luck-enemy-compact');btn.onclick=()=>{let on=enemy.classList.toggle('luck-enemy-compact');btn.textContent=on?'👹 적 상세 펼치기':'👹 적 상세 접기';};}
 addToggles();const observer=new MutationObserver(()=>{addToggles()});
 const appRoot=document.getElementById('app');if(appRoot)observer.observe(appRoot,{childList:true,subtree:true});
 const css=document.createElement('style');css.textContent=window.LUCK_V0219_COMPACT_CSS||'';document.head.appendChild(css);
}
window.addEventListener('DOMContentLoaded',boot);
})();'''

CSS=r'''
.luck-test-marker{padding:5px 8px;border:1px solid #64748b;border-radius:8px;background:#101a2a;color:#cbd5e1;font-size:11px;text-align:center}
.luck-info-toggle{font-size:10px!important;width:auto!important;margin:3px 0!important;padding:3px 6px!important;border:1px solid #475569!important;border-radius:5px!important;background:#273449!important;color:#bae6fd!important;cursor:pointer}
#hand .card:not(.luck-expanded) .desc,#basicShop .shop-card:not(.luck-expanded) p,#randomShop .shop-card:not(.luck-expanded) p,#promoList .promo-card:not(.luck-expanded) .promo-mats{display:none!important}
#hand .card:not(.luck-expanded){min-height:96px;padding:7px}
#hand .card h3{font-size:13px;line-height:1.25}
#randomShop .shop-card,#basicShop .shop-card{padding:7px}
#promoList .promo-card{padding:7px}
.luck-log-collapsed #log{display:none!important}
#enemySection.luck-enemy-compact #enemies{display:none!important}
#enemySection.luck-enemy-compact .section-title,#enemySection.luck-enemy-compact .sub-info{display:none!important}
.luck-clear-tag{font-style:normal;font-size:10px;color:#fde68a;white-space:nowrap;margin:0 6px}
#buffStatus{max-height:145px;overflow:auto}
.link-hud .link-chip:not(.ready):not(.near){display:none}
.link-hud.luck-expanded .link-chip{display:inline-flex!important}
.link-hud>strong{cursor:pointer}
.link-hud small{display:none}
.link-hud.luck-expanded small{display:block}
@media(max-width:600px){.dashboard{gap:3px 7px;font-size:11px}.card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#hand .card{min-width:0}.luck-info-toggle{min-height:22px}}
'''


def unzip_source(path,out):
    path=Path(path)
    if path.is_dir():
        return path
    if not zipfile.is_zipfile(path): raise ValueError('ZIP 파일이 아니거나 파일이 손상되었습니다.')
    with zipfile.ZipFile(path) as z:
        for item in z.infolist():
            part=Path(item.filename)
            if item.is_dir():continue
            if part.is_absolute() or '..' in part.parts: raise ValueError('안전하지 않은 ZIP 경로입니다.')
            if item.file_size>100_000_000: raise ValueError('단일 파일 크기 제한 초과')
            dst=out / part;dst.parent.mkdir(parents=True,exist_ok=True)
            with z.open(item) as s,dst.open('wb') as t:shutil.copyfileobj(s,t)
    return out


def source_root(where):
    if where.is_file() and where.suffix.lower() in ('.html','.htm'):return where
    roots=[]
    for fp in where.rglob('game.js'):
        d=fp.parent
        if (d/'index.html').is_file() and (d/'history.js').is_file() and (d/'avatars.js').is_file():
            roots.append(d)
    if roots:return min(roots,key=lambda d:len(d.parts))
    # Earlier single-file standalone releases may contain the full scripts already inlined.
    for html_file in where.rglob('*.html'):
        if html_file.stat().st_size>100_000:
            with html_file.open('r',encoding='utf-8',errors='replace') as f: head=f.read(170_000)
            if 'const BASIC =' in head and 'const RANDOM_POOL =' in head:
                return html_file
    raise ValueError('v0.2.18 게임 소스가 없습니다. game.js가 포함된 ZIP 또는 단독 HTML 원본이 필요합니다.')


def embed_asset_paths(js,source,allow_audio=True):
    files=list(source.rglob('*'))
    pathmap={str(f.relative_to(source)).replace('\\','/'):f for f in files if f.is_file()}
    # Single-file conversion for images referenced as assets/... in JavaScript/markup.
    paths=set(re.findall(r'assets/(?:cards|player|enemies)/[A-Za-z0-9_.-]+\.(?:png|webp|jpe?g|gif)',js))
    missing=[]
    for path in sorted(paths,key=len,reverse=True):
        file=pathmap.get(path)
        if file and file.stat().st_size<6_000_000:
            data='data:'+ (mimetypes.guess_type(path)[0] or 'image/png')+';base64,'+base64.b64encode(file.read_bytes()).decode()
            js=js.replace(path,data)
        else:
            missing.append(path)
            symbol='👹' if '/enemies/' in path else ('🗡️' if '/player/' in path else '⚔️')
            fallback='<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#1e293b" rx="22"/><text x="64" y="87" font-size="74" text-anchor="middle">'+symbol+'</text></svg>'
            js=js.replace(path,'data:image/svg+xml;base64,'+base64.b64encode(fallback.encode('utf-8')).decode())
    return js,missing


def build_inlined(source_html,out):
    # Transform the actual ORIGINAL standalone scripts, preserving its original layout.
    out.mkdir(exist_ok=True,parents=True)
    idx=source_html.read_text(encoding='utf-8')
    changed=[]
    script_pattern=re.compile(r'(<script\b[^>]*>)(.*?)(</script>)',re.I|re.S)
    def modify(m):
        js=m.group(2)
        if 'const BASIC =' in js and 'const RANDOM_POOL =' in js and 'function resetStats()' in js:
            js=patch_game(js);changed.append('game')
        elif 'Luck Dungeon v0.2.18 — on-device manual run archive' in js or ('const KEY=\'luck_dungeon_manual_runs_v0216\'' in js and 'window.LuckHistory' in js):
            js=patch_history(js);changed.append('history')
        elif 'Public player-submitted rankings.' in js or ('window.LuckRanks=' in js and 'rank-register' in js):
            js=patch_rankings(js);changed.append('ranking')
        elif 'private run sync, opt-in public initials' in js or ('window.LuckCloud=' in js and 'supabaseUrl' in js):
            js=offline_cloud();changed.append('cloud')
        elif 'LUCK_CLOUD_CONFIG' in js:
            js='';changed.append('config')
        return m.group(1)+js.replace('</script','<\\/script')+m.group(3)
    idx=script_pattern.sub(modify,idx)
    if 'game' not in changed or 'history' not in changed:
        raise ValueError('단독 HTML에 필수 게임 또는 플레이 기록 스크립트가 없습니다. 온라인/오디오 v0.2.18 원본이 맞는지 확인하세요.')
    # Local-only: override any remaining network ranking code if it was not recognized.
    if 'cloud' not in changed:
        idx=idx.replace('</body>','<script>'+offline_cloud()+'</script></body>',1)
    idx=idx.replace('v0.2.18 · Original UI Playtest','v0.2.19 · Integrated Local Playtest').replace('버전: v0.2.18 (기존 화면 유지)','버전: v0.2.19 (기존 화면 유지, 8대 통합 변경)')
    ui='<script>window.LUCK_V0219_COMPACT_CSS='+json.dumps(CSS,ensure_ascii=False)+';</script><script>'+ui_patch_js()+'</script>'
    idx=idx.replace('</body>',ui+'</body>',1)
    idx,missing=embed_asset_paths(idx,source_html.parent)
    output=out/'LUCK-Dungeon-v0.2.19-통합로컬테스트.html'
    output.write_text(idx,encoding='utf-8')
    report='단일 HTML v0.2.18 원본에서 v0.2.19 통합 실험판 생성. 수정 스크립트: '+', '.join(changed)+'\n'
    report+='그림/음원은 원본 HTML 내장 상태를 유지합니다.\n'
    if missing:report+='누락 그림 대체: '+', '.join(missing)+'\n'
    report+='게임 규칙 브라우저 실플레이 및 R30 밸런스 검증은 아직 완료되지 않았습니다.\n'
    (out/'테스트안내.md').write_text(report,encoding='utf-8')
    return output,report


def build(src,out,embed_audio=True):
    if src.is_file():return build_inlined(src,out)
    out.mkdir(exist_ok=True,parents=True)
    idx=(src/'index.html').read_text(encoding='utf-8')
    game=patch_game((src/'game.js').read_text(encoding='utf-8'))
    game,missing=embed_asset_paths(game,src)
    avatar=(src/'avatars.js').read_text(encoding='utf-8')
    avatar,missing2=embed_asset_paths(avatar,src)
    history=patch_history((src/'history.js').read_text(encoding='utf-8'))
    ranking=patch_rankings((src/'rankings.js').read_text(encoding='utf-8'))
    audio=(src/'luck-audio.js').read_text(encoding='utf-8') if (src/'luck-audio.js').exists() else ''
    audio_files=list((src/'assets/audio').glob('*')) if (src/'assets/audio').exists() else []
    if audio and embed_audio and audio_files:
        # Audio data is embedded only if available in the input source ZIP.
        data={f.name:'data:'+(mimetypes.guess_type(f.name)[0] or 'audio/wav')+';base64,'+base64.b64encode(f.read_bytes()).decode() for f in audio_files if f.stat().st_size<15_000_000}
        repl='a.src=(window.LUCK_AUDIO_DATA_MAP[(fallback?t.file.replace(/\\.ogg$/,\'.mp3\'):t.file).split(\'/\').pop()]||new URL(\'assets/\'+(fallback?t.file.replace(/\\.ogg$/,\'.mp3\'):t.file),document.baseURI).href);'
        original="a.src=new URL('assets/'+(fallback?t.file.replace(/\\.ogg$/,'.mp3'):t.file),document.baseURI).href;"
        if original in audio: audio=audio.replace(original,repl,1)
        idx=idx.replace('</head>','<script>window.LUCK_AUDIO_DATA_MAP='+json.dumps(data,ensure_ascii=False)+';</script>\n</head>',1)
    # All new player illustrations require source asset ZIP. If missing, standalone shows same placeholder as original missing assets.
    styles=(src/'style.css').read_text(encoding='utf-8') if (src/'style.css').exists() else ''
    idx=re.sub(r'<link\b[^>]*href=["\']style\.css["\'][^>]*>',lambda m:'<style>\n'+styles+'\n</style>',idx,flags=re.I)
    scripts={'game.js':game,'avatars.js':avatar,'history.js':history,'rankings.js':ranking,'cloud/config.js':'',
        'cloud/cloud.js':offline_cloud(),'luck-audio.js':audio,'autolab.js':(src/'autolab.js').read_text(encoding='utf-8') if (src/'autolab.js').exists() else ''}
    src_pattern=re.compile(r'<script\s+src=["\']([^"\']+)["\']\s*>\s*</script>',re.I)
    seen=[]
    def inline(m):
        fname=m.group(1);seen.append(fname)
        if fname not in scripts:
            raise ValueError('외부 스크립트 미확인: '+fname)
        code=scripts[fname].replace('</script','<\\/script').replace('</SCRIPT','<\\/SCRIPT')
        return '<script>\n'+code+'\n</script>'
    idx=src_pattern.sub(inline,idx)
    idx,missing_html=embed_asset_paths(idx,src)
    missing.extend(missing_html)
    if 'game.js' not in seen or 'history.js' not in seen:raise ValueError('필수 게임/기록 로딩 순서가 없습니다.')
    idx=idx.replace('v0.2.18 · Original UI Playtest','v0.2.19 · Integrated Local Playtest')
    idx=idx.replace('버전: v0.2.18 (기존 화면 유지)','버전: v0.2.19 (기존 화면 유지, 8대 통합 변경)')
    ui="<script>window.LUCK_V0219_COMPACT_CSS="+json.dumps(CSS,ensure_ascii=False)+";</script>\n<script>\n"+ui_patch_js()+"\n</script>"
    idx=idx.replace('</body>',ui+'\n</body>',1)
    result=out/'LUCK-Dungeon-v0.2.19-통합로컬테스트.html'
    result.write_text(idx,encoding='utf-8')
    report='''# LUCK v0.2.19 통합 테스트 빌드

- 실행 파일: `LUCK-Dungeon-v0.2.19-통합로컬테스트.html`을 Chrome/Edge에서 열기
- v0.2.18의 원본 UI와 기존 카드·게임 모드를 유지하고 8대 개선안을 한 번에 반영
- 실제 서버 연결 없음: 플레이/랭킹은 현재 브라우저의 로컬 저장소 사용
- 신규 운빨 4종 + 2차 승급 4종, 운빨/공격/연계 콤보 확장
- 일반 공격 고화력 연속타: 광역/관통 없이도 적 여러 마리 격파 기회 제공
- 상점 저사용 카드 11종 구매가 인하(실험값), UI 설명 기본 접기, 기록에 최종 클리어 명시
- 신규 카드 아이콘은 기존 계열 그림 재사용, 모험가·적 기존 원본 이미지 유지
- **밸런스 정식 검증 미완료**: 순수 공격 클리어 가능성은 실전/자동 테스트로 확인 필요
- 자동 테스트에는 기존 AutoLab JS를 활용할 수 있으나 AI 전략 정책이 수치 변화에 적응하지 않을 수 있음

## 원본 애셋 상태
'''+('\n'.join('- 누락 또는 원본 ZIP에 포함되지 않음: '+s for s in sorted(set(missing+missing2))) if missing or missing2 else '- 이미지 애셋 모두 내장')+'\n\n오디오: '+('원본 WAV/OGG/MP3 내장' if audio_files and embed_audio else '원본 음원 파일을 찾지 못해 오디오 재생이 제한될 수 있음')+'\n'
    (out/'테스트안내.md').write_text(report,encoding='utf-8')
    return result,report


def main():
    p=argparse.ArgumentParser(description='LUCK 0.2.19: 원본 v0.2.18로부터 통합 로컬 테스트 HTML 생성')
    p.add_argument('--source',help='v0.2.18 소스가 들어 있는 ZIP 또는 풀어둔 폴더(없으면 GitHub 고정 소스 다운로드)')
    p.add_argument('--output',default=str(Path(__file__).parent/'LUCK-v0.2.19-PLAY'))
    p.add_argument('--no-audio-embed',action='store_true')
    a=p.parse_args();out=Path(a.output).resolve()
    with tempfile.TemporaryDirectory(prefix='luck0219_') as t:
        tmp=Path(t)
        if a.source:
            source=Path(a.source)
            if not source.exists():raise FileNotFoundError(str(source))
            root=(source if source.suffix.lower() in ('.html','.htm') else unzip_source(source,tmp/'source')) if source.is_file() else source
        else:
            print('v0.2.18 GitHub 고정 버전 원본 소스를 내려받는 중…')
            with urllib.request.urlopen(urllib.request.Request(URL,headers={'User-Agent':'LUCK-0219-local-build'}),timeout=35) as r:payload=r.read()
            original=tmp/'original.zip';original.write_bytes(payload)
            root=unzip_source(original,tmp/'source')
        source=source_root(root);print('원본:',source)
        path,report=build(source,out,not a.no_audio_embed)
        print('완성:',path);print('크기:',round(path.stat().st_size/1e6,2),'MB');print(report[:600])

if __name__=='__main__':
    try:main()
    except Exception as e:
        print('제작 실패:',e,file=sys.stderr);sys.exit(1)
