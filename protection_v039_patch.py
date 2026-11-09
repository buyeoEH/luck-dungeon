from pathlib import Path
R=Path(__file__).resolve().parent
CSS='''
.guard-options,.guard-preview,.guard-results{padding:10px;border:1px solid #397082;border-radius:8px;background:#142b35;font-size:12px;line-height:1.6;margin:8px 0}.guard-policy{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.guard-policy select{min-height:40px;background:#192c3c;color:#fff;padding:6px;border:1px solid #70bfa7;border-radius:6px;max-width:100%}.guard-options small{display:block;color:#b3cbd8}.guard-feedback{font-size:12px;padding:8px;min-height:18px;line-height:1.5;overflow-wrap:anywhere}.guard-feedback:empty{display:none}.guard-feedback.protected,.guard-theft.protected{color:#9af0cc;animation:guard-shield .6s ease}.guard-feedback.debuff,.guard-results{animation:guard-weaken .6s ease}.guard-feedback.unnecessary{color:#9bb2c4}.guard-thefts{display:flex;gap:8px;flex-wrap:wrap;padding:8px}.guard-theft{display:inline-flex;gap:4px;align-items:center;background:#142a35;padding:8px;border-radius:6px}.guard-gem{display:inline-block}.theft_success .guard-gem{animation:guard-gem-flight .8s ease}.theft_failed .guard-gem{animation:guard-fail .5s ease}.protected .guard-gem{animation:guard-block .6s ease}@keyframes guard-shield{50%{box-shadow:0 0 15px #60e0b5;background:#204839}}@keyframes guard-weaken{50%{filter:brightness(.65);transform:translateY(2px)}}@keyframes guard-gem-flight{70%{transform:translateX(28px);opacity:.25}}@keyframes guard-fail{25%{transform:rotate(20deg)}75%{transform:rotate(-20deg)}}@keyframes guard-block{40%{transform:translateX(12px)}80%{transform:translateX(-5px)}}@media(prefers-reduced-motion:reduce){.guard-feedback,.guard-results,.guard-gem{animation:none!important}}
'''
def patch(g):
 def change(a,b):
  nonlocal g
  assert g.count(a)==1,(a[:80],g.count(a));g=g.replace(a,b)
 change('''enemies.forEach(e => {
    if (e?.d?.baseP !== undefined) {
      e.d.p = e.d.baseP;
    }
  });''','''enemies.forEach(e=>enemyDebuffs(e).forEach(d=>{d.p=d.baseP;}));''')
 change("const rc = resolveDebuff('combo', true);   // 보호력 실제 소모 + 디버프 소진\n    const ra = resolveDebuff('attack', true);", "const protectionPlan=guardCombatPlan();\n    const rc=guardCommit(protectionPlan.combo,'combo'),ra=guardCommit(protectionPlan.attack,'attack');")
 a=g.index('    if (rc.who.length > 0) {');b=g.index('    let remaining = hit;',a);g=g[:a]+'    guardFinishCombat(protectionPlan);\n\n'+g[b:]
 a=g.index("  enemies.filter(e => e.steal && isEnemyDebuffActive(e)).forEach(e => {");b=g.index('\n\n  while (killedBossZones',a);g=g[:a]+'  stealLines.push(...guardThefts());'+g[b:]
 change('  p1BattleDone(pendingBattleScene,p1BattleSnapshot);', "  pendingBattleScene.protection=guardLastCombat;pendingBattleScene.thefts=guardReports.slice();if(!shouldPlayBattleMotion())guardAnnounce();\n  p1BattleDone(pendingBattleScene,p1BattleSnapshot);")
 change('const add = e => { if (e.d && proj[e.d.k]) proj[e.d.k][e.d.pct ? 1 : 0] += e.d.baseP; };', 'const add=e=>enemyDebuffs(e).forEach(d=>{if(proj[d.k])proj[d.k][d.pct?1:0]+=d.baseP;});')
 g=g.replace('((e.d && e.d.p > 0) || !!e.steal)', '(enemyDebuffs(e).some(d=>d.p>0)||!!e.steal)').replace('((e.d&&e.d.p>0)||e.steal)', '(enemyDebuffs(e).some(d=>d.p>0)||e.steal)')
 g=g.replace('resource += c.res || 0;', "resource += gain('resource',c.res||0);")
 g=g.replace('resource = Math.max(0, nextRes);', "resource = gain('resource',Math.max(0,nextRes));")
 g=g.replace('resource+=8; statusChanges.push(\'💰 자원 +8\');', "const n=gain('resource',8);resource+=n;statusChanges.push('💰 자원 +'+n);")
 g=g.replace('else resource+=5;', "else resource+=gain('resource',5);")
 g=g.replace('if (r.res) resource += r.res;', "if(r.res)resource+=gain('resource',r.res);")
 g=g.replace("if(target==='resource'){resource+=2*n;log('💎 '+n+'개 → 자원 +'+(2*n));}", "if(target==='resource'){const amount=gain('resource',2*n);resource+=amount;log('💎 '+n+'개 → 자원 +'+amount);}")
 g=g.replace("log('🔓 구간 보스 처치! ' + ((cleared - 1) * 5 + 1) + '~' + (cleared * 5) + 'R 디버프 종료 → ' + ((activeDebuffZone - 1) * 5 + 1) + '~' + (activeDebuffZone * 5) + 'R 적 디버프 활성화', 'good');","log('🔓 구간 진행 · 생존 적의 디버프는 처치할 때까지 유지됩니다.','good');")
 g+='\n'+(R/'protection-v039.js').read_text()
 # User-facing legacy name only; storage keys remain compatible.
 g=g.replace('콤보 보호','연계 보호').replace('콤보 디버프','연계 디버프').replace("combo: '콤보', all: '전체'","combo: '연계', all: '전체'")
 return g
