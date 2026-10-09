// Fixed planar work cell: keep the tool on the accessible side of the pedestal.
export const ARM={upper:2.05,fore:1.95,shoulderY:1.95,shoulderMin:-.9,shoulderMax:1.22,elbowMin:.12,elbowMax:2.42};
export const CELL={left:-3.35,right:-1.5,bottom:1.025,top:4.6};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function limitTarget(x,y){
 x=clamp(x,CELL.left,CELL.right);y=clamp(y,CELL.bottom,CELL.top);
 const dx=x,dy=y-ARM.shoulderY,d=Math.hypot(dx,dy),max=ARM.upper+ARM.fore-.035;
 if(d>max){x=dx*max/d;y=ARM.shoulderY+dy*max/d;}
 return {x,y};
}
export function poseFor(x,y){
 const p=limitTarget(x,y),dy=p.y-ARM.shoulderY,d2=p.x*p.x+dy*dy;
 const e=clamp(Math.acos(clamp((d2-ARM.upper**2-ARM.fore**2)/(2*ARM.upper*ARM.fore),-1,1)),ARM.elbowMin,ARM.elbowMax);
 const s=clamp(Math.atan2(-p.x,dy)-Math.atan2(ARM.fore*Math.sin(e),ARM.upper+ARM.fore*Math.cos(e)),ARM.shoulderMin,ARM.shoulderMax);
 return {shoulder:s,elbow:e,wrist:Math.PI-s-e};
}

