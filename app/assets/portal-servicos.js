/* ==========================================================================
   Portal de Serviços — monta o topo, o menu lateral e o rodapé das telas
   logadas. Cada página chama montarPortal('<id da tela>') e põe o próprio
   conteúdo no <main>.
   ========================================================================== */

/* módulos do menu; item com `href` é tela do protótipo, `externo` abre em nova aba */
const MENU_PORTAL = [
  { id: 'home', rot: 'Home', ico: 'fas fa-home', href: 'portal-servicos-home.html' },
  { id: 'protocolo', rot: 'Protocolo', ico: 'fas fa-receipt', itens: [
    { id: 'meus-protocolos', rot: 'Meus Protocolos', href: 'portal-servicos-protocolos.html' },
    { rot: 'Assinatura Documentos', href: 'portal-ass.html', externo: true },
  ] },
  { id: 'contribuinte', rot: 'Contribuinte', ico: 'fas fa-dollar-sign', itens: [
    { rot: 'Taxas' }, { rot: 'Processos' }, { rot: 'Consultar NFSA-e' }, { rot: 'Emitir NFSA-e' }, { rot: 'Débitos' },
    { rot: 'Solicitar Credenciamento NFSA' }, { rot: 'NFS-e Tomadas' }, { rot: 'Solicitações' },
  ] },
  { id: 'imovel', rot: 'Imóvel', ico: 'fas fa-house-user', itens: [
    { rot: 'Gerenciar Usuários' },
  ] },
  { id: 'nota-fiscal', rot: 'Nota Fiscal', ico: 'far fa-file-alt', itens: [
    { rot: 'Configurações' }, { rot: 'Cadastro de Serviço' }, { rot: 'Consultar XML/RPS' }, { rot: 'Consultar NFS-e' },
    { rot: 'Emitir NFS-e' }, { rot: 'DMS-e' }, { rot: 'REST-e' }, { rot: 'Gerenciar Usuários' }, { rot: 'Plano de Contas' },
    { rot: 'Relações Tomadores' }, { rot: 'Tributos Federais' }, { rot: 'Consulta Processual' }, { rot: 'Credenciamento' },
    { rot: 'Notas Credenciadas' }, { rot: 'Mensalistas' }, { rot: 'Grupos Mensalistas' },
  ] },
  { id: 'atividade', rot: 'Atividade Econômica', ico: 'far fa-chart-bar', itens: [
    { rot: 'Empresas' }, { rot: 'Contador' },
  ] },
  { id: 'mensagens', rot: 'Mensagens e Avisos', ico: 'far fa-envelope', badge: 0 },
];

/* quais módulos estão abertos: fica na sessão para sobreviver à troca de tela */
const CHAVE_ABERTOS = 'portal-servicos:menu-abertos';
const CHAVE_RECOLHIDO = 'portal-servicos:menu-recolhido';

function lerAbertos() {
  try { return JSON.parse(sessionStorage.getItem(CHAVE_ABERTOS)) || []; }
  catch { return []; }
}
function gravarAbertos(lista) {
  try { sessionStorage.setItem(CHAVE_ABERTOS, JSON.stringify(lista)); } catch { /* sem armazenamento */ }
}

function menuPortalHTML(atual) {
  const abertos = lerAbertos();
  return MENU_PORTAL.map(m => {
    if (!m.itens) {
      const ativo = m.id === atual;
      const fim = m.badge !== undefined ? `<span class="badge-menu">${m.badge}</span>` : '';
      return `<a class="item${ativo ? ' ativo' : ''}${m.id === 'home' ? ' home' : ''}"${m.href ? ` href="${m.href}"` : ''} title="${m.rot}"><i class="${m.ico}"></i><span>${m.rot}</span>${fim}</a>`;
    }
    const temAtual = m.itens.some(i => i.id === atual);
    const aberto = temAtual || abertos.includes(m.id);
    const itens = m.itens.map(i => {
      const alvo = i.externo ? ' target="_blank" rel="noopener"' : '';
      const ico = i.externo ? ' <i class="fas fa-external-link-alt externo"></i>' : '';
      return `<a class="subitem${i.id === atual ? ' ativo' : ''}"${i.href ? ` href="${i.href}"` : ''}${alvo}>${i.rot}${ico}</a>`;
    }).join('');
    return `
      <div class="grupo${aberto ? ' aberto' : ''}" data-grupo="${m.id}">
        <a class="item" title="${m.rot}" onclick="alternarGrupo('${m.id}')"><i class="${m.ico}"></i><span>${m.rot}</span><i class="fas fa-chevron-down seta"></i></a>
        <div class="subitens"><div>${itens}</div></div>
      </div>`;
  }).join('');
}

/** Abre ou fecha um módulo. Com o menu recolhido, expande o menu e abre o módulo. */
function alternarGrupo(id) {
  const g = document.querySelector(`.grupo[data-grupo="${id}"]`);
  if (document.body.classList.contains('recolhido')) {
    recolherMenu(false);
    g.classList.add('aberto');
  } else {
    g.classList.toggle('aberto');
  }
  gravarAbertos([...document.querySelectorAll('.grupo.aberto')].map(e => e.dataset.grupo));
}

function recolherMenu(r) {
  document.body.classList.toggle('recolhido', r);
  const t = r ? 'Expandir menu' : 'Recolher menu';
  ['burger', 'recolher'].forEach(id => { const b = document.getElementById(id); if (b) { b.title = t; b.setAttribute('aria-label', t); } });
  try { localStorage.setItem(CHAVE_RECOLHIDO, r ? '1' : '0'); } catch { /* vale só nesta página */ }
}

function montarPortal(atual) {
  document.body.insertAdjacentHTML('afterbegin', `
<header class="topo">
  <a class="marca-elo" href="index.html" title="Ir para o ERP Centi"><img class="marca" src="assets/img/marca-centi-branca.svg" alt="Centi"></a>
  <button class="burger" type="button" id="burger" title="Recolher menu" aria-label="Recolher menu"><i class="fas fa-bars"></i></button>
  <span class="municipio">Município de Rio Verde</span>
  <div class="dir">
    <div class="cliente">
      <span>Cliente Teste</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8 20.5h8M12 16.5v4"/><path d="M10.2 7.4v5.2l4.4-2.6z" fill="currentColor"/>
      </svg>
    </div>
    <button class="ico-topo sino" type="button" title="Notificações"><i class="far fa-bell"></i><span class="badge">0</span></button>
    <div class="opcoes" id="opcoes">
      <button class="ico-topo" type="button" title="Mais opções" aria-label="Mais opções" onclick="this.parentElement.classList.toggle('aberto')"><i class="fas fa-ellipsis-v"></i></button>
      <div class="opcoes-menu">
        <a href="portal-servicos.html"><i class="fas fa-sign-out-alt"></i> Sair</a>
      </div>
    </div>
  </div>
</header>

<aside class="menu">
  <nav>${menuPortalHTML(atual)}</nav>
  <button class="recolher" type="button" id="recolher" title="Recolher menu" aria-label="Recolher menu"><i class="fas fa-chevron-left"></i></button>
</aside>`);

  document.body.insertAdjacentHTML('beforeend', `
<footer>
  <span class="copy"><b>Centi</b> © 2020.</span>
  <span class="info">Endereço<br>Av. Presidente Vargas, 3215, Vila Maria CEP: 75905900</span>
  <span class="info">Horário<br>Seg a Sex das 08:00 às 11:30 / 13h às 17h</span>
  <span class="info">Telefone<br>(64) 3602-8000</span>
</footer>`);

  /* menu recolhido (só os ícones): pelo ☰ do topo ou pela seta do pé do menu */
  let recolhido = false;
  try { recolhido = localStorage.getItem(CHAVE_RECOLHIDO) === '1'; } catch { /* sem armazenamento */ }
  recolherMenu(recolhido);
  const alternar = () => recolherMenu(!document.body.classList.contains('recolhido'));
  document.getElementById('burger').addEventListener('click', alternar);
  document.getElementById('recolher').addEventListener('click', alternar);

  /* fecha o menu de mais opções ao clicar fora dele */
  document.addEventListener('click', e => {
    const o = document.getElementById('opcoes');
    if (!o.contains(e.target)) o.classList.remove('aberto');
  });
}
