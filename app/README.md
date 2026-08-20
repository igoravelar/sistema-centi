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

Caminhos de navegação:

- **index (Início)** é a tela que abre por padrão
- **index** → botão `Design System` abre o `Centi Design System.dc.html`; a marca da
  Centi no topo dele volta para a index
- **sidebar → Protocolo** abre o `protocolo.html`
- **protocolo** → item `Protocolo PO002` abre o `po002.html`; `Tela Protocolo PO011` abre o `po011.html`
- **po002 · Pesquisa** → clique numa linha de resultado leva ao Cadastro
- **po002 · Cadastro** → botão `Guia do Fluxo` abre o `po011.html`
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
