import json,re,hashlib
from pathlib import Path
subjects={
'Matemática':['Números reais, razão e proporção','Expressões algébricas, equações e sistemas','Funções e suas representações','Função afim','Função quadrática','Função exponencial','Progressão aritmética','Progressão geométrica','Grandezas, medidas e notação científica','Áreas e perímetros','Volume de paralelepípedos','Gráficos e tabelas','Médias, moda e mediana','Dispersão: amplitude, variância e desvio padrão'],
'Biologia':['Metodologia científica','Bioquímica: água, sais e biomoléculas','Vitaminas e avitaminoses','Origem da vida','Citologia: estruturas e organelas','Membranas e transporte celular','Metabolismo energético','Divisão celular','Controle gênico: replicação, transcrição e tradução','Reprodução e embriologia animal','Histologia','Saúde, sexualidade e primeiros socorros','Ecologia e meio ambiente'],
'Química':['Estados físicos e transformações da matéria','Modelos atômicos e isótopos','Classificação periódica','Substâncias, misturas e alotropia','Ligações químicas, geometria e polaridade','Fórmulas químicas','Misturas e métodos de separação','Funções inorgânicas: ácidos, bases, sais e óxidos','Materiais, resíduos e sustentabilidade','Ciclos biogeoquímicos','Radioatividade e meia-vida','Reações, mol e estequiometria','Polímeros e reciclagem','Química e a vida: biomoléculas','Fármacos, hormônios e drogas','Biossíntese e fotossíntese'],
'Física':['Grandezas, unidades e notação científica','Escalas, gráficos e vetores','Cinemática','Dinâmica e leis de Newton','Gravitação universal','Hidrostática','Trabalho, energia e potência','Quantidade de movimento, impulso e colisões'],
'História':['Fontes históricas, memória e humanidade','Pré-História e povoamento das Américas','Povos indígenas e Revolução Neolítica','Egito e antigo Oriente Médio','Grécia e Roma','Europa medieval','Império Muçulmano','Renascimento','Brasil holandês'],
'Geografia':['Introdução ao pensamento geográfico','Conceitos da análise geográfica','Cartografia e sensoriamento remoto','Relações Terra-Sol','Estrutura terrestre e tectônica','Relevo, rochas e solos','Clima e atmosfera','Recursos hídricos','Biomas e vegetação','Meio ambiente e sustentabilidade'],
'Filosofia':['Origens da filosofia e campos de atuação','Mito, ciência e senso comum','Pré-socráticos, Sócrates, Platão e Aristóteles','Ética, valores, democracia e cidadania','Renascimento','Empirismo e racionalismo','Positivismo e Iluminismo','Marxismo e Escola de Frankfurt','Indústria cultural e razão comunicativa','Mídias digitais, verdade e cidadania','Trabalho, ideologia e alienação','Globalização, identidade e ancestralidade'],
'Português':['Textos jornalísticos e leitura crítica de mídias','Checagem de fatos e curadoria digital','Linguagens juvenis e vida pessoal','Textos da vida pública e direitos humanos','Divulgação científica e pesquisa','Discurso reportado e citações','Semântica, humor e ironia','Argumentação','Multimodalidade','Variação e preconceito linguístico','Concordância e regência'],
'Literatura':['Gêneros literários, funções e figuras de linguagem','Intertextualidade e outras linguagens artísticas','Literaturas popular, regional e indígena','Literatura pernambucana','Literaturas africanas em língua portuguesa','Estéticas barroca e árcade'],
'Inglês':['Leitura, compreensão e inferência','Coesão, conectores e modalização','Cognatos e falsos cognatos','Plural dos substantivos','Pronomes pessoais, possessivos e interrogativos','Verbo be e formas afirmativas, negativas e interrogativas','Present Simple e advérbios de frequência','Present Continuous','Possessive Case e There be','Past Simple e Past Continuous','Futuro: going to e will','Verbos modais','Preposições','Pronomes indefinidos e quantificadores','Present Perfect','Phrasal verbs e comparações'],
'Sociologia':['Imaginação sociológica','Positivismo','Marxismo e classes sociais','Socialização e consciência coletiva','Instituições sociais','Cultura e identidade']}
# Um código = uma única matéria e conteúdo principal. Índices seguem o programa acima.
M='Matemática';B='Biologia';Q='Química';F='Física';H='História';G='Geografia';S='Sociologia'
math={
'prova-0':[8,0,12,1,3,10,12,7,2,0,0,12,0,6,4,6,0,8,4,1,12,0],
'prova-1':[3,8,1,5,9,5,1,6,4,11,0,3,12,10,12,3,4,10,8,6,9,1],
'prova-4':[0,0,9,9,1,6,10,4,12,7,5,1,13,1,7,1,12,1,9,3,0,8]}
science={
'prova-0':[(Q,1),(B,11),(F,5),(Q,11),(B,4),(F,2),(Q,11),(B,11),(F,3),(Q,11),(B,5),(F,7),(Q,7),(B,3),(F,3),(B,1),(B,5),(F,3),(Q,10),(B,12),(F,6),(Q,7),(B,10)],
'prova-1':[(F,0),(F,3),(F,3),(F,4),(F,5),(F,6),(F,7),(B,3),(B,6),(B,7),(B,9),(B,10),(B,11),(B,11),(B,12),(B,12),(Q,11),(Q,10),(Q,13),(Q,4),(Q,1),(Q,11),(Q,4)],
'prova-4':[(F,4),(B,10),(Q,3),(B,10),(B,3),(Q,0),(F,2),(B,1),(B,9),(F,6),(Q,7),(Q,11),(F,4),(Q,10),(B,11),(Q,2),(F,3),(B,12),(B,0),(F,2),(B,1),(F,2),(B,12)],
'prova-3':[(B,1),(B,1),(B,3),(B,4),(B,8),(B,7),(B,4),(B,9),(B,10),(B,10),(Q,1),(Q,0),(Q,4),(Q,11),(Q,11),(Q,11),(Q,3),(Q,4),(Q,3),(Q,4),(H,0),(H,6),(H,1),(H,4),(H,4),(H,4),(H,5),(H,5),(H,7),(H,8),(G,4),(G,9),(G,4),(G,6),(G,5),(G,6),(G,1),(G,5),(G,9),(G,7),(S,0),(S,1),(S,2),(S,3),(S,4),(S,5)]}
files={'prova-0':('SSA1-2DIA-CADERNO-DE-PROVAS.pdf',2023),'prova-1':('CADERNO-DE-PROVAS-SSA1-2DIA.pdf',2022),'prova-3':('CADERNO-DE-PROVAS-SSA1-2-DIA27-10_ok.pdf',2021),'prova-4':('202512141523_-_CADERNO_DE_PROVAS_-_SSA_1_-_2_DIA.pdf',2025)}
ex=json.loads(Path('analysis/extracted.json').read_text()); out=[]
for exam in ex:
 id=exam['id']; codes=[(M,x) for x in math.get(id,[])]+science[id]; assert len(codes)==len(exam['questions'])
 name,year=files[id]
 for q,(subject,topic) in zip(exam['questions'],codes):
  q.update(subject=subject,topic=subjects[subject][topic] if topic is not None else None,status='classified' if topic is not None else 'review',tags=[],note='Tema principal identificado pelo enunciado. Consulte o PDF para figuras e fórmulas.')
  if topic is None:q['note']='O esquema é essencial e não foi recuperado na extração textual; classificação pendente de revisão visual.'
  if id=='prova-3' and q['number']==37:
   q['tags']=['Geossistema'];q['note']='Esquema conferido visualmente na página 25: potencial ecológico, exploração biológica e ação social. Conteúdo principal: conceitos da análise geográfica.'
  q['text']=re.split(r'\n\s*RASCUNHO',q['text'])[0].strip()
 out.append(dict(id=id,filename=name,year=year,yearStatus='inferido dos metadados de criação do PDF; edição oficial não confirmada',stage='SSA 1',day=2,sha256=hashlib.sha256(Path('public/provas/'+id+'.pdf').read_bytes()).hexdigest(),questions=exam['questions'],annulmentStatus='Não informado: gabaritos oficiais não foram anexados',duplicateOf=None))
Path('public/data.json').write_text(json.dumps(dict(subjects=subjects,exams=out),ensure_ascii=False,indent=2))
