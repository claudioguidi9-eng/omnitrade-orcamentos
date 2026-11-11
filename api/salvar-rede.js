module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    const body = req.body || {};
    return res.status(200).json({
      success: true,
      ambiente: 'cloud_vercel',
      caminhoSugerido: `${body.caminhoBase || 'G:\\Drives compartilhados\\COMERCIAL\\1-PROPOSTAS'}\\${body.ano || '2026'}\\${body.pastaObra || 'PROJETO'}\\PROPOSTA\\${body.nomeArquivo || 'proposta.json'}`,
      mensagem: 'Ambiente Cloud Vercel: utilize a gravação nativa via Windows Explorer ou download direto.',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(200).json({ status: 'API salvar-rede online' });
};
