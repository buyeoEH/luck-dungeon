const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'_site/preview/v0.3-ap-final');let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.LUCK_CHROMIUM?{executablePath:process.env.LUCK_CHROMIUM}:{})});
 const page=await browser.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='luck.test')return route.abort();const f=path.join(root,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return route.abort();await route.fulfill({path:f,contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'})[path.extname(f)]||'application/octet-stream'});});
 await page.goto('https://luck.test/?trialPierce=1&trialLuck=1');await page.getByRole('button',{name:/일반 게임/}).click();
 for(const width of [320,390,430,960]){
  await page.setViewportSize({width,height:844});
  await page.evaluate(()=>{phase='hand';round=20;bossEncounter={round:20,turn:1,cleared:false,spec:bossSpec(20)};tacticUsed=new Set();apState.points=2;enemies=[{id:'boss314',name:'운명의 수호자',boss:true,hp:320,shield:80,coreHp:240,shieldMax:80,coreMax:240}];var a=cp(CARD_CATALOG_313.get('breaker')),b=cp(CARD_CATALOG_313.get('d5'));hand=[a,b];deck=[...hand];draw=[];graveyard=[];pendingChoiceCardId=null;pendingChoiceType=null;trialChoice313=null;tacticChoice=null;apWarning314=null;$('modal').classList.add('hide');render();});
  await page.locator('#hand button').nth(1).click();
  assert((await page.locator('#modalTitle').innerText()).includes('파쇄창'));assert.equal(await page.evaluate(()=>apState.points),2);
  await page.getByRole('button',{name:'돌아가기',exact:true}).click();assert.equal(await page.evaluate(()=>hand.length),2);
  await page.locator('#hand button').nth(1).click();await page.getByRole('button',{name:'행동력을 소모하고 계속',exact:true}).click();assert.equal(await page.evaluate(()=>apState.points),1);
  await page.evaluate(()=>{handleModalClose();phase='hand';apState.points=2;tacticUsed=new Set();var c=cp(CARD_CATALOG_313.get('lance'));hand=[c];deck=[c];render();});
  await page.locator('#hand button').first().click();await page.locator('.targeted-toggle').click();await page.getByRole('button',{name:'지정 타격 확정',exact:true}).click();
  assert((await page.locator('.pierce-target314').innerText()).includes('320 → 314'));assert((await page.locator('.pierce-target314').innerText()).includes('80 → 76'));
  assert.equal(await page.evaluate(()=>enemies[0].coreHp),238);assert.equal(await page.locator('[data-enemy-id="boss314"]').getAttribute('class').then(c=>c.includes('pierce-flash314')),true);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
  await page.evaluate(()=>{LuckCombatFeedback314.settle({events:[{type:'strike',damage:128,corePierceDamage:21}]});});
  assert((await page.locator('.pierce-breakdown314').innerText()).includes('보스 직격 21'));
  checks.push({width,pre_spend_cancel:true,explicit_continue_once:true,hp_feedback:true,target_animation:true,split_statistics:true,no_overflow:true});
 }
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.pierce-impact314').evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.deepEqual(errors,[]);fs.writeFileSync('v0314-browser-results.json',JSON.stringify({pass:true,checks,reduced_motion:true,errors},null,2));await browser.close();console.log('PASS responsive feedback and AP confirmation browser checks');
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
