#!/usr/bin/env python3
"""Luck Dungeon AutoLab — real browser engine, seeded strategy runs and CSV/JSON output."""
import argparse,csv,json,statistics,os
from collections import Counter
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument('--runs',type=int,default=5,help='Runs per strategy')
 ap.add_argument('--strategies',default='random,economy,attack,aoe,link,survival')
 ap.add_argument('--seed',type=int,default=1000)
 ap.add_argument('--output',default='results')
 args=ap.parse_args()
 if not 1<=args.runs<=1000:ap.error('--runs must be 1..1000')
 strategies=[x.strip() for x in args.strategies.split(',') if x.strip()]
 if not strategies or len(strategies)!=len(set(strategies)) or set(strategies)-{'random','economy','attack','aoe','link','survival','promotion'}:ap.error('Provide unique, supported strategies')
 out=ROOT/args.output;out.mkdir(parents=True,exist_ok=True)
 if any((out/name).exists() for name in ('runs.csv','rounds.csv','events.jsonl','analysis.json','batch_id.txt')):ap.error('Use a fresh output directory to avoid stale results')
 rows=[]; traces=[];events=[];failures=[]
 with sync_playwright() as p:
  launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
  if os.environ.get('CHROMIUM_PATH'):launch['executable_path']=os.environ['CHROMIUM_PATH']
  browser=p.chromium.launch(**launch)
  page=browser.new_page(viewport={'width':1280,'height':800})
  # Load only the local engine and bot: simulations never start cloud/history clients.
  page.route('**/*',lambda route:route.abort())
  import re
  document=re.sub(r'<script\b[^>]*>.*?</script>', '', (ROOT/'index.html').read_text(encoding='utf-8'),flags=re.S|re.I)
  document=re.sub(r'<link\b[^>]*>', '', document,flags=re.I)
  page.set_content(document,wait_until='load')
  page.add_script_tag(content=(ROOT/'game.js').read_text(encoding='utf-8'))
  page.add_script_tag(content=(ROOT/'autolab.js').read_text(encoding='utf-8'))
  page.wait_for_function('!!window.AutoLab')
  for profile in strategies:
   for i in range(args.runs):
    seed=args.seed+i
    try:
     page.evaluate('(s)=>AutoLab.begin(s)',seed)
     result=page.evaluate('(profile)=>AutoLab.run(profile)',profile)
     st=result['final'];stats=st['stats']
     row={'strategy':profile,'seed':seed,'round':st['round'],'phase':st['phase'],'score':st['score'],'cleared':int(bool(stats['round30Clear'])),'enemies':st['enemyCount'],'enemyHp':st['enemyHp'],'deck':st['deckSize'],'damage':stats['damageDealt'],'aoeDamage':stats['aoeDamage'],'pierceDamage':stats['pierceDamage'],'overkillDamage':stats['overkillDamage'],'promotions':stats['promotions'],'comboTriggers':stats['comboTriggers'],'cardsBought':stats['cardsBought'],'error':' | '.join(result['errors']+([] if result['finished'] else ['step_limit_incomplete'])),'finished':int(bool(result['finished'])),'steps':result.get('steps',0)}
     rows.append(row)
     for t in result['trace']:traces.append({'strategy':profile,'seed':seed,**t})
     for j,event in enumerate(result.get('events',[])):events.append({'strategy':profile,'seed':seed,'eventIndex':j,**event})
     if row['error']:failures.append({'strategy':profile,'seed':seed,'errors':row['error'].split(' | '),'logs':result['logs']})
    except Exception as e:failures.append({'strategy':profile,'seed':seed,'errors':[str(e)]})
  browser.close()
 for name,data in [('runs.csv',rows),('rounds.csv',traces)]:
  if data:
   with (out/name).open('w',newline='',encoding='utf-8-sig') as f:
    writer=csv.DictWriter(f,fieldnames=list(data[0]));writer.writeheader();writer.writerows(data)
 with (out/'events.jsonl').open('w',encoding='utf-8') as f:
  for e in events:f.write(json.dumps(e,ensure_ascii=False,separators=(',',':'))+'\n')
 (out/'errors.json').write_text(json.dumps(failures,ensure_ascii=False,indent=2),encoding='utf-8')
 summary=[]
 for profile in strategies:
  group=[r for r in rows if r['strategy']==profile];valid=[r for r in group if not r['error']]
  if valid:summary.append({'strategy':profile,'runs':len(valid),'clear_rate':sum(r['cleared'] for r in valid)/len(valid),'avg_score':round(statistics.mean(r['score'] for r in valid),1),'avg_round':round(statistics.mean(r['round'] for r in valid),1),'avg_aoe_share':round(statistics.mean(r['aoeDamage']/max(1,r['damage']) for r in valid),3)})
 (out/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
 # Standalone dashboard: no external libraries required.
 import html
 blocks=[]
 for x in summary:
  blocks.append(f'<article><h3>{html.escape(x["strategy"])}</h3><div class="big">{x["avg_score"]:,.0f}</div><small>평균 점수 · {x["runs"]}회</small><p>R30 클리어율 {x["clear_rate"]:.0%} · 평균 R{x["avg_round"]}</p><div class="track"><div style="width:{x["clear_rate"]*100:.1f}%"></div></div><p>광역 피해 비중 {x["avg_aoe_share"]:.1%}</p></article>')
 counts=Counter(str(r['round']) for r in rows if r['phase']=='gameover')
 maxcount=max(counts.values(),default=1)
 bars=''.join(f'<div class="bar"><span>R{k}</span><div class="track"><div style="width:{v/maxcount*100:.1f}%"></div></div><b>{v}</b></div>' for k,v in sorted(counts.items(),key=lambda kv:int(kv[0])))
 dashboard='''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Luck Dungeon AutoLab</title><style>body{font-family:system-ui;background:#101827;color:#e5edf8;max-width:1100px;margin:auto;padding:25px}h1{color:#8ec5ff}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}article,section{background:#1b293b;border:1px solid #30445d;border-radius:14px;padding:18px}.big{font-size:30px;font-weight:800}.track{height:12px;background:#314156;border-radius:8px;overflow:hidden;flex:1}.track div{height:100%;background:#56a8ef}.bar{display:flex;align-items:center;gap:12px;margin:10px 0}.bar span{width:40px}.bar b{width:35px}small{color:#9aadc4}a{color:#91caff}</style><h1>Luck Dungeon · AutoLab v0.2</h1><p>실제 브라우저 게임 엔진 자동 실행 결과 · 전략 봇은 최적 플레이를 보장하지 않습니다.</p><main>'''+''.join(blocks)+'''</main><section><h2>패배 라운드 분포</h2>'''+bars+'''</section><p>원본 데이터: <a href="runs.csv">runs.csv</a> · <a href="rounds.csv">rounds.csv</a> · <a href="summary.json">summary.json</a></p></html>'''
 (out/'dashboard.html').write_text(dashboard,encoding='utf-8')
 print(json.dumps({'summary':summary,'failures':len(failures),'output':str(out)},ensure_ascii=False,indent=2))
 if failures:raise SystemExit(f'{len(failures)} AutoLab run(s) failed; inspect errors.json')
if __name__=='__main__':main()
