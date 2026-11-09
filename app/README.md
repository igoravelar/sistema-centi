# App navegável — Sistema Centi (protótipo)

Protótipo HTML/CSS/JS puro, sem dependências e sem CDN, recriando as telas do
protótipo Figma `files/Protocolo Digital.fig` com o miolo do menu vindo de
`files/Menu_V2.html`.

## Como rodar

```bash
cd sistema-centi
python3 -m http.server 5173
# abre http://127.0.0.1:5173/app/index.html
```

## Telas e navegação

| Arquivo | Tela | Origem |
|---|---|---|
| `index.html` | **Início** (aterrissagem) — cards do Centi Cast | referência enviada pelo time |
| `protocolo.html` | Menu Protocolo (menu do módulo) | frame `Menu Protocolo` + `Menu_V2.html` |
| `po002.html` | PO002 - Protocolo (Pesquisa / Cadastro) | frames `PO002 - Aba Pesquisa`, `PO002 - Aba Cadastro` |
| `po011.html` | PO011 - Central de Protocolos (BPMN + drawer) | frames `PO011 - Drawer Dados / Documentos / Checklist` |
| `gestao-folha.html` | Menu Gestão da Folha (submódulo da Folha de Pagamento) | menu do ERP |
| `fp296.html` | FP296 - Gestão Folha de Pagamento (Pesquisa / Cadastro: Comparativo e Ficha Financeira) | `files/Telas Premium.fig` — frames `FP296 - Gestão Folha Pagto > Comparativo 1` e `> Financeiro 1`; Pesquisa conforme o ERP |
| `ass-doc.html` | Portal Assinatura Digital de Documento(s) — documento protegido antes da liberação | imagem de referência enviada pelo time |
| `portal-ass.html` | Portal de Assinaturas — login com abas Contribuinte/Fornecedor e Servidor Público | imagem de referência enviada pelo time |
| `portal-ass-pendentes.html` | Portal de Assinaturas — Documentos Pendentes (área logada, menu lateral recolhível) | imagem de referência enviada pelo time |
| `portal-ass-assinados.html` | Portal de Assinaturas — Documentos Assinados (histórico) | imagem de referência enviada pelo time |
| `portal-servicos.html` | Portal de Serviços — login da Prefeitura com os serviços disponíveis | imagem de referência enviada pelo time |
| `portal-servicos-home.html` | Portal de Serviços — página inicial (topo verde, menu lateral recolhível, rodapé) | imagem de referência enviada pelo time |
| `portal-servicos-protocolos.html` | Portal de Serviços — Meus Protocolos (abas Em aberto / Arquivados, filtro, ordenação e paginação; modais do protocolo, regularidades e fluxo do processo) | imagens de referência enviadas pelo time |
| `zarpi.html` | Zarpi — Login (usuário/senha com olho, Lembrar acesso, Esqueci minha senha, Entrar com Google); o box inclina em 3D conforme o mouse; qualquer usuário e senha preenchidos levam ao Início (campo vazio mostra o erro; `?erro=1` abre já com o erro) | `Zarpi.fig` — frames `01 Login1` (vazio) e `01 Login2` (preenchido) |
| `zarpi-inicio.html` | Zarpi — Início: shell do ERP com a marca Zarpi e só Protocolo e Gerais no menu; a aba Início traz o Painel de Protocolos (indicadores, abertos x concluídos, situação de prazo, onde os protocolos param, naturezas, canal de entrada e vencidos mais críticos), com filtros de período e secretaria e dados fictícios | pedido do time, sobre a tela de Início do ERP |
| `zarpi-protocolo.html` | Zarpi — menu do módulo Protocolo (sidebar → Protocolo): só as telas do Protocolo ligadas ao fluxo inteligente — Protocolo e Remessa (PO002, PO003, PO004, PO009, PO011), Fluxo Inteligente (PO050 a PO060, em ordem de código) e Configurações (PO023 e PO001). PO050 e PO051 abrem as mesmas telas do ERP com `?app=zarpi`, que as veste de Zarpi (marca, menu, abas e Open Sans). A configuração do shell do Zarpi fica em `assets/zarpi.js` | `PROTOCOLO_guia-das-telas_analista.html` (guia das telas, nov/2026) |

Caminhos de navegação:

- **index (Início)** é a tela que abre por padrão
- **index** → botão `Design System` abre o `Centi Design System.dc.html`; a marca da
  Centi no topo dele volta para a index
- **topbar → ícone do relógio** abre o `portal-ass.html`
- **topbar → ícone do monitor** abre o `portal-servicos.html`
- **portal-servicos** → `Entrar` abre o `portal-servicos-home.html`; o `Sair` (⋮ no topo) volta ao login
- **portal-servicos-home** → menu lateral com os módulos abrindo seus itens (topo, menu e rodapé vêm de `assets/portal-servicos.js` e `.css`); `Protocolo › Meus Protocolos` abre o `portal-servicos-protocolos.html` e `Assinatura Documentos` abre o Portal de Assinaturas em nova aba
- **portal-ass** → `Entrar` abre o `portal-ass-pendentes.html?acesso=contribuinte|servidor` (conforme a aba aberta); o botão de sair no topo volta ao login
- **topbar → ícone da engrenagem** abre o `ass-doc.html`; a marca da Centi no topo dele volta para a index
- **topbar → ícone da pessoa** abre a modal de dados do usuário e preferências (contato, segurança, tema, destaque da fonte e telas predefinidas). O tema Claro/Escuro/Sistema e a fonte entram em prévia ao clicar; `Salvar` guarda no navegador e vale para todas as telas, `Cancelar` desfaz
- **sidebar → Protocolo** abre o `protocolo.html`
- **protocolo** → item `Protocolo PO002` abre o `po002.html`; `Tela Protocolo PO011` abre o `po011.html`
- **sidebar → Folha de Pagamento → Gestão da Folha** abre o `gestao-folha.html`; o item
  `Gestão folha de pagamento FP296` abre o `fp296.html`
- **fp296 · Pesquisa** → `Pesquisar` preenche a grid; um clique seleciona o servidor e o
  segundo clique (ou o duplo clique) abre o Cadastro. No Cadastro, as setas ao lado do
  nome passam ao servidor anterior/seguinte da grid, e as abas internas trocam entre
  Comparativo e Ficha Financeira (Movimentações, Eventos, Apontamentos e Históricos
  ainda em construção). Estados por URL: `fp296.html?servidor=0&aba=ficha`
- **po002 · Pesquisa** → clique numa linha de resultado leva ao Cadastro
- **po002 · Cadastro** → botão `Guia do Fluxo` abre o `po011.html`
- **po002 · Cadastro** e **po050 · Cadastro** (fluxo já criado) → a seção `Conversas`, no pé da coluna de pastas, troca o lado direito pelo chat interno do registro aberto, como o chat interno do PO051: a conversa pública abre pelo título `Conversas`, e o `Novo Grupo` cria uma conversa privada, que entra listada embaixo do título; clicar numa pasta volta ao formulário. Código comum em `assets/conversas.js` e `.css`. Estado por URL: `po002.html?view=cadastro&painel=conversas`
- **po011** abre **sem drawer**, com o fluxograma ocupando todo o modal. Clicar
  numa etapa faz o drawer entrar deslizando da direita e traz o card clicado
  para o centro da área que sobra; o `×` do drawer o fecha com o movimento
  inverso. Abas `Dados · Documentos · Checklist · Condições`; no Checklist,
  clique numa linha abre o detalhe do item (com `Voltar` e `Salvar`)
- O fluxograma não tem barras de rolagem: navega-se **arrastando** (mão aberta
  parada, mão fechada arrastando, dedo apontando sobre os cards). Um arraste
  acima de 4px cancela o clique, para não abrir o drawer sem querer
- **po011** → o `×` do modal (ou clicar no fundo escurecido) volta ao Cadastro do PO002
- As abas de documento no topo acumulam conforme você navega (🏠 · Notificações ·
  Protocolo · PO002 · PO011) e cada uma leva de volta à sua tela. Cada página
  declara quais abas estão abertas em `montarShell(atual, abertas)`.

### Estados via URL (útil para revisar telas específicas)

```
po002.html?view=cadastro
po011.html?etapa=4                    abre já com o drawer da etapa 4
po011.html?etapa=3&aba=checklist
po011.html?etapa=3&aba=checklist&item=22
```

A duração da animação do drawer vive em dois lugares que precisam bater: a
`transition` de `.drawer` no CSS e a constante `ANIM_DRAWER` no JS (que controla
quando o conteúdo é esvaziado).

## Arquivos

```
app/
  index.html            Início (cards do Centi Cast)
  protocolo.html        Menu Protocolo
  po002.html            PO002 (Pesquisa + Cadastro)
  po011.html            PO011 (fluxo BPMN + drawer)
  Centi Design System.dc.html   guideline de componentes (referência de design)
  Tela Protocolo.dc.html        PO002 no design system (referência de design)
  support.js            runtime de preview dos .dc.html
  uploads/              imagens usadas pelos .dc.html
  assets/
    centi.css           tokens, shell e componentes (campos, botões, tabela, abas)
    inicio.css          cards do Centi Cast da tela de Início
    menu.css            menu do módulo
    shell.js            topbar, sidebar, abas de documento e o dicionário de ícones
    preferencias.js     modal do usuário e o tema escuro, derivado das próprias folhas de estilo
    img/                fotos dos episódios (ver abaixo)
```

### Cards do Centi Cast

Os dois cards da tela de Início são reproduções em CSS das artes do Centi Cast
(os arquivos originais não estão no repositório). O card do episódio reserva um
espaço para o retrato do apresentador em `assets/img/pamela-souza.png` — basta
soltar o PNG com fundo transparente ali que ele aparece. Trocar o card inteiro
por uma imagem pronta também funciona: é só substituir o `<a class="card ...">`
por um `<img>` do mesmo tamanho.

O conteúdo vem das constantes `AGENDA` e `EPISODIO` no topo do `index.html`.

O shell é montado por `montarShell(abaAtual)` em `shell.js`; cada tela só preenche
o `<main>` devolvido. Ícones são SVG inline no objeto `ICO` — para adicionar um,
basta acrescentar a chave e usar `svg('nome')`.

## Tokens

A paleta segue o protótipo Figma, que diverge do Design System v1.0 descrito no
README da raiz (lá o verde é `#8FBE2F` e a fonte de UI é `system-ui`). Aqui vale
o Figma:

| Token | Valor | Uso |
|---|---|---|
| `--g` | `#A1BB3E` | tiles do menu lateral, botões primários, filete da aba ativa |
| `--g-dark` | `#86A427` | texto de aba de documento ativa |
| `--g-mid` | `#93A550` | títulos de drawer e de etapa concluída |
| `--g-olive` | `#8BA81D` | texto de botão claro |
| `--g-soft-bg` / `--g-soft-bd` | `#F5FCD9` / `#C9DA86` | botões claros e ações de campo |
| `--label-bg` | `#F1F4E7` | rótulo à esquerda nas linhas de formulário |
| `--ro-bg` | `#F4F4F6` | campo bloqueado |
| `--app-bg` | `#E8EDF1` | fundo da área de conteúdo |

Tipografia: **Verdana** em toda a interface (12px padrão, 13px nas abas, 11px nos
botões), como no protótipo. Métricas: topbar 50px, sidebar 250px, abas de
documento 33px, campos 32px com rótulo de 130px.

## Regerando os dados do Figma

O `.fig` é um zip com `canvas.fig` comprimido em **zstd** contendo uma mensagem
**Kiwi** cujo esquema vem embutido no próprio arquivo. `files/tools/` traz o
decodificador usado para extrair posições, cores, fontes e textos exatos:

```bash
cd files/tools
python3 kiwi.py "../Protocolo Digital.fig"   # gera canvas.json
python3 tree.py                              # lista os frames do arquivo
python3 tree.py "PO011 - Drawer Dados"       # despeja o layout de um frame
```

Requer `zstd` no PATH (`brew install zstd`).
