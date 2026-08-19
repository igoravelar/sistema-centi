/* ==========================================================================
   Centi — shell compartilhado (topbar, sidebar, abas de documento)
   Estrutura e medidas conforme "Protocolo Digital.fig"
   ========================================================================== */

const ICO = {
  protocolo: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  gerais: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  planejamento: '<path d="M3 3v18h18"/><polyline points="19,9 13,15 9,11 5,15"/>',
  compras: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  folha: '<circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5a3 3 0 0 0-3-1.5c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3 3 0 0 1-3-1.5"/>',
  arrecadacao: '<path d="M2 16s3-5 7-5 4 4 7 4 6-5 6-5"/><path d="M2 20h20"/>',
  contabilidade: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="8" y2="11"/><line x1="12" y1="11" x2="12" y2="11"/><line x1="16" y1="11" x2="16" y2="11"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="12" y1="16" x2="12" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',
  financeiro: '<line x1="3" y1="21" x2="21" y2="21"/><polygon points="12,3 21,9 3,9"/><line x1="6" y1="9" x2="6" y2="21"/><line x1="12" y1="9" x2="12" y2="21"/><line x1="18" y1="9" x2="18" y2="21"/>',
  almoxarifado: '<path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 12h18"/>',
  frotas: '<path d="M5 17H3v-5l2-5h11l3 5h2v5h-2"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/>',
  patrimonio: '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="11" y1="8" x2="11" y2="16"/><line x1="15" y1="8" x2="15" y2="16"/>',
  treinamentos: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',

  casa: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  sino: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  arquivo: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/>',
  fluxo: '<rect x="2" y="3" width="7" height="6" rx="1"/><rect x="15" y="15" width="7" height="6" rx="1"/><path d="M5.5 9v5a4 4 0 0 0 4 4H15"/>',
  fluxograma: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/><path d="M12 7v3"/><path d="M5 16v-2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2"/>',
  tramitacao: '<rect x="2" y="8.5" width="7" height="7" rx="1.5"/><rect x="15" y="8.5" width="7" height="7" rx="1.5"/><line x1="9" y1="12" x2="13" y2="12"/><polyline points="11.5,9.5 14,12 11.5,14.5"/>',
  lupa: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  lapis: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  notas: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/>',
  robo: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
  chevron: '<polyline points="9,18 15,12 9,6"/>',
  chevronBaixo: '<polyline points="6,9 12,15 18,9"/>',
  alternar: '<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="8" cy="12" r="3" fill="currentColor"/>',
  painel: '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="10" y1="4" x2="10" y2="20"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 15,14"/>',
  engrenagens: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  play: '<circle cx="12" cy="12" r="9"/><polygon points="10,8 16,12 10,16"/>',
  monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7"/><line x1="12" y1="17" x2="12" y2="17"/>',
  power: '<path d="M12 3v9"/><path d="M6.4 6.4a8 8 0 1 0 11.2 0"/>',
  salvar: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>',
  lixeira: '<polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  mais: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  pasta: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  check: '<polyline points="20,6 9,17 4,12"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
  download: '<path d="M12 3v12"/><polyline points="7,11 12,16 17,11"/><line x1="4" y1="20" x2="20" y2="20"/>',
  borracha: '<path d="M4 16 12 8l6 6-5 5H7z"/><line x1="4" y1="21" x2="20" y2="21"/>',
  seta: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>',
  voltar: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>',
};

/** <svg> a partir de um path do dicionário ICO */
function svg(nome, extra = '') {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICO[nome] || ''}</svg>`;
}

/* `paginas` lista as telas que pertencem ao módulo: é o que o marca como ativo */
const MODULOS = [
  { nome: 'Gerais',              ico: 'gerais' },
  { nome: 'Protocolo',           ico: 'protocolo', href: 'protocolo.html',
    paginas: ['protocolo.html', 'po002.html', 'po011.html', 'po050.html', 'po051.html'] },
  { nome: 'Planejamento',        ico: 'planejamento',  chev: true },
  { nome: 'Compras/Licitação',   ico: 'compras',       chev: true },
  { nome: 'Folha de Pagamento',  ico: 'folha',         chev: true },
  { nome: 'Arrecadação',         ico: 'arrecadacao',   chev: true },
  { nome: 'Contabilidade',       ico: 'contabilidade', chev: true },
  { nome: 'Financeiro',          ico: 'financeiro' },
  { nome: 'Almoxarifado',        ico: 'almoxarifado' },
  { nome: 'Frotas',              ico: 'frotas' },
  { nome: 'Patrimônio',          ico: 'patrimonio' },
];

/**
 * Abas de documento. `home` e `notif` são fixas; as demais só aparecem quando a
 * tela declara que estão abertas (ver montarShell).
 */
const ABAS = {
  home:      { ico: 'casa',      href: 'prototipo.html' },
  notif:     { ico: 'sino',      rotulo: 'Notificações', href: '#' },
  protocolo: { ico: 'protocolo', rotulo: 'Protocolo', href: 'protocolo.html', fechavel: true },
  po002:     { ico: 'arquivo',   rotulo: 'PO002 - Protocolo', href: 'po002.html', fechavel: true },
  po011:     { ico: 'fluxo',     rotulo: 'PO011 - Central de Protocolos', href: 'po011.html', fechavel: true },
  po050:     { ico: 'fluxo',      rotulo: 'PO050 - Fluxo de Processos', href: 'po050.html', fechavel: true },
  po051:     { ico: 'tramitacao', rotulo: 'PO051 - Tramitação de Protocolo', href: 'po051.html', fechavel: true },
};

function topbarHTML() {
  const icones = ['relogio', 'engrenagens', 'play', 'monitor', 'usuario', 'lupa', 'ajuda', 'power'];
  return `
  <header class="topbar">
    <a href="index.html" title="Início"><img class="marca" src="assets/img/marca-centi.png" alt="Centi"></a>
    <div class="burger" title="Recolher menu"><i></i><i></i><i></i></div>
    <div class="grupos-ref">
      <div class="field-group">
        <span class="lbl">Referência</span>
        <select aria-label="Mês de referência">
          <option>Agosto</option><option>Julho</option><option>Junho</option>
        </select>
        <select aria-label="Ano de referência">
          <option>2026</option><option>2025</option><option>2024</option>
        </select>
      </div>
      <div class="field-group">
        <span class="lbl">Órgão</span>
        <select style="width:286px" aria-label="Órgão">
          <option>02 - Prefeitura Municipal de Rio Verde</option>
          <option>01 - Câmara Municipal de Rio Verde</option>
        </select>
      </div>
    </div>
    <div class="spacer"></div>
    <span class="user">admin|3.0.209.55</span>
    <div class="icons">${icones.map(i => `<button title="${i}">${svg(i)}</button>`).join('')}</div>
  </header>`;
}

function sidebarHTML() {
  // o módulo só fica marcado quando a tela aberta pertence a ele (o Início não marca nenhum)
  const pagina = location.pathname.split('/').pop() || 'index.html';
  const itens = MODULOS.map(m => `
    <a class="mod${(m.paginas || []).includes(pagina) ? ' ativo' : ''}" href="${m.href || '#'}">
      <span class="tile">${svg(m.ico)}</span>
      <span class="nome">${m.nome}</span>
      ${m.chev ? `<span class="chev">${svg('chevron')}</span>` : ''}
    </a>`).join('');

  return `
  <aside class="sidebar">
    <div class="busca"><input placeholder="Pesquisar..." aria-label="Pesquisar no menu"></div>
    <nav class="scroll">${itens}</nav>
    <a class="mod treinamentos" href="#">
      <span class="tile">${svg('treinamentos')}</span>
      <span class="nome">Central de Treinamentos</span>
    </a>
  </aside>`;
}

/* As abas abertas vivem na sessão do navegador, e não em cada página: navegar
   entre telas não pode fechar as outras. Só o × tira uma aba da lista. */
const CHAVE_ABAS = 'centi:abas';

function abasAbertas() {
  try { return JSON.parse(sessionStorage.getItem(CHAVE_ABAS)) || []; }
  catch { return []; }
}

function guardarAbas(ids) {
  try { sessionStorage.setItem(CHAVE_ABAS, JSON.stringify(ids)); }
  catch { /* sessão indisponível: as abas valem só nesta página */ }
}

/** Fecha a aba pelo ×. Se era a aba em foco, abre a aba imediatamente à
    esquerda; quando a vizinha é Notificações (que não é uma tela), cai na
    aba de Início. */
function fecharAba(id, botao) {
  const antes = abasAbertas();
  guardarAbas(antes.filter(x => x !== id));
  const aba = botao.closest('.doctab');
  const eraAtiva = aba.classList.contains('ativa');
  aba.remove();
  if (!eraAtiva) return;
  const ordem = ['home', 'notif', ...antes];
  let i = ordem.indexOf(id) - 1;
  while (i > 0 && (ordem[i] === 'notif' || !ABAS[ordem[i]])) i--;
  location.href = ABAS[ordem[i]] ? ABAS[ordem[i]].href : ABAS.home.href;
}

function doctabsHTML(atual, abertas) {
  const ids = ['home', 'notif', ...abertas];
  const tabs = ids.map(id => {
    const a = ABAS[id];
    if (!a) return '';
    return `
    <a class="doctab${id === atual ? ' ativa' : ''}" href="${a.href}">
      ${svg(a.ico)}
      ${a.rotulo ? `<span>${a.rotulo}</span>` : ''}
      ${a.fechavel ? `<button class="fechar" title="Fechar aba"
          onclick="event.preventDefault();event.stopPropagation();fecharAba('${id}', this)">×</button>` : ''}
    </a>`;
  }).join('');

  const controles = [
    { i: 'alternar', t: 'Alternar exibição' },
    { i: 'painel',   t: 'Dividir área de trabalho' },
    { i: 'chevronBaixo', t: 'Mais abas' },
  ].map(c => `<button title="${c.t}">${svg(c.i)}</button>`).join('');

  return `<div class="doctabs">${tabs}<div class="doctabs-controles">${controles}</div></div>`;
}

/**
 * Monta o shell dentro de <div class="app"> e devolve o <main> para a tela
 * preencher. A aba da tela atual entra na lista da sessão se ainda não estiver
 * lá; as demais são preservadas.
 *
 * @param {string} atual id da aba em foco ('home', 'protocolo', 'po002'...)
 */
function montarShell(atual) {
  const abertas = abasAbertas();
  if (ABAS[atual] && ABAS[atual].fechavel && !abertas.includes(atual)) abertas.push(atual);
  guardarAbas(abertas);

  const app = document.querySelector('.app');
  app.insertAdjacentHTML('afterbegin', topbarHTML() + sidebarHTML());
  const main = document.createElement('main');
  main.className = 'main';
  main.innerHTML = doctabsHTML(atual, abertas);
  app.appendChild(main);
  return main;
}
