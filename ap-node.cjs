const fs=require('fs'),path=require('path'),vm=require('vm'),Module=require('module');
const R=__dirname;
function create(mode='off',baseline=false){
 const loader=new Module(path.join(R,'ap-test-loader.cjs'),module);loader.filename=path.join(R,'ap-test-loader.cjs');loader.paths=module.paths;
 let src=fs.readFileSync(path.join(R,'p5-node.cjs'),'utf8');
 src=src.replace("const root=path.join(R,'_site/preview',variant==='baseline'?'v0.2.20':'v0.3.0');",`const root=${JSON.stringify(baseline?path.join(R,'../ap-baseline'):path.join(R,'_site/preview/v0.3-ap'))};`);
 src=src.replace('const w=dom.window;','const w=dom.window;w.LUCK_AP_MODE='+JSON.stringify(mode)+';');
 // Frozen policy with disclosed legality adapter. No search or outcome tuning.
 src=src.replace("vm.runInContext(ai,dom.getInternalVMContext());",`ai=ai.replace("function value(c,profile){", "function value(c,profile){if(c.id==='ap_supply')return deck.filter(x=>cardKey(x)==='ap_supply').length<2?150:10;");
 ai=ai.replace("const i=hand.findIndex(c=>!", "const refill=hand.findIndex(c=>c.apGain>0);const i=refill>=0?refill:hand.findIndex(c=>(!window.LuckAP||LuckAP.canUse(c))&&!");
 ai=ai.replace(".filter(c=>c.price<=resource+2*gems", ".filter(c=>(!window.LuckAP||LuckAP.mode==='off'||LuckAP.snapshot().points>=1)&&c.price<=resource+2*gems");
 ai=ai.replace("useHand(cfg.profile);next();", "useHand(cfg.profile);window.LuckAP?.observe();next();");
 ai=ai.replace("shop(cfg.profile);next();", "shop(cfg.profile);window.LuckAP?.observe();next();");
 vm.runInContext(ai,dom.getInternalVMContext());`);
 loader._compile(src,loader.filename);return loader.exports.create('full');
}
const q=(d,s)=>vm.runInContext(s,d.getInternalVMContext());
module.exports={create,q};
