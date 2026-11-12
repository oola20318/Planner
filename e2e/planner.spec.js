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
