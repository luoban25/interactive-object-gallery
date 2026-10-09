import * as T from 'three';
export function createTelevisionScreen(){
const canvas=document.createElement('canvas');canvas.width=350;canvas.height=285;
const ctx=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);
texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;
function paint({elapsed,signal,channel}){const t=elapsed,quality=signal/100;const gradient=ctx.createLinearGradient(0,0,0,285);gradient.addColorStop(0,channel===1?'#733709':'#ff9a23');gradient.addColorStop(.60,'#ffb743');gradient.addColorStop(1,'#d66809');ctx.fillStyle=gradient;ctx.fillRect(0,0,350,285);
ctx.fillStyle='#ffe29b';ctx.beginPath();ctx.arc(116,106,23,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#e17612';ctx.beginPath();ctx.moveTo(0,118);for(let x=0;x<=350;x+=8)ctx.lineTo(x,119+Math.sin(x*.035)*13+Math.sin(x*.083)*5);ctx.lineTo(350,162);ctx.lineTo(0,162);ctx.fill();
ctx.fillStyle='#ffbf58';for(let i=0;i<7;i++){const x=((i*63+t*2)%420)-35,y=55+i%2*17;for(let j=0;j<5;j++)ctx.fillRect(Math.floor(x+j*5),y-Math.round(Math.sin(j)*5),8,4);}
ctx.fillStyle='#f48b18';ctx.fillRect(0,157,350,128);for(let i=0;i<80;i++){const x=(i*47+t*(1+i%3)*3)%350,y=159+i*19%123;ctx.fillStyle=i%4?'#ffc65e':'#ffdc87';ctx.fillRect(Math.floor(x),y,5+i%12,2);}
for(let i=0;i<30;i++){ctx.fillStyle=i%2?'#ffe39a':'#ffb83d';ctx.fillRect(99-i*.7+Math.sin(t+i)*4,159+i*3,12+i*1.4,2);}
ctx.fillStyle='#b6570b';ctx.beginPath();ctx.moveTo(173,179);ctx.lineTo(212,163);ctx.lineTo(350,174);ctx.lineTo(350,203);ctx.lineTo(173,193);ctx.fill();
for(let i=0;i<7;i++){const x=224+i*17,h=14+i%3*12;ctx.fillStyle='#a74b08';ctx.fillRect(x,180-h,13,h);ctx.beginPath();ctx.moveTo(x-2,180-h);ctx.lineTo(x+6,171-h);ctx.lineTo(x+15,180-h);ctx.fill();ctx.fillStyle='#ffc35e';ctx.fillRect(x+4,180-h+5,4,6);}
ctx.fillStyle='#b04e08';ctx.fillRect(299,130,9,47);ctx.beginPath();ctx.moveTo(295,132);ctx.lineTo(303,116);ctx.lineTo(312,132);ctx.fill();ctx.fillStyle='#ffc36e';ctx.fillRect(301,139,4,7);
if(channel===2){ctx.fillStyle='#9b4609';for(let i=0;i<5;i++){const x=15+i*22,h=20+i*5;ctx.fillRect(x,153-h,16,h);ctx.fillStyle='#ffd67d';for(let y=156-h;y<149;y+=8)ctx.fillRect(x+4,y,3,4);ctx.fillStyle='#9b4609';}}
const boatX=(t*5+64)%180;ctx.fillStyle='#a94a0a';ctx.beginPath();ctx.moveTo(boatX,184);ctx.lineTo(boatX+27,184);ctx.lineTo(boatX+23,190);ctx.lineTo(boatX+5,190);ctx.fill();ctx.fillRect(boatX+14,151,2,33);ctx.beginPath();ctx.moveTo(boatX+12,152);ctx.lineTo(boatX+12,179);ctx.lineTo(boatX,179);ctx.fill();ctx.fillStyle='#cf620e';ctx.beginPath();ctx.moveTo(boatX+17,156);ctx.lineTo(boatX+17,179);ctx.lineTo(boatX+26,179);ctx.fill();
ctx.fillStyle='#c36b15';for(let i=0;i<19;i++){const x=i*21,y=266-Math.sin(i)*8;ctx.fillRect(x,y,19,20);ctx.fillRect(x+4,y-7,11,9);}
// Large phosphor lettering sits inside the CRT texture and follows its curvature.
ctx.save();ctx.font='bold 140px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#ff8618';ctx.shadowBlur=15;ctx.fillStyle='#ffe6a4';ctx.fillText('404',175,148,292);ctx.restore();
ctx.globalAlpha=.11;ctx.fillStyle='#783308';for(let y=0;y<285;y+=3)ctx.fillRect(0,y,350,1);ctx.globalAlpha=1;
if(quality<.85){ctx.globalAlpha=(1-quality)*.55;for(let i=0;i<1300*(1-quality);i++){ctx.fillStyle=i%2?'#fff1b0':'#512d0b';ctx.fillRect(Math.random()*350,Math.random()*285,2+Math.random()*4,1);}ctx.globalAlpha=1;if(quality<.3){ctx.fillStyle='#5e350cc0';ctx.fillRect(55,118,240,39);ctx.fillStyle='#ffd891';ctx.font='14px monospace';ctx.fillText('WEAK SIGNAL / TUNE UHF',72,143);}}
if(channel===1){ctx.globalAlpha=.30;ctx.fillStyle='#381f17';ctx.fillRect(0,0,350,285);ctx.globalAlpha=1;}
texture.needsUpdate=true;}

return {texture,paint};}

