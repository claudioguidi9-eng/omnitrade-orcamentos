
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ONLINE',
    ambiente: 'Vercel Serverless Cloud',
    versao: '2.0.0',
    total_materiais: 495,
    total_rendimentos: 125,
    projetos_cadastrados: ['galileu_cpq011']
  });
};
