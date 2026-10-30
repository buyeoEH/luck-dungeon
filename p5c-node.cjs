const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');
const {JSDOM,VirtualConsole}=require(process.env.P5_JSDOM_PATH||path.join(__dirname,'../p5-runtime/node_modules/jsdom'));
const R=__dirname;
function create(variant,probe=true){
 const root=path.join(R,'_site/preview',variant==='baseline'?'v0.2.20':'v0.3.0');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/Not implemented: (HTMLCanvasElement|window.scrollTo|HTMLMediaElement)/.test(e.message))process.stderr.write(e.message+'\n');});
 const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://luck.test/preview/'+(variant==='baseline'?'v0.2.20':'v0.3.0')+'/',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window;w.scrollTo=()=>{};w.fetch=()=>Promise.reject(Error('Network disabled in experiment'));w.structuredClone=global.structuredClone;w.crypto.randomUUID=crypto.randomUUID;
 for(const sc of [...w.document.scripts]){
  let text=sc.src?fs.readFileSync(path.join(root,sc.getAttribute('src').split('?')[0]),'utf8'):sc.textContent;
  if(probe&&sc.getAttribute('src')?.startsWith('game.js')){
   let old='const aoeTotal = totalAoe();';if(text.split(old).length!==2)throw Error('AoE hook changed');text=text.replace(old,'const aoeTotal = window.P5_EXPERIMENT?.mode==="no_effects" ? 0 : totalAoe();');
   old='shuffle([...RANDOM_POOL]).slice(0, 3).map';if(text.split(old).length!==2)throw Error('Reward hook changed');text=text.replace(old,'shuffle([...RANDOM_POOL]).slice(0, window.P5_EXPERIMENT?.random_cards||3).map');
  }
  if(sc.getAttribute('src')?.startsWith('autolab.js')){const tail=text.lastIndexOf('})();');if(tail<0)throw Error('RNG bridge anchor missing');text=text.slice(0,tail)+'window.AutoLab.inspectRng=()=>({seed,enabled});\n'+text.slice(tail);}
  vm.runInContext(text,dom.getInternalVMContext());
 }
 Object.defineProperty(w.Element.prototype,'innerHTML',{get(){return '';},set(v){},configurable:true});w.Element.prototype.insertAdjacentHTML=()=>{};
 vm.runInContext(`render=()=>{};actionFlash=()=>{};focusSection=()=>{};log=s=>fullLogs.push('[R'+round+']['+phase+'] '+plainLogText(s));window.LuckGameAudio=undefined;`,dom.getInternalVMContext());
 let ai=fs.readFileSync(path.join(R,'v030-reference-ai.js'),'utf8');
 const oldChoice="const choice={reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll'];";
 if(!ai.includes(oldChoice))throw Error('Reward decision gate changed');
 ai=ai.replace(oldChoice,"const choice=cfg.reward_policy==='mixed'?P5B.chooseReward(cfg.profile):({reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll']);");
 ai=ai.replace('window.V030ReferenceAI={run,profiles:Object.keys(W),weights:W};','window.V030ReferenceAI={run,profiles:Object.keys(W),weights:W,snapshot:state};');
 vm.runInContext(ai,dom.getInternalVMContext());
 if(probe)vm.runInContext(fs.readFileSync(path.join(R,'p5-probe.js'),'utf8'),dom.getInternalVMContext());
 vm.runInContext(fs.readFileSync(path.join(R,'p5b-policy.js'),'utf8'),dom.getInternalVMContext());
 vm.runInContext(fs.readFileSync(path.join(R,'p5c-fork.js'),'utf8'),dom.getInternalVMContext());
 return dom;
}
module.exports={create};
if(require.main===module){const d=create('full');const c={experiment:'random3',profile:'link',seed:101,reward_policy:'random',random_cards:3,mode:'normal',baseline_git_sha:'110d54876a121909b9bd6074cf682b6d99944083'};const t=Date.now();for(let i=0;i<10;i++){c.seed=101+i;const r=d.window.P5Harness.run(c);console.log(r.seed,r.clear,r.round,r.random_calls);}console.log('ms',Date.now()-t);d.window.close();}
