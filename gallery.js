const works=[['computer','复古电脑'],['robot','机械臂'],['rack','服务器机架'],['charger','充电桩'],['clock','数字闹钟'],['controller','控制盒'],['supply','交流电源'],['tv','便携电视'],['arcade','迷你街机'],['network','设备连接场景'],['reference-rack','服务器机架 · 参考版'],['reference-lamp','发光台灯']];
const main=document.querySelector('main');
const viewer=document.createElement('dialog');viewer.className='viewer';viewer.setAttribute('aria-labelledby','viewer-title');
const viewerBar=document.createElement('header'),viewerTitle=document.createElement('h2');viewerTitle.id='viewer-title';
const closeButton=document.createElement('button');closeButton.type='button';closeButton.className='viewer-close';closeButton.textContent='×';closeButton.setAttribute('aria-label','退出作品，返回宫格，快捷键 Esc');closeButton.title='退出 · Esc';
const escapeHint=document.createElement('span');escapeHint.className='escape-hint';escapeHint.textContent='Esc 返回';
const viewerFrame=document.createElement('iframe');viewerFrame.className='viewer-frame';viewerFrame.title='放大查看作品';
viewerBar.append(viewerTitle,escapeHint,closeButton);viewer.append(viewerBar,viewerFrame);document.body.append(viewer);
let opener=null,savedScroll=0;
const loadQueue=[];let loadingFrame=null,loadScheduled=false;
function pump(){
 if(viewer.open||loadingFrame||loadScheduled||!loadQueue.length)return;loadScheduled=true;
 const load=()=>{loadScheduled=false;if(viewer.open||loadingFrame)return;let frame;while(loadQueue.length&&!frame){const next=loadQueue.shift();if(!next.dataset.loaded)frame=next;}if(!frame)return;loadingFrame=frame;frame.dataset.loaded='true';frame.src=frame.dataset.src;};
 if('requestIdleCallback'in window)requestIdleCallback(load,{timeout:500});else setTimeout(load,40);
}
function openWork(url,label,trigger){
 opener=trigger;savedScroll=scrollY;viewerTitle.textContent=label;viewerFrame.title=label+'，放大交互视图';viewerFrame.src=url+(url.includes('?')?'&':'?')+'embed=1&v=59';viewer.showModal();document.body.classList.add('viewing');
 document.querySelectorAll('.work iframe').forEach(frame=>send(frame,false));closeButton.focus({preventScroll:true});
}
function closeWork(){if(!viewer.open)return;viewer.close();}
closeButton.addEventListener('click',closeWork);
viewer.addEventListener('cancel',e=>{e.preventDefault();closeWork();});
viewer.addEventListener('click',e=>{if(e.target===viewer)closeWork();});
viewer.addEventListener('close',()=>{
 document.body.classList.remove('viewing');viewerFrame.src='about:blank';window.scrollTo({top:savedScroll,behavior:'instant'});opener?.focus({preventScroll:true});
 document.querySelectorAll('.work iframe').forEach(frame=>send(frame,frame.dataset.visible!=='false'));
 pump();
});
viewerFrame.addEventListener('load',()=>{
 if(!viewer.open||viewerFrame.src==='about:blank')return;
 const doc=viewerFrame.contentDocument;
 doc.addEventListener('keydown',e=>{if(e.key!=='Escape'||doc.querySelector('dialog[open]'))return;e.preventDefault();e.stopImmediatePropagation();closeWork();},true);
 const target=doc.querySelector('canvas,[tabindex="0"],.gallery-demo');target?.focus({preventScroll:true});
});
for(const [index,[id,label]]of works.entries()){
 const article=document.createElement('article');article.className='work';
 const url=id==='arcade'?'arcade.html':id==='network'?'network.html':id.startsWith('reference-')?'collection/references/'+id.slice(10)+'.html':id==='computer'?'collection/computer/index.html':'object.html?product='+id;
 const header=document.createElement('header'),title=document.createElement('h2'),number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');title.append(number,document.createTextNode(label));
 const link=document.createElement('a');link.href=url;link.textContent='↗';link.setAttribute('aria-label','放大查看'+label);link.title='放大查看 · Esc 返回';link.setAttribute('aria-haspopup','dialog');link.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();openWork(url,label,link);});header.append(title,link);
 const frame=document.createElement('iframe');frame.title=label+'，可交互';frame.dataset.src=url+(url.includes('?')?'&':'?')+'embed=1&preview=1&v=59';frame.dataset.visible='false';
 frame.addEventListener('load',()=>{if(!frame.dataset.loaded)return;send(frame,!viewer.open&&frame.dataset.visible==='true');if(loadingFrame===frame){loadingFrame=null;pump();}});
 article.append(header,frame);main.append(article);
}
function send(frame,visible){
 if(!frame.contentDocument?.head||frame.contentDocument.URL==='about:blank')return;
 const doc=frame.contentDocument;if(!doc.getElementById('gallery-pause-style')){const style=doc.createElement('style');style.id='gallery-pause-style';style.textContent='.gallery-paused *{animation-play-state:paused!important}';doc.head.append(style);}
 doc.documentElement.classList.toggle('gallery-paused',!visible);frame.contentWindow?.postMessage({type:'gallery-visibility',visible},location.origin);
}
const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.dataset.visible=String(entry.isIntersecting);send(entry.target,entry.isIntersecting&&!viewer.open)}},{threshold:.01});
const loadObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&!entry.target.dataset.loaded){loadQueue.push(entry.target);loadObserver.unobserve(entry.target);}}pump();},{rootMargin:'280px'});
document.querySelectorAll('.work iframe').forEach(frame=>{observer.observe(frame);loadObserver.observe(frame)});










