/* View-only controls; combat, economy and protection calculations are untouched. */
window.LuckMobileUI=(()=>{
 let dialog,box,tooltip,header,frame;
 function position(){
  if(!dialog?.open)return;
  const v=window.visualViewport,z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;
  const w=(v?.width||innerWidth)/z,h=(v?.height||innerHeight)/z;
  const width=Math.max(1,Math.min(420,w-24)),height=Math.max(1,h-24);
  Object.assign(dialog.style,{left:((v?.offsetLeft||0)/z+(w-width)/2)+'px',top:((v?.offsetTop||0)/z+12)+'px',width:width+'px',maxHeight:height+'px'});
 }
 function measure(){
  frame=null;if(!header)return;
  const h=header.getBoundingClientRect().height,v=window.visualViewport;
  const flow=innerWidth<=600&&h>(v?.height||innerHeight)*.34;
  header.classList.toggle('luck-hud-flow',flow);
  const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;
  document.documentElement.style.setProperty('--luck-hud-clearance',(flow?12:h/z+12)+'px');
  position();
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(measure);}
 function close(){if(dialog?.open){box.setAttribute('aria-expanded','false');dialog.close();}}
 function open(){
  updateAtkTooltip();tooltip.classList.remove('hide');
  if(!dialog.open)dialog.showModal();position();box.setAttribute('aria-expanded','true');
 }
 function bindAttackDetails(){
  box=document.getElementById('atkContainer');tooltip=document.getElementById('atkTooltip');
  if(!box||!tooltip)return;
  dialog=document.createElement('dialog');dialog.id='attackDetailsDialog';dialog.setAttribute('aria-labelledby','attackDetailsTitle');
  dialog.innerHTML='<header class="attack-details-heading"><h2 id="attackDetailsTitle">공격력 상세</h2><button type="button" aria-label="공격력 상세 닫기">닫기 ✕</button></header>';
  dialog.append(tooltip);document.body.append(dialog);
  box.setAttribute('role','button');box.setAttribute('aria-haspopup','dialog');box.setAttribute('aria-controls',dialog.id);box.setAttribute('aria-expanded','false');
  box.addEventListener('click',e=>{e.stopPropagation();open();});
  box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  dialog.querySelector('button').addEventListener('click',close);
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  dialog.addEventListener('cancel',()=>{box.setAttribute('aria-expanded','false');});
  dialog.addEventListener('close',()=>{box.setAttribute('aria-expanded','false');box.focus({preventScroll:true});});
  header=document.querySelector('.sticky-header');
  if(header&&window.ResizeObserver)new ResizeObserver(schedule).observe(header);
  window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
  measure();
 }
 return {bindAttackDetails,refreshLayout:measure};
})();
