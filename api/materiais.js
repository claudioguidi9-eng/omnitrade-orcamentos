const fs = require('fs');
const path = require('path');

let catalogoModalidades = null;
let materiaisGerais = null;

try {
  catalogoModalidades = require('../data/catalogo_modalidades.json');
} catch (e) {
  try {
    catalogoModalidades = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/catalogo_modalidades.json'), 'utf-8'));
  } catch (err) {
    catalogoModalidades = {};
  }
}

try {
  materiaisGerais = require('../data/materiais.json');
} catch (e) {
  try {
    materiaisGerais = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/materiais.json'), 'utf-8'));
  } catch (err) {
    materiaisGerais = [];
  }
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const modalidade = (req.query && req.query.modalidade) || '';
  const q = ((req.query && req.query.q) || '').toLowerCase().trim();

  let lista = [];

  if (modalidade && catalogoModalidades) {
    let modKey = Object.keys(catalogoModalidades).find(k => 
      k.toLowerCase().includes(modalidade.toLowerCase()) || 
      modalidade.toLowerCase().includes(k.toLowerCase())
    );
    if (modKey && catalogoModalidades[modKey]) {
      lista = catalogoModalidades[modKey];
    }
  }

  if (!lista.length && !modalidade) {
    lista = materiaisGerais || [];
  }

  if (q) {
    lista = lista.filter(m => 
      (m.descricao || '').toLowerCase().includes(q) ||
      (m.codigo || '').toLowerCase().includes(q)
    );
  }

  return res.status(200).json(lista.slice(0, 100));
};
