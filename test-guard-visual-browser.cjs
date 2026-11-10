const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/_site/preview/v0.3-ap-final/');
 await page.getByRole('button',{name:/일반 게임/}).click();await page.getByRole('button',{name:'⚔ 전투 준비하기',exact:true}).click();
 await page.evaluate(()=>{Luck220.run().source='qa';round=16;bossEncounter=null;phase='hand';resource=0;gems=5;apState.points=2;deck=[cp(GUARD_PROMOTIONS.find(p=>p.card.id==='guard_miner').card)];hand=deck.slice();draw=[];graveyard=[];prot={attack:0,combo:0,resource:0,gem:0,all:0};enemies=[{id:'res-qa',name:'자원 도둑',hp:100,d:{k:'resource',p:3,baseP:3,pct:false}}];$('visualModeToggle').checked=true;render();});
 await page.locator('#hand button').filter({hasText:'사용'}).click();
 await page.locator('#modalContent .guard-cue.protected').waitFor({state:'visible'});
 assert((await page.locator('#modalContent').innerText()).includes('자원 3 보존 · 보호 3 소모'));
 assert.equal(await page.locator('#modalContent .guard-cue.acquired').count(),1);
 await page.screenshot({path:'guard-resource-protected.png'});await page.locator('#close').click();
 await page.evaluate(()=>{round=16;phase='battle';hand=[];deck=[{id:'visual-sword',name:'검',type:'attack',atk:100}];draw=[];graveyard=[];tempAttack=0;bonusAtk=0;aoeAttack=0;pierce=0;linkComboAttack=0;p1ResetRun();prot={attack:2,combo:0,resource:0,gem:0,all:0};gems=8;enemies=[{id:'visual-guard',name:'보석 사냥꾼',hp:180,d:{k:'attack',p:20,baseP:20,pct:false},steal:{chance:.6,pct:.2,min:2}}];$('battleMotionSkipToggle').checked=false;window.guardVisualTrace=[];new MutationObserver(()=>{const e=$('cinBanner');if(e)guardVisualTrace.push(e.textContent);}).observe($('modalContent'),{subtree:true,childList:true,characterData:true});const rng=Math.random;Math.random=()=>.99;try{render();battle();}finally{Math.random=rng;}});
 await page.locator('#guardCinematicCue .guard-cue.protected').waitFor({state:'visible',timeout:12000});
 assert((await page.locator('#guardCinematicCue').innerText()).includes('보호 총 2 소모'));await page.screenshot({path:'guard-combat-shield.png'});
 await page.locator('#guardCinematicCue .guard-cue.theft_failed').waitFor({state:'visible',timeout:12000});
 assert((await page.locator('#guardCinematicCue').innerText()).includes('약탈 실패'));await page.screenshot({path:'guard-theft-failed.png'});
 await page.locator('#battleContinueBtn').waitFor({state:'visible'});
 const trace=await page.evaluate(()=>guardVisualTrace);const debuff=trace.findIndex(s=>s.includes('공격력 약화')),shield=trace.findIndex(s=>s.includes('화력 2 보존')),strike=trace.findIndex(s=>s.includes('기본 공격 82')),theft=trace.findIndex(s=>s==='약탈 실패');
 assert(debuff>=0&&shield>debuff&&strike>shield&&theft>strike,'wrong visual order: '+JSON.stringify(trace));
 assert(!(await page.locator('#modalContent').innerText()).match(/undefined|NaN/));await page.locator('#battleContinueBtn').click();
 await page.evaluate(()=>{$('modal').classList.add('hide');phase='shop';resource=99;gems=99;apState.points=2;render();});
 assert.equal(await page.locator('#promoList .promo-protection [data-promo-group="protection"]').count(),5);
 await page.locator('#cardTableBtn').click();assert((await page.locator('#modalContent').innerText()).includes('🛡 승급(보호)'));await page.locator('#close').click();
 // Skip mode still shows the actual result visibly after the phase changes.
 await page.evaluate(()=>{phase='battle';deck=[{id:'skip',atk:100,type:'attack'}];hand=[];tempAttack=0;bonusAtk=0;aoeAttack=0;pierce=0;linkComboAttack=0;bossEncounter=null;p1ResetRun();prot={attack:2,combo:0,resource:0,gem:0,all:0};enemies=[{id:'skip-enemy',name:'약화 적',hp:180,d:{k:'attack',p:20,baseP:20,pct:false}}];$('battleMotionSkipToggle').checked=true;battle();});
 await page.locator('#guardVisibleToast').waitFor({state:'visible'});assert((await page.locator('#guardVisibleToast').innerText()).includes('보호 2 소모'));
 assert.deepEqual(errors,[]);fs.writeFileSync('guard-visual-browser-results.json',JSON.stringify({pass:true,trace},null,2));await browser.close();console.log('PASS visible resource protection, ordered combat weaken/shield/strike/theft, grouped failure, five promotion cards/catalog, skip toast and no invalid values');
})().catch(e=>{console.error(e);process.exitCode=1});
