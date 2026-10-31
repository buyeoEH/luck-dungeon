"""Review candidates only: MP3 CBR128kbps stereo, original assets untouched."""
from pathlib import Path
import hashlib,json,subprocess,os
from concurrent.futures import ThreadPoolExecutor
R=Path(__file__).resolve().parent;S=R;D=R/'release-audio-candidates';D.mkdir(exist_ok=True)
m=json.loads((S/'assets/audio/manifest.json').read_text())
def one(t):
 source=S/'assets'/t['file'];out=D/(t['id']+'.pending.mp3');subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-vn','-codec:a','libmp3lame','-b:a','128k','-ar','44100','-ac','2',str(out)],check=True)
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,bit_rate:stream=sample_rate,channels','-of','json',str(out)],text=True));duration=float(info['format']['duration']);assert abs(duration-float(t['duration']))<.12,(t['id'],duration)
 subprocess.run(['ffmpeg','-v','error','-i',str(out),'-f','null','-'],check=True,stdout=subprocess.DEVNULL)
 with out.open('rb') as f:os.fsync(f.fileno())
 final=D/(t['id']+'.mp3');out.replace(final);out=final
 return {'id':t['id'],'source':t['file'],'aliases':[t['file']]+([t['file'].replace('.ogg','.mp3')] if t['file'].endswith('.ogg') else []),'file':out.name,'original_duration':t['duration'],'duration':duration,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'channels':info['streams'][0]['channels'],'sample_rate':info['streams'][0]['sample_rate'],'decode_ok':True}
with ThreadPoolExecutor(max_workers=3) as e:rows=list(e.map(one,m['tracks']))
r={'policy_selected':False,'encoding':'MP3 128kbps stereo 44.1kHz','tracks':rows,'original_selected_bytes':sum((S/'assets'/t['file']).stat().st_size for t in m['tracks']),'candidate_bytes':sum(x['bytes'] for x in rows)};temp=D/'manifest.pending.json';temp.write_text(json.dumps(r,ensure_ascii=False,indent=2))
with temp.open('rb') as f:os.fsync(f.fileno())
temp.replace(D/'manifest.json')
for t in rows:assert hashlib.sha256((D/t['file']).read_bytes()).hexdigest()==t['sha256']
print('comparison audio tracks',len(rows),'bytes',r['candidate_bytes'])
