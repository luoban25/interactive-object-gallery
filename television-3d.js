import {createFrameGate,configurePreview} from './preview-performance.js?v=53';
import * as T from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {backlight} from './series-lighting.js';
import {createTelevisionScreen} from './tv-screen.js?v=38';
const stage=document.getElementById('tv-stage'),status=document.getElementById('tv-status');
const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xffffff,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;stage.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','便携电视。点击电源，拖动或滚动 VHF 换频道、UHF 调信号，拖动天线伸缩。P 开关，左右键换台，上下键微调，A 天线，R 复位。');
const scene=new T.Scene(),camera=new T.OrthographicCamera(-5,5,4,-4,.1,45);camera.position.set(8,7.7,10);camera.lookAt(0,2.6,0);
scene.add(new T.HemisphereLight(0xffffff,0xdcd9d2,1.7));const key=new T.DirectionalLight(0xffffff,1.8);key.position.set(-5,10,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:9,bottom:-4,near:.1,far:30});key.shadow.normalBias=.035;key.shadow.bias=-.0001;key.shadow.radius=4;scene.add(key);const fill=new T.DirectionalLight(0xffffff,.65);fill.position.set(8,5,7);scene.add(fill);
const white=new T.MeshStandardMaterial({color:0xf1eee8,roughness:.75,metalness:.12}),grey=new T.MeshStandardMaterial({color:0x999c94,roughness:.65,metalness:.25}),dark=new T.MeshStandardMaterial({color:0x3b3e36,roughness:.75}),metal=new T.MeshStandardMaterial({color:0xbcc0b4,roughness:.45,metalness:.55});
const edge=new T.LineBasicMaterial({color:0x64685b});
const hullMaterial=new T.ShaderMaterial({side:T.BackSide,uniforms:{ink:{value:new T.Color(0x7a7d71)}},vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*.004,1.);}',fragmentShader:'uniform vec3 ink;void main(){gl_FragColor=vec4(ink,1.);}'});
const body=new T.Group();scene.add(body);
function mesh(g,m,p=[0,0,0],parent=body,outline=true){const o=new T.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(outline){const hull=new T.Mesh(g,hullMaterial);hull.raycast=()=>{};o.add(hull);const e=new T.LineSegments(new T.EdgesGeometry(g,27),edge);e.raycast=()=>{};o.add(e);}return o;}
function box(w,h,d,r,mat,p,parent=body){return mesh(new RoundedBoxGeometry(w,h,d,3,r),mat,p,parent);}
function line(points,parent=body){parent.add(new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),edge));}
function round(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
function contour(w,h,r,x,y,z){const pts=round(w,h,r).getPoints(64).map(p=>new T.Vector3(p.x+x,p.y+y,z));body.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts),edge));}
box(6,4.50,2.4,.17,white,[0,2.48,0]);
mesh(new T.ExtrudeGeometry(round(5.96,4.46,.22),{depth:.045,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:32}),white,[0,2.48,1.2]);
contour(5.94,4.44,.22,0,2.48,1.267);
line([[-2.78,4.735,.86],[2.77,4.735,.86],[3.006,4.55,.86],[3.006,.47,.86]]);line([[3.006,.48,-1.02],[3.006,4.48,-1.02]]);
for(const x of [-2.4,2.4])for(const z of [-.8,.85])box(.42,.20,.46,.065,dark,[x,.18,z]);
// A real opening in the handle, with separate legs and a rear edge.
const handleShape=new T.Shape();handleShape.moveTo(-1.52,0);handleShape.lineTo(-1.52,.52);handleShape.quadraticCurveTo(-1.52,.77,-1.27,.77);handleShape.lineTo(1.27,.77);handleShape.quadraticCurveTo(1.52,.77,1.52,.52);handleShape.lineTo(1.52,0);handleShape.lineTo(1.26,0);handleShape.lineTo(1.26,.44);handleShape.quadraticCurveTo(1.26,.51,1.18,.51);handleShape.lineTo(-1.18,.51);handleShape.quadraticCurveTo(-1.26,.51,-1.26,.44);handleShape.lineTo(-1.26,0);handleShape.closePath();
mesh(new T.ExtrudeGeometry(handleShape,{depth:.22,bevelEnabled:true,bevelSize:.045,bevelThickness:.045,bevelSegments:3,curveSegments:24}),white,[0,4.70,-.22]);
for(const x of [-1.40,1.40])box(.40,.055,.40,.025,grey,[x,4.736,-.12]);
// Concentric frame profiles leave the glass visible and inset.
function bezelFrame(w,h,r,innerW,innerH,innerR,mat,z){const s=round(w,h,r);s.holes.push(new T.Path(round(innerW,innerH,innerR).getPoints(64).reverse()));return mesh(new T.ExtrudeGeometry(s,{depth:.055,bevelEnabled:true,bevelSize:.016,bevelThickness:.016,bevelSegments:3,curveSegments:32}),mat,[-.54,2.48,z]);}
bezelFrame(4.65,3.94,.80,4.46,3.77,.72,grey,1.269);bezelFrame(4.49,3.80,.73,4.14,3.45,.58,dark,1.320);
const screenData=createTelevisionScreen();
const crtDepth=.58;
function crtHeight(r){return crtDepth*(Math.sqrt(1-.92*r*r)-Math.sqrt(.08))/(1-Math.sqrt(.08));}
// Concentric tessellation gives the CRT glass actual depth and smooth normals.
// The rim stays seated in the bezel while the centre projects forwards.
function crtGeometry(){
 const boundary=round(4.14,3.45,.58).getSpacedPoints(160).slice(0,-1),segments=boundary.length,rings=28;
 const positions=[0,0,crtDepth],uvs=[.5,.5],indices=[];
 for(let ring=1;ring<=rings;ring++){const r=ring/rings;for(const p of boundary){const x=p.x*r,y=p.y*r;positions.push(x,y,crtHeight(r));uvs.push((x+2.07)/4.14,(y+1.725)/3.45);}}
 for(let i=0;i<segments;i++)indices.push(0,1+i,1+(i+1)%segments);
 for(let ring=1;ring<rings;ring++)for(let i=0;i<segments;i++){const next=(i+1)%segments,a=1+(ring-1)*segments+i,b=1+(ring-1)*segments+next,c=1+ring*segments+i,d=1+ring*segments+next;indices.push(a,c,b,b,c,d);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
const screenGeometry=crtGeometry();
const screenMaterial=new T.MeshStandardMaterial({map:screenData.texture,emissiveMap:screenData.texture,emissive:0xffffff,emissiveIntensity:.38,roughness:.32,metalness:0});const screen=mesh(screenGeometry,screenMaterial,[-.54,2.48,1.333],body,false);
const glass=new T.MeshPhysicalMaterial({color:0xffe2b2,transparent:true,opacity:.16,roughness:.13,metalness:0,clearcoat:1,clearcoatRoughness:.09,depthWrite:false});mesh(screenGeometry,glass,[-.54,2.48,1.340],body,false);
// A narrow curved reflection follows the same surface instead of floating above it.
const reflection=[];for(let i=18;i<=66;i++){const p=round(4.14,3.45,.58).getPoint(i/160),r=.94;reflection.push(new T.Vector3(p.x*r-.54,p.y*r+2.48,1.345+crtHeight(r)));}
body.add(new T.Line(new T.BufferGeometry().setFromPoints(reflection),new T.LineBasicMaterial({color:0xfff8e8,transparent:true,opacity:.32})));
function label(text,w,h,p){const c=document.createElement('canvas'),cx=c.getContext('2d');cx.font='48px Arial';c.width=Math.ceil(cx.measureText(text).width)+12;c.height=64;cx.font='48px Arial';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle='#70766a';cx.fillText(text,c.width/2,32);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();return mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}),p,body,false);}
function cylinder(r,length,mat,p,parent=body){const o=mesh(new T.CylinderGeometry(r,r,length,64),mat,p,parent);o.rotation.x=Math.PI/2;return o;}
const knobs=[];for(const [name,y]of [['channel',3.52],['fine',2.47]]){
 cylinder(.345,.065,grey,[2.32,y,1.280]);const g=new T.Group();g.position.set(2.32,y,1.342);body.add(g);const drum=cylinder(.298,.225,dark,[0,0,.077],g);
 for(let i=0;i<26;i++){const a=i/26*Math.PI*2;const rib=box(.025,.046,.18,.006,grey,[Math.sin(a)*.298,Math.cos(a)*.298,.078],g);rib.rotation.z=-a;}
 const front=cylinder(.281,.030,white,[0,0,.205],g);const pointerMat=new T.MeshStandardMaterial({color:0x68715c,emissive:0xff720e,emissiveIntensity:0});const mark=box(.025,.15,.008,.004,pointerMat,[0,.127,.225],g);const glow=backlight(body,.48,.48,[2.32,y,1.315]);label(name==='channel'?'VHF':'UHF',.32,.14,[2.32,y+.49,1.27]);knobs.push({name,g,front,drum,mark,glow,light:0});
}
const holes=new T.InstancedMesh(new T.CircleGeometry(.027,12),dark,42);holes.raycast=()=>{};body.add(holes);const matrix=new T.Matrix4();let n=0;for(let y=0;y<7;y++)for(let x=0;x<6;x++)holes.setMatrixAt(n++,matrix.makeTranslation(2.02+x*.118,1.94-y*.132,1.271));
cylinder(.220,.028,grey,[2.32,.65,1.28]);cylinder(.187,.037,dark,[2.32,.65,1.302]);
const powerGroup=new T.Group();powerGroup.position.set(2.32,.65,1.370);body.add(powerGroup);const powerMaterial=new T.MeshPhysicalMaterial({color:0x7e1423,roughness:.20,metalness:0,transparent:true,opacity:.72,transmission:.28,thickness:.09,ior:1.46,clearcoat:1,clearcoatRoughness:.12,emissive:0xc91429,emissiveIntensity:.30});const powerCap=cylinder(.155,.185,powerMaterial,[0,0,0],powerGroup);const powerHalo=backlight(body,.56,.56,[2.32,.65,1.323]);powerHalo.color.setHex(0xff1828);powerHalo.blending=T.NormalBlending;
const buttonLight=new T.PointLight(0xff1024,0,1.5,2);buttonLight.position.set(2.32,.65,1.61);body.add(buttonLight);
const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;
const haloContext=haloCanvas.getContext('2d'),haloGradient=haloContext.createRadialGradient(64,64,10,64,64,64);
haloGradient.addColorStop(0,'rgba(255,16,36,.65)');haloGradient.addColorStop(.45,'rgba(255,16,36,.26)');haloGradient.addColorStop(1,'rgba(255,16,36,0)');haloContext.fillStyle=haloGradient;haloContext.fillRect(0,0,128,128);
powerHalo.map=new T.CanvasTexture(haloCanvas);powerHalo.map.colorSpace=T.SRGBColorSpace;powerHalo.color.setHex(0xffffff);powerHalo.needsUpdate=true;
// Antenna: nested cylinders have fixed bases and extend only along their own axis.
const antennaBase=mesh(new T.CylinderGeometry(.165,.19,.13,40),metal,[2.26,4.77,-.60]);
const antenna=new T.Group();antenna.position.set(2.26,4.85,-.60);antenna.rotation.z=-.22;body.add(antenna);
const rods=[];for(const r of [.064,.050,.037])rods.push(mesh(new T.CylinderGeometry(r,r,1,32),metal,[0,.5,0],antenna));
const tip=mesh(new T.CylinderGeometry(.080,.065,.095,32),metal,[0,2.35,0],antenna);
const ground=mesh(new T.PlaneGeometry(40,40),new T.ShadowMaterial({opacity:.09}),[0,.08,0],scene,false);ground.rotation.x=-Math.PI/2;ground.castShadow=false;ground.receiveShadow=true;
let powered=true,channel=0,fine=50,extension=100,elapsed=0,frame=0,last=0,lastPaint=0,drag=null,pressed=false,downUntil=0,flashUntil=0,powerLight=.65;
const ray=new T.Raycaster(),pointer=new T.Vector2();
function signal(){return Math.max(0,Math.min(100,100-Math.abs(fine-50)*1.65-(100-extension)*.62));}
function state(){Object.assign(stage.dataset,{powered:String(powered),channel:String(channel),fine:String(fine),antenna:String(extension),signal:signal().toFixed(0),projection:'orthographic-series',engine:'three-js'});document.getElementById('tv-toggle').setAttribute('aria-pressed',String(powered));screenMaterial.map=powered?screenData.texture:null;screenMaterial.emissiveMap=powered?screenData.texture:null;screenMaterial.emissiveIntensity=powered?.38:0;screenMaterial.color.setHex(powered?0xffffff:0x242820);screenMaterial.needsUpdate=true;knobs[0].g.rotation.z=-(channel*100-100)*Math.PI/180;knobs[1].g.rotation.z=-(fine-50)*2.4*Math.PI/180;lastPaint=0;
 const length=.80+(extension-35)/65*1.55,segment=(length-.12)/3;rods.forEach((r,i)=>{r.scale.y=segment+.05;r.position.y=.05+segment*i+(segment+.05)/2;});tip.position.y=length;}
function power(){powered=!powered;const now=performance.now();downUntil=now+220;flashUntil=powered?now+420:0;if(!powered){powerLight=0;powerMaterial.emissiveIntensity=0;powerMaterial.color.setHex(0x7e1423);powerHalo.opacity=0;buttonLight.intensity=0;}state();status.textContent=powered?'电视开机':'电视关机';}
function tune(value){fine=T.MathUtils.clamp(Math.round(value),0,100);state();status.textContent='UHF 微调 '+fine+'，信号 '+signal().toFixed(0)+'%';}
function change(value){channel=((Math.round(value)%3)+3)%3;state();status.textContent=['海湾日落','午夜灯塔','城市黄昏'][channel];}
function extend(value){extension=T.MathUtils.clamp(Math.round(value),35,100);state();}
function reset(){powered=true;channel=0;fine=50;extension=100;elapsed=0;downUntil=0;flashUntil=0;state();}
document.getElementById('tv-toggle').onclick=power;document.getElementById('tv-next').onclick=()=>change(channel+1);document.getElementById('tv-aerial').onclick=()=>extend(extension<70?100:35);document.getElementById('tv-reset').onclick=reset;
function cast(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects([powerCap,...knobs.flatMap(k=>[k.front,k.drum]),...rods,tip],false)[0]?.object;}
function nameOf(o){if(o===powerCap)return'power';if(rods.includes(o)||o===tip)return'aerial';return knobs.find(k=>k.front===o||k.drum===o)?.name;}
renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;const name=nameOf(cast(e));if(!name)return;renderer.domElement.focus();renderer.domElement.setPointerCapture(e.pointerId);drag={name,x:e.clientX,y:e.clientY,value:name==='channel'?channel:name==='fine'?fine:extension,moved:false};pressed=name==='power';});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag){renderer.domElement.style.cursor=cast(e)?'pointer':'default';return;}const delta=drag.name==='aerial'?drag.y-e.clientY:e.clientX-drag.x+drag.y-e.clientY;if(Math.abs(delta)>4)drag.moved=true;if(drag.name==='channel')change(drag.value+Math.round(delta/45));if(drag.name==='fine')tune(drag.value+delta*.6);if(drag.name==='aerial')extend(drag.value+delta*.4);});
renderer.domElement.addEventListener('pointerup',e=>{const d=drag,over=nameOf(cast(e));release();if(!d||d.moved||over!==d.name)return;if(d.name==='power')power();if(d.name==='channel')change(channel+1);if(d.name==='fine')tune(fine>=70?50:fine+5);if(d.name==='aerial')extend(extension<70?100:35);});
function release(){drag=null;pressed=false;}for(const event of ['pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,release);window.addEventListener('blur',release);
renderer.domElement.addEventListener('wheel',e=>{const name=nameOf(cast(e));if(name==='channel'||name==='fine'){e.preventDefault();name==='channel'?change(channel+(e.deltaY<0?1:-1)):tune(fine+(e.deltaY<0?1:-1));}},{passive:false});
function active(){return document.body.dataset.product==='tv'&&!document.hidden&&document.body.dataset.paused!=='true';}
document.addEventListener('keydown',e=>{if(!active()||e.ctrlKey||e.altKey||e.metaKey||e.target.closest('button,input,select'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(channel+(e.key==='ArrowRight'?1:-1));}else if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();tune(fine+(e.key==='ArrowUp'?1:-1));}else if(!e.repeat){if(e.key.toLowerCase()==='p'){power();}else if(e.key.toLowerCase()==='r')reset();else if(e.key.toLowerCase()==='a')extend(extension<70?100:35);}});
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const a=w/h,span=a<.8?7.8/a:9.0;camera.left=-span*a/2;camera.right=span*a/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(stage);
const frameGate=createFrameGate(stage);configurePreview(renderer,scene,stage);
function tick(t){frame=0;if(!active())return;if(!frameGate(t)){frame=requestAnimationFrame(tick);return;}const dt=Math.min((t-last)/1000||.016,.05);last=t;
 if(powered){elapsed+=dt;if(t-lastPaint>100){lastPaint=t;screenData.paint({elapsed,signal:signal(),channel});}}
 const down=pressed||t<downUntil,lit=powered&&(pressed||t<flashUntil);
 powerGroup.position.z=T.MathUtils.lerp(powerGroup.position.z,down?1.320:1.370,1-Math.exp(-dt*(down?45:18)));powerLight=powered?T.MathUtils.lerp(powerLight,lit?3.0:.30,1-Math.exp(-dt*(lit?42:14))):0;powerMaterial.emissiveIntensity=powerLight;powerHalo.opacity=Math.min(.95,powerLight*.80);buttonLight.intensity=powerLight*1.4;powerMaterial.color.setHex(0x7e1423);
 stage.dataset.powerDown=String(down);stage.dataset.powerLit=String(lit);stage.dataset.powerDepth=powerGroup.position.z.toFixed(4);
 knobs.forEach(k=>{const held=drag?.name===k.name;k.light=T.MathUtils.lerp(k.light,held?.40:0,1-Math.exp(-dt*14));k.mark.material.emissiveIntensity=k.light;k.glow.opacity=k.light*.50;});stage.dataset.powerGlow=powerLight.toFixed(3);stage.dataset.powerPressed=String(pressed);stage.dataset.elapsed=elapsed.toFixed(2);
 scene.updateMatrixWorld(true);camera.updateMatrixWorld();function coords(o){const p=o.getWorldPosition(new T.Vector3()).project(camera);return[(p.x+1)*stage.clientWidth/2,(1-p.y)*stage.clientHeight/2];}stage.dataset.controls=JSON.stringify({power:coords(powerCap),channel:coords(knobs[0].front),fine:coords(knobs[1].front),aerial:coords(rods[1]),tip:coords(tip)});
 renderer.render(scene,camera);frame=requestAnimationFrame(tick);}
function start(){if(active()&&!frame){resize();last=performance.now();frame=requestAnimationFrame(tick);}}
document.addEventListener('productchange',()=>{release();if(active())start();else{cancelAnimationFrame(frame);frame=0;}});document.addEventListener('visibilitychange',()=>{release();if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();});state();start();









