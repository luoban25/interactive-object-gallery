(()=>{
const svg=document.querySelector('#rack'),status=document.querySelector('#rack-status');
const P=(x,y,z=0)=>[720+(x-y)*.86,820+(x+y)*.49-z];
const n=(tag,a={},c='')=>`<${tag} ${Object.entries(a).map(([k,v])=>`${k}="${v}"`).join(' ')}>${c}</${tag}>`;
const rect=(x,y,w,h,fill='#fafafa',r=2,a={})=>n('rect',{x,y,width:w,height:h,rx:r,fill,stroke:'#b6b8b8','stroke-width':.8,...a});
const line=(x1,y1,x2,y2,a={})=>n('line',{x1,y1,x2,y2,stroke:'#bfc2c2','stroke-width':1,...a});
const dot=(cx,cy,r=1.6,a={})=>n('circle',{cx,cy,r,fill:'#7b7e7e',...a});
const screw=(x,y)=>dot(x,y,2.2,{fill:'#fafafa',stroke:'#9ca0a0','stroke-width':.8})+line(x-1,y,x+1,y,{'stroke-width':.6});
function rounded(points,r=8){let d='';points.forEach((p,i)=>{const before=points[(i+points.length-1)%points.length],after=points[(i+1)%points.length];const towards=q=>{const dist=Math.hypot(q[0]-p[0],q[1]-p[1]),f=Math.min(r/dist,.2);return[p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f]};d+=(i?'L':'M')+towards(before).join(',')+'Q'+p.join(',')+' '+towards(after).join(',')});return d+'Z'}
const face=(ps,fill)=>n('path',{d:rounded(ps),fill,stroke:'#929696','stroke-width':1.5});
const plane=(x,y,z,mode,c)=>{const p=P(x,y,z);return n('g',{transform:`matrix(${mode==='top'?'.86 .49 -.86 .49':mode==='side'?'.86 -.49 0 1':'.86 .49 0 1'} ${p.join(' ')})`},c)};
const btn=(id,label,c,a={})=>n('g',{id,role:'button',tabindex:0,'aria-label':label,...a},c);
const label=(id,x,y,text,size=6)=>n('text',{id,x,y,fill:'#8d9292','font-size':size,'font-family':'monospace','pointer-events':'none'},text);
const perforation=(x,y,cols,rows,step=5,r=1.25)=>{let s='';for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)s+=dot(x+i*step,y+j*step,r,{class:'vent-hole'});return s};
const defs=`<defs><linearGradient id="rack-front"><stop stop-color="#fff"/><stop offset="1" stop-color="#ededed"/></linearGradient><linearGradient id="rack-side" x2="1" y2="1"><stop stop-color="#f9f9f9"/><stop offset="1" stop-color="#e9eaea"/></linearGradient><linearGradient id="rack-top" x2=".7" y2="1"><stop stop-color="#fdfdfd"/><stop offset="1" stop-color="#f2f2f2"/></linearGradient><linearGradient id="unit-top" x2="0" y2="1"><stop stop-color="#c5c8c8"/><stop offset="1" stop-color="#fafafa"/></linearGradient><filter id="rack-shadow" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="15"/></filter></defs>`;
let body=n('path',{d:rounded([P(-160,-110),P(160,-110),P(160,150),P(-160,150)]),fill:'#ccad94',opacity:.18,filter:'url(#rack-shadow)'});
// Feet are drawn before the enclosure; all faces share one projection.
for(const [x,y] of [[-125,125],[115,125],[115,-75]])body+=face([P(x,y,0),P(x+22,y,0),P(x+22,y,-10),P(x,y,-10)],'#c3c7c7');
body+=face([P(-140,130,690),P(140,130,690),P(140,130,0),P(-140,130,0)],'url(#rack-front)');
body+=face([P(140,130,690),P(140,-100,690),P(140,-100,0),P(140,130,0)],'url(#rack-side)');
body+=face([P(-140,-100,690),P(140,-100,690),P(140,130,690),P(-140,130,690)],'url(#rack-top)');
let top='';for(let i=0;i<18;i++)top+=line(65,39+i*6,235,39+i*6,{'stroke-width':1.2});for(const [x,y]of [[23,22],[257,22],[23,205],[257,205]])top+=screw(x,y);body+=plane(-140,-100,690,'top',top);
let side='';for(const y of [65,447])for(let i=0;i<15;i++)side+=line(48+i*7,y,48+i*7,y+124,{'stroke-width':1.1});for(const [x,y]of [[20,27],[205,27],[20,660],[205,660]])side+=screw(x,y);body+=plane(140,130,690,'side',side);
// Continuation of the shared projection kernel: every unit and switch is a solid.
const F=119,H=690;
function solid(x,y,z,w,d,h,cls=''){
 const f=(ps,fill)=>n('path',{d:rounded(ps,Math.min(3,h*.2)),fill,stroke:'#9a9f9f','stroke-width':.9,class:'control-face'});
 return n('g',{class:'solid '+cls},f([P(x+w,y+d,z+h),P(x+w,y,z+h),P(x+w,y,z),P(x+w,y+d,z)],'#c5cbcb')+f([P(x,y+d,z+h),P(x+w,y+d,z+h),P(x+w,y+d,z),P(x,y+d,z)],'url(#rack-front)')+f([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],'url(#rack-top)'));
}
function switch3d(id,label,x,y,w,h,command,idx=''){
 const bx=-140+x,bz=H-y-h;
 const surround=plane(bx-2,F,H-y+2,'front',rect(0,0,w+4,h+5,'#b6bcbc',3)+rect(2,2,w,h+1,'#697575',2));
 const cap=n('g',{class:'physical-cap'},solid(bx,F,bz,w,5,h,'cap-solid')+plane(bx,F+5,H-y,'front',rect(1,1,w-2,h-2,'url(#cap-orange)',2,{class:'cap-color',stroke:'none'})+line(w/2,3,w/2,h*.45,{stroke:'#fff','stroke-width':1.2})+n('path',{d:`M${w*.3} ${h*.32}A${w*.24} ${h*.25} 0 1 0 ${w*.7} ${h*.32}`,fill:'none',stroke:'#fff','stroke-width':1})));
 return btn(id,label,surround+cap,{'data-command':command,'data-module':idx,class:'physical-button','aria-pressed':'true'});
}
const specs=[{y:80,h:52,name:'网络交换层 A'},{y:142,h:52,name:'网络交换层 B'},{y:210,h:72,name:'计算模块 A'},{y:289,h:101,name:'存储模块'},{y:397,h:72,name:'散热模块'},{y:476,h:81,name:'计算模块 B'},{y:565,h:70,name:'总电源'}];
let frame=rect(15,17,250,655,'#fafafa',5,{stroke:'#8f9494','stroke-width':1.2})+rect(30,34,232,622,'#171f24',4);
for(const y of [57,578])frame+=rect(2,y,8,25,'#f5f5f5',2,{stroke:'#909595'})+line(6,y+2,6,y+23);
const handle=btn('inspect-rack','把手：放大内部或还原',plane(-140,130,H,'front',rect(255,361,10,48,'#fafafa',3,{class:'control-face'})+rect(258,369,4,32,'#c0c8c8',2)),{'data-command':'inspect'});
const parts=[];
specs.forEach((s,i)=>{
 let detail='',controls='';
 if(i<2){
  for(let j=0;j<20;j++){const x=56+(j%10)*13,y=s.y+17+Math.floor(j/10)*12,id=i*20+j;detail+=btn('port-'+id,`${s.name}，端口 ${j+1}，切换连接`,rect(x,y,9,8,(i===0?j===19:[7,8,9,18,19].includes(j))?'#ffab66':'#646c6c',1,{class:'socket control-face'})+line(x+2,y+2,x+7,y+2,{stroke:'#d3d2c8','stroke-width':.5})+dot(x+7,y-2,1.3,{class:'port-led',style:`--phase:${j*.07+i*.12}s;--boot:${.25+i*.3}s`}),{class:(i===0?j===19:[7,8,9,18,19].includes(j))?'port active':'port','data-port':id,'aria-pressed':(i===0?j===19:[7,8,9,18,19].includes(j))?'true':'false',tabindex:id===0?0:-1});}
  for(let j=0;j<3;j++)detail+=dot(199+j*8,s.y+20,2,{class:'status-led',style:`--phase:${j*.25}s;--boot:${.25+i*.3}s`});
 }
 if(i===2){detail+=perforation(58,224,29,7,4.7,1.15);for(let j=0;j<3;j++)detail+=rect(200,223+j*13,23,9,'#f6f6f6',1)+rect(201,224+j*13,7,7,'#ff9742',1,{class:'status-led',stroke:'none'});detail+=label('compute-readout',58,276,'READY',5.5)}
 if(i===3){
  for(let j=0;j<8;j++){
   const x=57+j*21,bx=-140+x,bz=H-381;
   const drive=solid(bx,F,bz,18,6,75)+plane(-140,F+6,H,'front',rect(x+3,310,11,64,'#969e9e',2)+rect(x+4,316,8,53,'#b6bdbd',1)+rect(x+4,309,10,7,'#ff9951',1,{class:'drive-led',stroke:'none',style:`--phase:${j*.16}s;--boot:${.8+j*.1}s`})+line(x+6,320,x+6,363,{stroke:'#e4e8e8'})+line(x+13,320,x+13,363,{stroke:'#777f7f'})+rect(x+4,367,9,6,'#e7eaea',1)+label('',x+7,379,String(j+1),4));
   controls+=btn('rack-drive-'+j,`硬盘 ${j+1}：弹出或插入`,drive,{class:'drive physical-drive','data-drive':j,'aria-pressed':'false'});
  }
  detail+=dot(58,298,2.2,{class:'status-led'})+label('disk-readout',68,300,'08 / ONLINE',6);
 }
 if(i===4){detail+=btn('fan-boost','散热：标准或增强模式',perforation(58,408,29,8,4.7,1.15)+rect(198,435,22,18,'transparent',3,{class:'control-face',stroke:'none'})+dot(209,444,5,{class:'status-led'}),{'data-command':'fan','aria-pressed':'false'})}
 if(i===5){detail+=perforation(58,489,27,7,5,1.65)+rect(199,489,24,53,'#e5e8e8',2);for(let j=0;j<2;j++)detail+=rect(202,492+j*22,18,18,'#919999',2)+rect(204,494+j*22,6,13,'#ffa158',1,{class:'status-led'})}
 if(i===6){for(let j=0;j<9;j++)detail+=rect(57,580+j*4.7,134,2.3,'#d5dada',.8,{stroke:'#a4abab','stroke-width':.45});detail+=rect(201,611,24,11,'#dedede',1)+label('power-readout',57,630,'POWER / ON',5.5);controls+=switch3d('rack-power','总电源：开机或关机',200,580,25,22,'power')}
 else controls+=switch3d('unit-power-'+i,s.name+'：独立开关',218,s.y+s.h-12,9,8,'module',i);
 parts.push(n('g',{id:'rack-unit-'+i,class:'rack-unit',role:'group','aria-label':s.name,'data-unit':i},solid(-94,-38,H-s.y-s.h,187,157,s.h)+plane(-140,F,H,'front',detail)+controls));
});
// Dedicated right-hand cable bundle: staggered exits, parallel lanes and ordered branches.
const connections=[
 {port:19,source:0,target:1,lane:235,ty:145},
 {port:27,source:1,target:2,lane:238,ty:223},
 {port:28,source:1,target:3,lane:241,ty:297},
 {port:29,source:1,target:4,lane:244,ty:412},
 {port:38,source:1,target:5,lane:247,ty:484},
 {port:39,source:1,target:6,lane:250,ty:573}
];
let harness='';
connections.forEach((link,i)=>{
 const k=link.port%20,bank=Math.floor(link.port/20),sx=60.5+(k%10)*13,topEdge=specs[bank].y+17+Math.floor(k/10)*12;
 const lower=k>=10,sy=topEdge+(lower?8:0),ey=lower?(i===0?138:200+(i-4)*3):(153-(i-1)*3),sign=lower?1:-1,r=3,lx=link.lane,tx=219,ty=link.ty;
 const d=`M${sx} ${sy}V${ey-sign*r}Q${sx} ${ey} ${sx+r} ${ey}H${lx-r}Q${lx} ${ey} ${lx} ${ey+r}V${ty-r}Q${lx} ${ty} ${lx-r} ${ty}H${tx}`;
 harness+=n('g',{class:'patch managed-cable',id:'patch-'+i,'data-port':link.port,'data-source':link.source,'data-target':link.target},
  n('path',{d,class:'cable-shadow',fill:'none',stroke:'#d9c7b6','stroke-width':3.6,transform:'translate(0 1)',opacity:.3})+
  n('path',{d,class:'patch-wire'})+n('path',{d,class:'wire-core'})+n('path',{d,class:'wire-signal'})+
  rect(sx-3,sy-2,6,4,'#ffb16c',1,{class:'cable-plug',stroke:'#e68e49'})+
  rect(tx-10,ty-5,14,10,'#747f7f',1,{stroke:'#a6adad'})+rect(tx-6,ty-3,10,6,'#ffad63',1,{class:'cable-plug',stroke:'#e78a42'}));
});
const clip=n('path',{d:rounded([P(-110,130,656),P(122,130,656),P(122,130,34),P(-110,130,34)],4)});
const definitions=defs.replace('</defs>',`<linearGradient id="cap-orange" x2="0" y2="1"><stop stop-color="#ffc888"/><stop offset="1" stop-color="#f17b24"/></linearGradient><linearGradient id="module-front" x2="1" y2=".2"><stop stop-color="#3c454d"/><stop offset="1" stop-color="#2b333a"/></linearGradient><linearGradient id="module-top" x2=".7" y2="1"><stop stop-color="#505a63"/><stop offset="1" stop-color="#38434b"/></linearGradient><linearGradient id="front-glass" x2="1" y2=".7"><stop stop-color="#e1f0fa" stop-opacity=".09"/><stop offset=".4" stop-color="#eaf5ff" stop-opacity=".015"/><stop offset="1" stop-color="#a3b9cb" stop-opacity=".08"/></linearGradient><clipPath id="rack-interior">${clip}</clipPath></defs>`);
const glass=n('g',{id:'front-glass-pane','aria-hidden':'true','pointer-events':'none'},
 plane(-140,134,H,'front',rect(20,22,240,645,'url(#front-glass)',5,{stroke:'#9aadb9','stroke-width':.75,'stroke-opacity':.45})+
 n('path',{d:'M29 35H60L226 642H211Z',fill:'#fff',opacity:.075})+
 n('path',{d:'M234 37H246V647H239Z',fill:'#e7f5ff',opacity:.045})+
 n('path',{d:'M21 145V29Q21 23 27 23H89',fill:'none',stroke:'#fff','stroke-width':1.2,opacity:.65})+
 line(26,662,255,662,{stroke:'#d4e3ee','stroke-width':1,opacity:.6})),
 n('path',{d:rounded([P(120,130,H-22),P(120,134,H-22),P(120,134,H-667),P(120,130,H-667)],1),fill:'#b5cad9',opacity:.32,stroke:'#8fa3b2','stroke-width':.6}));
svg.innerHTML=definitions+body+plane(-140,130,H,'front',frame)+n('g',{id:'rack-interior-content','clip-path':'url(#rack-interior)'},parts.reverse().join('')+plane(-140,F,H,'front',harness))+glass+handle;
let powered=true,booting=false,bootTimer=null,boosted=false,inspect=false;
const modules=Array(6).fill(true),disks=Array(8).fill(true);
const say=t=>status.textContent=t;
function update(){
 const running=powered&&!booting;
 svg.dataset.state=!powered?'off':booting?'booting':'running';svg.classList.toggle('power-off',!powered);svg.classList.toggle('booting',booting);svg.classList.toggle('boosted',running&&modules[4]&&boosted);
 document.getElementById('rack-power').setAttribute('aria-pressed',String(powered));
 modules.forEach((on,i)=>{document.getElementById('rack-unit-'+i).classList.toggle('unit-off',!powered||!on);document.getElementById('unit-power-'+i).setAttribute('aria-pressed',String(on))});
 const diskCount=disks.filter(Boolean).length;
 const load=[2,3,5].filter(i=>modules[i]&&(i!==3||diskCount>0)).length;
 document.getElementById('compute-readout').textContent=!powered?'STANDBY':booting?'STARTING':`LOAD ${load}/3 · ${modules[4]&&boosted?'BOOST':'AUTO'}`;
 document.getElementById('disk-readout').textContent=String(diskCount).padStart(2,'0')+' / '+(booting?'INIT':powered&&modules[3]?'ONLINE':'OFFLINE');
 document.getElementById('power-readout').textContent='POWER / '+(booting?'BOOT':powered?'ON':'OFF');
 document.getElementById('fan-boost').setAttribute('aria-pressed',String(boosted));
 document.querySelectorAll('.patch').forEach(p=>{const port=+p.dataset.port,source=+p.dataset.source,target=+p.dataset.target;const live=running&&modules[source]&&(target===6||modules[target])&&document.getElementById('port-'+port).classList.contains('active');p.classList.toggle('active',live);p.classList.toggle('inactive',!live)});
 svg.style.setProperty('--traffic-speed',load===3?'500ms':load===2?'750ms':'1100ms');
}
function boot(){clearTimeout(bootTimer);booting=true;update();bootTimer=setTimeout(()=>{booting=false;bootTimer=null;update();say('启动完成')},2200)}
function act(b){
 const cmd=b.dataset.command;
 if(cmd==='power'){powered=!powered;clearTimeout(bootTimer);bootTimer=null;booting=false;if(powered)boot();else update();say(powered?'正在启动':'已关机');return}
 if(cmd==='module'){const i=+b.dataset.module;modules[i]=!modules[i];say(specs[i].name+(modules[i]?'已开启':'已关闭'))}
 if(cmd==='inspect'){inspect=!inspect;svg.setAttribute('viewBox',inspect?'440 185 355 670':'0 0 1440 1080');b.setAttribute('aria-pressed',String(inspect));return}
 if(cmd==='fan'){if(!powered||!modules[4]){say('请先开启散热模块');return}boosted=!boosted;say(boosted?'散热增强':'散热标准')}
 if(b.matches('.port')){b.classList.toggle('active');b.setAttribute('aria-pressed',String(b.classList.contains('active')))}
 if(b.matches('.drive')){const i=+b.dataset.drive;disks[i]=!disks[i];b.classList.toggle('ejected',!disks[i]);b.setAttribute('aria-pressed',String(!disks[i]));say(`硬盘 ${i+1} 已${disks[i]?'插入':'弹出'}`)}
 update();
}
const physicalButtons=[...document.querySelectorAll('.physical-button')];
const release=()=>physicalButtons.forEach(b=>b.classList.remove('is-down'));
physicalButtons.forEach(b=>{b.addEventListener('pointerdown',e=>{if(e.button!==0)return;b.classList.add('is-down');b.setPointerCapture(e.pointerId)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>b.classList.remove('is-down'))});
svg.addEventListener('click',e=>{const b=e.target.closest('[role="button"]');if(b)act(b)});
svg.addEventListener('keydown',e=>{const b=e.target.closest('[role="button"]');if(!b)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();if(e.repeat)return;b.classList.add('is-down');act(b)}if(b.matches('.port')&&e.key.startsWith('Arrow')){e.preventDefault();const i=+b.dataset.port,delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-10,ArrowDown:10}[e.key];document.querySelectorAll('.port').forEach(p=>p.tabIndex=-1);const next=document.getElementById('port-'+Math.max(0,Math.min(39,i+delta)));next.tabIndex=0;next.focus()}});
document.addEventListener('keydown',e=>{if(document.body.dataset.product!=='rack'||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;if(/^[1-6]$/.test(e.key)){e.preventDefault();const b=document.getElementById('unit-power-'+(+e.key-1));b.classList.add('is-down');act(b)}if(e.key.toLowerCase()==='p'){const b=document.getElementById('rack-power');b.classList.add('is-down');act(b)}if(e.key==='Escape'){inspect=false;svg.setAttribute('viewBox','0 0 1440 1080');document.getElementById('inspect-rack').setAttribute('aria-pressed','false');release()}});
document.addEventListener('keyup',release);window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{svg.classList.toggle('paused',document.hidden||document.body.dataset.product!=='rack');if(document.hidden)release()});update();boot();
})();

