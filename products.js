export function showProduct(name){
 if(!['rack','robot','charger','clock','controller','supply','tv'].includes(name))return;
 document.body.dataset.product=name;
 for(const id of ['rack','robot','charger','clock','controller','supply','tv'])document.getElementById(id+'-panel').hidden=id!==name;
 document.querySelectorAll('[data-show]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.show===name)));
 document.getElementById('rack').classList.toggle('paused',name!=='rack');
 document.dispatchEvent(new CustomEvent('productchange',{detail:name}));
}
document.querySelectorAll('[data-show]').forEach(b=>b.addEventListener('click',()=>showProduct(b.dataset.show)));
showProduct(document.body.dataset.product||'tv');







