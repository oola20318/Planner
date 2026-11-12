let dismissTimer;
export function celebrate(subject, count) {
  clearTimeout(dismissTimer);
  document.querySelector('#celebration')?.remove();
  const root = document.createElement('div');
  root.id = 'celebration';
  root.innerHTML = `<div class="celebration-confetti" aria-hidden="true">${Array.from({length:18}, (_,i)=>`<i style="--i:${i};--angle:${i*20}deg;--distance:${90+i%4*30}px"></i>`).join('')}</div><div class="celebration-card" role="status" aria-live="polite" aria-atomic="true"><span class="celebration-medal" aria-hidden="true">★</span><div><strong>Você fez acontecer!</strong><p class="celebration-detail"></p><small>Seu esforço merece ser celebrado.</small></div><button aria-label="Fechar celebração">×</button></div>`;
  root.querySelector('.celebration-detail').textContent = `${subject} · ${count} ${count===1?'hora concluída':'horas concluídas'}`;
  const close = () => { clearTimeout(dismissTimer); root.remove(); };
  root.querySelector('button').onclick = close;
  document.body.append(root);
  dismissTimer = setTimeout(close, 4800);
}
