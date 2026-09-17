/* Painel do benchmark de SIAFIC em Goiás.
   Lê SIAFIC (assets/siafic-dados.js) e monta as quatro abas. Toda estatística
   é calculada aqui, a partir das linhas de contrato, para o comparativo nunca
   divergir das abas de cada empresa. Texto explicativo vive em INFOS e só
   aparece na modal do botão (i). */

/* ── formatação ─────────────────────────────────────────── */
const HOJE = new Date().toISOString().slice(0, 10);

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const semAmostra = () => '<span class="vazio">sem amostra</span>';

const moeda = (v) => v == null ? semAmostra()
  : 'R$ ' + Math.round(v).toLocaleString('pt-BR');

const moeda2 = (v) => v == null ? semAmostra()
  : 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Somas de carteira chegam a milhões: a escala curta lê melhor no indicador. */
const moedaCurta = (v) => {
  if (v == null) return semAmostra();
  if (v >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
  if (v >= 1e3) return 'R$ ' + Math.round(v / 1e3).toLocaleString('pt-BR') + ' mil';
  return moeda(v);
};

/** Ticket e extremos são valores mensais: a unidade vai junto do número, porque
    "menor contrato" sozinho se confunde com o valor total do contrato. */
const moedaMes = (v) => v == null ? semAmostra() : moeda(v) + '/mês';

const inteiro = (v) => v == null ? semAmostra() : Math.round(v).toLocaleString('pt-BR');
const dec1 = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const data = (iso) => iso.split('-').reverse().join('/');
const pctTxt = (v) => dec1(v * 100) + '%';

const vigente = (c) => c.fim >= HOJE;

/* ── as empresas, na ordem pedida, e a Centi como referência ── */
const EMPRESAS = ['megasoft', 'prodata', 'sigep'];
const TODAS = [...EMPRESAS, 'centi'];
const FAIXAS = ['Até 20 mil', '20 a 100 mil', '100 a 500 mil', 'Acima de 500 mil'];
const TIPOS = ['Prefeitura', 'Câmara', 'Autarquia/Fundação', 'Consórcio'];
/* no gráfico por tipo entram só os tipos com amostra em mais de uma empresa:
   o consórcio tem um contrato na base inteira e viraria uma fileira de vazios */
const TIPOS_GRAFICO = ['Prefeitura', 'Câmara', 'Autarquia/Fundação'];
const COR = {
  megasoft: 'var(--c-megasoft)', prodata: 'var(--c-prodata)',
  sigep: 'var(--c-sigep)', centi: 'var(--c-centi)',
};

/* ── estatística ────────────────────────────────────────── */
const mediana = (v) => {
  if (!v.length) return null;
  const a = [...v].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const media = (v) => v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
const soma = (v) => v.reduce((s, x) => s + x, 0);

/** Retrato de um conjunto de contratos: o que o comparativo precisa saber. */
function perfil(lista) {
  const m = lista.map((c) => c.mensal);
  return {
    n: lista.length,
    vig: lista.filter(vigente).length,
    global: soma(lista.map((c) => c.global)),
    medio: media(m),
    med: mediana(m),
    min: m.length ? Math.min(...m) : null,
    max: m.length ? Math.max(...m) : null,
  };
}

const base = (chave) => SIAFIC.contratos[chave];
const PERFIL = {};
TODAS.forEach((k) => { PERFIL[k] = perfil(base(k)); });

/* ── camada explicativa ─────────────────────────────────── */
const INFOS = {
  metodo: {
    titulo: 'Como esta base foi montada',
    corpo: `
      <p>Fonte: <b>Portal Nacional de Contratações Públicas (PNCP)</b>. A coleta partiu da busca por
      palavra-chave do portal e, em seguida, <b>abriu cada contrato individualmente na API oficial</b>
      para confirmar o CNPJ e a razão social do fornecedor real.</p>
      <p>Esse segundo passo é o que dá confiança à base: a busca textual do PNCP produz muitos falsos
      positivos — empresas homônimas, nomes parecidos e contratos de outro fornecedor que apenas
      citam o nome do sistema no objeto. Só ficaram os contratos cujo CNPJ do fornecedor bate com o
      CNPJ informado pela Centi.</p>
      <h4>A limitação que permanece</h4>
      <p>A busca textual só encontra contratos cujo <b>objeto cita o nome da empresa ou do sistema</b>.
      Contratos com objeto genérico não são encontrados. Por isso cada aba é uma <b>amostra ampla</b>,
      nunca o universo completo de contratos daquela empresa no PNCP — e o número de contratos é o
      piso da carteira de cada empresa, não o total de clientes.</p>
      <h4>Critério de seleção</h4>
      <ul>
        <li>Mantidos apenas registros do tipo <b>Contrato (termo inicial)</b>. Empenhos, aditivos e
        termos de rescisão foram excluídos para não duplicar valores.</li>
        <li>Descartados contratos sem valor, sem vigência definida ou com vigência inferior a
        3 meses.</li>
      </ul>
      <h4>Como o valor mensal foi calculado</h4>
      <p>Valor global do contrato dividido pelos meses de vigência. É uma aproximação, não o valor de
      assinatura informado pelo fornecedor: o valor global frequentemente inclui <b>implantação,
      migração de dados e treinamento</b>, então o mensal calculado tende a estar acima da assinatura
      pura.</p>
      <h4>Outras ressalvas</h4>
      <ul>
        <li>O escopo varia entre contratos — alguns cobrem todos os módulos, outros um só (Recursos
        Humanos, por exemplo).</li>
        <li>Base com contratos de <b>2021 a 2029</b>, sem correção monetária.</li>
        <li>A situação vigente é recalculada a cada abertura da página, comparando a data de fim com
        a data de hoje.</li>
        <li>Nenhum valor, vigência ou população foi estimado: vêm direto da API do PNCP e do IBGE.</li>
      </ul>`,
  },
  panorama: {
    titulo: 'Panorama comparativo',
    corpo: `
      <p>Retrato de cada carteira na amostra inteira, sem separar por tipo de entidade. Valores
      mensais são o valor global dividido pelos meses de vigência.</p>
      <ul>
        <li><b>Contratos</b> — registros aderentes ao critério, com CNPJ do fornecedor confirmado.</li>
        <li><b>Vigentes hoje</b> — contratos cuja data de fim ainda não passou. Atualiza sozinho.</li>
        <li><b>Valor global somado</b> — soma dos valores globais, cada um pelo prazo inteiro do
        contrato. Um contrato de 60 meses pesa cinco vezes um de 12, por isso essa soma mede
        <b>valor contratado</b>, não receita anual.</li>
        <li><b>Ticket médio</b> — média aritmética do valor mensal. É sensível a extremos.</li>
        <li><b>Ticket mediano</b> — o contrato do meio. É o número que descreve a carteira típica, e
        deve ser preferido ao médio sempre que os dois divergirem muito.</li>
        <li><b>Menor e maior contrato</b> — os extremos do <b>valor mensal</b>, não do valor total do
        contrato. Por isso vêm marcados com “/mês”: a única linha em valor total é a do valor global
        somado.</li>
      </ul>
      <h4>Onde médio e mediano se separam</h4>
      <p>Na Prodata a diferença é grande: um único contrato de Angra dos Reis/RJ, de 60 meses,
      responde por dois terços do valor contratado da empresa e puxa a média para cima. A mediana
      mostra a carteira sem esse peso.</p>`,
  },
  tipos: {
    titulo: 'Ticket por tipo de entidade',
    corpo: `
      <p>O mesmo produto tem preços muito diferentes conforme quem contrata. Separar por tipo de
      entidade é o que torna as carteiras comparáveis: uma empresa com muitas câmaras tem ticket
      médio baixo sem cobrar menos pelo mesmo escopo.</p>
      <ul>
        <li><b>Prefeitura</b> — escopo completo, várias secretarias, ticket alto.</li>
        <li><b>Câmara Municipal</b> — escopo administrativo da Casa, ticket baixo e bastante
        uniforme entre os concorrentes.</li>
        <li><b>Autarquia, fundação e consórcio</b> — poucos casos na amostra; servem de indício.</li>
      </ul>
      <p>Os valores são <b>medianas</b>. Onde a amostra não chega a 3 contratos, leia como indício e
      não como preço de mercado.</p>`,
  },
  faixas: {
    titulo: 'Distribuição por faixa de porte',
    corpo: `
      <p>Onde cada empresa efetivamente vende, pela população do município do contrato. É a leitura
      mais direta do posicionamento de cada concorrente.</p>
      <p>A barra mostra a composição da carteira: cada segmento é a fatia de contratos naquela faixa.
      A tabela abaixo traz a contagem.</p>
      <h4>O que a distribuição revela</h4>
      <p>A <b>Megasoft</b> é capilaridade: a grande maioria dos contratos está em municípios de até
      20 mil habitantes. A <b>Prodata</b> é o oposto — praticamente nada abaixo de 20 mil, e é a
      única com contratos acima de 500 mil. O <b>SIGEP</b> se divide entre as duas primeiras faixas.
      As três disputam o mesmo produto em portes diferentes de município.</p>
      <h4>Onde a Centi está</h4>
      <p>Os três contratos de prefeitura da Centi estão <b>todos</b> na faixa de 100 a 500 mil
      habitantes, e o de câmara na faixa de 20 a 100 mil. Não há contrato abaixo de 20 mil
      habitantes — que é justamente onde a Megasoft tem a maior parte da carteira.</p>
      <p>Leia isso como <b>posicionamento observado, não como estratégia</b>: são quatro contratos,
      e três deles vêm da base interna porque a busca do PNCP não os encontra. A distribuição da
      Centi vai mudar de forma a cada instrumento novo lançado na base; a das outras três já reflete
      uma amostra ampla.</p>
      <p>População: IBGE, Estimativas da População 2024, cruzada pelo código IBGE do município.</p>`,
  },
  prefeituras: {
    titulo: 'Prefeituras por faixa de porte',
    corpo: `
      <p>Só contratos de <b>prefeitura</b>, faixa por faixa: quantos contratos cada empresa tem
      naquele porte e qual o valor mensal mediano. Câmaras, autarquias e consórcios ficam fora porque
      têm escopo e preço próprios — o porte do município não explica o preço delas.</p>
      <p>É aqui que o preço de mercado do SIAFIC fica visível por porte de município. Onde a célula
      está vazia, aquela empresa não tem contrato de prefeitura naquela faixa nesta amostra — o que
      já é informação comercial: indica faixa desocupada por aquele concorrente.</p>
      <p><b>Cuidado com amostras de 1 ou 2 contratos.</b> A mediana existe, mas não sustenta decisão
      de preço; o número de contratos aparece junto para você medir a confiança.</p>`,
  },
  centi: {
    titulo: 'Referência interna Centi',
    corpo: `
      <p>A Centi entra neste painel como <b>referência interna, não como concorrente</b>. São quatro
      contratos de duas origens diferentes, e a diferença importa para ler os números.</p>
      <h4>De onde vem cada contrato</h4>
      <ul>
        <li><b>Porangatu · câmara</b> — localizado no PNCP, como os contratos dos concorrentes.</li>
        <li><b>Trindade, Rio Verde e Itumbiara · prefeitura</b> — lidos dos instrumentos
        assinados, arquivados na base interna da Centi. <b>Nenhum</b> deles foi encontrado pela
        busca textual do portal.</li>
      </ul>
      <p>Isso confirma a ressalva do método: as buscas por 'SIAFIC' (764 resultados brutos) e por
      'CENTI' (mais de 3.000 somados) são dominadas por ruído, e a carteira real da Centi
      <b>não é observável pelo PNCP</b>.</p>
      <h4>Aditivo e o valor do ciclo</h4>
      <p>Em Rio Verde e Itumbiara o instrumento é <b>termo aditivo de prorrogação</b>. O que entra no
      painel é o <b>ciclo vigente de 12 meses</b> — valor mensal vezes os meses do aditivo — e não o
      acumulado do contrato desde a assinatura original. Em Rio Verde esse acumulado já passa de
      R$ 7,7 milhões desde 2022; somá-lo contaria o mesmo contrato várias vezes, que é exatamente o
      motivo pelo qual a base do PNCP descarta aditivos.</p>
      <p>O <b>ticket mensal</b> — o número que este painel compara — é exato e diretamente comparável
      ao dos concorrentes. É a linha do valor global somado que tem naturezas diferentes entre a
      Centi e as outras três.</p>
      <h4>Duas ressalvas de leitura</h4>
      <ul>
        <li>O contrato de <b>Trindade</b> é emergencial, de 3 meses, encerrado em 2022. Ele entra na
        contagem, mas não descreve preço de assinatura em regime normal.</li>
        <li>Os três contratos de prefeitura estão <b>todos</b> em municípios de 100 a 500 mil
        habitantes. Comparar a mediana de prefeitura da Centi com a dos concorrentes sem separar por
        faixa de porte distorce — use o quadro por faixa.</li>
      </ul>
      <h4>Recomendação que permanece</h4>
      <p>Para a Centi a fonte confiável é a base interna e o CRM. Esta seção cresce a cada
      instrumento adicionado ao repositório, e ainda é amostra — não o total de clientes.</p>`,
  },
};

/** A metodologia de cada empresa: o que a busca dela pegou e o que ressalvar. */
function infoEmpresa(chave) {
  const e = SIAFIC.empresas[chave];
  return {
    titulo: `${e.nome} · como esta base foi montada`,
    corpo: `
      <p>${esc(e.resumo)}</p>
      <h4>Razões sociais aceitas</h4>
      <ul>${e.razoes.map((r) =>
        `<li><b>${esc(r[0])}</b> — CNPJ ${r[1]}${r[2] ? ` <i>(${esc(r[2])})</i>` : ''}</li>`).join('')}
      </ul>
      <h4>Busca usada</h4>
      <p>${esc(e.busca)}</p>
      <h4>Ressalva</h4>
      <p>${esc(e.nota)}</p>
      <p>Cada contrato foi aberto na API oficial do PNCP para confirmar o CNPJ do fornecedor. Ainda
      assim, a busca textual só encontra contratos cujo objeto cita o nome da empresa ou do sistema:
      leia esta aba como <b>amostra ampla</b>, não como a carteira completa.</p>`,
  };
}

/* ── modal ──────────────────────────────────────────────── */
function abrirInfo(chave) {
  const info = chave.startsWith('empresa:')
    ? infoEmpresa(chave.split(':')[1])
    : INFOS[chave];
  if (!info) return;
  document.getElementById('modal-titulo').textContent = info.titulo;
  document.getElementById('modal-corpo').innerHTML = info.corpo;
  const modal = document.getElementById('modal');
  modal.hidden = false;
  modal.querySelector('.fechar').focus();
}

function fecharModal() {
  document.getElementById('modal').hidden = true;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') fecharModal();
});

/* ── blocos de montagem ─────────────────────────────────── */
const btInfo = (chave) =>
  `<button class="bt-info" type="button" onclick="abrirInfo('${chave}')"
     aria-label="Como ler este quadro" title="Como ler este quadro">i</button>`;

function quadro(titulo, sub, info, corpo) {
  return `
    <div class="quadro">
      <header>
        <h3>${titulo}</h3>
        ${sub ? `<span class="sub">${sub}</span>` : ''}
        ${info ? btInfo(info) : ''}
      </header>
      <div class="corpo">${corpo}</div>
    </div>`;
}

function celulaBarra(valor, total, cor) {
  const p = total ? (valor / total) * 100 : 0;
  return `
    <div class="cel-barra">
      <span class="trilho"><span class="preenche" style="width:${p.toFixed(1)}%;background:${cor}"></span></span>
      <span class="n"><b>${inteiro(valor)}</b></span>
    </div>`;
}

/* ── aba 1 · comparativo ────────────────────────────────── */
function selosHTML() {
  return `<div class="selos">${TODAS.map((k) => {
    const e = SIAFIC.empresas[k];
    const p = PERFIL[k];
    const classe = e.grauTipo === 'direto' ? 'ok' : 'fria';
    return `
      <div class="selo ${k}">
        <h4>${e.nome}</h4>
        <p class="grau"><span class="pastilha ${classe}">${e.grau}</span></p>
        <p>${esc(e.resumo)}</p>
        <ul class="razoes">${e.razoes.map((r) => `
          <li><b>${esc(r[0])}</b><br><span class="cnpj">${r[1]}</span>${r[2] ? ` · <i>${esc(r[2])}</i>` : ''}</li>`).join('')}
        </ul>
        <p class="carteira"><b>${p.n}</b> ${p.n === 1 ? 'contrato' : 'contratos'} na amostra ·
          <b>${p.vig}</b> ${p.vig === 1 ? 'vigente' : 'vigentes'} hoje</p>
      </div>`;
  }).join('')}</div>`;
}

function panoramaHTML() {
  const linhas = [
    ['Contratos', (p) => inteiro(p.n)],
    ['Vigentes hoje', (p) => inteiro(p.vig)],
    ['Valor global somado', (p) => moedaCurta(p.global)],
    ['Ticket médio', (p) => moedaMes(p.medio)],
    ['Ticket mediano', (p) => moedaMes(p.med)],
    ['Menor contrato', (p) => moedaMes(p.min)],
    ['Maior contrato', (p) => moedaMes(p.max)],
  ];
  const corpo = `
    <div class="tabela-rolagem">
      <table>
        <thead><tr><th></th>${TODAS.map((k) =>
          `<th class="num ${k === 'centi' ? 'centi' : ''}">${SIAFIC.empresas[k].nome}</th>`).join('')}</tr></thead>
        <tbody>${linhas.map(([rot, fn]) => `
          <tr>
            <td class="rot-linha">${rot}</td>
            ${TODAS.map((k) =>
              `<td class="num ${k === 'centi' ? 'centi-col' : ''}">${fn(PERFIL[k])}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="leitura">A Prodata soma <b>mais valor contratado que a Megasoft com um nono dos
      contratos</b>: são carteiras de naturezas opostas dentro do mesmo produto. A Centi entra com
      quatro contratos — três de prefeitura da base interna e um de câmara localizado no PNCP —, e
      ainda assim é amostra, não a carteira completa.</p>
    <p class="leitura" style="border-top:0;padding-top:0;margin-top:8px"><b>Atenção ao valor global
      somado.</b> Para os concorrentes ele é a soma do prazo inteiro de cada contrato, como publicado
      no PNCP. Para a Centi, dois dos três contratos internos são termos aditivos de prorrogação, e
      o que entra é o <b>ciclo vigente de 12 meses</b> de cada um — não o acumulado desde a
      assinatura original, que contaria o mesmo contrato várias vezes. O ticket mensal, que é o que
      este painel compara, não sofre desse efeito.</p>`;
  return quadro('Panorama comparativo', 'ticket mensal e valor contratado', 'panorama', corpo);
}

function tiposHTML() {
  const dados = {};
  TODAS.forEach((k) => {
    dados[k] = {};
    TIPOS.forEach((t) => {
      const l = base(k).filter((c) => c.tipo === t);
      dados[k][t] = { n: l.length, med: mediana(l.map((c) => c.mensal)) };
    });
  });
  const max = Math.max(...TODAS.flatMap((k) => TIPOS_GRAFICO.map((t) => dados[k][t].med || 0)));

  const serie = (k, t) => {
    const d = dados[k][t];
    if (!d.n) return '';
    const nome = `${SIAFIC.empresas[k].nome}<i>${d.n} ${d.n === 1 ? 'contrato' : 'contratos'}</i>`;
    return `
      <div class="serie s-${k}">
        <span class="nome">${nome}</span>
        <span class="barra">
          <span class="b" style="width:${((d.med / max) * 100).toFixed(1)}%"></span>
          <span class="v">${moeda(d.med)}${d.n < 3 ? ' <span class="pastilha atencao">amostra baixa</span>' : ''}</span>
        </span>
      </div>`;
  };

  const corpo = `
    <div class="legenda">
      <span class="l-megasoft"><i></i>Megasoft</span>
      <span class="l-prodata"><i></i>Prodata</span>
      <span class="l-sigep"><i></i>SIGEP</span>
      <span class="l-centi"><i></i>Centi · referência interna</span>
    </div>
    <div class="grafico">${TIPOS_GRAFICO.map((t) => `
      <div class="faixa-grupo">
        <span class="faixa-nome">${t === 'Câmara' ? 'Câmara Municipal' : t}</span>
        ${TODAS.map((k) => serie(k, t)).join('')}
      </div>`).join('')}
    </div>
    <p class="leitura">Em <b>prefeitura</b> a mediana vai de R$ 5,7 mil (SIGEP) a R$ 50,1 mil
      (Centi) — mas <b>essa comparação direta engana</b>: os três contratos de prefeitura da Centi
      estão todos em municípios de 100 a 500 mil habitantes, enquanto a Megasoft tem 70 dos seus 90
      em municípios de até 20 mil. Para comparar preço, use o quadro por faixa de porte abaixo. Em
      <b>câmara</b> os quatro ficam entre R$ 1,2 mil e R$ 2,0 mil: é o segmento onde o preço já está
      padronizado no mercado. O consórcio público ficou fora do gráfico — há <b>um</b> contrato desse
      tipo na base inteira, da Megasoft, a R$ 5.294 por mês.</p>`;
  return quadro('Ticket por tipo de entidade', 'valor mensal mediano', 'tipos', corpo);
}

function faixasHTML() {
  const cont = {};
  TODAS.forEach((k) => {
    cont[k] = FAIXAS.map((f) => base(k).filter((c) => c.faixa === f).length);
  });

  const pilha = (k) => {
    const total = PERFIL[k].n;
    return `<div class="pilha">${cont[k].map((n, i) => n
      ? `<span class="p${i + 1}" style="width:${((n / total) * 100).toFixed(1)}%"
           title="${FAIXAS[i]}: ${n} de ${total}"></span>`
      : '').join('')}</div>`;
  };

  const corpo = `
    <div class="grafico">${TODAS.map((k) => `
      <div class="faixa-grupo">
        <span class="faixa-nome">${SIAFIC.empresas[k].nome} · ${PERFIL[k].n} ${PERFIL[k].n === 1 ? 'contrato' : 'contratos'}</span>
        ${pilha(k)}
      </div>`).join('')}
    </div>
    <div class="legenda-faixas">${FAIXAS.map((f, i) =>
      `<span class="f${i + 1}"><i></i>${f} habitantes</span>`).join('')}
    </div>

    <div class="tabela-rolagem" style="margin-top:22px">
      <table>
        <thead><tr><th>Faixa de porte</th>${TODAS.map((k) =>
          `<th class="num ${k === 'centi' ? 'centi' : ''}">${SIAFIC.empresas[k].nome}</th>`).join('')}</tr></thead>
        <tbody>${FAIXAS.map((f, i) => `
          <tr>
            <td class="rot-linha">${f} habitantes</td>
            ${TODAS.map((k) => `<td class="num ${k === 'centi' ? 'centi-col' : ''}">${
              cont[k][i] ? inteiro(cont[k][i]) : '<span class="vazio">—</span>'}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="leitura">A Megasoft concentra <b>${pctTxt(cont.megasoft[0] / PERFIL.megasoft.n)}</b> da
      carteira em municípios de até 20 mil habitantes — <b>${cont.megasoft[0]}</b> dos
      ${PERFIL.megasoft.n} contratos. A Prodata tem <b>um único</b> contrato nessa faixa e é a única
      presente acima de 500 mil. São dois posicionamentos opostos dentro do mesmo produto.</p>
    <p class="leitura" style="border-top:0;padding-top:0;margin-top:8px">A Centi entra pela faixa de
      <b>100 a 500 mil habitantes</b>: ${cont.centi[2]} dos ${PERFIL.centi.n} contratos estão lá, o
      mesmo terreno da Prodata (${cont.prodata[2]} contratos). <b>Nenhum</b> contrato da Centi abaixo
      de 20 mil habitantes — a faixa que sozinha responde por ${cont.megasoft[0]} dos contratos da
      Megasoft. Hoje a Centi disputa o porte da Prodata, não o da Megasoft.</p>`;
  return quadro('Distribuição por faixa de porte', 'composição da carteira de cada empresa', 'faixas', corpo);
}

function prefeiturasHTML() {
  const dados = {};
  TODAS.forEach((k) => {
    dados[k] = FAIXAS.map((f) => {
      const l = base(k).filter((c) => c.tipo === 'Prefeitura' && c.faixa === f);
      return { n: l.length, med: mediana(l.map((c) => c.mensal)) };
    });
  });

  const corpo = `
    <div class="tabela-rolagem">
      <table>
        <thead><tr><th>Faixa de porte</th>${TODAS.map((k) =>
          `<th class="num ${k === 'centi' ? 'centi' : ''}">${SIAFIC.empresas[k].nome}</th>`).join('')}</tr></thead>
        <tbody>${FAIXAS.map((f, i) => `
          <tr>
            <td class="rot-linha">${f} habitantes</td>
            ${TODAS.map((k) => {
              const d = dados[k][i];
              const cl = k === 'centi' ? 'centi-col' : '';
              if (!d.n) return `<td class="num ${cl}"><span class="vazio">—</span></td>`;
              return `<td class="num ${cl}"><b>${moeda(d.med)}</b>
                <span class="obs" style="display:block;font-size:11px;font-weight:400;color:var(--txt-mute)">${
                  d.n} ${d.n === 1 ? 'contrato' : 'contratos'}</span></td>`;
            }).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="leitura">Na faixa de <b>100 a 500 mil habitantes</b>, onde estão os três contratos de
      prefeitura da Centi, a comparação fica direta: <b>R$ 50.127 contra R$ 43.800 da Prodata</b>,
      com três contratos de cada lado. Megasoft e SIGEP não têm contrato de prefeitura nessa faixa —
      e a Centi não tem nas duas primeiras, que são justamente onde a Megasoft concentra a
      carteira.</p>
    <p class="leitura" style="border-top:0;padding-top:0;margin-top:8px">Valor mensal <b>mediano</b>
      de contratos de prefeitura. A célula vazia indica faixa em que aquela empresa não tem contrato
      de prefeitura nesta base — leia como faixa desocupada. Onde há 1 ou 2 contratos, o número é
      indício, não preço de mercado.</p>
    <p class="leitura" style="border-top:0;padding-top:0;margin-top:8px">Repare que a mediana da
      Megasoft <b>não cresce com o porte</b>: R$ 8.225 até 20 mil habitantes contra R$ 5.529 de 20 a
      100 mil. Não é erro da base — dentro de cada faixa os contratos vão de R$ 1 mil a R$ 26 mil,
      porque o valor reflete <b>quantos módulos</b> o município contratou, e não só o seu tamanho.
      Porte explica preço entre concorrentes, não dentro da carteira de um só.</p>`;
  return quadro('Prefeituras por faixa de porte', 'valor mensal mediano e número de contratos', 'prefeituras', corpo);
}

function centiHTML() {
  const lista = [...base('centi')].sort((a, b) => b.mensal - a.mensal);
  const p = PERFIL.centi;
  const cam = {};
  EMPRESAS.forEach((k) => {
    cam[k] = mediana(base(k).filter((x) => x.tipo === 'Câmara').map((x) => x.mensal));
  });
  const camCenti = mediana(base('centi').filter((x) => x.tipo === 'Câmara').map((x) => x.mensal));

  const corpo = `
    <div class="kpis">
      <div class="kpi"><span class="lbl">Contratos</span><span class="val">${p.n}</span>
        <span class="obs">3 de prefeitura e 1 de câmara</span></div>
      <div class="kpi"><span class="lbl">Vigentes hoje</span><span class="val">${p.vig}</span>
        <span class="obs">fim de vigência ainda não passou</span></div>
      <div class="kpi"><span class="lbl">Ticket mediano</span><span class="val">${moedaMes(p.med)}</span>
        <span class="obs">o contrato do meio</span></div>
      <div class="kpi"><span class="lbl">Maior contrato</span><span class="val">${moedaMes(p.max)}</span>
        <span class="obs">Rio Verde · 238 mil habitantes</span></div>
    </div>

    <div class="tabela-rolagem">
      <table class="tab-centi">
        <thead><tr>
          <th>Município</th><th>Entidade</th><th class="num">Valor mensal</th>
          <th class="num">Ciclo contratado</th><th class="num">Meses</th>
          <th class="num">População</th><th>Modalidade</th><th class="num">Vigência</th>
          <th>Situação</th><th>Instrumento</th>
        </tr></thead>
        <tbody>${lista.map((c) => `
          <tr>
            <td class="rot-linha">${esc(c.mun)} · ${c.uf}</td>
            <td>${esc(c.tipo)}</td>
            <td class="num"><b>${moeda(c.mensal)}</b></td>
            <td class="num">${moeda(c.global)}</td>
            <td class="num">${dec1(c.meses)}</td>
            <td class="num">${inteiro(c.pop)}</td>
            <td>${esc(c.mod)}</td>
            <td class="num">${data(c.ini)} – ${data(c.fim)}</td>
            <td><span class="pastilha ${vigente(c) ? 'ok' : 'fria'}">${
              vigente(c) ? 'Vigente' : 'Encerrado'}</span></td>
            <td>${c.fonte === 'pncp'
              ? `<a class="pncp" href="${esc(c.link)}" target="_blank" rel="noopener">ver no PNCP
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"/><line x1="20" y1="4" x2="11" y2="13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></a>`
              : `<span title="Instrumento assinado, na base interna da Centi">${esc(c.doc)}</span>`}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <p class="leitura">O <b>ciclo contratado</b> é o valor do período que a coluna Vigência descreve.
      Em Rio Verde e Itumbiara o instrumento é termo aditivo de prorrogação, então é o ciclo de 12
      meses vigente — não o acumulado do contrato desde a assinatura original, que em Rio Verde
      passa de R$ 7,7 milhões desde 2022.</p>

    <h4 style="margin:26px 0 10px;font-size:13.5px;color:var(--txt-strong)">Onde a Centi fica em câmara municipal</h4>
    <div class="tabela-rolagem">
      <table>
        <thead><tr><th>Empresa</th><th class="num">Mediana em câmara</th><th class="num">Centi / empresa</th></tr></thead>
        <tbody>${EMPRESAS.map((k) => `
          <tr>
            <td class="rot-linha">${SIAFIC.empresas[k].nome}</td>
            <td class="num">${moeda(cam[k])}</td>
            <td class="num">${pctTxt(camCenti / cam[k])}</td>
          </tr>`).join('')}
          <tr class="centi">
            <td>Centi · Porangatu</td>
            <td class="num">${moeda(camCenti)}</td>
            <td class="num">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="leitura">Em câmara a Centi está <b>dentro da faixa do mercado</b>: acima do SIGEP,
      próxima da Megasoft e da Prodata. Em prefeitura a comparação está no quadro por faixa de
      porte, onde os três contratos internos se encontram com a Prodata na mesma faixa de município.</p>

    <div class="nota alerta">
      <p><b>Três destes quatro contratos não foram encontrados pela busca do PNCP.</b> Eles vêm dos
      instrumentos assinados, arquivados na base interna da Centi. Só o contrato de Porangatu
      apareceu na busca textual do portal — as buscas por “SIAFIC” e “CENTI” devolveram milhares de
      resultados dominados por ruído e só esse teve o CNPJ da Centi confirmado no fornecedor.</p>
      <p>É a demonstração prática da ressalva do método: a carteira real da Centi <b>não é
      observável pelo PNCP</b>. Esta seção cresce à medida que instrumentos da base interna forem
      lançados; ainda é amostra, não o total de clientes.</p>
    </div>`;
  return quadro('Referência interna Centi', `${p.n} contratos · 3 da base interna, 1 do PNCP`, 'centi', corpo);
}

function abaComparativo() {
  return `
    <h2>Comparativo entre as empresas</h2>
    <p class="lead">As quatro empresas que disputam o sistema completo de gestão pública municipal —
      o SIAFIC — em Goiás, a partir de <b>${SIAFIC.meta.total} contratos</b> publicados no PNCP com o
      CNPJ do fornecedor confirmado um a um. Valores mensais: valor global do contrato dividido pelos
      meses de vigência.</p>
    ${selosHTML()}
    <div class="nota">
      <p><b>Leia como amostra, não como carteira completa.</b> A busca do PNCP só encontra contratos
      cujo objeto cita o nome da empresa ou do sistema. O número de contratos de cada empresa é o
      <b>piso</b> da sua carteira. ${btInfo('metodo')}</p>
    </div>
    ${panoramaHTML()}
    ${tiposHTML()}
    ${faixasHTML()}
    ${prefeiturasHTML()}
    ${centiHTML()}`;
}

/* ── abas 2, 3 e 4 · contratos de cada empresa ──────────── */
const COLUNAS = [
  { id: 'orgao',  rot: 'Órgão contratante' },
  { id: 'mun',    rot: 'Município' },
  { id: 'mensal', rot: 'Valor mensal', num: true },
  { id: 'global', rot: 'Valor global', num: true },
  { id: 'meses',  rot: 'Meses', num: true },
  { id: 'tipo',   rot: 'Entidade' },
  { id: 'pop',    rot: 'População', num: true },
  { id: 'faixa',  rot: 'Faixa' },
  { id: 'mod',    rot: 'Modalidade' },
  { id: 'fim',    rot: 'Vigência' },
  { id: 'sit',    rot: 'Situação' },
  { id: 'raz',    rot: 'Empresa contratada' },
  { id: 'link',   rot: 'PNCP', fixo: true },
];

const estado = {};

function opcoes(chave, campo, rotulo) {
  const vals = [...new Set(base(chave).map((c) => c[campo]))].sort();
  if (vals.length < 2) return '';
  return `<label>${rotulo}<select data-campo="${campo}" onchange="filtrar('${chave}')">
    <option value="">Todas</option>
    ${vals.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}
  </select></label>`;
}

function abaContratos(chave) {
  const e = SIAFIC.empresas[chave];
  const p = PERFIL[chave];
  estado[chave] = { campo: 'mensal', dir: -1, f: {}, busca: '' };

  const kpis = [
    ['Contratos', inteiro(p.n), 'aderentes ao critério'],
    ['Vigentes hoje', inteiro(p.vig), 'fim de vigência ainda não passou'],
    ['Valor global somado', moedaCurta(p.global), 'pelo prazo inteiro de cada contrato'],
    ['Ticket médio', moedaMes(p.medio), 'média do valor mensal'],
    ['Ticket mediano', moedaMes(p.med), 'o contrato do meio'],
    ['Menor contrato', moedaMes(p.min), 'observado na amostra'],
    ['Maior contrato', moedaMes(p.max), 'observado na amostra'],
  ];

  return `
    <h2>Contratos ${e.nome}</h2>
    <p class="lead">${esc(e.resumo)}</p>
    <div class="nota verde">
      <p><b>Razões sociais aceitas:</b> ${e.razoes.map((r) =>
        `${esc(r[0])} (${r[1]})`).join(' · ')}</p>
      <p>${esc(e.nota)}</p>
    </div>
    <div class="kpis">${kpis.map(([l, v, o]) => `
      <div class="kpi"><span class="lbl">${l}</span><span class="val">${v}</span>
        <span class="obs">${o}</span></div>`).join('')}
    </div>
    ${quadro('Contratos localizados no PNCP', `${p.n} registros`, `empresa:${chave}`, `
      <div class="filtros" id="filtros-${chave}">
        ${opcoes(chave, 'tipo', 'Tipo de entidade')}
        ${opcoes(chave, 'faixa', 'Faixa de porte')}
        ${opcoes(chave, 'mod', 'Modalidade')}
        <label>Situação<select data-campo="sit" onchange="filtrar('${chave}')">
          <option value="">Todas</option>
          <option value="Vigente">Vigente</option>
          <option value="Encerrado">Encerrado</option>
        </select></label>
        ${opcoes(chave, 'uf', 'UF')}
        ${opcoes(chave, 'ano', 'Ano')}
        ${opcoes(chave, 'raz', 'Empresa contratada')}
        <label>Buscar município ou órgão
          <input type="search" data-campo="busca" placeholder="ex.: Anicuns"
                 oninput="filtrar('${chave}')"></label>
        <button class="limpar" type="button" onclick="limparFiltros('${chave}')">Limpar</button>
      </div>
      <p class="contagem" id="contagem-${chave}"></p>
      <div class="tabela-rolagem"><table class="tab-contratos">
        <thead><tr id="cab-${chave}"></tr></thead>
        <tbody id="corpo-${chave}"></tbody>
      </table></div>`)}`;
}

function filtrar(chave) {
  const st = estado[chave];
  st.f = {};
  st.busca = '';
  document.querySelectorAll(`#filtros-${chave} [data-campo]`).forEach((el) => {
    if (el.dataset.campo === 'busca') st.busca = el.value.trim().toLowerCase();
    else if (el.value) st.f[el.dataset.campo] = el.value;
  });
  pintarContratos(chave);
}

function limparFiltros(chave) {
  document.querySelectorAll(`#filtros-${chave} [data-campo]`).forEach((el) => { el.value = ''; });
  filtrar(chave);
}

function ordenar(chave, campo) {
  const st = estado[chave];
  const texto = ['orgao', 'mun', 'faixa', 'mod', 'sit', 'tipo', 'raz'].includes(campo);
  st.dir = st.campo === campo ? -st.dir : (texto ? 1 : -1);
  st.campo = campo;
  pintarContratos(chave);
}

function pintarContratos(chave) {
  const st = estado[chave];
  let linhas = base(chave).map((c) =>
    ({ ...c, sit: vigente(c) ? 'Vigente' : 'Encerrado' }));

  Object.entries(st.f).forEach(([campo, val]) => {
    linhas = linhas.filter((c) => String(c[campo]) === val);
  });
  if (st.busca) {
    linhas = linhas.filter((c) =>
      (c.mun + ' ' + c.orgao + ' ' + c.uf).toLowerCase().includes(st.busca));
  }

  linhas.sort((a, b) => {
    const x = a[st.campo], y = b[st.campo];
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * st.dir;
    return String(x).localeCompare(String(y), 'pt-BR') * st.dir;
  });

  document.getElementById(`cab-${chave}`).innerHTML = COLUNAS.map((col) => {
    if (col.fixo) return `<th>${col.rot}</th>`;
    const seta = st.campo === col.id ? `<span class="seta">${st.dir > 0 ? '▲' : '▼'}</span>` : '';
    return `<th class="ord ${col.num ? 'num' : ''}" onclick="ordenar('${chave}','${col.id}')"
      title="Ordenar por ${col.rot}">${col.rot} ${seta}</th>`;
  }).join('');

  document.getElementById(`corpo-${chave}`).innerHTML = linhas.map((c) => `
    <tr>
      <td>
        <span class="orgao" title="${esc(c.orgao)}">${esc(c.orgao)}</span>
        <span class="obj" title="${esc(c.objeto)}">${esc(c.objeto)}</span></td>
      <td>${esc(c.mun)} · ${c.uf}</td>
      <td class="num"><b>${moeda(c.mensal)}</b></td>
      <td class="num">${moeda(c.global)}</td>
      <td class="num">${dec1(c.meses)}</td>
      <td>${esc(c.tipo)}</td>
      <td class="num">${inteiro(c.pop)}</td>
      <td>${c.faixa}</td>
      <td>${esc(c.mod)}</td>
      <td class="num">${data(c.ini)} – ${data(c.fim)}</td>
      <td><span class="pastilha ${c.sit === 'Vigente' ? 'ok' : 'fria'}">${c.sit}</span></td>
      <td><span class="obj" title="${esc(c.raz)} · CNPJ ${c.cnpj}">${esc(c.raz)}</span></td>
      <td><a class="pncp" href="${esc(c.link)}" target="_blank" rel="noopener">abrir
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"/><line x1="20" y1="4" x2="11" y2="13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></a></td>
    </tr>`).join('') || `<tr><td colspan="${COLUNAS.length}" class="vazio">
      Nenhum contrato atende aos filtros escolhidos.</td></tr>`;

  document.getElementById(`contagem-${chave}`).innerHTML =
    `Exibindo <b>${linhas.length}</b> de <b>${base(chave).length}</b> contratos.`;
}

/* ── abas ───────────────────────────────────────────────── */
const ABAS = [
  { id: 'comparativo', rot: 'Comparativo' },
  { id: 'megasoft',    rot: 'Megasoft' },
  { id: 'prodata',     rot: 'Prodata' },
  { id: 'sigep',       rot: 'SIGEP' },
];

function trocarAba(id) {
  ABAS.forEach((a) => {
    const sel = a.id === id;
    document.getElementById(`aba-${a.id}`).hidden = !sel;
    const bt = document.getElementById(`bt-${a.id}`);
    bt.setAttribute('aria-selected', sel);
    bt.tabIndex = sel ? 0 : -1;
  });
  history.replaceState(null, '', '#' + id);
  window.scrollTo({ top: 0 });
}

function montar() {
  document.getElementById('abas').innerHTML = ABAS.map((a) => `
    <button type="button" id="bt-${a.id}" role="tab" aria-controls="aba-${a.id}"
            aria-selected="false" onclick="trocarAba('${a.id}')">${a.rot}</button>`).join('');

  document.getElementById('aba-comparativo').innerHTML = abaComparativo();
  EMPRESAS.forEach((k) => {
    document.getElementById(`aba-${k}`).innerHTML = abaContratos(k);
    pintarContratos(k);
  });

  const alvo = location.hash.slice(1);
  trocarAba(ABAS.some((a) => a.id === alvo) ? alvo : 'comparativo');
}

montar();
