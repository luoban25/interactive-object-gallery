document.getElementById('computer-view')?.removeAttribute('hidden');
setTheme(true);
if(document.getElementById('computer-view')){
 const source=document.getElementById('demo'),button=document.createElement('button');button.className='gallery-demo';button.type='button';button.setAttribute('aria-label','播放或停止电脑输入演示');
 function syncDemo(){const running=source.textContent.includes('演示中');button.textContent=running?'■ 停止演示':'▶ 演示';button.setAttribute('aria-pressed',String(running));}
 button.addEventListener('click',()=>{if(source.textContent.includes('演示中'))cancelDemo();else source.click();syncDemo();});
 new MutationObserver(syncDemo).observe(source,{subtree:true,childList:true,characterData:true});document.body.append(button);syncDemo();
}
window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='gallery-visibility')return;document.getElementById('stage')?.classList.toggle('paused',!e.data.visible)});

