// O modo de toque é explícito para não competir com rolagem e menu por toque longo.
export function bindRangeSelection(calendar, onSelect, {touch = false} = {}) {
  const controller = new AbortController();
  const {signal} = controller;
  let drag = null, suppressClick = false, timer, frame;
  const activeTouches = new Set();
  const hourAt = (column, y) => {
    const box = column.getBoundingClientRect();
    return 7 + Math.max(0, Math.min(11, Math.floor((y - box.top) / (box.height / 12))));
  };
  function clear() {
    clearTimeout(timer); cancelAnimationFrame(frame);
    calendar.querySelector('.selection-preview')?.remove();
    calendar.querySelectorAll('.selection-armed').forEach(el=>el.classList.remove('selection-armed'));
    calendar.classList.remove('is-selecting'); drag = null;
  }
  function preview() {
    let box = calendar.querySelector('.selection-preview');
    if (!box) { box = document.createElement('div'); box.className='selection-preview'; box.setAttribute('aria-hidden','true'); drag.column.append(box); }
    const start = Math.min(drag.start,drag.end), end = Math.max(drag.start,drag.end)+1;
    box.style.gridRow=`${start-6} / span ${end-start}`;
    box.textContent=`${start}h–${end}h · ${end-start} ${end-start===1?'hora':'horas'}`;
    calendar.classList.add('is-selecting');
  }
  function scrollWithFinger() {
    if (!drag?.touch || !drag.armed) return;
    const delta=drag.y<65?-10:drag.y>innerHeight-65?10:0;
    if(delta){window.scrollBy(0,delta);drag.end=hourAt(drag.column,drag.y);preview()}
    frame=requestAnimationFrame(scrollWithFinger);
  }
  document.addEventListener('pointerdown',event=>{
    suppressClick=false;
    if(event.pointerType==='mouse')return;
    activeTouches.add(event.pointerId);
    if(activeTouches.size>1){suppressClick=true;clear()}
  },{capture:true,signal});
  for (const column of calendar.querySelectorAll('.day-column:not(.outside)')) {
    column.addEventListener('pointerdown',event=>{
      const isTouch=['touch','pen'].includes(event.pointerType);
      if(event.button!==0 || (isTouch&&(!touch||activeTouches.size>1)))return;
      suppressClick=false;
      drag={column,date:column.dataset.date,start:hourAt(column,event.clientY),end:hourAt(column,event.clientY),pointer:event.pointerId,moved:false,touch:isTouch,armed:!isTouch,x:event.clientX,y:event.clientY};
      if(isTouch){
        event.target.closest('button')?.classList.add('selection-armed');
        const current=drag;
        timer=setTimeout(()=>{if(drag!==current)return;drag.armed=true;drag.moved=true;column.setPointerCapture(event.pointerId);preview();scrollWithFinger()},450);
      }
    },{signal});
    column.addEventListener('pointermove',event=>{
      if(!drag||drag.column!==column||drag.pointer!==event.pointerId)return;
      if(!(event.buttons&1)){clear();return}
      if(drag.touch&&!drag.armed){if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>10){suppressClick=true;clear()}return}
      drag.y=event.clientY;drag.end=hourAt(column,event.clientY);
      if(drag.end!==drag.start)drag.moved=true;
      if(drag.moved){column.setPointerCapture(event.pointerId);if(event.cancelable)event.preventDefault();preview()}
    },{signal});
    column.addEventListener('pointerup',event=>{
      if(!drag||drag.column!==column||drag.pointer!==event.pointerId)return;
      const selection=drag,bounds=column.getBoundingClientRect();
      const inside=event.clientX>=bounds.left&&event.clientX<=bounds.right&&event.clientY>=bounds.top&&event.clientY<=bounds.bottom;
      suppressClick=selection.moved;
      clear();
      if(selection.moved&&inside){
        if(event.cancelable)event.preventDefault();
        const start=Math.min(selection.start,selection.end),end=Math.max(selection.start,selection.end);
        onSelect(selection.date,Array.from({length:end-start+1},(_,i)=>start+i));
      }
    },{signal});
    column.addEventListener('lostpointercapture',clear,{signal});
  }
  calendar.addEventListener('contextmenu',event=>{if(touch&&event.pointerType!=='mouse')event.preventDefault()},{signal});
  document.addEventListener('click',event=>{
    if(suppressClick&&event.detail!==0){suppressClick=false;event.preventDefault();event.stopImmediatePropagation()}
  },{capture:true,signal});
  document.addEventListener('pointerup',event=>{activeTouches.delete(event.pointerId);if(drag)clear()},{signal});
  document.addEventListener('pointercancel',event=>{activeTouches.delete(event.pointerId);suppressClick=true;clear()},{signal});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&drag){suppressClick=true;clear()}},{signal});
  window.addEventListener('blur',()=>{activeTouches.clear();clear()},{signal});
  return ()=>{clear();controller.abort()};
}
