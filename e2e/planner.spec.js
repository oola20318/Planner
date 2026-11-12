import {test,expect} from '@playwright/test';
async function openFirst(page){await page.locator('#jump').fill('2026-11-11');await page.locator('#day').click();await page.locator('[data-slot="2026-11-11_7"]').click()}
test('planejar, unir, dividir, concluir, persistir, cadastrar e restaurar backup',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await openFirst(page);
 await page.locator('#edit-subject').selectOption('Matemática');await page.locator('#topic-list input').first().check();await page.locator('#edit-note').fill('Revisar erros');await page.locator('.multi-hours summary').click();await page.locator('.extra-hour[value="8"]').check();await page.locator('.extra-hour[value="9"]').check();await page.getByRole('button',{name:'Salvar agendamento'}).click();
 await expect(page.locator('.event')).toHaveCount(1);await expect(page.locator('.event')).toContainText('7h – 10h');await page.reload();await page.locator('#jump').fill('2026-11-11');await page.locator('#day').click();await expect(page.locator('.event')).toHaveCount(1);
 await page.locator('.event').click();await page.locator('.edit-hour[data-hour="8"]').click();await page.locator('#edit-subject').selectOption('Escola');await page.locator('#edit-done').check();await page.getByRole('button',{name:'Salvar agendamento'}).click();await expect(page.locator('.event')).toHaveCount(3);await expect(page.locator('.completed')).toHaveCount(1);
 await page.locator('[data-event="2026-11-11_8"]').click();await page.getByRole('button',{name:'Apagar esta hora'}).click();await expect(page.locator('.event')).toHaveCount(2);await expect(page.locator('[data-slot="2026-11-11_8"]')).toHaveCount(1);
 await page.locator('[data-slot="2026-11-11_8"]').click();await page.locator('#edit-subject').selectOption('Biologia');await page.locator('#manual-topic').fill('Meu tema personalizado');await page.locator('#add-topic').click();await expect(page.locator('#topic-list')).toContainText('Meu tema personalizado');await page.locator('#edit-done').check();await page.getByRole('button',{name:'Salvar agendamento'}).click();await page.reload();await page.locator('#jump').fill('2026-11-11');await page.locator('#day').click();await expect(page.locator('[data-event="2026-11-11_8"]')).toContainText('Meu tema personalizado');
 await page.locator('[data-tab="backup"]').click();const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const path=await download.path();await page.locator('#import').setInputFiles(path);await page.locator('#confirm-import').click();await expect(page.locator('#content')).toContainText('3 horas agendadas');
 await page.locator('[data-tab="planner"]').click();await page.locator('#jump').fill('2026-12-01');await expect(page.locator('.empty-slot')).toHaveCount(12);await expect(page.locator('#next')).toBeDisabled();await page.locator('[data-slot="2026-12-01_18"]').click();await page.locator('#edit-subject').selectOption('Jantar');await page.getByRole('button',{name:'Salvar agendamento'}).click();await expect(page.locator('.event')).toContainText('18h – 19h');expect(errors).toEqual([]);
});
test('ranking e origem das questões integram o agendamento',async({page})=>{await page.goto('/');await page.locator('[data-tab="subjects"]').click();await expect(page.locator('.rank-row')).toHaveCount(14);await page.locator('.refs').first().click();await expect(page.locator('.reference')).not.toHaveCount(0);await page.locator('.close').click();await page.locator('.schedule-topic').first().click();await expect(page.locator('#edit-subject')).toHaveValue('Matemática');await expect(page.locator('#topic-list input:checked')).toHaveCount(1);await page.getByRole('button',{name:'Salvar agendamento'}).click();await page.locator('[data-tab="planner"]').click();await expect(page.locator('.event')).toHaveCount(1)});
test('celular: visualização diária, 12 horas e edição sem transbordar',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.locator('.calendar.day')).toBeVisible();await expect(page.locator('.empty-slot')).toHaveCount(12);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await page.locator('.empty-slot').first().click();await page.locator('#edit-subject').selectOption('Muay thai');await page.getByRole('button',{name:'Salvar agendamento'}).click();await expect(page.locator('.event')).toContainText('Muay thai');await page.screenshot({path:'analysis/mobile.png',fullPage:true})});
test('captura computador',async({page})=>{await page.goto('/');await page.screenshot({path:'analysis/desktop.png',fullPage:true})});
async function dragHours(page,day,from,to){
 const column=page.locator(`.day-column[data-date="${day}"]`);
 await column.scrollIntoViewIfNeeded();
 const points=await column.evaluate((el,{from,to})=>{const r=el.getBoundingClientRect(),height=r.height/12;return {x:r.left+r.width/2,y1:r.top+(from-7+.5)*height,y2:r.top+(to-7+.5)*height}},{from,to});
 await page.mouse.move(points.x,points.y1);await page.mouse.down();await page.mouse.move(points.x,points.y2,{steps:12});
 await expect(page.locator('.selection-preview')).toHaveCount(1);
 await page.mouse.up();
}
test('arraste seleciona três horas, salva unido e preserva a edição de uma hora',async({page})=>{
 await page.goto('/');await page.locator('#jump').fill('2026-11-11');
 await expect(page.getByRole('link',{name:'C2 início'})).toBeVisible();
 await expect(page.locator('#drag-enabled')).toBeChecked();
 await dragHours(page,'2026-11-11',7,9);
 await expect(page.locator('.selection-summary')).toContainText('3 horários selecionados');
 await expect(page.locator('.extra-hour:checked')).toHaveCount(3);
 await page.locator('#edit-subject').selectOption('Matemática');await page.locator('#topic-list input').first().check();await page.getByRole('button',{name:'Salvar agendamento'}).click();
 await expect(page.locator('.event')).toHaveCount(1);await expect(page.locator('.event')).toContainText('7h – 10h');
 const sizes=await page.locator('.event').evaluate(el=>({subject:parseFloat(getComputedStyle(el.querySelector('strong')).fontSize),topics:parseFloat(getComputedStyle(el.querySelector('.event-topics')).fontSize),time:parseFloat(getComputedStyle(el.querySelector('.event-time')).fontSize)}));expect(sizes.subject).toBeGreaterThanOrEqual(17);expect(sizes.topics).toBeGreaterThanOrEqual(15);expect(sizes.time).toBeGreaterThanOrEqual(14);
 await page.locator('.event').click();await page.locator('.edit-hour[data-hour="8"]').click();await page.locator('#edit-subject').selectOption('Escola');await page.getByRole('button',{name:'Salvar agendamento'}).click();await expect(page.locator('.event')).toHaveCount(3);
});
test('arraste inverso, cancelamento, aviso de substituição e preferência persistente',async({page})=>{
 await page.goto('/');await page.locator('#jump').fill('2026-11-11');
 await dragHours(page,'2026-11-11',9,7);await expect(page.locator('.extra-hour:checked')).toHaveCount(3);await page.locator('#cancel').click();await expect(page.locator('.event')).toHaveCount(0);
 await dragHours(page,'2026-11-11',7,8);await page.locator('#edit-subject').selectOption('Escola');await page.getByRole('button',{name:'Salvar agendamento'}).click();
 await dragHours(page,'2026-11-11',7,9);await expect(page.locator('.selection-summary')).toContainText('agendamentos existentes');await page.locator('#cancel').click();await expect(page.locator('.event')).toContainText('7h – 9h');
 await page.locator('#drag-enabled').uncheck();await page.reload();await expect(page.locator('#drag-enabled')).not.toBeChecked();await page.locator('#jump').fill('2026-11-11');await page.locator('.event').click();await expect(page.locator('#edit-subject')).toHaveValue('Escola');await page.locator('#cancel').click();
 await page.locator('#drag-enabled').check();
 const column=page.locator('.day-column[data-date="2026-11-11"]');await column.scrollIntoViewIfNeeded();const box=await column.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+64);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+300,{steps:8});await page.keyboard.press('Escape');await page.mouse.up();await expect(page.locator('.modal')).toHaveCount(0);await expect(page.locator('.selection-preview')).toHaveCount(0);
});
test('toque no celular continua abrindo uma hora e permite seleção pelos checkboxes',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('http://localhost:5173');await page.locator('.empty-slot').first().tap();await expect(page.locator('.modal')).toBeVisible();await page.locator('#edit-subject').selectOption('Biologia');await page.locator('.multi-hours summary').click();await page.locator('.extra-hour[value="8"]').check();await page.getByRole('button',{name:'Salvar agendamento'}).click();await expect(page.locator('.event')).toContainText('7h – 9h');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await context.close();
});
test('dados da versão Compasso permanecem disponíveis na versão C2',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('compasso-ssa-v1',JSON.stringify({version:1,slots:{'2026-11-11_7':{subject:'Matemática',topics:['Meu conteúdo antigo'],note:'Minha observação antiga',done:true}},custom:{Matemática:['Meu conteúdo antigo']}})));
 await page.goto('/');await page.locator('#jump').fill('2026-11-11');await expect(page.locator('.event')).toContainText('Meu conteúdo antigo');await expect(page.locator('.completed')).toHaveCount(1);await page.locator('.event').click();await expect(page.locator('#edit-note')).toHaveValue('Minha observação antiga');await expect(page.locator('#edit-done')).toBeChecked();await expect(page.locator('#topic-list input:checked')).toHaveCount(1);
});
async function seedBlock(page){
 await page.addInitScript(()=>{
  if(!localStorage.getItem('compasso-ssa-v1'))localStorage.setItem('compasso-ssa-v1',JSON.stringify({version:1,slots:{'2026-11-11_7':{subject:'Matemática',topics:['Função afim'],note:'Preservar primeira hora',done:false},'2026-11-11_8':{subject:'Matemática',topics:['Função quadrática'],note:'Preservar segunda hora',done:false},'2026-11-11_9':{subject:'Matemática',topics:['Progressão aritmética'],note:'Preservar terceira hora',done:false},'2026-11-12_7':{subject:'Escola',topics:[],note:'Outro dia',done:false}},custom:{}}));
 });
 await page.goto('/');await page.locator('#jump').fill('2026-11-11');await page.locator('#day').click();
}
test('menu do botão direito conclui por hora, reabre e exclui somente o bloco selecionado',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await seedBlock(page);
 await page.locator('.event').click({button:'right'});await expect(page.getByRole('dialog',{name:'Ações do agendamento'})).toBeVisible();await expect(page.locator('#editor-form')).toHaveCount(0);
 await page.locator('#complete-hours').click();await page.locator('.completion-hour[value="8"]').check();await page.getByRole('button',{name:'Salvar conclusão'}).click();
 await expect(page.locator('.partially-completed')).toHaveCount(1);await expect(page.locator('.completion-badge')).toContainText('1/3');await expect(page.locator('.completed')).toHaveCount(0);await expect(page.locator('#celebration')).toContainText('Você fez acontecer!');await expect(page.locator('.achievement-summary')).toContainText('1 de 3 horas');
 let stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('compasso-ssa-v1')));expect(stored.slots['2026-11-11_7'].done).toBe(false);expect(stored.slots['2026-11-11_8'].done).toBe(true);expect(stored.slots['2026-11-11_9'].done).toBe(false);expect(stored.slots['2026-11-11_8'].note).toBe('Preservar segunda hora');expect(stored.slots['2026-11-11_8'].topics).toEqual(['Função quadrática']);
 await page.locator('.event').click({button:'right'});await page.locator('#complete-block').click();await expect(page.locator('.completed')).toHaveCount(1);await expect(page.locator('.completion-badge')).toContainText('Concluído!');await expect(page.locator('.achievement-summary')).toContainText('Plano do dia concluído');
 await page.reload();await page.locator('#jump').fill('2026-11-11');await page.locator('#day').click();await expect(page.locator('.completed')).toHaveCount(1);await expect(page.locator('#celebration')).toHaveCount(0);
 await page.locator('.event').click({button:'right'});await page.locator('#complete-block').click();await expect(page.locator('.completed')).toHaveCount(0);await expect(page.locator('.achievement-summary')).toHaveCount(0);
 await page.locator('.event').click({button:'right'});await page.locator('#delete-block').click();await page.locator('#cancel-delete').click();await expect(page.locator('.event')).toHaveCount(1);
 await page.locator('.event').click({button:'right'});await page.locator('#delete-block').click();await page.locator('#confirm-delete').click();await expect(page.locator('.event')).toHaveCount(0);await expect(page.locator('.empty-slot')).toHaveCount(12);
 stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('compasso-ssa-v1')));expect(Object.keys(stored.slots)).toEqual(['2026-11-12_7']);expect(errors).toEqual([]);
});
test('menu acessível pelo teclado e animação respeita movimento reduzido',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await seedBlock(page);await page.locator('.event').focus();await page.keyboard.press('Shift+F10');await expect(page.locator('.actions-sheet')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('.modal')).toHaveCount(0);await expect(page.locator('.event')).toBeFocused();
 await page.locator('.event').click({button:'right'});await page.locator('#complete-block').click();await expect(page.locator('.celebration-card')).toBeVisible();await expect(page.locator('.celebration-confetti')).toBeHidden();expect(await page.locator('.celebration-card').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await page.screenshot({path:'/tmp/c2-conquista.png',fullPage:true});
});
test('celular e tablet: toque longo real abre ações, toque curto edita e movimento cancela',async({browser})=>{
 for(const width of [390,1024]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:true,isMobile:true});const page=await context.newPage();await seedBlock(page);
  await page.locator('.event').tap();await expect(page.locator('#editor-form')).toBeVisible();await page.locator('#cancel').tap();
  await page.locator('.event').scrollIntoViewIfNeeded();let box=await page.locator('.event').boundingBox();const client=await context.newCDPSession(page);const point={x:box.x+box.width/2,y:Math.max(20,box.y+60)};
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await page.waitForTimeout(680);await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page.locator('.actions-sheet')).toBeVisible();await expect(page.locator('#editor-form')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  const sheet=await page.locator('.actions-sheet').boundingBox();expect(sheet.x).toBeGreaterThanOrEqual(0);expect(sheet.x+sheet.width).toBeLessThanOrEqual(width);
  await page.locator('#complete-hours').tap();await page.locator('.completion-hour[value="7"]').check();await page.getByRole('button',{name:'Salvar conclusão'}).tap();await expect(page.locator('.partially-completed')).toHaveCount(1);
  await page.locator('.event').scrollIntoViewIfNeeded();box=await page.locator('.event').boundingBox();const p={x:box.x+box.width/2,y:Math.max(20,box.y+60)};await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x,y:p.y+35}]});await page.waitForTimeout(680);await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator('.actions-sheet')).toHaveCount(0);
  await context.close();
 }
});
