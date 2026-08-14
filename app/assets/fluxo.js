/* ==========================================================================
   Centi — fluxograma do processo (BPMN) e drawer da etapa
   Depende de shell.js (dicionário ICO e helper svg). Ver montarFluxo() no fim.
   ========================================================================== */

let raiz = null;   /* container do fluxo, definido por montarFluxo */

/* ícone "timer" do Lucide (lucide.dev/icons/timer), traçado oficial */
Object.assign(ICO, {
  cronometro: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
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

const CHECKLIST = [
  { id: '21', situacao: 'Concluído',      classe: '' },
  { id: '22', situacao: 'Não Preenchido', classe: 'destaque' },
  { id: '23', situacao: 'Não Preenchido', classe: '' },
  { id: '24', situacao: 'Não Preenchido', classe: 'cinza' },
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
  <svg class="conectores" viewBox="0 0 594 1260">
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

function campoHTML({ rot, val = '', cod, ro = false, lupa = false, area = false }) {
  const codBox = cod !== undefined ? `<input class="cx cod ro" value="${cod}" readonly>` : '';
  const entrada = area
    ? `<textarea class="cx" rows="4"></textarea>`
    : `<input class="cx${ro ? ' ro' : ''}" value="${val}" ${ro ? 'readonly' : ''}>`;
  return `
    <div class="campo"${area ? ' style="min-height:96px"' : ''}>
      <div class="rot">${rot}</div>
      <div class="val">
        ${codBox}${entrada}
        ${lupa ? `<button class="act" title="Pesquisar">${svg('lupa')}</button>` : ''}
      </div>
    </div>`;
}

function corpoDados() {
  return DADOS.map(campoHTML).join('');
}

function corpoDocumentos() {
  return campoHTML({ rot: 'Id', val: '15', ro: true }) +
    `<div class="checklist"><div class="vazio">Nenhum documento vinculado a esta etapa.</div></div>`;
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

  const linhas = CHECKLIST.map(c => `
    <div class="lin ${c.classe}" onclick="itemChecklist='${c.id}';trocarCorpoDrawer()">
      <input type="checkbox" ${c.situacao === 'Concluído' ? 'checked' : ''} onclick="event.stopPropagation()">
      <span>${c.id}</span><span>${c.situacao}</span>
    </div>`).join('');

  return `
    <div class="checklist">
      <div class="lin cab"><span></span><span>ID</span><span>SITUAÇÃO</span></div>
      ${linhas}
    </div>`;
}

function corpoCondicoes() {
  return `<div class="checklist"><div class="vazio">Nenhuma condição cadastrada para esta etapa.</div></div>`;
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
  const e = ETAPAS.find(x => x.n === etapaSel);
  if (!e) return;

  const abas = ABAS_DRAWER.map(a => `
    <button class="${a.id === abaDrawer ? 'ativa' : ''}" onclick="trocarAba('${a.id}')">${a.rot}</button>`).join('');
  const corpo = ABAS_DRAWER.find(a => a.id === abaDrawer).corpo();

  raiz.querySelector('.drawer').innerHTML = `
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
      <button class="btn btn-primario">${svg('gerais')} Operações</button>
    </div>`;
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
    if (!rolou && alvo) abrirEtapa(+alvo.dataset.n);
    alvo = null;
  });

  wrap.addEventListener('pointercancel', e => { encerrar(e); alvo = null; });
}

/* onde o card clicado é posicionado na área visível: centrado na horizontal e
   na parte de cima na vertical, deixando as etapas seguintes à vista */
const ALVO_X = 0.5;
const ALVO_Y = 0.25;

/** Enquadra o fluxo ao abrir a tela: começo à vista e canvas centralizado. */
function enquadrarFluxo() {
  const wrap = raiz.querySelector('.bpmn-wrap');
  wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2;
  wrap.scrollTop = 0;
}

/** Leva a etapa até o ponto de leitura da área visível. */
function centralizarEtapa(n) {
  const wrap = raiz.querySelector('.bpmn-wrap');
  const bpmn = raiz.querySelector('.bpmn');
  const card = raiz.querySelectorAll('.etapa')[ETAPAS.findIndex(e => e.n === n)];
  if (!wrap || !card) return;

  // offsetLeft/offsetTop ignoram o scale do hover, ao contrário de getBoundingClientRect
  const x = bpmn.offsetLeft + card.offsetLeft + card.offsetWidth / 2;
  const y = bpmn.offsetTop  + card.offsetTop  + card.offsetHeight / 2;
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
  const drawer = raiz.querySelector('.drawer');
  const trocando = drawer.classList.contains('aberto') && etapaSel !== null && etapaSel !== n;

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

/** Troca só o corpo da aba, com a saída descendo e a entrada subindo, em fade. */
function trocarCorpoDrawer() {
  const corpo = raiz.querySelector('.drawer-corpo');
  corpo.classList.remove('entrando');
  corpo.classList.add('saindo');
  clearTimeout(trocaCorpo);
  trocaCorpo = setTimeout(() => {
    corpo.innerHTML = ABAS_DRAWER.find(a => a.id === abaDrawer).corpo();
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
    drawer.innerHTML = '';
  }, ANIM_DRAWER);
}

/* ------------------------------- montagem ------------------------------- */

/**
 * Preenche `container` com o canvas do fluxo e o drawer, e liga as interações.
 * A tela que chama decide onde ele vive (modal no PO011, aba Cadastro no PO050)
 * e a largura do drawer, via --drawer-w.
 */
function montarFluxo(container) {
  raiz = container;
  container.innerHTML = `
    <div class="bpmn-wrap">
      <div class="bpmn-espaco">
        <div class="bpmn">
          ${conectoresHTML()}
          ${ETAPAS.map(etapaHTML).join('')}
        </div>
      </div>
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
