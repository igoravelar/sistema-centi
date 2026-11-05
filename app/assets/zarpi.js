/* ==========================================================================
   Zarpi — o que o shell veste nas telas do Zarpi: marca, módulos do menu,
   abas guardadas à parte das do ERP e a fonte Open Sans. Carregar depois do
   shell.js. As telas só do Zarpi chamam montarShell(aba, vestirZarpi());
   as que o Zarpi divide com o ERP (PO050, PO051) usam produtoDaUrl(), e
   viram Zarpi quando abertas com ?app=zarpi.
   ========================================================================== */

const ZARPI = {
  marca: { src: 'assets/img/zarpi/logo-zarpi.svg', alt: 'Zarpi' },
  modulos: [
    { nome: 'Protocolo', ico: 'protocolo', href: 'zarpi-protocolo.html',
      paginas: ['zarpi-protocolo.html', 'po050.html', 'po051.html'] },
    { nome: 'Gerais',    ico: 'gerais' },
  ],
  contexto: 'zarpi',
};

/** Aponta as abas para as telas do Zarpi, troca a fonte e devolve o produto para o montarShell. */
function vestirZarpi() {
  ABAS.home      = { ...ABAS.home,      href: 'zarpi-inicio.html' };
  ABAS.protocolo = { ...ABAS.protocolo, href: 'zarpi-protocolo.html' };
  ABAS.po050     = { ...ABAS.po050,     href: 'po050.html?app=zarpi' };
  ABAS.po051     = { ...ABAS.po051,     href: 'po051.html?app=zarpi' };

  /* o Zarpi usa Open Sans no lugar do Verdana do ERP, em toda a tela (shell incluso) */
  if (!document.querySelector('link[href*="Open+Sans"]')) {
    document.head.insertAdjacentHTML('beforeend',
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap">');
  }
  document.head.insertAdjacentHTML('beforeend',
    '<style>html, body { font-family: "Open Sans", "Segoe UI", sans-serif; }</style>');
  return ZARPI;
}

/** Nas telas que o Zarpi divide com o ERP: o Zarpi quando a URL pede, senão o ERP. */
function produtoDaUrl() {
  return new URLSearchParams(location.search).get('app') === 'zarpi' ? vestirZarpi() : undefined;
}
