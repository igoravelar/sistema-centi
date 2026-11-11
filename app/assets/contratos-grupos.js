/* Agrupamento da grid de contratos, comum ao benchmark de preços e ao de SIAFIC.

   Um município costuma assinar a mesma contratação em vários instrumentos no mesmo
   dia: um por secretaria ou fundo, ou um por lote do pregão. Na grid eles viram uma
   linha só, com os valores somados, que abre como accordion e mostra cada contrato.

   Mesmo órgão = mesmo município e mesmo poder. Secretarias e fundos entram com a
   prefeitura; a Câmara é outro poder e o Estado é outro ente, então ficam de fora
   mesmo quando assinam no mesmo dia. Mesma data = mesmo início de vigência.

   Quem usa precisa ter, no escopo global, `estado[chave].abertos` (um Set) e a
   função `pintarContratos(chave)`. */

const poderDoOrgao = (c) => c.tipo === 'Câmara' ? 'camara'
  : (c.tipo === 'Estado/Outro' || /^ESTADO D/.test(c.orgao)) ? 'outro' : 'executivo';

const chaveGrupo = (c) => [c.uf, c.mun, c.ini, poderDoOrgao(c)].join('|');

/** A linha do grupo: valores somados e, no que não soma, o valor comum aos contratos
    ou um rótulo de "vários". O nome do órgão é o da prefeitura, quando ela está lá. */
function somarGrupo(chave, filhos) {
  const comum = (campo, varios) => {
    const vals = [...new Set(filhos.map((c) => c[campo]))];
    return vals.length === 1 ? vals[0] : varios;
  };
  const soma = (campo) => filhos.some((c) => c[campo] == null) ? null
    : Math.round(filhos.reduce((t, c) => t + c[campo], 0) * 100) / 100;
  const principal = filhos.find((c) => /^MUNICIPIO DE/.test(c.orgao)) || filhos[0];
  return {
    ...principal,
    grupo: chave,
    filhos,
    objeto: `${filhos.length} contratos do mesmo órgão, assinados na mesma data`,
    tipo: comum('tipo', 'Vários'),
    mod: comum('mod', 'Várias'),
    raz: comum('raz', 'Várias'),
    ini: filhos.reduce((m, c) => c.ini < m ? c.ini : m, filhos[0].ini),
    fim: filhos.reduce((m, c) => c.fim > m ? c.fim : m, filhos[0].fim),
    meses: Math.max(...filhos.map((c) => c.meses)),
    mensal: soma('mensal'),
    global: soma('global'),
    hab: soma('hab'),
    sit: filhos.some((c) => c.sit === 'Vigente') ? 'Vigente' : 'Encerrado',
  };
}

/** Recebe os contratos já filtrados e devolve os itens da grid, na ordem pedida:
    contratos soltos e grupos, cada grupo com os seus contratos na mesma ordem. */
function agruparContratos(linhas, comparar) {
  const mapa = new Map();
  linhas.forEach((c) => {
    const k = chaveGrupo(c);
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(c);
  });
  const itens = [...mapa].map(([k, filhos]) =>
    filhos.length === 1 ? filhos[0] : somarGrupo(k, filhos.sort(comparar)));
  return itens.sort(comparar);
}

function alternarGrupo(chave, grupo) {
  const abertos = estado[chave].abertos;
  if (abertos.has(grupo)) abertos.delete(grupo);
  else abertos.add(grupo);
  pintarContratos(chave);
}

/** Primeira célula da linha: no grupo, a seta do accordion e a contagem; no contrato
    de dentro do grupo, o recuo que o prende visualmente à linha de cima. */
function celulaOrgao(chave, c, aberto) {
  const nome = `<span class="orgao" title="${esc(c.orgao)}">${esc(c.orgao)}</span>
    <span class="obj" title="${esc(c.objeto)}">${esc(c.objeto)}</span>`;
  if (!c.filhos) return `<td>${nome}</td>`;
  return `<td><button type="button" class="abre-grupo" aria-expanded="${aberto}"
      data-grupo="${esc(c.grupo)}" onclick="alternarGrupo('${chave}', this.dataset.grupo)"
      title="${aberto ? 'Fechar' : 'Ver'} os ${c.filhos.length} contratos">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
      <span class="qtd">${c.filhos.length}</span>
      <span class="nomes">${nome}</span></button></td>`;
}

/** Monta o corpo da grid: cada item vira uma linha, e o grupo aberto traz os seus
    contratos logo abaixo. `linha(c, classe, aberto)` desenha uma linha da página. */
function corpoAgrupado(chave, itens, linha) {
  const abertos = estado[chave].abertos;
  return itens.map((c) => {
    if (!c.filhos) return linha(c, '', false);
    const aberto = abertos.has(c.grupo);
    return linha(c, `agrupado${aberto ? ' aberto' : ''}`, aberto)
      + (aberto ? c.filhos.map((f, i) =>
        linha(f, `filho${i === c.filhos.length - 1 ? ' ultimo' : ''}`, false)).join('') : '');
  }).join('');
}

/** "Exibindo 32 de 202 contratos · 4 agrupados em 1 linha" */
function contagemAgrupada(itens, filtrados, total) {
  const grupos = itens.filter((c) => c.filhos);
  const dentro = grupos.reduce((t, g) => t + g.filhos.length, 0);
  const extra = grupos.length
    ? ` · <b>${dentro}</b> agrupados em <b>${grupos.length}</b> ${grupos.length === 1 ? 'linha' : 'linhas'} por órgão e data`
    : '';
  return `Exibindo <b>${filtrados}</b> de <b>${total}</b> contratos${extra}.`;
}
