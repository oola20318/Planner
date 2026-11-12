# C2 · Planner SSA 1

Aplicação em português, sem cadastro e sem backend. Node.js 22 ou 24 e npm são suficientes.

## Abrir

```bash
cd /workspace/Planner
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

Acesse a porta 5173 pelo navegador do ambiente ou, em sua máquina, pelo endereço local informado pelo Vite. Para distribuição estática: `npm run build`; publique a pasta `dist` em qualquer hospedagem estática. Para conferir o build local: `npm run preview -- --port 4173`.

## Usar

- O plano vai de **11/11/2026** (data de criação desta sessão no fuso de São Paulo) até **01/12/2026 inclusive**. São 21 dias e 12 horários por dia, das 7h às 19h.
- Clique em um horário ou em **Agendar estudo**, selecione matéria/atividade, conteúdos, observação e conclusão. Expanda a opção de outros horários para preencher várias horas.
- A opção **Selecionar horários ao arrastar** permite clicar e arrastar verticalmente com o mouse no mesmo dia. Ao soltar, o editor abre com todas as horas marcadas; revise e salve para aplicar. Arrastar de baixo para cima também funciona. Use **Esc** ou **Cancelar** para desistir. A preferência de ativar/desativar é salva neste navegador. No celular, toque em uma hora e selecione as demais no formulário.
- Matérias e atividades iguais em horas contíguas se unem visualmente. Abra o bloco e escolha a hora específica para alterar ou apagar; conteúdos por hora aparecem no editor. Conclusões parciais usam ◐, totais usam ✓.
- **Matérias e incidência** permite pesquisar, conferir referências e PDFs e levar um conteúdo ao agendamento.
- A visualização inicial é diária no celular, semanal no computador. Use as setas, o seletor de data ou **Hoje**. Hoje usa o fuso America/Sao_Paulo; fora do período, é exibida a data permitida mais próxima.
- Os dados são salvos automaticamente no armazenamento local deste navegador. Faça cópias em **Meus backups**; a importação valida o arquivo e pede confirmação antes de substituir os dados. Não há sincronização entre dispositivos. Mantenha o mesmo endereço e porta para acessar o mesmo armazenamento local.

## Análise dos anexos

A base reúne **14 cadernos únicos de SSA 1, dos dois dias, com 630 questões**, considerando Inglês nas numerações com opção de língua estrangeira. Uma cópia idêntica do caderno de 2021 do 2º dia foi identificada por SHA-256 e não foi contada novamente. Os originais ficam em `public/provas`; a interface permite conferir cada arquivo, página e número.

São **581 questões classificadas em conteúdos do programa, 48 fora do programa e uma em revisão editorial**. O ranking usa um único conteúdo principal por questão e calcula o percentual sobre as questões classificadas e compatíveis com o programa daquela matéria. Fora de programa, revisões, duplicatas e anulações registradas ficam fora tanto do numerador quanto do denominador. Os tópicos excluídos continuam no registro de auditoria, com motivo. Positivismo e Marxismo de seções antigas de Sociologia foram normalizados em Filosofia, onde estão previstos; tópicos exclusivamente sociológicos e disciplinas técnicas ausentes do programa não entram no ranking.

A escolha curricular considera o conhecimento necessário para responder, não apenas o tema do texto: uma questão de compreensão em Inglês sobre biodiversidade é de Inglês. Recursos visuais e relações multissemióticas previstos em Linguagens são incluídos; regras esportivas, técnicas instrumentais, conteúdos de colonização moderna e tópicos matemáticos sem correspondência no programa são excluídos. As opções de Espanhol não são somadas às de Inglês da mesma prova.

Os anos são inferidos de metadados, datas internas e nomes dos arquivos; as capas não confirmam a edição oficial. Os cadernos `novo-2` e `novo-10`, criados em janeiro de 2021 e com referências internas de 2020, são explicitamente identificados como edições não confirmadas e não confundidos com os cadernos de outubro de 2021. Os IDs distinguem os cadernos mesmo quando os anos inferidos coincidem.

**Revisão pendente:** Q33 do 1º dia de 2025 (`novo-7`), que compara imagens de divindades de tradições distintas, permanece excluída até a definição editorial de um conteúdo principal inequívoco. As imagens das questões `novo-8/Q2` e `novo-7/Q28` foram conferidas visualmente e suas classificações estão documentadas nos registros. Algumas transcrições omitem texto por codificação de fontes, figuras e fórmulas; o PDF original é a referência.

**Anulações:** não foram fornecidos gabaritos definitivos. Nenhuma anulação foi presumida; os percentuais permanecem provisórios quanto a essa validação. Registros `annulled` são excluídos do ranking. Frequência observada não é garantia de cobrança futura.

As classificações editoriais das novas provas estão em `analysis/novos/classifications.py`, com extrações em `analysis/novos/extracted.json`. Para regenerar a base de forma determinística, na raiz do projeto:

```bash
python analysis/build_data.py
python analysis/expand_data.py
```

O primeiro comando gera a entrada original em `analysis/base-original.json`; o segundo aplica o programa normalizado, as exclusões e os cadernos novos e escreve `public/data.json`.

## Verificação

```bash
npm test
npm run build
npm run dev -- --port 5173
# em outro terminal, com Chromium disponível em /usr/bin/chromium:
npm run test:e2e
```

O executável de Chromium pode ser ajustado em `playwright.config.js` em outro sistema. Os testes cobrem a sequência de dias e horários, fusão/divisão, consistência de todas as contagens e referências, validação de backup e fluxos reais no Chromium em computador e celular. Capturas de tela: `analysis/desktop.png` e `analysis/mobile.png`.

## Publicação em hospedagem estática

O build usa caminhos relativos, incluindo dados e links para os PDFs, e foi validado no Chromium sob `/Planner/`. A pasta `dist` é a raiz a publicar. Para GitHub Pages, mantenha um arquivo `.nojekyll` na raiz publicada. O código-fonte fica na branch `main`; a versão estática publicada fica na branch `gh-pages`. O GitHub Pages deve usar `gh-pages` e `/ (root)`. Para atualizar o site, execute os testes e `npm run build`, publique o conteúdo de `dist` na branch `gh-pages` e acompanhe a execução de Pages no GitHub Actions. O endereço do site é `https://oola20318.github.io/Planner/`.

## Leitura e identidade visual

A marca é C2, mantendo a paleta verde e o estilo tipográfico editorial. A grade usa fontes de 14–18 px para horários, matérias e conteúdos; as linhas usam uma altura compacta (114 px no celular, 116 px no computador) e a grade semanal usa rolagem horizontal em telas estreitas para preservar a leitura. A chave de armazenamento e o formato de backup anteriores foram preservados, portanto os agendamentos existentes continuam disponíveis. Sincronização e login ainda não foram implementados: esta versão continua usando armazenamento local.

## Ações rápidas e conclusão

Clique com o botão direito em um bloco para abrir suas ações. No celular ou tablet, pressione por cerca de meio segundo; um toque curto continua abrindo o editor. Movimentos para rolar cancelam o toque longo. Também é possível abrir as ações com Shift+F10 quando o bloco está focado.

O menu permite concluir todo o bloco, marcar/desmarcar horas individuais, editar ou excluir o bloco inteiro. A exclusão pede confirmação e afeta apenas as horas contíguas daquele bloco naquele dia. A edição de uma única hora continua disponível no editor.

A conclusão parcial mostra a quantidade de horas realizadas e uma barra de progresso. A total exibe um selo e um fundo de conquista. Um resumo do dia permanece visível depois de atualizar a página. Novas conclusões mostram uma mensagem de reconhecimento com uma breve animação, desativada quando o sistema solicita movimento reduzido. A celebração não se repete ao recarregar ou ao salvar novamente uma hora já concluída.

## Segurar e arrastar no celular e tablet

Ative **Selecionar no celular** acima da grade. Segure um horário por cerca de meio segundo, arraste verticalmente no mesmo dia e solte. O editor abre com todas as horas selecionadas; os dados só mudam ao salvar. O modo também funciona sobre blocos agendados e avisa sobre substituições. Perto das bordas da tela, o arraste pode rolar a página para alcançar mais horas. Movimentos antes de completar a espera ou um segundo dedo cancelam a seleção.

Use **Sair da seleção por toque** para voltar à rolagem normal e ao menu de ações por toque longo. O clique e arraste do mouse continua disponível. A preferência de modo por toque vale para a sessão e não altera backups nem agendamentos antigos.

## Conclusão dos assuntos

Em **Matérias e incidência**, marque a caixa ao lado do nome de um conteúdo para registrá-lo como concluído. A linha ganha um selo, destaque visual e uma breve celebração. Desmarque para voltar a pendente. O progresso é separado por matéria, funciona com a pesquisa e é salvo no mesmo armazenamento local dos agendamentos, no campo opcional `completedTopics`.

Essas marcações são independentes das conclusões por hora no planner e não alteram contagens ou percentuais de incidência. Os assuntos concluídos continuam disponíveis para agendar revisões. A marcação permanece após recarregar e é incluída nos backups JSON. Backups antigos, sem esse campo, continuam aceitos e restauram zero assuntos concluídos. A animação respeita a preferência de movimento reduzido do sistema.
