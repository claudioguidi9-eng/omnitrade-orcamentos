const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { gerarPdfDoProjeto } = require('./gerar_pdf');
const { recalcularOrcamento } = require('./motor_calculo');

const PORT = process.env.PORT || 3344;
const DIR_DATA = path.join(__dirname, 'data');
const DIR_PROJETOS = path.join(DIR_DATA, 'projetos');
const DIR_PDFS = path.join(__dirname, 'propostas_geradas');

// Referências estáticas explícitas de fs para garantir bundling completo no @vercel/nft
[
  fs.existsSync(path.join(__dirname, 'index.html')),
  fs.existsSync(path.join(__dirname, 'otb_engine.js')),
  fs.existsSync(path.join(__dirname, 'otb_ui.js')),
  fs.existsSync(path.join(__dirname, 'sw.js')),
  fs.existsSync(path.join(__dirname, 'manifest.json')),
  fs.existsSync(path.join(__dirname, 'Criar_Atalho_Omnitrade.bat')),
  fs.existsSync(path.join(__dirname, 'assets', 'omnitrade.ico')),
  fs.existsSync(path.join(__dirname, 'assets', 'omnitrade_logo_256.png')),
  fs.existsSync(path.join(__dirname, 'assets', 'omnitrade_logo_cube.svg')),
  fs.existsSync(path.join(__dirname, 'data', 'materiais_otb.json')),
  fs.existsSync(path.join(__dirname, 'data', 'impostos_otb.json')),
  fs.existsSync(path.join(__dirname, 'data', 'artigos_sinteticos_otb.json')),
  fs.existsSync(path.join(__dirname, 'data', 'bibliotecas_otb.json'))
];

// Carregar bases em memória para performance instantânea (zero delay)
let MATERIAIS = [];
let RENDIMENTOS = [];
let BASE_ITENS = [];

try {
  MATERIAIS = JSON.parse(fs.readFileSync(path.join(DIR_DATA, 'materiais.json'), 'utf-8'));
} catch (e) { console.error('Erro ao ler materiais.json:', e.message); }

try {
  RENDIMENTOS = JSON.parse(fs.readFileSync(path.join(DIR_DATA, 'rendimentos.json'), 'utf-8'));
} catch (e) { console.error('Erro ao ler rendimentos.json:', e.message); }

try {
  BASE_ITENS = JSON.parse(fs.readFileSync(path.join(DIR_DATA, 'base_itens.json'), 'utf-8'));
} catch (e) { console.error('Erro ao ler base_itens.json:', e.message); }

// Helper para responder JSON com CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Helper para ler body da requisição
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // 1. SERVIR ARQUIVOS ESTÁTICOS E PÁGINA PRINCIPAL
  if (pathname === '/' || pathname === '/index.html') {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      return fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('index.html não encontrado.');
    }
  }

  // 1B. SERVIR SCRIPTS CLIENTE, MANIFEST, ÍCONES, ASSETS E DADOS JSON OTB
  if (method === 'GET' && !pathname.startsWith('/api/') && !pathname.startsWith('/propostas_geradas/')) {
    const blockedFiles = new Set(['/server.js', '/gerar_pdf.js', '/build_engine.js', '/package.json', '/package-lock.json', '/vercel.json']);
    if (!blockedFiles.has(pathname)) {
      const safeRel = pathname.replace(/^\/+/, '');
      const resolvedStatic = path.resolve(__dirname, safeRel);
      const rootResolved = path.resolve(__dirname);
      if (resolvedStatic.startsWith(rootResolved + path.sep) && fs.existsSync(resolvedStatic) && fs.statSync(resolvedStatic).isFile()) {
        const ext = path.extname(resolvedStatic).toLowerCase();
        const mimeTypes = {
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.webmanifest': 'application/manifest+json; charset=utf-8',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.ico': 'image/x-icon',
          '.bat': 'application/octet-stream',
          '.html': 'text/html; charset=utf-8'
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const headers = {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        };
        if (ext === '.js' || ext === '.html' || ext === '.json') {
          headers['Cache-Control'] = 'no-cache';
        }
        if (pathname === '/sw.js') {
          headers['Service-Worker-Allowed'] = '/';
        }
        if (ext === '.bat') {
          headers['Content-Disposition'] = `attachment; filename="${path.basename(resolvedStatic)}"`;
        }
        res.writeHead(200, headers);
        return fs.createReadStream(resolvedStatic).pipe(res);
      }
    }
  }

  // 2. SERVIR PDFs GERADOS
  if (pathname.startsWith('/propostas_geradas/')) {
    const fileName = path.basename(pathname);
    const pdfPath = path.join(DIR_PDFS, fileName);
    if (fs.existsSync(pdfPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`
      });
      return fs.createReadStream(pdfPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('PDF não encontrado.');
    }
  }

  // 3. ROTAS DA API REST

  // GET /api/status
  if (pathname === '/api/status' && method === 'GET') {
    const projetos = fs.readdirSync(DIR_PROJETOS).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    return sendJson(res, 200, {
      status: 'ONLINE',
      versao: '2.0.0',
      total_materiais: MATERIAIS.length,
      total_rendimentos: RENDIMENTOS.length,
      total_base_itens: BASE_ITENS.length,
      projetos_cadastrados: projetos
    });
  }

  // GET /api/materiais?q=...&secao=...
  if (pathname === '/api/materiais' && method === 'GET') {
    const q = (parsedUrl.query.q || '').toString().toLowerCase().trim();
    const secao = (parsedUrl.query.secao || '').toString().toLowerCase().trim();
    let result = MATERIAIS;

    if (secao) {
      result = result.filter(m => (m.secao || '').toLowerCase().includes(secao));
    }
    if (q) {
      result = result.filter(m => 
        (m.descricao || '').toLowerCase().includes(q) ||
        (m.codigo || '').toLowerCase().includes(q) ||
        (m.ncm || '').toLowerCase().includes(q)
      );
    }
    return sendJson(res, 200, result.slice(0, 100)); // Limita a 100 itens para rapidez
  }

  // GET /api/rendimentos?q=...&grupo=...
  if (pathname === '/api/rendimentos' && method === 'GET') {
    const q = (parsedUrl.query.q || '').toString().toLowerCase().trim();
    const grupo = (parsedUrl.query.grupo || '').toString().toLowerCase().trim();
    let result = RENDIMENTOS;

    if (grupo) {
      result = result.filter(r => (r.grupo || '').toLowerCase().includes(grupo));
    }
    if (q) {
      result = result.filter(r => 
        (r.tarefa || '').toLowerCase().includes(q) ||
        (r.subgrupo || '').toLowerCase().includes(q)
      );
    }
    return sendJson(res, 200, result.slice(0, 100));
  }

  // GET /api/base-itens?q=...
  if (pathname === '/api/base-itens' && method === 'GET') {
    const q = (parsedUrl.query.q || '').toString().toLowerCase().trim();
    let result = BASE_ITENS;
    if (q) {
      result = result.filter(b => 
        (b.descritivo || '').toLowerCase().includes(q) ||
        (b.artigo || '').toLowerCase().includes(q) ||
        (b.categoria || '').toLowerCase().includes(q)
      );
    }
    return sendJson(res, 200, result.slice(0, 100));
  }

  // GET /api/orcamentos -> Lista todos os orçamentos salvos
  if ((pathname === '/api/orcamentos' || pathname === '/api/orcamento') && method === 'GET') {
    if (parsedUrl.query.id || pathname.includes('galileu')) {
      const p = JSON.parse(fs.readFileSync(path.join(DIR_PROJETOS, 'galileu_cpq011.json'), 'utf-8'));
      return sendJson(res, 200, p);
    }
    try {
      const files = fs.existsSync(DIR_PROJETOS) ? fs.readdirSync(DIR_PROJETOS).filter(f => f.endsWith('.json')) : [];
      const list = files.map(file => {
        try {
          const raw = fs.readFileSync(path.join(DIR_PROJETOS, file), 'utf-8');
          const p = JSON.parse(raw);
          const countOtb = p.otb_estado && Array.isArray(p.otb_estado.artigos) ? p.otb_estado.artigos.length : null;
          return {
            id: p.id || file.replace('.json', ''),
            referencia: p.referencia || file.replace('.json', ''),
            nome_obra: p.obra ? p.obra.nome : 'Sem nome',
            cliente: p.cliente ? p.cliente.nome : 'Sem cliente',
            data: p.data || '',
            venda_total: p.totais ? (p.totais.venda_total || p.totais.venda || 0) : 0,
            margem_percentual: p.totais ? p.totais.margem_percentual : 0,
            itens_count: countOtb !== null ? countOtb : (p.itens_proposta || []).length
          };
        } catch (e) {
          return { id: file.replace('.json', ''), erro: e.message };
        }
      });
      return sendJson(res, 200, list);
    } catch (e) {
      return sendJson(res, 500, { erro: e.message });
    }
  }

  // GET /api/orcamentos/:id -> Carrega orçamento específico
  if (pathname.startsWith('/api/orcamentos/') && method === 'GET') {
    const id = path.basename(pathname);
    const filePath = path.join(DIR_PROJETOS, `${id}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const projeto = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return sendJson(res, 200, projeto);
      } catch (e) {
        return sendJson(res, 500, { erro: 'Erro ao analisar JSON do projeto: ' + e.message });
      }
    } else {
      return sendJson(res, 404, { erro: `Orçamento ${id} não encontrado.` });
    }
  }

  // POST /api/orcamentos -> Salva ou atualiza orçamento
  if (pathname === '/api/orcamentos' && method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.id) {
        body.id = 'orc_' + Date.now();
      }
      const projetoCalculado = body.otb_estado ? body : recalcularOrcamento(body);
      try {
        fs.mkdirSync(DIR_PROJETOS, { recursive: true });
        const filePath = path.join(DIR_PROJETOS, `${projetoCalculado.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(projetoCalculado, null, 2), 'utf-8');
      } catch (errFs) {
        const tmpDir = path.join(require('os').tmpdir(), 'omnitrade_projetos');
        fs.mkdirSync(tmpDir, { recursive: true });
        fs.writeFileSync(path.join(tmpDir, `${projetoCalculado.id}.json`), JSON.stringify(projetoCalculado, null, 2), 'utf-8');
      }
      return sendJson(res, 200, { success: true, id: projetoCalculado.id, projeto: projetoCalculado });
    } catch (e) {
      return sendJson(res, 500, { erro: e.message });
    }
  }

  // POST /api/calcular -> Roda motor de cálculo sem salvar
  if (pathname === '/api/calcular' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const resultado = recalcularOrcamento(body);
      return sendJson(res, 200, resultado);
    } catch (e) {
      return sendJson(res, 500, { erro: e.message });
    }
  }

  // POST /api/gerar-pdf -> Gera o PDF oficial do orçamento
  if (pathname === '/api/gerar-pdf' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const projeto = recalcularOrcamento(body);
      const safeId = (projeto.id || 'proposta').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const timeStamp = Date.now();
      const pdfFileName = `${safeId}_${timeStamp}.pdf`;
      const pdfFullPath = path.join(DIR_PDFS, pdfFileName);

      gerarPdfDoProjeto(projeto, pdfFullPath, (err, outPath) => {
        if (err) {
          return sendJson(res, 500, { erro: 'Falha ao renderizar PDF: ' + err.message });
        }
        const stat = fs.statSync(pdfFullPath);
        return sendJson(res, 200, {
          success: true,
          fileName: pdfFileName,
          pdfUrl: `/propostas_geradas/${pdfFileName}`,
          tamanho_bytes: stat.size
        });
      });
    } catch (e) {
      return sendJson(res, 500, { erro: e.message });
    }
    return;
  }

  
  // POST /api/salvar-rede -> Grava o projeto diretamente na rede corporativa ou local
  if (pathname === '/api/salvar-rede' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const caminhoBase = body.caminhoBase || 'G:\\Drives compartilhados\\COMERCIAL\\1-PROPOSTAS';
      const ano = body.ano || '2026';
      const mes = body.mes || 'DIRETO';
      const pastaObra = body.pastaObra || (body.projeto ? `${body.projeto.referencia || 'ORC'} - ${body.projeto.obra ? body.projeto.obra.nome : 'OBRA'}` : 'NOVA_OBRA');
      const subpasta = body.subpasta || 'PROPOSTA';
      const revisao = body.revisao || 'R00';
      const nomeArquivo = body.nomeArquivo || `${body.projeto ? body.projeto.referencia : 'PROPOSTA'}_${revisao}.json`;
      const projeto = body.projeto || {};

      let dirDestino = path.join(caminhoBase, ano);
      if (mes && mes !== 'DIRETO' && mes !== 'NENHUM') {
        dirDestino = path.join(dirDestino, mes);
      }
      dirDestino = path.join(dirDestino, pastaObra);
      if (subpasta && subpasta !== 'RAIZ' && subpasta !== 'NENHUM') {
        dirDestino = path.join(dirDestino, subpasta);
      }
      if (revisao && revisao !== 'NENHUM') {
        dirDestino = path.join(dirDestino, revisao);
      }

      let gravouNaRede = true;
      try {
        fs.mkdirSync(dirDestino, { recursive: true });
      } catch (errDir) {
        gravouNaRede = false;
        try {
          dirDestino = path.join(__dirname, 'projetos_salvos', ano, pastaObra, subpasta, revisao);
          fs.mkdirSync(dirDestino, { recursive: true });
        } catch (errLocal) {
          dirDestino = path.join(require('os').tmpdir(), 'omnitrade_salvos', ano, pastaObra.replace(/[^a-zA-Z0-9_\- ]/g, '_'), subpasta, revisao);
          fs.mkdirSync(dirDestino, { recursive: true });
        }
      }

      const arquivoCompleto = path.join(dirDestino, nomeArquivo);
      fs.writeFileSync(arquivoCompleto, JSON.stringify(projeto, null, 2), 'utf-8');

      if (body.htmlSnapshot) {
        const arqHtml = arquivoCompleto.replace(/\.json$/i, '.html');
        fs.writeFileSync(arqHtml, body.htmlSnapshot, 'utf-8');
      }

      // Salva no cache local de projetos
      try {
        const safeId = (projeto.referencia || projeto.id || 'proj_' + Date.now()).replace(/[^a-zA-Z0-9_\-]/g, '_');
        fs.writeFileSync(path.join(DIR_PROJETOS, `${safeId}.json`), JSON.stringify(projeto, null, 2), 'utf-8');
      } catch (eCache) {
        console.warn('Aviso ao gravar cache local:', eCache.message);
      }

      const stat = fs.statSync(arquivoCompleto);
      return sendJson(res, 200, {
        success: true,
        gravouNaRede: gravouNaRede,
        caminhoCompleto: arquivoCompleto,
        diretorio: dirDestino,
        nomeArquivo: nomeArquivo,
        tamanho_bytes: stat.size,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('Erro em /api/salvar-rede:', e.message);
      return sendJson(res, 500, { erro: 'Erro ao gravar projeto na rede: ' + e.message });
    }
  }

  // GET /api/pastas-rede?ano=2026 -> Lista pastas da rede para autocompletar
  if (pathname === '/api/pastas-rede' && method === 'GET') {
    try {
      const ano = parsedUrl.query.ano || '2026';
      const caminhoBase = 'G:\\Drives compartilhados\\COMERCIAL\\1-PROPOSTAS';
      const targetDir = path.join(caminhoBase, ano);
      if (fs.existsSync(targetDir)) {
        const pastas = fs.readdirSync(targetDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);
        return sendJson(res, 200, { ano, pastas: pastas.slice(0, 100) });
      } else {
        return sendJson(res, 200, { ano, pastas: [] });
      }
    } catch (e) {
      return sendJson(res, 200, { erro: e.message, pastas: [] });
    }
  }

  // 404 para rotas desconhecidas
  sendJson(res, 404, { erro: 'Endpoint não encontrado: ' + pathname });
});

server.listen(PORT, () => {
  console.log('=====================================================');
  console.log(`🚀 OMNITRADE ORÇAMENTO AI INICIADO NA PORTA ${PORT}`);
  console.log(`🌐 Acesso Local: http://localhost:${PORT}`);
  console.log(`📊 Materiais Carregados: ${MATERIAIS.length}`);
  console.log(`📈 Rendimentos Carregados: ${RENDIMENTOS.length}`);
  console.log(`📋 Base de Itens Carregada: ${BASE_ITENS.length}`);
  console.log('=====================================================');
});
