// Seleção visual apenas: os agendamentos só mudam ao salvar o formulário.
export function bindRangeSelection(calendar, onSelect) {
  const controller = new AbortController();
  const {signal} = controller;
  let drag = null;
  let suppressClick = false;
  const hourAt = (column, y) => {
    const box = column.getBoundingClientRect();
    return 7 + Math.max(0, Math.min(11, Math.floor((y - box.top) / (box.height / 12))));
  };
  function clear() {
    calendar.querySelector('.selection-preview')?.remove();
    calendar.classList.remove('is-selecting');
    drag = null;
  }
  function preview() {
    let box = calendar.querySelector('.selection-preview');
    if (!box) {
      box = document.createElement('div');
      box.className = 'selection-preview';
      box.setAttribute('aria-hidden', 'true');
      drag.column.append(box);
    }
    const start = Math.min(drag.start, drag.end);
    const end = Math.max(drag.start, drag.end) + 1;
    box.style.gridRow = `${start - 6} / span ${end - start}`;
    box.textContent = `${start}h–${end}h · ${end - start} horas`;
    calendar.classList.add('is-selecting');
  }
  for (const column of calendar.querySelectorAll('.day-column:not(.outside)')) {
    column.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      suppressClick = false;
      drag = {column, date: column.dataset.date, start: hourAt(column, event.clientY), end: hourAt(column, event.clientY), pointer: event.pointerId, moved: false};
    }, {signal});
    column.addEventListener('pointermove', event => {
      if (!drag || drag.column !== column || drag.pointer !== event.pointerId) return;
      if (!(event.buttons & 1)) { clear(); return; }
      drag.end = hourAt(column, event.clientY);
      if (drag.end !== drag.start) drag.moved = true;
      if (drag.moved) {
        column.setPointerCapture(event.pointerId);
        preview();
      }
    }, {signal});
    column.addEventListener('pointerup', event => {
      if (!drag || drag.column !== column || drag.pointer !== event.pointerId) return;
      const selection = drag;
      const bounds = column.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      suppressClick = selection.moved;
      clear();
      // O clique simples continua abrindo só uma hora; o arraste abre o intervalo.
      if (selection.moved && inside) {
        const start = Math.min(selection.start, selection.end);
        const end = Math.max(selection.start, selection.end);
        onSelect(selection.date, Array.from({length: end - start + 1}, (_, i) => start + i));
      }
    }, {signal});
    column.addEventListener('lostpointercapture', clear, {signal});
    column.addEventListener('pointercancel', () => { suppressClick = true; clear(); }, {signal});
  }
  calendar.addEventListener('click', event => {
    if (suppressClick) { suppressClick = false; event.preventDefault(); event.stopImmediatePropagation(); }
  }, {capture: true, signal});
  document.addEventListener('pointerup', () => { if (drag) clear(); }, {signal});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drag) { suppressClick = true; clear(); }
  }, {signal});
  window.addEventListener('blur', clear, {signal});
  return () => { clear(); controller.abort(); };
}
