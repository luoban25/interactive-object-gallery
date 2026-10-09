import {createFrameGate,configurePreview} from './preview-performance.js?v=53';
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { limitTarget,poseFor } from './robot-kinematics.js';

const stage=document.querySelector('#robot-stage'),status=document.querySelector('#robot-status');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setClearColor(0xffffff,0);stage.append(renderer.domElement);
renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','拖动夹爪移动机械臂；方向键微调，空格开合夹爪，P 开关，R 复位');
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-5,5,4,-4,.1,80);
const viewCenter=new THREE.Vector3(-.8,2.15,0);camera.position.set(8,7.4,11);camera.lookAt(viewCenter);
scene.add(new THREE.HemisphereLight(0xffffff,0xe0dedb,2.0));
const key=new THREE.DirectionalLight(0xffffff,2.0);key.position.set(-3,9,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:7,bottom:-5,near:.1,far:25});key.shadow.bias=-.0001;key.shadow.normalBias=.06;key.shadow.radius=6;scene.add(key);
const fill=new THREE.DirectionalLight(0xffffff,1.1);fill.position.set(6,3,-5);scene.add(fill);
const white=new THREE.MeshStandardMaterial({color:0xf8f8f7,roughness:.72,metalness:.12});
const pale=new THREE.MeshStandardMaterial({color:0xe5e6e5,roughness:.67,metalness:.2});
const grey=new THREE.MeshStandardMaterial({color:0x858b8d,roughness:.6,metalness:.25});
const dark=new THREE.MeshStandardMaterial({color:0x596064,roughness:.7});
const orange=new THREE.MeshStandardMaterial({color:0xf95800,emissive:0xf95800,emissiveIntensity:.65,roughness:.4});
const lightMaterials=[];
const outline=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{color:{value:new THREE.Color(0x7e8587)}},vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*0.007,1.0);}',fragmentShader:'uniform vec3 color;void main(){gl_FragColor=vec4(color,1.0);}'});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),pickables=[];
function mesh(geo,mat,parent,pos=[0,0,0],edge=true){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);if(edge){const border=new THREE.Mesh(geo,outline);m.add(border);border.raycast=()=>{};}return m;}
function box(w,h,d,r,parent,pos,mat=white){return mesh(new RoundedBoxGeometry(w,h,d,3,r),mat,parent,pos);}
function cylinder(r,len,parent,pos,mat=white){const m=mesh(new THREE.CylinderGeometry(r,r,len,96),mat,parent,pos,false);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,25),new THREE.LineBasicMaterial({color:0x92999b,transparent:true,opacity:.7}));edges.raycast=()=>{};m.add(edges);return m;}
function disc(r,len,parent,z,mat=white){const m=cylinder(r,len,parent,[0,0,z],mat);m.rotation.x=Math.PI/2;return m;}
function ring(r,parent,pos){const mat=orange.clone();lightMaterials.push(mat);const m=mesh(new THREE.TorusGeometry(r,.018,12,96),mat,parent,pos,false);return m;}
function screw(parent,x,y,z){discScrew(parent,[x,y,z]);}
function discScrew(parent,pos){const m=cylinder(.025,.014,parent,pos,pale);m.rotation.x=Math.PI/2;const groove=box(.021,.005,.004,.001,parent,[pos[0],pos[1],pos[2]+.009],grey);return groove;}
const floor=mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.055}),scene,[0,.012,0],false);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(249,88,0,.16)');g.addColorStop(.4,'rgba(249,88,0,.06)');g.addColorStop(1,'rgba(249,88,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
const glow=mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:glowTexture(),transparent:true,depthWrite:false}),scene,[0,.017,0],false);glow.rotation.x=-Math.PI/2;glow.castShadow=false;
const robot=new THREE.Group();scene.add(robot);
box(1.95,.9,1.6,.15,robot,[0,.55,0]);box(1.93,.045,1.58,.12,robot,[0,1.015,0],pale);
for(const x of [-.74,.74])for(const z of [-.59,.59])box(.24,.09,.24,.04,robot,[x,.064,z],grey);
for(let i=0;i<12;i++)box(.014,.35,.01,.003,robot,[.979,.55,-.49+i*.075],grey);
for(let i=0;i<3;i++){const lamp=cylinder(.021,.012,robot,[-.66+i*.1,.57,.803],orange.clone());lamp.rotation.x=Math.PI/2;lightMaterials.push(lamp.material);}
const power=box(.28,.1,.045,.035,robot,[.45,.47,.822],orange.clone());lightMaterials.push(power.material);power.userData.action='power';pickables.push(power);
const platform=cylinder(.75,.22,robot,[0,1.16,0]);cylinder(.67,.075,robot,[0,1.29,0],pale);const baseRing=ring(.65,robot,[0,1.325,0]);baseRing.rotation.x=Math.PI/2;
box(.76,.62,.64,.2,robot,[0,1.6,0]);
const swivel=new THREE.Group();swivel.position.set(0,1.95,0);robot.add(swivel);const shoulder=new THREE.Group();swivel.add(shoulder);
const L1=2.05,L2=1.95;
function joint(parent,r){disc(r,.58,parent,0);disc(r*.95,.08,parent,.33,pale);disc(r*.88,.09,parent,.39);ring(r*.73,parent,[0,0,.442]);ring(r*.98,parent,[0,0,.295]);disc(r*.61,.02,parent,.45,white);disc(r*.94,.065,parent,-.33,pale);for(const a of [.4,2.5,4.6])screw(parent,Math.cos(a)*r*.79,Math.sin(a)*r*.79,.45);}
function arm(parent,len,w){box(w,len-.55,w*.82,.12,parent,[0,len/2,0]);box(w*.72,len-.82,.026,.09,parent,[0,len/2,w*.42],pale);box(w*.67,len-.87,.03,.07,parent,[0,len/2,w*.44]);for(const x of [-w*.36,w*.36])for(const y of [.39,len-.39])screw(parent,x,y,w*.43);box(.021,len*.4,.009,.008,parent,[w*.24,len/2,w*.445],grey);}
joint(shoulder,.47);arm(shoulder,L1,.67);
const elbow=new THREE.Group();elbow.position.y=L1;shoulder.add(elbow);joint(elbow,.43);arm(elbow,L2,.61);
const wrist=new THREE.Group();wrist.position.y=L2;elbow.add(wrist);joint(wrist,.31);
const hand=new THREE.Group();wrist.add(hand);cylinder(.26,.32,hand,[0,.25,0]);const wring=ring(.255,hand,[0,.23,0]);wring.rotation.x=Math.PI/2;
box(.59,.29,.44,.065,hand,[0,.51,0]);
const fingers=[];
for(const sign of [-1,1]){const f=new THREE.Group();f.position.set(sign*.24,.63,0);hand.add(f);box(.17,.36,.29,.034,f,[0,.17,0]);box(.026,.28,.23,.013,f,[-sign*.084,.18,0],dark);box(.21,.13,.33,.02,f,[0,0,0],pale);for(const y of [-.027,.027])screw(f,0,y,.174);fingers.push(f);}
const dragTarget=mesh(new THREE.SphereGeometry(.42,16,12),new THREE.MeshBasicMaterial({visible:false}),wrist,[0,.54,0],false);dragTarget.userData.action='drag';pickables.push(dragTarget);
const cube=new THREE.Group();scene.add(cube);const glass=new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.2,roughness:.15,metalness:.05,depthWrite:false});const cubeShell=box(.31,.31,.31,.027,cube,[0,0,0],glass);cubeShell.remove(cubeShell.children[0]);const cubeEdges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.31,.31,.31)),new THREE.LineBasicMaterial({color:0x9da5a8,transparent:true,opacity:.6}));cube.add(cubeEdges);const core=box(.125,.125,.125,.023,cube,[0,0,0],orange.clone());lightMaterials.push(core.material);
const cradle=new THREE.Group();scene.add(cradle);cradle.position.set(-2*Math.cos(.2),.055,2*Math.sin(.2));cradle.rotation.y=.2;box(.6,.1,.6,.06,cradle,[0,0,0],pale);box(.37,.014,.37,.04,cradle,[0,.055,0],dark);
const home=new THREE.Vector2(-2.6,2.95),pickup=new THREE.Vector2(-3.05,1.025),drop=new THREE.Vector2(-2.0,1.095);
let target=home.clone(),current=home.clone(),powered=true,closed=false,held=false,dragging=false,sequence=null,frame=0,last=0,press=0,yaw=.2,targetYaw=.2;
cube.position.set(-3.05*Math.cos(.2),.17,3.05*Math.sin(.2));cube.rotation.set(0,.2,0);
function say(s){status.textContent=s;}
function active(){return document.body.dataset.product==='robot'&&!document.hidden&&document.body.dataset.paused!=='true';}
function solve(p){swivel.rotation.y=yaw;const a=poseFor(p.x,p.y);shoulder.rotation.z=a.shoulder;elbow.rotation.z=a.elbow;wrist.rotation.z=a.wrist;scene.updateMatrixWorld(true);stage.dataset.pose=[a.shoulder,a.elbow,a.wrist].join(',');}
function moveTarget(x,y){const p=limitTarget(x,y);target.set(p.x,p.y);updateState();}
function grip(){if(!powered)return;closed=!closed;document.querySelector('#robot-grip').setAttribute('aria-pressed',String(closed));if(closed){const center=hand.localToWorld(new THREE.Vector3(0,.825,0));if(center.distanceTo(cube.getWorldPosition(new THREE.Vector3()))<.24){hand.attach(cube);cube.position.set(0,.825,0);cube.rotation.set(0,0,0);held=true;say('已夹住方块');}else say('夹爪闭合');}else{if(held){scene.attach(cube);cube.rotation.set(0,.2,0);held=false;}say('夹爪打开');}updateState();}
function powerToggle(){powered=!powered;sequence=null;dragging=false;press=1;document.querySelector('#robot-power').setAttribute('aria-pressed',String(powered));if(!powered&&held){scene.attach(cube);held=false;closed=false;document.querySelector('#robot-grip').setAttribute('aria-pressed','false');}say(powered?'机械臂已启动':'机械臂已关闭');updateState();}
function reset(){sequence=null;if(held)scene.attach(cube);held=false;closed=false;cube.position.set(-3.05*Math.cos(.2),.17,3.05*Math.sin(.2));cube.rotation.set(0,.2,0);cube.rotation.set(0,.2,0);target.copy(home);targetYaw=.2;document.querySelector('#robot-grip').setAttribute('aria-pressed','false');say('已复位');updateState();}
function demo(){if(!powered)return;reset();sequence={step:0,start:performance.now()};say('开始抓取与放置');updateState();}
function updateState(){stage.dataset.powered=String(powered);stage.dataset.closed=String(closed);stage.dataset.held=String(held);stage.dataset.cycle=String(Boolean(sequence));stage.dataset.target=target.toArray().join(',');}
document.querySelector('#robot-power').onclick=powerToggle;document.querySelector('#robot-grip').onclick=()=>{sequence=null;grip();};document.querySelector('#robot-reset').onclick=reset;document.querySelector('#robot-cycle').onclick=demo;
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,span=aspect<.8?5.4/aspect:7.5;camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(stage);
document.addEventListener('productchange',()=>{if(active()){resize();start();}else{cancelAnimationFrame(frame);frame=0;release();sequence=null;updateState();}});
const dragPlane=new THREE.Plane(new THREE.Vector3(0,0,1),0),hit=new THREE.Vector3();
function cast(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);}
renderer.domElement.addEventListener('pointerdown',e=>{cast(e);const hits=raycaster.intersectObjects(pickables,false);if(!hits.length)return;renderer.domElement.focus({preventScroll:true});if(hits[0].object.userData.action==='power'){powerToggle();return;}if(!powered)return;sequence=null;dragging=true;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{cast(e);if(!dragging){renderer.domElement.style.cursor=raycaster.intersectObjects(pickables,false).length?'grab':'default';return;}dragPlane.normal.set(Math.sin(yaw),0,Math.cos(yaw));if(raycaster.ray.intersectPlane(dragPlane,hit))moveTarget(hit.x*Math.cos(yaw)-hit.z*Math.sin(yaw),hit.y+.54);});
function release(){dragging=false;renderer.domElement.style.cursor='default';}
renderer.domElement.addEventListener('pointerup',release);renderer.domElement.addEventListener('pointercancel',release);window.addEventListener('blur',release);
document.addEventListener('keydown',e=>{if(!active()||e.ctrlKey||e.metaKey||e.altKey||(e.target.closest('button')&&(e.key===' '||e.key==='Enter')))return;if(e.key===' '){e.preventDefault();if(!e.repeat){sequence=null;grip();}}else if(e.key.toLowerCase()==='p'&&!e.repeat)powerToggle();else if(e.key.toLowerCase()==='r'&&!e.repeat)reset();else if(e.key.startsWith('Arrow')&&powered){e.preventDefault();sequence=null;const d={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,.12],ArrowDown:[0,-.12]}[e.key];if(d)moveTarget(target.x+d[0],target.y+d[1]);}});
function runSequence(t){if(!sequence)return;const s=sequence;const paths=[{p:pickup,yaw:.2,wait:1300,act:()=>grip()},{p:new THREE.Vector2(-3.05,2.65),yaw:.2,wait:1000},{p:new THREE.Vector2(-2.0,2.65),wait:1100},{p:drop,wait:1100,act:()=>grip()},{p:new THREE.Vector2(-2.0,2.65),wait:1000},{p:home,wait:1100}];const item=paths[s.step];target.copy(item.p);targetYaw=item.yaw??.2;if(t-s.start>item.wait&&current.distanceTo(target)<.04&&Math.abs(yaw-targetYaw)<.005){item.act?.();s.step++;s.start=t;if(s.step===paths.length){sequence=null;say('抓取与放置完成');updateState();}}}
const frameGate=createFrameGate(stage);configurePreview(renderer,scene,stage);
function tick(t){frame=0;if(!active())return;if(!frameGate(t)){frame=requestAnimationFrame(tick);return;}const dt=Math.min((t-last)/1000||.016,.05);last=t;runSequence(t);if(powered){current.lerp(target,1-Math.exp(-dt*6));yaw=THREE.MathUtils.lerp(yaw,targetYaw,1-Math.exp(-dt*6));}solve(current);const gap=closed?.24:.36;fingers.forEach((f,i)=>f.position.x=THREE.MathUtils.lerp(f.position.x,(i?1:-1)*gap,1-Math.exp(-dt*16)));if(!held){const onTray=Math.abs(cube.position.x-cradle.position.x)<.22&&Math.abs(cube.position.z-cradle.position.z)<.22;cube.position.y=Math.max(onTray?.27:.17,cube.position.y-dt*2.4);}press=Math.max(0,press-dt*5);power.position.z=.822-press*.025;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;lightMaterials.forEach((m,i)=>{const pulse=powered?(reduced?1:.82+.18*Math.sin(t*.003-i*.7)):0;m.color.setHex(powered?0xf95800:0xa1a4a4);m.emissiveIntensity=powered?pulse*.7:0;});stage.dataset.cube=cube.getWorldPosition(new THREE.Vector3()).toArray().join(',');glow.visible=powered;renderer.render(scene,camera);frame=requestAnimationFrame(tick);}
function start(){if(!frame&&active()){last=performance.now();frame=requestAnimationFrame(tick);}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;release();}else start();});
solve(current);updateState();resize();start();







