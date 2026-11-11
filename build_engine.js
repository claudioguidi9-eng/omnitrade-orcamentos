const fs = require('fs');
const path = require('path');

const dirData = path.join(__dirname, 'data');
const mat = JSON.parse(fs.readFileSync(path.join(dirData, 'materiais_otb.json'), 'utf8'));
const imp = JSON.parse(fs.readFileSync(path.join(dirData, 'impostos_otb.json'), 'utf8'));
const art = JSON.parse(fs.readFileSync(path.join(dirData, 'artigos_sinteticos_otb.json'), 'utf8'));
const bib = JSON.parse(fs.readFileSync(path.join(dirData, 'bibliotecas_otb.json'), 'utf8'));

const engineCode = `// OTB Engine v3.0 - Omnitrade Propostas & Custos
// Gerado automaticamente com base na planilha oficial PROPOSTA TIPO OTB_2024_01.xlsm

const MATERIAIS_OTB = ${JSON.stringify(mat)};
const IMPOSTOS_OTB = ${JSON.stringify(imp)};
const ARTIGOS_CATALOGO_OTB = ${JSON.stringify(art)};
const BIBLIOTECAS_OTB = ${JSON.stringify(bib)};

const UFS_BRASIL = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
];

const ORDEM_TIPOS_CUSTO = [
  'mat.ns', 'mat.nac.nv', 'mat.imp.nv', 'mat.fd',
  'proj', 'me', 'cg.cl', 'cg.sl',
  'mo.inst', 'mo.transf', 'sub', 'tr', 'ferr.cons', 'ci'
];

function inferirCategoriaPorTipoCusto(tc) {
  if (!tc) return 'Materiais';
  if (tc.startsWith('mat.')) return 'Materiais';
  if (tc.startsWith('mo.')) return 'MO';
  if (tc === 'ferr.cons' || tc === 'ci') return 'Taxas';
  if (tc === 'me') return 'Meios de Acesso e Elevação';
  if (tc.startsWith('cg.')) return 'Estaleiro';
  if (tc === 'tr') return 'Transportes';
  if (tc === 'proj') return 'Projeto';
  if (tc === 'sub') return 'Subcontratações';
  return 'Outros';
}

function ceilingStep(val, step) {
  if (!val || val <= 0 || !step || step <= 0) return 0;
  // Evita imprecisão de ponto flutuante (ex.: 21.400000000000002)
  const ratio = (val / step) - 1e-9;
  return Math.ceil(ratio) * step;
}

function calcularMarkupsAplicados(margens) {
  const m = margens || {};
  const clamp = (v, def) => {
    const n = (v !== undefined && v !== null && !isNaN(parseFloat(v))) ? parseFloat(v) : def;
    return Math.min(Math.max(n, -0.99), 0.99);
  };
  const mc = clamp(m.comercial, 0.30);
  const mm = clamp(m.materiais, 0.30);
  const mmfd = clamp(m.fat_direto, 0.10);
  const mem = clamp(m.estaleiro, 0.10);
  const msub = clamp(m.sub, 0.10);

  // Fórmulas exatas da aba Custos (E10:E14):
  // E10 = (1/(1-C10))-1 + 0,026
  // E11 = (1/(1-C11))-1 + 0,026
  // E12 = (1/(1-C12))-1          (Sem +0,026 no Faturamento Direto!)
  // E13 = (1/(1-C13))-1 + 0,026
  // E14 = (1/(1-C14))-1 + 0,026
  return {
    desejada_comercial: mc,
    desejada_materiais: mm,
    desejada_fat_direto: mmfd,
    desejada_estaleiro: mem,
    desejada_sub: msub,
    aplicada_comercial: (1.0 / (1.0 - mc)) - 1.0 + 0.026,
    aplicada_materiais: (1.0 / (1.0 - mm)) - 1.0 + 0.026,
    aplicada_fat_direto: (1.0 / (1.0 - mmfd)) - 1.0,
    aplicada_estaleiro: (1.0 / (1.0 - mem)) - 1.0 + 0.026,
    aplicada_sub: (1.0 / (1.0 - msub)) - 1.0 + 0.026
  };
}

function getTaxaTipoCusto(tipoCusto, uf, isContribuinte, customImpostos) {
  const impBase = customImpostos || IMPOSTOS_OTB;
  const ufUpper = (uf || 'RJ').toUpperCase();
  const mapaUf = (impBase && impBase.icms_por_uf) || IMPOSTOS_OTB.icms_por_uf || {};
  const icmsData = mapaUf[ufUpper] || {
    nac_contribuinte: 0.12,
    nac_nao_contribuinte: 0.22,
    imp_contribuinte: 0.04,
    imp_nao_contribuinte: 0.22
  };

  const fed = (impBase && impBase.aliquotas_federais) || IMPOSTOS_OTB.aliquotas_federais || {
    pis: 0.0065,
    cofins: 0.03,
    irpj_csll_venda_servico: 0.0308,
    irpj_csll_projeto: 0.1088,
    iss: 0.05,
    inss: 0.0735
  };

  switch (tipoCusto) {
    case 'mat.ns':
      return fed.pis + fed.cofins + fed.irpj_csll_venda_servico + fed.iss;

    case 'mat.nac.nv': {
      const icmsNac = isContribuinte ? icmsData.nac_contribuinte : icmsData.nac_nao_contribuinte;
      return icmsNac + fed.pis + fed.cofins + fed.irpj_csll_venda_servico;
    }

    case 'mat.imp.nv': {
      const icmsImp = isContribuinte ? icmsData.imp_contribuinte : icmsData.imp_nao_contribuinte;
      return icmsImp + fed.pis + fed.cofins + fed.irpj_csll_venda_servico;
    }

    case 'mat.fd':
      return 0.0;

    case 'proj':
      return fed.pis + fed.cofins + fed.irpj_csll_projeto + fed.iss;

    case 'me':
    case 'cg.cl':
      return fed.pis + fed.cofins + fed.irpj_csll_venda_servico + fed.iss;

    case 'cg.sl':
    case 'mo.inst':
    case 'mo.transf':
    case 'sub':
    case 'tr':
    case 'ferr.cons':
    case 'ci':
      return fed.pis + fed.cofins + fed.irpj_csll_venda_servico + fed.iss + fed.inss;

    default:
      return fed.pis + fed.cofins + fed.irpj_csll_venda_servico + fed.iss;
  }
}

function getMarkupTipoCusto(tipoCusto, markups) {
  const mk = markups && markups.aplicada_comercial !== undefined
    ? markups
    : calcularMarkupsAplicados(markups);

  if (tipoCusto === 'mat.fd') return mk.aplicada_fat_direto;
  if (tipoCusto && tipoCusto.startsWith('mat.')) return mk.aplicada_materiais;
  // Aba Custos col H: 'me', 'cg.cl', 'cg.sl' e 'tr' usam mem (Margem Estaleiro e Meios)!
  if (tipoCusto === 'me' || tipoCusto === 'tr' || (tipoCusto && tipoCusto.startsWith('cg.'))) {
    return mk.aplicada_estaleiro;
  }
  if (tipoCusto === 'sub') return mk.aplicada_sub;
  return mk.aplicada_comercial;
}

function calcularValorHoraEquipe(equipeState) {
  const eq = equipeState || BIBLIOTECAS_OTB.equipe_padrao_valor_hora;
  const cargos = (eq && eq.cargos) || [];
  let somaEquipeDireta = 0;
  let somaCustoPonderado = 0;
  let somaEficiencia = 0;

  const linhas = cargos.map(c => {
    const qtd = parseFloat(c.qtd) || 0;
    const sal = parseFloat(c.salario_mensal) || 0;
    const hMes = parseFloat(c.horas_mes) || 167.865;
    const salHora = hMes > 0 ? (sal / hMes) : 0;
    const viag = parseFloat(c.viagens_hora) || 0;
    const aloj = parseFloat(c.alojamento_hora) || 0;
    const totalHora = salHora + viag + aloj;

    somaCustoPonderado += qtd * totalHora;
    if (c.entra_soma_equipe) {
      somaEquipeDireta += qtd;
      somaEficiencia += qtd * (c.eficiencia !== undefined ? parseFloat(c.eficiencia) : 1.0);
    }

    return Object.assign({}, c, {
      salario_hora: salHora,
      total_hora: totalHora,
      subtotal_ponderado: qtd * totalHora
    });
  });

  const fatoresDimensao = {
    'Até 500 m2': 0.10,
    'De 500 a 2.000 m2': 0.05,
    'De 2.000 a 10.000 m2': 0.025,
    'Acima de 10.000 m2': 0.0
  };
  const dim = (eq && eq.dimensao_obra) || 'De 2.000 a 10.000 m2';
  const fatorDim = fatoresDimensao[dim] !== undefined ? fatoresDimensao[dim] : 0.025;

  const valorHora = somaEquipeDireta > 0 ? (somaCustoPonderado / somaEquipeDireta) : 59.929386260394004;
  const perdaEquipe = somaEquipeDireta > 0 ? (1.0 - (somaEficiencia / somaEquipeDireta)) : 0;
  const redRendimento = perdaEquipe + fatorDim;

  return {
    dimensao_obra: dim,
    fator_dimensao: fatorDim,
    soma_equipe_direta: somaEquipeDireta,
    valor_hora: valorHora,
    red_rendimento: redRendimento,
    cargos: linhas
  };
}

function recalcularItemAnalitico(item, config) {
  config = config || {};
  const valorHora = (config.valor_hora !== undefined && config.valor_hora !== null && !isNaN(parseFloat(config.valor_hora)))
    ? parseFloat(config.valor_hora)
    : 59.929386260394004;
  const uf = config.uf || 'RJ';
  const isContribuinte = !!config.contribuinte_icms;
  const markups = config.markups || calcularMarkupsAplicados(config.margens);

  if (!item.categoria) {
    item.categoria = inferirCategoriaPorTipoCusto(item.tipo_custo);
  }

  let precoUnit = parseFloat(item.preco_unitario) || 0;
  if (item.tipo_custo === 'mo.inst' || item.tipo_custo === 'mo.transf') {
    precoUnit = valorHora;
    item.preco_unitario = precoUnit;
  }

  const qtd = parseFloat(item.quantidade) || 0;
  const custoTotal = qtd * precoUnit;
  item.custo_total = custoTotal;

  const markup = getMarkupTipoCusto(item.tipo_custo, markups);
  const margem = custoTotal * markup;
  const aliquota = getTaxaTipoCusto(item.tipo_custo, uf, isContribuinte, config.impostos_custom);
  const imposto = (custoTotal + margem) * aliquota;

  item._calc = {
    custo: custoTotal,
    markup: markup,
    margem: margem,
    aliquota: aliquota,
    imposto: imposto,
    venda: custoTotal + margem + imposto
  };

  return item._calc;
}

function recalcularArtigoSintetico(artigo, config) {
  config = config || {};
  const valorHora = (config.valor_hora !== undefined && config.valor_hora !== null && !isNaN(parseFloat(config.valor_hora)))
    ? parseFloat(config.valor_hora)
    : 59.929386260394004;
  const taxaFerramentas = (config.taxa_ferramentas !== undefined && !isNaN(parseFloat(config.taxa_ferramentas)))
    ? parseFloat(config.taxa_ferramentas)
    : 0.05;
  const taxaIndiretos = (config.taxa_indiretos !== undefined && !isNaN(parseFloat(config.taxa_indiretos)))
    ? parseFloat(config.taxa_indiretos)
    : 0.675;

  const itens = artigo.itens_analiticos || [];

  // 1º Passo: Soma de Mão de Obra do artigo (mo.inst + mo.transf) para cálculo automático de ferr.cons e ci
  let somaMoArtigo = 0;
  itens.forEach(it => {
    if (it.tipo_custo === 'mo.inst' || it.tipo_custo === 'mo.transf') {
      const q = parseFloat(it.quantidade) || 0;
      somaMoArtigo += q * valorHora;
    }
  });

  // 2º Passo: Atualiza ferr.cons (5% MO) e ci (67,5% MO) quando auto_taxa_mo !== false
  itens.forEach(it => {
    if (it.tipo_custo === 'ferr.cons' && it.auto_taxa_mo !== false) {
      it.preco_unitario = somaMoArtigo * taxaFerramentas;
      if (!it.quantidade && it.quantidade !== 0) it.quantidade = 1;
    } else if (it.tipo_custo === 'ci' && it.auto_taxa_mo !== false) {
      it.preco_unitario = somaMoArtigo * taxaIndiretos;
      if (!it.quantidade && it.quantidade !== 0) it.quantidade = 1;
    }
  });

  // 3º Passo: Calcula cada item analítico e soma no sintético
  let somaCusto = 0;
  let somaMargem = 0;
  let somaImposto = 0;

  itens.forEach(item => {
    const res = recalcularItemAnalitico(item, config);
    somaCusto += res.custo;
    somaMargem += res.margem;
    somaImposto += res.imposto;
  });

  artigo.custo_unitario = somaCusto;
  artigo.margem_unitaria = somaMargem;
  artigo.imposto_unitario = somaImposto;
  artigo.preco_venda_unitario = somaCusto + somaMargem + somaImposto;

  const qtdArtigo = parseFloat(artigo.quantidade) || 0;
  artigo.preco_total = qtdArtigo * artigo.preco_venda_unitario;

  return artigo;
}

function recalcularPropostaCompleta(artigos, config) {
  config = config || {};
  config.markups = calcularMarkupsAplicados(config.margens);

  let totalVendaCustos = 0;
  let totalVendaProposta = 0; // Exclui artigos marcados como INCLUSO na folha comercial se desejado
  let totalCusto = 0;
  let totalMargem = 0;
  let totalImpostos = 0;

  const desdobramento14 = {};
  ORDEM_TIPOS_CUSTO.forEach(tc => { desdobramento14[tc] = 0; });

  const desdobramentoVendaPorNota = {
    nota_mista_servicos: 0,
    nota_venda_materiais: 0,
    nota_servicos_projeto: 0,
    nota_faturamento_direto: 0
  };

  (artigos || []).forEach(art => {
    recalcularArtigoSintetico(art, config);
    const qtd = parseFloat(art.quantidade) || 0;

    totalVendaCustos += art.preco_total;
    if (!art.incluso) {
      totalVendaProposta += art.preco_total;
    }
    totalCusto += art.custo_unitario * qtd;
    totalMargem += art.margem_unitaria * qtd;
    totalImpostos += art.imposto_unitario * qtd;

    (art.itens_analiticos || []).forEach(it => {
      const tc = it.tipo_custo;
      const custoItemTotal = (it.custo_total || 0) * qtd;
      const vendaItemTotal = (it._calc ? it._calc.venda : 0) * qtd;
      if (desdobramento14[tc] !== undefined) {
        desdobramento14[tc] += custoItemTotal;
      }
      if (!art.incluso) {
        if (tc === 'mat.nac.nv' || tc === 'mat.imp.nv') {
          desdobramentoVendaPorNota.nota_venda_materiais += vendaItemTotal;
        } else if (tc === 'mat.fd') {
          desdobramentoVendaPorNota.nota_faturamento_direto += vendaItemTotal;
        } else if (tc === 'proj') {
          desdobramentoVendaPorNota.nota_servicos_projeto += vendaItemTotal;
        } else {
          desdobramentoVendaPorNota.nota_mista_servicos += vendaItemTotal;
        }
      }
    });
  });

  const valorHora = (config.valor_hora !== undefined && !isNaN(parseFloat(config.valor_hora)) && parseFloat(config.valor_hora) > 0)
    ? parseFloat(config.valor_hora)
    : 59.929386260394004;

  const horasInstalacao = desdobramento14['mo.inst'] / valorHora;
  const horasTransformacao = desdobramento14['mo.transf'] / valorHora;

  const homensInst = parseFloat(config.homens_instalacao) || 6;
  const semanasInst = horasInstalacao > 0 && homensInst > 0
    ? ceilingStep(horasInstalacao / homensInst / 44.0, 0.1)
    : 0;

  const homensTransf = parseFloat(config.homens_transformacao) || 2;
  const semanasTransf = horasTransformacao > 0 && homensTransf > 0
    ? ceilingStep(horasTransformacao / homensTransf / 52.0, 0.1)
    : 0;

  // Aba Custos C16: = J2 / ((J5 + J3) - J9)
  const baseTributavel = (totalCusto + totalMargem) - desdobramento14['mat.fd'];
  const impostoMedioOTB = baseTributavel > 0 ? (totalImpostos / baseTributavel) : 0;

  return {
    markups: config.markups,
    totais: {
      venda: totalVendaCustos,
      venda_proposta_sem_incluso: totalVendaProposta,
      custo: totalCusto,
      margem: totalMargem,
      impostos: totalImpostos,
      imposto_medio_otb: impostoMedioOTB,
      margem_percentual: totalVendaCustos > 0 ? (totalMargem / totalVendaCustos) * 100 : 0,
      custo_percentual: totalVendaCustos > 0 ? (totalCusto / totalVendaCustos) * 100 : 0,
      imposto_percentual: totalVendaCustos > 0 ? (totalImpostos / totalVendaCustos) * 100 : 0
    },
    planejamento: {
      horas_instalacao: horasInstalacao,
      homens_instalacao: homensInst,
      semanas_instalacao: semanasInst,
      horas_transformacao: horasTransformacao,
      homens_transformacao: homensTransf,
      semanas_transformacao: semanasTransf
    },
    desdobramento: desdobramento14,
    desdobramento_notas: desdobramentoVendaPorNota
  };
}

function calcularEncomendaMateriais(artigos, catalogoMateriais) {
  const mapaConsumo = {};
  (artigos || []).forEach(art => {
    const qtdArt = parseFloat(art.quantidade) || 0;
    if (qtdArt <= 0) return;
    (art.itens_analiticos || []).forEach(it => {
      if (!it.tipo_custo || !it.tipo_custo.startsWith('mat.')) return;
      const chave = (it.descricao || '').trim().toLowerCase();
      if (!chave) return;
      const qtdTotal = qtdArt * (parseFloat(it.quantidade) || 0);
      if (!mapaConsumo[chave]) {
        mapaConsumo[chave] = {
          especificacao: it.descricao,
          unidade: it.unidade || 'ud',
          tipo_custo: it.tipo_custo,
          quantidade_total: 0,
          custo_total_proposta: 0,
          artigos_uso: []
        };
      }
      mapaConsumo[chave].quantidade_total += qtdTotal;
      mapaConsumo[chave].custo_total_proposta += qtdTotal * (parseFloat(it.preco_unitario) || 0);
      if (art.artigo && !mapaConsumo[chave].artigos_uso.includes(art.artigo)) {
        mapaConsumo[chave].artigos_uso.push(art.artigo);
      }
    });
  });

  // Cruza com catálogo de materiais para NCM, código, preço fornecedor e crédito ICMS
  const catMap = {};
  (catalogoMateriais || MATERIAIS_OTB || []).forEach(m => {
    const k = (m.especificacao || '').trim().toLowerCase();
    if (k && !catMap[k]) catMap[k] = m;
  });

  return Object.values(mapaConsumo).map(item => {
    const cad = catMap[item.especificacao.trim().toLowerCase()];
    return Object.assign({}, item, {
      ncm: cad ? cad.ncm : '',
      codigo: cad ? cad.codigo : '',
      grupo: cad ? cad.grupo : 'PERSONALIZADO',
      preco_compra: cad ? cad.preco_compra : item.custo_total_proposta / (item.quantidade_total || 1),
      local_compra: cad ? cad.local_compra : 'Sem Crédito',
      aliquota_credito_icms: cad ? cad.aliquota_credito_icms : 0,
      preco_custo_catalogo: cad ? cad.preco_custo : item.custo_total_proposta / (item.quantidade_total || 1)
    });
  }).sort((a, b) => b.custo_total_proposta - a.custo_total_proposta);
}

if (typeof window !== 'undefined') {
  window.MATERIAIS_OTB = MATERIAIS_OTB;
  window.IMPOSTOS_OTB = IMPOSTOS_OTB;
  window.ARTIGOS_CATALOGO_OTB = ARTIGOS_CATALOGO_OTB;
  window.BIBLIOTECAS_OTB = BIBLIOTECAS_OTB;
  window.UFS_BRASIL = UFS_BRASIL;
  window.ORDEM_TIPOS_CUSTO = ORDEM_TIPOS_CUSTO;
  window.inferirCategoriaPorTipoCusto = inferirCategoriaPorTipoCusto;
  window.calcularMarkupsAplicados = calcularMarkupsAplicados;
  window.getTaxaTipoCusto = getTaxaTipoCusto;
  window.getMarkupTipoCusto = getMarkupTipoCusto;
  window.calcularValorHoraEquipe = calcularValorHoraEquipe;
  window.recalcularItemAnalitico = recalcularItemAnalitico;
  window.recalcularArtigoSintetico = recalcularArtigoSintetico;
  window.recalcularPropostaCompleta = recalcularPropostaCompleta;
  window.calcularEncomendaMateriais = calcularEncomendaMateriais;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MATERIAIS_OTB,
    IMPOSTOS_OTB,
    ARTIGOS_CATALOGO_OTB,
    BIBLIOTECAS_OTB,
    UFS_BRASIL,
    ORDEM_TIPOS_CUSTO,
    inferirCategoriaPorTipoCusto,
    calcularMarkupsAplicados,
    getTaxaTipoCusto,
    getMarkupTipoCusto,
    calcularValorHoraEquipe,
    recalcularItemAnalitico,
    recalcularArtigoSintetico,
    recalcularPropostaCompleta,
    calcularEncomendaMateriais
  };
}
`;

fs.writeFileSync(path.join(__dirname, 'otb_engine.js'), engineCode, 'utf8');
console.log('otb_engine.js v3.0 written successfully (' + Math.round(engineCode.length / 1024) + ' KB).');
