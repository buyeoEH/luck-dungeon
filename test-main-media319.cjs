const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const {JSDOM,VirtualConsole}=require(process.env.P5_JSDOM_PATH),{create,q}=require('./boss-ai-v313.cjs');let assertions=0;
const ok=(v,m)=>{assert(v,m);assertions++;},d=create(),plan=(t,p)=>d.window.LuckMainMedia319.plan(t,p),ids=a=>Array.from(a,x=>x.id);
ok(ids(plan('luck_usage_result',{card_id:'spark',outcome:'good',actual:{resource:3}})).join(',')==='fx-spark_use,fx-luck_success','usage effect precedes independent destruction');
ok(ids(plan('luck_destruction_roll',{destroyed:false})).join(',')==='fx-destruction_roll,fx-destruction_survive','survival separate');
ok(ids(plan('luck_destruction_roll',{destroyed:true})).join(',')==='fx-destruction_roll','destroyed no survival');
for(const kind of [0,1,2,3,4,5]){
 const detail={card_id:'legend_warlord315',instance_id:'target',good:true},a=ids(plan('luck_destruction_result',{kind,detail}));
 ok(a.length>0,'all destruction outcomes');if(kind===0)ok(a.includes('fx-legend_reveal'),'real legend only');if(kind===5)ok(a.includes('fx-mutation_card'),'real live mutation');
}
const fallback=ids(plan('luck_destruction_result',{kind:5,detail:{fallback:true,card_id:'mine'}}));ok(fallback.join(',')==='fx-destroy_acquire','fallback never DNA');
ok(plan('break_mutation318',{success:false,no_target:true}).length===0,'no candidate never mutation');
ok(ids(plan('break_mutation318',{success:true,after:{name:'채굴'}})).join(',')==='fx-destroy_mutation','confirmed new-route mutation');
ok(!ids(plan('luck_strength',{kind:'runLuck',value:2})).some(x=>x.includes('sprout')||x.includes('germinate')),'run luck is not germination');
for(const kind of ['resource','attack','link'])ok(ids(plan('seed_sprouted318',{kind,name:'새싹'})).join(',')==='fx-seed_germinate,fx-sprout_'+kind,'three actual sprout results');
ok(plan('cards_drawn',{actual:0}).length===0,'zero draw no draw FX');
ok(plan('card_removed',{card_id:'ash318'}).length===0,'internal removal never direct reward');
ok(!ids(plan('break_reward318',{name:'검',outcome:'bad',actual:{attack:-8}})).includes('fx-destroy_reward'),'bad direct result not positive reward');
const hp=e=>ids(d.window.LuckMainMedia319.hitPlan(e));
for(const e of [{damage:0,pierce_source:'card'},{damage:10,skipped:true},{damage:0,pure:true}])ok(hp(e).length===0,'skipped/dead reservation no hit');
for(const [source,id]of [['card','fx-card_pierce'],['link','fx-link_transfer'],['followup','fx-followup'],['base','fx-slash']])ok(hp({damage:7,pierce_source:source,name:'적'})[0]===id,'actual damage source '+source);
ok(hp({damage:7,pierce_source:'card',redistributed:true})[0]==='fx-pierce_redistribute','real redistribution');
ok(hp({damage:7,pierce_source:'card',corePierceDamage:0,raw_overflow:0}).length===1,'no imaginary core/overflow');
ok(hp({damage:7,pierce_source:'link',corePierceDamage:2,raw_overflow:3}).join(',')==='fx-link_transfer,fx-boss_direct','exclusive confirmed extras');
ok(hp({type:'aoe',damage:0,hits:[{damage:5}]}).join(',')==='fx-aoe','AoE uses actual hit sum');
ok(hp({damage:7,pierce_source:'card',raw_overflow:3}).join(',')==='fx-card_pierce,fx-overflow_pool','only card/basic overflow collected');
ok(hp({damage:7,pure:true,raw_overflow:3}).join(',')==='fx-followup','followup overflow not collected');
ok(ids(plan('protection_gain',{kind:'gem',before:5,after:3,spent:0})).join(',')==='fx-resource_drain','gain reduction is not theft');
// The presentation layer never changes gameplay state or requests randomness.
q(d,"AutoLab.begin(319);window.__luckAutoLabBotActive=false;$('visualModeToggle').checked=false;window.mediaAudioCalls319=[];window.LuckGameAudio={motionCue:id=>mediaAudioCalls319.push(id),motionStop:()=>{}};var savedRandom319=Math.random;Math.random=()=>{throw Error('presentation must not roll')};");
const snapshot=q(d,'JSON.stringify({deck,hand,draw,graveyard,stats,enemies,resource,gems,apState})');
q(d,"LuckMainMedia319.observe('luck_strength',{run_id:'media-test',seq:1,payload:{kind:'tempLuck',value:1}});LuckMainMedia319.observe('luck_strength',{run_id:'media-test',seq:1,payload:{kind:'tempLuck',value:1}})");
ok(q(d,'mediaAudioCalls319.length')===1,'event deduplicated');ok(q(d,'JSON.stringify({deck,hand,draw,graveyard,stats,enemies,resource,gems,apState})')===snapshot,'presentation is read only');q(d,'LuckMainMedia319.clear();Math.random=savedRandom319;window.__luckAutoLabBotActive=true');ok(q(d,'LuckMainMedia319.snapshot().queued.length')===0,'skip clears queue');
for(const [id,url]of q(d,'Object.entries(LUCK_MAIN_MEDIA319.icons)')){ok(fs.existsSync(path.join(__dirname,'_site/preview/v0.3-ap-final',url)),'icon path '+id);if(!id.startsWith('sprout_'))ok(q(d,`LUCK_CARD_ICONS['${id}']`)===url,'actual card mapping '+id);}
ok(q(d,'LUCK_CARD_ICONS.powder318===LUCK_CARD_ICONS.meteor'),'unmatched powder art retained');d.window.close();
// Driver uses existing unlock/SFX/volume controls, a bounded voice pool and explicit MP3 paths.
const audioDom=new JSDOM('<input id="sfxToggle" type="checkbox" checked>',{url:'https://luck.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()});const w=audioDom.window,calls=[];
w.Audio=class{constructor(){this.dataset={};this.paused=true;}canPlayType(){return '';}async play(){this.paused=false;calls.push(this.src);}pause(){this.paused=true;}};w.shouldPlayBattleMotion=()=>true;
vm.runInContext(fs.readFileSync('_site/preview/v0.3-ap-final/luck-audio.js','utf8'),audioDom.getInternalVMContext());w.LuckGameAudio.setBgmEnabled(false);w.LuckGameAudio.setSfxEnabled(true);w.LuckGameAudio.unlock();
for(let i=0;i<8;i++)w.LuckGameAudio.motionCue('motion319_sfx_card_pierce');ok(calls.length===8&&calls.every(x=>x.endsWith('motion319_sfx_card_pierce.mp3')),'new MP3 driver path');ok(w.LuckGameAudio.snapshot().voices<=4,'at most four motion voices');w.LuckGameAudio.setSfxEnabled(false);const n=calls.length;w.LuckGameAudio.motionCue('motion319_sfx_card_pierce');ok(calls.length===n,'SFX off honored');ok(w.LuckGameAudio.snapshot().voices===0,'SFX off stops voices');w.LuckGameAudio.motionCue('unknown');ok(calls.length===n,'unknown cue safe');audioDom.window.close();
fs.writeFileSync('main-media319-test-results.json',JSON.stringify({pass:true,assertions,browser:'not run: Chromium binary missing in execution environment',checks:['actual event ordering and no fallback DNA','no skipped/zero damage FX','all sprite/card paths','read-only and RNG-free presentation','dedup and skip cancellation','existing unlock/SFX controls and four-voice budget']},null,2));console.log('PASS '+assertions+' media assertions');
