/* Conversas internas do registro aberto, no pé da coluna de pastas.
   Compartilhado pelo PO002 e pelo PO050. Funciona como o chat interno do
   PO051: uma conversa pública, que todos que entram no registro veem, e as
   conversas privadas, criadas pelo Novo Grupo com as pessoas escolhidas.

   A tela que usa este módulo chama colPastasHTML() no lugar da coluna de
   pastas, troca o lado direito por conversaHTML() enquanto houver conversa
   aberta e chama ajustarConversa() ao fim do seu render(). Toda mudança de
   estado daqui redesenha a tela pelo render() dela. */

/* ícones do chat: o balão duplo e o fone (Lucide) */
Object.assign(ICO, {
  baloes: '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>',
  fone: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  clipe: '<path d="M21.4 11.05 12.25 20.2a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.66l-9.19 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
});

/* ícones cheios (Font Awesome 5 Free, CC BY 4.0; o avião de enviar vem do Figma) */
const FA_CONV = {
  comentarios: { vb: '0 0 576 512', d: 'M416 192c0-88.4-93.1-160-208-160S0 103.6 0 192c0 34.3 14.1 65.9 38 92-13.4 30.2-35.5 54.2-35.8 54.5-2.2 2.3-2.8 5.7-1.5 8.7S4.8 352 8 352c36.6 0 66.9-12.3 88.7-25 32.2 15.7 70.3 25 111.3 25 114.9 0 208-71.6 208-160zm122 220c23.9-26 38-57.7 38-92 0-66.9-53.5-124.2-129.3-148.1.9 6.6 1.3 13.3 1.3 20.1 0 105.9-107.7 192-240 192-10.8 0-21.3-.8-31.7-1.9C207.8 439.6 281.8 480 368 480c41 0 79.1-9.2 111.3-25 21.8 12.7 52.1 25 88.7 25 3.2 0 6.1-1.9 7.3-4.8 1.3-2.9.7-6.3-1.5-8.7-.3-.3-22.4-24.2-35.8-54.5z' },
  enviar: { vb: '0 0 12 12', d: 'M11.3186 4.90008L1.77651 0.133111C0.7689 -0.370273 -0.324647 0.642234 0.0902771 1.69434L1.19657 4.49945C1.36264 4.92055 1.74458 5.21629 2.19162 5.27001L5.1157 5.62131C5.59286 5.67863 5.59794 6.37346 5.12166 6.43784L2.17374 6.83626C1.73631 6.89538 1.36415 7.18635 1.19907 7.59819L0.116616 10.2993C-0.305331 11.3522 0.789751 12.3717 1.80033 11.8668L11.3186 7.11176C12.2271 6.65791 12.2271 5.35393 11.3186 4.90008Z' },
  chevronDireita: { vb: '0 0 512 512', d: 'M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zm113.9 231L234.4 103.5c-9.4-9.4-24.6-9.4-33.9 0l-17 17c-9.4 9.4-9.4 24.6 0 33.9L285.1 256 183.5 357.6c-9.4 9.4-9.4 24.6 0 33.9l17 17c9.4 9.4 24.6 9.4 33.9 0L369.9 273c9.4-9.4 9.4-24.6 0-34z' },
  chevronBaixo: { vb: '0 0 512 512', d: 'M504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zM273 369.9l135.5-135.5c9.4-9.4 9.4-24.6 0-33.9l-17-17c-9.4-9.4-24.6-9.4-33.9 0L256 285.1 154.4 183.5c-9.4-9.4-24.6-9.4-33.9 0l-17 17c-9.4 9.4-9.4 24.6 0 33.9L239 369.9c9.4 9.4 24.6 9.4 34 0z' },
};

function faConv(nome, attrs = '') {
  const i = FA_CONV[nome];
  return `<svg viewBox="${i.vb}" fill="currentColor" aria-hidden="true"${attrs ? ' ' + attrs : ''}><path d="${i.d}"/></svg>`;
}

/* ------------------------------- estado ------------------------------- */

let conversaAberta = null;   /* null = formulário; 'publica'; ou o índice do grupo privado */
let conversaPublica = [];    /* falas da conversa pública */
let gruposConversa = [];     /* { participantes: [...], falas: [...] } */
let avisoFechado = false;    /* o aviso do Vicenti, uma vez fechado, não volta nesta visita */
let faixaDispensada = false; /* o pino recolhe a faixa de vez */
let novoGrupoAberto = false; /* modal de Novo Grupo */
let grupoSel = [];           /* participantes já incluídos no campo da modal */

const EU_CONV = { quem: 'Igor Avelar', ini: 'IA', cor: '#25C35F' };

const PARTICIPANTES_CONV = [
  'ABEL HENRIQUE BARBOSA',
  'ADRIANA DE OLIVEIRA',
  'BRUNO CARLOS CHAGAS',
  'SÉRGIO DE PÁDUA SILVA',
  'MARIA APARECIDA DO SOCORRO ALVARENGA DA SILVA',
  'VICTOR CARLOS MACEDO ALBUQUERQUE',
];

/** O clique no título Conversas abre a conversa pública; com ela aberta,
    o mesmo clique fecha e devolve o formulário. */
function alternarConversas() {
  conversaAberta = conversaAberta === 'publica' ? null : 'publica';
  novoGrupoAberto = false;
  render();
}

function abrirConversa(qual) { conversaAberta = qual; novoGrupoAberto = false; render(); }

/** Clicar numa pasta da árvore volta ao formulário. */
function fecharConversa() {
  if (conversaAberta === null) return;
  conversaAberta = null;
  novoGrupoAberto = false;
  render();
}

function fecharAviso() { avisoFechado = true; render(); }

/** O que guardar ao sair da aba e devolver na volta. */
function estadoConversas() { return { conversaAberta, conversaPublica, gruposConversa }; }
function restaurarConversas(s) {
  if (!s) return;
  conversaAberta = s.conversaAberta ?? null;
  conversaPublica = s.conversaPublica || [];
  gruposConversa = s.gruposConversa || [];
}

/* ------------------------- coluna de pastas ------------------------- */

const primeiroNome = n => n.split(' ')[0].charAt(0) + n.split(' ')[0].slice(1).toLowerCase();

function rotuloGrupo(g) {
  const nomes = g.participantes.map(primeiroNome);
  return nomes.length <= 2 ? nomes.join(' e ')
       : `${nomes.slice(0, 2).join(', ')} e mais ${nomes.length - 2}`;
}

/** A coluna da esquerda: a árvore rola e a seção Conversas fica presa no pé.
    Sem registro aberto (`comConversas` falso) só a árvore aparece. */
function colPastasHTML(arvore, comConversas = true) {
  const aberta = conversaAberta !== null;
  const grupos = gruposConversa.length
    ? `<div class="grupos">${gruposConversa.map((g, i) => `
        <button class="grupo${conversaAberta === i ? ' ativa' : ''}" onclick="abrirConversa(${i})"
                title="${g.participantes.join(', ')}">${svg('pessoas')}<span>${rotuloGrupo(g)}</span></button>`).join('')}
      </div>`
    : '<p class="vazio">Sem conversas privadas.</p>';

  const rodape = !comConversas ? '' : `
      <div class="conversas${conversaAberta === 'publica' ? ' ativa' : ''}">
        <div class="cab" onclick="alternarConversas()">${faConv(aberta ? 'chevronBaixo' : 'chevronDireita')}${faConv('comentarios', 'class="balao"')} Conversas</div>
        ${aberta ? grupos : ''}
      </div>`;

  return `
    <div class="col-pastas">
      <div class="arvore scroll" onclick="fecharConversa()">${arvore}</div>${rodape}
    </div>`;
}

/* ----------------------------- a conversa ----------------------------- */

function conversaHTML() {
  const privada = conversaAberta !== 'publica';
  const g = privada ? gruposConversa[conversaAberta] : null;
  const falas = privada ? g.falas : conversaPublica;
  const n = privada ? g.participantes.length + 1 : 1;

  const intro = privada ? `
        <div class="cabeca">${faConv('comentarios')}<h3>Conversa<br>Privada</h3></div>
        <p>Só os participantes deste grupo veem e escrevem nesta conversa sobre o registro acessado.</p>
        <hr>
        <p class="menor"><strong>Participantes:</strong> ${[EU_CONV.quem.toUpperCase(), ...g.participantes].join(', ')}.</p>`
    : `
        <div class="cabeca">${faConv('comentarios')}<h3>Conversas<br>Internas</h3></div>
        <p>Este chat é destinado apenas para conversas internas entre usuários do sistema Centi a respeito do registro acessado.</p>
        <hr>
        <p class="menor"><strong>Conversas públicas:</strong> todas as pessoas que entrarem neste registro irão ver e realizar comentários.</p>
        <p class="menor"><strong>Conversas privadas:</strong> crie um <b>NOVO GRUPO</b> selecionando as pessoas com quem deseja conversar reservadamente sobre o registro.</p>`;

  const faixa = privada
    ? '<strong>Conversa privada:</strong> só os participantes deste grupo veem estas mensagens.'
    : '<strong>Conversas internas:</strong> Este chat é destinado apenas para conversas internas entre usuários do sistema Centi a respeito do registro acessado.';

  return `
  <div class="conv">
    <div class="conv-topo">
      <span class="conv-marca">${faConv('comentarios')}</span>
      <div class="conv-tit">
        <b>${privada ? 'Conversa Privada' : 'Conversas entre Servidores Públicos'}</b>
        <span>${svg('usuario')} Chat com <b>${n}</b> ${n === 1 ? 'participante' : 'participantes'} ${svg('chevronBaixo')}</span>
      </div>
      ${avisoFechado ? '' : `<div class="conv-aviso"><span class="proibido">${svg('robo')}</span><span>Este <b>NÃO</b> é o chat do Vicenti ou do Suporte Centi.</span><button class="fechar-aviso" type="button" title="Fechar aviso" onclick="fecharAviso()">${svg('x')}</button></div>`}
      <button class="btn btn-claro" onclick="abrirNovoGrupo()">${svg('pessoas')} Novo Grupo</button>
    </div>
    <div class="conv-corpo">
      <div class="conv-faixa" id="conv-faixa">
        <p>${faixa}</p>
        <button type="button" title="Dispensar" onclick="dispensarFaixa()">${svg('pin')}</button>
      </div>
      <div class="conv-msgs fundo-pontos scroll" id="conv-msgs" onscroll="conferirFaixa()">
        <div class="conv-vazio" id="conv-intro">${intro}
          <div class="atencao">
            <span class="rot" title="Atenção">${svg('fone')}</span>
            <p>Para falar com um atendente do Suporte CENTI, acesse a aba <em>VICENTI</em>, selecione <em>Orientação</em> e clique em <em>Falar com Atendente</em>.</p>
          </div>
        </div>
        <div class="conv-falas" id="conv-falas">${falas.map(falaConvHTML).join('')}</div>
      </div>
    </div>
    <div class="chat-input">
      <div class="linha">
        <input type="text" id="conv-texto" placeholder="Digite aqui..." onkeydown="if (event.key === 'Enter') enviarFala()">
        <button class="clipe" title="Anexar arquivo">${svg('clipe')}</button>
        <button class="enviar" title="Enviar" onclick="enviarFala()">${faConv('enviar')}</button>
      </div>
    </div>
    ${novoGrupoHTML()}
  </div>`;
}

/* Falas: as minhas entram em balões verdes, à direita, embaixo da mensagem
   inicial. A mensagem começa centrada e sobe com a rolagem à medida que a
   conversa cresce; quando ela sai de vista, a faixa fixa desce do título. */
const escaparConv = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function falaConvHTML(f) {
  return `
    <div class="fala eu">
      <div class="cab"><span class="avatar" style="background:${EU_CONV.cor}">${EU_CONV.ini}</span><b>${EU_CONV.quem}</b></div>
      <div class="bolha">${f.txt}</div>
      <div class="hora">${svg('relogio')}<span>${f.hora}</span></div>
    </div>`;
}

function enviarFala() {
  const campo = document.getElementById('conv-texto');
  const txt = campo.value.trim();
  if (!txt) return;
  const f = { txt: escaparConv(txt),
              hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
  (conversaAberta === 'publica' ? conversaPublica : gruposConversa[conversaAberta].falas).push(f);
  document.getElementById('conv-falas').insertAdjacentHTML('beforeend', falaConvHTML(f));
  campo.value = '';
  campo.focus();
  const msgs = document.getElementById('conv-msgs');
  msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });
}

/* a mensagem inicial nasce centrada: o recuo de cima é calculado só por ela,
   então as falas ocupam o espaço de baixo e, quando ele acaba, empurram tudo */
function ajustarConversa() {
  const msgs = document.getElementById('conv-msgs');
  if (!msgs) return;
  const intro = document.getElementById('conv-intro');
  msgs.style.paddingTop = Math.max(24, (msgs.clientHeight - intro.offsetHeight) / 2) + 'px';
  msgs.scrollTop = msgs.scrollHeight;
  conferirFaixa();
}

function conferirFaixa() {
  const msgs = document.getElementById('conv-msgs');
  const faixa = document.getElementById('conv-faixa');
  if (!msgs || !faixa) return;
  const intro = document.getElementById('conv-intro');
  const sumiu = intro.offsetTop + intro.offsetHeight - msgs.scrollTop < 0;
  faixa.classList.toggle('visivel', sumiu && !faixaDispensada);
}

function dispensarFaixa() {
  faixaDispensada = true;
  conferirFaixa();
}

addEventListener('resize', ajustarConversa);

/* --------------------------- novo grupo ---------------------------
   A mesma modal do chat interno do PO051: escurece a área da conversa, com o
   campo de participantes e os dois botões. Enquanto ninguém for escolhido,
   Abrir conversa fica apagado. Clicar no campo traz a lista de pessoas — o
   atalho do protótipo para a busca que a tela real terá. */

function abrirNovoGrupo() { novoGrupoAberto = true; grupoSel = []; render(); }
function fecharNovoGrupo() { novoGrupoAberto = false; render(); }

function preencherGrupo() {
  if (grupoSel.length) return;
  grupoSel = PARTICIPANTES_CONV.slice();
  render();
}

function tirarDoGrupo(i, ev) {
  ev.stopPropagation();   /* senão o clique cai no campo e reenche a lista */
  grupoSel.splice(i, 1);
  render();
}

/** Abrir conversa cria o grupo, que entra na lista do pé das pastas, e já o abre. */
function criarGrupo() {
  gruposConversa.push({ participantes: grupoSel.slice(), falas: [] });
  conversaAberta = gruposConversa.length - 1;
  novoGrupoAberto = false;
  render();
}

function novoGrupoHTML() {
  if (!novoGrupoAberto) return '';
  const cheio = grupoSel.length > 0;
  const campo = !cheio
    ? '<span class="ph">Incluir aqui...</span>'
    : `<div class="chips">${grupoSel.map((n, i) => `
              <span class="chip">${n}
                <button onclick="tirarDoGrupo(${i}, event)" title="Remover">${svg('x')}</button>
              </span>`).join('')}</div>`;

  return `
    <div class="grupo-modal">
      <div class="cartao">
        <h4>Novo Grupo de Conversa</h4>
        <div class="corpo">
          <span class="rot">Participantes<span class="req">*</span></span>
          <div class="caixa${cheio ? ' cheia' : ''}" onclick="preencherGrupo()">${campo}</div>
        </div>
        <div class="rodape">
          <button class="btn btn-branco" onclick="fecharNovoGrupo()">${svg('x')} Cancelar</button>
          <button class="btn ${cheio ? 'btn-primario' : 'btn-neutro'}"
                  ${cheio ? 'onclick="criarGrupo()"' : 'disabled'}>${svg('baloes')} Abrir conversa</button>
        </div>
      </div>
    </div>`;
}
