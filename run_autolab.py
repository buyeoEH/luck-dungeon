#!/usr/bin/env python3
"""Luck Dungeon AutoLab — real browser engine, seeded strategy runs and CSV/JSON output."""
import argparse,csv,json,statistics,threading,http.server,functools
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
 args=ap.parse_args(); out=ROOT/args.output;out.mkdir(parents=True,exist_ok=True)
 strategies=[x.strip() for x in args.strategies.split(',') if x.strip()]
 rows=[]; traces=[];failures=[]
 handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT))
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
 threading.Thread(target=server.serve_forever,daemon=True).start()
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=__import__('os').environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--no-proxy-server' ])
  page=browser.new_page(viewport={'width':1280,'height':800});page.set_content((ROOT/'index.html').read_text(encoding='utf-8').replace('<script src="game.js"></script>', '<script>'+ (ROOT/'game.js').read_text(encoding='utf-8') + '</script>').replace('<script src="autolab.js"></script>', '<script>'+ (ROOT/'autolab.js').read_text(encoding='utf-8') + '</script>'),wait_until='load');page.wait_for_function('!!window.AutoLab')
  for profile in strategies:
   for i in range(args.runs):
    seed=args.seed+i
    try:
     page.evaluate('(s)=>AutoLab.begin(s)',seed)
     result=page.evaluate('(profile)=>AutoLab.run(profile)',profile)
     st=result['final'];stats=st['stats']
     row={'strategy':profile,'seed':seed,'round':st['round'],'phase':st['phase'],'score':st['score'],'cleared':int(bool(stats['round30Clear'])),'enemies':st['enemyCount'],'enemyHp':st['enemyHp'],'deck':st['deckSize'],'damage':stats['damageDealt'],'aoeDamage':stats['aoeDamage'],'pierceDamage':stats['pierceDamage'],'overkillDamage':stats['overkillDamage'],'promotions':stats['promotions'],'comboTriggers':stats['comboTriggers'],'cardsBought':stats['cardsBought'],'error':' | '.join(result['errors']),'finished':int(result['finished']),'steps':result['steps']}
     rows.append(row)
     for t in result['trace']:traces.append({'strategy':profile,'seed':seed,**t})
     if row['error'] or not result['finished']:failures.append({'strategy':profile,'seed':seed,'errors':result['errors'],'logs':result['logs']})
    except Exception as e:failures.append({'strategy':profile,'seed':seed,'errors':[str(e)]})
  browser.close()
 server.shutdown()
 for name,data in [('runs.csv',rows),('rounds.csv',traces)]:
  if data:
   with (out/name).open('w',newline='',encoding='utf-8-sig') as f:
    writer=csv.DictWriter(f,fieldnames=list(data[0]));writer.writeheader();writer.writerows(data)
 (out/'errors.json').write_text(json.dumps(failures,ensure_ascii=False,indent=2),encoding='utf-8')
 summary=[]
 for profile in strategies:
  group=[r for r in rows if r['strategy']==profile];valid=[r for r in group if not r['error'] and r['finished']]
  if valid:summary.append({'strategy':profile,'runs':len(valid),'clear_rate':sum(r['cleared'] for r in valid)/len(valid),'avg_score':round(statistics.mean(r['score'] for r in valid),1),'avg_round':round(statistics.mean(r['round'] for r in valid),1),'avg_aoe_share':round(statistics.mean(r['aoeDamage']/max(1,r['damage']) for r in valid),3),'avg_promotions':round(statistics.mean(r['promotions'] for r in valid),2)})
 (out/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
 # Machine-readable analysis, including incomplete runs excluded from performance metrics.
 analysis={'total_runs':len(rows),'finished_runs':sum(r['finished'] for r in rows),'incomplete_runs':sum(not r['finished'] for r in rows),'error_runs':sum(bool(r['error']) for r in rows),'phase_counts':dict(Counter(r['phase'] for r in rows)),'strategies':summary,'warning':'Bot performance is not equivalent to human difficulty; inspect incomplete runs before balancing.'}
 (out/'analysis.json').write_text(json.dumps(analysis,ensure_ascii=False,indent=2),encoding='utf-8')
 report=['# Luck Dungeon AutoLab 2.0 자동 분석','',f"- 총 실행: {analysis['total_runs']}회",f"- 정상 종료: {analysis['finished_runs']}회",f"- 비정상/미완료: {analysis['incomplete_runs']}회",f"- 오류 기록: {analysis['error_runs']}회",'','## 전략별 결과','', '| 전략 | 유효 횟수 | 평균 라운드 | 평균 점수 | 클리어율 | 평균 승급 |','|---|---:|---:|---:|---:|---:|']
 for x in summary:report.append(f"| {x['strategy']} | {x['runs']} | {x['avg_round']} | {x['avg_score']} | {x['clear_rate']:.1%} | {x['avg_promotions']} |")
 report+=['','## 주의','- AI 전략의 성능만으로 게임 난이도를 확정하지 않습니다.','- 미완료 기록은 성능 평균에서 제외합니다.','- 실제 게임 밸런스 변경은 별도 승인 후 진행합니다.']
 (out/'analysis.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
 # Standalone dashboard: no external libraries required.
 import html
 blocks=[]
 for x in summary:
  blocks.append(f'<article><h3>{html.escape(x["strategy"])}</h3><div class="big">{x["avg_score"]:,.0f}</div><small>평균 점수 · {x["runs"]}회</small><p>R30 클리어율 {x["clear_rate"]:.0%} · 평균 R{x["avg_round"]}</p><div class="track"><div style="width:{x["clear_rate"]*100:.1f}%"></div></div><p>광역 피해 비중 {x["avg_aoe_share"]:.1%}</p></article>')
 counts=Counter(str(r['round']) for r in rows if r['phase']=='gameover')
 maxcount=max(counts.values(),default=1)
 bars=''.join(f'<div class="bar"><span>R{k}</span><div class="track"><div style="width:{v/maxcount*100:.1f}%"></div></div><b>{v}</b></div>' for k,v in sorted(counts.items(),key=lambda kv:int(kv[0])))
 dashboard='''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Luck Dungeon AutoLab</title><style>body{font-family:system-ui;background:#101827;color:#e5edf8;max-width:1100px;margin:auto;padding:25px}h1{color:#8ec5ff}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}article,section{background:#1b293b;border:1px solid #30445d;border-radius:14px;padding:18px}.big{font-size:30px;font-weight:800}.track{height:12px;background:#314156;border-radius:8px;overflow:hidden;flex:1}.track div{height:100%;background:#56a8ef}.bar{display:flex;align-items:center;gap:12px;margin:10px 0}.bar span{width:40px}.bar b{width:35px}small{color:#9aadc4}a{color:#91caff}</style><h1>Luck Dungeon · AutoLab v0.1</h1><p>실제 브라우저 게임 엔진 자동 실행 결과 · 전략 봇은 최적 플레이를 보장하지 않습니다.</p><main>'''+''.join(blocks)+'''</main><section><h2>패배 라운드 분포</h2>'''+bars+'''</section><p>원본 데이터: <a href="runs.csv">runs.csv</a> · <a href="rounds.csv">rounds.csv</a> · <a href="summary.json">summary.json</a></p></html>'''
 (out/'dashboard.html').write_text(dashboard,encoding='utf-8')
 print(json.dumps({'summary':summary,'failures':len(failures),'output':str(out)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
