const assert=require('assert'),fs=require('fs'),vm=require('vm'),{JSDOM,VirtualConsole}=require(process.env.P5_JSDOM_PATH);
const root='_site/preview/v0.3-ap-final',d=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://luck.test',runScripts:'outside-only',virtualConsole:new VirtualConsole()});const w=d.window;w.fetch=()=>Promise.reject(Error('offline'));w.scrollTo=()=>{};w.structuredClone=structuredClone;w.crypto.randomUUID=require('crypto').randomUUID;w.Element.prototype.scrollIntoView=()=>{};
const q=s=>vm.runInContext(s,d.getInternalVMContext());for(const s of [...w.document.scripts])q(s.src?fs.readFileSync(root+'/'+s.getAttribute('src').split('?')[0],'utf8'):s.textContent);
q("window.__luckAutoLabBotActive=true;window.LuckGameAudio=undefined;start();round=5;phase='shop';bonusAtk=0;tempAttack=0;linkComboAttack=24;p1ResetRun();prot={attack:0,combo:0,resource:0,gem:0,all:0};deck=[{id:'a',name:'검',type:'attack',atk:18}];hand=[];enemies=[makeEnemy(bossFor(5),5)];updateAtkTooltip()");
const el=w.document.getElementById('atkTooltip');assert.equal(el.dataset.sum,'37');assert.equal(el.dataset.final,'37');assert(el.textContent.includes('행동·전술 연계 공격'));assert(el.textContent.includes('+24'));assert(el.textContent.includes('-5'));
for(let i=0;i<80;i++){
 q(`phase='${i%2?'battle':'hand'}';bonusAtk=${i%4};tempAttack=${i%7};linkComboAttack=${i*3};p1Round.gaugeBonus=${i};p1Round.peakUses=${i%3};prot={attack:${i%4},combo:${i%3},resource:0,gem:0,all:${i%5}};enemies=[makeEnemy(bossFor(30),30)];`);
 const before=q('JSON.stringify({prot,enemies,linkComboAttack,p1Round})');q('updateAtkTooltip()');assert.equal(el.dataset.sum,el.dataset.final,'sum mismatch '+i);assert(!/NaN|undefined/.test(el.textContent));assert.equal(q('JSON.stringify({prot,enemies,linkComboAttack,p1Round})'),before,'preview mutated state');
}
d.window.close();console.log('PASS screenshot 18+24−5=37, 80 gauge/peak/debuff/protection sums, no preview spending');
