/* Five shared appearance choices. Custom images stay in this page's memory. */
(function(){'use strict';
const presets=[
 {id:'knight',name:'별빛 기사',src:'assets/player/adventurer-knight.png'},
 {id:'rogue',name:'쌍검 모험가',src:'assets/player/adventurer-rogue.png'},
 {id:'priest',name:'새벽 사제',src:'assets/player/adventurer-priest.png'},
 {id:'mage',name:'황혼 마법사',src:'assets/player/adventurer-mage.png'},
 {id:'archer',name:'숲의 궁수',src:'assets/player/adventurer-archer.png'}
];
const $=id=>document.getElementById(id);
function sync(){
 const selected=presets.find(p=>p.src===luckAvatar),locked=luckAvatarLocked||luckAvatarLoading;
 document.querySelectorAll('[data-adventurer-id]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.adventurerId===selected?.id));button.disabled=locked;
 });
 const reset=$('luckAvatarReset');if(reset)reset.disabled=locked;
 const label=$('adventurerSelected');if(label)label.textContent='선택한 모험가: '+(selected?.name||'내 이미지')+(luckAvatarLocked?' · 플레이 중 고정':'');
}
function select(id,announce=true){
 if(luckAvatarLocked||luckAvatarLoading)return false;
 const preset=presets.find(p=>p.id===id);if(!preset)return false;
 luckAvatar=preset.src;if($('luckAvatarFile'))$('luckAvatarFile').value='';luckRefreshAvatar();
 if(announce&&$('luckAvatarStatus'))$('luckAvatarStatus').textContent=preset.name+' 모험가를 선택했습니다.';
 return true;
}
function reset(){return select('knight');}
function boot(){
 const box=$('adventurerChoices');if(!box)return;
 for(const preset of presets){
  const button=document.createElement('button');button.type='button';button.className='adventurer-choice';button.dataset.adventurerId=preset.id;button.setAttribute('aria-pressed','false');
  const img=document.createElement('img');img.src=preset.src;img.alt='';img.decoding='async';img.width=90;img.height=90;
  const label=document.createElement('span');label.textContent=preset.name;button.append(img,label);button.onclick=()=>select(preset.id);box.append(button);
 }
 select('knight',false);
}
window.LuckAvatars={presets,select,reset,sync};document.addEventListener('DOMContentLoaded',boot);
})();
