// Mantém o toque curto e a rolagem nativos; o toque longo só abre ações.
export function bindEventActions(calendar, onOpen) {
  const controller = new AbortController();
  const {signal} = controller;
  let press = null;
  const activePointers = new Set();
  let suppressClick = false;
  let expiry;
  function clearPress() {
    if (press) { clearTimeout(press.timer); press.element.classList.remove('press-pending'); }
    press = null;
  }
  function open(element, event, touch = false) {
    const [day, hour] = element.dataset.event.split('_');
    const box = element.getBoundingClientRect();
    onOpen(day, +hour, {x: event.clientX || box.left + 12, y: event.clientY || box.top + 12, touch});
  }
  function suppressRelease() {
    suppressClick = true;
    clearTimeout(expiry);
    expiry = setTimeout(() => { suppressClick = false; }, 1200);
  }
  document.addEventListener('pointerdown', event => {
    // Uma nova interação não deve ser confundida com o clique do toque longo.
    suppressClick = false;
    clearPress();
    if (['touch','pen'].includes(event.pointerType)) activePointers.add(event.pointerId);
    if (activePointers.size > 1) return;
    const element = event.target.closest?.('.event');
    if (!element || !calendar.contains(element) || !['touch', 'pen'].includes(event.pointerType)) return;
    press = {element, id: event.pointerId, x: event.clientX, y: event.clientY, fired: false};
    element.classList.add('press-pending');
    const current = press;
    current.timer = setTimeout(() => {
      if (press !== current || !element.isConnected) return;
      current.fired = true;
      element.classList.remove('press-pending');
      suppressRelease();
      open(element, event, true);
    }, 550);
  }, {capture: true, signal});
  document.addEventListener('pointermove', event => {
    if (press?.id === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) clearPress();
  }, {passive: true, signal});
  document.addEventListener('pointerup', event => {
    activePointers.delete(event.pointerId);
    if (press?.id !== event.pointerId) return;
    if (press.fired) {
      suppressRelease();
      if (event.cancelable) event.preventDefault();
    }
    clearPress();
  }, {signal});
  document.addEventListener('pointercancel', event => { activePointers.delete(event.pointerId); clearPress(); }, {signal});
  document.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) {
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, {capture: true, signal});
  calendar.addEventListener('contextmenu', event => {
    const element = event.target.closest('.event');
    if (!element) return;
    event.preventDefault();
    if (press?.fired) return;
    const touch = !!press || event.pointerType === 'touch' || event.pointerType === 'pen';
    if (press) { clearTimeout(press.timer); press.fired = true; press.element.classList.remove('press-pending'); }
    if (touch) suppressRelease();
    open(element, event, touch);
  }, {signal});
  calendar.addEventListener('keydown', event => {
    if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
    const element = event.target.closest('.event');
    if (!element) return;
    event.preventDefault();
    open(element, event);
  }, {signal});
  window.addEventListener('blur', () => { activePointers.clear(); clearPress(); }, {signal});
  return () => { clearPress(); clearTimeout(expiry); controller.abort(); };
}
