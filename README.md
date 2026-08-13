# Handoff: Design System Centi + Tela de Protocolo

## Overview
Pacote de handoff do **Design System Centi** (guideline de componentes) e da primeira tela do sistema construída a partir dele (**PO002 - Protocolo**, modos Pesquisa e Cadastro). Serve de base para a construção de novas telas, aplicativos e portais Centi.

## Sobre os arquivos de design
Os arquivos `.dc.html` deste pacote são **referências de design criadas em HTML** — protótipos que mostram aparência e comportamento pretendidos, não código de produção para copiar diretamente. A tarefa é **recriar estes designs no ambiente do codebase alvo** usando seus padrões estabelecidos. Stack alvo definida pelo time: **Material UI v9 (React)** com tema Centi + **Font Awesome 5** para ícones. Os HTMLs usam uma runtime própria (`support.js`) apenas para preview — ignore-a na implementação.

## Fidelidade
**Alta fidelidade (hifi)**: cores, tipografia, espaçamentos e interações são finais. Recriar pixel-perfect com MUI v9 customizado pelo tema abaixo.

## Tema MUI (base de tudo)
```js
createTheme({
  palette: {
    primary:   { main: '#8FBE2F' },   // hover/darken: #7DA82B
    secondary: { main: '#5C6A35' },
    error:     { main: '#E53935' },
    warning:   { main: '#F5A623' },
    info:      { main: '#4A90D9' }
  },
  typography: { fontFamily: 'system-ui', button: { textTransform: 'none' } },
  shape: { borderRadius: 5 }
})
```

## Design Tokens

### Cores — marca e ação
- `#8FBE2F` Verde Centi — ações primárias, seleção, marca
- `#7DA82B` Verde Hover — hover primário, links
- `#5C6A35` Oliva Escuro — painéis de módulo, títulos
- `#6B7A3F` Oliva Médio — cabeçalhos de seção
- `#E4EAC8` Verde Claro — linha selecionada, destaques suaves

### Cores — neutros
- `#FFFFFF` branco · `#F7F8F4` fundo sidebar · `#F2F3EF` fundo app
- `#E2E5DA` bordas gerais · `#8A8F82` texto secundário
- `#5C5A5B` texto de menu · `#4A4A4A` texto · `#3E4630` títulos · `#404632` título topbar
- **Formulários (tela Protocolo):** rótulo/box `#E4E6E9`, contorno de campo `#E4E6E9`, campo bloqueado fundo `#F4F5F5`
- Botões CRUD: fundo `#E6E6E5`, borda `#D4D4D2`

### Cores — semânticas
- `#F5A623` laranja (badge Centi Cast, avisos)
- `#E53935` vermelho (erros, exclusão, asterisco de obrigatório)
- `#4A90D9` azul info

### Cores — hovers dos botões CRUD
- Novo: `#80CAE8` · Excluir: `#BE5B5A` · Salvar: `#AFC571`
- Apenas-ícone/Desfazer: `#AAB1B3` · Operações (primário): `#B5C373`
- No hover, **ícone e texto ficam brancos**.

### Tipografia
- **Principal (UI e títulos): `system-ui`** — pesos 400/600/700/800
- **Inputs, selects, textareas e dados de tabela: `Verdana`**
- Escala: título de módulo 28px/700 · H1 22px/800 · título topbar 26px/700 `#404632` · H2 17px/700 · item de menu 15px/700 · corpo 14px · rótulo de campo 13px/600 · dados de tabela 13px · cabeçalho de tabela 11px/700 caixa alta
- Menu lateral do DS: 14px `#5C5A5B`

### Espaçamento e forma
- Escala base 4px: 4 · 8 · 12 · 16 · 24 · 32 · 48
- Radius: 4–6px campos/cards, 8px painéis, pill (18px+) buscas e badges
- Sombra (só cards flutuantes): `0 1px 4px rgba(60,70,40,.12)`

## Ícones — Font Awesome 5
Estilos permitidos: **Solid (`fas`)** para ações/navegação, **Regular (`far`)** para estados vazios (ex. favorito inativo). Nunca misturar outras bibliotecas.
Vocabulário: fa-search, fa-pencil-alt/fa-edit, fa-trash-alt, fa-save, fa-calendar-alt, fa-file-alt, fa-folder / fa-folder-open, fa-cog(s), fa-star, fa-download, fa-eye-slash, fa-undo, fa-plus-circle, fa-chevron-circle-right/down, fa-home, fa-thumbtack, fa-times, fa-history, fa-question-circle, fa-graduation-cap.
Tamanhos: 14px inline · 16px toolbar · 18px tiles de menu. Cores: `#8A8F82` neutro, `#5C6A35` ativo, `#E53935` destrutivo; nos tiles claros `#7DA82B`.

## Componentes (mapeamento MUI)
- **Botão primário**: `<Button variant="contained" color="primary">` — hover `#7DA82B`, sem uppercase
- **Botão secundário**: `<Button variant="outlined">` custom — gradiente `#FDFDFD→#EFEFEC`, borda `#C9CDC0`
- **Botões CRUD** (Novo/Excluir/Salvar/só-ícone): fundo `#E6E6E5`, ícone colorido (azul `#4FC3F7`, vermelho `#C62828`, verde `#8FBE2F`); hover assume a cor da ação com texto/ícone brancos; transição .15s
- **Botão-link**: `<Button variant="text">` verde `#7DA82B` · **IconButton** com FA
- **TextField**: `variant="outlined" size="small"`, focus borda `#8FBE2F` + halo `rgba(143,190,47,.2)`; readonly fundo `#F4F5F1`/`#F4F5F5`
- **Linha de formulário (cadastro)**: rótulo em coluna fixa (180px na tela, 200px no DS) com fundo `#E4E6E9`, colado ao campo (gap 0); obrigatório com `*` vermelho
- **Lookup**: campo código (right-align) + descrição readonly + ícones editar/lupa
- **Tabela**: `<Table size="small">` — cabeçalho `#F4F5F1` 11px caixa alta, zebra `#FAFBF6`, linha selecionada `#E4EAC8`, grade 1px, números à direita, dados em Verdana
- **Abas de documento**: ativa branca conectada ao conteúdo, inativas `#E9EBE3`, fechável (✕), fixável (★/alfinete)
- **Abas verticais**: Pesquisa/Cadastro/Notas/ViCenti — texto vertical, ativa branca com rótulo verde
- **Badges**: `<Chip size="small">` — status verde `#E4EAC8`/`#5C6A35`, pendente `#FDEBD0`/`#B36B00`, atenção `#FBE1E0`/`#C62828`, Centi Cast `#F5A623`, código de funcionalidade monospace `#F4F5F1`
- **Card de categoria**: borda esquerda verde 4px, linhas com favorito ☆/★ e código
- **Sidebar de módulos**: item ativo fundo `#F4F7EC` + filete verde 4px à direita; tile de ícone `#9CC13C` branco

## Telas

### 1. Centi Design System.dc.html (guideline)
Topo fixo 104px com degradê `#FAFFE2 → #8FBE2F`, logo colorida (`uploads/marca-centi.png`), título "Design System Centi v1.0" (H2 26px `#404632`, 30px da marca), badge "Material UI 9 · Font Awesome 5" à direita. Menu lateral fixo branco 262px (14px `#5C5A5B`, linha separadora), conteúdo com moldura de 50px, rolagem animada com desaceleração ("estacionar"). Seções 01–11 + 12 UI Design Stack (por último).

### 2. Tela Protocolo.dc.html (PO002)
Layout: topbar 64px (logo, Referência mês/ano, entidade, utilitários, `admin | 3.0.209.53`) · sidebar de módulos 250px (13px, Protocolo ativo) · abas de documento (🏠, Notificações, PO002 - Protocolo) · abas verticais.
- **Cadastro**: árvore de pastas 310px (13px, pastas `fa-folder-open` verdes, indentação 14/34px) · toolbar CRUD (Novo, Excluir, Salvar, sigiloso só-ícone, Desfazer, Operações) · formulário rótulo-à-esquerda 180px (Id, Protocolo, Ano, Data, Interessado/Beneficiário com lookup, Solicitante, Natureza, Protocolo origem, Observação textarea, Data do documento, Valor, Número documento, Repartição, Apensar automático, Sigiloso) · painel Complemento 360px · painel Operações (lista com ~19 ações, abre pelo botão)
- **Pesquisa**: filtros Campo/Operação/Valor (+ Adicionar/Limpar Filtros, Pesquisar primário, Salvar Filtros secundário) · box Últimas Buscas 390px · Resultados (Mostrar 50/100, Exportar) com tabela de 8 colunas; clique na linha abre o Cadastro
- **Encaixe**: tela fecha em 100vh sem rolagem vertical de página (rolagem apenas interna); largura mínima 1500px

## Interações e estado
- Abas verticais alternam `view: 'pesquisa' | 'cadastro'`
- Botão Operações alterna painel lateral (`opsOpen`)
- "Novo" limpa formulário (`novo: true`, Salvar vira primário "Salvar(1)"); "Salvar" volta ao modo edição
- Clique em linha de resultado navega ao Cadastro
- Hovers: linhas de menu/árvore `#F4F7EC`, botões CRUD conforme tokens acima

## Assets
- `uploads/marca-centi.png` — logo colorida oficial (topbar)
- `assets/marca-centi.svg` (wordmark escuro) e `assets/marca-centi-branca.svg` (wordmark branco), `assets/marca-centi-color.svg`
- Ícones: Font Awesome 5.15.4 via CDN

## Arquivos
- `Centi Design System.dc.html` — guideline completa (12 seções)
- `Tela Protocolo.dc.html` — tela PO002 (Pesquisa + Cadastro)
- `assets/` e `uploads/marca-centi.png` — marcas
- Os `.dc.html` abrem no navegador para consulta visual (requerem a runtime de preview; use-os como referência, não como código-fonte)
