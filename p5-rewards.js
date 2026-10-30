/* P5 approved reward mechanics. OFF preserves native gameplay. */
const P5_REWARDS_ENABLED=window.LUCK_P5_REWARDS_ENABLED!==false;
const P5_REWARD_STAGE='reroll';
const P5_SEEDS=[['sam','공격'],['combo','연계'],['lance','관통'],['cg','보호'],['coin','운빨'],['rd','경제'],['d5','드로우'],['bomber','광역']];
let p5Flow=null,p5Locks=new Set(),p5NativeReroll=null,p5Coupon=null,p5LastPurchase=null;
function p5Reset(){p5Flow=null;p5Locks=new Set();p5Coupon=null;p5LastPurchase=null;}
function p5Emit(type,payload){window.Luck220?.emit(type,payload);}
function p5Modal(title,html,close){if($('modalTitle'))$('modalTitle').textContent=title;if($('modalContent'))$('modalContent').innerHTML='<div class="p5-content">'+html+'</div>';if($('close'))$('close').onclick=close;if($('modal'))$('modal').classList.remove('hide');}
function p5SeedCards(){return P5_SEEDS.map(([id,route])=>({card:[...BASIC,...RANDOM_POOL].find(c=>c.id===id),route})).filter(x=>x.card);}
function p5IsLocked(i){return P5_REWARDS_ENABLED&&p5Locks.has(i);}
function p5ShowLocks(){if(p5Flow!=='locks')return;const slots=randomShop.map((c,i)=>{const stock=Math.max(0,c.limit-(buyCount[c.id]||0)),locked=p5Locks.has(i);return '<button '+(!stock?'disabled':'')+' onclick="LuckP5Rewards.toggleLock('+i+')" aria-pressed="'+locked+'">'+(locked?'🔒 ':'')+c.name+' · 재고 '+stock+'</button>';}).join('');p5Modal('🔒 상점 교체 · 유지 카드 최대 2장','<div class="p5-grid">'+slots+'</div><p>잠금 '+p5Locks.size+'/2 · 재고가 남은 비잠금 상품 중 최대 3장 교체</p><button class="primary-btn" onclick="LuckP5Rewards.confirmLocks()">잠금 확정 · 교체</button><p>닫기: 현재 잠금으로 교체합니다.</p>',p5ConfirmLocks);}
function p5ToggleLock(i){if(p5Flow!=='locks'||!randomShop[i]||randomShop[i].limit-(buyCount[randomShop[i].id]||0)<=0)return;if(p5Locks.has(i))p5Locks.delete(i);else if(p5Locks.size<2)p5Locks.add(i);else log('🔒 잠금은 최대 2장입니다.');p5ShowLocks();}
function p5BeginReroll(){p5Locks=new Set();p5Flow='locks';p5ShowLocks();}
function p5ConfirmLocks(){if(p5Flow!=='locks')return;p5Flow='result';p5Emit('boss_reroll_locks',{slots:[...p5Locks],cards:[...p5Locks].map(i=>randomShop[i].id)});p5NativeReroll();}
function p5ShowSeeds(){p5Flow='seed';p5Modal('🌱 루트 씨앗 카드 1장 무료 선택','<div class="p5-grid">'+p5SeedCards().map(({card:c,route})=>'<button onclick="LuckP5Rewards.pickSeed(\''+c.id+'\')">'+luckIcon(c,'mini')+'<b>'+route+' · '+c.name+'</b><small>'+c.text+'</small></button>').join('')+'</div><p>별도 보스 보상 풀입니다. 자원·상점 재고를 소비하지 않습니다.</p><button onclick="LuckP5Rewards.skipSeed()">선택하지 않고 다음 라운드</button>',p5ShowSeeds);}
function p5Finish(){p5Flow=null;p5Locks=new Set();if($('modal'))$('modal').classList.add('hide');if($('close'))$('close').onclick=handleModalClose;nextRound();render();}
function p5PickSeed(id){if(p5Flow!=='seed'||phase!=='reward')return;const row=p5SeedCards().find(x=>x.card.id===id);if(!row)return;p5Flow='finishing';const c=cp(row.card);addNewCard(c);log('🌱 보스 보상 ➔ ['+c.name+'] 무료 획득 · 자원/상점 재고 변화 없음','good');p5Emit('boss_seed_card',{card_id:id,instance_id:c.id,route:row.route,source:'boss_seed_pool',price:0,shop_stock_unchanged:true});p5Finish();}
function p5SkipSeed(){if(p5Flow!=='seed')return;p5Emit('boss_seed_skipped',{});p5Finish();}
const p5Boss0=bossReward;bossReward=function(){const out=p5Boss0.apply(this,arguments);if(!P5_REWARDS_ENABLED)return out;p5NativeReroll=rewards[0][2];rewards[0]=[rewards[0][0],'유지 카드 최대 2장을 잠그고, 남은 재고 상품 중 최대 3장을 교체합니다. 이후 루트 씨앗 풀에서 카드 1장을 무료로 선택합니다.',p5BeginReroll];render();return out;};
const p5Confirm0=confirmShopReroll;confirmShopReroll=function(){if(P5_REWARDS_ENABLED){if(p5Flow==='locks')return p5ConfirmLocks();if(p5Flow==='result'||p5Flow==='seed')return p5ShowSeeds();}return p5Confirm0.apply(this,arguments);};
function p5Resume(){if(p5Flow==='locks')p5ShowLocks();else if(p5Flow==='result'||p5Flow==='seed')p5ShowSeeds();}
const p5Render0=render;render=function(){const out=p5Render0.apply(this,arguments);if(P5_REWARDS_ENABLED&&p5Flow&&phase==='reward'&&$('rewards'))$('rewards').insertAdjacentHTML('beforeend','<button class="primary-btn" onclick="LuckP5Rewards.resume()">보상 선택 계속</button>');return out;};
function p5Bot(profile,value){if(p5Flow==='locks'){const a=randomShop.map((c,i)=>({c,i})).filter(x=>x.c.limit-(buyCount[x.c.id]||0)>0).sort((a,b)=>value(b.c,profile)-value(a.c,profile)||a.i-b.i);p5Locks=new Set(a.slice(0,2).map(x=>x.i));p5ConfirmLocks();}if(p5Flow==='result')p5ShowSeeds();if(p5Flow==='seed'){const best=p5SeedCards().sort((a,b)=>value(b.card,profile)-value(a.card,profile))[0];best?p5PickSeed(best.card.id):p5SkipSeed();}}
window.LuckP5Rewards={enabled:P5_REWARDS_ENABLED,stage:P5_REWARD_STAGE,toggleLock:p5ToggleLock,confirmLocks:p5ConfirmLocks,pickSeed:p5PickSeed,skipSeed:p5SkipSeed,resume:p5Resume,botResolve:p5Bot,pending:()=>p5Flow,locks:()=>[...p5Locks],seedIds:()=>P5_SEEDS.map(x=>x[0])};
