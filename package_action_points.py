"""Reuse the verified standalone builder without editing original artifacts."""
import shutil
from pathlib import Path
import build_v030_standalone as standalone
R=Path(__file__).resolve().parent
work=R/'ap-package-work';work.mkdir(exist_ok=True)
audio=work/'release-audio-candidates'
if not audio.exists():audio.symlink_to(R/'release-audio-candidates',target_is_directory=True)
standalone.R=work
standalone.P=R/'_site/preview/v0.3-ap'
standalone.D=R/'ap-delivery';standalone.D.mkdir(exist_ok=True)
standalone.build('embedded')
site=Path('/workspace/sites/luck-action-points/dist');site.mkdir(parents=True,exist_ok=True)
shutil.copyfile(standalone.D/'LUCK-v0.3.1-ap.exp.1-embedded/index.html',site/'index.html')
