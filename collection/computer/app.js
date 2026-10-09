// A fixed-view SVG scene; all surfaces share one isometric coordinate system.
const stage = document.getElementById('stage');
const C = Math.sqrt(3) / 2;
const P = (x,y,z) => [(x-y)*C+422,(x+y)*.5-z+211];
const D = (x,y,z) => [(x-y)*C,(x+y)*.5-z];
const plane = (origin,u,v) => {
  const o=P(...origin),a=D(...u),b=D(...v);
  return `matrix(${a[0]} ${a[1]} ${b[0]} ${b[1]} ${o[0]} ${o[1]})`;
};
const TOP=(x,y,z)=>plane([x,y,z],[1,0,0],[0,1,0]);
const FRONT=(x,y,z)=>plane([x,y,z],[1,0,0],[0,0,-1]);
const SIDE=(x,y,z)=>plane([x,y,z],[0,-1,0],[0,0,-1]);
const rect=(t,w,h,r,cls='face')=>`<g transform="${t}"><rect class="${cls}" width="${w}" height="${h}" rx="${r}"/></g>`;
const box=(x,y,z,w,d,h,r=0)=>rect(SIDE(x+w,y+d,z+h),d,h,Math.min(r,h/4),'face side')+rect(FRONT(x,y+d,z+h),w,h,Math.min(r,h/4))+rect(TOP(x,y,z+h),w,d,r,'face top');
const path=pts=>'M'+pts.map(p=>P(...p).map(v=>v.toFixed(2)).join(' ')).join('L');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const slits=(x,y,n,step,h)=>Array.from({length:n},(_,i)=>`<line class="detail" x1="${x+i*step}" y1="${y}" x2="${x+i*step}" y2="${y+h}"/>`).join('');
let scene=`<defs>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="bloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="11"/></filter>
<clipPath id="screen-clip"><rect x="24" y="27" width="103" height="95" rx="10"/></clipPath>
</defs>`;
// A quiet coordinate grid grounds the object without adding a bitmap asset.
for(let n=-1;n<7;n++){
 scene+=`<path class="floor-grid" d="${path([[n*60,-30,-4],[n*60,340,-4]])}"/>`;
 scene+=`<path class="floor-grid" d="${path([[-30,n*60,-4],[350,n*60,-4]])}"/>`;
}
scene+=box(0,0,0,322,286,9,12);
scene+=`<g transform="${TOP(0,0,9)}"><rect class="detail" x="9" y="9" width="304" height="268" rx="9"/>`;
for(const [x,y] of [[18,18],[304,18],[18,268],[304,268]])scene+=`<circle class="recess" cx="${x}" cy="${y}" r="3"/><path class="detail" d="M${x-2},${y}h4"/>`;
scene+=`</g>`;
scene+=`<g class="power-object" role="button" tabindex="0" aria-label="电脑电源开关" aria-pressed="true">`;
scene+=box(118,24,9,146,138,8,4)+box(112,18,17,158,151,207,9);
scene+=`<g transform="${TOP(112,18,224)}"><rect class="recess" x="33" y="16" width="92" height="12" rx="5"/>${slits(38,58,25,3.4,76)}<rect class="detail" x="8" y="8" width="142" height="134" rx="6"/></g>`;
scene+=`<g transform="${SIDE(270,169,224)}">${slits(95,15,13,3.4,55)}${slits(34,151,13,3.4,26)}<rect class="recess" x="9" y="162" width="15" height="25" rx="2"/></g>`;
scene+=`<g transform="${FRONT(112,169,224)}">
<rect class="face" x="10" y="13" width="138" height="122" rx="12"/>
<rect class="recess" x="17" y="20" width="124" height="108" rx="12"/>
<rect class="halo" x="24" y="27" width="103" height="95" rx="10" fill="var(--accent)" filter="url(#bloom)"/>
<rect class="glass" x="24" y="27" width="103" height="95" rx="10"/>
<g class="crt" clip-path="url(#screen-clip)">
<g><g filter="url(#soft)" transform="translate(63 42)" fill="var(--accent)"><path fill-rule="evenodd" d="M0 21 8 0h5l8 21h-5l-1.5-4.5h-8L5 21Zm8-8h5L10.5 5Z"/><path d="m16 0 8 21h5L21 0Z"/></g>

<text class="screen-ink" id="screen-text" x="32" y="92" font-size="6"></text>
<rect class="cursor" id="cursor" x="39" y="88" width="3" height="6" fill="var(--accent)"/></g>
${Array.from({length:40},(_,i)=>`<path class="screen-line" d="M24 ${28+i*2.4}h103"/>`).join('')}
<path d="M30 31h90" stroke="#ffffff" stroke-opacity=".09" fill="none"/>
</g>
${slits(16,148,22,3,15)}
<circle class="led" cx="18" cy="181" r="2" filter="url(#soft)"/>

<rect class="recess" x="83" y="174" width="53" height="5" rx="2.5"/>
</g></g>`;
const kx=21,ky=198,kz=9,kw=211,kd=70,kt=22;
scene+=box(kx,ky,kz,kw,kd,13,5);
scene+=`<g transform="${TOP(kx,ky,kt)}"><rect class="recess" x="6" y="5" width="199" height="60" rx="3"/></g>`;
const rows=[
[['`',1],['1',1],['2',1],['3',1],['4',1],['5',1],['6',1],['7',1],['8',1],['9',1],['0',1],['-',1],['=',1],['Backspace',1]],
[['Tab',1.5],['q',1],['w',1],['e',1],['r',1],['t',1],['y',1],['u',1],['i',1],['o',1],['p',1],['[',1],[']',1.5]],
[['CapsLock',1.75],['a',1],['s',1],['d',1],['f',1],['g',1],['h',1],['j',1],['k',1],['l',1],[';',1],["'",1],['Enter',1.25]],
[['Shift',2],['z',1],['x',1],['c',1],['v',1],['b',1],['n',1],['m',1],[',',1],['.',1],['/',1],['Shift',2]],
[['Control',1.5],['Alt',1.5],[' ',8],['Alt',1.5],['Control',1.5]]
];
const unit=193/14,depth=56/5;
rows.forEach((row,r)=>{let x=kx+9;row.forEach(([key,w])=>{
const width=w*unit-1.5,y=ky+7+r*depth;
const label=({Backspace:'←',Tab:'TAB',CapsLock:'CAP',Enter:'↵',Shift:'SHIFT',Control:'CTRL',Alt:'ALT',' ':'SPACE'})[key]||key.toUpperCase();
scene+=`<g class="key" role="button" tabindex="0" data-key="${esc(key)}" aria-label="${key===' '?'空格':esc(key)}"><g class="movable">${box(x+.75,y+.75,kt,width,depth-1.5,4,1.1)}<g transform="${TOP(x+.75,y+.75,kt+4)}"><text class="fine-label" x="${width/2}" y="6.5" font-size="${label.length>2?2.6:4}" text-anchor="middle" pointer-events="none">${esc(label)}</text></g></g></g>`;
x+=w*unit;
});});
// A helix wrapped around a cubic Bézier gives the cable its coiled silhouette.
const a=[240,239,15],b=[290,259,13],c=[316,173,15],d=[279,150,40];
const bez=t=>a.map((_,i)=>(1-t)**3*a[i]+3*(1-t)**2*t*b[i]+3*(1-t)*t*t*c[i]+t**3*d[i]);
const points=[];
for(let i=0;i<=700;i++){
const t=i/700,p=bez(t),before=bez(Math.max(0,t-.001)),after=bez(Math.min(1,t+.001));
const tangent=after.map((v,j)=>v-before[j]),l=Math.hypot(tangent[0],tangent[1])||1;
const envelope=Math.max(0,Math.min(1,(t-.06)/.07,(.94-t)/.07)),angle=t*31*Math.PI*2;
points.push([p[0]+tangent[1]/l*Math.cos(angle)*3*envelope,p[1]-tangent[0]/l*Math.cos(angle)*3*envelope,p[2]+Math.sin(angle)*3*envelope]);
}
scene+=box(232,234,12,8,9,7,1)+box(270,148,33,9,10,12,1);
const cable=path(points);
scene+=`<path class="wire-under" d="${cable}"/><path class="wire" d="${cable}"/><path class="pulse" pathLength="1000" d="${cable}" filter="url(#soft)"/>`;
stage.innerHTML=scene;
const input=document.getElementById('typing'),screen=document.getElementById('screen-text'),cursor=document.getElementById('cursor');
const powerButton=document.getElementById('power'),cpu=stage.querySelector('.power-object');
const state={on:true,text:'',sound:false,caps:false,shift:false};
let demoTimers=[],audio=null,pulseTimer=null;
const keyTimers=new WeakMap();
function cancelDemo(){demoTimers.forEach(clearTimeout);demoTimers=[];document.getElementById('demo').firstChild.textContent='播放演示 ';}
function render(){
stage.classList.toggle('on',state.on);document.querySelector('.stage-wrap').classList.toggle('off',!state.on);
powerButton.firstChild.textContent=state.on?'关闭电源 ':'开启电源 ';powerButton.setAttribute('aria-pressed',String(state.on));cpu.setAttribute('aria-pressed',String(state.on));
input.disabled=!state.on;input.value=state.text;
const chars=Array.from(state.text).slice(-19);screen.textContent='> '+chars.join('');cursor.setAttribute('x',32+(chars.length+2)*3.6);
}
function togglePower(){cancelDemo();state.on=!state.on;render();document.getElementById('announcement').textContent=state.on?'电脑已开机':'电脑已关机';}
function tick(){if(!state.sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;osc.type='triangle';osc.frequency.setValueAtTime(430,t);osc.frequency.exponentialRampToValueAtTime(90,t+.035);gain.gain.setValueAtTime(.045,t);gain.gain.exponentialRampToValueAtTime(.001,t+.045);osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.05);}catch{state.sound=false;document.getElementById('sound').textContent='当前浏览器不支持声音';}}
function flash(key){
let normalized=key.toLowerCase();const base={'!':'1','@':'2','#':'3','$':'4','%':'5','^':'6','&':'7','*':'8','(':'9',')':'0','_':'-','+':'=','{':'[','}':']',':':';','"':"'",'<':',','>':'.','?':'/','~':'`'};normalized=base[key]||normalized;
stage.querySelectorAll('.key').forEach(el=>{if(el.dataset.key.toLowerCase()!==normalized)return;clearTimeout(keyTimers.get(el));el.classList.add('down');keyTimers.set(el,setTimeout(()=>el.classList.remove('down'),150));});
if(state.on){const pulse=stage.querySelector('.pulse');pulse.classList.remove('go');clearTimeout(pulseTimer);pulseTimer=setTimeout(()=>pulse.classList.add('go'),20);tick();}
}
function press(key,fromDemo=false){if(!fromDemo)cancelDemo();if(!state.on)return;flash(key);
if(key==='Backspace')state.text=Array.from(state.text).slice(0,-1).join('');
else if(key==='Enter')state.text='';
else if(key==='CapsLock')state.caps=!state.caps;
else if(key==='Shift')state.shift=!state.shift;
else if(key.length===1&&state.text.length<240){state.text+=state.caps||state.shift?key.toUpperCase():key;state.shift=false;}
render();}
stage.addEventListener('click',e=>{const key=e.target.closest('.key');if(key)press(key.dataset.key);else if(e.target.closest('.power-object'))togglePower();});
stage.addEventListener('keydown',e=>{const target=e.target.closest('[role="button"]');if(target&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();if(target.classList.contains('key'))press(target.dataset.key);else togglePower();}});
powerButton.addEventListener('click',togglePower);
input.addEventListener('input',()=>{cancelDemo();state.text=input.value;render();});
input.addEventListener('keydown',e=>{if(e.isComposing||e.key==='Process')return;if(e.key==='Enter'){e.preventDefault();press('Enter');}else if(!e.ctrlKey&&!e.metaKey&&!e.altKey)flash(e.key);});
document.addEventListener('keydown',e=>{
 if(document.getElementById('computer-view')?.hidden||e.defaultPrevented||e.isComposing||e.ctrlKey||e.metaKey||e.altKey)return;
 // Text fields handle their own input. A focused scene key or toolbar button
 // must not swallow letter keys after a pointer click.
 if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
 if(e.target.closest('button,a,[role="button"]')&&(e.key==='Enter'||e.key===' '))return;
 if(e.key.length===1||e.key==='Backspace'||e.key==='Enter'){
  e.preventDefault();press(e.key);
 }
});
document.getElementById('demo').addEventListener('click',()=>{cancelDemo();state.on=true;state.text='';render();document.getElementById('demo').firstChild.textContent='演示中… ';const message='hello, world.';Array.from(message).forEach((key,i)=>demoTimers.push(setTimeout(()=>press(key,true),300+i*180)));demoTimers.push(setTimeout(cancelDemo,300+message.length*180));});
document.getElementById('sound').addEventListener('click',e=>{state.sound=!state.sound;e.currentTarget.setAttribute('aria-pressed',String(state.sound));e.currentTarget.firstChild.textContent=state.sound?'按键声音：开 ':'按键声音：关 ';if(state.sound)tick();});
const colors=[['橙','#f95800','#f95800'],['青蓝','#16f7ff','#16f7ff']];
document.querySelector('.palette').innerHTML=colors.map(([name,color],i)=>`<button class="swatch" aria-label="${name}色" aria-pressed="${i===0}" data-i="${i}" style="--sw:${color}"><i aria-hidden="true"></i></button>`).join('');
document.querySelector('.palette').addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;const[name,color,hi]=colors[+button.dataset.i];document.documentElement.style.setProperty('--accent',color);document.documentElement.style.setProperty('--hi',hi);document.documentElement.style.setProperty('--wash',color+'12');document.querySelectorAll('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.getElementById('announcement').textContent=`已切换为${name}色`;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelDemo();stage.querySelector('.pulse').classList.remove('go');}});
render();

const themeButton=document.getElementById('theme');
function setTheme(light){
 document.documentElement.dataset.theme=light?'light':'dark';
 themeButton.setAttribute('aria-pressed',String(light));
 themeButton.setAttribute('aria-label',light?'切换为黑色主题':'切换为白色主题');
 document.querySelector('meta[name="theme-color"]').content=light?'#f2f3f4':'#101113';
 try{localStorage.setItem('retro-theme',light?'light':'dark');}catch{}
}
let initialTheme=false;try{initialTheme=localStorage.getItem('retro-theme')==='light';}catch{}
setTheme(initialTheme);
themeButton.addEventListener('click',()=>{const light=document.documentElement.dataset.theme!=='light';setTheme(light);document.getElementById('announcement').textContent=light?'已切换为白色主题':'已切换为黑色主题';});

