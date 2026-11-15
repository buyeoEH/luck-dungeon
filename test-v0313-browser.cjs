/* Run after build_v0313.py with Playwright Chromium available. No server required. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'_site/preview/v0.3-ap-final');
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.LUCK_CHROMIUM?{executablePath:process.env.LUCK_CHROMIUM}:{})});
 const page=await browser.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='luck.test')return route.abort();const f=path.join(root,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return route.abort();await route.fulfill({path:f,contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'})[path.extname(f)]||'application/octet-stream'});});
 await page.goto('https://luck.test/');await page.getByRole('button',{name:/일반 게임/}).click();
 for(const width of [320,390,430,960]){
  await page.setViewportSize({width,height:844});
  await page.evaluate(()=>{phase='hand';apState.points=2;tacticUsed=new Set();var source=cp(TACTIC_CARDS.find(c=>c.id==='hand_cycle'));hand=[source,...PROMOS.slice(0,25).map(p=>cp(p.card))];deck=[...hand];draw=[];graveyard=[];use(0);});
  const content=page.locator('#modalContent');await content.locator('.selection-more').first().click();assert.equal(await page.evaluate(()=>tacticChoice.selected.size),0);
  await content.locator('.selection-toggle').first().click();assert.equal(await page.evaluate(()=>tacticChoice.selected.size),1);assert((await content.locator('.selection-summary').innerText()).includes('최대 0장 드로우'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
  const grid=await content.locator('.selection-grid').boundingBox(),footer=await content.locator('.selection-footer').boundingBox();assert(footer.y+footer.height<=844&&footer.x>=0&&footer.x+footer.width<=width,'footer clipped');assert(grid.y+grid.height<=footer.y+1,'scrolling grid overlaps controls');
  await content.locator('.selection-grid').evaluate(el=>el.scrollTop=el.scrollHeight);const end=await content.locator('.selection-footer').boundingBox();assert(Math.abs(end.y-footer.y)<1,'confirmation moves with list');
  await content.getByRole('button',{name:'취소',exact:true}).click();checks.push({width,footer_fixed:true,details_separate:true,no_overflow:true});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('v0313-browser-results.json',JSON.stringify({pass:true,checks,errors},null,2));await browser.close();console.log('PASS browser selection and responsive layout');
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
