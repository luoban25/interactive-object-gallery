const params=new URLSearchParams(location.search);
const modules={robot:'robot.js',charger:'charger.js',clock:'clock.js',controller:'controller.js',supply:'power-supply.js',tv:'television-3d.js'};
const name=params.get('product')||'tv';
const selected=name==='rack'||modules[name]?name:'tv';
document.body.dataset.product=selected;
document.body.classList.toggle('embedded',params.has('embed'));
if(params.has('embed')){
 if(params.has('preview'))document.body.dataset.paused='true';
 window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='gallery-visibility')return;document.body.dataset.paused=String(!e.data.visible);document.getElementById('rack').classList.toggle('paused',!e.data.visible);document.dispatchEvent(new Event('productchange'));});
 document.querySelector('.product-switch').remove();
 for(const id of ['rack','robot','charger','clock','controller','supply','tv'])document.getElementById(id+'-panel').hidden=id!==selected;
 if(selected==='rack')await import('./rack-engine.js?v=53');else await import('./'+modules[selected]+'?v=53');
}else{
 await import('./rack-engine.js?v=53');await import('./products.js?v=53');
 for(const file of Object.values(modules))await import('./'+file+'?v=53');
}


