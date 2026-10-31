"""Source-based PCM scenarios, not browser-process RAM measurements."""
from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parent
s=(R/'luck-audio.js').read_text();tracks=json.loads(re.search(r'const tracks=(\[.*?\]);',s).group(1));bgm=[t for t in tracks if t['loop']];rows=[]
for rate in [44100,48000]:
 def value(seconds):return {'bytes':round(seconds*rate*2*4),'MB':seconds*rate*2*4/1e6,'MiB':seconds*rate*2*4/2**20}
 rows.append({'sample_rate':rate,'channels':2,'bytes_per_sample':4,'all_bgm':value(sum(t['duration'] for t in bgm)),'all_tracks':value(sum(t['duration'] for t in tracks)),'largest_bgm':value(max(t['duration'] for t in bgm)),'two_largest_bgm':value(sum(sorted(t['duration'] for t in bgm)[-2:]))})
assert 'decodeAudioData' not in s and 'new AudioContext' not in s and "a.preload='none'" in s
report={'type':'hypothetical_float32_pcm_capacity_not_actual_RAM','runtime_source_sha256':hashlib.sha256(s.encode()).hexdigest(),'runtime_uses_media_elements':True,'runtime_eager_decodeAudioData':False,'embedded_http_streaming':False,'preload':'none_hint_only','bgm_tracks':len(bgm),'all_tracks':len(tracks),'bgm_seconds':sum(t['duration'] for t in bgm),'all_seconds':sum(t['duration'] for t in tracks),'scenarios':rows,'bgm':bgm,'excludes':['compressed/base64 copies','images/DOM/JS','decoder/mixer overhead','retained media buffers','GC timing'],'sources':['https://html.spec.whatwg.org/multipage/media.html#attr-media-preload','https://www.w3.org/TR/2021/REC-webaudio-20210617/#AudioBuffer']}
media=R/'release-audio-candidates/manifest.json'
if media.exists():
 m=json.loads(media.read_text());ids={t['id'] for t in bgm};bgm_rows=[t for t in m['tracks'] if t['id'] in ids];chars=sum(4*((t['bytes']+2)//3) for t in bgm_rows);report['compressed_bgm']={'bytes':sum(t['bytes'] for t in bgm_rows),'base64_chars_excluding_prefix':chars,'base64_string_storage_scenarios_bytes':[chars,chars*2],'warning':'string scenarios only, not measured JS heap; copies and decoder buffers may add memory'}
O=R/'audio-final-results';O.mkdir(exist_ok=True);(O/'memory-estimate.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False))
