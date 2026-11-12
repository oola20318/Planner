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

O programa anexado e as quatro provas são do SSA 1. Os PDFs originais estão em `public/provas`, a extração textual em `analysis`, e o registro por questão em `public/data.json`. `analysis/build_data.py` guarda a classificação editorial e permite regenerar o registro com `python analysis/build_data.py`.

Foram identificados **quatro cadernos distintos, totalizando 181 questões** (45 + 45 + 46 + 45). Cada questão tem arquivo, número, página, matéria, conteúdo principal, status e transcrição auxiliar. Hashes SHA-256 diferentes e comparação de sequências/enunciados não indicam cadernos repetidos/equivalentes. Todos correspondem à 1ª etapa; nenhum caderno de outra etapa entrou no ranking.

Os anos **2021, 2022, 2023 e 2025 são inferidos dos metadados de criação dos PDFs**, apoiados nas datas dos enunciados, e não apresentados como identificação oficial confirmada da edição. O nome de um arquivo contém a data de 2025. As capas não explicitam os anos.

O ranking é calculado em tempo de execução a partir das referências individuais, usando **um conteúdo principal por questão**. O percentual é a quantidade desse conteúdo dividida pela base da matéria. A questão 37 do caderno de 2021 foi conferida visualmente na página 25 e classificada em conceitos da análise geográfica (geossistema). Não há questões com classificação pendente nesta versão. Figuras e algumas fórmulas não aparecem na transcrição textual; os links abrem o PDF original na página correspondente.

**Limitação:** não foram anexados gabaritos definitivos, comunicados de anulação ou identificação oficial das edições. Nenhuma anulação foi presumida. Os percentuais estão explicitamente rotulados como provisórios, calculados sobre a base sem anulações conhecidas. O modelo exclui registros com `status: "annulled"` do denominador e do ranking; devem ser assim registrados quando houver fonte oficial. Não há garantia de frequência futura.

Português, Literatura, Inglês e Filosofia têm conteúdos do programa, mas nenhuma questão nos cadernos fornecidos, todos do 2º dia. Sociologia aparece no caderno histórico de 2021, sem seção própria no programa atual: a interface identifica isso. Renascimento e Brasil holandês, cobrados no caderno antigo, também estão identificados como temas históricos adicionais.

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

A marca é C2, mantendo a paleta verde e o estilo tipográfico editorial. A grade usa fontes de 14–18 px para horários, matérias e conteúdos; as linhas ficaram mais altas e a grade semanal usa rolagem horizontal em telas estreitas para preservar a leitura. A chave de armazenamento e o formato de backup anteriores foram preservados, portanto os agendamentos existentes continuam disponíveis. Sincronização e login ainda não foram implementados: esta versão continua usando armazenamento local.
