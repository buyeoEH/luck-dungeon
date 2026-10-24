"""Run five real-engine strategies on the same ten starting seeds; export every event."""
import csv,json,statistics
import test_v0220 as base
base.StabilityTests.setUpClass()
results=[]
try:
 for profile in ['pure','aoe','pierce','economy_link','luck']:
  for seed in range(220001,220021 if profile=='pure' else 220011):
   t=base.StabilityTests('test_06_local_event_persistence_and_version');t.setUp()
   try:
    t.page.evaluate("render=()=>{};actionFlash=()=>{};focusSection=()=>{};log=(s)=>{fullLogs.push('[R'+round+']['+phase+'] '+plainLogText(s));};")
    t.page.add_script_tag(path=str(base.R/'v0220-bots.js'))
    row=t.page.evaluate('([p,s])=>StabilityBots.run(p,s)',[profile,seed]);assert row['finished'] and not row['error'],row.get('error');assert not row['contamination']
    if profile=='pure':assert row['stats']['aoeDamage']==0 and row['stats']['pierceDamage']==0 and all(not r['aoe'] and not r['pierce'] for r in row['rounds'])
    # The seed must produce an identical first shop for all strategies.
    peer=next((r for r in results if r['seed']==seed),None)
    if peer:assert row['first_shop']==peer['first_shop']
    assert not t.errors,t.errors
    base.OUT.joinpath(f'bot-{profile}-{seed}.json').write_text(json.dumps(row,ensure_ascii=False))
    results.append(row);print(profile,seed,'R'+str(row['round']),row['cleared'],flush=True)
   finally:t.page.close()
 summary=[]
 for p in ['pure','aoe','pierce','economy_link','luck']:
  rs=[r for r in results if r['profile']==p]
  summary.append({'profile':p,'runs':len(rs),'clears':sum(r['cleared'] for r in rs),'clear_rate':sum(r['cleared'] for r in rs)/len(rs),'mean_round':statistics.mean(r['round'] for r in rs),'mean_score':statistics.mean(r['score'] for r in rs),'mean_max_attack':statistics.mean(r['stats']['maxAttack'] for r in rs),'mean_debuff_loss':statistics.mean(r['stats']['attackDebuffLoss'] for r in rs),'mean_promotions':statistics.mean(r['stats']['promotions'] for r in rs),'max_remaining_hp':max(r['rounds'][-1]['enemy_hp'] for r in rs if r['rounds']),'contamination':sum(len(r['contamination']) for r in rs)})
 base.OUT.joinpath('comparison-summary.json').write_text(json.dumps(summary,indent=2))
 with base.OUT.joinpath('comparison-summary.csv').open('w') as f:w=csv.DictWriter(f,fieldnames=list(summary[0]));w.writeheader();w.writerows(summary)
 print(json.dumps(summary,indent=2))
finally:base.StabilityTests.tearDownClass()
