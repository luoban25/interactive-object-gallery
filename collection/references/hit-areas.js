// Small SVG controls need a filled hit area after scaling down into a card.
for(const id of ['lamp-switch','lamp-knob']){
 const control=document.getElementById(id);if(!control)continue;
 const b=control.getBBox(),hit=document.createElementNS('http://www.w3.org/2000/svg','rect');
 for(const [name,value]of Object.entries({x:b.x-2,y:b.y-2,width:b.width+4,height:b.height+4,fill:'transparent','pointer-events':'all'}))hit.setAttribute(name,value);
 control.append(hit);
}
