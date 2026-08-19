/* ==========================================================================
   Centi — fluxograma do processo (BPMN) e drawer da etapa
   Depende de shell.js (dicionário ICO e helper svg). Ver montarFluxo() no fim.
   ========================================================================== */

let raiz = null;   /* container do fluxo, definido por montarFluxo */

/* ícone "timer" do Lucide (lucide.dev/icons/timer), traçado oficial */
Object.assign(ICO, {
  cronometro: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  mais_zoom:  '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  menos_zoom: '<line x1="5" y1="12" x2="19" y2="12"/>',
  olho:       '<path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18 18 0 0 1-2.16 3.19"/><path d="M6.6 6.6A18 18 0 0 0 2 12s3 8 10 8a9 9 0 0 0 5.4-1.6"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><line x1="2" y1="2" x2="22" y2="22"/>',
  funil:      '<polygon points="21 4 3 4 10 12.5 10 19 14 21 14 12.5 21 4"/>',
  telaCheia:  '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  sairTelaCheia: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
});

/* ------------------------------ dados do fluxo ------------------------------ */

/**
 * estado do card:
 *   concluida  verde claro   — etapa concluída
 *   andamento  branco+verde  — em andamento; vira verde escuro (.aberta) com o drawer aberto
 *   bloqueada  branco        — não habilitada para tramitar
 */
const ETAPAS = [
  { n: 1, nome: 'Início',                       depto: 'Arrecadação',                dias: '1 dia',  estado: 'concluida',
    x: 232, y: 15,  w: 124, h: 95 },
  { n: 2, nome: 'Conferência da<br>Solicitação', depto: 'DEPARTAMENTO DE IPTU - PD',  dias: '2 dias', estado: 'concluida',
    x: 200, y: 157, w: 188, h: 112 },
  { n: 3, nome: 'Valor exige análise<br>ampliada?', depto: 'TRIBUTAÇÃO',             dias: '1 dia',  estado: 'andamento',
    x: 0,   y: 345, w: 190, h: 112 },
  { n: 4, nome: 'Parecer do Controle<br>interno', depto: 'Controle Interno',         dias: '1 dia',  estado: 'andamento',
    x: 396, y: 345, w: 198, h: 112 },
  { n: 5, nome: 'Conferência<br>documental',    depto: 'TRIBUTOS',                   dias: '1 dia',  estado: 'bloqueada',
    x: 0,   y: 533, w: 190, h: 112 },
  { n: 6, nome: 'Declaração de<br>Impacto de ORC', depto: 'Contabilidade',           dias: '5 dias', estado: 'bloqueada',
    x: 200, y: 721, w: 198, h: 112 },
  { n: 7, nome: 'Análise Social',               depto: 'Assistência Social',         dias: '3 dias', estado: 'bloqueada',
    x: 200, y: 909, w: 198, h: 112 },
  { n: 8, nome: 'Isenção Concedida',            depto: 'Controle Interno',           dias: '1 dia',  estado: 'bloqueada',
    x: 200, y: 1097, w: 198, h: 112 },
];

/* campos da aba Dados, na ordem do protótipo */
const DADOS = [
  { rot: 'Id',                  val: '15',      ro: true },
  { rot: 'Etapa*',              cod: '3', val: 'Valor exige análise amplia...', ro: true, lupa: true },
  { rot: 'Geração*',            val: '1',       ro: true },
  { rot: 'Status*',             val: 'Não iniciada' },
  { rot: 'Data Início',         val: '01/01/2026 - 00:00:00' },
  { rot: 'Data Conclusão',      val: '01/01/2026 - 00:00:00' },
  { rot: 'Data Prevista',       val: '14/03/2026' },
  { rot: 'Concluído por',       cod: '', val: 'Pesquisar', ro: true, lupa: true },
  { rot: 'Resultado da decisão', val: '' },
];

/* `marcado` é o que pinta a linha de verde; `zebra` é só a alternância de fundo */
const CHECKLIST = [
  { id: '21', situacao: 'Concluído',      marcado: false },
  { id: '22', situacao: 'Não Preenchido', marcado: true },
  { id: '23', situacao: 'Não Preenchido', marcado: false },
  { id: '24', situacao: 'Não Preenchido', marcado: false, zebra: true },
];

const DOCUMENTOS = [
  { id: '1', descricao: 'REQUERIMENTO DE ISENÇÃO', obrigatorio: 'Sim', situacao: 'Não informado', marcado: false },
  { id: '2', descricao: 'CARNÊ DE IPTU',           obrigatorio: 'Sim', situacao: 'Não informado', marcado: false, zebra: true },
];

/* as grids são identificadas por data-col, para a marcação achar a coleção */
const COLECOES = {};   /* preenchido abaixo, após as duas listas existirem */

Object.assign(COLECOES, { checklist: CHECKLIST, documentos: DOCUMENTOS });

/* informações do protocolo, abertas pelo link do título da tela */
const PROTOCOLO_NUM = '2292416';
const PROTOCOLO = [
  { rot: 'Id',                            val: '2292416', ro: true },
  { rot: 'Protocolo<i>*</i>',             val: '116491',  ro: true },
  { rot: 'Ano protocolo<i>*</i>',         val: '2026',    ro: true },
  { rot: 'Data protocolo',                val: '14/08/2026', ro: true },
  { rot: 'Interessado/<br>Beneficiário<i>*</i>', cod: '476701', val: 'DIEGO BORGES DA SILVA',
    codL: true, acoes: ['lapis', 'lupa', 'olho'] },
  { rot: 'Solicitante/<br>Requerente',    cod: '', val: '', ph: 'Pesquisar', codL: true, acoes: ['lupa'] },
  { rot: 'Natureza<i>*</i>',              cod: '14', val: 'ISENÇÃO DE IPTU', codL: true, acoes: ['lapis', 'lupa'] },
  { rot: 'Protocolo origem',              cod: '', val: '', ph: 'Pesquisar', codL: true, acoes: ['lupa'] },
  { rot: 'Observação<i>*</i>',            val: '123123123', area: true, acoes: ['lupa'] },
  { rot: 'Data do documento',             val: '', ph: 'dd/mm/yyyy', acoes: ['calendario'] },
  { rot: 'Valor',                         val: '10,00' },
  { rot: 'Número documento',              val: '' },
  { rot: 'Repartição',                    val: 'PROTOCOLO CENTRAL', ro: true },
  { rot: 'Apensar automático?<i>*</i>',   val: 'Não', opcoes: ['Não', 'Sim'] },
  { rot: 'Sigiloso<i>*</i>',              val: 'Não', opcoes: ['Não', 'Sim'] },
];

const ITENS_CHECKLIST = {
  '21': 'O objeto está devidamente descrito',
  '22': 'A justificativa da contrata...',
  '23': 'A dotação orçamentária foi informada',
  '24': 'O prazo de execução está definido',
};

/* --------------------------------- estado --------------------------------- */

let etapaSel = null;       // etapa aberta no drawer (null = drawer fechado)
let abaDrawer = 'dados';   // dados | documentos | checklist | condicoes
let itemChecklist = null;  // id do item aberto em detalhe
let conteudoDrawer = 'etapa';   // 'etapa' | 'protocolo'

/* --------------------------------- BPMN --------------------------------- */

function etapaHTML(e) {
  return `
  <div class="etapa ${e.estado}" data-n="${e.n}"
       style="left:${e.x}px; top:${e.y}px; width:${e.w}px; height:${e.h}px">
    <span class="num">${e.n}</span>
    <span class="dias">${svg('cronometro')}${e.dias}</span>
    <span class="nome">${e.nome}</span>
    <span class="rodape">
      <span class="depto-lbl">DEPTO</span>
      <span class="depto">${e.depto}</span>
    </span>
    <span class="ponto"></span>
  </div>`;
}

const RAIO_CURVA = 10;

/** Caminho ortogonal com as quinas arredondadas em `r` px. */
function caminho(pts, r = RAIO_CURVA) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [xa, ya] = pts[i - 1], [x, y] = pts[i], [xb, yb] = pts[i + 1];
    const da = Math.hypot(x - xa, y - ya), db = Math.hypot(xb - x, yb - y);
    const rr = Math.min(r, da / 2, db / 2);
    // entra na quina, curva usando o vértice como controle, e sai
    d += ` L${x - (x - xa) / da * rr},${y - (y - ya) / da * rr}`;
    d += ` Q${x},${y} ${x + (xb - x) / db * rr},${y + (yb - y) / db * rr}`;
  }
  const [xf, yf] = pts[pts.length - 1];
  return `${d} L${xf},${yf}`;
}

/* as linhas que saem dos cards verde-claro (etapas 1 e 2) usam #B4C086; as que
   saem dos demais ficam cinza, como no protótipo */
function conectoresHTML() {
  const feito = '#B4C086', falta = '#7E7F79';

  const ligacoes = [
    // 1 -> 2
    { pts: [[294, 113], [294, 157]], cor: feito, seta: 'pf' },
    // 2 -> 3 e 2 -> 4
    { pts: [[294, 272], [294, 308], [95, 308], [95, 345]], cor: feito, seta: 'pf' },
    { pts: [[294, 308], [495, 308], [495, 345]],           cor: feito, seta: 'pf' },
    // 3 -> 5 (logo abaixo)
    { pts: [[95, 460], [95, 533]], cor: falta, seta: 'pp' },
    // 5 -> 6 e 4 -> 6 (a de 4 desce até a mesma altura)
    { pts: [[95, 648], [95, 688], [299, 688], [299, 721]], cor: falta, seta: 'pp' },
    { pts: [[495, 460], [495, 688], [299, 688]],           cor: falta },
    // 6 -> 7 -> 8
    { pts: [[299, 836], [299, 909]],  cor: falta, seta: 'pp' },
    { pts: [[299, 1024], [299, 1097]], cor: falta, seta: 'pp' },
  ];

  const linhas = ligacoes.map(l =>
    `<path d="${caminho(l.pts)}" fill="none" stroke="${l.cor}" stroke-width="1"
           stroke-linejoin="round" ${l.seta ? `marker-end="url(#${l.seta})"` : ''}/>`).join('');

  return `
  <svg class="conectores" viewBox="0 0 594 1213">
    <defs>
      <marker id="pf" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
        <polygon points="0,0 7,3.5 0,7" fill="${feito}"/>
      </marker>
      <marker id="pp" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
        <polygon points="0,0 7,3.5 0,7" fill="${falta}"/>
      </marker>
    </defs>
    ${linhas}
  </svg>`;
}

/* -------------------------------- drawer -------------------------------- */

const TITULO_ACAO = { lupa: 'Pesquisar', lapis: 'Editar', olho: 'Sigilo', calendario: 'Escolher data', mais: 'Novo' };

function campoHTML({ rot, val = '', cod, ro = false, lupa = false, area = false,
                     ph = '', acoes = [], opcoes, codL = false }) {
  const codBox = cod !== undefined
    ? `<input class="cx cod${codL ? ' cod-l' : ''}${ro ? ' ro' : ''}" value="${cod}" ${ro ? 'readonly' : ''}>` : '';

  const entrada = opcoes
    ? `<select class="cx">${opcoes.map(o => `<option${o === val ? ' selected' : ''}>${o}</option>`).join('')}</select>`
    : area
      ? `<textarea class="cx" rows="4" placeholder="${ph}">${val}</textarea>`
      : `<input class="cx${ro ? ' ro' : ''}" value="${val}" placeholder="${ph}" ${ro ? 'readonly' : ''}>`;

  const bts = (lupa ? ['lupa'] : acoes)
    .map(a => `<button class="act" title="${TITULO_ACAO[a] || ''}">${svg(a)}</button>`).join('');

  return `
    <div class="campo"${area ? ' style="min-height:96px"' : ''}>
      <div class="rot">${rot}</div>
      <div class="val">${codBox}${entrada}${bts}</div>
    </div>`;
}

function corpoDados() {
  return DADOS.map(campoHTML).join('');
}

/* ----------------------- grids com seleção ----------------------- */

/** Marca uma linha: é a marcação, e não a situação, que pinta a linha de verde. */
function marcarLinha(el) {
  const lin = el.closest('.lin'), grid = el.closest('.grid');
  const item = (COLECOES[grid.dataset.col] || []).find(c => c.id === lin.dataset.id);
  if (item) item.marcado = el.checked;
  lin.classList.toggle('marcada', el.checked);
  sincronizarCabecalho();
}

/** Caixa do cabeçalho: marca ou desmarca todas as linhas daquela grid. */
function marcarTodos(el) {
  const grid = el.closest('.grid');
  (COLECOES[grid.dataset.col] || []).forEach(c => { c.marcado = el.checked; });
  grid.querySelectorAll('.lin:not(.cab)').forEach(lin => {
    lin.querySelector('input').checked = el.checked;
    lin.classList.toggle('marcada', el.checked);
  });
  el.indeterminate = false;
}

/** Deixa a caixa do cabeçalho parcial quando só parte das linhas está marcada. */
function sincronizarCabecalho() {
  if (!raiz) return;
  raiz.querySelectorAll('.grid[data-col]').forEach(grid => {
    const cab = grid.querySelector('.lin.cab input');
    const col = COLECOES[grid.dataset.col];
    if (!cab || !col) return;
    const marcados = col.filter(c => c.marcado).length;
    cab.checked = marcados > 0 && marcados === col.length;
    cab.indeterminate = marcados > 0 && marcados < col.length;
  });
}

/**
 * Monta uma grid com coluna de seleção. `colunas` traz rótulo, largura e se a
 * célula é numérica; `celulas` devolve o conteúdo de cada linha, na ordem.
 */
function gridHTML({ col, colunas, itens, celulas, aoClicar }) {
  const larguras = '44px ' + colunas.map(c => c.w).join(' ');
  const cab = colunas.map(c =>
    `<span class="${c.num ? 'num' : ''}"><span class="rot">${c.rot}</span>` +
    `<span class="funil">${svg('funil')}</span></span>`).join('');

  const linhas = itens.map(it => `
    <div class="lin${it.zebra ? ' zebra' : ''}${it.marcado ? ' marcada' : ''}" data-id="${it.id}"
         ${aoClicar ? `onclick="${aoClicar(it)}"` : ''}>
      <span><input type="checkbox" ${it.marcado ? 'checked' : ''}
                   onclick="event.stopPropagation()" onchange="marcarLinha(this)"></span>
      ${celulas(it).map((v, i) => `<span class="${colunas[i].num ? 'num' : ''}">${v}</span>`).join('')}
    </div>`).join('');

  return `
    <div class="grid" data-col="${col}" style="--cols: ${larguras}">
      <div class="lin cab">
        <span><input type="checkbox" onclick="event.stopPropagation()" onchange="marcarTodos(this)"></span>
        ${cab}
      </div>
      ${linhas}
    </div>`;
}

function corpoDocumentos() {
  return gridHTML({
    col: 'documentos',
    itens: DOCUMENTOS,
    colunas: [
      { rot: 'ID', w: '80px', num: true },
      { rot: 'DESCRIÇÃO DOCUMENTO', w: '1fr' },
      { rot: 'OBRIGATÓRIO', w: '110px' },
      { rot: 'SITUAÇÃO', w: '130px' },
    ],
    celulas: d => [d.id, d.descricao, d.obrigatorio, d.situacao],
  });
}

function corpoChecklist() {
  if (itemChecklist) {
    const item = CHECKLIST.find(c => c.id === itemChecklist);
    return `
      <div style="display:flex;align-items:center;gap:10px">
        <button class="bt-fechar" style="background:#fff;border-color:var(--fld-bd);color:var(--txt)"
                onclick="itemChecklist=null;trocarCorpoDrawer()" title="Voltar">${svg('voltar')}</button>
        <span style="font-size:11px">Voltar</span>
        <div style="flex:1"></div>
        <button class="btn btn-primario btn-mini">Salvar</button>
      </div>
      ${campoHTML({ rot: 'Id', val: item.id, ro: true })}
      ${campoHTML({ rot: 'Item*', cod: '2', val: ITENS_CHECKLIST[item.id], ro: true, lupa: true })}
      ${campoHTML({ rot: 'Situação*', val: item.situacao })}
      ${campoHTML({ rot: 'Anotações', area: true })}`;
  }

  return gridHTML({
    col: 'checklist',
    itens: CHECKLIST,
    colunas: [
      { rot: 'ID', w: '72px', num: true },
      { rot: 'SITUAÇÃO', w: '1fr' },
    ],
    celulas: c => [c.id, c.situacao],
    aoClicar: c => `itemChecklist='${c.id}';trocarCorpoDrawer()`,
  });
}

function corpoProtocolo() {
  return PROTOCOLO.map(campoHTML).join('');
}

function corpoCondicoes() {
  return `<div class="vazio">Nenhuma condição cadastrada para esta etapa.</div>`;
}

const ABAS_DRAWER = [
  { id: 'dados',      rot: 'Dados',      corpo: corpoDados },
  { id: 'documentos', rot: 'Documentos', corpo: corpoDocumentos },
  { id: 'checklist',  rot: 'Checklist',  corpo: corpoChecklist },
  { id: 'condicoes',  rot: 'Condições',  corpo: corpoCondicoes },
];

/**
 * Conteúdo interno do drawer. O elemento <aside class="drawer"> fica sempre no
 * DOM — só o que está dentro dele é refeito — para que a classe `.aberto` possa
 * animar a entrada e a saída.
 */
function atualizarDrawer() {
  const drawerEl = raiz.querySelector('.drawer');

  if (conteudoDrawer === 'protocolo') {
    drawerEl.innerHTML = `
      <div class="drawer-topo">
        <button class="bt-fechar" onclick="fecharDrawer()" title="Fechar">${svg('x')}</button>
        <div class="drawer-titulo">
          <h3>Protocolo - ${PROTOCOLO_NUM}</h3>
        </div>
      </div>
      <div class="drawer-corpo scroll">${corpoProtocolo()}</div>`;
    return;
  }

  const e = ETAPAS.find(x => x.n === etapaSel);
  if (!e) return;

  const abas = ABAS_DRAWER.map(a => `
    <button class="${a.id === abaDrawer ? 'ativa' : ''}" onclick="trocarAba('${a.id}')">${a.rot}</button>`).join('');
  const corpo = ABAS_DRAWER.find(a => a.id === abaDrawer).corpo();

  const drawer = raiz.querySelector('.drawer');
  drawer.innerHTML = `
    <div class="drawer-topo">
      <button class="bt-fechar" onclick="fecharDrawer()" title="Fechar">${svg('x')}</button>
      <div class="drawer-titulo">
        <span class="num">${e.n}</span>
        <h3>${e.nome.replace(/<br>/g, ' ')}</h3>
      </div>
      <div class="drawer-abas">${abas}</div>
    </div>
    <div class="drawer-corpo scroll">${corpo}</div>
    <div class="drawer-rodape">
      <button class="btn ${e.estado === 'andamento' ? 'btn-claro' : 'btn-neutro'}"
              ${e.estado === 'andamento' ? '' : 'disabled'}>${svg('check')} Concluir etapa</button>
    </div>`;

  sincronizarCabecalho();
}

/* --------------------------------- ações --------------------------------- */

/* devem acompanhar as transições do .drawer e do .drawer.trocando no CSS */
const ANIM_DRAWER = 280;
const ANIM_TROCA = 150;
const ANIM_ABA = 140;    /* acompanha a transição de .drawer-corpo.saindo */
let limpezaDrawer = null;
let trocaCorpo = null;

/**
 * Navegação do fluxograma por clique e arraste, no lugar das barras de rolagem.
 * Um arraste acima do limiar cancela o clique, para não abrir o drawer sem querer.
 */
const LIMIAR_ARRASTO = 8;   // px de tolerância ao tremor da mão no clique

/**
 * A abertura da etapa acontece no `pointerup`, não no evento `click`: com a
 * captura de ponteiro ativa o clique é redirecionado para o container e nunca
 * chegaria ao card. Pelo mesmo motivo a captura só é pedida quando o arraste
 * realmente começa.
 */
function ativarArrasto(wrap) {
  let ativo = false, passou = false, rolou = false, alvo = null;
  let x0 = 0, y0 = 0, sl = 0, st = 0;

  wrap.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    ativo = true; passou = false; rolou = false;
    alvo = e.target.closest('.etapa');
    x0 = e.clientX; y0 = e.clientY;
    sl = wrap.scrollLeft; st = wrap.scrollTop;
  });

  wrap.addEventListener('pointermove', e => {
    if (!ativo) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (!passou) {
      if (Math.hypot(dx, dy) < LIMIAR_ARRASTO) return;   // ainda pode virar clique
      passou = true;
      wrap.classList.add('arrastando');
      // mantém o arraste vivo fora da área; se falhar, o arraste segue mesmo assim
      try { wrap.setPointerCapture(e.pointerId); } catch { /* ponteiro indisponível */ }
    }
    wrap.scrollLeft = sl - dx;
    wrap.scrollTop  = st - dy;
    // só vira arraste de verdade se a tela saiu do lugar
    if (wrap.scrollLeft !== sl || wrap.scrollTop !== st) rolou = true;
  });

  const encerrar = e => {
    if (!ativo) return false;
    ativo = false;
    wrap.classList.remove('arrastando');
    if (wrap.hasPointerCapture(e.pointerId)) wrap.releasePointerCapture(e.pointerId);
    return true;
  };

  wrap.addEventListener('pointerup', e => {
    if (!encerrar(e)) return;
    if (!rolou) {
      if (visaoGeral()) aplicarZoom(1, { x: e.clientX, y: e.clientY });
      else if (alvo) abrirEtapa(+alvo.dataset.n);
    }
    alvo = null;
  });

  wrap.addEventListener('pointercancel', e => { encerrar(e); alvo = null; });
}

/* onde o card clicado é posicionado na área visível: centrado na horizontal e
   na parte de cima na vertical, deixando as etapas seguintes à vista */
const ALVO_X = 0.5;
const ALVO_Y = 0.25;

/* ---------------------------------- zoom ---------------------------------- */

const ZOOM_MAX = 2;
const ZOOM_PASSO = 1.25;
const DESENHO_L = 594, DESENHO_A = 1213;   /* área ocupada pelas etapas */

let zoom = 1;
let escalaCaber = 1;      /* escala em que o fluxo inteiro cabe na área visível */
let espacoL = 0, espacoA = 0;   /* tamanho do canvas sem escala */
let desvioX = 0, desvioY = 0;   /* centralização quando o canvas é menor que a área */

/** Abaixo de 100% a tela está em visão geral: lupa no cursor, clique aproxima. */
function visaoGeral() { return zoom < 0.999; }

/**
 * Aplica a escala. O tamanho da caixa acompanha a escala para que a rolagem
 * continue batendo com o que se vê; `ponto` (coordenadas de tela) é mantido no
 * lugar, então o zoom acontece sob o cursor.
 */
function aplicarZoom(z, ponto) {
  const wrap = raiz.querySelector('.bpmn-wrap');
  const caixa = raiz.querySelector('.bpmn-zoom');
  const espaco = raiz.querySelector('.bpmn-espaco');
  z = Math.min(Math.max(z, escalaCaber), ZOOM_MAX);

  const r = wrap.getBoundingClientRect();
  const px = ponto ? ponto.x - r.left : wrap.clientWidth / 2;
  const py = ponto ? ponto.y - r.top : wrap.clientHeight / 2;
  const cx = (wrap.scrollLeft + px - desvioX) / zoom;   /* ponto do conteúdo sob o cursor */
  const cy = (wrap.scrollTop  + py - desvioY) / zoom;

  zoom = z;
  const escalaL = espacoL * z, escalaA = espacoA * z;
  /* quando o desenho é menor que a área, a caixa cresce até a área e o
     espaçador é deslocado para o meio — a rolagem sozinha não centralizaria */
  const caixaL = Math.max(escalaL, wrap.clientWidth);
  const caixaA = Math.max(escalaA, wrap.clientHeight);
  desvioX = (caixaL - escalaL) / 2;
  desvioY = (caixaA - escalaA) / 2;

  caixa.style.width  = Math.round(caixaL) + 'px';
  caixa.style.height = Math.round(caixaA) + 'px';
  espaco.style.transform = `translate(${desvioX}px, ${desvioY}px) scale(${z})`;

  wrap.scrollLeft = cx * z + desvioX - px;
  wrap.scrollTop  = cy * z + desvioY - py;
  wrap.classList.toggle('visao-geral', visaoGeral());
}

function maisZoom()  { aplicarZoom(zoom * ZOOM_PASSO); }
function menosZoom() { aplicarZoom(zoom / ZOOM_PASSO); }

/** Enquadra o fluxo inteiro na área visível. */
function enquadrarFluxo() {
  const wrap = raiz.querySelector('.bpmn-wrap');
  const espaco = raiz.querySelector('.bpmn-espaco');
  const bpmn = raiz.querySelector('.bpmn');

  espacoL = espaco.offsetWidth;    /* offset* ignora o transform */
  espacoA = espaco.offsetHeight;

  escalaCaber = Math.min(1,
    (wrap.clientWidth  - 40) / DESENHO_L,
    (wrap.clientHeight - 40) / DESENHO_A);

  zoom = 1; desvioX = 0; desvioY = 0;   /* zera antes, para aplicarZoom converter certo */
  aplicarZoom(escalaCaber);
  wrap.scrollLeft = (bpmn.offsetLeft + DESENHO_L / 2) * zoom + desvioX - wrap.clientWidth / 2;
  wrap.scrollTop  = (bpmn.offsetTop  + DESENHO_A / 2) * zoom + desvioY - wrap.clientHeight / 2;
}

/** Tela cheia da área do fluxo; o enquadramento é refeito ao entrar e sair. */
function alternarTelaCheia() {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (raiz.requestFullscreen) raiz.requestFullscreen();
}

document.addEventListener('fullscreenchange', () => {
  if (!raiz) return;
  const bt = raiz.querySelector('.zoom-ctrl .cheia');
  if (bt) bt.innerHTML = svg(document.fullscreenElement ? 'sairTelaCheia' : 'telaCheia');
  enquadrarFluxo();
});

/** Leva a etapa até o ponto de leitura da área visível. */
function centralizarEtapa(n) {
  const wrap = raiz.querySelector('.bpmn-wrap');
  const bpmn = raiz.querySelector('.bpmn');
  const card = raiz.querySelectorAll('.etapa')[ETAPAS.findIndex(e => e.n === n)];
  if (!wrap || !card) return;

  // offsetLeft/offsetTop ignoram o scale do hover, ao contrário de getBoundingClientRect
  const x = (bpmn.offsetLeft + card.offsetLeft + card.offsetWidth / 2) * zoom + desvioX;
  const y = (bpmn.offsetTop  + card.offsetTop  + card.offsetHeight / 2) * zoom + desvioY;
  wrap.scrollTo({
    left: x - wrap.clientWidth * ALVO_X,
    top:  y - wrap.clientHeight * ALVO_Y,
    behavior: 'smooth',
  });
}

/**
 * Clique numa etapa. Com o drawer fechado, ele entra deslizando pela direita;
 * já aberto em outra etapa, recua um pouco e volta com o novo conteúdo.
 */
function abrirEtapa(n) {
  clearTimeout(limpezaDrawer);
  const veioDoProtocolo = conteudoDrawer === 'protocolo';
  conteudoDrawer = 'etapa';
  const drawer = raiz.querySelector('.drawer');
  const trocando = drawer.classList.contains('aberto') && (veioDoProtocolo || (etapaSel !== null && etapaSel !== n));

  // o realce do card muda na hora, para o clique ter resposta imediata.
  // .aberta (verde escuro) só faz sentido para quem está em andamento
  raiz.querySelectorAll('.etapa').forEach((el, i) => {
    const desta = ETAPAS[i].n === n;
    el.classList.toggle('sel', desta);
    el.classList.toggle('aberta', desta && ETAPAS[i].estado === 'andamento');
  });

  const aplicar = () => { etapaSel = n; itemChecklist = null; atualizarDrawer(); };

  if (!trocando) {
    aplicar();
    drawer.classList.add('aberto');
    // só depois que o drawer terminou de entrar a área do fluxo tem a largura final
    setTimeout(() => centralizarEtapa(n), ANIM_DRAWER);
    return;
  }

  drawer.classList.add('trocando');
  setTimeout(() => {
    aplicar();
    drawer.classList.remove('trocando');
    centralizarEtapa(n);   // a largura não mudou: já dá para centralizar
  }, ANIM_TROCA);
}

/**
 * Abre as informações do protocolo no drawer. Nenhum card fica selecionado e o
 * fluxo é reenquadrado no espaço que sobra ao lado do drawer.
 */
function abrirProtocolo() {
  clearTimeout(limpezaDrawer);
  conteudoDrawer = 'protocolo';
  etapaSel = null;
  itemChecklist = null;
  raiz.querySelectorAll('.etapa').forEach(el => el.classList.remove('sel', 'aberta'));

  const drawer = raiz.querySelector('.drawer');
  if (drawer.classList.contains('aberto')) {
    drawer.classList.add('trocando');
    setTimeout(() => {
      atualizarDrawer();
      drawer.classList.remove('trocando');
      enquadrarFluxo();
    }, ANIM_TROCA);
  } else {
    atualizarDrawer();
    drawer.classList.add('aberto');
    setTimeout(enquadrarFluxo, ANIM_DRAWER);   // só então a área tem a largura final
  }
}

/** Troca só o corpo da aba, com a saída descendo e a entrada subindo, em fade. */
function trocarCorpoDrawer() {
  const corpo = raiz.querySelector('.drawer-corpo');
  corpo.classList.remove('entrando');
  corpo.classList.add('saindo');
  clearTimeout(trocaCorpo);
  trocaCorpo = setTimeout(() => {
    corpo.innerHTML = ABAS_DRAWER.find(a => a.id === abaDrawer).corpo();
    sincronizarCabecalho();
    corpo.classList.remove('saindo');
    void corpo.offsetWidth;            // reinicia a animação de entrada
    corpo.classList.add('entrando');
  }, ANIM_ABA);
}

function trocarAba(id) {
  if (id === abaDrawer) return;
  abaDrawer = id;
  itemChecklist = null;
  raiz.querySelectorAll('.drawer-abas button')
      .forEach((b, i) => b.classList.toggle('ativa', ABAS_DRAWER[i].id === id));
  trocarCorpoDrawer();
}

/** Fecha o drawer com o movimento inverso; só esvazia o conteúdo ao fim da animação. */
function fecharDrawer() {
  const drawer = raiz.querySelector('.drawer');
  drawer.classList.remove('aberto');
  raiz.querySelectorAll('.etapa').forEach(el => el.classList.remove('sel', 'aberta'));

  clearTimeout(limpezaDrawer);
  limpezaDrawer = setTimeout(() => {
    if (drawer.classList.contains('aberto')) return;  // reaberto durante a animação
    etapaSel = null;
    conteudoDrawer = 'etapa';
    drawer.innerHTML = '';
  }, ANIM_DRAWER);
}

/* ------------------------------- montagem ------------------------------- */

/**
 * Preenche `container` com o canvas do fluxo e o drawer, e liga as interações.
 * A tela que chama decide onde ele vive (modal no PO011, aba Cadastro no PO050)
 * e a largura do drawer, via --drawer-w.
 */
/** Botão de legenda das cores dos cards, com tooltip escuro no hover. */
function legendaCoresHTML() {
  const itens = [
    ['#A1BB3E', 'Etapa Tipo Início'],
    ['#2E6FD6', 'Etapa Tipo Tarefa'],
    ['#F5A623', 'Etapa Tipo Decisão'],
    ['#E53935', 'Etapa Tipo Fim'],
  ];
  return `
  <button class="legenda" title="Legenda das cores">
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 6C0 2.68629 2.68629 0 6 0H9V9H0V6Z" fill="#A4C614"/>
      <path d="M18 12C18 15.3137 15.3137 18 12 18L9 18L9 9L18 9L18 12Z" fill="#E53A36"/>
      <path d="M9 0H12C15.3137 0 18 2.68629 18 6V9H9V0Z" fill="#4390FF"/>
      <path d="M9 18L6 18C2.68629 18 -7.18831e-07 15.3137 -4.29138e-07 12L-1.66869e-07 9L9 9L9 18Z" fill="#FF9E12"/>
      <path d="M7.48587 11.2999H8.42462V8.79554H7.48587C6.96656 8.79554 6.54712 8.3748 6.54712 7.85389C6.54712 7.33297 6.96656 6.91223 7.48587 6.91223H9.35671C9.87601 6.91223 10.2955 7.33297 10.2955 7.85389V11.2999H10.6084C11.1277 11.2999 11.5471 11.7207 11.5471 12.2416C11.5471 12.7625 11.1277 13.1833 10.6084 13.1833H7.48587C6.96656 13.1833 6.54712 12.7625 6.54712 12.2416C6.54712 11.7207 6.96656 11.2999 7.48587 11.2999Z" fill="white"/>
      <path d="M9.04366 5.67002C9.73493 5.67002 10.2953 5.10789 10.2953 4.41448C10.2953 3.72106 9.73493 3.15894 9.04366 3.15894C8.35238 3.15894 7.79199 3.72106 7.79199 4.41448C7.79199 5.10789 8.35238 5.67002 9.04366 5.67002Z" fill="white"/>
    </svg>
    <span class="legenda-tip">${itens.map(([cor, txt]) => `
      <span class="li"><span class="bo" style="background:${cor}"></span>${txt}</span>`).join('')}
    </span>
  </button>`;
}

function montarFluxo(container) {
  raiz = container;
  container.innerHTML = `
    <div class="bpmn-wrap">
      <div class="bpmn-zoom">
        <div class="bpmn-espaco">
          <div class="bpmn">
            ${conectoresHTML()}
            ${ETAPAS.map(etapaHTML).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="zoom-ctrl">
      <button onclick="maisZoom()" title="Aproximar">${svg('mais_zoom', 'stroke-width="2.6"')}</button>
      <button onclick="menosZoom()" title="Afastar">${svg('menos_zoom', 'stroke-width="2.6"')}</button>
      ${legendaCoresHTML()}
      <button class="cheia" onclick="alternarTelaCheia()" title="Tela cheia">${svg('telaCheia')}</button>
    </div>

    <aside class="drawer"></aside>`;

  ativarArrasto(container.querySelector('.bpmn-wrap'));
  enquadrarFluxo();

  /* abre sem drawer; ?etapa=3&aba=checklist&item=22 entra direto numa etapa */
  const q = new URLSearchParams(location.search);
  if (ABAS_DRAWER.some(a => a.id === q.get('aba'))) abaDrawer = q.get('aba');
  if (CHECKLIST.some(c => c.id === q.get('item'))) itemChecklist = q.get('item');
  if (q.get('etapa') && ETAPAS.some(e => e.n === +q.get('etapa'))) {
    abrirEtapa(+q.get('etapa'));
    if (itemChecklist) atualizarDrawer();
  }
}
