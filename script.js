(() => {
const root=document.getElementById('optcalc5');if(!root||root.dataset.ready)return;root.dataset.ready='1';
const $=id=>root.querySelector('#'+id),NS='http://www.w3.org/2000/svg';
let type='Call',pos='Long',K=100,S=105,P=10,drag=null;
let xmin=40,xmax=160,ymin=-40,ymax=60;
const L=55,R=675,T=24,B=330,W=R-L;
const X=v=>L+(v-xmin)/(xmax-xmin)*W,Y=v=>B-(v-ymin)/(ymax-ymin)*(B-T);
const sx=x=>xmin+(x-L)/W*(xmax-xmin),sy=y=>ymax-(y-T)/(B-T)*(ymax-ymin);
const sgn=()=>pos==='Long'?1:-1;
const el=(tag,attrs,parent)=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));parent.appendChild(n);return n};
const fmt=n=>Number(n).toFixed(1);
const pay=x=>sgn()*((type==='Call'?Math.max(x-K,0):Math.max(K-x,0))-P);
function niceStep(range){const raw=range/6,p=Math.pow(10,Math.floor(Math.log10(raw))),v=raw/p;return(v<1.5?1:v<3.5?2:v<7.5?5:10)*p}
function autoFit(){
 const lo=Math.max(0,Math.min(K,S)-Math.max(20,(Math.max(K,S)-Math.min(K,S))*.7));
 const hi=Math.max(K,S)+Math.max(20,(Math.max(K,S)-Math.min(K,S))*.7);
 xmin=Math.floor(lo/10)*10;xmax=Math.ceil(hi/10)*10;if(xmax<=xmin)xmax=xmin+40;
 const vals=[pay(xmin),pay(xmax),pay(K),0],mn=Math.min(...vals),mx=Math.max(...vals),pad=Math.max(5,(mx-mn)*.2);
 ymin=Math.floor((mn-pad)/5)*5;ymax=Math.ceil((mx+pad)/5)*5;if(ymax-ymin<20){ymin-=10;ymax+=10}
}
function syncInputs(){
  // Keep the field currently being edited untouched so multi-digit values
  // can be entered naturally; update the other fields after graph dragging.
  const fields = [['inputK', K], ['inputS', S], ['inputP', P]];
  fields.forEach(([id, value]) => {
    const field = $(id);
    if (document.activeElement !== field) field.value = fmt(value);
  });
}
function setGreek(id,val){const n=$(id);n.textContent=val;n.classList.remove('positive','negative');n.classList.add(val.startsWith('+')?'positive':'negative')}
function draw(){
 $('grid').innerHTML='';$('markers').innerHTML='';$('labels').innerHTML='';
 const xs=niceStep(xmax-xmin),ys=niceStep(ymax-ymin);
 for(let v=Math.ceil(ymin/ys)*ys;v<=ymax;v+=ys){const y=Y(v);el('line',{x1:L,x2:R,y1:y,y2:y,stroke:'currentColor','stroke-opacity':Math.abs(v)<1e-8?0:.11,'stroke-dasharray':'3 5'},$('grid'));if(Math.abs(v)>1e-8)el('text',{x:47,y:y+4,'text-anchor':'end',fill:'currentColor','font-size':11,opacity:.65},$('grid')).textContent=fmt(v)}
 for(let v=Math.ceil(xmin/xs)*xs;v<=xmax;v+=xs){const x=X(v);el('line',{x1:x,x2:x,y1:T,y2:B,stroke:'currentColor','stroke-opacity':.08},$('grid'));el('text',{x,y:352,'text-anchor':'middle',fill:'currentColor','font-size':11,opacity:.65},$('grid')).textContent=fmt(v)}
 el('text',{x:365,y:382,'text-anchor':'middle',fill:'currentColor','font-size':12,opacity:.7},$('grid')).textContent='Underlying price';
 const zy=Y(0);$('zero').setAttribute('y1',zy);$('zero').setAttribute('y2',zy);$('zero').style.opacity=zy>=T&&zy<=B?'.8':'0';
 const pts=[];for(let i=0;i<=300;i++){const x=xmin+(xmax-xmin)*i/300;pts.push([X(x),Y(pay(x))])}
 const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');$('curve').setAttribute('d',d);
 const base=Math.max(T,Math.min(B,zy));$('fill').setAttribute('d',d+' L '+R+','+base+' L '+L+','+base+' Z');
 function marker(v,color,label,id){const x=X(v),y=base;el('path',{d:`M ${x-9} ${y-13} L ${x+9} ${y-13} L ${x} ${y-2} Z`,fill:color,stroke:'var(--viz-card)','stroke-width':1.5},$('markers'));el('rect',{x:x-17,y:y-24,width:34,height:35,fill:'transparent',cursor:'ew-resize','data-drag':id},$('markers'));el('text',{x,y:y+24,'text-anchor':'middle',fill:color,'font-size':13,'font-weight':700,'pointer-events':'none'},$('labels')).textContent=label+' '+fmt(v)}
 marker(K,'#a78bfa','K','K');marker(S,'#f59e0b','S','S');
 const side=type==='Call'?Math.max(xmin,Math.min(K-(xmax-xmin)*.08,xmin+(xmax-xmin)*.13)):Math.min(xmax,Math.max(K+(xmax-xmin)*.08,xmax-(xmax-xmin)*.13));
 const lx=X(side),curveY=Y(pay(side)),gap=Math.abs(curveY-zy),ly=gap>=24?(zy+curveY)/2:Math.max(T+12,Math.min(B-8,curveY+(pos==='Long'?15:-15)));
 const txt=el('text',{x:lx,y:ly+5,'text-anchor':'middle',fill:pos==='Long'?'#e05252':'#15966b','font-size':15,'font-weight':700,cursor:'ns-resize','data-drag':'P'},$('markers'));txt.textContent=(pos==='Long'?'Pay ':'Receive ')+fmt(P);
 el('rect',{x:lx-48,y:ly-17,width:96,height:34,fill:'transparent',cursor:'ns-resize','data-drag':'P'},$('markers'));
 setGreek('delta',type==='Call'?(pos==='Long'?'+ve':'−ve'):(pos==='Long'?'−ve':'+ve'));
 setGreek('gamma',pos==='Long'?'+ve':'−ve');setGreek('vega',pos==='Long'?'+ve':'−ve');setGreek('theta',pos==='Long?'−ve':'+ve');
 setGreek('rho',type==='Call'?(pos==='Long'?'+ve':'−ve'):(pos==='Long'?'−ve':'+ve'));syncInputs();
}
[['inputK','K'],['inputS','S'],['inputP','P']].forEach(([id,key])=>{
  const field = $(id);
  field.addEventListener('input', () => {
    // Allow temporarily empty input while the user edits a number.
    if (field.value.trim() === '') return;
    const v = Number(field.value);
    if (!Number.isFinite(v)) return;
    if (key === 'P') P = Math.max(0, v);
    else if (key === 'K') K = Math.max(0, v);
    else S = Math.max(0, v);
    autoFit();
    draw();
  });
  field.addEventListener('change', () => {
    const v = Number(field.value);
    if (!Number.isFinite(v)) {
      syncInputs();
      return;
    }
    if (key === 'P') P = Math.max(0, v);
    else if (key === 'K') K = Math.max(0, v);
    else S = Math.max(0, v);
    autoFit();
    draw();
    syncInputs();
  });
});
function point(e){const r=$('plot').getBoundingClientRect();return{x:(e.clientX-r.left)*700/r.width,y:(e.clientY-r.top)*390/r.height}}
$('plot').addEventListener('pointerdown',e=>{const t=e.target.closest('[data-drag]');if(!t)return;drag=t.getAttribute('data-drag');$('plot').setPointerCapture(e.pointerId);e.preventDefault()});
$('plot').addEventListener('pointermove',e=>{if(!drag)return;const p=point(e);if(drag==='K')K=Math.max(0,sx(p.x));if(drag==='S')S=Math.max(0,sx(p.x));if(drag==='P')P=Math.max(0,Math.min(100,Math.abs(sy(p.y))));autoFit();draw()});
$('plot').addEventListener('pointerup',()=>drag=null);$('plot').addEventListener('pointercancel',()=>drag=null);$('plot').addEventListener('lostpointercapture',()=>drag=null);
['type','pos'].forEach(id=>$(id).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));if(id==='type')type=b.dataset.v;else pos=b.dataset.v;autoFit();draw()}));
$('reset').addEventListener('click',()=>{K=100;S=105;P=10;type='Call';pos='Long';['type','pos'].forEach((id,i)=>$(id).querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.v===(i?'Long':'Call'))));autoFit();draw()});
autoFit();draw();
})();