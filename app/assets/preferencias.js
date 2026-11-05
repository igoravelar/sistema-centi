/* ==========================================================================
   Centi — dados do usuário e preferências (ícone da pessoa na topbar)
   A modal guarda contato, segurança, tema, destaque da fonte e telas
   predefinidas. O tema escuro é derivado das próprias folhas de estilo: cada
   cor declarada ganha uma versão para o fundo escuro, e as cores escritas
   direto nos elementos (style e fill/stroke dos gráficos) são trocadas no
   lugar e devolvidas quando o tema volta ao claro.
   ========================================================================== */

const CHAVE_PREFS = 'centi:preferencias';

const PREFS_PADRAO = {
  telefone: '', a2f: false, tema: 'claro', fonte: 0,
  ocultarFiltros: false, camposReferencia: false, telas: [],
};

function lerPrefs() {
  try { return { ...PREFS_PADRAO, ...JSON.parse(localStorage.getItem(CHAVE_PREFS) || '{}') }; }
  catch { return { ...PREFS_PADRAO }; }
}

function gravarPrefs(p) {
  try { localStorage.setItem(CHAVE_PREFS, JSON.stringify(p)); } catch {}
}

/* ------------------------------ cores ------------------------------ */

const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbParaOklch([r, g, b]) {
  [r, g, b] = [r, g, b].map(v => lin(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720342 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return { L, C: Math.hypot(A, B), h: Math.atan2(B, A) };
}

function oklchParaRgb({ L, C, h }) {
  /* fora do sRGB, o croma cede até a cor caber */
  for (let i = 0; i < 30; i++, C *= 0.9) {
    const A = C * Math.cos(h), B = C * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
    const rgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
    if (rgb.every(v => v >= -0.001 && v <= 1.001) || C < 0.001) {
      return rgb.map(v => Math.round(gam(Math.min(1, Math.max(0, v))) * 255));
    }
  }
}

/* superfície clara: quase branca e pouco saturada — vira fundo escuro */
const ehSuperficie = o => o.L >= 0.95 || (o.L >= 0.86 && o.C < 0.14);

/* Cada cor muda conforme o papel que cumpre. Os tons médios (o verde da
   marca, as cores de status e das séries) ficam como estão nos três papéis:
   já funcionam sobre o escuro. */
const PAPEIS = {
  fundo(o) {
    if (ehSuperficie(o)) return { L: 0.17 + (o.L - 0.86) * 0.6, C: Math.min(o.C * 0.5, 0.04), h: o.h };
    if (o.L < 0.45) return { ...o, L: 0.25 + o.L * 0.35 };
    return o;
  },
  texto(o) {
    if (o.L < 0.75) return { ...o, L: Math.min(0.95, 1.15 - 0.68 * o.L) };
    return o;
  },
  borda(o) {
    if (o.L >= 0.8 && o.C < 0.14) return { L: 0.32 + (1 - o.L) * 0.5, C: Math.min(o.C * 0.6, 0.05), h: o.h };
    if (o.L < 0.4) return { ...o, L: 0.45 + o.L * 0.3 };
    return o;
  },
  traco(o) {   /* stroke de svg: linha de grade clara escurece, traço escuro clareia */
    if (o.L >= 0.8 && o.C < 0.14) return PAPEIS.borda(o);
    if (o.L < 0.6) return PAPEIS.texto(o);
    return o;
  },
  sombra(o) {  /* só o anel claro (respiro entre marcas) muda; a sombra escura fica */
    return ehSuperficie(o) ? PAPEIS.fundo(o) : o;
  },
};

const RE_COR = /(?<![\w-])(?<!url\()(#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])|rgba?\([^)]*\)|%23(?:[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-f])|white(?![\w-])|black(?![\w-]))/gi;

function lerCor(t) {
  t = t.toLowerCase();
  if (t === 'white') return [255, 255, 255, 1];
  if (t === 'black') return [0, 0, 0, 1];
  if (t.startsWith('%23')) t = '#' + t.slice(3);
  if (t[0] === '#') {
    let h = t.slice(1);
    if (h.length <= 4) h = [...h].map(c => c + c).join('');
    const n = [0, 2, 4, 6].map(i => parseInt(h.slice(i, i + 2), 16));
    return [n[0], n[1], n[2], h.length === 8 ? n[3] / 255 : 1];
  }
  const p = t.slice(t.indexOf('(') + 1, -1).split(/[\s,\/]+/).filter(Boolean);
  const a = p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
  return [...p.slice(0, 3).map(v => (v.endsWith('%') ? parseFloat(v) * 2.55 : parseFloat(v))), a];
}

const hex2 = v => v.toString(16).padStart(2, '0');

function trocarCor(token, papel) {
  const c = lerCor(token);
  if (c.slice(0, 3).some(isNaN)) return token;
  const rgb = oklchParaRgb(PAPEIS[papel](rgbParaOklch(c)));
  if (token.startsWith('%23')) return '%23' + rgb.map(hex2).join('');
  if (c[3] < 1) return `rgba(${rgb.join(', ')}, ${+c[3].toFixed(3)})`;
  return '#' + rgb.map(hex2).join('');
}

/* o ícone dentro de um data:svg é traço de desenho: tratado como texto */
const trocarValor = (valor, papel) =>
  valor.replace(RE_COR, t => trocarCor(t, t.startsWith('%23') ? 'texto' : papel));

function papelDaPropriedade(prop) {
  if (prop.startsWith('--')) {
    if (/txt|tinta|ico|-ph$|texto/.test(prop)) return 'texto';
    if (/bd|line|linha|grade|eixo|stroke|ponto/.test(prop)) return 'borda';
    return 'fundo';
  }
  if (/^(color|caret-color|-webkit-text-fill-color|text-decoration-color|-webkit-text-stroke-color)$/.test(prop)) return 'texto';
  if (/^(background-color|background-image|fill|stop-color|flood-color)$/.test(prop)) return 'fundo';
  if (/border.*color|outline-color|column-rule-color/.test(prop)) return 'borda';
  if (prop === 'stroke') return 'traco';
  if (/shadow/.test(prop)) return 'sombra';
  return null;
}

/* fundo de destaque que continua claro no escuro (o lima de um botão):
   o texto escuro escrito sobre ele precisa continuar escuro */
function fundoContinuaClaro(estilo) {
  const m = (estilo.getPropertyValue('background-color') || '').match(RE_COR);
  if (!m) return false;
  const o = rgbParaOklch(lerCor(m[0]));
  return o.L >= 0.6 && !ehSuperficie(o);
}

/** Declarações escuras de um CSSStyleDeclaration (só as que mudam). */
function declaracoesEscuras(estilo) {
  const claro = fundoContinuaClaro(estilo);
  let saida = '';
  for (let i = 0; i < estilo.length; i++) {
    const prop = estilo[i];
    let papel = papelDaPropriedade(prop);
    if (!papel || (papel === 'texto' && claro)) continue;
    const valor = estilo.getPropertyValue(prop);
    if (!RE_COR.test(valor)) continue;
    RE_COR.lastIndex = 0;
    const novo = trocarValor(valor, papel);
    if (novo !== valor) saida += `${prop}:${novo}${estilo.getPropertyPriority(prop) ? ' !important' : ''};`;
  }
  return saida;
}

function regrasEscuras(regras) {
  let css = '';
  for (const r of regras) {
    if (r instanceof CSSStyleRule) {
      if (r.selectorText.includes('data-tema')) continue;   /* já é regra do escuro */
      const d = declaracoesEscuras(r.style);
      if (d) css += `${r.selectorText}{${d}}\n`;
      if (r.cssRules && r.cssRules.length) css += regrasEscuras(r.cssRules);
    } else if (r instanceof CSSMediaRule || r instanceof CSSSupportsRule) {
      const dentro = regrasEscuras(r.cssRules);
      if (dentro) css += `@${r instanceof CSSMediaRule ? 'media' : 'supports'} ${r.conditionText}{${dentro}}\n`;
    }
  }
  return css;
}

/* ------------------------------ tema ------------------------------ */

const TEMA = { escuro: false, folhas: new Map(), alterados: new Map(), observador: null };

/** Gera (uma vez por folha) a versão escura de cada folha de estilo da página. */
function gerarFolhasEscuras() {
  for (const folha of document.styleSheets) {
    const dono = folha.ownerNode;
    if (!dono || dono.dataset.temaGerado || TEMA.folhas.has(dono)) continue;
    let regras;
    try { regras = folha.cssRules; } catch { continue; }   /* fonte de outro domínio */
    const el = document.createElement('style');
    el.dataset.temaGerado = '1';
    el.textContent = regrasEscuras(regras);
    TEMA.folhas.set(dono, el);
    document.head.appendChild(el);
  }
  for (const el of TEMA.folhas.values()) el.media = TEMA.escuro ? 'all' : 'not all';
}

const ATRIBUTOS_COR = ['fill', 'stroke', 'stop-color'];

/** Troca as cores escritas no próprio elemento, guardando a original. */
function escurecerElemento(el) {
  let reg = TEMA.alterados.get(el);
  const guardar = (chave, original, aplicado) => {
    if (!reg) TEMA.alterados.set(el, reg = {});
    reg[chave] = [original, aplicado];
  };

  if (el.style && el.style.length) {
    const claro = fundoContinuaClaro(el.style);
    for (const prop of [...el.style]) {
      const papel = papelDaPropriedade(prop);
      if (!papel || (papel === 'texto' && claro)) continue;
      const valor = el.style.getPropertyValue(prop);
      if (reg && reg['s:' + prop] && reg['s:' + prop][1] === valor) continue;
      const novo = trocarValor(valor, papel);
      if (novo === valor) continue;
      el.style.setProperty(prop, novo, el.style.getPropertyPriority(prop));
      guardar('s:' + prop, valor, el.style.getPropertyValue(prop));
    }
  }
  if (el instanceof SVGElement) {
    const ehTexto = el.tagName === 'text' || el.tagName === 'tspan';
    for (const at of ATRIBUTOS_COR) {
      const valor = el.getAttribute(at);
      if (!valor || (reg && reg['a:' + at] && reg['a:' + at][1] === valor)) continue;
      const papel = at === 'stroke' ? 'traco' : ehTexto && at === 'fill' ? 'texto' : 'fundo';
      const novo = trocarValor(valor, papel);
      if (novo === valor) continue;
      el.setAttribute(at, novo);
      guardar('a:' + at, valor, novo);
    }
  }
}

function escurecerArvore(raiz) {
  if (raiz.nodeType !== 1 || raiz.dataset?.temaGerado) return;
  escurecerElemento(raiz);
  raiz.querySelectorAll('[style],[fill],[stroke],[stop-color]').forEach(escurecerElemento);
}

function clarearElementos() {
  for (const [el, reg] of TEMA.alterados) {
    for (const [chave, [original, aplicado]] of Object.entries(reg)) {
      const [tipo, nome] = [chave[0], chave.slice(2)];
      if (tipo === 's' && el.style.getPropertyValue(nome) === aplicado) el.style.setProperty(nome, original);
      if (tipo === 'a' && el.getAttribute(nome) === aplicado) el.setAttribute(nome, original);
    }
  }
  TEMA.alterados.clear();
}

function ligarEscuro(ligar) {
  if (TEMA.escuro === ligar) return;
  TEMA.escuro = ligar;
  const raiz = document.documentElement;
  raiz.dataset.tema = ligar ? 'escuro' : 'claro';
  raiz.style.colorScheme = ligar ? 'dark' : '';
  gerarFolhasEscuras();
  if (ligar) {
    escurecerArvore(document.body);
    TEMA.observador = new MutationObserver(lista => {
      for (const m of lista) {
        if (m.type === 'attributes') escurecerElemento(m.target);
        else m.addedNodes.forEach(n => {
          escurecerArvore(n);
          if (n.nodeName === 'STYLE' || n.nodeName === 'LINK') setTimeout(gerarFolhasEscuras, 0);
        });
      }
    });
    TEMA.observador.observe(document.documentElement, {
      subtree: true, childList: true, attributes: true, attributeFilter: ['style', ...ATRIBUTOS_COR],
    });
  } else {
    TEMA.observador?.disconnect();
    clarearElementos();
  }
}

const sistemaEscuro = matchMedia('(prefers-color-scheme: dark)');
let temaVigente = 'claro';

/** Aplica o tema ('claro' | 'escuro' | 'sistema') e o destaque da fonte (0–2). */
function aplicarAparencia(tema, fonte) {
  temaVigente = tema;
  ligarEscuro(tema === 'escuro' || (tema === 'sistema' && sistemaEscuro.matches));
  document.documentElement.dataset.fonte = ['normal', 'forte', 'negrito'][fonte] || 'normal';
}

sistemaEscuro.addEventListener('change', () => { if (temaVigente === 'sistema') ligarEscuro(sistemaEscuro.matches); });

/* ------------------------------ modal ------------------------------ */

const ICO_PREF = {
  usuarioEngrenagem: '<circle cx="10" cy="7" r="4"/><path d="M10.3 15H7a4 4 0 0 0-4 4v2"/><circle cx="18" cy="18" r="2.5"/><path d="M18 13.5v2M18 20.5v2M22.5 18h-2M15.5 18h-2M21.2 14.8l-1.4 1.4M16.2 19.8l-1.4 1.4M21.2 21.2l-1.4-1.4M16.2 16.2l-1.4-1.4"/>',
  cartao: '<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10.5" r="2"/><path d="M5 16a3 3 0 0 1 6 0"/><path d="M14 10h4M14 14h4"/>',
  escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 2v20"/>',
  ajustes: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  raio: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  chave: '<circle cx="15.5" cy="8.5" r="5.5"/><path d="M11.6 12.4 3 21M6 18l2.5 2.5M8.5 15.5 11 18"/>',
  envelope: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  telefone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  lua: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  fechar: '<path d="M18 6 6 18M6 6l12 12"/>',
};

const icoPref = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO_PREF[n]}</svg>`;

const USUARIO = { nome: 'IGOR SOUSA DE AVELAR', cpf: '123.456.789-09', email: 'igor.avelar@centi.com.br', senhaEm: '15/12/2024' };

const chaveHTML = (id, rotulo) =>
  `<label class="pref-chave"><input type="checkbox" id="${id}" aria-label="${rotulo}"><i></i></label>`;

function modalPrefsHTML() {
  return `
  <div class="pref-fundo" id="prefFundo" hidden>
    <div class="pref" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="prefNome">
      <header class="pref-topo">
        <span class="pref-avatar">${icoPref('usuarioEngrenagem')}</span>
        <div>
          <h2 id="prefNome">${USUARIO.nome}</h2>
          <span class="pref-cpf">CPF: ${USUARIO.cpf}</span>
        </div>
        <button class="pref-fechar" type="button" title="Fechar" onclick="fecharPreferencias()">${icoPref('fechar')}</button>
      </header>

      <div class="pref-corpo">
        <h3>${icoPref('cartao')} Informações de contato</h3>
        <div class="pref-contato">
          <label>E-mail
            <span class="pref-campo">${icoPref('envelope')}<input type="email" value="${USUARIO.email}" readonly></span>
          </label>
          <label>Telefone
            <span class="pref-campo">${icoPref('telefone')}<input type="tel" id="prefTelefone" placeholder="(00) 00000-0000" inputmode="numeric"></span>
          </label>
        </div>

        <h3>${icoPref('escudo')} Segurança</h3>
        <div class="pref-cartao">
          <div>
            <b>${icoPref('chave')} Senha</b>
            <p>Altere sua senha regularmente para manter sua conta segura.</p>
            <p>Última alteração: ${USUARIO.senhaEm}</p>
          </div>
          <button type="button" class="btn btn-branco pref-btn">Alterar Senha</button>
        </div>
        <div class="pref-cartao">
          <div>
            <b>Autenticação de Dois Fatores (A2F)</b>
            <p>Adicione uma camada extra de segurança ao seu login através de código enviado por e-mail.</p>
          </div>
          ${chaveHTML('prefA2f', 'Autenticação de Dois Fatores')}
        </div>

        <h3>${icoPref('ajustes')} Preferências de interface</h3>
        <div class="pref-linha">
          <div><b>Tema</b><p>Claro, escuro ou o mesmo tema do sistema operacional.</p></div>
          <div class="pref-temas" role="radiogroup" aria-label="Tema">
            <button type="button" role="radio" data-tema="claro">${icoPref('sol')} Claro</button>
            <button type="button" role="radio" data-tema="escuro">${icoPref('lua')} Escuro</button>
            <button type="button" role="radio" data-tema="sistema">${icoPref('monitor')} Sistema</button>
          </div>
        </div>
        <div class="pref-linha">
          <div><b>Destacar fonte</b><p>Melhorar contraste e visibilidade do texto em todo o sistema.</p></div>
          <div class="pref-fonte">
            <input type="range" id="prefFonte" min="0" max="2" step="1" aria-label="Destacar fonte"
              aria-valuetext="Normal">
            <div><span>Normal</span><span class="forte">Forte</span><span class="negrito">Negrito</span></div>
          </div>
        </div>
        <div class="pref-linha">
          <div><b>Ocultar filtros ao pesquisar</b><p>Simplifica as telas ocultando painéis de filtro por avançados.</p></div>
          ${chaveHTML('prefOcultarFiltros', 'Ocultar filtros ao pesquisar')}
        </div>
        <div class="pref-linha">
          <div><b>Mostrar campos de referência</b><p>Exibe detalhes técnicos de referência de campos em formulários.</p></div>
          ${chaveHTML('prefCamposReferencia', 'Mostrar campos de referência')}
        </div>

        <h3>${icoPref('raio')} Acesso rápido</h3>
        <div class="pref-cartao pref-telas">
          <div class="pref-telas-topo">
            <div><b>Telas Predefinidas</b><p>Telas que aparecem automaticamente para o usuário logo após o login.</p></div>
            <span>Enter para adicionar</span>
          </div>
          <div class="pref-chips" id="prefChips"></div>
          <input type="text" id="prefTela" placeholder="Digite o código da tela e pressione Enter" maxlength="10">
        </div>
      </div>

      <footer class="pref-rodape">
        <button type="button" class="pref-cancelar" onclick="fecharPreferencias()">Cancelar</button>
        <button type="button" class="btn btn-primario pref-btn" onclick="salvarPreferencias()">Salvar</button>
      </footer>
    </div>
  </div>`;
}

/* o que está na modal enquanto ela está aberta; só vira preferência no Salvar */
let rascunho = null;

function desenharRascunho() {
  const m = document.getElementById('prefFundo');
  m.querySelectorAll('.pref-temas button').forEach(b => {
    const sel = b.dataset.tema === rascunho.tema;
    b.classList.toggle('sel', sel);
    b.setAttribute('aria-checked', sel);
  });
  const f = m.querySelector('#prefFonte');
  f.value = rascunho.fonte;
  f.setAttribute('aria-valuetext', ['Normal', 'Forte', 'Negrito'][rascunho.fonte]);
  f.style.setProperty('--pos', rascunho.fonte / 2);
  m.querySelector('#prefChips').innerHTML = rascunho.telas.map((t, i) =>
    `<span class="pref-chip">${t}<button type="button" title="Remover ${t}" data-i="${i}">${icoPref('fechar')}</button></span>`).join('');
}

function abrirPreferencias() {
  const m = document.getElementById('prefFundo');
  rascunho = lerPrefs();
  m.querySelector('#prefTelefone').value = rascunho.telefone;
  m.querySelector('#prefA2f').checked = rascunho.a2f;
  m.querySelector('#prefOcultarFiltros').checked = rascunho.ocultarFiltros;
  m.querySelector('#prefCamposReferencia').checked = rascunho.camposReferencia;
  m.querySelector('#prefTela').value = '';
  desenharRascunho();
  m.hidden = false;
  m.querySelector('.pref-corpo').scrollTop = 0;
  m.querySelector('.pref').focus();
}

/** Fecha sem salvar: o tema e a fonte que estavam em prévia voltam ao salvo. */
function fecharPreferencias() {
  const p = lerPrefs();
  aplicarAparencia(p.tema, p.fonte);
  document.getElementById('prefFundo').hidden = true;
  rascunho = null;
}

function salvarPreferencias() {
  const m = document.getElementById('prefFundo');
  gravarPrefs({
    ...rascunho,
    telefone: m.querySelector('#prefTelefone').value,
    a2f: m.querySelector('#prefA2f').checked,
    ocultarFiltros: m.querySelector('#prefOcultarFiltros').checked,
    camposReferencia: m.querySelector('#prefCamposReferencia').checked,
  });
  fecharPreferencias();
}

/* (00) 00000-0000 enquanto digita */
function mascaraTelefone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  const meio = d.length > 10 ? 5 : 4;
  return `(${d.slice(0, 2)}) ${d.slice(2, 2 + meio)}${d.length > 2 + meio ? '-' + d.slice(2 + meio) : ''}`;
}

function ligarModalPrefs() {
  document.body.insertAdjacentHTML('beforeend', modalPrefsHTML());
  const m = document.getElementById('prefFundo');

  m.addEventListener('mousedown', e => { if (e.target === m) fecharPreferencias(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) fecharPreferencias(); });

  /* tema e fonte entram em prévia na hora; Cancelar desfaz */
  m.querySelectorAll('.pref-temas button').forEach(b => b.addEventListener('click', () => {
    rascunho.tema = b.dataset.tema;
    aplicarAparencia(rascunho.tema, rascunho.fonte);
    desenharRascunho();
  }));
  m.querySelector('#prefFonte').addEventListener('input', e => {
    rascunho.fonte = +e.target.value;
    aplicarAparencia(rascunho.tema, rascunho.fonte);
    desenharRascunho();
  });

  const tel = m.querySelector('#prefTelefone');
  tel.addEventListener('input', () => { tel.value = mascaraTelefone(tel.value); });

  const tela = m.querySelector('#prefTela');
  tela.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const cod = tela.value.trim().toUpperCase();
    if (cod && !rascunho.telas.includes(cod)) rascunho.telas.push(cod);
    tela.value = '';
    desenharRascunho();
  });
  m.querySelector('#prefChips').addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    rascunho.telas.splice(+b.dataset.i, 1);
    desenharRascunho();
  });
}

/** Chamado pelo montarShell: aplica o que está salvo e deixa a modal pronta. */
function iniciarPreferencias() {
  const p = lerPrefs();
  aplicarAparencia(p.tema, p.fonte);
  ligarModalPrefs();
}
