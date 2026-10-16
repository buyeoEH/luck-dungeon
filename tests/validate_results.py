"""Verify real-engine logs before uploading them to Supabase."""
import csv
import json
from collections import defaultdict
from pathlib import Path
import sys

out = Path(sys.argv[1] if len(sys.argv) > 1 else 'results')
with (out / 'runs.csv').open(encoding='utf-8-sig') as f:
    runs = list(csv.DictReader(f))
with (out / 'rounds.csv').open(encoding='utf-8-sig') as f:
    rounds = list(csv.DictReader(f))
events = [json.loads(line) for line in (out / 'events.jsonl').read_text().splitlines() if line]
assert not json.loads((out / 'errors.json').read_text()), 'Engine errors present'
rounds_by_run = defaultdict(list)
events_by_run = defaultdict(list)
for row in rounds:
    rounds_by_run[(row['strategy'], str(row['seed']))].append(row)
for event in events:
    events_by_run[(event['strategy'], str(event['seed']))].append(event)
assert len({(r['strategy'], r['seed']) for r in runs}) == len(runs), 'Duplicate runs'
for run in runs:
    key = (run['strategy'], run['seed'])
    trace, actions = rounds_by_run[key], events_by_run[key]
    assert run['finished'] == '1' and not run['error'], key
    assert [int(r['round']) for r in trace] == list(range(1, int(run['round']) + 1)), key
    assert sum(int(r['damage']) for r in trace) == int(run['damage']), key
    assert sum(int(r['aoeDamage']) for r in trace) == int(run['aoeDamage']), key
    assert sum(e['type'] == 'purchase' for e in actions) == int(run['cardsBought']), key
    assert sum(e['type'] == 'promotion' for e in actions) == int(run['promotions']), key
    assert [e['eventIndex'] for e in actions] == list(range(len(actions))), key
    for e in actions:
        if e['type'] == 'purchase':
            assert e['cashBefore'] - e['cashAfter'] == e['price'], (key, e)
print(f'Validated {len(runs)} runs, {len(rounds)} rounds, {len(events)} events')
