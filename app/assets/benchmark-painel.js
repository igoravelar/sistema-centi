/* Painel do benchmark de preços do Protocolo 3.0.
   Lê BENCHMARK (assets/benchmark-dados.js) e monta as cinco abas.
   Todo texto explicativo vive em INFOS e só aparece na modal do botão (i),
   para que o painel mostre o dado e a leitura fique numa segunda camada. */

/* ── formatação ─────────────────────────────────────────── */
const HOJE = new Date().toISOString().slice(0, 10);

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** R$ sem centavos: no painel a diferença entre faixas é de milhares. */
const moeda = (v) => v == null ? semAmostra()
  : 'R$ ' + Math.round(v).toLocaleString('pt-BR');

/** Valores por habitante são pequenos e pedem duas casas. */
const moeda2 = (v) => v == null ? semAmostra()
  : 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inteiro = (v) => v == null ? semAmostra() : Math.round(v).toLocaleString('pt-BR');
const pct = (v) => v == null ? semAmostra() : Math.round(v * 100) + '%';

/** Percentual que preserva a casa decimal do parâmetro (4,5% e não 5%). */
const pctExato = (v) =>
  (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%';
const fator = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const data = (iso) => iso.split('-').reverse().join('/');
const semAmostra = () => '<span class="vazio">sem amostra</span>';

const vigente = (c) => c.fim >= HOJE;

/** Contratos ainda em vigor hoje: recalculado no navegador, como na planilha. */
function vigentes(chave) {
  return BENCHMARK.contratos[chave].filter(vigente).length;
}

const EMPRESAS = ['1doc', 'aprova', 'gove'];
const CONF_CLASSE = { Adequada: 'ok', Limitada: 'atencao', Insuficiente: 'alerta' };

/* ── camada explicativa: o conteúdo de cada modal (i) ───── */
const INFOS = {
  panorama: {
    titulo: 'Panorama consolidado',
    corpo: `
      <p>Retrato dos três fornecedores na base inteira, sem separar por faixa. Todos os valores
      são <b>mensais</b>: o valor global do contrato dividido pelos meses de vigência.</p>
      <ul>
        <li><b>Contratos</b> — contratos aderentes ao objeto, já descartados aditivos, empenhos,
        contratos sem valor, sem vigência definida ou com vigência inferior a 3 meses.</li>
        <li><b>Vigentes hoje</b> — contratos cuja data de fim ainda não passou. Este número se
        atualiza sozinho a cada vez que a página é aberta.</li>
        <li><b>Mediana geral</b> — mediana da base completa, vigentes e encerrados. Restringir as
        estatísticas aos vigentes reduziria a amostra a ponto de invalidar a mediana em várias
        faixas.</li>
        <li><b>Menor e maior contrato</b> — extremos observados. Contratos parciais e contratos que
        embutem implantação puxam os extremos, por isso eles servem de alerta, não de parâmetro.</li>
      </ul>
      <h4>Por que os três não se comparam entre si</h4>
      <p>Só a 1Doc tem o mesmo objeto do Protocolo 3.0. A Aprova vende licenciamento de obras e a
      Gove vende inteligência de dados e relacionamento com o cidadão. A mediana mais alta da Gove
      não significa que ela cobra mais pelo mesmo produto — significa que a prefeitura já aceita
      pagar aquele valor por software de gestão.</p>`,
  },
  modalidades: {
    titulo: 'Modalidades de entrada',
    corpo: `
      <p>Como cada fornecedor entra no município, segundo a modalidade registrada no contrato do
      PNCP. É a leitura mais operacional do painel: define o caminho que o comercial da Centi
      precisa saber conduzir.</p>
      <ul>
        <li><b>Dispensa</b> — contratação direta pelo valor. Ciclo curto, decisão concentrada no
        órgão.</li>
        <li><b>Pregão eletrônico</b> — disputa aberta. Ciclo longo, exige acompanhar planejamento,
        edital e disputa.</li>
        <li><b>Inexigibilidade</b> — contratação direta por ausência de competição, sustentada em
        exclusividade técnica do objeto.</li>
      </ul>
      <h4>O achado</h4>
      <p>Os três entram por caminhos diferentes. A 1Doc entra majoritariamente por <b>dispensa</b>,
      a Aprova por <b>pregão</b> e a Gove quase só por <b>inexigibilidade</b> — 26 dos 31 contratos,
      nenhum por dispensa. Uma tese de exclusividade técnica bem construída muda a porta de entrada
      no município.</p>`,
  },
  medianas: {
    titulo: 'Mediana mensal por faixa',
    corpo: `
      <p>Mediana do valor mensal <b>somente de prefeituras</b>, faixa por faixa, com o preço
      proposto pela Centi na mesma escala. Entidades vinculadas (câmaras, autarquias e consórcios)
      ficam fora porque têm base própria — o porte populacional não explica o preço delas.</p>
      <p>A leitura que interessa: em todas as faixas com amostra, a prefeitura paga <b>mais por
      dados e atendimento (Gove) do que por tramitação de processos (1Doc)</b> — de 1,7 a 2,5 vezes
      mais. Existe orçamento municipal para software de gestão acima do que o protocolo captura
      hoje.</p>
      <h4>Cuidado com a última faixa</h4>
      <p>Acima de 500 mil habitantes a 1Doc tem apenas 2 contratos e os outros dois fornecedores não
      têm nenhum. A mediana existe, mas não sustenta decisão de preço.</p>`,
  },
  fator: {
    titulo: 'Fator competitivo de mediana',
    corpo: `
      <p>Quanto o preço proposto pela Centi representa da mediana de cada fornecedor.
      <b>100% é paridade</b>; abaixo de 100% o preço entra por baixo da referência.</p>
      <p>O preço nasce de <b>uma única base</b> — a mediana da 1Doc, o único fornecedor com o mesmo
      objeto — multiplicada pelo fator de posicionamento definido para a faixa. As colunas da Aprova
      e da Gove mostram onde esse mesmo preço fica em relação a elas, sem virar base de cálculo
      concorrente.</p>
      <h4>Como interpretar</h4>
      <ul>
        <li><b>vs 1Doc</b> — a comparação de verdade. Entre 85% e 95%: entrada por preço contra o
        concorrente direto, com margem para diferenciação.</li>
        <li><b>vs Aprova e vs Gove</b> — medida de espaço no orçamento, não de disputa. O preço fica
        entre 38% e 68% do que o município já paga a eles.</li>
      </ul>`,
  },
  piso: {
    titulo: 'Comparativo pelo piso',
    corpo: `
      <p>Teste de sustentação: o preço da Centi <b>já com o desconto máximo de alçada</b> resiste ao
      menor contrato observado em cada fornecedor dentro daquela faixa?</p>
      <p>A versão anterior deste teste usava um piso global de R$ 675 e aprovava tudo. Agora ele usa
      o <b>menor contrato de cada concorrente dentro da faixa</b> — e por isso passou a reprovar
      coisas, que é justamente o que se espera de um teste.</p>
      <h4>Por que ficar abaixo de um piso não é veredito</h4>
      <p>Pisos são puxados para baixo por contratos parciais, por escopo reduzido e por contratos que
      não incluem implantação. Ficar abaixo do piso de um concorrente é <b>alerta para conferir o
      contrato que formou aquele piso</b>, não prova de que o preço está errado.</p>
      <p>O que este teste não responde: se o preço cobre o custo da Centi. Esse cálculo ainda não
      existe — depende do custo real de implantação e do custo de suporte por cliente.</p>`,
  },
  detalhe: {
    titulo: 'Resumo por faixa, fornecedor por fornecedor',
    corpo: `
      <p>A base de cada fornecedor aberta em faixa populacional (prefeituras) e em tipo de entidade
      (câmaras, autarquias, consórcios e fundos). Valores mensais.</p>
      <ul>
        <li><b>n</b> — contratos na faixa. <b>Vigentes</b> — os que ainda estão em vigor.</li>
        <li><b>Mínimo, máximo e mediana</b> — calculados sobre a base completa da faixa.</li>
        <li><b>Mediana anual</b> — a mediana mensal multiplicada por 12. Serve para dimensionar
        contrato e conferir enquadramento em dispensa.</li>
      </ul>
      <h4>Confiabilidade</h4>
      <ul>
        <li><b>Adequada</b> — amostra suficiente para sustentar a mediana.</li>
        <li><b>Limitada</b> — 5 a 6 contratos. Use com ressalva.</li>
        <li><b>Insuficiente</b> — menos de 5 contratos. Não sustenta mediana; serve de indício.</li>
      </ul>
      <p>A dispersão dentro de uma faixa reflete <b>escopo contratado</b> — planos e módulos
      diferentes — e não apenas porte do município.</p>`,
  },
  globais: {
    titulo: 'Parâmetros globais',
    corpo: `
      <p>As premissas que alimentam todo o cálculo de preço. Mudar um parâmetro aqui recalcula a
      tabela inteira.</p>
      <ul>
        <li><b>Base de referência</b> — 1Doc, único fornecedor com o mesmo objeto do Protocolo 3.0.
        Aprova e Gove entram como contexto de mercado, nunca como base.</li>
        <li><b>Prazo padrão de 12 meses</b> — padrão observado: 96 dos 114 contratos da 1Doc.</li>
        <li><b>Implantação a 25% da assinatura anual</b> — premissa provisória. Precisa ser
        substituída pelo custo real de implantação da Centi.</li>
        <li><b>Desconto máximo de 10%</b> — alçada comercial, concedida apenas contra contrapartida
        contratual.</li>
        <li><b>Limite de dispensa</b> — ainda não preenchido. É atualizado por decreto e precisa de
        validação do jurídico antes de dimensionar contrato.</li>
      </ul>`,
  },
  precofaixa: {
    titulo: 'Preço por faixa · prefeituras',
    corpo: `
      <p>O preço de cada faixa é a mediana da base escolhida multiplicada pelo <b>fator de
      posicionamento</b>, arredondado para valor comercial.</p>
      <ul>
        <li><b>Fator 1,00</b> — paridade com a base.</li>
        <li><b>Abaixo de 1,00</b> — entrada por preço.</li>
        <li><b>Acima de 1,00</b> — prêmio, e exige diferenciação comprovada na proposta.</li>
      </ul>
      <p>O fator é <b>decisão estratégica, não cálculo</b>: os valores atuais (0,85 · 0,90 · 0,95 ·
      1,00) são uma proposta a ser confirmada pela Centi.</p>
      <p><b>Contrato ano 1</b> soma a assinatura anual e a implantação — é o valor que vai ao
      processo de contratação e o que determina o enquadramento em dispensa.</p>`,
  },
  posic: {
    titulo: 'Posicionamento resultante',
    corpo: `
      <p>O mesmo preço da tabela de faixas, lido contra a mediana de cada um dos três fornecedores.
      100% é paridade.</p>
      <p>Serve para responder em reunião, com uma linha: onde o nosso preço fica em relação a cada
      um deles. Note que a comparação com Aprova e Gove <b>mede espaço no orçamento municipal</b>,
      porque os objetos são diferentes — nunca use esses percentuais como justificativa de preço em
      proposta.</p>`,
  },
  entidades: {
    titulo: 'Entidades vinculadas',
    corpo: `
      <p>Câmaras, autarquias, fundações e consórcios <b>não seguem a faixa populacional</b>: o preço
      vem da mediana observada para aquele tipo de entidade. Somente a 1Doc tem amostra relevante
      aqui; Aprova e Gove não entram.</p>
      <p>Uma advertência comercial por tipo:</p>
      <ul>
        <li><b>Câmara Municipal</b> — apenas tramitação administrativa. Não vender como sistema
        legislativo.</li>
        <li><b>Autarquia e fundação</b> — volume alto no saneamento; precificar por usuários.</li>
        <li><b>Consórcio público</b> — ticket baixo, mas o valor está no acesso aos municípios
        consorciados.</li>
      </ul>
      <p>Vender para várias entidades do mesmo município exige parecer sobre fracionamento antes de
      montar as propostas.</p>`,
  },
  t4a: {
    titulo: 'Teste de piso',
    corpo: `
      <p>Pergunta que este teste responde: <b>o preço é sustentável diante do menor contrato já
      praticado no mercado?</b></p>
      <p>Compara o preço com desconto máximo contra o menor valor mensal observado em cada
      fornecedor dentro da faixa. Pisos são puxados para baixo por contratos parciais e por escopo
      reduzido — trate um resultado abaixo do piso como alerta para conferir aquele contrato, não
      como veredito.</p>`,
  },
  t4b: {
    titulo: 'Teste de orçamento',
    corpo: `
      <p>Pergunta que este teste responde: <b>o município tem orçamento para pagar esse preço?</b></p>
      <p>Mede quanto o preço proposto representa do que o município já paga a cada fornecedor. Não é
      concorrência direta com Aprova e Gove: é a medida do espaço disponível no orçamento municipal
      de software de gestão.</p>
      <p>Passar nos dois testes <b>não significa que o preço cobre o custo da Centi</b>. Esse teste
      ainda não existe.</p>`,
  },
};

/* A aba de contratos de cada fornecedor tem a mesma metodologia e uma ressalva
   própria sobre o que aquela base pode e não pode sustentar. */
const RESSALVA = {
  '1doc': `<p><b>Benchmark direto.</b> Objeto idêntico ao Protocolo 3.0: protocolo, tramitação de
    processos administrativos e gestão documental. Esta é a única base que alimenta a proposta de
    preço da Centi.</p>
    <p>De 196 contratos localizados no PNCP, 114 são aderentes ao objeto. Em 5 a 6 deles a
    assinatura e a implantação estão somadas no valor global — separá-las é uma pendência que
    corrigirá a mediana para baixo.</p>`,
  aprova: `<p><b>Referência adjacente.</b> A Aprova atua predominantemente em licenciamento de
    obras, alvarás e aprovação de projetos. Serve como referência de teto do que a prefeitura paga
    por software de processos, não como preço comparável ao Protocolo 3.0.</p>
    <p>De 57 contratos localizados, 14 são aderentes. Amostra pequena: a mediana de cada faixa se
    move com um contrato só.</p>`,
  gove: `<p><b>Adjacente e não comparável no objeto.</b> A plataforma Gove é inteligência de dados,
    gestão tributária e relacionamento com o cidadão. <b>Nenhum</b> dos contratos analisados tem por
    objeto tramitação de processos administrativos ou protocolo eletrônico.</p>
    <p>Use esta base para saber quanto a prefeitura aceita pagar por software de gestão — nunca como
    parâmetro de preço do Protocolo 3.0.</p>`,
};

function infoMetodologia(chave) {
  const e = BENCHMARK.empresas[chave];
  return {
    titulo: `Contratos ${e.nome} · como esta base foi montada`,
    corpo: `
      ${RESSALVA[chave]}
      <h4>Critério de seleção</h4>
      <ul>
        <li>Mantidos apenas registros do tipo <b>Contrato (termo inicial)</b> e <b>Termo de
        adesão</b>. Aditivos e empenhos foram excluídos para não duplicar valores.</li>
        <li>Descartados contratos sem valor, sem vigência definida ou com vigência inferior a
        3 meses.</li>
      </ul>
      <h4>Como o valor mensal foi calculado</h4>
      <p>Valor global do contrato dividido pelos meses de vigência. É uma <b>aproximação</b>, não o
      valor de assinatura informado pelo fornecedor. O valor global frequentemente inclui
      implantação e treinamento, então o mensal calculado tende a estar acima da assinatura pura.</p>
      <h4>Vigente x encerrado</h4>
      <p>A situação é calculada na hora, comparando a data de fim com a data de hoje — ela se
      atualiza sozinha. As estatísticas de mínimo, máximo e mediana usam a base completa, vigentes e
      encerrados.</p>
      <h4>Outras ressalvas</h4>
      <ul>
        <li>O escopo contratado varia entre contratos (planos e módulos diferentes). A dispersão
        dentro de uma faixa reflete escopo, não só porte.</li>
        <li>Base com contratos de 2023 a 2026, <b>sem correção monetária</b>.</li>
        <li>O número de contratos no PNCP é o <b>piso</b> da carteira de cada empresa, não o total de
        clientes.</li>
      </ul>
      <p>População municipal: IBGE, Estimativas da População 2024, cruzada pelo código IBGE do
      órgão.</p>`,
  };
}

/* ── modal ──────────────────────────────────────────────── */
function abrirInfo(chave) {
  const info = INFOS[chave] || (chave.startsWith('metodologia:') && infoMetodologia(chave.split(':')[1]));
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

/** Número com a barra da proporção ao lado, para comparar sem ler a tabela. */
function celulaBarra(valor, total, cor) {
  const p = total ? (valor / total) * 100 : 0;
  return `
    <div class="cel-barra">
      <span class="trilho"><span class="preenche" style="width:${p.toFixed(1)}%;background:${cor}"></span></span>
      <span class="n"><b>${inteiro(valor)}</b></span>
    </div>`;
}

/* ── aba 1 · resumo por faixa ───────────────────────────── */
function selosHTML() {
  return `<div class="selos">${EMPRESAS.map((k) => {
    const e = BENCHMARK.empresas[k];
    const classe = { direto: 'ok', adjacente: 'atencao', 'nao-comparavel': 'alerta' }[e.grauTipo];
    return `
      <div class="selo ${k}">
        <h4>${e.nome}</h4>
        <p class="razao">${esc(e.razao)} · CNPJ ${e.cnpj}</p>
        <p class="grau"><span class="pastilha ${classe}">${e.grau}</span></p>
        <p>${esc(e.objeto)}</p>
        <p class="carteira"><b>${e.localizados}</b> contratos localizados no PNCP ·
          <b>${e.aderentes}</b> aderentes ao objeto</p>
      </div>`;
  }).join('')}</div>`;
}

function panoramaHTML() {
  const linhas = [
    ['Contratos', (e, k) => inteiro(e.total.n)],
    ['Vigentes hoje', (e, k) => inteiro(vigentes(k))],
    ['Mediana geral', (e) => moeda(e.total.med)],
    ['Menor contrato', (e) => moeda(e.total.min)],
    ['Maior contrato', (e) => moeda(e.total.max)],
  ];
  const corpo = `
    <div class="tabela-rolagem">
      <table>
        <thead><tr><th></th>${EMPRESAS.map((k) =>
          `<th class="num">${BENCHMARK.empresas[k].nome}</th>`).join('')}</tr></thead>
        <tbody>${linhas.map(([rot, fn]) => `
          <tr>
            <td class="rot-linha">${rot}</td>
            ${EMPRESAS.map((k) => `<td class="num">${fn(BENCHMARK.empresas[k], k)}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="leitura">A Gove pratica mediana <b>3,5 vezes</b> a da 1Doc na mesma base de municípios.
      Objetos diferentes — o que o número mostra é o orçamento que a prefeitura aceita comprometer
      com software de gestão.</p>`;
  return quadro('Panorama consolidado', 'valores mensais', 'panorama', corpo);
}

function modalidadesHTML() {
  const CORES = { '1doc': 'var(--c-1doc)', aprova: 'var(--c-aprova)', gove: 'var(--c-gove)' };
  const linhas = [
    ['Dispensa', 'dispensa'],
    ['Pregão eletrônico', 'pregao'],
    ['Inexigibilidade', 'inexig'],
    ['Outras modalidades', 'outras'],
  ];
  const corpo = `
    <div class="tabela-rolagem">
      <table>
        <thead><tr><th>Modalidade</th>${EMPRESAS.map((k) =>
          `<th>${BENCHMARK.empresas[k].nome}</th>`).join('')}</tr></thead>
        <tbody>${linhas.map(([rot, campo]) => `
          <tr>
            <td class="rot-linha">${rot}</td>
            ${EMPRESAS.map((k) => {
              const e = BENCHMARK.empresas[k];
              return `<td>${celulaBarra(e.params[campo], e.total.n, CORES[k])}</td>`;
            }).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="leitura">As três entram no município por caminhos diferentes: a 1Doc por
      <b>dispensa</b> (62 de 114), a Aprova por <b>pregão</b> (11 de 14) e a Gove por
      <b>inexigibilidade</b> (26 de 31, nenhum por dispensa). A barra mostra a fatia da carteira de
      cada empresa.</p>`;
  return quadro('Modalidades de entrada', 'como cada fornecedor entra no município', 'modalidades', corpo);
}

function graficoMedianasHTML() {
  const props = {};
  BENCHMARK.proposta.faixas.forEach((f) => { props[f.faixa] = f.mensal; });
  const todos = BENCHMARK.comparativo.flatMap((c) => [c.d1, c.aprova, c.gove, props[c.faixa]]);
  const max = Math.max(...todos.filter((v) => v != null));

  const serie = (classe, nome, sub, valor) => {
    if (valor == null) {
      return `<div class="serie ${classe}"><span class="nome">${nome}<i>${sub}</i></span>
        <span class="barra"><span class="v vazio">sem amostra</span></span></div>`;
    }
    return `
      <div class="serie ${classe}">
        <span class="nome">${nome}<i>${sub}</i></span>
        <span class="barra">
          <span class="b" style="width:${((valor / max) * 100).toFixed(1)}%"></span>
          <span class="v">${moeda(valor)}</span>
        </span>
      </div>`;
  };

  const corpo = `
    <div class="legenda">
      <span class="l-1doc"><i></i>1Doc · protocolo</span>
      <span class="l-aprova"><i></i>Aprova · licenciamento</span>
      <span class="l-gove"><i></i>Gove · dados e atendimento</span>
      <span class="l-centi"><i></i>Centi · preço proposto</span>
    </div>
    <div class="grafico">${BENCHMARK.comparativo.map((c) => `
      <div class="faixa-grupo">
        <span class="faixa-nome">${c.faixa}</span>
        ${serie('s-1doc', '1Doc', 'protocolo', c.d1)}
        ${serie('s-aprova', 'Aprova', 'licenciamento', c.aprova)}
        ${serie('s-gove', 'Gove', 'dados', c.gove)}
        ${serie('s-centi', 'Centi', 'proposto', props[c.faixa])}
      </div>`).join('')}
    </div>
    <p class="leitura">Em todas as faixas com amostra, a prefeitura paga mais por dados e atendimento
      do que por tramitação de processos — <b>1,7x</b> nas duas primeiras faixas e <b>2,5x</b> na
      faixa de 100 a 500 mil habitantes.</p>`;
  return quadro('Mediana mensal por faixa', 'somente prefeituras', 'medianas', corpo);
}

function fatorHTML() {
  const barra = (v, cor) => {
    if (v == null) return semAmostra();
    return `
      <div class="cel-barra">
        <span class="trilho"><span class="preenche" style="width:${Math.min(v * 100, 100).toFixed(1)}%;background:${cor}"></span></span>
        <span class="n"><b>${pct(v)}</b></span>
      </div>`;
  };
  const corpo = `
    <div class="tabela-rolagem">
      <table>
        <thead><tr>
          <th>Faixa</th><th class="num">Preço Centi</th>
          <th>vs 1Doc</th><th>vs Aprova</th><th>vs Gove</th>
        </tr></thead>
        <tbody>${BENCHMARK.proposta.posic.map((p) => `
          <tr>
            <td class="rot-linha">${p.faixa}</td>
            <td class="num">${moeda(p.mensal)}</td>
            <td>${barra(p.d1, 'var(--c-1doc)')}</td>
            <td>${barra(p.aprova, 'var(--c-aprova)')}</td>
            <td>${barra(p.gove, 'var(--c-gove)')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="leitura">100% é paridade. O preço fica entre <b>85% e 95%</b> da mediana da 1Doc — o
      único concorrente de objeto igual — e entre <b>38% e 68%</b> da Aprova e da Gove, que medem
      espaço no orçamento, não disputa.</p>`;
  return quadro('Fator competitivo de mediana', 'quanto o preço proposto representa da mediana de cada fornecedor', 'fator', corpo);
}

function pisoHTML() {
  const sitClasse = (s) => s.startsWith('Acima') ? 'ok' : 'atencao';
  const corpo = `
    <div class="tabela-rolagem">
      <table>
        <thead><tr>
          <th>Faixa</th><th class="num">Com desconto</th>
          <th class="num">Piso 1Doc</th><th class="num">Piso Aprova</th><th class="num">Piso Gove</th>
          <th>Situação</th>
        </tr></thead>
        <tbody>${BENCHMARK.proposta.piso.map((p) => `
          <tr>
            <td class="rot-linha">${p.faixa}</td>
            <td class="num"><b>${moeda(p.desconto)}</b></td>
            <td class="num">${moeda(p.d1)}</td>
            <td class="num">${moeda(p.aprova)}</td>
            <td class="num">${moeda(p.gove)}</td>
            <td><span class="pastilha ${sitClasse(p.sit)}">${esc(p.sit)}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="leitura">O preço testado é o <b>já descontado em 10%</b>, o limite da alçada comercial.
      Ficar abaixo do piso de um concorrente é alerta para conferir o contrato que formou aquele
      piso — contratos parciais e escopo reduzido derrubam o piso —, não veredito sobre o
      preço.</p>`;
  return quadro('Comparativo pelo piso', 'o preço com desconto máximo resiste ao menor contrato de cada concorrente?', 'piso', corpo);
}

function tabelaResumo(empresa) {
  const linha = (l) => `
    <tr>
      <td class="rot-linha">${l.rot}</td>
      <td class="num">${l.n}</td>
      <td class="num">${l.vig}</td>
      <td class="num">${moeda(l.min)}</td>
      <td class="num">${moeda(l.max)}</td>
      <td class="num"><b>${moeda(l.med)}</b></td>
      <td class="num">${moeda(l.ano)}</td>
      <td><span class="pastilha ${CONF_CLASSE[l.conf]}">${l.conf}</span></td>
    </tr>`;
  const pref = empresa.prefeituras.filter((l) => l.rot !== 'Total prefeituras');
  const totalPref = empresa.prefeituras.find((l) => l.rot === 'Total prefeituras');
  return `
    <div class="tabela-rolagem">
      <table>
        <thead><tr>
          <th>Faixa / entidade</th><th class="num">n</th><th class="num">Vigentes</th>
          <th class="num">Mínimo</th><th class="num">Máximo</th><th class="num">Mediana</th>
          <th class="num">Mediana anual</th><th>Confiabilidade</th>
        </tr></thead>
        <tbody>
          <tr class="grupo"><td colspan="8">Prefeituras</td></tr>
          ${pref.map(linha).join('')}
          ${totalPref ? `<tr class="total">
            <td>${totalPref.rot}</td><td class="num">${totalPref.n}</td>
            <td class="num">${totalPref.vig}</td><td class="num">${moeda(totalPref.min)}</td>
            <td class="num">${moeda(totalPref.max)}</td><td class="num">${moeda(totalPref.med)}</td>
            <td class="num">${moeda(totalPref.ano)}</td><td></td></tr>` : ''}
          <tr class="grupo"><td colspan="8">Entidades vinculadas</td></tr>
          ${empresa.entidades.map(linha).join('')}
          <tr class="total">
            <td>${empresa.total.rot}</td><td class="num">${empresa.total.n}</td>
            <td class="num">${empresa.total.vig}</td><td class="num">${moeda(empresa.total.min)}</td>
            <td class="num">${moeda(empresa.total.max)}</td>
            <td class="num">${moeda(empresa.total.med)}</td>
            <td class="num">${moeda(empresa.total.ano)}</td><td></td>
          </tr>
        </tbody>
      </table>
    </div>`;
}

function abaResumo() {
  const detalhes = EMPRESAS.map((k) => {
    const e = BENCHMARK.empresas[k];
    return quadro(`${e.nome} · resumo por faixa`, e.grau, 'detalhe',
      tabelaResumo(e) + `
      <p class="leitura">Mediana de <b>${moeda2(e.params.hab)}</b> por habitante por ano ·
        piso observado em prefeituras de <b>${moeda(e.params.piso)}</b> ·
        <b>${e.params.m12}</b> dos ${e.total.n} contratos são de 12 meses.</p>`);
  }).join('');

  return `
    <h2>Resumo por faixa</h2>
    <p class="lead">Panorama dos três fornecedores que a Centi encontra no município, a partir dos
      contratos publicados no PNCP. Valores mensais: valor global do contrato dividido pelos meses
      de vigência.</p>
    ${selosHTML()}
    ${panoramaHTML()}
    ${modalidadesHTML()}
    ${graficoMedianasHTML()}
    ${fatorHTML()}
    ${pisoHTML()}
    ${detalhes}`;
}

/* ── abas 2, 3 e 4 · contratos ──────────────────────────── */
/* Ordem das colunas: o que decide preço vem primeiro, para ficar visível sem
   rolar a tabela na horizontal. O ano do contrato saiu — repete o início da
   vigência — e continua disponível como filtro. */
const COLUNAS = [
  { id: 'orgao',  rot: 'Órgão contratante' },
  { id: 'mun',    rot: 'Município' },
  { id: 'mensal', rot: 'Valor mensal', num: true },
  { id: 'global', rot: 'Valor global', num: true },
  { id: 'pop',    rot: 'População', num: true },
  { id: 'faixa',  rot: 'Faixa' },
  { id: 'mod',    rot: 'Modalidade' },
  { id: 'fim',    rot: 'Vigência' },
  { id: 'sit',    rot: 'Situação' },
  { id: 'hab',    rot: 'R$/hab/ano', num: true },
  { id: 'link',   rot: 'PNCP', fixo: true },
];

const estado = {};

function opcoes(chave, campo, rotulo) {
  const vals = [...new Set(BENCHMARK.contratos[chave].map((c) => c[campo]))].sort();
  return `<label>${rotulo}<select data-campo="${campo}" onchange="filtrar('${chave}')">
    <option value="">Todas</option>
    ${vals.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}
  </select></label>`;
}

function abaContratos(chave) {
  const e = BENCHMARK.empresas[chave];
  const base = BENCHMARK.contratos[chave];
  estado[chave] = { campo: 'mensal', dir: -1, f: {}, busca: '' };

  const kpis = [
    ['Contratos aderentes', inteiro(e.total.n), `de ${e.localizados} localizados no PNCP`],
    ['Vigentes hoje', inteiro(vigentes(chave)), 'fim de vigência ainda não passou'],
    ['Mediana mensal', moeda(e.total.med), 'base completa'],
    ['Menor contrato', moeda(e.total.min), 'mensal observado'],
    ['Maior contrato', moeda(e.total.max), 'mensal observado'],
    ['R$/hab/ano', moeda2(e.params.hab), 'mediana da base'],
  ];

  const classe = { direto: 'ok', adjacente: 'atencao', 'nao-comparavel': 'alerta' }[e.grauTipo];

  return `
    <h2>Contratos ${e.nome}</h2>
    <p class="lead">${esc(e.razao)} · CNPJ ${e.cnpj} —
      <span class="pastilha ${classe}">${e.grau}</span></p>
    <div class="nota ${chave === '1doc' ? 'verde' : ''}">
      <p><b>Objeto contratado:</b> ${esc(e.objeto)}</p>
    </div>
    <div class="kpis">${kpis.map(([l, v, o]) => `
      <div class="kpi"><span class="lbl">${l}</span><span class="val">${v}</span>
        <span class="obs">${o}</span></div>`).join('')}
    </div>
    ${quadro(`Contratos aderentes ao objeto`, `${base.length} registros`, `metodologia:${chave}`, `
      <div class="filtros" id="filtros-${chave}">
        ${opcoes(chave, 'faixa', 'Faixa populacional')}
        ${opcoes(chave, 'tipo', 'Tipo de entidade')}
        ${opcoes(chave, 'mod', 'Modalidade')}
        <label>Situação<select data-campo="sit" onchange="filtrar('${chave}')">
          <option value="">Todas</option>
          <option value="Vigente">Vigente</option>
          <option value="Encerrado">Encerrado</option>
        </select></label>
        ${opcoes(chave, 'ano', 'Ano')}
        <label>Buscar município ou órgão
          <input type="search" data-campo="busca" placeholder="ex.: Botuverá"
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
  st.dir = st.campo === campo ? -st.dir : (['orgao', 'mun', 'faixa', 'mod', 'sit'].includes(campo) ? 1 : -1);
  st.campo = campo;
  pintarContratos(chave);
}

function pintarContratos(chave) {
  const st = estado[chave];
  let linhas = BENCHMARK.contratos[chave].map((c) =>
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
      <td class="num">${inteiro(c.pop)}</td>
      <td>${c.faixa}</td>
      <td>${esc(c.mod)}</td>
      <td class="num">${data(c.ini)} – ${data(c.fim)}</td>
      <td><span class="pastilha ${c.sit === 'Vigente' ? 'ok' : 'fria'}">${c.sit}</span></td>
      <td class="num">${moeda2(c.hab)}</td>
      <td><a class="pncp" href="${esc(c.link)}" target="_blank" rel="noopener">abrir
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"/><line x1="20" y1="4" x2="11" y2="13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></a></td>
    </tr>`).join('') || `<tr><td colspan="${COLUNAS.length}" class="vazio">
      Nenhum contrato atende aos filtros escolhidos.</td></tr>`;

  const total = BENCHMARK.contratos[chave].length;
  document.getElementById(`contagem-${chave}`).innerHTML =
    `Exibindo <b>${linhas.length}</b> de <b>${total}</b> contratos.`;
}

/* ── aba 5 · proposta de preço ──────────────────────────── */
/** Cada parâmetro global é lido conforme o seu tipo; o pendente vira pastilha. */
function valorGlobal(g) {
  if (g.tipo === 'pendente') return '<span class="pastilha atencao">a definir</span>';
  if (g.tipo === 'pct') return pctExato(g.val);
  if (g.tipo === 'meses') return g.val + ' meses';
  return esc(g.val);
}

function abaCenti() {
  const p = BENCHMARK.proposta;

  const globais = quadro('Parâmetros globais', 'premissas que alimentam o cálculo', 'globais', `
    <div class="tabela-rolagem"><table>
      <thead><tr><th>Parâmetro</th><th class="num">Valor</th><th>Observação</th></tr></thead>
      <tbody>${p.globais.map((g) => `
        <tr>
          <td class="rot-linha">${esc(g.rot)}</td>
          <td class="num">${valorGlobal(g)}</td>
          <td>${esc(g.nota)}</td>
        </tr>`).join('')}</tbody>
    </table></div>`);

  const faixas = quadro('Preço por faixa · prefeituras', 'mediana da base × fator de posicionamento', 'precofaixa', `
    <div class="tabela-rolagem"><table>
      <thead><tr>
        <th>Faixa</th><th class="num">Mediana 1Doc</th><th class="num">Mediana Aprova</th>
        <th class="num">Mediana Gove</th><th class="num">Fator</th>
        <th class="num">Assinatura mensal</th><th class="num">Assinatura anual</th>
        <th class="num">Implantação</th><th class="num">Contrato ano 1</th>
      </tr></thead>
      <tbody>${p.faixas.map((f) => `
        <tr>
          <td class="rot-linha">${f.faixa}</td>
          <td class="num">${moeda(f.d1)}</td>
          <td class="num">${moeda(f.aprova)}</td>
          <td class="num">${moeda(f.gove)}</td>
          <td class="num">${fator(f.fator)}</td>
          <td class="num"><b>${moeda(f.mensal)}</b></td>
          <td class="num">${moeda(f.anual)}</td>
          <td class="num">${moeda(f.implant)}</td>
          <td class="num">${moeda(f.ano1)}</td>
        </tr>`).join('')}</tbody>
    </table></div>
    <p class="leitura">O fator é <b>decisão estratégica, não cálculo</b>. Os valores atuais
      (0,85 · 0,90 · 0,95 · 1,00) são proposta a ser confirmada. A implantação está em 25% da
      assinatura anual, premissa que precisa ser substituída pelo custo real.</p>`);

  const posic = quadro('Posicionamento resultante', '100% é paridade com o fornecedor', 'posic', `
    <div class="tabela-rolagem"><table>
      <thead><tr>
        <th>Faixa</th><th class="num">Assinatura mensal</th>
        <th class="num">vs 1Doc</th><th class="num">vs Aprova</th><th class="num">vs Gove</th>
      </tr></thead>
      <tbody>${p.posic.map((r) => `
        <tr>
          <td class="rot-linha">${r.faixa}</td>
          <td class="num"><b>${moeda(r.mensal)}</b></td>
          <td class="num">${pct(r.d1)}</td>
          <td class="num">${pct(r.aprova)}</td>
          <td class="num">${pct(r.gove)}</td>
        </tr>`).join('')}</tbody>
    </table></div>`);

  const entidades = quadro('Entidades vinculadas', 'base própria, sem faixa populacional', 'entidades', `
    <div class="tabela-rolagem"><table>
      <thead><tr>
        <th>Tipo de entidade</th><th class="num">Mediana 1Doc</th><th class="num">n</th>
        <th class="num">Fator</th><th class="num">Assinatura mensal</th>
        <th class="num">Implantação</th><th class="num">Contrato ano 1</th><th>Advertência</th>
      </tr></thead>
      <tbody>${p.entidades.map((r) => `
        <tr>
          <td class="rot-linha">${r.rot}</td>
          <td class="num">${moeda(r.med)}</td>
          <td class="num">${r.n}</td>
          <td class="num">${fator(r.fator)}</td>
          <td class="num"><b>${moeda(r.mensal)}</b></td>
          <td class="num">${moeda(r.implant)}</td>
          <td class="num">${moeda(r.ano1)}</td>
          <td>${esc(r.obs)}</td>
        </tr>`).join('')}</tbody>
    </table></div>`);

  const t4a = quadro('Teste de piso', 'o preço com desconto máximo resiste ao menor contrato do mercado?', 't4a', `
    <div class="tabela-rolagem"><table>
      <thead><tr>
        <th>Faixa</th><th class="num">Assinatura mensal</th><th class="num">Com desconto</th>
        <th class="num">Piso 1Doc</th><th class="num">Piso Aprova</th><th class="num">Piso Gove</th>
        <th>Situação</th>
      </tr></thead>
      <tbody>${p.piso.map((r) => `
        <tr>
          <td class="rot-linha">${r.faixa}</td>
          <td class="num">${moeda(r.mensal)}</td>
          <td class="num"><b>${moeda(r.desconto)}</b></td>
          <td class="num">${moeda(r.d1)}</td>
          <td class="num">${moeda(r.aprova)}</td>
          <td class="num">${moeda(r.gove)}</td>
          <td><span class="pastilha ${r.sit.startsWith('Acima') ? 'ok' : 'atencao'}">${esc(r.sit)}</span></td>
        </tr>`).join('')}</tbody>
    </table></div>`);

  const t4b = quadro('Teste de orçamento', 'quanto o preço representa do que o município já paga', 't4b', `
    <div class="tabela-rolagem"><table>
      <thead><tr>
        <th>Faixa</th><th class="num">Assinatura mensal</th><th class="num">% da mediana 1Doc</th>
        <th class="num">% Aprova</th><th class="num">% Gove</th><th>Leitura</th>
      </tr></thead>
      <tbody>${p.orcamento.map((r) => `
        <tr>
          <td class="rot-linha">${r.faixa}</td>
          <td class="num">${moeda(r.mensal)}</td>
          <td class="num">${pct(r.d1)}</td>
          <td class="num">${pct(r.aprova)}</td>
          <td class="num">${pct(r.gove)}</td>
          <td>${r.leitura.startsWith('Folga')
            ? '<span class="pastilha ok">Folga no orçamento</span>'
            : '<span class="pastilha fria">sem base de comparação</span>'}</td>
        </tr>`).join('')}</tbody>
    </table></div>`);

  return `
    <h2>Proposta de preço Centi</h2>
    <p class="lead">Modelo paramétrico: o preço deriva de <b>uma única base de referência</b> — a
      mediana da 1Doc, o único fornecedor com o mesmo objeto do Protocolo 3.0 — multiplicada pelo
      fator de posicionamento da faixa. Aprova e Gove entram como contexto de mercado, nunca como
      base de cálculo.</p>
    ${globais}
    ${faixas}
    ${posic}
    ${entidades}
    ${t4a}
    ${t4b}
    <div class="nota alerta">
      <p><b>Decisões pendentes da Centi</b> — o modelo não fecha sem elas:</p>
      <ul>
        <li>Custo real de implantação por porte — define se o percentual de 25% se sustenta.</li>
        <li>Custo de suporte por cliente — define o piso abaixo do qual a faixa de entrada não
          fecha.</li>
        <li>Fator de posicionamento por faixa — decisão estratégica, não cálculo.</li>
        <li>Limite de dispensa vigente — validar com o jurídico antes de dimensionar contrato.</li>
        <li>Política de preço para múltiplas entidades do mesmo município — exige parecer sobre
          fracionamento.</li>
        <li>Separar assinatura de implantação em 5 a 6 contratos da 1Doc, para corrigir a mediana do
          benchmark.</li>
      </ul>
      <p>Passar nos dois testes não significa que o preço cobre o custo da Centi. <b>Esse teste
        ainda não existe.</b></p>
    </div>`;
}

/* ── abas ───────────────────────────────────────────────── */
const ABAS = [
  { id: 'resumo', rot: 'Resumo por faixa' },
  { id: '1doc',   rot: 'Contratos 1Doc' },
  { id: 'aprova', rot: 'Contratos Aprova' },
  { id: 'gove',   rot: 'Contratos Gove' },
  { id: 'centi',  rot: 'Proposta de preço Centi' },
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

  document.getElementById('aba-resumo').innerHTML = abaResumo();
  EMPRESAS.forEach((k) => {
    document.getElementById(`aba-${k}`).innerHTML = abaContratos(k);
    pintarContratos(k);
  });
  document.getElementById('aba-centi').innerHTML = abaCenti();

  const alvo = location.hash.slice(1);
  trocarAba(ABAS.some((a) => a.id === alvo) ? alvo : 'resumo');
}

montar();
