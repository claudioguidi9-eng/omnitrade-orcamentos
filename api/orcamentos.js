const fs = require('fs');
const path = require('path');

let galileuProj = null;
try {
  galileuProj = require('../data/projetos/galileu_cpq011.json');
} catch (e) {
  try {
    galileuProj = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/projetos/galileu_cpq011.json'), 'utf-8'));
  } catch (err) {
    galileuProj = null;
  }
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Orçamento salvo com sucesso!',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(200).json(galileuProj);
};
