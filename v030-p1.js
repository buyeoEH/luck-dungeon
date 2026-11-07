/* P1: deterministic combat conversion. No RNG; never changes score weights. */
const P1_ENABLED = window.LUCK_P1_ENABLED !== false;
const P1_CARDS = P1_ENABLED && window.LUCK_P1_CARDS !== false;
const P1_EXTRAS = P1_ENABLED && window.LUCK_P1_EXTRAS !== false;
let p1Round, p1PendingGuard = 0, p1RewardRound = 0;
function p1ResetRound(){p1Round={gaugeBonus:0,linkUsed:false,lances:new Set(),paidLances:new Set(),peakUses:0,step:20};}
function p1ResetRun(){p1ResetRound();p1PendingGuard=0;p1RewardRound=0;}
function p1RoundStart(){
  if(!P1_ENABLED)return;
  if(p1PendingGuard){prot.combo+=p1PendingGuard;log('🔗 연계 보상 → 이번 라운드 콤보 보호 +'+p1PendingGuard,'good');p1PendingGuard=0;}
  p1ResetRound();
}
p1ResetRun();
function p1Used(c,changes){
  if(!P1_CARDS)return;
  const before={gauge:p1Round.gaugeBonus,peak:p1Round.peakUses,step:p1Round.step,linkUsed:p1Round.linkUsed};
  if(c.type==='link'||c.linkAmp)p1Round.linkUsed=true;
  if(c.p1Gauge){p1Round.gaugeBonus+=c.p1Gauge;changes.push({text:'🔗 연계 게이지 원시 보너스 +'+c.p1Gauge+' (점수 보너스 아님)',color:'#4ade80'});}
  if(c.p1Peak){p1Round.peakUses++;changes.push({text:'🔗 확정 연계 게이지의 30%를 이번 공격에 추가 예약',color:'#4ade80'});}
  if(c.p1Lance)p1Round.lances.add(c.id);
  if(c.p1Step)p1Round.step=Math.min(p1Round.step,c.p1Step);
  if(p1Round.linkUsed)for(const id of p1Round.lances){
    if(p1Round.paidLances.has(id))continue;
    p1Round.paidLances.add(id);p1Round.gaugeBonus+=8;
    changes.push({text:'🔗 관통창 연계 → 게이지 원시 보너스 +8 (인스턴스당 1회)',color:'#4ade80'});
  }
  if(c.p1Gauge||c.p1Peak||c.p1Lance||c.linkAmp||before.gauge!==p1Round.gaugeBonus)window.Luck220?.emit('p1_card_used',{card_id:cardKey(c),instance_id:c.id,before,after:{gauge:p1Round.gaugeBonus,peak:p1Round.peakUses,step:p1Round.step,linkUsed:p1Round.linkUsed},paid_lance_instances:[...p1Round.paidLances]});
}
function p1Parts(comboRaw,comboNet,pv,basePre){
  if(!P1_ENABLED)return {gaugeRaw:0,gaugeNet:0,pierceBonus:0,attackPct:0,peakBonus:0,percentBonus:0,pre:basePre};
  // Existing hand combos and link attacks share one debuff pool. Gauge-only
  // card bonuses enter the allocation pool, not the attack/score combo total.
  const gaugeRaw=linkComboAttack+p1Round.gaugeBonus, poolRaw=comboRaw+p1Round.gaugeBonus;
  const poolNet=p1Round.gaugeBonus?applyCut(poolRaw,pv.combo):comboNet;
  const gaugeNet=poolRaw>0?Math.floor(gaugeRaw*poolNet/poolRaw):0;
  const attackPct=Math.min(4,Math.floor(gaugeNet/20))*5;
  const pierceBonus=Math.min(4,Math.floor(gaugeNet/p1Round.step));
  const peakBonus=Math.floor(gaugeNet*.30)*p1Round.peakUses;
  const percentBonus=Math.floor((basePre+peakBonus)*attackPct/100);
  return {gaugeRaw,gaugeNet,poolRaw,poolNet,cardGauge:p1Round.gaugeBonus,step:p1Round.step,pierceBonus,attackPct,peakBonus,percentBonus,pre:basePre+peakBonus+percentBonus};
}
function p1Capture(ap){return { ...ap.p1,existingPierce:pierce+handPassive('pierce'),totalPierce:pierce+handPassive('pierce')+ap.p1.pierceBonus,basePre:ap.basePre,attackPre:ap.pre,attackFinal:ap.final };}
function p1BattleDone(scene,snapshot){
  if(!P1_ENABLED)return;
  if(scene.p1?.resolved)return;
  const m=snapshot||{gaugeRaw:0,gaugeNet:0,pierceBonus:0,attackPct:0,peakBonus:0,percentBonus:0,existingPierce:0,totalPierce:0,no_strike:true};
  const hits=scene.events.filter(e=>e.type==='pierce');
  scene.p1={...m,resolved:true,battleRound:round,pierceHits:hits.length,pierceDamage:hits.reduce((n,e)=>n+e.damage,0),pierceKills:hits.filter(e=>e.killed).length,nextGuard:0,nextDraw:0};
  if(P1_EXTRAS&&p1RewardRound!==round){
    p1RewardRound=round;
    if(m.gaugeNet>=50){p1PendingGuard=1;scene.p1.nextGuard=1;}
    if(m.gaugeNet>=70){nextDraw+=1;scene.p1.nextDraw=1;}
  }
  log('🔗 연계 게이지 '+m.gaugeRaw+' → '+m.gaugeNet+' (디버프 후) · 변환 관통 +'+m.pierceBonus+' · 공격 +'+m.attackPct+'% / +'+(m.percentBonus+m.peakBonus)+' · 기존 연계 점수와 별도','good');
  log('🗡 관통 준비 '+m.totalPierce+' (기존 '+m.existingPierce+' + 변환 '+m.pierceBonus+') · 실제 '+hits.length+'회 / '+scene.p1.pierceDamage+' 피해 / '+scene.p1.pierceKills+'킬');
  if(scene.p1.nextGuard||scene.p1.nextDraw)log('🔗 다음 라운드 예약: 콤보 보호 +'+scene.p1.nextGuard+' / 드로우 +'+scene.p1.nextDraw,'good');
  window.Luck220?.emit('p1_battle',scene.p1);
}
function p1Hud(){
  if(!P1_ENABLED)return '';
  const m=attackParts().p1;
  return '<div class="p1-gauge" role="status"><b>🔗 연계 게이지 예상 '+m.gaugeRaw+' → '+m.gaugeNet+'</b><br>디버프 후 · 변환 관통 +'+m.pierceBonus+' / 공격 +'+m.attackPct+'%'+(m.peakBonus?' / 정점 +'+m.peakBonus:'')+'<br><small>20·40·60·80 구간 / 신규 관통 상한 4 · 연계 점수와 별도</small></div>';
}
function p1Catalog(){
  if(!P1_CARDS)return;
  const lance=RANDOM_POOL.find(c=>c.id==='lance');lance.p1Lance=true;lance.text+=' / 같은 라운드에 연계 액션 사용 시 게이지 +8 (장당 1회)';
  RANDOM_POOL.push(
    {id:'linkseal',name:'증폭 문장',price:8,type:'link',p1Gauge:15,text:'이번 전투 연계 게이지 원시 보너스 +15 / 콤보 디버프 적용 / 점수 보너스 아님',limit:3},
    {id:'linkpeak',name:'꿰뚫는 정점',price:12,type:'link',p1Peak:true,text:'이번 전투 확정 연계 게이지의 30%를 공격력에 추가 (버림) / 사용한 장마다 1회',limit:2}
  );
  PROMOS.push({id:'p_linklance',tier:1,branch:'연계 관통',from:{lance:2,combo:1},cost:{res:8},card:{id:'linklance',name:'연계 관통창',type:'pierce',atkTemp:12,pierce:1,p1Lance:true,p1Step:10,text:'이번 전투 공격 +12 / 관통 +1 / 연계 액션 사용 시 게이지 +8 / 변환 관통은 게이지 10당 +1 (기본 변환 대체·상한 4)'}});
}
