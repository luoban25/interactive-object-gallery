const preview=new URLSearchParams(location.search).has('preview');
export function createFrameGate(stage){
 let drawnAt=-Infinity,boostUntil=0;
 const boost=()=>{boostUntil=performance.now()+900;};
 for(const event of ['pointerdown','pointerup','click','wheel','keydown'])document.addEventListener(event,boost,{passive:true,capture:true});
 document.addEventListener('pointermove',e=>{if(e.buttons)boost();},{passive:true});
 stage.dataset.renderMode=preview?'preview':'full';
 return t=>{if(!preview)return true;const interval=t<boostUntil?15:32;if(t-drawnAt<interval)return false;drawnAt=t;return true;};
}
export function configurePreview(renderer,scene,stage){
 if(preview){renderer.setPixelRatio(Math.min(devicePixelRatio,1));scene.traverse(o=>{if(o.shadow?.mapSize)o.shadow.mapSize.set(1024,1024);});renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;}
 let shadowAt=-Infinity,total=0,reportedAt=0;const render=renderer.render.bind(renderer);
 renderer.render=(...args)=>{const now=performance.now();if(preview&&now-shadowAt>120){renderer.shadowMap.needsUpdate=true;shadowAt=now;}render(...args);total++;if(now-reportedAt>500){stage.dataset.renderCount=String(total);stage.dataset.pixelRatio=String(renderer.getPixelRatio());stage.dataset.shadowSize=preview?'1024':'2048';reportedAt=now;}};
}
