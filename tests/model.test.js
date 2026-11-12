import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {START,END,HOURS,add,groups,ranking,validateBackup,activities} from '../src/model.js';
const data=JSON.parse(readFileSync(new URL('../public/data.json',import.meta.url)));
const b=(subject='Matemática',topics=[])=>({subject,topics,note:'',done:false});
test('12 horas e todos os dias, incluindo 01/12',()=>{assert.deepEqual(HOURS,[7,8,9,10,11,12,13,14,15,16,17,18]);let d=START,n=0;while(d<=END){n++;d=add(d,1)}assert.equal(n,21);assert.equal(add(END,1),'2026-12-02');assert.equal(activities.length,6)});
test('fusão de três horas preserva conteúdos e divisão ao editar/apagar o meio',()=>{const slots={'2026-11-11_7':b('Matemática',['A']),'2026-11-11_8':b('Matemática',['B']),'2026-11-11_9':b('Matemática',['C'])};let g=groups(slots,START);assert.equal(g[0].end,10);assert.deepEqual(g[0].items.map(i=>i.topics[0]),['A','B','C']);slots['2026-11-11_8']=b('Escola');g=groups(slots,START);assert.equal(g.filter(i=>i.subject).length,3);delete slots['2026-11-11_8'];assert.equal(groups(slots,START).filter(i=>i.subject).length,2);assert.equal(groups(slots,'2026-11-12').filter(i=>i.subject).length,0)});
test('630 questões únicas, exclusões auditáveis e referências consistentes',()=>{assert.equal(data.exams.reduce((n,e)=>n+e.questions.length,0),630);assert.equal(new Set(data.exams.map(e=>e.sha256)).size,14);for(const e of data.exams){assert.equal(new Set(e.questions.map(q=>q.number)).size,e.questions.length);e.questions.forEach((q,i)=>{assert.equal(q.number,i+1);assert.ok(['classified','review','out_of_scope','annulled'].includes(q.status));assert.ok(q.page>=3);if(q.status==='classified')assert.ok(data.subjects[q.subject].includes(q.topic))})}for(const s of Object.keys(data.subjects)){const rank=ranking(data,{},s);assert.equal(rank.reduce((n,t)=>n+t.count,0),data.exams.flatMap(e=>e.questions).filter(q=>q.subject===s&&q.status==='classified').length);for(const t of rank){assert.equal(t.count,t.refs.length);assert.equal(t.proofs,new Set(t.refs.map(q=>q.exam)).size);assert.equal(t.percent,t.total?t.count/t.total*100:null)}}});
test('backup valida antes de substituir e rejeita conteúdo malformado',()=>{const v={version:1,slots:{'2026-12-01_18':b()},custom:{Matemática:['Tema próprio']}};assert.deepEqual(validateBackup(v,Object.keys(data.subjects)),v);assert.throws(()=>validateBackup({...v,slots:{'2026-12-02_7':b()}},Object.keys(data.subjects)));assert.throws(()=>validateBackup({...v,slots:{'2026-11-11_19':b()}},Object.keys(data.subjects)));assert.throws(()=>validateBackup({...v,slots:{'2026-11-11_7':{...b(),topics:'invalid'}}},Object.keys(data.subjects)))});

test('fora de programa, revisão, anulações e duplicatas não alteram incidência',()=>{const fixture={subjects:{Matemática:['Tema']},exams:[{id:'a',stage:'SSA 1',questions:[{subject:'Matemática',topic:'Tema',status:'classified',number:1},{subject:'Matemática',topic:'Tema',status:'out_of_scope',number:2},{subject:'Matemática',topic:'Tema',status:'review',number:3},{subject:'Matemática',topic:'Tema',status:'annulled',number:4}]},{id:'b',stage:'SSA 1',duplicateOf:'a',questions:[{subject:'Matemática',topic:'Tema',status:'classified',number:1}]}]};const r=ranking(fixture,{},'Matemática')[0];assert.equal(r.count,1);assert.equal(r.total,1);assert.equal(r.percent,100);assert.equal(r.proofs,1);assert.equal(data.duplicates.length,1);assert.deepEqual(data.analysisSummary,{classified:581,out_of_scope:48,review:1,annulled:0});});
test('backup preserva conclusões por matéria e continua aceitando backups antigos',()=>{
 const legacy={version:1,slots:{'2026-11-11_7':b()},custom:{}};
 assert.deepEqual(validateBackup(legacy,Object.keys(data.subjects)),legacy);
 const next={...legacy,completedTopics:{Matemática:['Mesmo assunto'],Biologia:['Mesmo assunto']}};
 assert.deepEqual(validateBackup(next,Object.keys(data.subjects)),next);
 assert.throws(()=>validateBackup({...legacy,completedTopics:[]},Object.keys(data.subjects)));
 assert.throws(()=>validateBackup({...legacy,completedTopics:{Matemática:[true]}},Object.keys(data.subjects)));
 assert.throws(()=>validateBackup({...legacy,completedTopics:{Desconhecida:['A']}},Object.keys(data.subjects)));
 assert.throws(()=>validateBackup({...legacy,completedTopics:{Matemática:['x'.repeat(201)]}},Object.keys(data.subjects)));
});
