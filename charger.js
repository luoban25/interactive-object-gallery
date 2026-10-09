import {createFrameGate,configurePreview} from './preview-performance.js?v=53';
import * as T from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';

const stage=document.getElementById('charger-stage'),status=document.getElementById('charger-status');
const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xffffff,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
stage.append(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','充电桩。点击充电枪取出，取出后拖动；空格取枪或归位，P 开关，C 充电演示，R 复位。');
const scene=new T.Scene(),camera=new T.OrthographicCamera(-4,4,4,-4,.1,40);camera.position.set(8,7.3,10);camera.lookAt(.3,2.65,0);
scene.add(new T.HemisphereLight(0xffffff,0xe7e6e4,2.2));const key=new T.DirectionalLight(0xffffff,2);key.position.set(-3,12,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-4,right:4,top:6,bottom:-4,near:.1,far:20});key.shadow.bias=-.0001;key.shadow.normalBias=.035;key.shadow.radius=5;scene.add(key);
const fill=new T.DirectionalLight(0xffffff,.8);fill.position.set(6,4,-3);scene.add(fill);
const white=new T.MeshStandardMaterial({color:0xf9f9f8,roughness:.82,metalness:.04}),pale=new T.MeshStandardMaterial({color:0xe9e9e7,roughness:.8}),grey=new T.MeshStandardMaterial({color:0xa5a9a9,roughness:.7}),black=new T.MeshStandardMaterial({color:0x323739,roughness:.78}),rubber=new T.MeshStandardMaterial({color:0x535658,roughness:.68});
const orange=new T.MeshStandardMaterial({color:0xf95800,emissive:0xf95800,emissiveIntensity:.55,roughness:.65});const lamps=[];
const outline=new T.ShaderMaterial({side:T.BackSide,uniforms:{color:{value:new T.Color(0x8a8f91)}},vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*.005,1.);}',fragmentShader:'uniform vec3 color;void main(){gl_FragColor=vec4(color,1.);}'});
const station=new T.Group();scene.add(station);
function mesh(g,m,parent,p=[0,0,0],border=true){const o=new T.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=false;parent.add(o);if(border){const edge=new T.Mesh(g,outline);edge.raycast=()=>{};o.add(edge);}return o;}
function box(w,h,d,r,parent,p,m=white){return mesh(new RoundedBoxGeometry(w,h,d,4,r),m,parent,p);}
function rounded(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function frame(w,h,r,t,depth,parent,pos){const s=rounded(w,h,r),hole=rounded(w-2*t,h-2*t,Math.max(.03,r-t));const pts=hole.getPoints(24).reverse();const path=new T.Path(pts);s.holes.push(path);const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:20});return mesh(g,white,parent,pos);}
const pedestal=box(1.89,.14,1.40,.13,station,[0,.10,0]);
// One continuous shell with a real display opening; no applied full-height plate.
const housingShape=rounded(1.65,5.13,.27);
const displayHole=rounded(1.37,1.61,.22).getPoints(32).reverse().map(p=>new T.Vector2(p.x,p.y+1.51));
housingShape.holes.push(new T.Path(displayHole));
const shell=mesh(new T.ExtrudeGeometry(housingShape,{depth:1.15,bevelEnabled:true,bevelSize:.045,bevelThickness:.045,bevelSegments:5,curveSegments:32}),white,station,[0,2.74,-.575]);
const seamMaterial=new T.LineBasicMaterial({color:0x9a9d9e,transparent:true,opacity:.72});
function line(points,parent=station){const o=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),seamMaterial);parent.add(o);return o;}
line(rounded(1.65,5.13,.27).getPoints(96).map(p=>[p.x,p.y+2.74,.626]));
line([[.752,.26,.628],[.752,3.23,.628]]);
line([[-.752,.26,.628],[.752,.26,.628]]);
for(let i=0;i<10;i++)line([[-.49+i*.048,.69,.628],[-.49+i*.048,1.38,.628]]);
for(let i=0;i<8;i++)line([[.873,4.24,-.35+i*.078],[.873,4.78,-.35+i*.078]]);
const bezel=frame(1.305,1.545,.185,.027,.015,station,[0,4.25,.546]);
const inner=mesh(new T.ShapeGeometry(rounded(1.31,1.55,.19),32),pale,station,[0,4.25,.539],false);
const screenCanvas=document.createElement('canvas');screenCanvas.width=512;screenCanvas.height=640;const ctx=screenCanvas.getContext('2d');const texture=new T.CanvasTexture(screenCanvas);texture.colorSpace=T.SRGBColorSpace;
const screenGeometry=new T.ShapeGeometry(rounded(1.245,1.485,.15),32),uv=screenGeometry.attributes.uv,pos=screenGeometry.attributes.position;
for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/1.245+.5,pos.getY(i)/1.485+.5);
const screen=mesh(screenGeometry,new T.MeshBasicMaterial({map:texture}),station,[0,4.25,.563],false);screen.userData.action='charge';
// Charger controls are part of the object as well as keyboard-accessible buttons.
for(let i=0;i<3;i++){const mat=orange.clone();lamps.push(mat);const l=mesh(new T.SphereGeometry(.025,20,12),mat,station,[-.075+i*.09,3.27,.636],false);}
const bar=box(.044,.86,.028,.014,station,[0,2.50,.640],orange.clone());lamps.push(bar.material);bar.userData.action='power';
const barCore=box(.012,.83,.005,.002,bar,[0,0,.017],new T.MeshBasicMaterial({color:0xffc68d}));
const side=new T.Group();side.position.set(.838,3.35,.04);side.rotation.y=Math.PI/2;station.add(side);
const surround=frame(.59,1.43,.20,.07,.065,side,[0,0,0]);mesh(new T.ExtrudeGeometry(rounded(.445,1.27,.15),{depth:.05,bevelEnabled:false,curveSegments:24}),grey,side,[0,0,.012]);mesh(new T.ShapeGeometry(rounded(.352,1.12,.125),24),black,side,[0,0,.064],false);
const port=mesh(new T.CylinderGeometry(.115,.115,.08,40),rubber,station,[.93,3.77,.10],false);port.rotation.z=Math.PI/2;
const fixedAnchor=new T.Vector3(.93,2.76,-.12);box(.11,.14,.14,.035,station,fixedAnchor.toArray(),rubber);
const gun=new T.Group();scene.add(gun);
const gunShape=new T.Shape();gunShape.moveTo(-.11,.27);gunShape.bezierCurveTo(-.05,.43,.12,.37,.24,.18);gunShape.bezierCurveTo(.35,.02,.38,-.25,.43,-.59);gunShape.quadraticCurveTo(.42,-.68,.20,-.65);gunShape.lineTo(.10,-.16);gunShape.quadraticCurveTo(.02,-.03,-.10,.01);gunShape.closePath();
const gunBody=mesh(new T.ExtrudeGeometry(gunShape,{depth:.16,bevelEnabled:true,bevelSegments:4,bevelSize:.025,bevelThickness:.025,curveSegments:24}),white,gun,[0,0,-.08]);gunBody.userData.action='gun';
const nozzle=mesh(new T.CylinderGeometry(.106,.11,.26,40),pale,gun,[-.16,.17,0],false);nozzle.rotation.z=Math.PI/2;nozzle.userData.action='gun';
const nose=mesh(new T.CylinderGeometry(.079,.089,.065,32),black,gun,[-.32,.17,0],false);nose.rotation.z=Math.PI/2;
const gripInset=box(.045,.29,.018,.018,gun,[.12,-.30,-.10],rubber);gripInset.rotation.z=.18;
const gunLed=box(.019,.20,.014,.009,gun,[.29,-.30,.117],orange.clone());gunLed.rotation.z=.19;lamps.push(gunLed.material);
const cuff=mesh(new T.CylinderGeometry(.104,.087,.13,40),rubber,gun,[.285,-.70,0]);cuff.rotation.z=.14;
const sleeve=mesh(new T.CylinderGeometry(.078,.066,.12,40),black,gun,[.294,-.81,0]);sleeve.rotation.z=.14;
const gunAnchor=new T.Vector3(.304,-.866,0);
const dock=new T.Vector3(1.14,3.60,.10),outside=new T.Vector3(1.78,3.60,.10);
gun.position.copy(dock);scene.updateMatrixWorld(true);
function route(end,bottom){return new T.CatmullRomCurve3([fixedAnchor,new T.Vector3(1.00,2.31,-.12),new T.Vector3(1.00,bottom+.28,-.12),new T.Vector3(1.14,bottom,-.08),new T.Vector3(end.x+.16,bottom+.025,end.z),new T.Vector3(end.x+.24,bottom+.40,end.z),new T.Vector3(end.x+.08,(end.y+bottom)/2+.08,end.z),end],false,'centripetal');}
const restEnd=gun.localToWorld(gunAnchor.clone()),cableLength=route(restEnd,.24).getLength();
const cable=mesh(new T.TubeGeometry(route(restEnd,.24),88,.034,12,false),rubber,scene,[0,0,0]);cable.userData.action='none';
function cablePath(end){let lo=.18,hi=1.35;for(let i=0;i<13;i++){const mid=(lo+hi)/2;if(route(end,mid).getLength()>cableLength)lo=mid;else hi=mid;}return route(end,(lo+hi)/2);}
function updateCable(){scene.updateMatrixWorld(true);const end=gun.localToWorld(gunAnchor.clone()),curve=cablePath(end);const old=cable.geometry,newGeometry=new T.TubeGeometry(curve,88,.034,12,false);cable.geometry=newGeometry;cable.children[0].geometry=newGeometry;old.dispose();const points=curve.getPoints(120);stage.dataset.cablePoints=JSON.stringify(points.map(p=>p.toArray()));stage.dataset.cableMinY=String(Math.min(...points.map(p=>p.y))-.034);stage.dataset.cableLength=String(curve.getLength());stage.dataset.cableEnd=end.toArray().join(',');}
const ground=mesh(new T.PlaneGeometry(50,50),new T.ShadowMaterial({opacity:.045}),scene,[0,.014,0],false);ground.rotation.x=-Math.PI/2;ground.castShadow=false;ground.receiveShadow=true;
const gc=document.createElement('canvas');gc.width=gc.height=128;const gx=gc.getContext('2d'),grad=gx.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(249,88,0,.14)');grad.addColorStop(1,'rgba(249,88,0,0)');gx.fillStyle=grad;gx.fillRect(0,0,128,128);
const glow=mesh(new T.PlaneGeometry(3.5,3.5),new T.MeshBasicMaterial({map:new T.CanvasTexture(gc),transparent:true,depthWrite:false}),scene,[0,.02,0],false);glow.rotation.x=-Math.PI/2;glow.castShadow=false;
let powered=true,gunState='docked',charging=false,dragging=false,target=dock.clone(),frameId=0,last=0,screenTime=0,progress=0,press=0;
const ray=new T.Raycaster(),pointer=new T.Vector2(),dragPlane=new T.Plane(new T.Vector3(0,0,1),-.10),hit=new T.Vector3(),grabOffset=new T.Vector3();
const pickables=[gunBody,nozzle,screen,bar];
function active(){return document.body.dataset.product==='charger'&&!document.hidden&&document.body.dataset.paused!=='true';}
function say(message){status.textContent=message;}
function state(){stage.dataset.powered=String(powered);stage.dataset.gun=gunState;stage.dataset.charging=String(charging);stage.dataset.gunPosition=gun.position.toArray().join(',');document.getElementById('charger-power').setAttribute('aria-pressed',String(powered));document.getElementById('charger-gun').setAttribute('aria-pressed',String(gunState!=='docked'));document.getElementById('charger-charge').setAttribute('aria-pressed',String(charging));}
function togglePower(){powered=!powered;charging=false;press=1;say(powered?'充电桩已启动':'已关闭，充电枪保持当前位置');state();screenTime=0;}
function toggleGun(){charging=false;dragging=false;if(gunState==='docked'||gunState==='returning'){gunState='undocking';target.copy(outside);say('正在取枪');}else{gunState='returning';target.copy(outside);say('正在归位');}state();}
function toggleCharge(){if(!powered){say('请先打开电源');return;}if(gunState!=='out'){say('先取出充电枪，再启动演示');return;}charging=!charging;progress=0;say(charging?'充电灯光演示已启动':'演示已停止');state();screenTime=0;}
function reset(){if(gunState==='docked'){charging=false;state();return;}charging=false;dragging=false;gunState='returning';target.copy(outside);say('正在复位');state();}
document.getElementById('charger-power').onclick=togglePower;document.getElementById('charger-gun').onclick=toggleGun;document.getElementById('charger-charge').onclick=toggleCharge;document.getElementById('charger-reset').onclick=reset;
function moveTarget(x,y){const candidate=new T.Vector3(T.MathUtils.clamp(x,1.59,2.14),T.MathUtils.clamp(y,3.15,3.90),.10);const end=candidate.clone().add(gunAnchor),curve=cablePath(end);if(Math.abs(curve.getLength()-cableLength)<.07)target.copy(candidate);}
function cast(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);}
canvas.addEventListener('pointerdown',e=>{cast(e);const h=ray.intersectObjects(pickables,false)[0];if(!h)return;canvas.focus({preventScroll:true});const a=h.object.userData.action;if(a==='power'){togglePower();return;}if(a==='charge'){toggleCharge();return;}if(gunState!=='out'){toggleGun();return;}dragging=true;if(ray.ray.intersectPlane(dragPlane,hit))grabOffset.copy(target).sub(hit);canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{cast(e);if(dragging){if(ray.ray.intersectPlane(dragPlane,hit))moveTarget(hit.x+grabOffset.x,hit.y+grabOffset.y);}else canvas.style.cursor=ray.intersectObjects(pickables,false).length?'pointer':'default';});
function release(){dragging=false;}canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);window.addEventListener('blur',release);
document.addEventListener('keydown',e=>{if(!active()||e.ctrlKey||e.altKey||e.metaKey||(e.target.closest('button')&&(e.key===' '||e.key==='Enter')))return;if(e.key===' '){e.preventDefault();if(!e.repeat)toggleGun();}else if(e.key.toLowerCase()==='p'&&!e.repeat)togglePower();else if(e.key.toLowerCase()==='c'&&!e.repeat)toggleCharge();else if(e.key.toLowerCase()==='r'&&!e.repeat)reset();else if(gunState==='out'&&e.key.startsWith('Arrow')){e.preventDefault();const d={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,.08],ArrowDown:[0,-.08]}[e.key];if(d)moveTarget(target.x+d[0],target.y+d[1]);}});
function drawScreen(t){const w=512,h=640;ctx.clearRect(0,0,w,h);ctx.fillStyle=powered?'#fff8ef':'#252b2e';ctx.fillRect(0,0,w,h);if(powered){ctx.strokeStyle='#f95800';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(10,10,w-20,h-20,54);ctx.stroke();const cx=w/2,cy=265,r=106;ctx.strokeStyle='#ffd2b0';ctx.lineWidth=12;ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI*.7,Math.PI*.7);ctx.stroke();ctx.strokeStyle='#f95800';ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI*.48,-Math.PI*.48+(charging?progress:.28)*Math.PI*1.6);ctx.stroke();ctx.fillStyle='#f95800';ctx.beginPath();ctx.moveTo(cx+19,cy-88);ctx.lineTo(cx-45,cy+5);ctx.lineTo(cx-3,cy+15);ctx.lineTo(cx-24,cy+84);ctx.lineTo(cx+51,cy-9);ctx.lineTo(cx+9,cy-22);ctx.closePath();ctx.fill();for(let i=0;i<4;i++){ctx.fillStyle=charging&&Math.floor(t/260)%4===i?'#ffad54':'#f95800';ctx.beginPath();ctx.arc(74+i*30,518,6,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#ffd1af';ctx.fillRect(72,557,365,8);ctx.fillStyle='#f95800';ctx.fillRect(72,557,365*(charging?progress:.12),8);}texture.needsUpdate=true;}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const a=w/h,span=a<.8?4.1/a:6.8;camera.left=-span*a/2;camera.right=span*a/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(stage);
const frameGate=createFrameGate(stage);configurePreview(renderer,scene,stage);
function tick(t){frameId=0;if(!active())return;if(!frameGate(t)){frameId=requestAnimationFrame(tick);return;}const dt=Math.min((t-last)/1000||.016,.05);last=t;const previous=gun.position.clone();gun.position.lerp(target,1-Math.exp(-dt*7));if(gun.position.distanceTo(target)<.007){gun.position.copy(target);if(gunState==='undocking'){gunState='out';say('充电枪已取出，可拖动');state();}else if(gunState==='returning'){gunState='docking';target.copy(dock);state();}else if(gunState==='docking'){gunState='docked';say('充电枪已归位');state();}}if(previous.distanceToSquared(gun.position)>.00000001)updateCable();stage.dataset.gunPosition=gun.position.toArray().join(',');const gs=gun.localToWorld(new T.Vector3(.25,-.25,.1)).project(camera);stage.dataset.gunScreen=[(gs.x+1)*stage.clientWidth/2,(1-gs.y)*stage.clientHeight/2].join(',');if(charging)progress=(progress+dt*.08)%1;if(t-screenTime>125){drawScreen(t);screenTime=t;}const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;lamps.forEach((m,i)=>{m.color.setHex(powered?0xf95800:0x9a9f9f);m.emissiveIntensity=powered?(charging&&!reduced?.35+.3*Math.sin(t*.006-i*.9):.35):0;});press=Math.max(0,press-dt*6);bar.position.z=.640-press*.012;glow.visible=powered;barCore.visible=powered;renderer.render(scene,camera);frameId=requestAnimationFrame(tick);}
function start(){if(active()&&!frameId){resize();last=performance.now();frameId=requestAnimationFrame(tick);}}
document.addEventListener('productchange',()=>{release();if(!active()){cancelAnimationFrame(frameId);frameId=0;charging=false;state();}else start();});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;release();}else start();});
drawScreen(0);updateCable();state();start();



