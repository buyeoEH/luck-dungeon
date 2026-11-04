const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {JSDOM,VirtualConsole}=require(process.env.P5_JSDOM_PATH||path.join(__dirname,'../ap-runtime/node_modules/jsdom'));
const root=path.join(__dirname,'_site/preview/v0.3-ap-final');
const d=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://luck.test',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()});
const w=d.window;w.fetch=()=>Promise.reject(Error('offline'));w.scrollTo=()=>{};w.crypto.randomUUID=require('crypto').randomUUID;w.structuredClone=structuredClone;
for(const sc of [...w.document.scripts]){vm.runInContext(sc.src?fs.readFileSync(path.join(root,sc.getAttribute('src').split('?')[0]),'utf8'):sc.textContent,d.getInternalVMContext());}
const q=s=>vm.runInContext(s,d.getInternalVMContext());
q('start();');
const dash=[...w.document.querySelector('.dashboard').children];assert(dash[0].textContent.includes('ROUND'));assert(dash[1].textContent.includes('자원'));assert(dash[2].textContent.includes('보석'));assert.equal(dash[3].id,'apHud');
q('gems=3;apState.points=0;render();useGem();');assert.equal(q('gems'),2);assert.equal(q('apState.points'),1);assert.equal(q('tempAttack'),0);assert(w.document.querySelector('#apHud').classList.contains('balance-up'));assert(w.document.querySelector('#gem').parentElement.classList.contains('balance-down'));
q('useGem(true)');assert.equal(q('gems'),0);assert.equal(q('apState.points'),3);
q("phase='shop';gems=1;resource=0;useGem(false,'resource')");assert.equal(q('resource'),2);assert.equal(q('gems'),0);
q("phase='gameover';gems=1;useGem()");assert.equal(q('gems'),1);
q("phase='hand';apRoundStart();apState.points=9;round++;apRoundStart()");assert.equal(q('apState.points'),2);
assert.equal(w.LuckCloud.configured,true);assert(q("Luck220.events().some(e=>e.event_type==='gem_exchanged')"));
console.log('PASS HUD order; single/all conversion; AP zero recovery; resource conversion; no attack; terminal rejection; round reset; flashes; telemetry; configured cloud');w.close();
