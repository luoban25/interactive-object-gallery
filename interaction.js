(()=>{
const svg=document.querySelector('#scene');
const devices=[...svg.querySelectorAll('.device')],links=[...svg.querySelectorAll('.cable')];
const status=document.querySelector('#status'),inputEl=document.querySelector('#screen-input'),resultEl=document.querySelector('#screen-result'),modeEl=document.querySelector('#screen-mode');
let input='',caret=0,selectedTray=0,caps=false,inspect=false,timers=[],activeAction=null;
const stored=['','','',''],mounted=[true,true];
const savedTabs=new Map();
const plans={
 laptop:{label:'上传至 NAS',steps:[{nodes:['laptop','switch'],link:0},{nodes:['switch','nas'],link:1}]},
 nas:{label:'从 NAS 读取',steps:[{nodes:['nas','switch'],link:1,reverse:true},{nodes:['switch','laptop'],link:0,reverse:true}]},
 dock:{label:'硬盘备份至 NAS',steps:[{nodes:['dock','nas'],link:2,reverse:true}]},
 switch:{label:'检查网络连接',steps:[{nodes:['switch','laptop'],link:0,reverse:true},{nodes:['switch','nas'],link:1}]}
};
function renderInput(){const start=Math.max(0,caret-22);inputEl.textContent=input.slice(start,caret)+'▏'+input.slice(caret,Math.min(input.length,start+24));svg.dataset.input=input;resultEl.textContent=`DRIVE 0${selectedTray+1} / ${new TextEncoder().encode(input).length} BYTES`}
function selectTray(i){if(activeAction){stop(false);modeEl.textContent='TRANSFER CANCELLED'}selectedTray=(i+4)%4;svg.dataset.tray=selectedTray;document.querySelectorAll('.tray').forEach((t,j)=>{t.classList.toggle('selected',j===selectedTray);t.setAttribute('aria-pressed',String(j===selectedTray))});renderInput();status.textContent=`已选择盘位 ${selectedTray+1}`}
function setInspect(value){inspect=value;svg.classList.toggle('inspecting',value);svg.setAttribute('viewBox',value?'190 100 540 530':'0 0 1440 1080');document.querySelector('#touchpad').setAttribute('aria-pressed',String(value));for(const id of ['nas','switch','dock']){const device=document.getElementById(id);device.toggleAttribute('inert',value);device.setAttribute('aria-hidden',String(value));device.querySelectorAll('[role="button"]').forEach(b=>{if(value){if(!savedTabs.has(b))savedTabs.set(b,b.tabIndex);b.tabIndex=-1}else if(savedTabs.has(b)){b.tabIndex=savedTabs.get(b);savedTabs.delete(b)}})}}
function clearEffects(){devices.forEach(d=>{d.classList.remove('busy','source','complete');d.removeAttribute('aria-busy')});links.forEach(l=>l.classList.remove('flowing','reverse'))}
function stop(announce=true){timers.forEach(clearTimeout);timers=[];clearEffects();activeAction=null;svg.dataset.state='idle';delete svg.dataset.action;if(announce){status.textContent='操作已停止';modeEl.textContent='STOPPED / ENTER TO SEND'}}
function toggleDisk(i){mounted[i]=!mounted[i];const disk=document.querySelector('#disk-'+i);disk.classList.toggle('ejected',!mounted[i]);disk.setAttribute('aria-pressed',String(!mounted[i]));disk.setAttribute('aria-label',`硬盘 ${i+1}：点击${mounted[i]?'弹出':'插入'}`);if(activeAction==='dock')stop(false);modeEl.textContent=`DISK ${i+1} ${mounted[i]?'INSERTED':'EJECTED'}`;status.textContent=`硬盘 ${i+1} 已${mounted[i]?'插入':'弹出'}`}
function transmit(target){
 if(activeAction===target.id){stop();return}
 if(target.id==='dock'&&!mounted.some(Boolean)){modeEl.textContent='INSERT A DISK FIRST';status.textContent='请先插入至少一块硬盘';return}
 if(target.id==='laptop'&&!input.trim()){modeEl.textContent='TYPE SOMETHING FIRST';return}
 stop(false);activeAction=target.id;svg.dataset.state='transmitting';svg.dataset.action=target.id;
 const trayAtStart=selectedTray,payload=input;
 modeEl.textContent={laptop:'UPLOADING',nas:'READING',dock:'BACKING UP',switch:'CHECKING LINKS'}[target.id]+` / DRIVE 0${trayAtStart+1}`;
 const plan=plans[target.id];status.textContent=plan.label+'，正在进行';
 const runStep=i=>{clearEffects();target.classList.add('source');const step=plan.steps[i];step.nodes.forEach(id=>{const d=document.getElementById(id);d.classList.add('busy');d.setAttribute('aria-busy','true')});links[step.link].classList.add('flowing');links[step.link].classList.toggle('reverse',!!step.reverse)};
 runStep(0);const duration=1800;
 plan.steps.slice(1).forEach((_,i)=>timers.push(setTimeout(()=>runStep(i+1),(i+1)*duration)));
 timers.push(setTimeout(()=>{
  clearEffects();svg.dataset.state='complete';plan.steps.at(-1).nodes.forEach(id=>document.getElementById(id).classList.add('complete'));
  if(target.id==='laptop')stored[trayAtStart]=payload;
  if(target.id==='dock')stored[trayAtStart]=mounted.map((present,i)=>present?`DISK 0${i+1} BACKUP`:'').filter(Boolean).join(' + ');
  if(target.id==='nas'){input=stored[trayAtStart];caret=input.length;renderInput()}
  modeEl.textContent='COMPLETE / DRIVE 0'+(trayAtStart+1);status.textContent=plan.label+'已完成';
  timers.push(setTimeout(()=>{stop(false);modeEl.textContent='TYPE · ENTER TO SEND'},800));
 },plan.steps.length*duration));
}
const keyButtons=[...document.querySelectorAll('.key')];
const normalized=k=>({'Esc':'Escape','Caps':'CapsLock','Ctrl':'Control'}[k]||k);
function lightKey(key,hold=false){keyButtons.filter(k=>normalized(k.dataset.key).toLowerCase()===key.toLowerCase()).forEach(k=>{k.classList.add('pressed');clearTimeout(k.release);if(!hold)k.release=setTimeout(()=>k.classList.remove('pressed'),140)})}
function insert(text){if(input.length>=80)return;input=input.slice(0,caret)+text+input.slice(caret);caret+=text.length;renderInput();modeEl.textContent='TYPE · ENTER TO SEND';const wave=document.querySelector('.screen-chart');const codes=[...input.slice(-7)].map(c=>c.charCodeAt(0));const heights=Array.from({length:7},(_,i)=>70-(codes[i]||20)%28);wave.setAttribute('d','M96 94L96 '+heights[0]+heights.slice(1).map((v,i)=>`L${111+i*15} ${v}`).join('')+'L186 94Z')}
function useKey(raw,physical=false){
 const key=normalized(raw);lightKey(key,physical);
 if(key==='Escape'){stop();setInspect(false);return}
 if(key==='Enter'){transmit(document.querySelector('#laptop'));return}
 if(key==='Backspace'){if(caret>0){input=input.slice(0,caret-1)+input.slice(caret);caret--}renderInput();return}
 if(key==='Delete'){input=input.slice(0,caret)+input.slice(caret+1);renderInput();return}
 if(key==='CapsLock'||(!physical&&key==='Shift')){caps=!caps;document.querySelectorAll('[data-key="Caps"]').forEach(k=>k.classList.toggle('latched',caps));return}
 if(!physical&&key==='Tab'){selectTray(selectedTray+1);return}
 if(!physical&&key==='Control'){input='';caret=0;renderInput();return}
 if(!physical&&key==='Alt'){useKey('F2');return}
 if(key==='ArrowLeft'||key==='ArrowRight'){caret=Math.max(0,Math.min(input.length,caret+(key==='ArrowLeft'?-1:1)));renderInput();return}
 if(key==='ArrowUp'||key==='ArrowDown'){selectTray(selectedTray+(key==='ArrowUp'?-1:1));return}
 if(key==='F2'){const cyan=svg.dataset.color!=='cyan';svg.dataset.color=cyan?'cyan':'orange';document.documentElement.style.setProperty('--accent',cyan?'#16f7ff':'#f95800');document.documentElement.style.setProperty('--cable-highlight',cyan?'#b5feff':'#ffbd76');return}
 if(key.length===1){insert(physical?key:/[a-z]/i.test(key)?caps?key.toUpperCase():key.toLowerCase():key);if(physical&&document.activeElement.closest('[role="button"]'))document.activeElement.blur()}
}
svg.addEventListener('click',e=>{
 const key=e.target.closest('.key[data-key]'),tray=e.target.closest('.tray[data-tray]'),disk=e.target.closest('.disk[data-disk]');
 if(key){useKey(key.dataset.key);if(e.detail>0&&document.activeElement===key)key.blur();return}
 if(tray){selectTray(+tray.dataset.tray);return}
 if(disk){toggleDisk(+disk.dataset.disk);return}
 if(e.target.closest('[data-inspect]')){setInspect(!inspect);return}
 const action=e.target.closest('[data-action][role="button"]');if(action){if(action.dataset.action==='laptop')setInspect(!inspect);else transmit(document.getElementById(action.dataset.action))}
});
svg.addEventListener('keydown',e=>{
 const control=e.target.closest('[role="button"]');
 if(control&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();control.dispatchEvent(new MouseEvent('click',{bubbles:true}));return}
 // Roving tab stop for the keyboard: arrows move focus between physical keys.
 if(e.target.closest('.key')&&e.key.startsWith('Arrow')){e.preventDefault();e.stopPropagation();const current=keyButtons.indexOf(e.target.closest('.key'));const offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-14,ArrowDown:14}[e.key];const next=keyButtons[Math.max(0,Math.min(keyButtons.length-1,current+offset))];keyButtons.forEach(k=>k.tabIndex=-1);next.tabIndex=0;next.focus()}
});
document.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
 if(e.key==='Tab'){lightKey('Tab');return}
 if(e.key.length===1||['Enter','Escape','Backspace','Delete','CapsLock','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','F2','Shift','Control'].includes(e.key)){e.preventDefault();useKey(e.key,true)}
});
document.addEventListener('keyup',e=>keyButtons.filter(k=>normalized(k.dataset.key).toLowerCase()===e.key.toLowerCase()).forEach(k=>k.classList.remove('pressed')));
function releaseKeys(){keyButtons.forEach(k=>{clearTimeout(k.release);k.classList.remove('pressed')})}
window.addEventListener('blur',releaseKeys);document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();releaseKeys()}});
svg.dataset.state='idle';selectTray(0);renderInput();
})();

