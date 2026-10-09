import * as T from 'three';
const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
const context=canvas.getContext('2d'),pixels=context.createImageData(256,256);
for(let y=0;y<256;y++)for(let x=0;x<256;x++){
 const dx=Math.max(0,Math.abs(x/255-.5)-.27),dy=Math.max(0,Math.abs(y/255-.5)-.23),i=(y*256+x)*4;
 pixels.data[i]=255;pixels.data[i+1]=105;pixels.data[i+2]=10;pixels.data[i+3]=Math.round(Math.exp(-Math.hypot(dx,dy)*24)*100);
}
context.putImageData(pixels,0,0);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
export function backlight(parent,w,h,position,rotationX=0){
 const material=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
 const mesh=new T.Mesh(new T.PlaneGeometry(w*1.8,h*2),material);mesh.position.set(...position);mesh.rotation.x=rotationX;mesh.raycast=()=>{};parent.add(mesh);return material;
}

