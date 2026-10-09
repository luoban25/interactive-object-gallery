import {createFrameGate,configurePreview} from './preview-performance.js?v=53';
import * as T from 'three';
import {backlight} from './series-lighting.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
const stage=document.getElementById('controller-stage'),status=document.getElementById('controller-status');
const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(0xffffff,0);stage.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','工业控制盒。拖动或滚动旋钮调节目标液位。橙色键切换页面，上下键调整数值，空格开关泵，M 切换，R 复位。点击屏幕切换泵状态。');
const scene=new T.Scene(),camera=new T.OrthographicCamera(-5,5,5,-5,.1,40);camera.position.set(8,7.7,10);camera.lookAt(0,2.9,0);
scene.add(new T.HemisphereLight(0xffffff,0xd7d6d2,1.65));const key=new T.DirectionalLight(0xffffff,1.7);key.position.set(-5,10,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:8,bottom:-4,near:.1,far:25});key.shadow.normalBias=.04;key.shadow.bias=-.0001;scene.add(key);const fill=new T.DirectionalLight(0xffffff,.5);fill.position.set(7,5,-4);scene.add(fill);
const materials={shell:new T.MeshStandardMaterial({color:0xf2efea,roughness:.8,metalness:.12}),frame:new T.MeshStandardMaterial({color:0x969792,roughness:.7,metalness:.25}),dark:new T.MeshStandardMaterial({color:0x484944,roughness:.7}),orange:new T.MeshStandardMaterial({color:0xf98120,roughness:.6}),screen:new T.MeshBasicMaterial({color:0x22231f})};
const edgeMat=new T.LineBasicMaterial({color:0x454640});
const body=new T.Group();scene.add(body);
function mesh(geometry,material,parent=body,pos=[0,0,0],edges=true){const m=new T.Mesh(geometry,material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);if(edges){const outline=new T.LineSegments(new T.EdgesGeometry(geometry,25),edgeMat);outline.raycast=()=>{};m.add(outline);}return m;}
function box(w,h,d,r,mat,pos,parent=body){return mesh(new RoundedBoxGeometry(w,h,d,1,r),mat,parent,pos);}
function shape(w,h,c){const s=new T.Shape();const p=[[-w/2+c,-h/2],[w/2-c,-h/2],[w/2,-h/2+c],[w/2,h/2-c],[w/2-c,h/2],[-w/2+c,h/2],[-w/2,h/2-c],[-w/2,-h/2+c]];s.moveTo(...p[0]);p.slice(1).forEach(v=>s.lineTo(...v));s.closePath();return s;}
function line(points,parent=body,mat=edgeMat){const o=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),mat);parent.add(o);return o;}
box(4.4,5.4,1.65,.09,materials.shell,[0,2.85,0]);
mesh(new T.ExtrudeGeometry(shape(4.35,5.32,.15),{depth:.10,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1}),materials.shell,body,[0,2.85,.825]);
line([[2.21,.34,.57],[2.21,5.34,.57],[2.11,5.56,.57],[-2.1,5.56,.57]]);
for(let i=0;i<3;i++)box(.015,.53,.025,.005,materials.frame,[2.211,3.66,-.23+i*.18]);
for(const x of [-1.65,1.65]){const tab=shape(.55,.86,.045),hole=new T.Path();hole.absarc(0,.10,.105,0,Math.PI*2,true);tab.holes.push(hole);mesh(new T.ExtrudeGeometry(tab,{depth:.09,bevelEnabled:true,bevelSize:.013,bevelThickness:.013,bevelSegments:1}),materials.shell,body,[x,5.60,-.71]);}
function screw(x,y,z,r=.095){const o=mesh(new T.CylinderGeometry(r,r,.035,32),materials.frame,body,[x,y,z]);o.rotation.x=Math.PI/2;line([[x-r*.45,y,z+.021],[x+r*.45,y,z+.021]]);line([[x,y-r*.45,z+.021],[x,y+r*.45,z+.021]]);}
for(const x of [-1.92,1.92])for(const y of [.44,5.21])screw(x,y,.964,.106);
box(3.45,3.20,.09,.05,materials.frame,[0,3.77,.97]);
box(3.20,2.92,.035,.04,materials.dark,[0,3.77,1.031]);
const screen=mesh(new T.ShapeGeometry(shape(3.12,2.83,.045)),materials.screen,body,[0,3.77,1.055],false);
for(const x of [-1.57,1.57])for(const y of [2.34,5.20])screw(x,y,1.034,.055);
const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=910;const ctx=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
const display=mesh(new T.PlaneGeometry(3.08,2.79),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),body,[0,3.77,1.058],false);
const buttons=[];
for(const [name,x,color]of [['menu',.03,materials.orange],['up',.77,materials.shell],['down',1.51,materials.shell]]){box(.56,.62,.045,.022,materials.frame,[x,1.19,.98]);const g=new T.Group();g.position.set(x,1.19,1.07);body.add(g);const material=color.clone();material.emissive.setHex(0xff6a0c);const cap=box(.52,.57,.15,.025,material,[0,0,0],g);cap.userData.action=name;const glow=backlight(body,.52,.57,[x,1.19,1.012]);buttons.push({name,g,cap,down:false,glow,light:0,flashUntil:0});}
function triangle(x,y,up){const s=new T.Shape();s.moveTo(-.077,up?-.056:.056);s.lineTo(.077,up?-.056:.056);s.lineTo(0,up?.076:-.076);s.closePath();mesh(new T.ShapeGeometry(s),materials.dark,body,[x,y,.963],false);}
triangle(.77,1.76,true);triangle(1.51,1.76,false);for(let i=0;i<3;i++)line([[-.075,1.72+i*.045,.963],[.125,1.72+i*.045,.963]]);
const knob=new T.Group();knob.position.set(-1.16,1.19,1.03);body.add(knob);
const collar=mesh(new T.CylinderGeometry(.45,.45,.07,64),materials.frame,knob,[0,0,0]);collar.rotation.x=Math.PI/2;
const rotor=new T.Group();knob.add(rotor);const drum=mesh(new T.CylinderGeometry(.385,.385,.29,64),materials.dark,rotor,[0,0,.14]);drum.rotation.x=Math.PI/2;
for(let i=0;i<22;i++){const a=i/22*Math.PI*2;const rib=box(.038,.065,.24,.005,materials.frame,[Math.sin(a)*.382,Math.cos(a)*.382,.13],rotor);rib.rotation.z=-a;}
const face=mesh(new T.CylinderGeometry(.364,.364,.025,64),materials.dark,rotor,[0,0,.305]);face.rotation.x=Math.PI/2;
const pointerMaterial=materials.orange.clone();pointerMaterial.emissive.setHex(0xff790e);box(.052,.25,.009,.005,pointerMaterial,[0,.205,.325],rotor);
const scaleMarks=[];
for(let i=0;i<11;i++){const a=(-135+i*27)*Math.PI/180,mat=new T.MeshBasicMaterial({color:0xff8b24});const mark=box(.025,i%5===0?.095:.065,.009,.003,mat,[-1.16+Math.sin(a)*.525,1.19+Math.cos(a)*.525,.969]);mark.rotation.z=-a;scaleMarks.push(mark);}
const dialHalo=backlight(body,.87,.87,[-1.16,1.19,.968]);let dialLight=0,adjustUntil=0;const ground=mesh(new T.PlaneGeometry(40,40),new T.ShadowMaterial({opacity:.10}),scene,[0,.11,0],false);ground.rotation.x=-Math.PI/2;ground.castShadow=false;ground.receiveShadow=true;
let target=73,level=73,running=true,view=0,frame=0,last=0,paintAt=0,pressed=null,drag=null,sampleAt=0;const history=Array.from({length:40},(_,i)=>68+Math.sin(i*.4)*5),ray=new T.Raycaster(),pointer=new T.Vector2();
const viewNames=['overview','trend','settings'];
function state(){Object.assign(stage.dataset,{target:String(target),level:level.toFixed(2),running:String(running),view:viewNames[view]});rotor.rotation.z=-(target-50)/50*Math.PI*.75;document.getElementById('controller-power').setAttribute('aria-pressed',String(running));paintAt=0;}
function ping(name){const b=buttons.find(b=>b.name===name);if(b)b.flashUntil=performance.now()+200;}
function adjust(v){adjustUntil=performance.now()+250;target=Math.max(0,Math.min(100,Math.round(v)));state();status.textContent='目标液位 '+target+'%';}
function toggle(){running=!running;state();status.textContent=running?'泵已启动':'泵已停止';}
function menu(){ping("menu");view=(view+1)%3;state();status.textContent=['工艺总览','液位趋势','目标液位设置'][view];}
function reset(){target=73;level=73;running=true;view=0;history.fill(73);state();}
const actions={menu,up:()=>{ping("up");adjust(target+1);},down:()=>{ping("down");adjust(target-1);}};
document.getElementById('controller-power').onclick=toggle;document.getElementById('controller-menu').onclick=menu;document.getElementById('controller-reset').onclick=reset;
function cast(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects([...buttons.map(b=>b.cap),drum,face,screen],false)[0]?.object;}
renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;const hit=cast(e);if(hit===drum||hit===face){drag={y:e.clientY,value:target};pressed='knob';}else if(hit===screen)pressed='screen';else if(hit?.userData.action){pressed=hit.userData.action;buttons.find(b=>b.name===pressed).down=true;}if(pressed){renderer.domElement.focus();renderer.domElement.setPointerCapture(e.pointerId);}});
renderer.domElement.addEventListener('pointermove',e=>{if(drag)adjust(drag.value+(drag.y-e.clientY)*.4);else renderer.domElement.style.cursor=cast(e)?'pointer':'default';});
renderer.domElement.addEventListener('pointerup',e=>{const n=pressed,hit=cast(e);release();if(n==='screen'&&hit===screen)toggle();else if(n&&hit?.userData.action===n)actions[n]();});
function release(){pressed=null;drag=null;buttons.forEach(b=>b.down=false);}
for(const ev of ['pointercancel','lostpointercapture'])renderer.domElement.addEventListener(ev,release);window.addEventListener('blur',release);
renderer.domElement.addEventListener('wheel',e=>{const hit=cast(e);if(hit===drum||hit===face){e.preventDefault();adjust(target+(e.deltaY<0?1:-1));}},{passive:false});
function active(){return document.body.dataset.product==='controller'&&!document.hidden&&document.body.dataset.paused!=='true';}
document.addEventListener('keydown',e=>{if(!active()||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('button,input,select'))return;const a={ArrowUp:'up',ArrowRight:'up',ArrowDown:'down',ArrowLeft:'down',m:'menu'}[e.key];if(a){e.preventDefault();if(a==='menu'&&e.repeat)return;buttons.find(b=>b.name===a).down=true;actions[a]();}else if((e.code==='Space'||e.key.toLowerCase()==='p')&&!e.repeat){e.preventDefault();toggle();}else if(e.key.toLowerCase()==='r')reset();});document.addEventListener('keyup',release);
function draw(now){
 ctx.clearRect(0,0,1000,910);ctx.fillStyle='#f9912d';ctx.strokeStyle='#f9912d';ctx.lineWidth=4;ctx.font='28px ui-monospace,monospace';ctx.textBaseline='alphabetic';
 function text(s,x,y,size=28,alpha=1){ctx.globalAlpha=alpha;ctx.font=size+'px ui-monospace,monospace';ctx.fillText(s,x,y);ctx.globalAlpha=1;}
 function path(p){ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
 const nowText=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
 text(nowText,382,57,27);text(running?'SYS OK':'SYS HOLD',38,57,28);
 if(view===0){
 const pressure=running?2.1+target*.0041:0,temp=running?54+target*.2:24;
 text('P1  '+pressure.toFixed(2)+' bar',40,180,39);text('T1  '+temp.toFixed(1)+' °C',40,245,39);text('L1  '+Math.round(level)+' %',40,310,39);text('SET '+target+' %',40,365,26,.6);
 ctx.globalAlpha=.6;path([[38,399],[475,399]]);ctx.globalAlpha=1;
 path([[596,225],[596,557],[728,557],[728,225],[704,200],[620,200],[596,225]]);
 const waterH=level*2.7;ctx.globalAlpha=.4;ctx.fillRect(609,542-waterH,106,waterH);ctx.globalAlpha=1;
 for(let y=545-waterH;y<540;y+=10)for(let x=613;x<713;x+=10){ctx.fillRect(x,y,3,3);}path([[615,542-waterH],[712,542-waterH]]);
 path([[662,200],[662,145],[800,145],[800,341],[918,341],[918,637],[820,637]]);path([[738,637],[661,637],[661,557]]);
 ctx.beginPath();ctx.arc(778,637,43,0,Math.PI*2);ctx.stroke();const angle=running?now*.002:0;ctx.save();ctx.translate(778,637);ctx.rotate(angle);path([[-13,-22],[26,0],[-13,22],[-13,-22]]);ctx.restore();
 path([[836,323],[877,359],[877,323],[836,359],[836,323]]);
 if(running){const t=(now/1800)%1;const segments=[[[662,145],[800,145]],[[800,145],[800,341]],[[800,341],[918,341]],[[918,341],[918,637]]];for(const[a,b]of segments){ctx.beginPath();ctx.arc(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,5,0,7);ctx.fill();}}
 text(running?'PUMP ON':'PUMP OFF',696,754,26);text('LEVEL HISTORY',40,460,22,.65);
 path([[40,480],[40,735],[465,735]]);for(let i=0;i<10;i++){const h=history[history.length-10+i]*2.25;ctx.globalAlpha=.5+i*.05;ctx.fillRect(56+i*39,728-h,26,h);}ctx.globalAlpha=1;
 }else if(view===1){text('LEVEL / LIVE TREND',40,153,35);text('ACTUAL '+level.toFixed(1)+'%   TARGET '+target+'%',40,211,28,.7);for(let i=0;i<=4;i++){ctx.globalAlpha=.15;path([[90,310+i*100],[945,310+i*100]]);ctx.globalAlpha=1;text(String(100-i*25),18,321+i*100,22,.6);}ctx.globalAlpha=.4;ctx.setLineDash([12,9]);path([[90,710-target*4],[945,710-target*4]]);ctx.setLineDash([]);ctx.globalAlpha=1;path(history.map((v,i)=>[90+i*855/(history.length-1),710-v*4]));text('LAST 20 SECONDS',90,795,26,.7);
 }else{text('TARGET LEVEL',40,162,40);text(String(target).padStart(2,'0')+'%',130,416,155);text('TURN DIAL / UP / DOWN',40,525,27,.65);ctx.globalAlpha=.15;ctx.fillRect(40,595,905,30);ctx.globalAlpha=1;ctx.fillRect(40,595,905*target/100,30);text('RANGE  0 — 100 %',40,700,29);text('ACTUAL '+level.toFixed(1)+' %',40,766,29);}
 ctx.globalAlpha=.2;path([[35,837],[960,837]]);ctx.globalAlpha=1;text(['01 PROCESS','02 TREND','03 SETPOINT'][view],40,885,23,.7);text('SIMULATION',755,885,23,.5);texture.needsUpdate=true;
}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const a=w/h,span=a<.8?6.3/a:9.0;camera.left=-span*a/2;camera.right=span*a/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();scene.updateMatrixWorld(true);camera.updateMatrixWorld();function coords(o){const p=o.getWorldPosition(new T.Vector3()).project(camera);return[(p.x+1)*w/2,(1-p.y)*h/2];}stage.dataset.controls=JSON.stringify(Object.fromEntries([...buttons.map(b=>[b.name,coords(b.cap)]),['knob',coords(face)],['screen',coords(screen)]]));}
new ResizeObserver(resize).observe(stage);
const frameGate=createFrameGate(stage);configurePreview(renderer,scene,stage);
function tick(t){frame=0;if(!active())return;if(!frameGate(t)){frame=requestAnimationFrame(tick);return;}const dt=Math.min((t-last)/1000||.016,.05);last=t;if(running)level+=(target-level)*Math.min(dt*.65,1);buttons.forEach(b=>{b.g.position.z=T.MathUtils.lerp(b.g.position.z,b.down?1.01:1.07,1-Math.exp(-dt*24));const lit=b.down||t<b.flashUntil,goal=lit?1.05:b.name==='menu'&&view===2?.13:0;b.light=T.MathUtils.lerp(b.light,goal,1-Math.exp(-dt*(lit?30:12)));b.cap.material.emissiveIntensity=b.light;b.glow.opacity=b.light*.8;stage.dataset[b.name+'Glow']=b.light.toFixed(3);});
const dialActive=!!drag||t<adjustUntil;dialLight=T.MathUtils.lerp(dialLight,dialActive?1:.24,1-Math.exp(-dt*(dialActive?30:12)));dialHalo.opacity=dialLight*.3;pointerMaterial.emissiveIntensity=dialLight;scaleMarks.forEach((m,i)=>m.material.color.setHex(i/10<=target/100?0xff942d:0x795431));stage.dataset.dialGlow=dialLight.toFixed(3);if(t-sampleAt>500){sampleAt=t;history.push(level);history.shift();stage.dataset.level=level.toFixed(2);}if(t-paintAt>80){paintAt=t;draw(t);}renderer.render(scene,camera);frame=requestAnimationFrame(tick);}
function start(){if(active()&&!frame){resize();last=performance.now();frame=requestAnimationFrame(tick);}}
document.addEventListener('productchange',()=>{release();if(active())start();else{cancelAnimationFrame(frame);frame=0;}});document.addEventListener('visibilitychange',()=>{release();if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();});state();start();







