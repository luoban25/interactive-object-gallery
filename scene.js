/* Original parametric SVG artwork. No runtime dependencies or remote requests. */
(()=>{
const svg=document.querySelector('#scene');
const offsets={laptop:[-45,30],nas:[-30,-85],switch:[20,50],dock:[95,-90]};
const shift=id=>{const [x,y]=offsets[id];return `translate(${(x-y)*.86} ${(x+y)*.49})`};
const button=(id,label,content,attrs={})=>node('g',{id,role:'button',tabindex:0,'aria-label':label,...attrs},content);
const extraControls={laptop:'',nas:'',dock:''};
const P=(x,y,z=0)=>[720+(x-y)*.86,490+(x+y)*.49-z];
const point=p=>p.map(n=>n.toFixed(2)).join(',');
const node=(tag,attrs={},children='')=>`<${tag} ${Object.entries(attrs).map(([k,v])=>`${k}="${v}"`).join(' ')}>${children}</${tag}>`;
const rect=(x,y,w,h,fill='var(--front)',r=3,extra={})=>node('rect',{x,y,width:w,height:h,rx:r,fill,stroke:'var(--fine)','stroke-width':1.1,...extra});
const line=(x1,y1,x2,y2,extra={})=>node('line',{x1,y1,x2,y2,stroke:'var(--fine)','stroke-width':1.2,...extra});
const circle=(x,y,r,extra={})=>node('circle',{cx:x,cy:y,r,fill:'none',stroke:'var(--fine)','stroke-width':1,...extra});
function rounded(ps,r=9){let d='';ps.forEach((p,i)=>{const prev=ps[(i+ps.length-1)%ps.length],next=ps[(i+1)%ps.length];const step=q=>{let l=Math.hypot(q[0]-p[0],q[1]-p[1]);let s=Math.min(r/l,.25);return[p[0]+(q[0]-p[0])*s,p[1]+(q[1]-p[1])*s]};let a=step(prev),b=step(next);d+=`${i?'L':'M'}${point(a)}Q${point(p)} ${point(b)}`});return d+'Z'}
const face=(ps,fill,r=9)=>node('path',{d:rounded(ps,r),fill,stroke:'var(--edge)','stroke-width':1.5,class:'outline'});
const front=(x,y,z,content)=>node('g',{transform:`matrix(.86 .49 0 1 ${point(P(x,y,z)).replace(',',' ')})`},content);
const top=(x,y,z,content)=>node('g',{transform:`matrix(.86 .49 -.86 .49 ${point(P(x,y,z)).replace(',',' ')})`},content);
const side=(x,y,z,content)=>node('g',{transform:`matrix(.86 -.49 0 1 ${point(P(x,y,z)).replace(',',' ')})`},content);
function box(x,y,w,d,h,z=0){return face([P(x,y+d,z+h),P(x+w,y+d,z+h),P(x+w,y+d,z),P(x,y+d,z)],'url(#front)')+face([P(x+w,y+d,z+h),P(x+w,y,z+h),P(x+w,y,z),P(x+w,y+d,z)],'url(#side)')+face([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],'url(#top)')}
function shadow(x,y,w,d){return node('path',{d:rounded([P(x,y,0),P(x+w,y,0),P(x+w,y+d,0),P(x,y+d,0)],14),fill:'#6b6055',opacity:.13,filter:'url(#shadow)'})}
function device(id,label,content){return node('g',{id,class:'device',role:'group','aria-label':label,transform:shift(id)},button(id+'-action',label,content,{'data-action':id})+(extraControls[id]||''))}
let defs=`<defs><linearGradient id="top" x2="0.6" y2="1"><stop stop-color="var(--top)"/><stop offset="1" stop-color="var(--front)"/></linearGradient><linearGradient id="front" x2="1" y2=".2"><stop stop-color="var(--top)"/><stop offset="1" stop-color="var(--front)"/></linearGradient><linearGradient id="side" x2="1" y2="1"><stop stop-color="var(--front)"/><stop offset="1" stop-color="var(--side)"/></linearGradient><linearGradient id="display" x2="1" y2="1"><stop stop-color="#fffdfa"/><stop offset="1" stop-color="#fff5eb"/></linearGradient><filter id="shadow" x="-25%" y="-50%" width="150%" height="200%"><feGaussianBlur stdDeviation="8"/></filter><filter id="bloom" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter></defs>`;
// Rounded floor slab and inset screw heads.
let floor=box(-530,-470,1100,930,12,-18);
for(const [x,y] of [[-500,-440],[540,-440],[-500,430],[540,430]])floor+=top(x,y,-5,circle(0,0,6,{stroke:'var(--edge)'})+line(-2,0,2,0));
// Smooth floor routes; projecting before rounding keeps every bend on the floor.
// Network links terminate in the two occupied RJ45 sockets. Dock uses NAS USB.
const routes=[
 [[-130,135,7],[-100,135],[-100,310],[90,310],[90,415],[150,415],[150,370,6]],
 [[184,370,6],[184,437],[340,437],[340,-130],[125,-130],[125,-195],[105,-195,12]],
 [[105,-250,12],[180,-250],[180,-340],[550,-340],[550,-190],[530,-190,12]]
];
function cablePath(coords){const pts=coords.map(([x,y,z=5])=>P(x,y,z));let d=`M${point(pts[0])}`;for(let i=1;i<pts.length-1;i++){let p=pts[i],a=pts[i-1],b=pts[i+1],dist1=Math.hypot(p[0]-a[0],p[1]-a[1]),dist2=Math.hypot(p[0]-b[0],p[1]-b[1]),r=Math.min(24,dist1*.35,dist2*.35);let q=[p[0]+(a[0]-p[0])*r/dist1,p[1]+(a[1]-p[1])*r/dist1],s=[p[0]+(b[0]-p[0])*r/dist2,p[1]+(b[1]-p[1])*r/dist2];d+=`L${point(q)}Q${point(p)} ${point(s)}`}return d+`L${point(pts.at(-1))}`}
let cables=routes.map((route,i)=>{let d=cablePath(route);return node('g',{class:'cable',id:`cable-${i}`},node('path',{d,fill:'none',stroke:'var(--accent)','stroke-width':15,opacity:.13,filter:'url(#bloom)'})+node('path',{d,fill:'none',stroke:'#c8b29d','stroke-width':9,opacity:.22,transform:'translate(0 3)'})+node('path',{d,fill:'none',stroke:'var(--accent)','stroke-width':7,'stroke-linejoin':'round','stroke-linecap':'round'})+node('path',{d,fill:'none',stroke:'#ffbd76','stroke-width':3.7})+node('path',{d,class:'signal'}))}).join('');
let clips='';for(const [x,y] of [[340,205],[550,-270],[-100,220]])clips+=box(x-7,y-9,14,18,12)+top(x-4,y-8,12,rect(0,0,8,16,'var(--recess)',1));
// NAS: recessed front, separate removable trays, seam lines, vents and indicator rail.
let nas=shadow(-100,-285,235,210)+box(-100,-285,235,210,300);
let nf=rect(29,32,189,243,'#d2d2d2',8)+rect(34,36,179,234,'#8e8e8e',5);
for(let i=0;i<4;i++){let u=38+i*43;const tray=rect(u,40,39,226,'url(#front)',5,{class:'tray-face'})+rect(u+3,43,31,174,'#fbfbfb',3)+rect(u+7,214,25,41,'#a3a3a3',2)+rect(u+9,216,20,34,'#686b6b',1)+line(u+8,210,u+31,210)+circle(u+19,199,3.2,{class:'led'})+line(u+34,48,u+34,204,{stroke:'#ddd'});extraControls.nas+=front(-100,-75,300,button('tray-'+i,`选择第 ${i+1} 个存储盘位`,tray,{'data-tray':i,'aria-pressed':i===0?'true':'false',class:i===0?'tray selected':'tray'}));}
for(let i=0;i<4;i++)nf+=circle(15,55+i*25,1.8,{fill:'var(--ink)',stroke:'none'});
nas+=front(-100,-75,300,nf);
let vents='';for(let i=0;i<10;i++)vents+=line(38+i*6,42,38+i*6,115,{stroke:'#c4c4c4'});for(let i=0;i<7;i++)vents+=line(137+i*5,207,137+i*5,265,{stroke:'#c4c4c4'});
nas+=side(135,-75,300,vents);let nt='';for(let i=0;i<9;i++)nt+=line(119,35+i*6,197,35+i*6);nas+=top(-100,-285,300,nt);
nas+=side(135,-75,300,rect(25,278,21,17,'#7a7d7d',2)+rect(29,283,13,10,'#f19b51',1)+rect(83,283,17,10,'#7a7d7d',2)+rect(86,285,11,6,'#d3d3d3',1));
// Dual-drive dock, with two complete drives, stamped cover rings and screw details.
let dock=shadow(270,-190,165,155)+box(270,-190,165,155,67);
dock+=top(282,-178,68,rect(0,0,140,126,'#b2b3b3',9));
for(let i=0;i<2;i++){let y=-167+i*57;let h=rect(6,9,108,133,'url(#front)',6)+circle(60,66,43,{fill:'#e9e9e9'})+circle(60,66,12,{fill:'#f8f8f8'})+line(14,117,104,117);for(let [x,z]of [[14,17],[106,17],[14,131],[106,131]])h+=circle(x,z,2.4);extraControls.dock+=button('disk-'+i,`硬盘 ${i+1}：点击弹出或插入`,box(293,y,121,27,154,53)+front(293,y+27,207,h),{'data-disk':i,'aria-pressed':'false',class:'disk'});}
dock+=front(270,-35,67,circle(20,29,3,{class:'led'})+[52,65,78,91].map(x=>circle(x,44,1.8,{fill:'var(--ink)',stroke:'none'})).join(''));
dock+=side(435,-35,67,rect(58,50,15,12,'#757777',2)+rect(60,52,11,8,'#d3d3d3',1));
// Notebook lower deck, sculpted keyboard recess, individually generated keycaps.
let laptop=shadow(-385,-5,300,235)+box(-385,-5,300,235,13);
laptop+=box(-356,-16,35,15,8,13)+box(-149,-16,35,15,8,13);
let deck=rect(22,22,256,125,'#e2e3e3',6)+line(18,152,281,152,{stroke:'#ddd'});
const rows=[['Esc','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],['Caps','A','S','D','F','G','H','J','K','L',';','\'','Enter'],['Shift','Z','X','C','V','B','N','M',',','.','/','↑','Shift'],['Ctrl','Alt','←','Space','→','↓','Send']];
let keys='';rows.forEach((row,r)=>row.forEach((label,c)=>{const x=r===4?[27,47,67,87,197,217,237][c]:27+c*17.5,y=27+r*23,w=label==='Space'?106:label==='Enter'?32:18-2;const key=label==='⌫'?'Backspace':label==='Esc'?'Escape':label==='Space'?' ':label==='Send'?'Enter':label==='←'?'ArrowLeft':label==='→'?'ArrowRight':label==='↑'?'ArrowUp':label==='↓'?'ArrowDown':label;keys+=button('key-'+r+'-'+c,label,rect(x,y,w,19,label==='Space'?'#ffad62':'#fcfcfc',2,{class:'key-face',stroke:'#a7a7a7'})+node('text',{x:x+w/2,y:y+12,fill:'#8a8a8a','text-anchor':'middle','font-size':label.length>2?4.5:6,'font-family':'Arial,sans-serif','pointer-events':'none'},label==='Space'?'':label),{'data-key':key,class:'key',tabindex:r===0&&c===0?0:-1});}));
extraControls.laptop+=top(-385,-5,14,keys+button('touchpad','触控板：放大或还原笔记本',rect(102,168,97,48,'#f2f2f2',6),{'data-inspect':'true'}));
laptop+=top(-385,-5,14,deck);
// Screen leans backward: one affine plane, so every card follows the same perspective.
const screenOrigin=P(-385,-16,22),screenMatrix=`matrix(.86 .49 -.21 1.12 ${screenOrigin[0]+46.2} ${screenOrigin[1]-246.4})`;
let display=rect(0,0,300,220,'#e9e9e9',9,{stroke:'var(--edge)','stroke-width':1.7,class:'outline'})+rect(7,7,286,204,'#fefefe',5,{stroke:'#aaa'})+rect(17,19,266,181,'url(#display)',2,{stroke:'none'})+circle(150,5,1.4,{fill:'#999',stroke:'none'});
display+=rect(24,27,53,163,'#fff4e8',4,{stroke:'none'})+node('text',{x:35,y:66,fill:'var(--accent)','font-family':'Arial,sans-serif','font-size':28,'font-weight':750,stroke:'none'},'AI');for(let i=0;i<4;i++)display+=circle(33,88+i*22,2.3,{class:'led'})+rect(41,85+i*22,26-(i%2)*6,5,'#ffcfab',2,{stroke:'none'});
display+=rect(85,27,112,81,'#fff8f0',5,{stroke:'#ffddbf'})+rect(204,27,69,81,'#fff8f0',5,{stroke:'#ffddbf'})+rect(85,116,112,74,'#fffdf9',5,{stroke:'#ffddbf'})+rect(204,116,69,74,'#fffdf9',5,{stroke:'#ffddbf'});
display+=node('path',{d:'M96 86L96 73Q112 44 130 70T162 69T186 64L186 94Z',fill:'#ffcc9f',stroke:'#ffa65c','stroke-width':1,class:'screen-chart'})+circle(238,68,17,{stroke:'#ffdcc0','stroke-width':8})+node('path',{d:'M238 51A17 17 0 0 1 255 68',fill:'none',stroke:'var(--accent)','stroke-width':8,class:'screen-chart'});
display+=rect(85,116,188,74,'#fffdf9',5,{stroke:'#ffddbf'})+node('text',{id:'screen-mode',x:94,y:132,fill:'#cf7a3a','font-size':7,'font-family':'monospace'},'TYPE · ENTER TO SEND')+node('text',{id:'screen-input',x:94,y:151,fill:'#606060','font-size':11,'font-family':'monospace','xml:space':'preserve'},'')+line(94,166,260,166,{stroke:'#ece3db'})+node('text',{id:'screen-result',x:94,y:180,fill:'#aaa','font-size':7,'font-family':'monospace'},'READY / DRIVE 01');
laptop+=node('g',{transform:screenMatrix},display);
laptop+=side(-85,230,13,rect(116,3,18,7,'#727575',1));
// Low network switch: recessed sockets, contact pins, locking connectors and cooling slots.
let sw=shadow(50,165,285,155)+box(50,165,285,155,70);
let sf='';for(let i=0;i<6;i++){let x=65+i*34;sf+=rect(x,27,29,28,'#a6a6a6',2)+node('path',{d:`M${x+4} 31h6v-3h9v3h6v18h-21Z`,fill:'#5d6060',stroke:'none'});for(let j=0;j<6;j++)sf+=line(x+7+j*2.6,34,x+7+j*2.6,38,{stroke:'#bdb7a6','stroke-width':.7});if(i<2)sf+=rect(x+3,34,24,20,'#ff8d36',3,{stroke:'#ee751d'})+rect(x+7,35,16,5,'#ffc07d',1,{stroke:'none'})+rect(x+8,48,14,16,'#ffac59',2,{stroke:'#e47b29'})}
for(let r=0;r<2;r++)for(let c=0;c<3;c++)sf+=circle(15+c*10,27+r*12,1.6,{class:r===0?'led':'',fill:r?'#aaa':'var(--accent)',stroke:'none'});sw+=front(50,320,70,sf);let st='';for(let i=0;i<12;i++)st+=line(45,24+i*7,234,24+i*7);sw+=top(50,165,70,st);sw+=side(335,320,70,line(18,30,134,30,{stroke:'#d0d0d0'})+line(18,45,134,45,{stroke:'#d0d0d0'}));
// DOM order follows the actual workflow so Tab navigation is predictable.
svg.innerHTML=defs+'<g transform="translate(129 110) scale(.80)">'+node('g',{id:'floor'},floor)+cables+node('g',{id:'clips'},clips)+device('laptop','笔记本：点击放大，输入文字并按 Enter 上传',laptop)+device('switch','交换机：点击检查网络连接；再次点击停止',sw)+device('nas','NAS：点击读取到笔记本；再次点击停止',nas)+device('dock','硬盘座：点击备份到 NAS；再次点击停止',dock)+'</g>';
})();

