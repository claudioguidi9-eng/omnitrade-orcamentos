// =============================================================================
// OTB UI v3.0 - Sistema Integrado de Engenharia de Orçamentos & Propostas (Omnitrade)
// Fiel à planilha oficial PROPOSTA TIPO OTB_2024_01.xlsm
// =============================================================================

const STORAGE_KEY_PROPOSTA = 'omni_otb_proposta_v3';
const STORAGE_KEY_MATERIAIS = 'omni_otb_materiais_v3';

function escHtml(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtMoeda2(val) {
  if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
  return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtMoeda3(val) {
  if (val === null || val === undefined || isNaN(val)) return 'R$ 0,000';
  return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function fmtNum2(val) {
  if (val === null || val === undefined || isNaN(val)) return '0,00';
  return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtNum3(val) {
  if (val === null || val === undefined || isNaN(val)) return '0,000';
  return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

const NOTAS_PADRAO_COMERCIAIS = [
  'Esta proposta considera o fornecimento de materiais, mão de obra especializada, encargos sociais, seguros obrigatórios e supervisão técnica conforme detalhado em cada artigo.',
  'Os preços apresentados incluem todos os impostos federais, estaduais e municipais vigentes na data de emissão desta proposta, conforme o enquadramento fiscal (UF e condição de Contribuinte ICMS) informado pelo Cliente.',
  'Eventuais alterações de quantidades serão medidas conforme execução real em obra ("À Medição"), aplicando-se os preços unitários contratuais.',
  'Exclui-se o fornecimento de pontos de água, energia elétrica trifásica/monofásica em canteiro, instalações sanitárias gerais de obra (quando não previstas no item Canteiro) e estrutura metálica principal de suporte.',
  'Para serviços em altura, considera-se livre acesso ao entorno e piso regularizado para circulação segura de plataformas elevatórias e equipamentos de movimentação.',
  'Projetos executivos e emissão de ART estão inclusos exclusivamente nos itens onde expressamente mencionados na descrição técnica.'
];

const CONDICOES_PADRAO_OTB = {
  regime: 'Empreitada por Preço Unitário (À Medição Física)',
  validade_dias: 15,
  retencao_percentual: 5.0,
  retencao_prazo_dias: 90,
  condicoes_pagamento: [
    'Materiais (Venda / Faturamento Direto): 30% de sinal na confirmação do pedido e 70% a 28 dias da emissão da Nota Fiscal.',
    'Serviços e Montagem em Obra: Medições quinzenais ou mensais conforme avanço físico aprovado, com pagamento a 15 dias da emissão da NF.',
    'Preços fixos e irreajustáveis pelo período de 12 (doze) meses; após esse prazo, reajuste anual pelo índice INCC-DI/FGV.'
  ]
};

const MATRIZ_PADRAO_OTB = [
  { item: 1, descricao: 'Engenharia de aplicação, detalhamento de montagem dos sistemas e supervisão técnica', omnitrade: true, cliente: false },
  { item: 2, descricao: 'Fornecimento dos materiais especificados nos artigos da proposta e descarga em obra', omnitrade: true, cliente: false },
  { item: 3, descricao: 'Mão de obra especializada, EPIs, EPCs específicos da atividade, alojamento e transporte da equipe', omnitrade: true, cliente: false },
  { item: 4, descricao: 'Meios de elevação de materiais e plataformas elevatórias (conforme item Canteiro)', omnitrade: true, cliente: false },
  { item: 5, descricao: 'Fornecimento de energia elétrica (220V/380V) e pontos de água próximos às frentes de serviço', omnitrade: false, cliente: true },
  { item: 6, descricao: 'Área livre, segura e nivelada para instalação de container de almoxarifado e estocagem de materiais', omnitrade: false, cliente: true },
  { item: 7, descricao: 'Estrutura metálica principal / terças / apoios nivelados e liberados dentro das tolerâncias de projeto', omnitrade: false, cliente: true },
  { item: 8, descricao: 'Vigilância patrimonial geral da obra fora do horário normal de trabalho', omnitrade: false, cliente: true }
];

function clonarProfundo(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function criarImpostosPadraoClone() {
  return {
    aliquotas_federais: clonarProfundo(IMPOSTOS_OTB.aliquotas_federais),
    locais_compra_icms: clonarProfundo(IMPOSTOS_OTB.locais_compra_icms),
    tipos_custo: clonarProfundo(IMPOSTOS_OTB.tipos_custo),
    icms_por_uf: clonarProfundo(IMPOSTOS_OTB.icms_por_uf)
  };
}

let OTB_CATALOGO_MATERIAIS = [];

let OTB_ESTADO = {
  id: 'otb_24001',
  referencia: 'BR_24001RCS_1',
  data: new Date().toLocaleDateString('pt-BR'),
  versao: '1.0',
  obra: {
    nome: 'PROPOSTA TIPO OTB - COBERTURA & SISTEMAS COMPLEMENTARES',
    local: 'Rio de Janeiro - RJ',
    objeto: 'SISTEMA DE IMPERMEABILIZAÇÃO TPO FIRESTONE, ISOLAMENTO PIR E COMPLEMENTARES'
  },
  cliente: {
    nome: 'CLIENTE OTB MODELO',
    contato: 'Departamento de Engenharia / Suprimentos',
    email: '',
    telefone: '',
    uf: 'RJ',
    contribuinte_icms: false
  },
  comercial: {
    responsavel: 'Ricardo Santos',
    email: 'ricardo.santos@omnitradebrasil.com',
    celular: '+55 (11) 99202-4106',
    telefone: '+55 (11) 4561-3992'
  },
  parametros: {
    valor_hora: 59.929386260394004,
    homens_instalacao: 6,
    homens_transformacao: 2,
    taxa_indiretos: 0.675,
    taxa_ferramentas: 0.05,
    margens: {
      comercial: 0.30,
      materiais: 0.30,
      fat_direto: 0.10,
      estaleiro: 0.10,
      sub: 0.10
    }
  },
  impostos_custom: null,
  equipe_valor_hora: null,
  artigos: [],
  notas: clonarProfundo(NOTAS_PADRAO_COMERCIAIS),
  condicoes_gerais: clonarProfundo(CONDICOES_PADRAO_OTB),
  matriz_responsabilidades: clonarProfundo(MATRIZ_PADRAO_OTB),

  // Estado visual de navegação e filtros
  artigos_expandidos: {},
  filtro_artigo_texto: '',
  filtro_artigo_secao: 'TODAS',
  aba_materiais_modo: 'catalogo', // 'catalogo' | 'encomenda'
  busca_materiais: '',
  filtro_grupo_material: 'TODOS',
  pagina_materiais: 1,
  materiais_por_pagina: 25,
  busca_mo: '',
  filtro_grupo_mo: 'TODOS',
  modal_aba_catalogo: 'modelo37', // 'modelo37' | 'base68'
  modal_busca_artigos: '',
  artigo_alvo_modal: null,
  ultimo_resumo: null
};

// =============================================================================
// INICIALIZAÇÃO E PERSISTÊNCIA UNIFICADA
// =============================================================================
function initOTB() {
  // 1. Carrega catálogo de materiais (com edições/novos cadastros persistidos)
  try {
    const matSalvos = localStorage.getItem(STORAGE_KEY_MATERIAIS);
    if (matSalvos) {
      const parsedMat = JSON.parse(matSalvos);
      if (Array.isArray(parsedMat) && parsedMat.length >= MATERIAIS_OTB.length) {
        OTB_CATALOGO_MATERIAIS = parsedMat;
      }
    }
  } catch (e) {
    console.warn('Aviso ao ler materiais do localStorage:', e);
  }
  if (!OTB_CATALOGO_MATERIAIS || OTB_CATALOGO_MATERIAIS.length === 0) {
    OTB_CATALOGO_MATERIAIS = clonarProfundo(MATERIAIS_OTB);
  }

  // 2. Garante estruturas auxiliares padrão
  OTB_ESTADO.impostos_custom = criarImpostosPadraoClone();
  OTB_ESTADO.equipe_valor_hora = clonarProfundo(BIBLIOTECAS_OTB.equipe_padrao_valor_hora);

  // 3. Verifica se existe proposta salva na sessão/navegador (inclusive proposta zerada!)
  let carregouDoStorage = false;
  try {
    const salvo = localStorage.getItem(STORAGE_KEY_PROPOSTA);
    if (salvo !== null) {
      const parsed = JSON.parse(salvo);
      if (parsed && Array.isArray(parsed.artigos)) {
        restaurarEstadoDeObjetoOTB(parsed, false);
        carregouDoStorage = true;
      }
    }
  } catch (e) {
    console.warn('Aviso ao ler proposta do localStorage:', e);
  }

  // Apenas no primeiro acesso absoluto carrega o Modelo Oficial OTB (37 artigos)
  if (!carregouDoStorage) {
    carregarPropostaModeloOTB(false);
  } else {
    sincronizarInputsDadosGeraisComEstado();
    recalcularERenderizarTudoOTB();
  }

  renderizarTabelaMateriaisOTB();
  renderizarAbaValorHoraEMoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
}

function salvarCatalogoMateriaisOTB() {
  try {
    localStorage.setItem(STORAGE_KEY_MATERIAIS, JSON.stringify(OTB_CATALOGO_MATERIAIS));
  } catch (e) {}
}

function exportarObjetoCompletoOTB() {
  const resumo = OTB_ESTADO.ultimo_resumo || recalcularPropostaCompleta(OTB_ESTADO.artigos, getConfigCalculoOTB());
  return {
    modo: 'OTB_V3',
    id: OTB_ESTADO.id || ('orc_' + Date.now()),
    referencia: OTB_ESTADO.referencia,
    data: OTB_ESTADO.data || new Date().toLocaleDateString('pt-BR'),
    versao: OTB_ESTADO.versao || '1.0',
    obra: clonarProfundo(OTB_ESTADO.obra),
    cliente: clonarProfundo(OTB_ESTADO.cliente),
    comercial: clonarProfundo(OTB_ESTADO.comercial),
    parametros: clonarProfundo(OTB_ESTADO.parametros),
    impostos_custom: clonarProfundo(OTB_ESTADO.impostos_custom),
    equipe_valor_hora: clonarProfundo(OTB_ESTADO.equipe_valor_hora),
    artigos: clonarProfundo(OTB_ESTADO.artigos),
    notas: clonarProfundo(OTB_ESTADO.notas),
    condicoes_gerais: clonarProfundo(OTB_ESTADO.condicoes_gerais),
    matriz_responsabilidades: clonarProfundo(OTB_ESTADO.matriz_responsabilidades),
    totais: {
      venda_total: resumo.totais.venda,
      venda: resumo.totais.venda,
      venda_proposta_sem_incluso: resumo.totais.venda_proposta_sem_incluso,
      custos: resumo.totais.custo,
      margem: resumo.totais.margem,
      impostos: resumo.totais.impostos,
      imposto_medio_otb: resumo.totais.imposto_medio_otb,
      margem_percentual: resumo.totais.margem_percentual,
      ultima_atualizacao: new Date().toISOString()
    },
    otb_estado: {
      referencia: OTB_ESTADO.referencia,
      artigos: clonarProfundo(OTB_ESTADO.artigos)
    }
  };
}

function salvarEstadoOTB() {
  try {
    const snapshot = exportarObjetoCompletoOTB();
    localStorage.setItem(STORAGE_KEY_PROPOSTA, JSON.stringify(snapshot));
  } catch (e) {
    console.warn('Aviso ao gravar estado OTB:', e);
  }
}

function restaurarEstadoDeObjetoOTB(dados, renderizar = true) {
  if (!dados) return;

  OTB_ESTADO.id = dados.id || ('orc_' + Date.now());
  OTB_ESTADO.referencia = dados.referencia || 'BR_24001RCS_1';
  OTB_ESTADO.data = dados.data || new Date().toLocaleDateString('pt-BR');
  OTB_ESTADO.versao = dados.versao || '1.0';

  if (dados.obra) {
    OTB_ESTADO.obra = Object.assign({ nome: '', local: '', objeto: '' }, dados.obra);
  } else if (dados.obra_nome) {
    OTB_ESTADO.obra.nome = dados.obra_nome;
  }

  if (dados.cliente) {
    OTB_ESTADO.cliente = Object.assign({
      nome: '', contato: '', email: '', telefone: '', uf: 'RJ', contribuinte_icms: false
    }, dados.cliente);
  } else {
    if (dados.cliente_nome !== undefined) OTB_ESTADO.cliente.nome = dados.cliente_nome;
    if (dados.cliente_uf !== undefined) OTB_ESTADO.cliente.uf = dados.cliente_uf;
    if (dados.cliente_contribuinte !== undefined) OTB_ESTADO.cliente.contribuinte_icms = !!dados.cliente_contribuinte;
  }

  if (dados.comercial) {
    OTB_ESTADO.comercial = Object.assign({}, OTB_ESTADO.comercial, dados.comercial);
  }

  if (dados.parametros) {
    OTB_ESTADO.parametros = Object.assign({
      valor_hora: 59.929386260394004,
      homens_instalacao: 6,
      homens_transformacao: 2,
      taxa_indiretos: 0.675,
      taxa_ferramentas: 0.05,
      margens: { comercial: 0.30, materiais: 0.30, fat_direto: 0.10, estaleiro: 0.10, sub: 0.10 }
    }, dados.parametros);
    OTB_ESTADO.parametros.margens = Object.assign(
      { comercial: 0.30, materiais: 0.30, fat_direto: 0.10, estaleiro: 0.10, sub: 0.10 },
      (dados.parametros && dados.parametros.margens) || {}
    );
  } else if (dados.valor_hora) {
    OTB_ESTADO.parametros.valor_hora = parseFloat(dados.valor_hora) || 59.929386260394004;
  }

  if (dados.impostos_custom && dados.impostos_custom.aliquotas_federais) {
    OTB_ESTADO.impostos_custom = clonarProfundo(dados.impostos_custom);
  } else {
    OTB_ESTADO.impostos_custom = criarImpostosPadraoClone();
  }

  if (dados.equipe_valor_hora && Array.isArray(dados.equipe_valor_hora.cargos)) {
    OTB_ESTADO.equipe_valor_hora = clonarProfundo(dados.equipe_valor_hora);
  }

  // Suporta tanto artigos OTB nativos quanto conversão automática de projetos legados (itens_proposta)
  if (Array.isArray(dados.artigos)) {
    OTB_ESTADO.artigos = clonarProfundo(dados.artigos);
  } else if (dados.otb_estado && Array.isArray(dados.otb_estado.artigos)) {
    OTB_ESTADO.artigos = clonarProfundo(dados.otb_estado.artigos);
  } else if (Array.isArray(dados.itens_proposta)) {
    OTB_ESTADO.artigos = dados.itens_proposta.map(it => {
      let tc = 'mat.ns';
      if (it.tipo === 'Faturamento Direto') tc = 'mat.fd';
      else if (it.tipo === 'Materiais Nacionais') tc = 'mat.nac.nv';
      else if (it.tipo === 'Materiais Importados') tc = 'mat.imp.nv';
      else if (it.tipo === 'Serviços') tc = 'mat.ns';

      const uf = (OTB_ESTADO.cliente && OTB_ESTADO.cliente.uf) || 'SP';
      const isContrib = !!(OTB_ESTADO.cliente && OTB_ESTADO.cliente.contribuinte_icms);
      const aliq = getTaxaTipoCusto(tc, uf, isContrib, OTB_ESTADO.impostos_custom);
      const mk = getMarkupTipoCusto(tc, calcularMarkupsAplicados(OTB_ESTADO.parametros.margens));
      const pv = parseFloat(it.preco_unitario) || 0;
      const custoBase = pv > 0 ? (pv / ((1 + mk) * (1 + aliq))) : 0;

      return {
        artigo: it.artigo || '1.1',
        secao_codigo: '',
        secao_titulo: it.secao || 'ITENS DA PROPOSTA',
        descricao: it.descricao || '',
        unidade: it.unidade || 'un',
        quantidade: parseFloat(it.quantidade) || 0,
        incluso: !!it.incluso,
        is_subtitulo: false,
        itens_analiticos: pv > 0 ? [{
          categoria: inferirCategoriaPorTipoCusto(tc),
          tipo_custo: tc,
          descricao: it.detalhe || it.descricao || 'Item importado',
          unidade: it.unidade || 'un',
          quantidade: 1,
          preco_unitario: custoBase,
          custo_total: custoBase,
          auto_taxa_mo: false
        }] : []
      };
    });
  } else {
    OTB_ESTADO.artigos = [];
  }

  if (Array.isArray(dados.notas)) {
    OTB_ESTADO.notas = clonarProfundo(dados.notas);
  }
  if (dados.condicoes_gerais) {
    OTB_ESTADO.condicoes_gerais = Object.assign(clonarProfundo(CONDICOES_PADRAO_OTB), dados.condicoes_gerais);
  }
  if (Array.isArray(dados.matriz_responsabilidades)) {
    OTB_ESTADO.matriz_responsabilidades = clonarProfundo(dados.matriz_responsabilidades);
  }

  OTB_ESTADO.artigos_expandidos = {};

  if (renderizar) {
    sincronizarInputsDadosGeraisComEstado();
    salvarEstadoOTB();
    recalcularERenderizarTudoOTB();
    renderizarTabelaMateriaisOTB();
    renderizarAbaValorHoraEMoOTB();
    renderizarAbaNotasCondicoesMatrizOTB();
  }
}

function getConfigCalculoOTB() {
  return {
    uf: (OTB_ESTADO.cliente && OTB_ESTADO.cliente.uf) || 'RJ',
    contribuinte_icms: !!(OTB_ESTADO.cliente && OTB_ESTADO.cliente.contribuinte_icms),
    valor_hora: OTB_ESTADO.parametros.valor_hora,
    homens_instalacao: OTB_ESTADO.parametros.homens_instalacao,
    homens_transformacao: OTB_ESTADO.parametros.homens_transformacao,
    taxa_indiretos: OTB_ESTADO.parametros.taxa_indiretos,
    taxa_ferramentas: OTB_ESTADO.parametros.taxa_ferramentas,
    margens: OTB_ESTADO.parametros.margens,
    impostos_custom: OTB_ESTADO.impostos_custom
  };
}

function carregarPropostaModeloOTB(notificar = true) {
  OTB_ESTADO.id = 'otb_24001';
  OTB_ESTADO.referencia = 'BR_24001RCS_1';
  OTB_ESTADO.data = new Date().toLocaleDateString('pt-BR');
  OTB_ESTADO.obra = {
    nome: 'PROPOSTA TIPO OTB - COBERTURA & SISTEMAS COMPLEMENTARES',
    local: 'Rio de Janeiro - RJ',
    objeto: 'COBERTURA OMNITRADE TPO FIRESTONE, SISTEMAS COMPLEMENTARES & RETROFIT'
  };
  OTB_ESTADO.cliente = {
    nome: 'CLIENTE OTB MODELO',
    contato: 'Engenharia / Suprimentos',
    email: '',
    telefone: '',
    uf: 'RJ',
    contribuinte_icms: false
  };
  OTB_ESTADO.parametros = {
    valor_hora: 59.929386260394004,
    homens_instalacao: 6,
    homens_transformacao: 2,
    taxa_indiretos: 0.675,
    taxa_ferramentas: 0.05,
    margens: { comercial: 0.30, materiais: 0.30, fat_direto: 0.10, estaleiro: 0.10, sub: 0.10 }
  };
  OTB_ESTADO.impostos_custom = criarImpostosPadraoClone();
  OTB_ESTADO.equipe_valor_hora = clonarProfundo(BIBLIOTECAS_OTB.equipe_padrao_valor_hora);
  OTB_ESTADO.artigos = clonarProfundo(ARTIGOS_CATALOGO_OTB);
  OTB_ESTADO.notas = clonarProfundo(NOTAS_PADRAO_COMERCIAIS);
  OTB_ESTADO.condicoes_gerais = clonarProfundo(CONDICOES_PADRAO_OTB);
  OTB_ESTADO.matriz_responsabilidades = clonarProfundo(MATRIZ_PADRAO_OTB);

  const idx224 = OTB_ESTADO.artigos.findIndex(a => a.artigo === '2.2.4');
  OTB_ESTADO.artigos_expandidos = idx224 >= 0 ? { [idx224]: true } : {};

  sincronizarInputsDadosGeraisComEstado();
  recalcularERenderizarTudoOTB();
  renderizarAbaValorHoraEMoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
  salvarEstadoOTB();

  if (notificar && typeof showToast === 'function') {
    showToast('Proposta Modelo OTB (BR_24001RCS_1) com 37 artigos carregada!', 'success');
  }
}

function iniciarOrcamentoZeradoOTB(dadosIniciais, notificar = true) {
  const d = dadosIniciais || {};
  const uf = (d.uf || (OTB_ESTADO.cliente && OTB_ESTADO.cliente.uf) || 'SP').toUpperCase();
  const ref = d.referencia || `BR_${new Date().getFullYear().toString().slice(-2)}${Math.floor(100 + Math.random() * 899)}RCS_0`;

  OTB_ESTADO.id = 'orc_' + Date.now();
  OTB_ESTADO.referencia = ref;
  OTB_ESTADO.data = new Date().toLocaleDateString('pt-BR');
  OTB_ESTADO.obra = {
    nome: d.nomeObra || 'NOVA OBRA OMNITRADE',
    local: d.local || `${uf} - Brasil`,
    objeto: d.objeto || ''
  };
  OTB_ESTADO.cliente = {
    nome: d.clienteNome || 'NOVO CLIENTE',
    contato: d.contato || '',
    email: d.email || '',
    telefone: d.telefone || '',
    uf: uf,
    contribuinte_icms: d.contribuinte_icms !== undefined ? !!d.contribuinte_icms : false
  };
  OTB_ESTADO.artigos = [];
  OTB_ESTADO.artigos_expandidos = {};
  OTB_ESTADO.filtro_artigo_texto = '';
  OTB_ESTADO.filtro_artigo_secao = 'TODAS';

  sincronizarInputsDadosGeraisComEstado();
  recalcularERenderizarTudoOTB();
  renderizarTabelaMateriaisOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
  salvarEstadoOTB();

  if (notificar && typeof showToast === 'function') {
    showToast(`Novo Orçamento "${OTB_ESTADO.obra.nome}" iniciado 100% ZERADO (R$ 0,00)!`, 'success');
  }
}

function limparPropostaOTB() {
  if (confirm('Deseja zerar todos os artigos deste orçamento agora? Os valores ficarão em R$ 0,00.')) {
    OTB_ESTADO.artigos = [];
    OTB_ESTADO.artigos_expandidos = {};
    recalcularERenderizarTudoOTB();
    renderizarTabelaMateriaisOTB();
    salvarEstadoOTB();
    if (typeof showToast === 'function') {
      showToast('Orçamento zerado (R$ 0,00)! Adicione artigos do catálogo ou crie novos.', 'info');
    }
  }
}

// =============================================================================
// BARRA SUPERIOR DE KPIs + RECÁLCULO GLOBAL UNIFICADO
// =============================================================================
function atualizarBarraSuperiorKPIsOTB(resumo) {
  if (!resumo) return;
  const t = resumo.totais;
  const p = resumo.planejamento;
  const uf = (OTB_ESTADO.cliente && OTB_ESTADO.cliente.uf) || 'RJ';
  const isContrib = !!(OTB_ESTADO.cliente && OTB_ESTADO.cliente.contribuinte_icms);

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setTxt('kpi-total-venda', fmtMoeda2(t.venda));
  setTxt('kpi-referencia', `Ref: ${OTB_ESTADO.referencia || '-'} • ${(OTB_ESTADO.artigos || []).length} artigos`);

  setTxt('kpi-total-fd', fmtMoeda2(t.custo));
  setTxt('kpi-pct-fd', t.venda > 0 ? `${t.custo_percentual.toFixed(1)}% do total de venda` : '0,0% do total de venda');

  setTxt('kpi-total-nac', fmtMoeda2(t.margem));
  setTxt('kpi-pct-nac', t.venda > 0 ? `${t.margem_percentual.toFixed(1)}% margem s/ venda` : '0,0% margem s/ venda');

  setTxt('kpi-total-imp', fmtMoeda2(t.impostos));
  setTxt('kpi-pct-imp', `Imposto Médio OTB: ${(t.imposto_medio_otb * 100).toFixed(2)}%`);

  setTxt('kpi-total-serv', `${fmtNum2(p.horas_instalacao + p.horas_transformacao)} h`);
  setTxt('kpi-pct-serv', `Obra: ${p.semanas_instalacao.toFixed(1)} sem (${p.homens_instalacao} hom.)`);

  setTxt('kpi-imposto-total', `${uf} • ${isContrib ? 'Contribuinte' : 'Não Contrib.'}`);
  setTxt('kpi-sub-fiscal', `Valor/Hora: ${fmtMoeda3(OTB_ESTADO.parametros.valor_hora)}`);
}

function recalcularERenderizarTudoOTB() {
  const config = getConfigCalculoOTB();
  const resumo = recalcularPropostaCompleta(OTB_ESTADO.artigos, config);
  OTB_ESTADO.ultimo_resumo = resumo;

  atualizarBarraSuperiorKPIsOTB(resumo);
  renderizarDashboardExecutivoOTB(resumo);
  renderizarListaArtigosSinteticosOTB();
  renderizarTabelaImpostosOTB();

  if (OTB_ESTADO.aba_materiais_modo === 'encomenda') {
    renderizarTabelaMateriaisOTB();
  }

  // Sincroniza PDF oficial caso esteja visível ou pronto para impressão
  const tabPrev = document.getElementById('tab-preview');
  if (tabPrev && tabPrev.classList.contains('active')) {
    renderizarPropostaOficialA4OTB();
  }
}

// =============================================================================
// 1. DASHBOARD EXECUTIVO OTB (FIEL À IMAGEM 3 DA PLANILHA CUSTOS)
// =============================================================================
function renderizarDashboardExecutivoOTB(resumo) {
  const container = document.getElementById('otb-dashboard-executivo');
  if (!container || !resumo) return;

  const t = resumo.totais;
  const p = resumo.planejamento;
  const d = resumo.desdobramento;
  const mk = resumo.markups;
  const par = OTB_ESTADO.parametros;
  const uf = (OTB_ESTADO.cliente && OTB_ESTADO.cliente.uf) || 'RJ';
  const isContrib = !!(OTB_ESTADO.cliente && OTB_ESTADO.cliente.contribuinte_icms);

  const linhas14 = [
    { key: 'mat.ns', desc: 'Materiais em nota mista de serviços (mat.ns):' },
    { key: 'mat.nac.nv', desc: 'Materiais Nacionais em nota de venda (mat.nac.nv)' },
    { key: 'mat.imp.nv', desc: 'Materiais Importados em nota de venda (mat.imp.nv)' },
    { key: 'mat.fd', desc: 'Materiais Faturamento direto (mat.fd):' },
    { key: 'proj', desc: 'Projeto (proj)' },
    { key: 'me', desc: 'Meios de Elevação c/ locação (me):' },
    { key: 'cg.cl', desc: 'Custos gerais c/ locação (cg.cl)' },
    { key: 'cg.sl', desc: 'Custos gerais s/ locação (cg.sl)' },
    { key: 'mo.inst', desc: 'Mão-de-Obra de instalação (mo.inst):' },
    { key: 'mo.transf', desc: 'Mão-de-Obra de transformação (mo.transf):' },
    { key: 'sub', desc: 'Subcontratações (sub):' },
    { key: 'tr', desc: 'Transportes (tr):' },
    { key: 'ferr.cons', desc: 'Ferramentas e Consumíveis (ferr.cons):' },
    { key: 'ci', desc: 'Custos Indirectos / C. Estrutura (ci):' }
  ];

  const linhasHtml = linhas14.map(linha => {
    const val = d[linha.key] || 0;
    const perc = t.custo > 0 ? (val / t.custo) * 100 : 0;
    const destaque = val > 0 ? 'font-weight: 700; color: #0f172a;' : 'color: #94a3b8;';
    return `
      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 11.5px;">
        <td style="padding: 3.5px 8px; color: #334155; font-weight: 500;">
          <code style="background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 10px; color: #1e40af; font-weight: 700;">${linha.key}</code>
          ${escHtml(linha.desc)}
        </td>
        <td style="padding: 3.5px 8px; text-align: right; font-family: 'JetBrains Mono', monospace; width: 70px; ${destaque}">${perc.toFixed(2).replace('.', ',')}%</td>
        <td style="padding: 3.5px 8px; text-align: right; font-family: 'JetBrains Mono', monospace; width: 145px; ${destaque}">${fmtMoeda3(val)}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Faixa Identificadora da Proposta (A1:B2 da Aba Custos) -->
    <div style="background: linear-gradient(135deg, #0b1329 0%, #1e293b 100%); color: white; padding: 14px 18px; border-radius: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.14);">
      <div style="flex: 1; min-width: 300px;">
        <div style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700; margin-bottom: 4px;">
          OBRA, LOCALIZAÇÃO - TIPO TRABALHO • REFERÊNCIA DA PROPOSTA
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <input type="text" value="${escHtml(OTB_ESTADO.referencia)}" onchange="atualizarReferenciaOTB(this.value)"
            style="background: rgba(56,189,248,0.14); border: 1px solid rgba(56,189,248,0.45); color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 14px; padding: 5px 10px; border-radius: 6px; width: 175px;"
            title="Código de Referência da Proposta">
          <input type="text" value="${escHtml(OTB_ESTADO.obra.nome)}" onchange="atualizarNomeObraDashboardOTB(this.value)"
            style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #f8fafc; font-weight: 700; font-size: 13.5px; padding: 5px 12px; border-radius: 6px; flex: 1; min-width: 260px;"
            placeholder="Nome da Obra, Localização - Tipo de Trabalho">
        </div>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <div style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: 6px; padding: 4px 10px; font-size: 11px; display: flex; align-items: center; gap: 8px;">
          <span style="color: #94a3b8;">UF Fiscal:</span>
          <select onchange="setUfClienteOTB(this.value)" style="background: #fef08a; color: #713f12; font-weight: 800; border: none; border-radius: 4px; padding: 2px 6px; font-size: 11.5px; cursor: pointer;">
            ${UFS_BRASIL.map(est => `<option value="${est}" ${est === uf ? 'selected' : ''}>${est}</option>`).join('')}
          </select>
          <span style="color: #94a3b8;">ICMS:</span>
          <select onchange="setContribuinteICMSOTB(this.value === 'SIM')" style="background: #fef08a; color: #713f12; font-weight: 800; border: none; border-radius: 4px; padding: 2px 6px; font-size: 11.5px; cursor: pointer;">
            <option value="NAO" ${!isContrib ? 'selected' : ''}>NÃO CONTRIB.</option>
            <option value="SIM" ${isContrib ? 'selected' : ''}>CONTRIBUINTE</option>
          </select>
        </div>

        <button class="btn btn-sm" onclick="carregarPropostaModeloOTB()" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); font-weight: 700;">
          <i data-lucide="file-spreadsheet" style="width: 13px; height: 13px;"></i> Modelo OTB (37 Art.)
        </button>
        <button class="btn btn-sm" onclick="limparPropostaOTB()" style="background: rgba(239, 68, 68, 0.16); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.45); font-weight: 700;">
          <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i> Zerar Orçamento
        </button>
      </div>
    </div>

    <!-- Painel Triplo Fiel à Imagem 3 (Planejamento & Valor Hora | Margens & Markups | Totais & 14 Tipos de Custo) -->
    <div style="display: grid; grid-template-columns: 320px 350px 1fr; gap: 14px; margin-bottom: 18px; align-items: stretch;">

      <!-- COLUNA 1: PLANEJAMENTO + VALOR HORA + TAXAS INDIRETOS/FERRAMENTAS -->
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span>PLANEJAMENTO DE MÃO-DE-OBRA</span>
            <button onclick="switchTab('tab-mo')" style="font-size: 10px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 4px; padding: 2px 6px; cursor: pointer; font-weight: 700;">Ponderação Equipe ↗</button>
          </div>

          <table style="width: 100%; font-size: 11.5px; border-collapse: collapse; margin-bottom: 12px;">
            <thead>
              <tr style="color: #475569; border-bottom: 1px solid #cbd5e1; font-size: 10.5px;">
                <th style="text-align: left; padding: 4px 2px;">Frente</th>
                <th style="text-align: right; padding: 4px 4px;">Horas</th>
                <th style="text-align: center; padding: 4px 4px; background: #fef08a; color: #713f12;">Homens</th>
                <th style="text-align: right; padding: 4px 2px;">Semanas</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px 2px; font-weight: 600; color: #1e293b;">M.O. Instalação (Obra)</td>
                <td style="text-align: right; padding: 6px 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${fmtNum2(p.horas_instalacao)}</td>
                <td style="text-align: center; padding: 4px; background: #fef08a;">
                  <input type="number" min="1" max="200" step="1" value="${p.homens_instalacao}" onchange="atualizarHomensOTB('instalacao', this.value)"
                    style="width: 48px; text-align: center; font-weight: 800; background: #fef9c3; border: 1px solid #ca8a04; border-radius: 4px; padding: 2px; font-size: 11.5px;">
                </td>
                <td style="text-align: right; padding: 6px 2px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0f172a;">${p.semanas_instalacao.toFixed(2).replace('.', ',')}</td>
              </tr>
              <tr>
                <td style="padding: 6px 2px; font-weight: 600; color: #1e293b;">M.O. Transform. (Galpão)</td>
                <td style="text-align: right; padding: 6px 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${fmtNum2(p.horas_transformacao)}</td>
                <td style="text-align: center; padding: 4px; background: #fef08a;">
                  <input type="number" min="1" max="200" step="1" value="${p.homens_transformacao}" onchange="atualizarHomensOTB('transformacao', this.value)"
                    style="width: 48px; text-align: center; font-weight: 800; background: #fef9c3; border: 1px solid #ca8a04; border-radius: 4px; padding: 2px; font-size: 11.5px;">
                </td>
                <td style="text-align: right; padding: 6px 2px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0f172a;">${p.semanas_transformacao.toFixed(2).replace('.', ',')}</td>
              </tr>
            </tbody>
          </table>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; flex-direction: column; gap: 7px; font-size: 11.5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: #334155;">Valor / hora (R$) =</span>
              <input type="number" step="0.001" value="${Number(par.valor_hora).toFixed(3)}" onchange="atualizarValorHoraOTB(this.value)"
                style="width: 105px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0f172a; border: 1px solid #64748b; border-radius: 4px; padding: 3px 6px; background: #f8fafc;">
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #334155;">Indirectos (mo) (%) =</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <input type="number" step="0.1" value="${(par.taxa_indiretos * 100).toFixed(2)}" onchange="atualizarTaxaBaseMO('indiretos', this.value)"
                  style="width: 82px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; background: #fef08a; border: 1px solid #ca8a04; border-radius: 4px; padding: 3px 6px; color: #713f12;">
                <span style="font-weight: 700; color: #713f12;">%</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #334155;">Ferramentas e Consumíveis =</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <input type="number" step="0.1" value="${(par.taxa_ferramentas * 100).toFixed(2)}" onchange="atualizarTaxaBaseMO('ferramentas', this.value)"
                  style="width: 82px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; background: #fef08a; border: 1px solid #ca8a04; border-radius: 4px; padding: 3px 6px; color: #713f12;">
                <span style="font-weight: 700; color: #713f12;">%</span>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #475569; line-height: 1.35;">
          <strong>NOTA IMPORTANTE:</strong> O valor de impostos altera em função da escolha realizada no <code>TIPO DE CUSTO</code> de cada item analítico e do status ICMS/UF do Cliente.
        </div>
      </div>

      <!-- COLUNA 2: MARGENS DESEJADAS (AMARELO) & MARKUPS APLICADOS (C10:E16) -->
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span>MARGENS & MARKUPS APLICADOS</span>
            <button onclick="restaurarMargensPadraoOTB()" style="font-size: 10px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; cursor: pointer; font-weight: 700;" title="Restaurar 30% / 30% / 10% / 10% / 10%">Padrão OTB</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 7px; font-size: 11.5px;">
            ${[
              { campo: 'comercial', label: 'Margem comercial =', val: par.margens.comercial, apl: mk.aplicada_comercial },
              { campo: 'materiais', label: 'Margem mat. =', val: par.margens.materiais, apl: mk.aplicada_materiais },
              { campo: 'fat_direto', label: 'Margem mat. fat. direto =', val: par.margens.fat_direto, apl: mk.aplicada_fat_direto },
              { campo: 'estaleiro', label: 'Margem Estaleiro e Meios =', val: par.margens.estaleiro, apl: mk.aplicada_estaleiro },
              { campo: 'sub', label: 'Margem Subempreitadas =', val: par.margens.sub, apl: mk.aplicada_sub }
            ].map(row => `
              <div style="display: grid; grid-template-columns: 1fr 76px 108px; gap: 6px; align-items: center; border-bottom: 1px solid #f8fafc; padding-bottom: 4px;">
                <span style="font-weight: 600; color: #334155; font-size: 11px;">${row.label}</span>
                <div style="display: flex; align-items: center; background: #fef08a; border: 1px solid #ca8a04; border-radius: 4px; padding-right: 4px;">
                  <input type="number" step="0.5" min="-50" max="95" value="${(row.val * 100).toFixed(2)}" onchange="atualizarMargemDesejadaOTB('${row.campo}', this.value)"
                    style="width: 100%; border: none; background: transparent; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 11px; padding: 3px 4px; color: #713f12; outline: none;">
                  <span style="font-size: 10px; font-weight: 800; color: #713f12;">%</span>
                </div>
                <span style="font-size: 10.5px; background: #f1f5f9; color: #0f172a; padding: 3px 6px; border-radius: 4px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">
                  Aplic.= ${(row.apl * 100).toFixed(2).replace('.', ',')}%
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-top: 12px; padding: 10px 12px; background: #fefce8; border: 1px solid #fde047; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 800; font-size: 12px; color: #713f12;">Impostos Médios (OTB) =</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 900; color: #854d0e;">
              ${(t.imposto_medio_otb * 100).toFixed(2).replace('.', ',')}%
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 10.5px; color: #854d0e;">
            <span>Enquadramento: <strong>${uf} (${isContrib ? 'Contribuinte' : 'Não Contribuinte'})</strong></span>
            <button onclick="switchTab('tab-impostos-otb')" style="background: transparent; border: none; color: #1d4ed8; font-weight: 800; cursor: pointer; font-size: 10.5px; text-decoration: underline;">Ver Impostos ↗</button>
          </div>
        </div>
      </div>

      <!-- COLUNA 3: GRANDES TOTAIS + DESDOBRAMENTO DOS 14 TIPOS DE CUSTO (H1:J19) -->
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 2px solid #0f172a;">
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 7px 10px;">
            <div style="font-size: 9.5px; font-weight: 800; color: #166534; text-transform: uppercase;">TOTAL DE VENDA</div>
            <div style="font-size: 14.5px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #15803d; margin-top: 2px;">${fmtMoeda3(t.venda)}</div>
          </div>
          <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 6px; padding: 7px 10px;">
            <div style="font-size: 9.5px; font-weight: 800; color: #1e40af; text-transform: uppercase;">Total de Impostos</div>
            <div style="font-size: 13.5px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #1d4ed8; margin-top: 2px;">${fmtMoeda3(t.impostos)}</div>
          </div>
          <div style="background: #faf5ff; border: 1px solid #d8b4fe; border-radius: 6px; padding: 7px 10px;">
            <div style="font-size: 9.5px; font-weight: 800; color: #6b21a8; text-transform: uppercase;">Total de Margem</div>
            <div style="font-size: 13.5px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #7e22ce; margin-top: 2px;">${fmtMoeda3(t.margem)}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 7px 10px;">
            <div style="font-size: 9.5px; font-weight: 800; color: #334155; text-transform: uppercase;">Total de Custos (100%)</div>
            <div style="font-size: 13.5px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #0f172a; margin-top: 2px;">${fmtMoeda3(t.custo)}</div>
          </div>
        </div>

        <div style="max-height: 255px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${linhasHtml}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =============================================================================
// 2. LISTA DE ARTIGOS SINTÉTICOS & COMPOSIÇÃO ANALÍTICA COMPLETA (IMAGENS 1 & 2)
// =============================================================================
const ORDEM_CATEGORIAS_ANALITICAS = [
  { nome: 'Materiais', corBg: '#eef2ff', corBorda: '#c7d2fe', corTxt: '#3730a3', icone: 'package' },
  { nome: 'MO', titulo: 'Mão-de-Obra (MO)', corBg: '#fff7ed', corBorda: '#fed7aa', corTxt: '#c2410c', icone: 'users' },
  { nome: 'Estaleiro', corBg: '#ecfeff', corBorda: '#a5f3fc', corTxt: '#0e7490', icone: 'warehouse' },
  { nome: 'Meios de Acesso e Elevação', corBg: '#f0f9ff', corBorda: '#bae6fd', corTxt: '#0369a1', icone: 'arrow-up-circle' },
  { nome: 'Transportes', corBg: '#fefce8', corBorda: '#fde047', corTxt: '#854d0e', icone: 'truck' },
  { nome: 'Projeto', corBg: '#fdf4ff', corBorda: '#f5d0fe', corTxt: '#86198f', icone: 'compass' },
  { nome: 'Subcontratações', corBg: '#f5f3ff', corBorda: '#ddd6fe', corTxt: '#5b21b6', icone: 'briefcase' },
  { nome: 'Taxas', titulo: 'Taxas (Equipamentos & Custos Indiretos s/ MO)', corBg: '#f1f5f9', corBorda: '#cbd5e1', corTxt: '#334155', icone: 'percent' },
  { nome: 'Outros', corBg: '#f8fafc', corBorda: '#e2e8f0', corTxt: '#475569', icone: 'layers' }
];

function renderizarSelect14TiposCusto(artIdx, realIdx, valorAtual) {
  const uf = (OTB_ESTADO.cliente && OTB_ESTADO.cliente.uf) || 'RJ';
  const isContrib = !!(OTB_ESTADO.cliente && OTB_ESTADO.cliente.contribuinte_icms);
  return `
    <select onchange="atualizarTipoCustoAnalitico(${artIdx}, ${realIdx}, this.value)"
      style="font-size: 11px; padding: 3px 5px; border: 1px solid #94a3b8; border-radius: 4px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #1e3a8a; background: #f8fafc; width: 100%; cursor: pointer;">
      ${ORDEM_TIPOS_CUSTO.map(tc => {
        const aliq = (getTaxaTipoCusto(tc, uf, isContrib, OTB_ESTADO.impostos_custom) * 100).toFixed(2);
        return `<option value="${tc}" ${tc === valorAtual ? 'selected' : ''}>${tc} (${aliq}%)</option>`;
      }).join('')}
    </select>
  `;
}

function renderizarListaArtigosSinteticosOTB() {
  const container = document.getElementById('otb-lista-artigos');
  if (!container) return;

  const todosArtigos = OTB_ESTADO.artigos || [];
  const secoesUnicas = Array.from(new Set(todosArtigos.map(a => a.secao_titulo || 'GERAL')));

  let toolbarHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; background: white; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px;">
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1;">
        <span style="font-size: 13px; font-weight: 800; color: #0f172a; white-space: nowrap;">
          Composição da Proposta (${todosArtigos.length} artigos)
        </span>
        <input type="text" value="${escHtml(OTB_ESTADO.filtro_artigo_texto)}" oninput="filtrarArtigosPropostaOTB(this.value)"
          placeholder="Filtrar artigo por código, seção ou descrição..."
          style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; min-width: 240px;">
        <select onchange="filtrarSecaoPropostaOTB(this.value)" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 600;">
          <option value="TODAS">Todas as Seções (${secoesUnicas.length})</option>
          ${secoesUnicas.map(s => `<option value="${escHtml(s)}" ${OTB_ESTADO.filtro_artigo_secao === s ? 'selected' : ''}>${escHtml(s)}</option>`).join('')}
        </select>
        ${todosArtigos.length > 0 ? `
          <button class="btn btn-sm btn-outline-dark" onclick="alternarTodosArtigos(true)">Expandir Todos</button>
          <button class="btn btn-sm btn-outline-dark" onclick="alternarTodosArtigos(false)">Recolher Todos</button>
        ` : ''}
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-sm btn-primary" onclick="abrirModalCatalogoArtigos('modelo37')" style="font-weight: 700;">
          <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i> + Artigo / Serviço (Catálogo OTB & BASE)
        </button>
        <button class="btn btn-sm btn-outline-dark" onclick="criarArtigoPersonalizadoOTB()" style="font-weight: 700;">
          <i data-lucide="file-plus" style="width: 14px; height: 14px;"></i> + Novo Artigo Sintético em Branco
        </button>
      </div>
    </div>
  `;

  if (todosArtigos.length === 0) {
    container.innerHTML = toolbarHtml + `
      <div style="text-align: center; padding: 54px 20px; background: white; border: 2px dashed #94a3b8; border-radius: 12px;">
        <i data-lucide="layers" style="width: 46px; height: 46px; color: #64748b; margin-bottom: 10px;"></i>
        <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Orçamento Zerado (R$ 0,00) — Pronto para Montagem</h3>
        <p style="font-size: 13px; color: #64748b; max-width: 580px; margin: 0 auto 18px; line-height: 1.5;">
          Adicione artigos sintéticos a partir dos <strong>37 artigos modelo OTB</strong>, dos <strong>68 serviços-base (BASE)</strong> (coberturas TPO/PVC, telhas, PIR, lã de rocha, rufos, SPDA, linha de vida, canteiro) ou crie um <strong>artigo personalizado</strong> do zero.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="abrirModalCatalogoArtigos('modelo37')">
            <i data-lucide="plus-circle" style="width: 15px; height: 15px;"></i> + Adicionar do Catálogo OTB (37 Artigos)
          </button>
          <button class="btn btn-primary" style="background: #0f766e;" onclick="abrirModalCatalogoArtigos('base68')">
            <i data-lucide="library" style="width: 15px; height: 15px;"></i> + Biblioteca de Serviços BASE (68 Templates)
          </button>
          <button class="btn btn-outline-dark" onclick="criarArtigoPersonalizadoOTB()">
            <i data-lucide="plus" style="width: 15px; height: 15px;"></i> + Criar Artigo Sintético em Branco
          </button>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  const termo = (OTB_ESTADO.filtro_artigo_texto || '').toLowerCase().trim();
  const secFiltro = OTB_ESTADO.filtro_artigo_secao || 'TODAS';

  let secaoRenderAtual = null;
  let cardsHtml = '';

  todosArtigos.forEach((art, idx) => {
    const secTitulo = art.secao_titulo || 'GERAL';
    if (secFiltro !== 'TODAS' && secTitulo !== secFiltro) return;
    if (termo) {
      const matchArt = (art.artigo || '').toLowerCase().includes(termo) ||
        (art.descricao || '').toLowerCase().includes(termo) ||
        secTitulo.toLowerCase().includes(termo) ||
        (art.itens_analiticos || []).some(i => (i.descricao || '').toLowerCase().includes(termo));
      if (!matchArt) return;
    }

    if (secTitulo !== secaoRenderAtual) {
      secaoRenderAtual = secTitulo;
      const subtotalSecao = todosArtigos
        .filter(a => (a.secao_titulo || 'GERAL') === secTitulo && !a.incluso)
        .reduce((acc, a) => acc + (a.preco_total || 0), 0);

      cardsHtml += `
        <div style="background: #0f172a; color: white; padding: 8px 14px; border-radius: 6px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: #38bdf8;">
            ${art.secao_codigo ? escHtml(art.secao_codigo) + ' — ' : ''}${escHtml(secTitulo)}
          </div>
          <div style="font-size: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #e2e8f0;">
            Subtotal Seção: <strong style="color: #4ade80;">${fmtMoeda2(subtotalSecao)}</strong>
          </div>
        </div>
      `;
    }

    const isExpanded = !!OTB_ESTADO.artigos_expandidos[idx];
    const analiticos = art.itens_analiticos || [];

    // Agrupa os itens analíticos nas 8 categorias oficiais mantendo TODAS visíveis quando presentes
    let blocosAnaliticosHtml = '';
    if (isExpanded) {
      ORDEM_CATEGORIAS_ANALITICAS.forEach(catDef => {
        const itensCat = analiticos.filter(a => {
          const catItem = a.categoria || inferirCategoriaPorTipoCusto(a.tipo_custo);
          return catItem === catDef.nome;
        });

        // Sempre exibe Materiais, MO e Taxas ou qualquer categoria que possua itens
        const sempreVisivel = (catDef.nome === 'Materiais' || catDef.nome === 'MO' || catDef.nome === 'Taxas');
        if (itensCat.length === 0 && !sempreVisivel) return;

        const subtotalCatCusto = itensCat.reduce((acc, i) => acc + (i.custo_total || 0), 0);

        blocosAnaliticosHtml += `
          <div style="margin-bottom: 12px; background: white; border: 1px solid ${catDef.corBorda}; border-radius: 6px; overflow: hidden;">
            <div style="background: ${catDef.corBg}; padding: 7px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${catDef.corBorda};">
              <div style="font-size: 12px; font-weight: 800; color: ${catDef.corTxt}; display: flex; align-items: center; gap: 6px;">
                <span>${escHtml(catDef.titulo || catDef.nome)}</span>
                <span style="font-size: 10.5px; opacity: 0.85;">(${itensCat.length} ${itensCat.length === 1 ? 'item' : 'itens'})</span>
              </div>
              <div style="font-size: 11.5px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: ${catDef.corTxt};">
                Subtotal Custo Unit.: ${fmtMoeda3(subtotalCatCusto)}
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
              <thead>
                <tr style="background: #f8fafc; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 10.5px;">
                  <th style="padding: 5px 8px; text-align: left; width: 70px;">Art.</th>
                  <th style="padding: 5px 8px; text-align: left; width: 155px;">Tipo de Custo (Imp.)</th>
                  <th style="padding: 5px 8px; text-align: left;">Descrição Analítica do Insumo / Tarefa</th>
                  <th style="padding: 5px 6px; text-align: center; width: 64px;">Unid.</th>
                  <th style="padding: 5px 8px; text-align: right; width: 96px;">Qtd / Coef.</th>
                  <th style="padding: 5px 8px; text-align: right; width: 115px;">Custo Unit.</th>
                  <th style="padding: 5px 8px; text-align: right; width: 110px;">Custo Total</th>
                  <th style="padding: 5px 8px; text-align: right; width: 115px;">Venda Unit.</th>
                  <th style="padding: 5px 6px; text-align: center; width: 38px;"></th>
                </tr>
              </thead>
              <tbody>
                ${itensCat.length === 0 ? `
                  <tr>
                    <td colspan="9" style="padding: 10px; text-align: center; color: #94a3b8; font-size: 11px;">
                      Nenhum item em ${escHtml(catDef.nome)}. Use os botões acima para inserir.
                    </td>
                  </tr>
                ` : itensCat.map(it => {
                  const realIdx = analiticos.indexOf(it);
                  const isMo = (it.tipo_custo === 'mo.inst' || it.tipo_custo === 'mo.transf');
                  const isAutoTaxa = ((it.tipo_custo === 'ferr.cons' || it.tipo_custo === 'ci') && it.auto_taxa_mo !== false);
                  const vendaItem = it._calc ? it._calc.venda : (it.custo_total || 0);
                  return `
                    <tr style="border-bottom: 1px solid #f1f5f9; background: #fdfcff;">
                      <td style="padding: 4px 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #64748b; background: #ede9fe;">
                        ${escHtml(art.artigo)}
                      </td>
                      <td style="padding: 4px 8px; background: #ede9fe;">
                        ${renderizarSelect14TiposCusto(idx, realIdx, it.tipo_custo)}
                      </td>
                      <td style="padding: 4px 8px;">
                        <input type="text" value="${escHtml(it.descricao)}" onchange="atualizarCampoAnaliticoOTB(${idx}, ${realIdx}, 'descricao', this.value)"
                          style="width: 100%; border: 1px solid transparent; background: transparent; font-weight: 600; color: #0f172a; font-size: 11.5px; padding: 2px 4px; border-radius: 4px;"
                          onfocus="this.style.borderColor='#94a3b8'; this.style.background='white';"
                          onblur="this.style.borderColor='transparent'; this.style.background='transparent';">
                      </td>
                      <td style="padding: 4px 6px; text-align: center;">
                        <input type="text" value="${escHtml(it.unidade || 'ud')}" onchange="atualizarCampoAnaliticoOTB(${idx}, ${realIdx}, 'unidade', this.value)"
                          style="width: 52px; text-align: center; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 11px; padding: 2px; color: #475569;">
                      </td>
                      <td style="padding: 4px 8px; text-align: right;">
                        <input type="number" step="any" value="${it.quantidade}" onchange="atualizarQtdAnalitico(${idx}, ${realIdx}, this.value)"
                          style="width: 84px; text-align: right; padding: 3px 5px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px;">
                      </td>
                      <td style="padding: 4px 8px; text-align: right;">
                        ${isMo ? `
                          <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #c2410c; font-size: 11px;" title="Vinculado ao Valor/Hora da Obra">${fmtMoeda3(it.preco_unitario)}</span>
                        ` : isAutoTaxa ? `
                          <span onclick="alternarAutoTaxaAnaliticoOTB(${idx}, ${realIdx})" style="cursor: pointer; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #0369a1; font-size: 11px; border-bottom: 1px dashed #0369a1;" title="Calculado automaticamente sobre a MO deste artigo. Clique se quiser editar manualmente.">
                            ⚡ ${fmtMoeda3(it.preco_unitario)}
                          </span>
                        ` : `
                          <input type="number" step="any" value="${Number(it.preco_unitario || 0).toFixed(4)}" onchange="atualizarPrecoAnalitico(${idx}, ${realIdx}, this.value)"
                            style="width: 98px; text-align: right; padding: 3px 5px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px;">
                        `}
                      </td>
                      <td style="padding: 4px 8px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0f172a;">
                        ${fmtMoeda3(it.custo_total)}
                      </td>
                      <td style="padding: 4px 8px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #15803d;">
                        ${fmtMoeda3(vendaItem)}
                      </td>
                      <td style="padding: 4px 6px; text-align: center;">
                        <button onclick="removerAnaliticoOTB(${idx}, ${realIdx})" style="border: none; background: transparent; cursor: pointer; color: #dc2626; font-weight: 800; font-size: 12px;" title="Remover linha analítica">✕</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      });
    }

    cardsHtml += `
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <!-- LINHA SINTÉTICA AMARELA (FIEL À IMAGEM 1 DA PLANILHA CUSTOS) -->
        <div style="background: #fef08a; border-left: 6px solid #ca8a04; padding: 10px 14px; display: grid; grid-template-columns: 78px 1fr 54px 96px 115px 115px 115px 120px 135px 110px; gap: 8px; align-items: center; border-bottom: ${isExpanded ? '2px solid #ca8a04' : 'none'}; cursor: pointer;" onclick="toggleExpandirArtigo(${idx})">
          <div style="font-weight: 900; font-size: 13.5px; font-family: 'JetBrains Mono', monospace; color: #422006;">
            ${escHtml(art.artigo || '-')}
            ${art.incluso ? `<div style="font-size: 9px; background: #16a34a; color: white; padding: 1px 4px; border-radius: 3px; display: inline-block; margin-top: 2px;">INCLUSO</div>` : ''}
          </div>

          <div style="font-size: 11.5px; color: #422006; font-weight: 600; white-space: pre-line; max-height: 52px; overflow: hidden; line-height: 1.32;" title="Clique para expandir e editar especificações e analíticos">
            ${escHtml((art.descricao || '').split('\n').slice(0, 3).join('\n'))}
          </div>

          <div style="font-size: 12px; font-weight: 800; color: #713f12; text-align: center;">
            ${escHtml(art.unidade || '-')}
          </div>

          <div onclick="event.stopPropagation()">
            <input type="number" min="0" step="any" value="${art.quantidade}" onchange="atualizarQtdArtigoOTB(${idx}, this.value)"
              style="width: 100%; font-size: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 800; text-align: right; background: #fffbeb; border: 1px solid #a16207; border-radius: 4px; padding: 4px 6px; color: #422006;">
          </div>

          <div style="text-align: right;">
            <div style="font-size: 8.5px; text-transform: uppercase; color: #854d0e; font-weight: 700;">Custo Unit.</div>
            <div style="font-size: 11.5px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0f172a;">${fmtMoeda3(art.custo_unitario)}</div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 8.5px; text-transform: uppercase; color: #854d0e; font-weight: 700;">Margem Unit.</div>
            <div style="font-size: 11.5px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #6b21a8;">${fmtMoeda3(art.margem_unitaria)}</div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 8.5px; text-transform: uppercase; color: #854d0e; font-weight: 700;">Imposto Unit.</div>
            <div style="font-size: 11.5px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #1d4ed8;">${fmtMoeda3(art.imposto_unitario)}</div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 8.5px; text-transform: uppercase; color: #854d0e; font-weight: 700;">Venda Unit.</div>
            <div style="font-size: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #047857;">${fmtMoeda3(art.preco_venda_unitario)}</div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 8.5px; text-transform: uppercase; color: #854d0e; font-weight: 700;">Total Artigo</div>
            <div style="font-size: 12.5px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #14532d;">
              ${art.incluso ? 'INCLUSO' : fmtMoeda2(art.preco_total)}
            </div>
          </div>

          <div style="display: flex; gap: 3px; justify-content: flex-end;" onclick="event.stopPropagation()">
            <button class="btn btn-sm" onclick="moverArtigoOTB(${idx}, -1)" style="padding: 3px 5px; background: rgba(0,0,0,0.07); border: none;" title="Mover para cima">↑</button>
            <button class="btn btn-sm" onclick="moverArtigoOTB(${idx}, 1)" style="padding: 3px 5px; background: rgba(0,0,0,0.07); border: none;" title="Mover para baixo">↓</button>
            <button class="btn btn-sm" onclick="duplicarArtigoOTB(${idx})" style="padding: 3px 5px; background: rgba(0,0,0,0.07); border: none;" title="Duplicar artigo">⧉</button>
            <button class="btn btn-sm" onclick="excluirArtigoOTB(${idx})" style="padding: 3px 5px; background: rgba(220,38,38,0.14); color: #991b1b; border: none;" title="Excluir artigo">✕</button>
            <button class="btn btn-sm" onclick="toggleExpandirArtigo(${idx})" style="padding: 3px 6px; background: #ca8a04; color: white; border: none; font-weight: 800;" title="Abrir/Fechar analíticos">${isExpanded ? '▲' : '▼'}</button>
          </div>
        </div>

        ${isExpanded ? `
          <div style="padding: 16px; background: #f8fafc;">
            <!-- Edição Completa dos Dados do Artigo Sintético -->
            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px;">
              <div style="display: grid; grid-template-columns: 110px 100px 1fr 90px 130px 190px; gap: 10px; margin-bottom: 10px; align-items: end;">
                <div>
                  <label style="font-size: 10.5px; font-weight: 700; color: #475569; display: block; margin-bottom: 3px;">Cód. Sintético</label>
                  <input type="text" value="${escHtml(art.artigo)}" onchange="atualizarCampoSinteticoOTB(${idx}, 'artigo', this.value)"
                    style="width: 100%; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
                </div>
                <div>
                  <label style="font-size: 10.5px; font-weight: 700; color: #475569; display: block; margin-bottom: 3px;">Nº Seção</label>
                  <input type="text" value="${escHtml(art.secao_codigo || '')}" onchange="atualizarCampoSinteticoOTB(${idx}, 'secao_codigo', this.value)"
                    placeholder="Ex: 1, 2" style="width: 100%; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 700;">
                </div>
                <div>
                  <label style="font-size: 10.5px; font-weight: 700; color: #475569; display: block; margin-bottom: 3px;">Título da Seção na Proposta</label>
                  <input type="text" value="${escHtml(art.secao_titulo || 'GERAL')}" onchange="atualizarCampoSinteticoOTB(${idx}, 'secao_titulo', this.value)"
                    placeholder="Ex: SISTEMAS COMPLEMENTARES" style="width: 100%; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 700;">
                </div>
                <div>
                  <label style="font-size: 10.5px; font-weight: 700; color: #475569; display: block; margin-bottom: 3px;">Unidade</label>
                  <input type="text" value="${escHtml(art.unidade || 'ud')}" onchange="atualizarCampoSinteticoOTB(${idx}, 'unidade', this.value)"
                    style="width: 100%; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center; font-weight: 700;">
                </div>
                <div>
                  <label style="font-size: 10.5px; font-weight: 700; color: #475569; display: block; margin-bottom: 3px;">Quantidade Obra</label>
                  <input type="number" step="any" value="${art.quantidade}" onchange="atualizarQtdArtigoOTB(${idx}, this.value)"
                    style="width: 100%; padding: 5px 8px; border: 1px solid #ca8a04; background: #fef9c3; border-radius: 4px; text-align: right; font-weight: 800;">
                </div>
                <div style="padding-bottom: 5px;">
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: #0f172a; cursor: pointer;">
                    <input type="checkbox" ${art.incluso ? 'checked' : ''} onchange="atualizarCampoSinteticoOTB(${idx}, 'incluso', this.checked)">
                    Exibir "INCLUSO" no PDF
                  </label>
                </div>
              </div>

              <div>
                <label style="font-size: 10.5px; font-weight: 700; color: #475569; display: block; margin-bottom: 3px;">Descritivo Técnico Completo do Artigo Sintético (Impresso na Proposta Comercial):</label>
                <textarea rows="5" onchange="atualizarCampoSinteticoOTB(${idx}, 'descricao', this.value)"
                  style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-family: inherit; line-height: 1.45; color: #1e293b;">${escHtml(art.descricao || '')}</textarea>
              </div>
            </div>

            <!-- Barra de Inserção Rápida de Itens Analíticos -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; background: #0f172a; padding: 9px 12px; border-radius: 6px;">
              <span style="color: #e2e8f0; font-size: 11.5px; font-weight: 800;">
                ➕ Composição Analítica do Artigo <code>${escHtml(art.artigo)}</code> (${analiticos.length} itens vinculados aos impostos):
              </span>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="abrirModalInserirMaterialNoArtigo(${idx})" style="font-size: 11px; padding: 4px 9px;">
                  + Material (Tabela OTB)
                </button>
                <button class="btn btn-sm" onclick="abrirModalInserirMONoArtigo(${idx})" style="background: #ea580c; color: white; border: none; font-size: 11px; padding: 4px 9px; font-weight: 700;">
                  + Mão-de-Obra (Rendimentos)
                </button>
                <button class="btn btn-sm" onclick="abrirModalInserirEquipamentoNoArtigo(${idx})" style="background: #0284c7; color: white; border: none; font-size: 11px; padding: 4px 9px; font-weight: 700;">
                  + Canteiro / Elevação / Transp.
                </button>
                <button class="btn btn-sm" onclick="adicionarItemAnaliticoLivreOTB(${idx})" style="background: #475569; color: white; border: none; font-size: 11px; padding: 4px 9px; font-weight: 700;">
                  + Item Livre (14 Tipos)
                </button>
                <button class="btn btn-sm" onclick="garantirTaxasPadraoMOArtigoOTB(${idx})" style="background: #fef08a; color: #713f12; border: none; font-size: 11px; padding: 4px 9px; font-weight: 800;" title="Adiciona automaticamente equipamentos (5% MO) e Custos Indiretos (67,5% MO)">
                  ⚡ + Taxas Auto MO
                </button>
              </div>
            </div>

            ${blocosAnaliticosHtml}
          </div>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = toolbarHtml + `<div style="display: flex; flex-direction: column; gap: 10px;">${cardsHtml}</div>`;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =============================================================================
// AÇÕES DE EDIÇÃO: DASHBOARD, ARTIGOS SINTÉTICOS E COMPOSIÇÃO ANALÍTICA
// =============================================================================
function filtrarArtigosPropostaOTB(termo) {
  OTB_ESTADO.filtro_artigo_texto = termo;
  renderizarListaArtigosSinteticosOTB();
}

function filtrarSecaoPropostaOTB(secao) {
  OTB_ESTADO.filtro_artigo_secao = secao;
  renderizarListaArtigosSinteticosOTB();
}

function toggleExpandirArtigo(idx) {
  OTB_ESTADO.artigos_expandidos[idx] = !OTB_ESTADO.artigos_expandidos[idx];
  renderizarListaArtigosSinteticosOTB();
}

function alternarTodosArtigos(expandir) {
  (OTB_ESTADO.artigos || []).forEach((_, idx) => {
    OTB_ESTADO.artigos_expandidos[idx] = expandir;
  });
  renderizarListaArtigosSinteticosOTB();
}

function atualizarReferenciaOTB(ref) {
  OTB_ESTADO.referencia = (ref || '').trim();
  const inpRef = document.getElementById('inp-referencia');
  if (inpRef) inpRef.value = OTB_ESTADO.referencia;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function atualizarNomeObraDashboardOTB(nome) {
  OTB_ESTADO.obra.nome = (nome || '').trim();
  const inpObra = document.getElementById('inp-obra-nome');
  if (inpObra) inpObra.value = OTB_ESTADO.obra.nome;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function atualizarHomensOTB(tipo, val) {
  const h = Math.max(1, parseInt(val, 10) || 1);
  if (tipo === 'instalacao') OTB_ESTADO.parametros.homens_instalacao = h;
  else OTB_ESTADO.parametros.homens_transformacao = h;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function atualizarValorHoraOTB(val) {
  const v = parseFloat(val);
  if (!isNaN(v) && v >= 0) {
    OTB_ESTADO.parametros.valor_hora = v;
    salvarEstadoOTB();
    recalcularERenderizarTudoOTB();
    if (typeof showToast === 'function') showToast(`Valor/Hora atualizado para ${fmtMoeda3(v)}`, 'info');
  }
}

function atualizarTaxaBaseMO(qual, valPerc) {
  const pct = (parseFloat(valPerc) || 0) / 100.0;
  if (qual === 'indiretos') OTB_ESTADO.parametros.taxa_indiretos = Math.max(0, pct);
  else OTB_ESTADO.parametros.taxa_ferramentas = Math.max(0, pct);
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function atualizarMargemDesejadaOTB(campo, valPerc) {
  const pct = (parseFloat(valPerc) || 0) / 100.0;
  if (OTB_ESTADO.parametros.margens && OTB_ESTADO.parametros.margens[campo] !== undefined) {
    OTB_ESTADO.parametros.margens[campo] = Math.min(Math.max(pct, -0.95), 0.95);
    salvarEstadoOTB();
    recalcularERenderizarTudoOTB();
  }
}

function restaurarMargensPadraoOTB() {
  OTB_ESTADO.parametros.margens = {
    comercial: 0.30,
    materiais: 0.30,
    fat_direto: 0.10,
    estaleiro: 0.10,
    sub: 0.10
  };
  OTB_ESTADO.parametros.taxa_indiretos = 0.675;
  OTB_ESTADO.parametros.taxa_ferramentas = 0.05;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  if (typeof showToast === 'function') showToast('Margens e taxas padrão OTB restauradas!', 'info');
}

function atualizarQtdArtigoOTB(idx, val) {
  const qtd = Math.max(0, parseFloat(val) || 0);
  if (OTB_ESTADO.artigos[idx]) {
    OTB_ESTADO.artigos[idx].quantidade = qtd;
    salvarEstadoOTB();
    recalcularERenderizarTudoOTB();
  }
}

function atualizarCampoSinteticoOTB(idx, campo, valor) {
  if (!OTB_ESTADO.artigos[idx]) return;
  OTB_ESTADO.artigos[idx][campo] = valor;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function moverArtigoOTB(idx, direcao) {
  const novoIdx = idx + direcao;
  if (novoIdx < 0 || novoIdx >= OTB_ESTADO.artigos.length) return;
  const temp = OTB_ESTADO.artigos[idx];
  OTB_ESTADO.artigos[idx] = OTB_ESTADO.artigos[novoIdx];
  OTB_ESTADO.artigos[novoIdx] = temp;

  const expA = !!OTB_ESTADO.artigos_expandidos[idx];
  const expB = !!OTB_ESTADO.artigos_expandidos[novoIdx];
  OTB_ESTADO.artigos_expandidos[idx] = expB;
  OTB_ESTADO.artigos_expandidos[novoIdx] = expA;

  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function duplicarArtigoOTB(idx) {
  if (OTB_ESTADO.artigos[idx]) {
    const clone = clonarProfundo(OTB_ESTADO.artigos[idx]);
    clone.artigo = (clone.artigo || 'ART') + '-B';
    OTB_ESTADO.artigos.splice(idx + 1, 0, clone);
    OTB_ESTADO.artigos_expandidos[idx + 1] = true;
    salvarEstadoOTB();
    recalcularERenderizarTudoOTB();
    if (typeof showToast === 'function') showToast(`Artigo ${clone.artigo} duplicado!`, 'info');
  }
}

function excluirArtigoOTB(idx) {
  const art = OTB_ESTADO.artigos[idx];
  if (!art) return;
  if (confirm(`Remover o artigo "${art.artigo}" e sua composição analítica?`)) {
    OTB_ESTADO.artigos.splice(idx, 1);
    const novoExp = {};
    Object.keys(OTB_ESTADO.artigos_expandidos).forEach(k => {
      const ki = parseInt(k, 10);
      if (ki < idx && OTB_ESTADO.artigos_expandidos[ki]) novoExp[ki] = true;
      else if (ki > idx && OTB_ESTADO.artigos_expandidos[ki]) novoExp[ki - 1] = true;
    });
    OTB_ESTADO.artigos_expandidos = novoExp;
    salvarEstadoOTB();
    recalcularERenderizarTudoOTB();
    if (typeof showToast === 'function') showToast('Artigo removido.', 'info');
  }
}

function atualizarCampoAnaliticoOTB(artIdx, analIdx, campo, valor) {
  const it = OTB_ESTADO.artigos[artIdx] && OTB_ESTADO.artigos[artIdx].itens_analiticos[analIdx];
  if (!it) return;
  it[campo] = valor;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function atualizarQtdAnalitico(artIdx, analIdx, val) {
  const it = OTB_ESTADO.artigos[artIdx] && OTB_ESTADO.artigos[artIdx].itens_analiticos[analIdx];
  if (!it) return;
  it.quantidade = parseFloat(val) || 0;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function atualizarPrecoAnalitico(artIdx, analIdx, val) {
  const it = OTB_ESTADO.artigos[artIdx] && OTB_ESTADO.artigos[artIdx].itens_analiticos[analIdx];
  if (!it) return;
  it.preco_unitario = parseFloat(val) || 0;
  if (it.tipo_custo === 'ferr.cons' || it.tipo_custo === 'ci') {
    it.auto_taxa_mo = false;
  }
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function atualizarTipoCustoAnalitico(artIdx, analIdx, novoTipo) {
  const it = OTB_ESTADO.artigos[artIdx] && OTB_ESTADO.artigos[artIdx].itens_analiticos[analIdx];
  if (!it) return;
  it.tipo_custo = novoTipo;
  it.categoria = inferirCategoriaPorTipoCusto(novoTipo);
  if (novoTipo === 'mo.inst' || novoTipo === 'mo.transf') {
    it.unidade = 'Horas';
  }
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function alternarAutoTaxaAnaliticoOTB(artIdx, analIdx) {
  const it = OTB_ESTADO.artigos[artIdx] && OTB_ESTADO.artigos[artIdx].itens_analiticos[analIdx];
  if (!it) return;
  it.auto_taxa_mo = (it.auto_taxa_mo === false);
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function removerAnaliticoOTB(artIdx, analIdx) {
  if (OTB_ESTADO.artigos[artIdx] && OTB_ESTADO.artigos[artIdx].itens_analiticos) {
    OTB_ESTADO.artigos[artIdx].itens_analiticos.splice(analIdx, 1);
    salvarEstadoOTB();
    recalcularERenderizarTudoOTB();
  }
}

function adicionarItemAnaliticoLivreOTB(artIdx) {
  const art = OTB_ESTADO.artigos[artIdx];
  if (!art) return;
  if (!art.itens_analiticos) art.itens_analiticos = [];
  art.itens_analiticos.push({
    categoria: 'Materiais',
    tipo_custo: 'mat.ns',
    descricao: 'Novo insumo / serviço analítico (clique para editar)',
    unidade: 'ud',
    quantidade: 1,
    preco_unitario: 100,
    custo_total: 100,
    auto_taxa_mo: false
  });
  OTB_ESTADO.artigos_expandidos[artIdx] = true;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  if (typeof showToast === 'function') showToast('Linha analítica adicionada! Escolha o Tipo de Custo e preencha os valores.', 'success');
}

function garantirTaxasPadraoMOArtigoOTB(artIdx) {
  const art = OTB_ESTADO.artigos[artIdx];
  if (!art) return;
  if (!art.itens_analiticos) art.itens_analiticos = [];
  const temFerr = art.itens_analiticos.some(i => i.tipo_custo === 'ferr.cons');
  const temCi = art.itens_analiticos.some(i => i.tipo_custo === 'ci');

  if (!temFerr) {
    art.itens_analiticos.push({
      categoria: 'Taxas',
      tipo_custo: 'ferr.cons',
      descricao: 'equipamentos',
      unidade: 'vg',
      quantidade: 1,
      preco_unitario: 0,
      custo_total: 0,
      auto_taxa_mo: true
    });
  } else {
    art.itens_analiticos.filter(i => i.tipo_custo === 'ferr.cons').forEach(i => { i.auto_taxa_mo = true; });
  }

  if (!temCi) {
    art.itens_analiticos.push({
      categoria: 'Taxas',
      tipo_custo: 'ci',
      descricao: 'Custos indirectos',
      unidade: 'vg',
      quantidade: 1,
      preco_unitario: 0,
      custo_total: 0,
      auto_taxa_mo: true
    });
  } else {
    art.itens_analiticos.filter(i => i.tipo_custo === 'ci').forEach(i => { i.auto_taxa_mo = true; });
  }

  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  if (typeof showToast === 'function') showToast('Taxas automáticas de MO (ferr.cons + ci) ativadas no artigo!', 'success');
}

// =============================================================================
// 3. ABA TABELA DE MATERIAIS & ENCOMENDA DA OBRA (ABA MATERIAIS DA PLANILHA)
// =============================================================================
function alternarModoAbaMateriaisOTB(modo) {
  OTB_ESTADO.aba_materiais_modo = modo;
  renderizarTabelaMateriaisOTB();
}

function renderizarTabelaMateriaisOTB() {
  const container = document.getElementById('otb-conteudo-materiais');
  if (!container) return;

  const encomenda = calcularEncomendaMateriais(OTB_ESTADO.artigos, OTB_CATALOGO_MATERIAIS);
  const mapaConsumoQtd = {};
  encomenda.forEach(e => {
    mapaConsumoQtd[(e.especificacao || '').trim().toLowerCase()] = e.quantidade_total;
  });

  const modo = OTB_ESTADO.aba_materiais_modo || 'catalogo';
  const locaisCompra = (OTB_ESTADO.impostos_custom && OTB_ESTADO.impostos_custom.locais_compra_icms) || IMPOSTOS_OTB.locais_compra_icms;

  const headerHtml = `
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px;">
        <div>
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;">
            📦 Tabela Oficial de Materiais & Encomenda da Obra (OTB)
          </h2>
          <p style="font-size: 12.5px; color: #64748b; margin-top: 3px;">
            ${OTB_CATALOGO_MATERIAIS.length} materiais cadastrados • Cálculo automático de Crédito ICMS na compra: <code>Valor Custo = Preço NF × (1 - Alíquota Créd. ICMS)</code>.
          </p>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-sm ${modo === 'catalogo' ? 'btn-primary' : 'btn-outline-dark'}" onclick="alternarModoAbaMateriaisOTB('catalogo')" style="font-weight: 700;">
            📋 Catálogo Completo (${OTB_CATALOGO_MATERIAIS.length})
          </button>
          <button class="btn btn-sm ${modo === 'encomenda' ? 'btn-primary' : 'btn-outline-dark'}" onclick="alternarModoAbaMateriaisOTB('encomenda')" style="font-weight: 700;">
            🛒 Encomenda da Proposta Atual (${encomenda.length} itens)
          </button>
          <button class="btn btn-sm btn-outline-dark" onclick="sincronizarPrecosCatalogoNaPropostaOTB()" title="Atualiza os preços de custo dos materiais usados na proposta atual conforme o catálogo">
            🔄 Aplicar Preços na Proposta
          </button>
          <button class="btn btn-sm" onclick="abrirModalNovoMaterialOTB()" style="background: #16a34a; color: white; border: none; font-weight: 700;">
            + Cadastrar Material
          </button>
        </div>
      </div>

      ${modo === 'catalogo' ? (() => {
        const grupos = Array.from(new Set(OTB_CATALOGO_MATERIAIS.map(m => m.grupo).filter(Boolean))).sort();
        return `
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <input type="text" value="${escHtml(OTB_ESTADO.busca_materiais)}" oninput="filtrarBuscaMateriaisOTB(this.value)"
              placeholder="Pesquisar por especificação técnica, código Firestone, NCM ou grupo..."
              style="flex: 1; min-width: 260px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px;">
            <select onchange="filtrarGrupoMateriaisOTB(this.value)" style="width: 280px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-weight: 600;">
              <option value="TODOS">Todos os Grupos (${grupos.length})</option>
              ${grupos.map(g => `<option value="${escHtml(g)}" ${OTB_ESTADO.filtro_grupo_material === g ? 'selected' : ''}>${escHtml(g)}</option>`).join('')}
            </select>
          </div>
        `;
      })() : `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px;">
          <div style="font-size: 12.5px; color: #166534;">
            <strong>Resumo de Compras / Suprimentos:</strong> Quantidades totais calculadas automaticamente pela multiplicação <code>Qtd. Artigo Sintético × Coeficiente Analítico</code>.
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-weight: 900; font-size: 14px; color: #15803d;">
              Custo Total Materiais: ${fmtMoeda2(encomenda.reduce((a, b) => a + b.custo_total_proposta, 0))}
            </span>
            <button class="btn btn-sm btn-outline-dark" onclick="exportarEncomendaMateriaisCSV()">⬇ Exportar CSV</button>
          </div>
        </div>
      `}
    </div>
  `;

  if (modo === 'encomenda') {
    container.innerHTML = headerHtml + `
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #0f172a; color: white; font-size: 11px;">
              <th style="padding: 8px 10px; text-align: left;">Código / NCM</th>
              <th style="padding: 8px 10px; text-align: left;">Especificação do Material</th>
              <th style="padding: 8px 8px; text-align: center;">Tipo Custo</th>
              <th style="padding: 8px 8px; text-align: center;">Unid.</th>
              <th style="padding: 8px 10px; text-align: right;">Qtd. Encomenda</th>
              <th style="padding: 8px 10px; text-align: right;">CustoTotal Obra</th>
              <th style="padding: 8px 10px; text-align: left;">Artigos Onde Usado</th>
            </tr>
          </thead>
          <tbody>
            ${encomenda.length === 0 ? `
              <tr><td colspan="7" style="padding: 36px; text-align: center; color: #94a3b8;">Nenhum material consumido na proposta atual (Orçamento Zerado).</td></tr>
            ` : encomenda.map(e => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 10px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #475569;">
                  <strong>${escHtml(e.codigo || '-')}</strong><br><span style="font-size: 10px; color: #94a3b8;">${escHtml(e.ncm || '')}</span>
                </td>
                <td style="padding: 7px 10px; font-weight: 600; color: #0f172a;">${escHtml(e.especificacao)}</td>
                <td style="padding: 7px 8px; text-align: center;"><code style="background: #eef2ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${escHtml(e.tipo_custo)}</code></td>
                <td style="padding: 7px 8px; text-align: center; font-weight: 700;">${escHtml(e.unidade)}</td>
                <td style="padding: 7px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0369a1;">${fmtNum3(e.quantidade_total)}</td>
                <td style="padding: 7px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #047857;">${fmtMoeda2(e.custo_total_proposta)}</td>
                <td style="padding: 7px 10px; font-size: 11px; color: #64748b;">${escHtml(e.artigos_uso.join(', '))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    return;
  }

  // Modo Catálogo Completo
  const busca = (OTB_ESTADO.busca_materiais || '').toLowerCase().trim();
  const grupoFiltro = OTB_ESTADO.filtro_grupo_material || 'TODOS';

  const filtrados = OTB_CATALOGO_MATERIAIS.filter(m => {
    const matchGrupo = (grupoFiltro === 'TODOS' || m.grupo === grupoFiltro);
    const matchBusca = !busca ||
      (m.especificacao && m.especificacao.toLowerCase().includes(busca)) ||
      (m.codigo && m.codigo.toLowerCase().includes(busca)) ||
      (m.grupo && m.grupo.toLowerCase().includes(busca)) ||
      (m.ncm && m.ncm.toLowerCase().includes(busca));
    return matchGrupo && matchBusca;
  });

  const total = filtrados.length;
  const totalPaginas = Math.ceil(total / OTB_ESTADO.materiais_por_pagina) || 1;
  if (OTB_ESTADO.pagina_materiais > totalPaginas) OTB_ESTADO.pagina_materiais = 1;
  const inicio = (OTB_ESTADO.pagina_materiais - 1) * OTB_ESTADO.materiais_por_pagina;
  const paginaItens = filtrados.slice(inicio, inicio + OTB_ESTADO.materiais_por_pagina);

  container.innerHTML = headerHtml + `
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
      <div style="padding: 8px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
        <span>Exibindo <strong>${total === 0 ? 0 : inicio + 1}</strong> a <strong>${Math.min(inicio + OTB_ESTADO.materiais_por_pagina, total)}</strong> de <strong>${total}</strong> materiais</span>
        <span>Página ${OTB_ESTADO.pagina_materiais} de ${totalPaginas}</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
        <thead>
          <tr style="background: #f1f5f9; color: #334155; border-bottom: 2px solid #cbd5e1; font-size: 10.5px; text-transform: uppercase;">
            <th style="padding: 8px 10px; text-align: left; width: 100px;">Código / NCM</th>
            <th style="padding: 8px 10px; text-align: left; width: 150px;">Grupo</th>
            <th style="padding: 8px 10px; text-align: left;">Especificação Técnica</th>
            <th style="padding: 8px 6px; text-align: center; width: 52px;">Un.</th>
            <th style="padding: 8px 8px; text-align: right; width: 105px; background: #fef9c3;">Preço NF (R$)</th>
            <th style="padding: 8px 8px; text-align: left; width: 150px; background: #fef9c3;">Origem / Créd. ICMS</th>
            <th style="padding: 8px 10px; text-align: right; width: 110px;">Valor Custo (R$)</th>
            <th style="padding: 8px 8px; text-align: right; width: 85px;">Consumo Obra</th>
            <th style="padding: 8px 10px; text-align: center; width: 125px;">Ação</th>
          </tr>
        </thead>
        <tbody>
          ${paginaItens.length === 0 ? `
            <tr><td colspan="9" style="padding: 32px; text-align: center; color: #94a3b8;">Nenhum material encontrado.</td></tr>
          ` : paginaItens.map(m => {
            const qtdObra = mapaConsumoQtd[(m.especificacao || '').trim().toLowerCase()] || 0;
            return `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px 10px; font-family: 'JetBrains Mono', monospace; font-size: 10.5px;">
                  <strong>${escHtml(m.codigo || '-')}</strong>
                  ${m.ncm ? `<div style="color: #94a3b8; font-size: 9.5px;">NCM ${escHtml(m.ncm)}</div>` : ''}
                </td>
                <td style="padding: 6px 10px; font-size: 10.5px; color: #475569;">
                  <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block;">${escHtml(m.grupo || 'GERAL')}</span>
                </td>
                <td style="padding: 6px 10px; font-weight: 600; color: #0f172a;">${escHtml(m.especificacao)}</td>
                <td style="padding: 6px 6px; text-align: center; font-weight: 700; color: #475569;">${escHtml(m.unidade || 'ud')}</td>
                <td style="padding: 6px 8px; text-align: right; background: #fffef2;">
                  <input type="number" step="0.01" value="${Number(m.preco_compra || 0).toFixed(2)}" onchange="atualizarMaterialCatalogoOTB('${escHtml(m.id)}', 'preco_compra', this.value)"
                    style="width: 88px; text-align: right; padding: 3px 5px; border: 1px solid #ca8a04; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px;">
                </td>
                <td style="padding: 6px 8px; background: #fffef2;">
                  <select onchange="atualizarMaterialCatalogoOTB('${escHtml(m.id)}', 'local_compra', this.value)"
                    style="width: 100%; padding: 3px 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 10.5px; font-weight: 600;">
                    ${Object.keys(locaisCompra).map(loc => {
                      const pct = (locaisCompra[loc] * 100).toFixed(0);
                      return `<option value="${escHtml(loc)}" ${m.local_compra === loc ? 'selected' : ''}>${escHtml(loc)} (${pct}%)</option>`;
                    }).join('')}
                  </select>
                </td>
                <td style="padding: 6px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #047857;">
                  ${fmtMoeda3(m.preco_custo)}
                </td>
                <td style="padding: 6px 8px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: ${qtdObra > 0 ? '#0369a1; font-weight: 800;' : '#cbd5e1;'}">
                  ${qtdObra > 0 ? fmtNum2(qtdObra) : '—'}
                </td>
                <td style="padding: 6px 10px; text-align: center;">
                  <button class="btn btn-sm btn-primary" onclick="inserirMaterialNoArtigoAtivo('${escHtml(m.id)}')" style="font-size: 10.5px; padding: 3px 8px;">
                    + Inserir em Artigo
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div style="padding: 10px 14px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-sm btn-outline-dark" onclick="mudarPaginaMateriaisOTB(-1)" ${OTB_ESTADO.pagina_materiais <= 1 ? 'disabled' : ''}>◀ Anterior</button>
        <span style="font-size: 12px; font-weight: 700; color: #475569;">Página ${OTB_ESTADO.pagina_materiais} de ${totalPaginas}</span>
        <button class="btn btn-sm btn-outline-dark" onclick="mudarPaginaMateriaisOTB(1)" ${OTB_ESTADO.pagina_materiais >= totalPaginas ? 'disabled' : ''}>Próxima ▶</button>
      </div>
    </div>
  `;
}

function filtrarBuscaMateriaisOTB(termo) {
  OTB_ESTADO.busca_materiais = termo;
  OTB_ESTADO.pagina_materiais = 1;
  renderizarTabelaMateriaisOTB();
}

function filtrarGrupoMateriaisOTB(grupo) {
  OTB_ESTADO.filtro_grupo_material = grupo;
  OTB_ESTADO.pagina_materiais = 1;
  renderizarTabelaMateriaisOTB();
}

function mudarPaginaMateriaisOTB(delta) {
  OTB_ESTADO.pagina_materiais += delta;
  renderizarTabelaMateriaisOTB();
}

function atualizarMaterialCatalogoOTB(matId, campo, valor) {
  const mat = OTB_CATALOGO_MATERIAIS.find(m => m.id === matId);
  if (!mat) return;
  const locaisCompra = (OTB_ESTADO.impostos_custom && OTB_ESTADO.impostos_custom.locais_compra_icms) || IMPOSTOS_OTB.locais_compra_icms;

  if (campo === 'preco_compra') {
    mat.preco_compra = Math.max(0, parseFloat(valor) || 0);
  } else if (campo === 'local_compra') {
    mat.local_compra = valor;
    mat.aliquota_credito_icms = locaisCompra[valor] !== undefined ? locaisCompra[valor] : 0;
  }
  const cred = mat.aliquota_credito_icms || 0;
  mat.preco_custo = Number((mat.preco_compra * (1.0 - cred)).toFixed(6));

  salvarCatalogoMateriaisOTB();
  renderizarTabelaMateriaisOTB();
}

function sincronizarPrecosCatalogoNaPropostaOTB() {
  const mapa = {};
  OTB_CATALOGO_MATERIAIS.forEach(m => {
    const k = (m.especificacao || '').trim().toLowerCase();
    if (k) mapa[k] = m.preco_custo;
  });

  let atualizados = 0;
  (OTB_ESTADO.artigos || []).forEach(art => {
    (art.itens_analiticos || []).forEach(it => {
      if (it.tipo_custo && it.tipo_custo.startsWith('mat.')) {
        const k = (it.descricao || '').trim().toLowerCase();
        if (mapa[k] !== undefined) {
          it.preco_unitario = mapa[k];
          atualizados++;
        }
      }
    });
  });

  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  if (typeof showToast === 'function') {
    showToast(`${atualizados} insumos analíticos tiveram seus preços sincronizados com o catálogo!`, 'success');
  }
}

function exportarEncomendaMateriaisCSV() {
  const encomenda = calcularEncomendaMateriais(OTB_ESTADO.artigos, OTB_CATALOGO_MATERIAIS);
  const cab = ['Codigo', 'NCM', 'Grupo', 'Especificacao', 'Tipo_Custo', 'Unidade', 'Qtd_Encomenda', 'Custo_Total_R$', 'Artigos'];
  const linhas = encomenda.map(e => [
    `"${(e.codigo || '').replace(/"/g, '""')}"`,
    `"${(e.ncm || '').replace(/"/g, '""')}"`,
    `"${(e.grupo || '').replace(/"/g, '""')}"`,
    `"${(e.especificacao || '').replace(/"/g, '""')}"`,
    e.tipo_custo,
    e.unidade,
    e.quantidade_total.toFixed(4).replace('.', ','),
    e.custo_total_proposta.toFixed(2).replace('.', ','),
    `"${e.artigos_uso.join('; ')}"`
  ].join(';'));

  const csv = '\uFEFF' + [cab.join(';'), ...linhas].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Encomenda_Materiais_${OTB_ESTADO.referencia || 'OTB'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =============================================================================
// 4. ABA TABELA DE IMPOSTOS & MATRIZ ICMS (ABA IMPOSTOS DA PLANILHA)
// =============================================================================
function renderizarTabelaImpostosOTB() {
  const container = document.getElementById('otb-conteudo-impostos');
  if (!container) return;

  if (!OTB_ESTADO.impostos_custom) {
    OTB_ESTADO.impostos_custom = criarImpostosPadraoClone();
  }

  const uf = (OTB_ESTADO.cliente && OTB_ESTADO.cliente.uf) || 'RJ';
  const isContribuinte = !!(OTB_ESTADO.cliente && OTB_ESTADO.cliente.contribuinte_icms);
  const impCustom = OTB_ESTADO.impostos_custom;
  const icmsUf = impCustom.icms_por_uf[uf] || impCustom.icms_por_uf['RJ'];
  const fed = impCustom.aliquotas_federais;
  const resumo = OTB_ESTADO.ultimo_resumo || recalcularPropostaCompleta(OTB_ESTADO.artigos, getConfigCalculoOTB());

  const tiposHtml = ORDEM_TIPOS_CUSTO.map(tc => {
    const info = (impCustom.tipos_custo && impCustom.tipos_custo[tc]) || { tipo_custo: tc, descricao: tc, tipo_nota: '-' };
    const aliq = getTaxaTipoCusto(tc, uf, isContribuinte, impCustom);
    const markup = getMarkupTipoCusto(tc, resumo.markups);
    const custoAcum = (resumo.desdobramento && resumo.desdobramento[tc]) || 0;
    const impAcum = (custoAcum * (1 + markup)) * aliq;

    return `
      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 11.5px;">
        <td style="padding: 6px 10px;">
          <code style="background: #eef2ff; padding: 2px 6px; border-radius: 4px; color: #1e3a8a; font-weight: 800;">${tc}</code>
        </td>
        <td style="padding: 6px 10px; font-weight: 600; color: #0f172a;">${escHtml(info.descricao)}</td>
        <td style="padding: 6px 10px; color: #64748b; font-size: 11px;">${escHtml(info.tipo_nota)}</td>
        <td style="padding: 6px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #6b21a8;">
          ${(markup * 100).toFixed(2).replace('.', ',')}%
        </td>
        <td style="padding: 6px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #1d4ed8; background: #eff6ff; font-size: 12.5px;">
          ${(aliq * 100).toFixed(2).replace('.', ',')}%
        </td>
        <td style="padding: 6px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: ${impAcum > 0 ? '#0f172a' : '#cbd5e1'};">
          ${fmtMoeda2(impAcum)}
        </td>
      </tr>
    `;
  }).join('');

  const matrizIcmsHtml = UFS_BRASIL.map(estado => {
    const ic = impCustom.icms_por_uf[estado] || { imp_contribuinte: 0.04, imp_nao_contribuinte: 0.18, nac_contribuinte: 0.12, nac_nao_contribuinte: 0.18 };
    const isAtivo = estado === uf;
    return `
      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 11px; background: ${isAtivo ? '#fef08a' : 'white'};">
        <td style="padding: 4px 8px; font-weight: 900; color: ${isAtivo ? '#713f12' : '#0f172a'}; cursor: pointer;" onclick="setUfClienteOTB('${estado}')" title="Clique para selecionar ${estado}">
          ${estado} ${isAtivo ? '●' : ''}
        </td>
        ${['imp_contribuinte', 'imp_nao_contribuinte', 'nac_contribuinte', 'nac_nao_contribuinte'].map(colKey => `
          <td style="padding: 3px 5px; text-align: right;">
            <input type="number" step="0.5" value="${(ic[colKey] * 100).toFixed(1)}" onchange="atualizarIcmsMatrizUFOTB('${estado}', '${colKey}', this.value)"
              style="width: 54px; text-align: right; padding: 2px 4px; border: 1px solid ${isAtivo ? '#ca8a04' : '#e2e8f0'}; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; background: ${isAtivo ? '#fffbeb' : '#f8fafc'};">
          </td>
        `).join('')}
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Perguntas de Status Fiscal (C31 e C32 da Aba Impostos) -->
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;">
            🧾 Tabela de Impostos, Enquadramento Fiscal & Matriz ICMS (OTB)
          </h2>
          <p style="font-size: 12.5px; color: #64748b; margin-top: 2px;">
            Altere o status de Contribuinte ICMS, UF do Cliente ou qualquer alíquota base para recalcular instantaneamente todos os artigos da proposta.
          </p>
        </div>
        <button class="btn btn-sm btn-outline-dark" onclick="restaurarImpostosPadraoOTB()">↺ Restaurar Impostos Padrão OTB</button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #fefce8; border: 2px solid #eab308; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px;">
        <div>
          <label style="font-size: 11.5px; font-weight: 800; color: #713f12; display: block; margin-bottom: 6px;">
            1. O CLIENTE A QUEM FATURAREMOS A NOTA DE MATERIAIS É CONTRIBUINTE ICMS?
          </label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-sm ${isContribuinte ? 'btn-primary' : 'btn-outline-dark'}" onclick="setContribuinteICMSOTB(true)" style="padding: 6px 20px; font-weight: 800;">SIM (Contribuinte)</button>
            <button class="btn btn-sm ${!isContribuinte ? 'btn-primary' : 'btn-outline-dark'}" onclick="setContribuinteICMSOTB(false)" style="padding: 6px 20px; font-weight: 800;">NÃO (Não Contribuinte)</button>
          </div>
        </div>

        <div>
          <label style="font-size: 11.5px; font-weight: 800; color: #713f12; display: block; margin-bottom: 6px;">
            2. QUAL O ESTADO DA SEDE / OBRA DESSE CLIENTE (UF)?
          </label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <select onchange="setUfClienteOTB(this.value)" style="width: 240px; padding: 6px 10px; border: 2px solid #ca8a04; background: white; border-radius: 6px; font-weight: 800; font-size: 13px; color: #0f172a;">
              ${UFS_BRASIL.map(est => {
                const dUf = impCustom.icms_por_uf[est];
                const icAtivo = isContribuinte ? dUf.nac_contribuinte : dUf.nac_nao_contribuinte;
                return `<option value="${est}" ${est === uf ? 'selected' : ''}>${est} — ICMS Nac. Ativo: ${(icAtivo * 100).toFixed(1)}%</option>`;
              }).join('')}
            </select>
            <span style="font-size: 11.5px; color: #713f12;">
              ICMS Imp.: <strong>${((isContribuinte ? icmsUf.imp_contribuinte : icmsUf.imp_nao_contribuinte) * 100).toFixed(1)}%</strong> |
              ICMS Nac.: <strong>${((isContribuinte ? icmsUf.nac_contribuinte : icmsUf.nac_nao_contribuinte) * 100).toFixed(1)}%</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- Alíquotas Federais, ISS e INSS Editáveis (D22:D27) -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px;">
        <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-bottom: 8px; text-transform: uppercase;">
          Alíquotas Federais, Municipais e Previdenciárias Base (Editáveis — Aba Impostos D22:D27)
        </div>
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
          ${[
            { key: 'pis', label: 'PIS (%)' },
            { key: 'cofins', label: 'COFINS (%)' },
            { key: 'irpj_csll_venda_servico', label: 'IRPJ/CSLL Venda & Serv. (%)' },
            { key: 'irpj_csll_projeto', label: 'IRPJ/CSLL Projeto (%)' },
            { key: 'iss', label: 'ISS Municipal (%)' },
            { key: 'inss', label: 'INSS Retido Líq. (%)' }
          ].map(f => `
            <div>
              <label style="font-size: 10.5px; font-weight: 700; color: #475569; display: block; margin-bottom: 3px;">${f.label}</label>
              <input type="number" step="0.01" value="${(fed[f.key] * 100).toFixed(2)}" onchange="atualizarAliquotaFederalOTB('${f.key}', this.value)"
                style="width: 100%; padding: 5px 8px; border: 1px solid #94a3b8; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-weight: 800; text-align: right; background: #fffef2;">
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Duas Colunas: 14 Tipos de Custo + Matriz 27 Estados -->
    <div style="display: grid; grid-template-columns: 1fr 410px; gap: 16px;">
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
        <div style="background: #0f172a; color: white; padding: 10px 14px; font-weight: 800; font-size: 12.5px;">
          Os 14 Tipos de Custo Vinculados aos Itens Analíticos (${uf} • ${isContribuinte ? 'Contribuinte ICMS' : 'Não Contribuinte ICMS'})
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9; color: #334155; border-bottom: 2px solid #cbd5e1; font-size: 10.5px;">
              <th style="padding: 7px 10px; text-align: left;">Código</th>
              <th style="padding: 7px 10px; text-align: left;">Descrição do Tipo de Custo</th>
              <th style="padding: 7px 10px; text-align: left;">Tipo de Nota Fiscal</th>
              <th style="padding: 7px 10px; text-align: right;">Markup Aplic.</th>
              <th style="padding: 7px 10px; text-align: right;">Imposto Efetivo</th>
              <th style="padding: 7px 10px; text-align: right;">Imposto na Obra</th>
            </tr>
          </thead>
          <tbody>
            ${tiposHtml}
          </tbody>
        </table>
      </div>

      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
        <div style="background: #0f172a; color: white; padding: 10px 14px; font-weight: 800; font-size: 12.5px;">
          Matriz ICMS dos 27 Estados (% Editável)
        </div>
        <div style="max-height: 540px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f1f5f9; color: #334155; border-bottom: 1px solid #cbd5e1; font-size: 10px;">
                <th style="padding: 6px 8px; text-align: left;">UF</th>
                <th style="padding: 6px 5px; text-align: right;">Imp. Contr.</th>
                <th style="padding: 6px 5px; text-align: right;">Imp. Não C.</th>
                <th style="padding: 6px 5px; text-align: right;">Nac. Contr.</th>
                <th style="padding: 6px 5px; text-align: right;">Nac. Não C.</th>
              </tr>
            </thead>
            <tbody>
              ${matrizIcmsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function setContribuinteICMSOTB(val) {
  OTB_ESTADO.cliente.contribuinte_icms = !!val;
  const selCliContrib = document.getElementById('inp-cliente-contribuinte');
  if (selCliContrib) selCliContrib.value = val ? 'SIM' : 'NAO';
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  if (typeof showToast === 'function') {
    showToast(`Status ICMS alterado para: ${val ? 'Contribuinte ICMS (SIM)' : 'Não Contribuinte (NÃO)'}`, 'info');
  }
}

function setUfClienteOTB(uf) {
  const ufUp = (uf || 'RJ').toUpperCase();
  OTB_ESTADO.cliente.uf = ufUp;
  const selUf = document.getElementById('inp-cliente-uf');
  if (selUf) selUf.value = ufUp;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  if (typeof showToast === 'function') {
    showToast(`UF fiscal atualizada para ${ufUp} — impostos recalculados!`, 'info');
  }
}

function atualizarAliquotaFederalOTB(chave, valPerc) {
  if (!OTB_ESTADO.impostos_custom) OTB_ESTADO.impostos_custom = criarImpostosPadraoClone();
  const v = Math.max(0, (parseFloat(valPerc) || 0) / 100.0);
  OTB_ESTADO.impostos_custom.aliquotas_federais[chave] = v;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function atualizarIcmsMatrizUFOTB(uf, coluna, valPerc) {
  if (!OTB_ESTADO.impostos_custom) OTB_ESTADO.impostos_custom = criarImpostosPadraoClone();
  if (OTB_ESTADO.impostos_custom.icms_por_uf[uf]) {
    OTB_ESTADO.impostos_custom.icms_por_uf[uf][coluna] = Math.max(0, (parseFloat(valPerc) || 0) / 100.0);
    salvarEstadoOTB();
    recalcularERenderizarTudoOTB();
  }
}

function restaurarImpostosPadraoOTB() {
  OTB_ESTADO.impostos_custom = criarImpostosPadraoClone();
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  if (typeof showToast === 'function') showToast('Tabela de Impostos restaurada para os valores originais da planilha OTB!', 'success');
}


// =============================================================================
// 5. SINCRONIZAÇÃO ABA DADOS DA OBRA & CLIENTE + COMERCIAIS OMNITRADE
// =============================================================================
function sincronizarInputsDadosGeraisComEstado() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.value = val;
  };

  setVal('inp-obra-nome', OTB_ESTADO.obra.nome || '');
  setVal('inp-obra-ref', OTB_ESTADO.referencia || '');
  setVal('inp-obra-local', OTB_ESTADO.obra.local || '');
  setVal('inp-obra-objeto', OTB_ESTADO.obra.objeto || '');
  setVal('inp-obra-data', OTB_ESTADO.data || new Date().toLocaleDateString('pt-BR'));

  setVal('inp-cliente-nome', OTB_ESTADO.cliente.nome || '');
  setVal('inp-cliente-contato', OTB_ESTADO.cliente.contato || '');
  setVal('inp-cliente-email', OTB_ESTADO.cliente.email || '');
  setVal('inp-cliente-telefone', OTB_ESTADO.cliente.telefone || '');
  setVal('inp-cliente-uf', (OTB_ESTADO.cliente.uf || 'RJ').toUpperCase());
  setVal('inp-cliente-contribuinte', OTB_ESTADO.cliente.contribuinte_icms ? 'SIM' : 'NAO');

  setVal('inp-comercial-nome', OTB_ESTADO.comercial.responsavel || '');
  setVal('inp-comercial-email', OTB_ESTADO.comercial.email || '');
  setVal('inp-comercial-cel', OTB_ESTADO.comercial.celular || '');
  setVal('inp-comercial-tel', OTB_ESTADO.comercial.telefone || '+55 (11) 4561-3992');

  // Popula dropdown rápido de Comerciais da aba DADOS caso ainda não populado
  const selCom = document.getElementById('sel-comercial-rapido');
  if (selCom && BIBLIOTECAS_OTB && Array.isArray(BIBLIOTECAS_OTB.comerciais)) {
    if (selCom.options.length <= 1) {
      selCom.innerHTML = `<option value="">-- Selecionar Comercial Cadastrado (Aba DADOS) --</option>` +
        BIBLIOTECAS_OTB.comerciais.map(c =>
          `<option value="${escHtml(c.nome)}">${escHtml(c.nome)} (${escHtml(c.email)})</option>`
        ).join('');
    }
    selCom.value = OTB_ESTADO.comercial.responsavel || '';
  }
}

function lerInputsDadosGeraisParaEstado() {
  const getVal = (id, fallback) => {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
  };

  OTB_ESTADO.obra.nome = getVal('inp-obra-nome', OTB_ESTADO.obra.nome);
  OTB_ESTADO.referencia = getVal('inp-obra-ref', OTB_ESTADO.referencia);
  OTB_ESTADO.obra.local = getVal('inp-obra-local', OTB_ESTADO.obra.local);
  OTB_ESTADO.obra.objeto = getVal('inp-obra-objeto', OTB_ESTADO.obra.objeto);
  OTB_ESTADO.data = getVal('inp-obra-data', OTB_ESTADO.data);

  OTB_ESTADO.cliente.nome = getVal('inp-cliente-nome', OTB_ESTADO.cliente.nome);
  OTB_ESTADO.cliente.contato = getVal('inp-cliente-contato', OTB_ESTADO.cliente.contato);
  OTB_ESTADO.cliente.email = getVal('inp-cliente-email', OTB_ESTADO.cliente.email);
  OTB_ESTADO.cliente.telefone = getVal('inp-cliente-telefone', OTB_ESTADO.cliente.telefone);
  OTB_ESTADO.cliente.uf = (getVal('inp-cliente-uf', OTB_ESTADO.cliente.uf) || 'RJ').toUpperCase();

  const contribEl = document.getElementById('inp-cliente-contribuinte');
  if (contribEl) {
    OTB_ESTADO.cliente.contribuinte_icms = (contribEl.value === 'SIM');
  }

  OTB_ESTADO.comercial.responsavel = getVal('inp-comercial-nome', OTB_ESTADO.comercial.responsavel);
  OTB_ESTADO.comercial.email = getVal('inp-comercial-email', OTB_ESTADO.comercial.email);
  OTB_ESTADO.comercial.celular = getVal('inp-comercial-cel', OTB_ESTADO.comercial.celular);
  OTB_ESTADO.comercial.telefone = getVal('inp-comercial-tel', OTB_ESTADO.comercial.telefone);

  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
}

function selecionarComercialPadraoOTB(nomeComercial) {
  if (!nomeComercial || !BIBLIOTECAS_OTB || !Array.isArray(BIBLIOTECAS_OTB.comerciais)) return;
  const encontrado = BIBLIOTECAS_OTB.comerciais.find(c => c.nome === nomeComercial);
  if (!encontrado) return;

  OTB_ESTADO.comercial = {
    responsavel: encontrado.nome,
    email: encontrado.email || '',
    celular: encontrado.celular || '',
    telefone: encontrado.telefone_fixo || '+55 (11) 4561-3992'
  };
  sincronizarInputsDadosGeraisComEstado();
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  if (typeof showToast === 'function') {
    showToast(`Responsável Comercial atualizado: ${encontrado.nome}`, 'info');
  }
}

// =============================================================================
// 6. ABA VALOR HORA, EQUIPE & RENDIMENTOS M.O. (ABAS VALOR HORA + MO)
// =============================================================================
function renderizarAbaValorHoraEMoOTB() {
  const container = document.getElementById('otb-conteudo-mo');
  if (!container) return;

  if (!OTB_ESTADO.equipe_valor_hora) {
    OTB_ESTADO.equipe_valor_hora = clonarProfundo(BIBLIOTECAS_OTB.equipe_padrao_valor_hora);
  }

  const calcEq = calcularValorHoraEquipe(OTB_ESTADO.equipe_valor_hora);
  const redRendimento = calcEq.red_rendimento;
  const todosMo = (BIBLIOTECAS_OTB && BIBLIOTECAS_OTB.rendimentos_mo) || [];
  const gruposMo = Array.from(new Set(todosMo.map(r => r.grupo).filter(Boolean)));

  const buscaMo = (OTB_ESTADO.busca_mo || '').toLowerCase().trim();
  const grupoFiltroMo = OTB_ESTADO.filtro_grupo_mo || 'TODOS';

  const filtradosMo = todosMo.filter(r => {
    const matchG = (grupoFiltroMo === 'TODOS' || r.grupo === grupoFiltroMo);
    const matchB = !buscaMo ||
      (r.tarefa && r.tarefa.toLowerCase().includes(buscaMo)) ||
      (r.subgrupo && r.subgrupo.toLowerCase().includes(buscaMo)) ||
      (r.grupo && r.grupo.toLowerCase().includes(buscaMo));
    return matchG && matchB;
  });

  const opcoesDimensao = [
    'Até 500 m2',
    'De 500 a 2.000 m2',
    'De 2.000 a 10.000 m2',
    'Acima de 10.000 m2'
  ];

  container.innerHTML = `
    <!-- Painel 1: Composição do Valor/Hora da Equipe (Aba VALOR HORA) -->
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin-bottom: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 14px;">
        <div>
          <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0;">
            👷 Engenharia de Valor / Hora & Eficiência de Equipe (Aba VALOR HORA)
          </h2>
          <p style="font-size: 12.5px; color: #64748b; margin-top: 3px;">
            Altere a composição da equipe padrão, salários mensais, viagens/alojamento e porte da obra. Clique em <strong>Aplicar Valor/Hora na Proposta</strong> para atualizar todos os itens <code>mo.inst</code> e <code>mo.transf</code>.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 8px 14px; border-radius: 6px; text-align: right;">
            <div style="font-size: 10px; font-weight: 800; color: #166534; text-transform: uppercase;">Valor/Hora Calculado Equipe</div>
            <div style="font-size: 17px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #15803d;">${fmtMoeda3(calcEq.valor_hora)}</div>
          </div>
          <div style="background: #fff7ed; border: 1px solid #fdba74; padding: 8px 14px; border-radius: 6px; text-align: right;">
            <div style="font-size: 10px; font-weight: 800; color: #9a3412; text-transform: uppercase;">Red. Rendimento (MO!C4)</div>
            <div style="font-size: 17px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #c2410c;">${(redRendimento * 100).toFixed(2)}%</div>
          </div>
          <button class="btn btn-primary" onclick="aplicarValorHoraEquipeNaPropostaOTB()" style="font-weight: 800;">
            ✓ Aplicar ${fmtMoeda3(calcEq.valor_hora)} na Proposta Atual
          </button>
          <button class="btn btn-sm btn-outline-dark" onclick="restaurarEquipePadraoOTB()">↺ Restaurar Equipe Padrão</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <label style="font-size: 12.5px; font-weight: 800; color: #334155;">Dimensão da Obra (Fator Perda Escala):</label>
        <select onchange="atualizarDimensaoObraEquipeOTB(this.value)"
          style="padding: 6px 10px; border: 1px solid #ca8a04; background: #fef9c3; border-radius: 6px; font-weight: 800; font-size: 12.5px; color: #422006;">
          ${opcoesDimensao.map(op => `<option value="${escHtml(op)}" ${calcEq.dimensao_obra === op ? 'selected' : ''}>${escHtml(op)}</option>`).join('')}
        </select>
        <span style="font-size: 12px; color: #64748b;">
          Equipe Direta em Campo: <strong>${fmtNum2(calcEq.soma_equipe_direta)} homens</strong> • Valor/Hora ativo na Proposta: <strong>${fmtMoeda3(OTB_ESTADO.parametros.valor_hora)}</strong>
        </span>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #0f172a; color: white; font-size: 11px;">
              <th style="padding: 8px 10px; text-align: left;">Função / Cargo</th>
              <th style="padding: 8px 8px; text-align: center; background: #ca8a04;">Qtd. Equipe</th>
              <th style="padding: 8px 10px; text-align: right; background: #ca8a04;">Custo Salarial Mensal (R$)</th>
              <th style="padding: 8px 8px; text-align: right;">Horas/Mês</th>
              <th style="padding: 8px 10px; text-align: right;">Salário/Hora</th>
              <th style="padding: 8px 10px; text-align: right; background: #ca8a04;">Viagens/h (R$)</th>
              <th style="padding: 8px 10px; text-align: right; background: #ca8a04;">Alojam./h (R$)</th>
              <th style="padding: 8px 10px; text-align: right;">Custo Total/h</th>
              <th style="padding: 8px 10px; text-align: right;">Peso Equipe (R$/h)</th>
            </tr>
          </thead>
          <tbody>
            ${calcEq.cargos.map((c, idx) => `
              <tr style="border-bottom: 1px solid #e2e8f0; background: ${c.entra_soma_equipe ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 10px; font-weight: 800; color: #0f172a;">
                  ${escHtml(c.nome)}
                  ${!c.entra_soma_equipe ? `<span style="font-size: 10px; color: #64748b; font-weight: 600;"> (Rateio Apoio)</span>` : `<span style="font-size: 10px; color: #0284c7; font-weight: 600;"> (Eficiência ${(c.eficiencia * 100).toFixed(0)}%)</span>`}
                </td>
                <td style="padding: 6px 8px; text-align: center; background: #fffef2;">
                  <input type="number" step="0.25" min="0" value="${c.qtd}" onchange="atualizarCargoEquipeOTB(${idx}, 'qtd', this.value)"
                    style="width: 70px; text-align: center; padding: 4px; border: 1px solid #ca8a04; border-radius: 4px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
                </td>
                <td style="padding: 6px 10px; text-align: right; background: #fffef2;">
                  <input type="number" step="10" min="0" value="${Number(c.salario_mensal).toFixed(2)}" onchange="atualizarCargoEquipeOTB(${idx}, 'salario_mensal', this.value)"
                    style="width: 105px; text-align: right; padding: 4px 6px; border: 1px solid #ca8a04; border-radius: 4px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
                </td>
                <td style="padding: 7px 8px; text-align: right; font-family: 'JetBrains Mono', monospace; color: #64748b;">${fmtNum3(c.horas_mes)}</td>
                <td style="padding: 7px 10px; text-align: right; font-family: 'JetBrains Mono', monospace;">${fmtMoeda2(c.salario_hora)}</td>
                <td style="padding: 6px 10px; text-align: right; background: #fffef2;">
                  <input type="number" step="0.1" min="0" value="${Number(c.viagens_hora).toFixed(2)}" onchange="atualizarCargoEquipeOTB(${idx}, 'viagens_hora', this.value)"
                    style="width: 78px; text-align: right; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace;">
                </td>
                <td style="padding: 6px 10px; text-align: right; background: #fffef2;">
                  <input type="number" step="0.1" min="0" value="${Number(c.alojamento_hora).toFixed(2)}" onchange="atualizarCargoEquipeOTB(${idx}, 'alojamento_hora', this.value)"
                    style="width: 78px; text-align: right; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace;">
                </td>
                <td style="padding: 7px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${fmtMoeda3(c.total_hora)}</td>
                <td style="padding: 7px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #047857;">${fmtMoeda3(c.subtotal_ponderado)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Painel 2: Biblioteca de 128 Índices de Rendimento de Mão de Obra (Aba MO) -->
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px;">
        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">
            ⏱️ Tabela Oficial de Rendimentos de Mão de Obra (${todosMo.length} Tarefas — Aba MO)
          </h3>
          <p style="font-size: 12px; color: #64748b; margin-top: 3px;">
            Índices em Horas/Unidade já ajustados pelo fator de redução de rendimento da equipe: <code>Horas Ajustadas = Horas Base × (1 + ${(redRendimento * 100).toFixed(2)}%)</code>.
          </p>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <input type="text" value="${escHtml(OTB_ESTADO.busca_mo)}" oninput="filtrarBuscaMoOTB(this.value)"
            placeholder="Buscar tarefa (ex: TPO, Bengala, Rufo, Telha, PIR)..."
            style="min-width: 260px; padding: 7px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12.5px;">
          <select onchange="filtrarGrupoMoOTB(this.value)" style="padding: 7px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12.5px; font-weight: 700;">
            <option value="TODOS">Todos os Sistemas (${gruposMo.length})</option>
            ${gruposMo.map(g => `<option value="${escHtml(g)}" ${OTB_ESTADO.filtro_grupo_mo === g ? 'selected' : ''}>${escHtml(g)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="max-height: 520px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
          <thead style="position: sticky; top: 0; z-index: 2;">
            <tr style="background: #f1f5f9; color: #334155; border-bottom: 2px solid #cbd5e1; font-size: 10.5px; text-transform: uppercase;">
              <th style="padding: 8px 10px; text-align: left;">Sistema / Subgrupo</th>
              <th style="padding: 8px 10px; text-align: left;">Tarefa de Montagem / Fabricação</th>
              <th style="padding: 8px 6px; text-align: center;">Un. Ref</th>
              <th style="padding: 8px 10px; text-align: right;">Índice Base (h)</th>
              <th style="padding: 8px 10px; text-align: right; background: #fff7ed;">Índice Obra Ajustado (h)</th>
              <th style="padding: 8px 10px; text-align: right;">Custo MO Unit. (${fmtMoeda2(OTB_ESTADO.parametros.valor_hora)}/h)</th>
              <th style="padding: 8px 10px; text-align: center;">Inserir na Proposta</th>
            </tr>
          </thead>
          <tbody>
            ${filtradosMo.map(r => {
              const hAjust = (r.horas_base || 0) * (1.0 + redRendimento);
              const custoMo = hAjust * (OTB_ESTADO.parametros.valor_hora || 59.929386);
              return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 10px; font-size: 10.5px; color: #475569;">
                    <strong>${escHtml(r.grupo)}</strong><br><span>${escHtml(r.subgrupo || '')}</span>
                  </td>
                  <td style="padding: 6px 10px; font-weight: 700; color: #0f172a;">${escHtml(r.tarefa)}</td>
                  <td style="padding: 6px 6px; text-align: center; font-weight: 700;">${escHtml(r.unidade_ref || 'un')}</td>
                  <td style="padding: 6px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; color: #64748b;">${Number(r.horas_base || 0).toFixed(4)} h</td>
                  <td style="padding: 6px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #c2410c; background: #fffaf5;">${hAjust.toFixed(4)} h</td>
                  <td style="padding: 6px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #047857;">${fmtMoeda3(custoMo)}</td>
                  <td style="padding: 6px 10px; text-align: center;">
                    <button class="btn btn-sm" onclick="inserirTarefaMoDaAbaNoArtigo('${escHtml(r.id)}')" style="background: #ea580c; color: white; border: none; font-size: 10.5px; padding: 3px 8px; font-weight: 700;">
                      + Usar em Artigo
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function atualizarCargoEquipeOTB(cargoIdx, campo, valor) {
  if (!OTB_ESTADO.equipe_valor_hora || !OTB_ESTADO.equipe_valor_hora.cargos[cargoIdx]) return;
  OTB_ESTADO.equipe_valor_hora.cargos[cargoIdx][campo] = Math.max(0, parseFloat(valor) || 0);
  salvarEstadoOTB();
  renderizarAbaValorHoraEMoOTB();
}

function atualizarDimensaoObraEquipeOTB(dimensao) {
  if (!OTB_ESTADO.equipe_valor_hora) return;
  OTB_ESTADO.equipe_valor_hora.dimensao_obra = dimensao;
  salvarEstadoOTB();
  renderizarAbaValorHoraEMoOTB();
}

function aplicarValorHoraEquipeNaPropostaOTB() {
  const calcEq = calcularValorHoraEquipe(OTB_ESTADO.equipe_valor_hora);
  OTB_ESTADO.parametros.valor_hora = calcEq.valor_hora;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  renderizarAbaValorHoraEMoOTB();
  if (typeof showToast === 'function') {
    showToast(`Valor/Hora ${fmtMoeda3(calcEq.valor_hora)} aplicado em toda a proposta!`, 'success');
  }
}

function restaurarEquipePadraoOTB() {
  OTB_ESTADO.equipe_valor_hora = clonarProfundo(BIBLIOTECAS_OTB.equipe_padrao_valor_hora);
  const calcEq = calcularValorHoraEquipe(OTB_ESTADO.equipe_valor_hora);
  OTB_ESTADO.parametros.valor_hora = calcEq.valor_hora;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  renderizarAbaValorHoraEMoOTB();
  if (typeof showToast === 'function') {
    showToast('Equipe padrão restaurada (R$ 59,929/h)!', 'success');
  }
}

function filtrarBuscaMoOTB(termo) {
  OTB_ESTADO.busca_mo = termo;
  renderizarAbaValorHoraEMoOTB();
}

function filtrarGrupoMoOTB(grupo) {
  OTB_ESTADO.filtro_grupo_mo = grupo;
  renderizarAbaValorHoraEMoOTB();
}

function inserirTarefaMoDaAbaNoArtigo(moId) {
  if (!OTB_ESTADO.artigos || OTB_ESTADO.artigos.length === 0) {
    if (typeof showToast === 'function') showToast('Adicione ou crie ao menos 1 artigo sintético antes de inserir Mão-de-Obra!', 'warning');
    if (typeof switchTab === 'function') switchTab('tab-custos-otb');
    return;
  }
  // Abre o modal de MO já posicionado no primeiro artigo expandido (ou último artigo)
  const expandidos = Object.keys(OTB_ESTADO.artigos_expandidos).filter(k => OTB_ESTADO.artigos_expandidos[k]);
  const alvoIdx = expandidos.length > 0 ? parseInt(expandidos[0], 10) : (OTB_ESTADO.artigos.length - 1);
  abrirModalInserirMONoArtigo(alvoIdx);
  const itemMo = (BIBLIOTECAS_OTB.rendimentos_mo || []).find(r => r.id === moId);
  if (itemMo) {
    const inp = document.getElementById('otb-input-busca-modal-mo');
    if (inp) {
      inp.value = itemMo.tarefa;
      renderizarBuscaModalMO(itemMo.tarefa);
    }
  }
}

// =============================================================================
// 7. ABA NOTAS TÉCNICAS, CONDIÇÕES COMERCIAIS & MATRIZ DE RESPONSABILIDADES
// =============================================================================
function renderizarAbaNotasCondicoesMatrizOTB() {
  const container = document.getElementById('otb-conteudo-notas');
  if (!container) return;

  if (!Array.isArray(OTB_ESTADO.notas)) OTB_ESTADO.notas = clonarProfundo(NOTAS_PADRAO_COMERCIAIS);
  if (!OTB_ESTADO.condicoes_gerais) OTB_ESTADO.condicoes_gerais = clonarProfundo(CONDICOES_PADRAO_OTB);
  if (!Array.isArray(OTB_ESTADO.matriz_responsabilidades)) OTB_ESTADO.matriz_responsabilidades = clonarProfundo(MATRIZ_PADRAO_OTB);

  const cg = OTB_ESTADO.condicoes_gerais;
  const resumo = OTB_ESTADO.ultimo_resumo || recalcularPropostaCompleta(OTB_ESTADO.artigos, getConfigCalculoOTB());

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px;">
      <!-- Premissas e Notas Técnicas -->
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 15.5px; font-weight: 800; color: #0f172a; margin: 0;">📝 Notas Técnicas & Premissas da Proposta</h3>
            <p style="font-size: 11.5px; color: #64748b; margin-top: 2px;">Impressas integralmente no caderno oficial da Proposta Comercial A4.</p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sm btn-primary" onclick="adicionarNotaOTB()">+ Nova Nota</button>
            <button class="btn btn-sm btn-outline-dark" onclick="restaurarNotasPadraoOTB()">↺ Padrão OTB</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 430px; overflow-y: auto; padding-right: 4px;">
          ${OTB_ESTADO.notas.map((nota, idx) => `
            <div style="display: flex; gap: 8px; align-items: flex-start; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-weight: 800; font-size: 12px; color: #0284c7; min-width: 24px; padding-top: 5px;">${idx + 1}.</span>
              <textarea rows="2" onchange="editarNotaOTB(${idx}, this.value)"
                style="flex: 1; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-family: inherit; line-height: 1.4;">${escHtml(nota)}</textarea>
              <button class="btn btn-sm" onclick="removerNotaOTB(${idx})" style="background: #fee2e2; color: #991b1b; border: none; padding: 4px 7px;" title="Remover nota">✕</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Condições Gerais de Fornecimento & Pagamento -->
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px;">
        <h3 style="font-size: 15.5px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">⚖️ Condições Comerciais, Prazos & Faturamento</h3>

        <div style="display: grid; grid-template-columns: 1fr 120px; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-bottom: 3px;">Regime Contratual de Execução</label>
            <input type="text" value="${escHtml(cg.regime || '')}" onchange="atualizarCondicaoGeralOTB('regime', this.value)"
              style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12.5px; font-weight: 600;">
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-bottom: 3px;">Validade (dias)</label>
            <input type="number" min="1" value="${cg.validade_dias || 15}" onchange="atualizarCondicaoGeralOTB('validade_dias', this.value)"
              style="width: 100%; padding: 7px 10px; border: 1px solid #ca8a04; background: #fef9c3; border-radius: 6px; font-size: 12.5px; font-weight: 800; text-align: center;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 14px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div>
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b;">Prazo Estimado Obra</div>
            <div style="font-size: 14px; font-weight: 900; color: #0f172a; font-family: 'JetBrains Mono', monospace;">
              ${fmtNum2(resumo.planejamento.semanas_instalacao)} semanas (${resumo.planejamento.homens_instalacao} hom.)
            </div>
          </div>
          <div>
            <label style="font-size: 10.5px; font-weight: 700; color: #475569; display: block;">Retenção Contratual (%)</label>
            <input type="number" step="0.5" min="0" value="${cg.retencao_percentual !== undefined ? cg.retencao_percentual : 5}" onchange="atualizarCondicaoGeralOTB('retencao_percentual', this.value)"
              style="width: 90px; padding: 4px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 700;">
          </div>
          <div>
            <label style="font-size: 10.5px; font-weight: 700; color: #475569; display: block;">Liberação Retenção (dias)</label>
            <input type="number" step="5" min="0" value="${cg.retencao_prazo_dias !== undefined ? cg.retencao_prazo_dias : 90}" onchange="atualizarCondicaoGeralOTB('retencao_prazo_dias', this.value)"
              style="width: 90px; padding: 4px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 700;">
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="font-size: 12px; font-weight: 800; color: #334155;">Condições de Pagamento & Reajuste:</label>
          <button class="btn btn-sm btn-outline-dark" onclick="adicionarCondicaoPagamentoOTB()">+ Condição</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${(cg.condicoes_pagamento || []).map((cp, idx) => `
            <div style="display: flex; gap: 6px; align-items: center;">
              <input type="text" value="${escHtml(cp)}" onchange="editarCondicaoPagamentoOTB(${idx}, this.value)"
                style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 5px; font-size: 12px;">
              <button class="btn btn-sm" onclick="removerCondicaoPagamentoOTB(${idx})" style="background: #fee2e2; color: #991b1b; border: none; padding: 4px 7px;">✕</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Matriz Contratual de Responsabilidades -->
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h3 style="font-size: 15.5px; font-weight: 800; color: #0f172a; margin: 0;">🤝 Matriz de Responsabilidades (Omnitrade vs. Cliente)</h3>
          <p style="font-size: 12px; color: #64748b; margin-top: 2px;">Clique nas colunas OMNITRADE ou CLIENTE para alternar os encargos contratuais da obra.</p>
        </div>
        <button class="btn btn-sm btn-primary" onclick="adicionarLinhaMatrizRespOTB()">+ Adicionar Item na Matriz</button>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #0f172a; color: white; font-size: 11px;">
            <th style="padding: 8px 10px; width: 50px; text-align: center;">Item</th>
            <th style="padding: 8px 10px; text-align: left;">Escopo / Fornecimento / Encargo Operacional</th>
            <th style="padding: 8px 10px; width: 130px; text-align: center;">OMNITRADE</th>
            <th style="padding: 8px 10px; width: 130px; text-align: center;">CLIENTE</th>
            <th style="padding: 8px 8px; width: 50px;"></th>
          </tr>
        </thead>
        <tbody>
          ${OTB_ESTADO.matriz_responsabilidades.map((m, idx) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 10px; text-align: center; font-weight: 800; color: #64748b;">${idx + 1}</td>
              <td style="padding: 6px 10px;">
                <input type="text" value="${escHtml(m.descricao)}" onchange="editarTextoMatrizRespOTB(${idx}, this.value)"
                  style="width: 100%; padding: 5px 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 12px; font-weight: 600;">
              </td>
              <td style="padding: 6px 10px; text-align: center; cursor: pointer;" onclick="alternarMatrizRespOTB(${idx}, 'omnitrade')">
                <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-weight: 800; font-size: 11px; background: ${m.omnitrade ? '#dcfce7' : '#f1f5f9'}; color: ${m.omnitrade ? '#15803d' : '#94a3b8'};">
                  ${m.omnitrade ? '✓ INCLUSO' : '—'}
                </span>
              </td>
              <td style="padding: 6px 10px; text-align: center; cursor: pointer;" onclick="alternarMatrizRespOTB(${idx}, 'cliente')">
                <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-weight: 800; font-size: 11px; background: ${m.cliente ? '#dbeafe' : '#f1f5f9'}; color: ${m.cliente ? '#1d4ed8' : '#94a3b8'};">
                  ${m.cliente ? '✓ ENCARGO' : '—'}
                </span>
              </td>
              <td style="padding: 6px 8px; text-align: center;">
                <button class="btn btn-sm" onclick="removerLinhaMatrizRespOTB(${idx})" style="background: #fee2e2; color: #991b1b; border: none; padding: 3px 7px;">✕</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function adicionarNotaOTB() {
  OTB_ESTADO.notas.push('Nova premissa técnica / comercial...');
  salvarEstadoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
}

function editarNotaOTB(idx, texto) {
  OTB_ESTADO.notas[idx] = texto;
  salvarEstadoOTB();
}

function removerNotaOTB(idx) {
  OTB_ESTADO.notas.splice(idx, 1);
  salvarEstadoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
}

function restaurarNotasPadraoOTB() {
  if (BIBLIOTECAS_OTB && Array.isArray(BIBLIOTECAS_OTB.notas_padrao_otb) && BIBLIOTECAS_OTB.notas_padrao_otb.length > 0) {
    OTB_ESTADO.notas = clonarProfundo(BIBLIOTECAS_OTB.notas_padrao_otb);
  } else {
    OTB_ESTADO.notas = clonarProfundo(NOTAS_PADRAO_COMERCIAIS);
  }
  salvarEstadoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
  if (typeof showToast === 'function') showToast('Notas técnicas padrão OTB carregadas!', 'success');
}

function atualizarCondicaoGeralOTB(campo, valor) {
  if (!OTB_ESTADO.condicoes_gerais) OTB_ESTADO.condicoes_gerais = clonarProfundo(CONDICOES_PADRAO_OTB);
  if (campo === 'validade_dias' || campo === 'retencao_percentual' || campo === 'retencao_prazo_dias') {
    OTB_ESTADO.condicoes_gerais[campo] = parseFloat(valor) || 0;
  } else {
    OTB_ESTADO.condicoes_gerais[campo] = valor;
  }
  salvarEstadoOTB();
}

function adicionarCondicaoPagamentoOTB() {
  if (!OTB_ESTADO.condicoes_gerais.condicoes_pagamento) OTB_ESTADO.condicoes_gerais.condicoes_pagamento = [];
  OTB_ESTADO.condicoes_gerais.condicoes_pagamento.push('Nova condição de faturamento / medição...');
  salvarEstadoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
}

function editarCondicaoPagamentoOTB(idx, valor) {
  OTB_ESTADO.condicoes_gerais.condicoes_pagamento[idx] = valor;
  salvarEstadoOTB();
}

function removerCondicaoPagamentoOTB(idx) {
  OTB_ESTADO.condicoes_gerais.condicoes_pagamento.splice(idx, 1);
  salvarEstadoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
}

function alternarMatrizRespOTB(idx, chave) {
  const item = OTB_ESTADO.matriz_responsabilidades[idx];
  if (!item) return;
  item[chave] = !item[chave];
  if (item[chave]) {
    const outra = chave === 'omnitrade' ? 'cliente' : 'omnitrade';
    item[outra] = false;
  }
  salvarEstadoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
}

function editarTextoMatrizRespOTB(idx, valor) {
  if (!OTB_ESTADO.matriz_responsabilidades[idx]) return;
  OTB_ESTADO.matriz_responsabilidades[idx].descricao = valor;
  salvarEstadoOTB();
}

function adicionarLinhaMatrizRespOTB() {
  OTB_ESTADO.matriz_responsabilidades.push({
    item: OTB_ESTADO.matriz_responsabilidades.length + 1,
    descricao: 'Novo item de escopo operacional...',
    omnitrade: true,
    cliente: false
  });
  salvarEstadoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
}

function removerLinhaMatrizRespOTB(idx) {
  OTB_ESTADO.matriz_responsabilidades.splice(idx, 1);
  salvarEstadoOTB();
  renderizarAbaNotasCondicoesMatrizOTB();
}

// =============================================================================
// 8. MODAIS DE COMPOSIÇÃO (CATÁLOGO 37 + BASE 68, MATERIAIS, MO, EQUIPAMENTOS)
// =============================================================================
function abrirModalCatalogoArtigos(abaInicial) {
  OTB_ESTADO.modal_aba_catalogo = abaInicial || 'modelo37';
  OTB_ESTADO.modal_busca_artigos = '';
  const modal = document.getElementById('otb-modal-artigos');
  if (!modal) return;
  modal.style.display = 'flex';
  const inp = document.getElementById('otb-busca-modal-artigos');
  if (inp) inp.value = '';
  atualizarBotoesAbaModalArtigos();
  renderizarListaModalArtigos('');
}

function fecharModalCatalogoArtigos() {
  const modal = document.getElementById('otb-modal-artigos');
  if (modal) modal.style.display = 'none';
}

function alternarAbaModalArtigos(aba) {
  OTB_ESTADO.modal_aba_catalogo = aba;
  atualizarBotoesAbaModalArtigos();
  const inp = document.getElementById('otb-busca-modal-artigos');
  renderizarListaModalArtigos(inp ? inp.value : '');
}

function atualizarBotoesAbaModalArtigos() {
  const b1 = document.getElementById('btn-aba-modelo37');
  const b2 = document.getElementById('btn-aba-base68');
  if (b1) {
    b1.className = OTB_ESTADO.modal_aba_catalogo === 'modelo37' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-dark';
  }
  if (b2) {
    b2.className = OTB_ESTADO.modal_aba_catalogo === 'base68' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-dark';
  }
}

function renderizarListaModalArtigos(busca) {
  OTB_ESTADO.modal_busca_artigos = busca || '';
  const termo = OTB_ESTADO.modal_busca_artigos.toLowerCase().trim();
  const listaEl = document.getElementById('otb-lista-modal-artigos');
  if (!listaEl) return;

  if (OTB_ESTADO.modal_aba_catalogo === 'modelo37') {
    const itens = (ARTIGOS_CATALOGO_OTB || []).map((a, idx) => ({ a, idx })).filter(({ a }) => {
      if (!termo) return true;
      return (a.artigo || '').toLowerCase().includes(termo) ||
        (a.descricao || '').toLowerCase().includes(termo) ||
        (a.secao_titulo || '').toLowerCase().includes(termo);
    });

    listaEl.innerHTML = itens.length === 0
      ? `<div style="padding: 28px; text-align: center; color: #94a3b8;">Nenhum artigo encontrado no Modelo OTB.</div>`
      : itens.map(({ a, idx }) => `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; background: #fff;">
          <div style="flex: 1;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
              <span style="background: #fef08a; color: #713f12; padding: 2px 8px; border-radius: 4px; font-weight: 900; font-family: 'JetBrains Mono', monospace; font-size: 12px;">${escHtml(a.artigo)}</span>
              <span style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase;">${escHtml(a.secao_titulo || 'GERAL')}</span>
              <span style="font-size: 11px; color: #64748b;">• Unid: <strong>${escHtml(a.unidade)}</strong> • ${(a.itens_analiticos || []).length} analíticos</span>
            </div>
            <div style="font-size: 12px; color: #1e293b; white-space: pre-line; max-height: 68px; overflow: hidden;">${escHtml((a.descricao || '').split('\n').slice(0, 4).join('\n'))}</div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="adicionarArtigoCatalogoOTB(${idx})" style="white-space: nowrap; font-weight: 800;">
            + Incluir Artigo
          </button>
        </div>
      `).join('');
  } else {
    const baseList = (BIBLIOTECAS_OTB && BIBLIOTECAS_OTB.catalogo_base) || [];
    const itens = baseList.filter(b => {
      if (!termo) return true;
      return (b.grupo || '').toLowerCase().includes(termo) ||
        (b.descricao || '').toLowerCase().includes(termo) ||
        (b.artigo_sugerido || '').toLowerCase().includes(termo);
    });

    listaEl.innerHTML = itens.length === 0
      ? `<div style="padding: 28px; text-align: center; color: #94a3b8;">Nenhum template encontrado na biblioteca BASE.</div>`
      : itens.map(b => `
        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; background: #f8fafc;">
          <div style="flex: 1;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
              <span style="background: #ccfbf1; color: #115e59; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 11px;">${escHtml(b.grupo || 'SERVIÇO BASE')}</span>
              <span style="font-size: 11px; color: #475569;">Unid: <strong>${escHtml(b.unidade || 'm2')}</strong> • ${(b.itens_analiticos || []).length} insumos pré-cadastrados</span>
            </div>
            <div style="font-size: 12px; color: #0f172a; white-space: pre-line; max-height: 68px; overflow: hidden;">${escHtml((b.descricao || '').split('\n').slice(0, 4).join('\n'))}</div>
          </div>
          <button class="btn btn-sm" onclick="adicionarTemplateBaseOTB('${escHtml(b.id)}')" style="background: #0f766e; color: white; border: none; white-space: nowrap; font-weight: 800;">
            + Usar Template
          </button>
        </div>
      `).join('');
  }
}

function adicionarArtigoCatalogoOTB(catIdx) {
  const modelo = ARTIGOS_CATALOGO_OTB[catIdx];
  if (!modelo) return;
  const novo = clonarProfundo(modelo);
  OTB_ESTADO.artigos.push(novo);
  const novoIdx = OTB_ESTADO.artigos.length - 1;
  OTB_ESTADO.artigos_expandidos[novoIdx] = true;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  fecharModalCatalogoArtigos();
  if (typeof showToast === 'function') showToast(`Artigo ${novo.artigo} adicionado à proposta!`, 'success');
}

function adicionarTemplateBaseOTB(baseId) {
  const baseList = (BIBLIOTECAS_OTB && BIBLIOTECAS_OTB.catalogo_base) || [];
  const tpl = baseList.find(b => b.id === baseId);
  if (!tpl) return;

  const proxNum = OTB_ESTADO.artigos.length + 1;
  const cod = (tpl.artigo_sugerido && tpl.artigo_sugerido !== '0' && tpl.artigo_sugerido !== '-')
    ? tpl.artigo_sugerido
    : `1.${proxNum}`;

  const novoArtigo = {
    artigo: cod,
    secao_codigo: String(proxNum),
    secao_titulo: tpl.grupo || 'SISTEMAS DE COBERTURA & IMPERMEABILIZAÇÃO',
    descricao: tpl.descricao || 'Serviço conforme especificação técnica OTB',
    unidade: tpl.unidade || 'm2',
    quantidade: tpl.quantidade || 1,
    incluso: false,
    itens_analiticos: clonarProfundo(tpl.itens_analiticos || [])
  };

  OTB_ESTADO.artigos.push(novoArtigo);
  const novoIdx = OTB_ESTADO.artigos.length - 1;
  OTB_ESTADO.artigos_expandidos[novoIdx] = true;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  fecharModalCatalogoArtigos();
  if (typeof showToast === 'function') showToast(`Template BASE "${tpl.grupo}" adicionado como Artigo ${cod}!`, 'success');
}

function criarArtigoPersonalizadoOTB() {
  const proxNum = OTB_ESTADO.artigos.length + 1;
  const novoArtigo = {
    artigo: `${proxNum}.1`,
    secao_codigo: String(proxNum),
    secao_titulo: 'SERVIÇOS ESPECIAIS / COMPLEMENTARES',
    descricao: 'NOVO SERVIÇO SINTÉTICO:\n- Descreva o escopo técnico de materiais e instalação aqui.',
    unidade: 'ud',
    quantidade: 1,
    incluso: false,
    itens_analiticos: [
      {
        categoria: 'Taxas',
        tipo_custo: 'ferr.cons',
        descricao: 'equipamentos',
        unidade: 'vg',
        quantidade: 1,
        preco_unitario: 0,
        custo_total: 0,
        auto_taxa_mo: true
      },
      {
        categoria: 'Taxas',
        tipo_custo: 'ci',
        descricao: 'Custos indirectos',
        unidade: 'vg',
        quantidade: 1,
        preco_unitario: 0,
        custo_total: 0,
        auto_taxa_mo: true
      }
    ]
  };

  OTB_ESTADO.artigos.push(novoArtigo);
  const novoIdx = OTB_ESTADO.artigos.length - 1;
  OTB_ESTADO.artigos_expandidos[novoIdx] = true;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  if (typeof showToast === 'function') showToast(`Novo artigo sintético ${novoArtigo.artigo} criado e aberto para edição!`, 'success');
}

// --- Modal Inserir Material em Artigo ---
function abrirModalInserirMaterialNoArtigo(artIdx) {
  OTB_ESTADO.artigo_alvo_modal = artIdx;
  const modal = document.getElementById('otb-modal-inserir-material');
  if (!modal) return;
  const art = OTB_ESTADO.artigos[artIdx];
  const lbl = document.getElementById('otb-lbl-artigo-alvo-mat');
  if (lbl && art) lbl.textContent = `Artigo ${art.artigo} (${art.unidade})`;
  modal.style.display = 'flex';
  const inp = document.getElementById('otb-input-busca-modal-mat');
  if (inp) inp.value = '';
  renderizarBuscaModalMateriais('');
}

function fecharModalInserirMaterial() {
  const modal = document.getElementById('otb-modal-inserir-material');
  if (modal) modal.style.display = 'none';
}

function renderizarBuscaModalMateriais(termo) {
  const listaEl = document.getElementById('otb-lista-modal-mat');
  if (!listaEl) return;
  const b = (termo || '').toLowerCase().trim();
  const itens = OTB_CATALOGO_MATERIAIS.filter(m => {
    if (!b) return true;
    return (m.especificacao && m.especificacao.toLowerCase().includes(b)) ||
      (m.codigo && m.codigo.toLowerCase().includes(b)) ||
      (m.grupo && m.grupo.toLowerCase().includes(b));
  }).slice(0, 60);

  listaEl.innerHTML = itens.length === 0
    ? `<div style="padding: 24px; text-align: center; color: #94a3b8;">Nenhum material encontrado.</div>`
    : itens.map(m => `
      <div style="border-bottom: 1px solid #e2e8f0; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
        <div style="flex: 1;">
          <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${escHtml(m.especificacao)}</div>
          <div style="font-size: 10.5px; color: #64748b;">
            Cód: <strong>${escHtml(m.codigo || '-')}</strong> • Grupo: ${escHtml(m.grupo || '-')} • Unid: <strong>${escHtml(m.unidade)}</strong> • Custo Líquido: <strong style="color:#047857;">${fmtMoeda3(m.preco_custo)}</strong>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="confirmarInsercaoMaterial('${escHtml(m.id)}')" style="font-weight: 800; white-space: nowrap;">
          + Inserir
        </button>
      </div>
    `).join('');
}

function confirmarInsercaoMaterial(matId) {
  const artIdx = OTB_ESTADO.artigo_alvo_modal;
  const art = OTB_ESTADO.artigos[artIdx];
  const mat = OTB_CATALOGO_MATERIAIS.find(m => m.id === matId);
  if (!art || !mat) return;

  const qtdEl = document.getElementById('otb-modal-mat-qtd');
  const tcEl = document.getElementById('otb-modal-mat-tc');
  const qtd = Math.max(0.0001, parseFloat(qtdEl ? qtdEl.value : 1) || 1);
  const tc = (tcEl && tcEl.value) || 'mat.ns';

  art.itens_analiticos = art.itens_analiticos || [];
  art.itens_analiticos.push({
    categoria: 'Materiais',
    tipo_custo: tc,
    descricao: mat.especificacao,
    unidade: mat.unidade || 'ud',
    quantidade: qtd,
    preco_unitario: mat.preco_custo || 0,
    custo_total: qtd * (mat.preco_custo || 0),
    codigo_material: mat.codigo || '',
    auto_taxa_mo: false
  });

  OTB_ESTADO.artigos_expandidos[artIdx] = true;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  fecharModalInserirMaterial();
  if (typeof showToast === 'function') showToast(`Material inserido no Artigo ${art.artigo} (${tc})!`, 'success');
}

function inserirMaterialNoArtigoAtivo(matId) {
  if (!OTB_ESTADO.artigos || OTB_ESTADO.artigos.length === 0) {
    if (typeof showToast === 'function') showToast('Adicione ou crie primeiro um artigo sintético na aba Proposta & Custos!', 'warning');
    if (typeof switchTab === 'function') switchTab('tab-custos-otb');
    return;
  }
  const expandidos = Object.keys(OTB_ESTADO.artigos_expandidos).filter(k => OTB_ESTADO.artigos_expandidos[k]);
  const alvoIdx = expandidos.length > 0 ? parseInt(expandidos[0], 10) : (OTB_ESTADO.artigos.length - 1);
  OTB_ESTADO.artigo_alvo_modal = alvoIdx;
  confirmarInsercaoMaterial(matId);
}

// --- Modal Inserir Mão de Obra (MO) em Artigo ---
function abrirModalInserirMONoArtigo(artIdx) {
  OTB_ESTADO.artigo_alvo_modal = artIdx;
  const modal = document.getElementById('otb-modal-inserir-mo');
  if (!modal) return;
  const art = OTB_ESTADO.artigos[artIdx];
  const lbl = document.getElementById('otb-lbl-artigo-alvo-mo');
  if (lbl && art) lbl.textContent = `Artigo ${art.artigo} (${art.unidade})`;
  modal.style.display = 'flex';
  const inp = document.getElementById('otb-input-busca-modal-mo');
  if (inp) inp.value = '';
  renderizarBuscaModalMO('');
}

function fecharModalInserirMO() {
  const modal = document.getElementById('otb-modal-inserir-mo');
  if (modal) modal.style.display = 'none';
}

function renderizarBuscaModalMO(termo) {
  const listaEl = document.getElementById('otb-lista-modal-mo');
  if (!listaEl) return;
  const calcEq = calcularValorHoraEquipe(OTB_ESTADO.equipe_valor_hora);
  const red = calcEq.red_rendimento;
  const vh = OTB_ESTADO.parametros.valor_hora || 59.929386;

  const b = (termo || '').toLowerCase().trim();
  const todos = (BIBLIOTECAS_OTB && BIBLIOTECAS_OTB.rendimentos_mo) || [];
  const itens = todos.filter(r => {
    if (!b) return true;
    return (r.tarefa && r.tarefa.toLowerCase().includes(b)) ||
      (r.grupo && r.grupo.toLowerCase().includes(b)) ||
      (r.subgrupo && r.subgrupo.toLowerCase().includes(b));
  });

  listaEl.innerHTML = itens.length === 0
    ? `<div style="padding: 24px; text-align: center; color: #94a3b8;">Nenhuma tarefa de MO encontrada.</div>`
    : itens.map(r => {
      const hAjust = (r.horas_base || 0) * (1.0 + red);
      return `
        <div style="border-bottom: 1px solid #e2e8f0; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
          <div style="flex: 1;">
            <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${escHtml(r.tarefa)}</div>
            <div style="font-size: 10.5px; color: #64748b;">
              ${escHtml(r.grupo)} • Un.Ref: <strong>${escHtml(r.unidade_ref)}</strong> • Coef. Ajustado: <strong style="color:#c2410c;">${hAjust.toFixed(4)} h</strong> • Custo: <strong style="color:#047857;">${fmtMoeda3(hAjust * vh)}</strong>
            </div>
          </div>
          <button class="btn btn-sm" onclick="confirmarInsercaoMO('${escHtml(r.id)}')" style="background: #ea580c; color: white; border: none; font-weight: 800; white-space: nowrap;">
            + Inserir MO
          </button>
        </div>
      `;
    }).join('');
}

function confirmarInsercaoMO(moId) {
  const artIdx = OTB_ESTADO.artigo_alvo_modal;
  const art = OTB_ESTADO.artigos[artIdx];
  const r = ((BIBLIOTECAS_OTB && BIBLIOTECAS_OTB.rendimentos_mo) || []).find(x => x.id === moId);
  if (!art || !r) return;

  const calcEq = calcularValorHoraEquipe(OTB_ESTADO.equipe_valor_hora);
  const multEl = document.getElementById('otb-modal-mo-mult');
  const tcEl = document.getElementById('otb-modal-mo-tc');
  const mult = Math.max(0.0001, parseFloat(multEl ? multEl.value : 1) || 1);
  const tc = (tcEl && tcEl.value) || 'mo.inst';

  const horasCoef = (r.horas_base || 0) * (1.0 + calcEq.red_rendimento) * mult;
  const vh = OTB_ESTADO.parametros.valor_hora || 59.929386;

  art.itens_analiticos = art.itens_analiticos || [];
  art.itens_analiticos.push({
    categoria: 'MO',
    tipo_custo: tc,
    descricao: r.tarefa,
    unidade: 'h',
    quantidade: Number(horasCoef.toFixed(5)),
    preco_unitario: vh,
    custo_total: horasCoef * vh,
    auto_taxa_mo: false
  });

  // Garante presença das taxas automáticas ferr.cons e ci quando há MO no artigo
  const temFerr = art.itens_analiticos.some(i => i.tipo_custo === 'ferr.cons');
  const temCi = art.itens_analiticos.some(i => i.tipo_custo === 'ci');
  if (!temFerr) {
    art.itens_analiticos.push({ categoria: 'Taxas', tipo_custo: 'ferr.cons', descricao: 'equipamentos', unidade: 'vg', quantidade: 1, preco_unitario: 0, custo_total: 0, auto_taxa_mo: true });
  }
  if (!temCi) {
    art.itens_analiticos.push({ categoria: 'Taxas', tipo_custo: 'ci', descricao: 'Custos indirectos', unidade: 'vg', quantidade: 1, preco_unitario: 0, custo_total: 0, auto_taxa_mo: true });
  }

  OTB_ESTADO.artigos_expandidos[artIdx] = true;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  fecharModalInserirMO();
  if (typeof showToast === 'function') showToast(`Tarefa "${r.tarefa}" adicionada ao Artigo ${art.artigo}!`, 'success');
}

// --- Modal Inserir Equipamento / Canteiro / Transporte em Artigo ---
function abrirModalInserirEquipamentoNoArtigo(artIdx) {
  OTB_ESTADO.artigo_alvo_modal = artIdx;
  const modal = document.getElementById('otb-modal-inserir-equipamento');
  if (!modal) return;
  const art = OTB_ESTADO.artigos[artIdx];
  const lbl = document.getElementById('otb-lbl-artigo-alvo-eq');
  if (lbl && art) lbl.textContent = `Artigo ${art.artigo} (${art.unidade})`;
  modal.style.display = 'flex';
  const inp = document.getElementById('otb-input-busca-modal-eq');
  if (inp) inp.value = '';
  renderizarBuscaModalEquipamentos('');
}

function fecharModalInserirEquipamento() {
  const modal = document.getElementById('otb-modal-inserir-equipamento');
  if (modal) modal.style.display = 'none';
}

function renderizarBuscaModalEquipamentos(termo) {
  const listaEl = document.getElementById('otb-lista-modal-eq');
  if (!listaEl) return;
  const b = (termo || '').toLowerCase().trim();

  const eqs = ((BIBLIOTECAS_OTB && BIBLIOTECAS_OTB.equipamentos_canteiro) || []).map((e, i) => ({
    fonte: 'eq',
    idx: i,
    categoria: e.categoria || inferirCategoriaPorTipoCusto(e.tipo_custo),
    tipo_custo: e.tipo_custo || 'me',
    descricao: e.descricao,
    unidade: e.unidade || 'Mês',
    preco: e.preco_unitario || 0
  }));

  const transps = ((BIBLIOTECAS_OTB && BIBLIOTECAS_OTB.transportes) || []).map((t, i) => ({
    fonte: 'tr',
    idx: i,
    categoria: 'Transportes',
    tipo_custo: 'tr',
    descricao: t.rota,
    unidade: 'vg',
    preco: t.valor || 0
  }));

  const combinados = eqs.concat(transps).filter(x => {
    if (!b) return true;
    return (x.descricao && x.descricao.toLowerCase().includes(b)) ||
      (x.categoria && x.categoria.toLowerCase().includes(b)) ||
      (x.tipo_custo && x.tipo_custo.toLowerCase().includes(b));
  });

  listaEl.innerHTML = combinados.map(x => `
    <div style="border-bottom: 1px solid #e2e8f0; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
      <div style="flex: 1;">
        <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${escHtml(x.descricao)}</div>
        <div style="font-size: 10.5px; color: #64748b;">
          Categoria: <strong>${escHtml(x.categoria)}</strong> • Tipo Imposto: <code>${escHtml(x.tipo_custo)}</code> • Unid: <strong>${escHtml(x.unidade)}</strong> • Custo Ref: <strong style="color:#047857;">${fmtMoeda2(x.preco)}</strong>
        </div>
      </div>
      <button class="btn btn-sm" onclick="confirmarInsercaoEquipamento('${x.fonte}', ${x.idx})" style="background: #0284c7; color: white; border: none; font-weight: 800; white-space: nowrap;">
        + Inserir
      </button>
    </div>
  `).join('');
}

function confirmarInsercaoEquipamento(fonte, idxItem) {
  const artIdx = OTB_ESTADO.artigo_alvo_modal;
  const art = OTB_ESTADO.artigos[artIdx];
  if (!art) return;

  const qtdEl = document.getElementById('otb-modal-eq-qtd');
  const qtd = Math.max(0.01, parseFloat(qtdEl ? qtdEl.value : 1) || 1);

  let novoAnalitico = null;
  if (fonte === 'eq') {
    const e = BIBLIOTECAS_OTB.equipamentos_canteiro[idxItem];
    if (!e) return;
    novoAnalitico = {
      categoria: e.categoria || inferirCategoriaPorTipoCusto(e.tipo_custo),
      tipo_custo: e.tipo_custo || 'me',
      descricao: e.descricao,
      unidade: e.unidade || 'Mês',
      quantidade: qtd,
      preco_unitario: e.preco_unitario || 0,
      custo_total: qtd * (e.preco_unitario || 0),
      auto_taxa_mo: false
    };
  } else {
    const t = BIBLIOTECAS_OTB.transportes[idxItem];
    if (!t) return;
    novoAnalitico = {
      categoria: 'Transportes',
      tipo_custo: 'tr',
      descricao: t.rota,
      unidade: 'un',
      quantidade: qtd,
      preco_unitario: t.valor || 0,
      custo_total: qtd * (t.valor || 0),
      auto_taxa_mo: false
    };
  }

  art.itens_analiticos = art.itens_analiticos || [];
  art.itens_analiticos.push(novoAnalitico);
  OTB_ESTADO.artigos_expandidos[artIdx] = true;
  salvarEstadoOTB();
  recalcularERenderizarTudoOTB();
  fecharModalInserirEquipamento();
  if (typeof showToast === 'function') showToast(`Item "${novoAnalitico.descricao}" inserido no Artigo ${art.artigo}!`, 'success');
}

// --- Modal Cadastrar Novo Material no Catálogo OTB ---
function abrirModalNovoMaterialOTB() {
  const modal = document.getElementById('otb-modal-novo-material');
  if (!modal) return;
  modal.style.display = 'flex';
}

function fecharModalNovoMaterialOTB() {
  const modal = document.getElementById('otb-modal-novo-material');
  if (modal) modal.style.display = 'none';
}

function salvarNovoMaterialModalOTB() {
  const getV = id => (document.getElementById(id) ? document.getElementById(id).value.trim() : '');
  const espec = getV('otb-novo-mat-espec');
  if (!espec) {
    if (typeof showToast === 'function') showToast('Informe a especificação técnica do material!', 'error');
    return;
  }

  const codigo = getV('otb-novo-mat-cod') || `OTB-${OTB_CATALOGO_MATERIAIS.length + 1}`;
  const ncm = getV('otb-novo-mat-ncm');
  const grupo = getV('otb-novo-mat-grupo') || 'DIVERSOS / PERSONALIZADOS';
  const unidade = getV('otb-novo-mat-un') || 'ud';
  const precoNf = Math.max(0, parseFloat(getV('otb-novo-mat-preco')) || 0);
  const localCompra = getV('otb-novo-mat-origem') || 'São Paulo';

  const locaisCompra = (OTB_ESTADO.impostos_custom && OTB_ESTADO.impostos_custom.locais_compra_icms) || IMPOSTOS_OTB.locais_compra_icms;
  const cred = locaisCompra[localCompra] !== undefined ? locaisCompra[localCompra] : 0.18;
  const precoCusto = precoNf * (1.0 - cred);

  const novoMat = {
    id: 'mat_custom_' + Date.now(),
    grupo: grupo,
    ncm: ncm,
    codigo: codigo,
    especificacao: espec,
    unidade: unidade,
    preco_compra: precoNf,
    local_compra: localCompra,
    aliquota_credito_icms: cred,
    preco_custo: precoCusto
  };

  OTB_CATALOGO_MATERIAIS.unshift(novoMat);
  salvarCatalogoMateriaisOTB();
  fecharModalNovoMaterialOTB();
  renderizarTabelaMateriaisOTB();
  if (typeof showToast === 'function') showToast(`Material "${espec}" cadastrado na Tabela OTB!`, 'success');
}

// =============================================================================
// 9. RENDERIZADOR DINÂMICO DE PÁGINAS A4 OFICIAIS (ABA PROPOSTA COMERCIAL / PDF)
// =============================================================================
function renderizarCabecalhoPaginaA4(ref, dataEmissao) {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #003366; padding-bottom: 8px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="/assets/omnitrade.ico" alt="Omnitrade" style="width: 30px; height: 30px; object-fit: contain;" onerror="this.style.display='none'">
        <div>
          <div style="font-size: 15px; font-weight: 900; color: #003366; letter-spacing: 0.04em;">OMNITRADE BRASIL</div>
          <div style="font-size: 8.5px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em;">Engenharia de Impermeabilização, Coberturas & Fachadas</div>
        </div>
      </div>
      <div style="text-align: right; font-size: 9.5px; color: #334155;">
        <div><strong>PROPOSTA TÉCNICA COMERCIAL:</strong> <span style="font-family: 'JetBrains Mono', monospace; color: #003366; font-weight: 800;">${escHtml(ref)}</span></div>
        <div>Data de Emissão: ${escHtml(dataEmissao)} • Rev. ${escHtml(OTB_ESTADO.versao || '1.0')}</div>
      </div>
    </div>
  `;
}

function renderizarRodapePaginaA4(numPag, totalPag) {
  return `
    <div style="margin-top: auto; border-top: 1px solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8.5px; color: #64748b;">
      <span>Omnitrade Brasil Serviços e Soluções da Construção Ltda. • Tel: +55 (11) 4561-3992</span>
      <span>Ref: ${escHtml(OTB_ESTADO.referencia)} • Página ${numPag} de ${totalPag}</span>
    </div>
  `;
}

function renderizarPropostaOficialA4OTB() {
  const container = document.getElementById('container-todas-as-13-paginas');
  if (!container) return;

  const resumo = OTB_ESTADO.ultimo_resumo || recalcularPropostaCompleta(OTB_ESTADO.artigos, getConfigCalculoOTB());
  const t = resumo.totais;
  const p = resumo.planejamento;
  const d = resumo.desdobramento;
  const artigos = OTB_ESTADO.artigos || [];
  const uf = (OTB_ESTADO.cliente && OTB_ESTADO.cliente.uf) || 'RJ';
  const isContrib = !!(OTB_ESTADO.cliente && OTB_ESTADO.cliente.contribuinte_icms);

  // Paginação inteligente dos artigos sintéticos para caber perfeitamente em folhas A4
  const paginasItens = [];
  if (artigos.length === 0) {
    paginasItens.push([]);
  } else {
    let buffer = [];
    let pesoAtual = 0;
    const LIMITE_PESO_PAGINA = 34; // unidades equivalentes de linhas por folha A4
    let ultimaSecao = null;

    artigos.forEach(art => {
      const linhasDesc = Math.max(2, Math.ceil((art.descricao || '').split('\n').length * 1.15) + Math.ceil((art.descricao || '').length / 95));
      const pesoSecao = (art.secao_titulo !== ultimaSecao) ? 2.2 : 0;
      const pesoItem = Math.min(18, Math.max(3, Math.ceil(linhasDesc * 0.55))) + pesoSecao;

      if (buffer.length > 0 && (pesoAtual + pesoItem) > LIMITE_PESO_PAGINA) {
        paginasItens.push(buffer);
        buffer = [];
        pesoAtual = 0;
        ultimaSecao = null;
      }
      buffer.push(art);
      pesoAtual += pesoItem;
      ultimaSecao = art.secao_titulo;
    });
    if (buffer.length > 0) paginasItens.push(buffer);
  }

  // Quadro Resumo de Faturamento por Tipo de Nota (Aba Proposta da Planilha OTB)
  const vendaNotaVendaMat = (d['mat.nac.nv'] ? d['mat.nac.nv'].venda : 0) + (d['mat.imp.nv'] ? d['mat.imp.nv'].venda : 0);
  const vendaFatDireto = d['mat.fd'] ? d['mat.fd'].venda : 0;
  const vendaProjeto = d['proj'] ? d['proj'].venda : 0;
  const vendaNotaMistaServ = Math.max(0, t.venda_proposta_sem_incluso - vendaNotaVendaMat - vendaFatDireto - vendaProjeto);

  const paginasHtmlCorpo = [];

  // 1) CAPA E CARTA DE APRESENTAÇÃO
  paginasHtmlCorpo.push({
    idAncora: 'a4-pag-capa',
    conteudo: `
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="background: linear-gradient(135deg, #002b5c 0%, #004b87 100%); color: white; padding: 26px 24px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #7dd3fc; margin-bottom: 6px;">
              PROPOSTA TÉCNICA & COMERCIAL DE ENGENHARIA
            </div>
            <h1 style="font-size: 21px; font-weight: 900; margin: 0 0 8px 0; line-height: 1.25;">
              ${escHtml(OTB_ESTADO.obra.nome || 'PROPOSTA TÉCNICA OMNITRADE')}
            </h1>
            <div style="font-size: 12px; color: #e0f2fe; font-weight: 600;">
              ${escHtml(OTB_ESTADO.obra.objeto || 'Sistemas de Cobertura, Impermeabilização e Serviços Complementares')}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
            <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 14px; background: #f8fafc;">
              <div style="font-size: 9.5px; font-weight: 800; color: #003366; text-transform: uppercase; margin-bottom: 6px;">Dados do Cliente & Enquadramento Fiscal</div>
              <div style="font-size: 11px; line-height: 1.55; color: #1e293b;">
                <div><strong>Cliente:</strong> ${escHtml(OTB_ESTADO.cliente.nome || '-')}</div>
                <div><strong>A/C:</strong> ${escHtml(OTB_ESTADO.cliente.contato || '-')}</div>
                <div><strong>Local da Obra:</strong> ${escHtml(OTB_ESTADO.obra.local || '-')} (${escHtml(uf)})</div>
                <div><strong>Status ICMS:</strong> ${isContrib ? 'Contribuinte ICMS (SIM)' : 'Não Contribuinte ICMS (NÃO)'}</div>
              </div>
            </div>

            <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 14px; background: #f8fafc;">
              <div style="font-size: 9.5px; font-weight: 800; color: #003366; text-transform: uppercase; margin-bottom: 6px;">Coordenação Comercial Omnitrade</div>
              <div style="font-size: 11px; line-height: 1.55; color: #1e293b;">
                <div><strong>Responsável:</strong> ${escHtml(OTB_ESTADO.comercial.responsavel || '-')}</div>
                <div><strong>E-mail:</strong> ${escHtml(OTB_ESTADO.comercial.email || '-')}</div>
                <div><strong>Celular:</strong> ${escHtml(OTB_ESTADO.comercial.celular || '-')}</div>
                <div><strong>Telefone Fixo:</strong> ${escHtml(OTB_ESTADO.comercial.telefone || '+55 (11) 4561-3992')}</div>
              </div>
            </div>
          </div>

          <div style="font-size: 11.5px; line-height: 1.65; color: #1e293b; text-align: justify; padding: 4px 2px;">
            <p style="margin-bottom: 10px;">Prezados Senhores,</p>
            <p style="margin-bottom: 10px;">
              A <strong>OMNITRADE BRASIL</strong> agradece o convite e submete à apreciação de V.Sas. sua Proposta Técnica e Comercial <strong>${escHtml(OTB_ESTADO.referencia)}</strong> referente ao empreendimento <strong>${escHtml(OTB_ESTADO.obra.nome)}</strong>, localizado em <strong>${escHtml(OTB_ESTADO.obra.local)}</strong>.
            </p>
            <p style="margin-bottom: 10px;">
              Nossas soluções seguem rigorosamente as normas técnicas nacionais e internacionais aplicáveis aos sistemas de impermeabilização termoplástica, isolamento termoacústico, coberturas metálicas e sistemas periféricos de estanqueidade e segurança em altura.
            </p>
          </div>
        </div>

        <div style="background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #0369a1; text-transform: uppercase;">Valor Global da Proposta Comercial (${artigos.length} artigos)</div>
            <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
              Prazo estimado de instalação: <strong>${fmtNum2(p.semanas_instalacao)} semanas</strong> • Validade: <strong>${(OTB_ESTADO.condicoes_gerais && OTB_ESTADO.condicoes_gerais.validade_dias) || 15} dias</strong>
            </div>
          </div>
          <div style="font-size: 20px; font-weight: 900; color: #003366; font-family: 'JetBrains Mono', monospace;">
            ${fmtMoeda2(t.venda_proposta_sem_incluso)}
          </div>
        </div>
      </div>
    `
  });

  // 2) PÁGINAS DA PLANILHA DE PREÇOS SINTÉTICA + QUADRO RESUMO DE NOTAS FISCAIS
  let secAnteriorGlobal = null;
  paginasItens.forEach((lote, idxLote) => {
    const ehUltimaPagItens = (idxLote === paginasItens.length - 1);

    let linhasTabela = '';
    if (lote.length === 0) {
      linhasTabela = `
        <tr>
          <td colspan="6" style="padding: 34px 12px; text-align: center; color: #64748b; font-size: 11px;">
            Orçamento iniciado zerado (R$ 0,00) — Nenhum artigo sintético inserido até o momento.
          </td>
        </tr>
      `;
    } else {
      lote.forEach(art => {
        const secTit = art.secao_titulo || 'GERAL';
        if (secTit !== secAnteriorGlobal) {
          secAnteriorGlobal = secTit;
          linhasTabela += `
            <tr style="background: #e2e8f0;">
              <td style="padding: 5px 6px; font-weight: 900; font-size: 9.5px; color: #003366;">${escHtml(art.secao_codigo || '')}</td>
              <td colspan="5" style="padding: 5px 8px; font-weight: 900; font-size: 9.5px; color: #003366; text-transform: uppercase; letter-spacing: 0.03em;">
                ${escHtml(secTit)}
              </td>
            </tr>
          `;
        }

        linhasTabela += `
          <tr style="border-bottom: 1px solid #cbd5e1; vertical-align: top;">
            <td style="padding: 5px 6px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 9px; color: #0f172a;">${escHtml(art.artigo)}</td>
            <td style="padding: 5px 8px; font-size: 8.8px; line-height: 1.32; color: #1e293b; white-space: pre-line;">${escHtml(art.descricao)}</td>
            <td style="padding: 5px 4px; text-align: center; font-size: 9px; font-weight: 700;">${escHtml(art.unidade)}</td>
            <td style="padding: 5px 6px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 9px;">${fmtNum2(art.quantidade)}</td>
            <td style="padding: 5px 6px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 9px;">
              ${art.incluso ? 'INCLUSO' : fmtMoeda2(art.preco_venda_unitario)}
            </td>
            <td style="padding: 5px 6px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 9.2px; color: #003366;">
              ${art.incluso ? 'INCLUSO' : fmtMoeda2(art.preco_total)}
            </td>
          </tr>
        `;
      });
    }

    const blocoResumoFinalHtml = ehUltimaPagItens ? `
      <div style="margin-top: 12px; border: 1.5px solid #003366; border-radius: 6px; overflow: hidden;">
        <div style="background: #003366; color: white; padding: 5px 10px; font-size: 9.5px; font-weight: 800; text-transform: uppercase;">
          Quadro Resumo de Faturamento & Valor Global da Proposta (${escHtml(uf)} • ${isContrib ? 'Contribuinte ICMS' : 'Não Contribuinte'})
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 4px 10px; color: #334155;">Serviços & Materiais Aplicados em Empreitada (Nota Mista / Serviços)</td>
              <td style="padding: 4px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${fmtMoeda2(vendaNotaMistaServ)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 4px 10px; color: #334155;">Materiais em Nota Fiscal de Venda Direta Omnitrade (Nacional / Importado)</td>
              <td style="padding: 4px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${fmtMoeda2(vendaNotaVendaMat)}</td>
            </tr>
            ${vendaProjeto > 0 ? `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 4px 10px; color: #334155;">Serviços Técnicos de Engenharia / Projetos Executivos</td>
                <td style="padding: 4px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${fmtMoeda2(vendaProjeto)}</td>
              </tr>
            ` : ''}
            ${vendaFatDireto > 0 ? `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 4px 10px; color: #334155;">Materiais em Faturamento Direto pelos Fornecedores</td>
                <td style="padding: 4px 10px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${fmtMoeda2(vendaFatDireto)}</td>
              </tr>
            ` : ''}
            <tr style="background: #f0f9ff; font-weight: 900; color: #003366; font-size: 11px;">
              <td style="padding: 7px 10px;">VALOR GLOBAL TOTAL DA PROPOSTA COMERCIAL</td>
              <td style="padding: 7px 10px; text-align: right; font-family: 'JetBrains Mono', monospace;">${fmtMoeda2(t.venda_proposta_sem_incluso)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    ` : '';

    paginasHtmlCorpo.push({
      idAncora: idxLote === 0 ? 'a4-pag-planilha' : '',
      conteudo: `
        <div style="font-size: 11px; font-weight: 900; color: #003366; text-transform: uppercase; margin-bottom: 6px;">
          Planilha Orçamentária Sintética — Escopo & Preços Unitários (Parte ${idxLote + 1}/${paginasItens.length})
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #94a3b8;">
          <thead>
            <tr style="background: #003366; color: white; font-size: 9px; text-transform: uppercase;">
              <th style="padding: 5px 6px; text-align: left; width: 46px;">Art.</th>
              <th style="padding: 5px 8px; text-align: left;">Descrição Técnica do Sistema / Serviço</th>
              <th style="padding: 5px 4px; text-align: center; width: 34px;">Un.</th>
              <th style="padding: 5px 6px; text-align: right; width: 58px;">Quant.</th>
              <th style="padding: 5px 6px; text-align: right; width: 82px;">P. Unitário</th>
              <th style="padding: 5px 6px; text-align: right; width: 88px;">Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${linhasTabela}
          </tbody>
        </table>
        ${blocoResumoFinalHtml}
      `
    });
  });

  // 3) PÁGINA DE NOTAS TÉCNICAS & CONDIÇÕES COMERCIAIS
  const cg = OTB_ESTADO.condicoes_gerais || CONDICOES_PADRAO_OTB;
  paginasHtmlCorpo.push({
    idAncora: 'a4-pag-notas',
    conteudo: `
      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 12px; font-weight: 900; color: #003366; text-transform: uppercase; border-bottom: 1.5px solid #003366; padding-bottom: 4px; margin-bottom: 8px;">
          1. Notas Técnicas Aplicáveis & Premissas de Orçamentação
        </h3>
        <ol style="margin: 0; padding-left: 18px; font-size: 10px; line-height: 1.55; color: #1e293b;">
          ${(OTB_ESTADO.notas || []).map(n => `<li style="margin-bottom: 6px; text-align: justify;">${escHtml(n)}</li>`).join('')}
        </ol>
      </div>

      <div>
        <h3 style="font-size: 12px; font-weight: 900; color: #003366; text-transform: uppercase; border-bottom: 1.5px solid #003366; padding-bottom: 4px; margin-bottom: 8px;">
          2. Condições Comerciais Gerais, Prazo & Faturamento
        </h3>
        <div style="font-size: 10px; line-height: 1.6; color: #1e293b;">
          <div><strong>• Regime de Execução:</strong> ${escHtml(cg.regime || 'Empreitada por Preço Unitário')}</div>
          <div><strong>• Prazo Estimado de Execução em Obra:</strong> ${fmtNum2(p.semanas_instalacao)} semanas úteis após mobilização e liberação das frentes (${p.homens_instalacao} profissionais diretos previstos).</div>
          <div><strong>• Validade desta Proposta:</strong> ${cg.validade_dias || 15} dias corridos a partir da data de emissão.</div>
          <div><strong>• Retenção Contratual / Caução:</strong> ${cg.retencao_percentual !== undefined ? cg.retencao_percentual : 5}% por medição, liberada em ${cg.retencao_prazo_dias !== undefined ? cg.retencao_prazo_dias : 90} dias após aceite definitivo.</div>
          <div style="margin-top: 8px;"><strong>• Condições de Pagamento:</strong></div>
          <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${(cg.condicoes_pagamento || []).map(cp => `<li style="margin-bottom: 4px;">${escHtml(cp)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `
  });

  // 4) PÁGINA DE MATRIZ DE RESPONSABILIDADES E ASSINATURAS
  paginasHtmlCorpo.push({
    idAncora: 'a4-pag-matriz',
    conteudo: `
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="font-size: 12px; font-weight: 900; color: #003366; text-transform: uppercase; border-bottom: 1.5px solid #003366; padding-bottom: 4px; margin-bottom: 10px;">
            3. Matriz Contratual de Responsabilidades & Encargos da Empreitada
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #94a3b8;">
            <thead>
              <tr style="background: #003366; color: white;">
                <th style="padding: 5px 6px; width: 34px; text-align: center;">#</th>
                <th style="padding: 5px 8px; text-align: left;">Descrição da Atividade / Fornecimento / Infraestrutura</th>
                <th style="padding: 5px 6px; width: 85px; text-align: center;">OMNITRADE</th>
                <th style="padding: 5px 6px; width: 85px; text-align: center;">CLIENTE</th>
              </tr>
            </thead>
            <tbody>
              ${(OTB_ESTADO.matriz_responsabilidades || []).map((m, idx) => `
                <tr style="border-bottom: 1px solid #cbd5e1;">
                  <td style="padding: 5px 6px; text-align: center; font-weight: 700;">${idx + 1}</td>
                  <td style="padding: 5px 8px; color: #1e293b;">${escHtml(m.descricao)}</td>
                  <td style="padding: 5px 6px; text-align: center; font-weight: 900; color: #15803d;">${m.omnitrade ? 'X' : ''}</td>
                  <td style="padding: 5px 6px; text-align: center; font-weight: 900; color: #1d4ed8;">${m.cliente ? 'X' : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px dashed #94a3b8;">
          <div style="font-size: 10px; color: #334155; margin-bottom: 28px; text-align: center;">
            Estando de acordo com as especificações técnicas, valores e condições gerais descritas nesta proposta <strong>${escHtml(OTB_ESTADO.referencia)}</strong>, firmam o presente aceite:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 36px; text-align: center; font-size: 10px;">
            <div>
              <div style="border-top: 1px solid #0f172a; padding-top: 6px; font-weight: 800; color: #003366;">OMNITRADE BRASIL</div>
              <div style="color: #475569;">${escHtml(OTB_ESTADO.comercial.responsavel || 'Departamento Comercial')}</div>
              <div style="color: #64748b; font-size: 9px;">${escHtml(OTB_ESTADO.comercial.email || '')}</div>
            </div>
            <div>
              <div style="border-top: 1px solid #0f172a; padding-top: 6px; font-weight: 800; color: #0f172a;">DE ACORDO — ${escHtml(OTB_ESTADO.cliente.nome || 'CLIENTE')}</div>
              <div style="color: #475569;">Nome / Cargo / Carimbo CNPJ</div>
              <div style="color: #64748b; font-size: 9px;">Data do Aceite: ____ / ____ / ________</div>
            </div>
          </div>
        </div>
      </div>
    `
  });

  const totalPaginas = paginasHtmlCorpo.length;
  const badgeEl = document.getElementById('badge-total-paginas-a4');
  if (badgeEl) {
    badgeEl.textContent = `${totalPaginas} Páginas A4 Prontas (${artigos.length} artigos)`;
  }

  container.innerHTML = paginasHtmlCorpo.map((pag, i) => `
    <div class="a4-sheet" ${pag.idAncora ? `id="${pag.idAncora}"` : ''}
      style="width: 210mm; min-height: 297mm; background: white; margin: 0 auto 24px auto; padding: 14mm 15mm; box-shadow: 0 8px 25px rgba(15,23,42,0.18); display: flex; flex-direction: column; box-sizing: border-box; page-break-after: always;">
      ${renderizarCabecalhoPaginaA4(OTB_ESTADO.referencia, OTB_ESTADO.data)}
      <div style="flex: 1; display: flex; flex-direction: column;">
        ${pag.conteudo}
      </div>
      ${renderizarRodapePaginaA4(i + 1, totalPaginas)}
    </div>
  `).join('');
}

function rolarParaSecaoA4OTB(idAncora) {
  const el = document.getElementById(idAncora);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================================================
// EXPORTS GLOBAIS EXPLICITOS PARA ACESSO EM WINDOW
// =============================================================================
Object.defineProperty(window, 'OTB_ESTADO', {
  get: () => OTB_ESTADO,
  set: (v) => { OTB_ESTADO = v; },
  configurable: true
});
Object.defineProperty(window, 'OTB_CATALOGO_MATERIAIS', {
  get: () => OTB_CATALOGO_MATERIAIS,
  set: (v) => { OTB_CATALOGO_MATERIAIS = v; },
  configurable: true
});
if (typeof MATERIAIS_OTB !== 'undefined') window.MATERIAIS_OTB = MATERIAIS_OTB;
if (typeof IMPOSTOS_OTB !== 'undefined') window.IMPOSTOS_OTB = IMPOSTOS_OTB;
if (typeof ARTIGOS_CATALOGO_OTB !== 'undefined') window.ARTIGOS_CATALOGO_OTB = ARTIGOS_CATALOGO_OTB;
if (typeof BIBLIOTECAS_OTB !== 'undefined') window.BIBLIOTECAS_OTB = BIBLIOTECAS_OTB;
