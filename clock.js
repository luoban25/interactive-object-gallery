import {createFrameGate,configurePreview} from './preview-performance.js?v=53';
import * as T from 'three';
import {backlight} from './series-lighting.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
const stage=document.getElementById('clock-stage'),status=document.getElementById('clock-status');
const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(0xffffff,0);stage.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','数字闹钟。SNOOZE 关闭或唤醒屏幕，ALARM 设置闹钟，TIME 校时。M 切换界面，空格开始暂停，R 复位，S 熄屏，A 闹钟，T 校时。');
const scene=new T.Scene(),camera=new T.OrthographicCamera(-5,5,4,-4,.1,40);camera.position.set(8,5.25,11);camera.lookAt(0,1.25,0);
scene.add(new T.HemisphereLight(0xffffff,0xd9d9d7,1.6));const key=new T.DirectionalLight(0xffffff,1.6);key.position.set(-4,10,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:5,bottom:-4,near:.1,far:25});key.shadow.bias=-.0001;key.shadow.normalBias=.04;key.shadow.radius=5;scene.add(key);const fill=new T.DirectionalLight(0xffffff,.8);fill.position.set(6,4,-4);scene.add(fill);
const white=new T.MeshStandardMaterial({color:0xe0ddd6,roughness:.78,metalness:.08}),pale=new T.MeshStandardMaterial({color:0xe4ded3,roughness:.75}),grey=new T.MeshStandardMaterial({color:0x929590,roughness:.75}),dark=new T.MeshStandardMaterial({color:0x494742,roughness:.75});
const light=new T.MeshBasicMaterial({color:0xff8b24}),off=new T.MeshBasicMaterial({color:0x282722});
const edge=new T.ShaderMaterial({side:T.BackSide,uniforms:{color:{value:new T.Color(0x7a7b77)}},vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*.007,1.);}',fragmentShader:'uniform vec3 color;void main(){gl_FragColor=vec4(color,1.);}'});
function mesh(g,m,parent,p=[0,0,0],border=true){const o=new T.Mesh(g,m);o.position.set(...p);o.castShadow=true;parent.add(o);if(border){const e=new T.Mesh(g,edge);e.raycast=()=>{};o.add(e);}return o;}
function box(w,h,d,r,parent,p,m=white){return mesh(new RoundedBoxGeometry(w,h,d,4,r),m,parent,p);}
function round(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
const body=new T.Group();scene.add(body);const profile=round(6.7,2.30,.22),hole=round(6.04,1.94,.16);profile.holes.push(new T.Path(hole.getPoints(36).reverse()));mesh(new T.ExtrudeGeometry(profile,{depth:2.8,bevelEnabled:true,bevelSize:.065,bevelThickness:.065,bevelSegments:5,curveSegments:32}),white,body,[0,1.37,-1.4]);
for(const x of [-2.7,2.7])for(const z of [-1.1,1.29])box(.51,.20,.5,.04,body,[x,.11,z],dark);
const innerProfile=round(6.02,1.94,.16);innerProfile.holes.push(new T.Path(round(5.77,1.70,.12).getPoints(32).reverse()));mesh(new T.ExtrudeGeometry(innerProfile,{depth:.065,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:3,curveSegments:24}),dark,body,[0,1.37,1.405]);
function sheet(shape,mat,parent,p){const g=new T.ShapeGeometry(shape,32);return mesh(g,mat,parent,p,false);}
const screen=sheet(round(5.79,1.73,.12),new T.MeshBasicMaterial({color:0x282722}),body,[0,1.37,1.43]);
function line(a,b){body.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(...a),new T.Vector3(...b)]),new T.LineBasicMaterial({color:0x65635e,transparent:true,opacity:.85})));}
const seamMat=new T.LineBasicMaterial({color:0x65635e});
function contour(shape,y,z){const pts=shape.getPoints(72).map(p=>new T.Vector3(p.x,p.y+y,z));const o=new T.LineLoop(new T.BufferGeometry().setFromPoints(pts),seamMat);body.add(o);}
function seam(points){body.add(new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),seamMat));}
contour(round(6.60,2.22,.20),1.37,1.474);
contour(round(6.055,1.95,.16),1.37,1.490);
contour(round(5.78,1.71,.12),1.37,1.494);
contour(round(5.60,1.53,.10),1.37,1.438);
seam([[-3.17,2.591,1.04],[3.17,2.591,1.04]]);
seam([[3.17,2.591,1.04],[3.34,2.51,1.04],[3.421,2.38,1.04],[3.421,.35,1.04],[3.34,.22,1.04]]);
seam([[3.421,.61,1.04],[3.421,.61,-1.26]]);
seam([[-3.17,2.591,-1.22],[3.17,2.591,-1.22]]);
for(let i=0;i<10;i++)box(2.42,.012,.017,.004,body,[.40,2.585,-.83+i*.075],grey);
for(let i=0;i<5;i++)box(.012,.63,.015,.004,body,[3.421,1.68,-.73+i*.15],grey);
function label(text,w,h,color='#888'){const c=document.createElement('canvas');const cx=c.getContext('2d');cx.font='46px Arial';c.width=Math.ceil(cx.measureText(text).width)+12;c.height=64;cx.font='46px Arial';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=color;cx.fillText(text,c.width/2,32);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));}
const buttons=[],ray=new T.Raycaster(),pointer=new T.Vector2();
function button(name,x,z,w,d){box(w+.03,.055,d+.03,.03,body,[x,2.59,z],grey);const g=new T.Group();g.position.set(x,2.63,z);body.add(g);const mat=pale.clone();mat.emissive.setHex(0xff6a0c);const cap=box(w,.105,d,.025,g,[0,0,0],mat);cap.userData.action=name;const glow=backlight(body,w,d,[x,2.607,z],-Math.PI/2);buttons.push({name,g,cap,down:false,glow,light:0,flashUntil:0});return g;}
const snoozeButton=button('snooze',-1.82,.67,2.12,.66);const snoozeLabel=label('S N O O Z E',1.17,.22);snoozeLabel.rotation.x=-Math.PI/2;snoozeLabel.position.set(0,.057,-.06);snoozeButton.add(snoozeLabel);box(1.58,.015,.040,.007,snoozeButton,[0,.059,.18],light);
button('alarm',.86,.88,.66,.42);button('time',1.79,.88,.66,.42);
for(const [s,x]of [['ALARM',.86],['TIME',1.79]]){const l=label(s,.67,.19);l.rotation.x=-Math.PI/2;l.position.set(x,2.601,.23);body.add(l);}
function polygon(points,parent,p,mat){const s=new T.Shape();s.moveTo(...points[0]);for(const q of points.slice(1))s.lineTo(...q);s.closePath();return sheet(s,mat,parent,p);}
const horizontal=[[-.24,.065],[.24,.065],[.30,0],[.24,-.065],[-.24,-.065],[-.30,0]],vertical=[[-.065,.22],[0,.28],[.065,.22],[.065,-.22],[0,-.28],[-.065,-.22]];
const segmentPositions=[[0,.59,'h'],[.29,.30,'v'],[.29,-.30,'v'],[0,-.59,'h'],[-.29,-.30,'v'],[-.29,.30,'v'],[0,0,'h']];
const codes=['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'],digits=[];
for(const x of [-1.71,-.91,.43,1.23]){const group=new T.Group();group.position.set(x,1.37,1.445);body.add(group);const segments=segmentPositions.map(([sx,sy,type])=>polygon(type==='h'?horizontal:vertical,group,[sx,sy,0],off));digits.push(segments);}
const dots=[];for(const y of [1.59,1.15])dots.push(mesh(new T.CircleGeometry(.058,28),light,body,[-.04,y,1.446],false));
const almLabel=label('ALM',.37,.17,'#ff8b24');almLabel.position.set(-2.38,1.55,1.445);body.add(almLabel);const almDot=mesh(new T.CircleGeometry(.065,28),light,body,[-2.38,1.29,1.446],false);
const am=label('AM',.37,.19,'#ff8b24');am.position.set(2.26,1.06,1.445);body.add(am);
const glowCanvas=document.createElement('canvas');glowCanvas.width=256;glowCanvas.height=128;const gc=glowCanvas.getContext('2d'),gr=gc.createRadialGradient(128,64,3,128,64,120);gr.addColorStop(0,'rgba(255,156,40,.13)');gr.addColorStop(1,'rgba(255,156,40,0)');gc.fillStyle=gr;gc.fillRect(0,0,256,128);const glow=mesh(new T.PlaneGeometry(4.3,1.6),new T.MeshBasicMaterial({map:new T.CanvasTexture(glowCanvas),transparent:true,depthWrite:false,blending:T.AdditiveBlending}),body,[0,1.37,1.447],false);glow.renderOrder=2;
digits.forEach(ss=>{ss[0].parent.scale.setScalar(.77);ss[0].parent.position.y=1.45;});
dots.forEach(d=>{d.position.y=1.45+(d.position.y-1.37)*.77;d.scale.setScalar(.8);});
almLabel.visible=false;almDot.visible=false;am.visible=false;
const hudCanvas=document.createElement('canvas');hudCanvas.width=1320;hudCanvas.height=360;
const hudContext=hudCanvas.getContext('2d'),hudTexture=new T.CanvasTexture(hudCanvas);hudTexture.colorSpace=T.SRGBColorSpace;hudTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
const hud=mesh(new T.PlaneGeometry(5.5,1.5),new T.MeshBasicMaterial({map:hudTexture,transparent:true,depthWrite:false}),body,[0,1.37,1.450],false);
const screenLights=[...digits.map(ss=>ss[0].parent),...dots,glow,hud];
const ground=mesh(new T.PlaneGeometry(50,50),new T.ShadowMaterial({opacity:.09}),scene,[0,.015,0],false);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.castShadow=false;
let offsetMs=0,alarm='07:00',enabled=true,sound=false,dim=false,screenOn=true,ringing=false,demoUntil=0,snoozeUntil=0,lastAlarmKey='',frame=0,last=0,displayKey='',audio=null,lastBeep=0,pressName=null;
let mode='time',format24=false,timerDuration=25*60000,timerRemaining=timerDuration,timerDeadline=0,watchElapsed=0,watchStart=0,focusPhase='work',focusRemaining=25*60000,focusDeadline=0,focusRounds=0,ringSource='alarm',hudKey='';
const modes=['time','date','timer','stopwatch','focus'],titles={time:'TIME',date:'CALENDAR',timer:'COUNTDOWN',stopwatch:'STOPWATCH',focus:'FOCUS'};
const dateFormatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
const calendarFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'});
function clockParts(){const a={};for(const p of dateFormatter.formatToParts(new Date(Date.now()+offsetMs)))a[p.type]=p.value;return{h:+a.hour,m:+a.minute,s:+a.second};}
function calendarParts(){return Object.fromEntries(calendarFormatter.formatToParts(new Date(Date.now()+offsetMs)).map(p=>[p.type,p.value]));}
function active(){return document.body.dataset.product==='clock'&&!document.hidden&&document.body.dataset.paused!=='true';}
function say(s){status.textContent=s;}
function state(){
 Object.assign(stage.dataset,{ringing:String(ringing),enabled:String(enabled),dim:String(dim),screenOn:String(screenOn),snoozed:String(snoozeUntil>Date.now()),alarm,mode,timerRunning:String(!!timerDeadline),watchRunning:String(!!watchStart),focusRunning:String(!!focusDeadline),focusPhase,focusRounds:String(focusRounds)});
 document.getElementById('clock-snooze').setAttribute('aria-pressed',String(!screenOn));
 document.querySelectorAll('[data-clock-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.clockMode===mode)));
 const timed=['timer','stopwatch','focus'].includes(mode);
 document.getElementById('clock-run').hidden=!timed;document.getElementById('clock-reset').hidden=!timed;
 document.getElementById('clock-duration').hidden=mode!=='timer';document.getElementById('clock-format').hidden=mode!=='time';
 document.getElementById('clock-run').textContent=({timer:timerDeadline,stopwatch:watchStart,focus:focusDeadline})[mode]?'暂停':'开始';
 document.getElementById('clock-format').textContent=format24?'24 小时':'12 小时';
 hudKey='';
}
function stop(){ringing=false;demoUntil=0;state();}
function wake(){screenOn=true;state();}
function ping(name){const b=buttons.find(b=>b.name===name);if(b)b.flashUntil=performance.now()+200;}
function snooze(){ping("snooze");
 if(ringing){const source=ringSource;stop();if(source==='alarm')snoozeUntil=Date.now()+9*60000;screenOn=false;say(source==='alarm'?'屏幕已关闭，九分钟后再提醒':'已停止提醒并关闭屏幕');}
 else{screenOn=!screenOn;say(screenOn?'屏幕已唤醒':'整个屏幕已关闭');}
 state();
}
function ring(source){ringing=true;ringSource=source;screenOn=true;state();say(source==='timer'?'倒计时结束':source==='focus'?'专注阶段结束': '闹钟提醒');}
function testAlarm(){snoozeUntil=0;ring('demo');demoUntil=Date.now()+6000;}
function setMode(next){mode=next;wake();state();say({time:'时钟',date:'日期',timer:'倒计时',stopwatch:'秒表',focus:'专注计时'}[mode]);}
function cycle(){setMode(modes[(modes.indexOf(mode)+1)%modes.length]);}
function run(){
 const now=Date.now();wake();stop();
 if(mode==='timer'){if(timerDeadline){timerRemaining=Math.max(0,timerDeadline-now);timerDeadline=0;}else{if(timerRemaining<=0)timerRemaining=timerDuration;timerDeadline=now+timerRemaining;}}
 if(mode==='stopwatch'){if(watchStart){watchElapsed+=now-watchStart;watchStart=0;}else watchStart=now;}
 if(mode==='focus'){if(focusDeadline){focusRemaining=Math.max(0,focusDeadline-now);focusDeadline=0;}else focusDeadline=now+focusRemaining;}
 state();
}
function reset(){
 stop();if(mode==='timer'){timerDeadline=0;timerRemaining=timerDuration;}
 if(mode==='stopwatch'){watchStart=0;watchElapsed=0;}
 if(mode==='focus'){focusDeadline=0;focusRemaining=25*60000;focusPhase='work';focusRounds=0;}state();
}
document.querySelectorAll('[data-clock-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.clockMode));
document.getElementById('clock-run').onclick=run;document.getElementById('clock-reset').onclick=reset;
document.getElementById('clock-duration').onchange=e=>{timerDuration=Number(e.target.value)*60000;timerRemaining=timerDuration;timerDeadline=0;state();};
document.getElementById('clock-format').onclick=()=>{format24=!format24;state();};
document.getElementById('clock-brightness').onclick=()=>{dim=!dim;state();document.getElementById('clock-brightness').setAttribute('aria-pressed',String(dim));};
const dialog=document.getElementById('clock-dialog'),form=document.getElementById('clock-form'),timeInput=document.getElementById('clock-input'),enabledRow=document.getElementById('clock-enabled-row'),soundRow=document.getElementById('clock-sound-row');let edit='time';
function settings(which){ping(which==="alarm"?"alarm":"time");stop();wake();edit=which;const p=clockParts();document.getElementById('clock-dialog-title').textContent=which==='alarm'?'设置闹钟':'设置时间';timeInput.value=which==='alarm'?alarm:`${String(p.h).padStart(2,'0')}:${String(p.m).padStart(2,'0')}`;enabledRow.hidden=which!=='alarm';soundRow.hidden=which!=='alarm';document.getElementById('clock-enabled').checked=enabled;document.getElementById('clock-sound').checked=sound;dialog.showModal();timeInput.focus();}
document.getElementById('clock-cancel').onclick=()=>dialog.close();form.onsubmit=e=>{e.preventDefault();const [h,m]=timeInput.value.split(':').map(Number);if(edit==='alarm'){alarm=timeInput.value;enabled=document.getElementById('clock-enabled').checked;sound=document.getElementById('clock-sound').checked;snoozeUntil=0;if(sound){audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();}say('闹钟已设置');}else{const p=clockParts();offsetMs+=((h-p.h)*60+(m-p.m))*60000-p.s*1000;setMode('time');say('时间已设置');}state();dialog.close();};
const actions={snooze,alarm:()=>settings('alarm'),time:()=>settings('time')};
document.getElementById('clock-snooze').onclick=snooze;document.getElementById('clock-alarm').onclick=actions.alarm;document.getElementById('clock-time').onclick=actions.time;document.getElementById('clock-demo').onclick=testAlarm;
function cast(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(buttons.map(b=>b.cap),false)[0]?.object.userData.action;}
renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;pressName=cast(e);if(pressName){renderer.domElement.setPointerCapture(e.pointerId);buttons.find(b=>b.name===pressName).down=true;}else if(ray.intersectObject(screen,false).length)pressName='screen';});
renderer.domElement.addEventListener('pointerup',e=>{const n=pressName;release();if(n==='screen'){cast(e);if(ray.intersectObject(screen,false).length){if(!screenOn)wake();else cycle();}}else if(n&&cast(e)===n)actions[n]();});
function release(){buttons.forEach(b=>b.down=false);pressName=null;}renderer.domElement.addEventListener('pointercancel',release);renderer.domElement.addEventListener('lostpointercapture',release);window.addEventListener('blur',release);
document.addEventListener('keydown',e=>{if(!active()||dialog.open||e.ctrlKey||e.altKey||e.metaKey||e.repeat||e.target.closest('button,input,select'))return;const k=e.key.toLowerCase(),name={s:'snooze',a:'alarm',t:'time'}[k];if(name){buttons.find(b=>b.name===name).down=true;actions[name]();}else if(k==='d')testAlarm();else if(k==='m')cycle();else if(k==='r')reset();else if(e.code==='Space'){e.preventDefault();run();}else if(e.key==='Escape')stop();});document.addEventListener('keyup',release);
function hudDraw(p,c,now,remaining,elapsed){
 const stamp=[mode,p.s,p.m,ringing,Math.floor(now/250)%2,dim,enabled,alarm,screenOn,snoozeUntil,format24,Math.floor(remaining/1000),Math.floor(elapsed/50),focusRounds,focusPhase].join('|');
 if(stamp===hudKey)return;hudKey=stamp;
 const cx=hudContext;cx.clearRect(0,0,1320,360);cx.fillStyle='#ff922c';cx.strokeStyle='#ff922c';cx.globalAlpha=dim?.5:1;
 function text(s,x,y,size=23,align='left',alpha=.8){cx.font=`500 ${size}px ui-monospace,monospace`;cx.textAlign=align;cx.globalAlpha=(dim?.5:1)*alpha;cx.fillText(s,x,y);}
 text(titles[mode],30,33,24,'left',1);text(ringing?'● ALERT':snoozeUntil?'SNOOZE 9m':enabled?'ALM '+alarm:'ALARM OFF',1280,33,22,'right');
 cx.globalAlpha=.18;cx.fillRect(30,47,1260,1);
 let footer='',side='',progress=0;
 if(mode==='time'){footer=`${c.year} . ${c.month} . ${c.day}  /  ${c.weekday.toUpperCase()}`;side=String(p.s).padStart(2,'0');progress=p.s/60;text(format24?'24H':p.h<12?'AM':'PM',1180,233,30,'center',1);text('SEC',1180,275,18,'center');text(side,1180,311,30,'center',1);}
 if(mode==='date'){footer=`${c.year}  /  ${c.weekday.toUpperCase()}  /  MONTH : DAY`;progress=+c.day/31;text(c.weekday.toUpperCase(),1180,229,24,'center',1);}
 if(mode==='timer'){footer=timerDeadline?'COUNTING DOWN':remaining===0?'COMPLETE':'READY / PAUSED';progress=1-remaining/timerDuration;text('MIN',1180,229,22,'center');}
 if(mode==='stopwatch'){footer=watchStart?'RUNNING  /  MIN : SEC':'PAUSED  /  MIN : SEC';progress=(elapsed%60000)/60000;text(String(Math.floor(elapsed/10)%100).padStart(2,'0'),1180,229,30,'center',1);text('1/100',1180,264,18,'center');}
 if(mode==='focus'){footer=`${focusPhase==='work'?'WORK 25m':'BREAK 5m'}  /  ${focusDeadline?'RUNNING':'READY'}  /  ROUND ${focusRounds+1}`;progress=1-remaining/(focusPhase==='work'?25:5)/60000;text(focusPhase==='work'?'WORK':'REST',1180,229,23,'center',1);}
 text(footer,30,318,23,'left',.9);
 for(let i=0;i<48;i++){cx.globalAlpha=(dim?.5:1)*(i<Math.floor(progress*48)? .8:.09);cx.fillRect(30+i*26,338,20,5);}
 cx.globalAlpha=1;hudTexture.needsUpdate=true;
}
function draw(now){
 const p=clockParts(),c=calendarParts();
 if(timerDeadline&&now>=timerDeadline){timerDeadline=0;timerRemaining=0;ring('timer');}
 if(focusDeadline&&now>=focusDeadline){focusDeadline=0;if(focusPhase==='work'){focusRounds++;focusPhase='break';focusRemaining=5*60000;}else{focusPhase='work';focusRemaining=25*60000;}ring('focus');}
 const remaining=mode==='focus'?(focusDeadline?Math.max(0,focusDeadline-now):focusRemaining):(timerDeadline?Math.max(0,timerDeadline-now):timerRemaining);
 const elapsed=watchElapsed+(watchStart?now-watchStart:0);
 let text=String(format24?p.h:p.h%12||12).padStart(2,'0')+String(p.m).padStart(2,'0');
 if(mode==='date')text=c.month+c.day;
 if(mode==='timer'||mode==='focus'){const sec=Math.ceil(remaining/1000);text=String(Math.min(99,Math.floor(sec/60))).padStart(2,'0')+String(sec%60).padStart(2,'0');}
 if(mode==='stopwatch'){const sec=Math.floor(elapsed/1000);text=String(Math.floor(sec/60)%100).padStart(2,'0')+String(sec%60).padStart(2,'0');}
 if(text!==displayKey){displayKey=text;digits.forEach((segments,i)=>segments.forEach((seg,j)=>seg.material=codes[+text[i]].includes('abcdefg'[j])?light:off));}
 stage.dataset.display=text.slice(0,2)+':'+text.slice(2);stage.dataset.timerRemaining=String(Math.ceil((timerDeadline?Math.max(0,timerDeadline-now):timerRemaining)/1000));stage.dataset.watchElapsed=String(Math.floor(elapsed));
 const alarmKey=`${c.year}-${c.month}-${c.day}-${p.h}:${p.m}`;
 if(enabled&&`${String(p.h).padStart(2,'0')}:${String(p.m).padStart(2,'0')}`===alarm&&alarmKey!==lastAlarmKey&&!snoozeUntil){lastAlarmKey=alarmKey;ring('alarm');}
 if(snoozeUntil&&now>=snoozeUntil){snoozeUntil=0;ring('alarm');}if(demoUntil&&now>=demoUntil)stop();
 screenLights.forEach(o=>o.visible=screenOn);stage.dataset.lightsVisible=String(screenOn);
 const blink=!ringing||Math.floor(now/250)%2===0;light.color.setHex(ringing&&!blink?0x614621:0xff8b24);light.color.multiplyScalar(dim?.55:1);
 dots.forEach(d=>d.visible=screenOn&&(mode!=='time'||p.s%2===0||ringing));
 glow.material.opacity=dim?.4:1;hudDraw(p,c,now,remaining,elapsed);
 if(sound&&ringing&&audio&&now-lastBeep>700){lastBeep=now;const osc=audio.createOscillator(),gain=audio.createGain();osc.frequency.value=880;gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.17);}
}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const a=w/h,span=a<.8?8.3/a:7.4;camera.left=-span*a/2;camera.right=span*a/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();camera.updateMatrixWorld();stage.dataset.buttonScreens=JSON.stringify(Object.fromEntries(buttons.map(b=>{const p=b.cap.getWorldPosition(new T.Vector3()).project(camera);return[b.name,[(p.x+1)*w/2,(1-p.y)*h/2]];})));}
new ResizeObserver(resize).observe(stage);
let clockDrawAt=0;const frameGate=createFrameGate(stage);configurePreview(renderer,scene,stage);
function tick(t){frame=0;if(!active())return;if(!frameGate(t)){frame=requestAnimationFrame(tick);return;}const dt=Math.min((t-last)/1000||.016,.05);last=t;buttons.forEach(b=>{b.g.position.y=T.MathUtils.lerp(b.g.position.y,b.down?2.585:2.63,1-Math.exp(-dt*24));const lit=b.down||t<b.flashUntil,target=lit?1.05:b.name==='alarm'&&enabled&&screenOn?.11:0;b.light=T.MathUtils.lerp(b.light,target,1-Math.exp(-dt*(lit?30:12)));b.cap.material.emissiveIntensity=b.light;b.glow.opacity=b.light*.8;stage.dataset[b.name+'Glow']=b.light.toFixed(3);});if(t-clockDrawAt>100){clockDrawAt=t;draw(Date.now());}renderer.render(scene,camera);frame=requestAnimationFrame(tick);}
function start(){if(active()&&!frame){resize();last=performance.now();frame=requestAnimationFrame(tick);}}
document.addEventListener('productchange',()=>{release();if(!active()){cancelAnimationFrame(frame);frame=0;stop();if(dialog.open)dialog.close();}else start();});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;release();}else start();});state();start();









