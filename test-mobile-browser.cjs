const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();await page.emulateMedia({reducedMotion:'reduce'});
 const errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height,zoom] of [[320,640,1],[360,640,1],[390,844,1],[430,932,1],[390,844,1.25],[390,640,1.5]]){
  await page.setViewportSize({width,height});
  await page.goto('http://127.0.0.1:8765/_site/preview/v0.3-ap-final/');
  await page.getByRole('button',{name:/일반 게임/}).click();
  await page.getByRole('button',{name:'⚔ 전투 준비하기',exact:true}).click();
  await page.evaluate(z=>{Luck220.run().source='qa';round=17;resource=9;gems=10;apState.points=1;phase='shop';
   enemies=[{id:'mobile-a',name:'공격 약화',hp:25,d:{k:'attack',p:4,baseP:4,pct:false}},{id:'mobile-c',name:'연계 약화',hp:30,d:{k:'combo',p:4,baseP:4,pct:false}}];
   document.documentElement.style.zoom=z;render();LuckMobileUI.refreshLayout();focusSection('shopPanel');},zoom);
  const layout=await page.evaluate(()=>{
   const r=e=>{const x=e.getBoundingClientRect();return {left:x.left,right:x.right,top:x.top,bottom:x.bottom,width:x.width}};
   return {viewport:innerWidth,header:r(document.querySelector('.sticky-header')),next:r($('nextBtn')),cards:[...document.querySelectorAll('#basicShop .shop-card,#randomShop .shop-card')].map(r),first:r(document.querySelector('#basicShop .shop-card')),flow:document.querySelector('.sticky-header').classList.contains('luck-hud-flow')};
  });
  assert(layout.next.left>=0&&layout.next.right<=width+1,'completion button clipped');
  assert(layout.cards.every(r=>r.left>=0&&r.right<=width+1),'shop card clipped');
  assert(layout.flow||layout.first.top>=layout.header.bottom-1,'first shop card covered by HUD');
  await page.locator('#atkContainer').click();await page.locator('#attackDetailsDialog').waitFor({state:'visible'});
  const box=await page.locator('#attackDetailsDialog').evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}});
  assert(box.left>=0&&box.right<=width+1&&box.top>=0&&box.bottom<=height+1,'attack dialog clipped');
  assert((await page.locator('#atkTooltip').innerText()).includes('최종 예상 공격력'));
  await page.getByRole('button',{name:'공격력 상세 닫기',exact:true}).click();
  assert.equal(await page.locator('#attackDetailsDialog').getAttribute('open'),null);
  await page.locator('#atkContainer').press('Enter');await page.locator('#attackDetailsDialog').waitFor({state:'visible'});
  await page.keyboard.press('Escape');await page.locator('#attackDetailsDialog').waitFor({state:'hidden'});
  assert.equal(await page.locator('#atkContainer').getAttribute('aria-expanded'),'false');
  results.push({width,height,zoom,layout,attackDialog:box});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('mobile-browser-results.json',JSON.stringify({pass:true,cases:results},null,2));
 await browser.close();console.log('PASS six mobile shop/HUD containment and attack dialog cases, enlarged text, close/keyboard/Escape');
})().catch(e=>{console.error(e);process.exit(1)});
