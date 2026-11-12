import json,re,hashlib
from pathlib import Path
from novos.classifications import C
root=Path(__file__).resolve().parent.parent
old=json.loads((root/'analysis/base-original.json').read_text()); subjects=old['subjects']; exams=old['exams']
subjects['Português']+=['Coesão referencial, conectivos e relações lógico-discursivas','Modalização e efeitos de sentido','Análise linguística e recursos gramaticais em textos','Leitura e interpretação de textos']
subjects['Filosofia']+=['Cultura, natureza e condição humana']
subjects['Inglês']+=['Análise gramatical contextualizada']
# Temas históricos adicionais ficam no registro, mas saem da lista curricular/ranking.
subjects['História']=subjects['História'][:7]
keys=dict(M='Matemática',B='Biologia',Q='Química',F='Física',H='História',G='Geografia',S='Sociologia',T='Filosofia',P='Português',L='Literatura',I='Inglês')
for e in exams:
 for q in e['questions']:
  if e['id']=='prova-3' and q['number'] in [29,30,41,44,45,46]:
   q.update(status='out_of_scope',note='Conteúdo principal fora dos itens do programa anexado: '+str(q['topic'])+'. Excluído do numerador e do denominador da incidência.')
  if e['id']=='prova-3' and q['number'] in [42,43]:
   q['originalSubject']='Sociologia';q['subject']='Filosofia';q['topic']=subjects['Filosofia'][6 if q['number']==42 else 7];q['note']='Questão da seção histórica de Sociologia, normalizada por conteúdo previsto explicitamente em Filosofia: Positivismo/Marxismo.'
records=json.loads((root/'analysis/novos/extracted.json').read_text()); duplicates=[]
for e in records:
 if e['duplicateOf']:
  duplicates.append({k:e[k] for k in ['filename','sha256','duplicateOf']});continue
 codes=C[e['id']].split(); assert len(codes)==len(e['questions']),(e['id'],len(codes),len(e['questions']))
 for q,code in zip(e['questions'],codes):
  if code[0] in ['X','R']:
   status,subject,description=code.split(':',2);q.update(subject=subject,topic=None if status=='R' else description.replace('_',' '),status='review' if status=='R' else 'out_of_scope',note=('Revisão necessária: ' if status=='R' else 'Fora do programa anexado: ')+description.replace('_',' ')+'. Não incluída no numerador nem no denominador do ranking.')
  else:
   subject=keys[code[0]];topic=subjects[subject][int(code[1:])];q.update(subject=subject,topic=topic,status='classified',note='Conteúdo principal identificado pelo conhecimento exigido no enunciado. Figuras, textos-base compartilhados e fórmulas devem ser conferidos no PDF original.')
  q['tags']=[]
  if e['id']=='novo-8' and q['number']==2:q['note']='Tirinha conferida visualmente na página 3: evolução química, molécula autorreplicante e primeiro ser vivo. Conteúdo principal: origem da vida.'
  if e['id']=='novo-7' and q['number']==28:q['tags']=['Climas áridos'];q['note']='Mapa conferido visualmente na página 22: distribuição de áreas desérticas e características climáticas.'
  q['scope']='programa-ssa1-anexado' if q['status']=='classified' else 'excluded'
 year=int(re.search(r'\b(20\d\d)\b',e['creationDate'])[1]);day=2 if e['id'] in ['novo-5','novo-8','novo-10'] else 1
 e.update(year=year,yearStatus='inferido dos metadados de criação do PDF; edição oficial não confirmada',stage='SSA 1',day=day,annulmentStatus='Gabarito definitivo não fornecido; anulações não confirmadas',editionLabel=f'{year}'+(' (janeiro; edição não confirmada)' if e['id'] in ['novo-2','novo-10'] else ' (ano inferido)'))
 if day==1:e['ignoredLanguage']={'language':'Espanhol','numbers':list(range(33,39)) if e['id'] in ['novo-1','novo-2','novo-9'] else list(range(20,24)),'reason':'Opção alternativa não prevista no programa de língua estrangeira anexado (Inglês). Não somada novamente às questões do caderno.'}
 exams.append(e)
# O registro de auditoria permite distinguir contabilizadas, fora do programa e revisões.
summary={status:sum(q['status']==status for e in exams for q in e['questions']) for status in ['classified','out_of_scope','review','annulled']}
result=dict(subjects=subjects,exams=exams,duplicates=duplicates,analysisSummary=summary,scopePolicy='Somente questões classificadas em conteúdos do programa anexado integram o numerador e o denominador. Revisões, fora de programa, anulações e arquivos duplicados são excluídos. Opção estrangeira utilizada: Inglês.')
(root/'public/data.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print('Provas únicas:',len(exams),'Questões:',sum(len(e['questions']) for e in exams),'Duplicados:',len(duplicates),'Resumo:',summary)
