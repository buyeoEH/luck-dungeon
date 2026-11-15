"""Build selection/refund baseline; independent gameplay trials are opt-in URL flags."""
from pathlib import Path
import hashlib,json,re,subprocess
import build_v0312
R=Path(__file__).resolve().parent
P=build_v0312.P
def replace_once(g,a,b):
 assert g.count(a)==1,(a,g.count(a))
 return g.replace(a,b)
def build():
 meta=build_v0312.build()
 g=(P/'game.js').read_text()
 catalog,trial=(R/'trials-v0313.js').read_text().split('/* TRIAL_LOGIC_313 */',1)
 g=replace_once(g,'const CARD_NAME = {};',catalog+'\nconst CARD_NAME = {};')
 g=replace_once(g,"value=c.tactic==='salvage'?Math.max(0,targets[0].price||0):0;","value=c.tactic==='salvage'?cardRefund313(targets[0]):0;")
 g=replace_once(g,'const changes=[];let actualDraw=0,value=0;','const changes=[];let actualDraw=0,value=0,actualResource=0;')
 g=replace_once(g,"else resource+=gain('resource',value);","else {actualResource=gain('resource',value);resource+=actualResource;}")
 g=g.replace('actual_draw:actualDraw,listed_resource:value','actual_draw:actualDraw,listed_resource:value,actual_resource:actualResource')
 g=replace_once(g," window.Luck220?.emit('card_used',{card_id:cardKey(c),instance_id:c.id,name:c.name,effects:{tactic:c.tactic,targets:unique,actual_draw:actualDraw,listed_resource:value,actual_resource:actualResource}});",' // card_used is emitted exactly once by the shared commitChoiceCard telemetry wrapper.')
 g=replace_once(g,'해당 카드의 상점 정가만큼 자원 획득(디버프 적용) / 가격 없는 카드 0','해당 카드의 고정 환원 가치만큼 자원 획득(디버프·보호 적용)')
 g=replace_once(g,"'자원 기준가 '+value+' (실제 획득은 디버프 적용)'","'환원 '+value+' → 자원 +'+actualResource")
 g=replace_once(g,"esc(strategyText(c))+'</p>';detail.scrollIntoView", "esc(strategyText(c))+'</p><p>'+esc(metadataText313(c))+'</p>';detail.scrollIntoView")
 g=replace_once(g,"let val = c.tactic ?", "let val = c.type==='luckStrength' ? '🍀 '+(c.tempLuck313?'임시':'누적')+' +1' : c.tactic ?")
 g+='\n'+(R/'selection-v0313.js').read_text()+'\n'+trial
 (P/'game.js').write_text(g)
 (P/'selection-v0313.css').write_text((R/'selection-v0313.css').read_text())
 meta.update(version='0.3.13-selection.2',stage='selection_refund_trials',release_scope='private_playtest',experiments={'default':'off','pierce':'?trialPierce=1','luck':'?trialLuck=1','both':'?trialPierce=1&trialLuck=1'},refund_rules='fixed canonical values; debuff/protection applied once; actual payout logged')
 names=['build_v0313.py','selection-v0313.js','selection-v0313.css','trials-v0313.js']
 meta['source_tree_dirty']=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--',*names],text=True).strip())
 meta['selection_sources']={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in names}
 meta['build_id']='0313-'+hashlib.sha256((g+json.dumps(meta['selection_sources'],sort_keys=True)).encode()).hexdigest()[:16]
 (P/'build.json').write_text(json.dumps(meta,indent=2))
 h=(P/'index.html').read_text()
 h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _:'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1)
 h=h.replace('</head>','<link rel="stylesheet" href="selection-v0313.css"></head>').replace('v0.3.12 보상·전술 카드','v0.3.13 카드 선택·환원 가치')
 (P/'index.html').write_text(h)
 # A synchronous committed choice must not be counted by both commit and use wrappers.
 core=P/'v0220-core.js';s=core.read_text()
 s=replace_once(s,'const before=deck.length;const r=use0.apply(this,arguments);if(c&&stats.cardsUsed>used){',"const before=deck.length,eventStart=events.length;const r=use0.apply(this,arguments);if(c&&stats.cardsUsed>used&&!events.slice(eventStart).some(e=>e.event_type==='card_used'&&e.payload.instance_id===c.id)){")
 s=replace_once(s,'perEnemy:c.perEnemy||0,passive:c.passive||null','perEnemy:c.perEnemy||0,passive:c.passive||null,refund_value:CARD_META_313.get(cardKey(c))?.refundValue??null,action_point_cost:apCost(c)')
 # Hand-phase targeted damage has its own event, separate from ordinary battle hits.
 s=replace_once(s,"for(const e of events){if(e.event_type!=='battle_resolved'||!e.payload.link_score)continue;", "for(const e of events){if(e.event_type==='targeted_pierce'){const a=out[e.mode];if(a){a.targeted_pierce_damage=(a.targeted_pierce_damage||0)+e.payload.damage;a.targeted_pierce_kills=(a.targeted_pierce_kills||0)+Number(e.payload.killed);}continue;}if(e.event_type!=='battle_resolved'||!e.payload.link_score)continue;")
 core.write_text(s)
 guide=P/'v030-tutorial.js';s=guide.read_text();s=s.replace('정가만큼 자원을 얻습니다.','고정 환원 가치만큼 자원을 얻습니다. 환원 가치는 할인·강화와 무관하며, 선택창에 디버프·보호 적용 후 실제 획득량이 표시됩니다.')
 guide.write_text(s)
 return meta
if __name__=='__main__':print(json.dumps(build()))
