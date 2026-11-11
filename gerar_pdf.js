const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function getBrowserPath() {
  if (fs.existsSync(CHROME_PATH)) return CHROME_PATH;
  if (fs.existsSync(EDGE_PATH)) return EDGE_PATH;
  throw new Error('Nenhum navegador (Chrome ou Edge) encontrado para gerar PDF.');
}

function formatMoeda(val) {
  if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
  return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumero(val) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const OMNITRADE_HEADER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595.276 56" width="100%" height="56px" preserveAspectRatio="xMidYMid meet" style="display: block;"> <g transform="matrix(1 0 0 -1 0 818)"> <g> <g transform="matrix(1 0 0 1 600.6886 788.9163)"> <path d="M 0 0 L -255.055 0 C -256.105 0 -256.955 0.851 -256.955 1.9 C -256.955 2.949 -256.105 3.799 -255.055 3.799 L 0 3.799 C 1.049 3.799 1.9 2.949 1.9 1.9 C 1.9 0.851 1.049 0 0 0" fill="#00ADEF"  /> </g> </g> <g> <g transform="matrix(1 0 0 1 80.8319 780.2305)"> <path d="M 0 0 C -5.559 0 -9.638 4.221 -9.638 10.061 C -9.638 15.902 -5.559 20.123 0 20.123 C 5.528 20.123 9.607 15.902 9.607 10.061 C 9.607 4.221 5.528 0 0 0 M 0 17.996 C -4.169 17.996 -7.13 14.696 -7.13 10.061 C -7.13 5.459 -4.169 2.126 0 2.126 C 4.139 2.126 7.1 5.459 7.1 10.061 C 7.1 14.696 4.139 17.996 0 17.996" fill="#0083A3" fill-rule="evenodd" /> </g> <g transform="matrix(1 0 0 1 136.6774 780.3038)"> <path d="M 0 0 L -1.668 0 L -15.932 14.937 L -15.992 18.983 L -2.747 5.113 L -2.747 20.05 L 0 20.05 Z" fill="#0083A3"  /> </g> <rect x="143.955" y="780.340" width="2.417" height="20.014" fill="#0083A3" /> <rect x="120.685" y="780.304" width="2.553" height="5.278" fill="#0083A3" /> <g transform="matrix(1 0 0 1 114.4677 780.3038)"> <path d="M 0 0 L -2.213 0 L -2.213 14.937 C -4.689 11.652 -7.164 8.366 -9.639 5.081 C -9.733 5.202 -9.827 5.323 -9.921 5.443 L -9.928 5.429 C -9.928 5.429 -9.929 5.429 -9.929 5.429 C -9.949 5.429 -10.463 6.104 -11.204 7.09 S -13.249 9.815 -17.037 14.937 L -17.037 0 L -19.251 0 L -19.251 20.05 L -17.856 20.05 L -9.804 8.939 C -7.001 12.643 -4.198 16.346 -1.395 20.05 L 0 20.05 Z" fill="#0083A3"  /> </g> <g transform="matrix(1 0 0 1 152.2266 798.3542)"> <path d="M 0 0 L 0 1.601 L 16.486 1.601 L 16.486 0 L 9.497 0 L 9.497 -17.996 L 7.7 -17.996 L 7.7 0 Z" fill="#0f172a"  /> </g> <g transform="matrix(1 0 0 1 179.7526 788.6541)"> <path d="M 0 0 C 2.972 0.62 4.311 2.907 4.311 5.552 C 4.311 8.623 2.482 11.301 -1.731 11.301 L -7.806 11.301 L -7.806 -8.296 L -6.01 -8.296 L -6.01 -0.196 L -6.01 1.404 L -6.01 9.7 L -1.731 9.7 C 1.502 9.7 2.515 7.577 2.515 5.552 C 2.515 3.495 1.502 1.404 -1.731 1.404 L -1.92 1.404 L -1.92 -0.196 L -1.894 -0.196 L 3.723 -8.296 L 5.846 -8.296 Z" fill="#0f172a"  /> </g> <g transform="matrix(1 0 0 1 192.2301 787.6414)"> <path d="M 0 0 L 3.919 9.635 L 7.871 0 Z M 4.736 12.314 L 3.266 12.314 L -4.834 -7.283 L -2.972 -7.283 L -0.653 -1.6 L 8.524 -1.6 L 10.876 -7.283 L 12.836 -7.283 Z" fill="#0f172a" fill-rule="evenodd" /> </g> <g transform="matrix(1 0 0 1 214.2117 782.0563)"> <path d="M 0 0 L -3.985 0 L -3.985 16.2 L 0 16.2 C 6.467 16.2 8.59 12.379 8.59 8.1 C 8.59 3.822 6.467 0 0 0 M -0.033 17.899 L -5.781 17.899 L -5.781 -1.698 L -0.033 -1.698 C 7.316 -1.698 10.452 2.711 10.452 8.1 C 10.452 13.489 7.316 17.899 -0.033 17.899" fill="#0f172a" fill-rule="evenodd" /> </g> <g transform="matrix(1 0 0 1 239.884 799.9551)"> <path d="M 0 0 L 0 -1.601 L -9.308 -1.601 L -9.308 -8.492 L -1.633 -8.492 L -1.633 -10.093 L -9.308 -10.093 L -9.308 -17.997 L 0 -17.997 L 0 -19.597 L -11.105 -19.597 L -11.105 0 Z" fill="#0f172a"  /> </g> <g transform="matrix(1 0 0 1 252.5176 781.3702)"> <path d="M 0 0 L -4.834 0 L -4.834 8.753 L 0 8.753 C 3.593 8.753 4.703 6.63 4.703 4.377 C 4.703 2.156 3.56 0 0 0 M -4.834 17.572 L -0.522 17.572 C 2.711 17.572 3.691 15.743 3.691 13.718 C 3.691 11.66 2.711 9.766 -0.522 9.766 L -4.834 9.766 Z M 1.764 9.374 C 3.985 9.897 4.801 11.922 4.801 13.718 C 4.801 16.396 3.234 18.585 -0.522 18.585 L -5.945 18.585 L -5.945 -1.012 L 0 -1.012 C 4.083 -1.012 5.814 1.47 5.814 4.377 C 5.814 6.565 4.703 8.917 1.764 9.374" fill="#0f172a" fill-rule="evenodd" /> </g> <g transform="matrix(1 0 0 1 268.8716 788.817)"> <path d="M 0 0 C 3.266 0.392 4.736 2.809 4.736 5.52 C 4.736 8.459 3.005 11.138 -0.98 11.138 L -6.696 11.138 L -6.696 -8.459 L -5.585 -8.459 L -5.585 -0.065 C -5.581 0.272 -5.578 0.61 -5.574 0.947 C -5.578 4.006 -5.581 7.066 -5.585 10.125 L -0.98 10.125 C 2.482 10.125 3.626 7.774 3.626 5.52 C 3.626 3.233 2.482 0.947 -0.98 0.947 L -1.168 0.947 L -1.168 -0.076 L 4.638 -8.459 L 5.945 -8.459 Z" fill="#0f172a"  /> </g> <g transform="matrix(1 0 0 1 281.0878 787.1841)"> <path d="M 0 0 L 4.409 11.137 L 8.819 0 Z M 4.899 12.738 L 3.952 12.738 L -3.887 -6.859 L -2.744 -6.859 L -0.392 -1.013 L 9.21 -1.013 L 11.562 -6.859 L 12.738 -6.859 Z" fill="#0f172a" fill-rule="evenodd" /> </g> <g transform="matrix(1 0 0 1 302.3931 780.3699)"> <path d="M 0 0 C -2.613 0 -4.671 1.013 -5.749 2.025 L -5.552 3.103 C -4.246 1.992 -2.286 1.013 0 1.013 C 2.613 1.013 4.736 2.678 4.736 5.324 C 4.736 7.643 3.626 9.145 -0.326 10.288 C -3.495 11.17 -5.226 13.097 -5.226 15.71 C -5.226 18.323 -3.037 20.446 0.326 20.446 C 2.025 20.446 3.789 19.727 4.834 18.976 L 4.605 17.997 C 3.299 18.846 1.666 19.434 0.326 19.434 C -2.45 19.434 -4.083 17.866 -4.083 15.71 C -4.083 13.881 -3.201 12.313 0.196 11.334 C 3.821 10.321 5.879 8.525 5.879 5.422 C 5.879 1.796 2.841 0 0 0" fill="#0f172a"  /> </g> <rect x="312.313" y="780.358" width="1.111" height="19.597" fill="#0f172a" /> <g transform="matrix(1 0 0 1 318.7846 780.3578)"> <path d="M 0 0 L 0 19.597 L 1.111 19.597 L 1.111 1.012 L 10.419 1.012 L 10.419 0 Z" fill="#0f172a"  /> </g> <g transform="matrix(1 0 0 1 50.467 798.7177)"> <path d="M 0 0 C 0.413 0 1.656 -0 1.992 -0 C 3.031 -0.001 9.23 -0.001 13.137 -0 C 9.422 3.73 5.707 7.46 1.992 11.191 C -0.493 8.705 -2.981 6.198 -5.472 3.669 C -6.678 2.445 -7.879 1.222 -9.075 -0 L -5.708 -0 L -2.682 -0 C -2.087 -0 -0.013 0 0 0" fill="rgb(118,251,242)"  /> </g> <g transform="matrix(1 0 0 1 44.9949 802.3866)"> <path d="M 0 0 L 7.427 7.522 L 7.446 7.503 Z" fill="rgb(97,233,218)"  /> </g> <g transform="matrix(1 0 0 1 33.5086 790.808)"> <path d="M 0 0 L 0 0 C -1.152 1.134 -2.703 2.659 -3.856 3.792 C -5.729 5.632 -8.05 7.909 -8.05 7.909 L -8.05 7.909 C -8.05 2.639 -8.05 -2.63 -8.05 -7.9 C -2.69 -2.642 -0.005 -0.007 0 0" fill="#ffffff"  /> </g> <g transform="matrix(1 0 0 1 63.6043 782.8986)"> <path d="M 0 0 L -11.144 0 C -11.157 -2.403 -11.16 -4.329 -11.16 -5.693 C -11.159 -6.839 -11.157 -7.793 -11.156 -8.103 C -11.153 -9.193 -11.149 -10.172 -11.144 -11.015 C -7.429 -7.344 -3.715 -3.672 0 0" fill="rgb(70,218,228)"  /> </g> <g transform="matrix(1 0 0 1 52.5194 771.7238)"> <path d="M 0 0 L -15.76 0 L -15.76 11.17 L -11.172 11.164 L -11.191 11.184 C -7.481 11.184 -3.77 11.184 -0.059 11.184 L -0.059 3.625 L -0.059 2.951 C -0.059 2.12 -0.06 0.831 -0.061 0 L -0.027 0.034 L -0.027 0 L 0 0.027 Z" fill="rgb(255,255,255)"  /> </g> <g transform="matrix(1 0 0 1 52.4601 787.4515)"> <path d="M 0 0 L 0 -4.553 L -4.68 -4.553 C -3.12 -3.035 -1.56 -1.518 0 0" fill="#00ADEF"  /> </g> <g transform="matrix(1 0 0 1 47.7846 798.7172)"> <path d="M 0 0 L 3.969 0 L 4.674 0 C 4.675 -0.813 4.675 -2.689 4.676 -3.502 C 4.676 -3.609 4.676 -4.57 4.676 -4.676 C 3.117 -3.117 1.559 -1.559 0 0" fill="#00ADEF"  /> </g> <g transform="matrix(1 0 0 1 47.7673 782.9014)"> <path d="M 0 0 L -0.002 -0.002 L -0.003 -0.003 L 0.013 -0.003 C -1.033 -1.101 -2.079 -2.198 -3.124 -3.296 C -4.22 -2.198 -5.317 -1.101 -6.413 -0.003 L -6.404 -0.003 L -6.411 0.004 L -10.978 0.006 L -10.978 -11.055 C -5.755 -11.043 -0.531 -11.03 4.693 -11.018 L 4.693 -0.003 Z" fill="#ffffff"  /> </g> <g transform="matrix(1 0 0 1 55.7049 790.808)"> <path d="M 0 0 C -1.082 -1.119 -2.163 -2.238 -3.245 -3.357 L -3.245 -3.428 L -3.245 -7.909 L 7.899 -7.909 C 5.266 -5.273 2.633 -2.636 0 0" fill="rgb(99,253,240)"  /> </g> <g transform="matrix(1 0 0 1 36.789 794.0631)"> <path d="M 0 0 C -0.549 -0.537 -1.1 -1.08 -1.652 -1.628 C -2.2 -2.172 -2.743 -2.714 -3.28 -3.255 C -2.766 -3.807 -2.243 -4.361 -1.713 -4.917 C -1.141 -5.517 -0.57 -6.109 -0.003 -6.691 C -0.002 -4.461 -0.001 -2.23 0 0" fill="rgb(99,253,240)"  /> </g> <g transform="matrix(1 0 0 1 36.789 794.0631)"> <path d="M 0 0 L 0 4.654 L 4.603 4.654 C 3.069 3.103 1.534 1.551 0 0" fill="rgb(55,180,200)"  /> </g> <g transform="matrix(1 0 0 1 25.4584 782.9077)"> <path d="M 0 0 C 3.774 -3.692 7.548 -7.384 11.322 -11.076 C 11.322 -10.943 11.322 -9.894 11.322 -9.761 C 11.322 -6.507 11.325 -3.253 11.331 0 L 2.909 0 Z" fill="rgb(55,180,200)"  /> </g> <g transform="matrix(1 0 0 1 52.4588 794.0413)"> <path d="M 0 0 C 1.082 -1.078 2.164 -2.155 3.246 -3.233 C 2.164 -4.352 1.082 -5.471 0 -6.59 Z" fill="#0083A3"  /> </g> <g transform="matrix(1 0 0 1 36.789 787.372)"> <path d="M 0 0 L 0 -4.464 L 4.559 -4.464 C 3.039 -2.976 1.52 -1.488 0 0" fill="rgb(99,253,240)"  /> </g> <g transform="matrix(1 0 0 1 33.5086 790.808)"> <path d="M 0 0 L 3.278 -3.436 C 3.279 -4.924 3.28 -6.412 3.28 -7.9 L -0.047 -7.9 L -2.83 -7.9 L -8.05 -7.9 C -5.367 -5.267 -2.683 -2.633 0 0" fill="#00ADEF"  /> </g> <g transform="matrix(1 0 0 1 52.4588 809.9082)"> <path d="M 0 0 C -3.689 -3.73 -7.378 -7.461 -11.066 -11.191 L -15.67 -11.191 C -15.671 -7.461 -15.671 -3.73 -15.672 0 Z" fill="#00ADEF"  /> </g> <g transform="matrix(1 0 0 1 36.789 798.7172)"> <path d="M 0 0 L 0 0 C -0 0 0.001 1.098 0.001 1.809 C 0.002 3.123 0.001 4.135 0 5.77 C -0.001 7.201 -0.002 8.821 -0.003 9.119 C -0.003 9.645 -0.003 10.678 -0.003 11.191 C -3.779 7.461 -7.555 3.73 -11.331 0 Z" fill="#0083A3"  /> </g> <g transform="matrix(1 0 0 1 33.5086 790.808)"> <path d="M 0 0 C 0.064 0.062 0.168 0.163 0.294 0.287 C 0.448 0.439 0.586 0.578 0.705 0.7 Z" fill="#0083A3"  /> </g> <g transform="matrix(1 0 0 1 25.4582 798.7173)"> <path d="M 0 0 C 3.779 -0.004 7.559 -0.007 11.338 -0.01 L 11.341 -4.638 C 10.244 -5.729 9.147 -6.819 8.05 -7.909 C 5.367 -5.273 2.683 -2.636 0 0" fill="rgb(48,179,166)"  /> </g> <g transform="matrix(1 0 0 1 52.4601 794.0413)"> <path d="M 0 0 L -0.001 4.676 L 11.144 4.676 L 11.144 -11.143" fill="rgb(157,251,240)"  /> </g> <g transform="matrix(1 0 0 1 47.7732 782.8986)"> <path d="M 0 0 C -1.046 -1.098 -2.091 -2.196 -3.137 -3.293 C -4.233 -2.196 -5.329 -1.098 -6.425 0 Z" fill="#0083A3"  /> </g> </g> </g> </svg>`;

function gerarHtmlProposta(p) {
  const c = p.cliente || {};
  const o = p.obra || {};
  const com = p.comercial || {};
  const itens = p.itens_proposta || [];
  const notas = p.notas || [];
  const anexo = p.anexo_1 || {};
  const cond = p.condicoes_gerais || {};
  const matriz = p.matriz_responsabilidades || [];

  const fdTotal = itens.filter(i => i.tipo === 'Faturamento Direto').reduce((acc, i) => acc + (i.preco_total || 0), 0);
  const nacTotal = itens.filter(i => i.tipo === 'Materiais Nacionais').reduce((acc, i) => acc + (i.preco_total || 0), 0);
  const impTotal = itens.filter(i => i.tipo === 'Materiais Importados').reduce((acc, i) => acc + (i.preco_total || 0), 0);
  const servTotal = itens.filter(i => i.tipo === 'Serviços' || i.tipo === 'Outros').reduce((acc, i) => acc + (i.preco_total || 0), 0);
  const totalGeral = fdTotal + nacTotal + impTotal + servTotal;

  const renderA4Header = (pNum) => `
    <div class="a4-header-timbrado">
      <div class="a4-header-svg-wrap">
        ${OMNITRADE_HEADER_SVG}
      </div>
      <div class="a4-header-meta-row">
        <div>
          <span class="a4-meta-tag" style="display: inline-flex; align-items: center; gap: 5px;"><img src="data:image/png;base64,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" style="width: 12px; height: 12px; object-fit: contain;"> PROPOSTA COMERCIAL OFICIAL</span>
          <span class="a4-meta-val">${p.referencia || 'BR_23263RCS'}</span>
        </div>
        <div style="display: flex; gap: 12px;">
          <div><strong>Cliente:</strong> ${c.nome || '-'}</div>
          <div><strong>Obra:</strong> ${o.nome || '-'}</div>
          <div><strong>Data:</strong> ${p.data || '29/05/2024'}</div>
        </div>
      </div>
    </div>
  `;

  const renderA4Footer = (pNum) => `
    <div class="a4-footer-timbrado">
      <span class="a4-footer-timbrado-url">WWW.OMNITRADEBRASIL.COM</span>
      <span class="a4-footer-timbrado-pag">Pág. ${pNum} / 13</span>
    </div>
  `;

  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Proposta Comercial - ${p.referencia || 'OMNITRADE'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  @page {
    size: A4 portrait;
    margin: 0;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e293b;
    font-size: 9.5px;
    line-height: 1.45;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }

  .a4-page {
    width: 210mm;
    height: 297mm;
    min-height: 297mm;
    max-height: 297mm;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    page-break-after: always;
    break-after: page;
    overflow: hidden;
    background: #ffffff;
  }

  .a4-page:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  .a4-header-timbrado {
    width: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    flex-shrink: 0;
  }

  .a4-header-svg-wrap {
    width: 100%;
    height: 54px;
    overflow: hidden;
    padding-top: 5px;
  }

  .a4-header-svg-wrap svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .a4-header-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 18mm 6px 18mm;
    border-bottom: 1px solid #e2e8f0;
    font-size: 8.5px;
    color: #475569;
    background: white;
  }

  .a4-meta-tag {
    background: #e0f2fe;
    color: #0369a1;
    font-weight: 800;
    font-size: 8px;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.5px;
    margin-right: 6px;
  }

  .a4-meta-val {
    font-weight: 700;
    color: #0f172a;
    font-family: 'JetBrains Mono', monospace;
  }

  .a4-page-body {
    padding: 10px 18mm 8px 18mm;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
  }

  .a4-footer-timbrado {
    width: 100%;
    height: 42px;
    background: #00ADEF;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #ffffff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 2.5px;
    box-sizing: border-box;
    flex-shrink: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .a4-footer-timbrado-url {
    text-align: center;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2.5px;
  }

  .a4-footer-timbrado-pag {
    position: absolute;
    right: 18mm;
    font-size: 9px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.5px;
  }

  /* Capa */
  .cover-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 18px;
    margin-bottom: 16px;
  }
  .cover-meta-col h4 {
    font-size: 9.5px;
    text-transform: uppercase;
    color: #0284c7;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
    font-weight: 700;
  }
  .cover-meta-item { font-size: 10px; margin-bottom: 4px; }
  .cover-meta-item strong { color: #0f172a; display: inline-block; width: 85px; }

  .cover-letter {
    font-size: 9.8px;
    line-height: 1.55;
    color: #334155;
    margin-bottom: 14px;
  }
  .cover-letter p { margin-bottom: 7px; }

  .cover-institutional-box {
    background: #f1f5f9;
    border-left: 4px solid #00ADEF;
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
    font-size: 9.5px;
    line-height: 1.5;
    color: #334155;
    margin-top: 4px;
  }
  .cover-institutional-box h4 {
    color: #0f172a;
    font-size: 10px;
    margin-bottom: 4px;
    font-weight: 700;
  }

  /* Tabelas */
  table.a4-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
    font-size: 8.8px;
  }
  table.a4-table th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    padding: 5px 8px;
    text-align: left;
    font-size: 8.5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  table.a4-table th.num { text-align: right; }
  table.a4-table td {
    padding: 4px 8px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
    line-height: 1.35;
  }
  table.a4-table tr:nth-child(even) td { background-color: #f8fafc; }
  table.a4-table td.num {
    text-align: right;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.8px;
    white-space: nowrap;
  }
  .a4-section-header td {
    background: #eff6ff !important;
    color: #0369a1;
    font-weight: 800;
    font-size: 9.2px;
    padding: 5px 8px !important;
    border-top: 2px solid #00ADEF;
    border-bottom: 1px solid #93c5fd;
  }

  .a4-summary-card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 10px;
    background: #0f172a;
    color: white;
    padding: 12px 14px;
    border-radius: 6px;
  }
  .a4-summary-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 6px 10px;
    border-radius: 4px;
  }
  .a4-summary-card-label { font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
  .a4-summary-card-val { font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: white; margin-top: 2px; }
  .a4-summary-card-total { grid-column: span 2; background: rgba(0,173,239,0.2); border-color: #00ADEF; }
  .a4-summary-card-total .a4-summary-card-val { font-size: 15px; color: #38bdf8; }

  /* Notas, Anexo, Condições, Matriz */
  .a4-title-bar {
    font-size: 11.5px;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2px solid #00ADEF;
    padding-bottom: 4px;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .a4-note-row {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 9px;
    line-height: 1.38;
    color: #334155;
  }
  .a4-note-num {
    background: #e0f2fe;
    color: #0369a1;
    font-weight: 700;
    font-size: 8.5px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid #bae6fd;
  }

  .a4-box {
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 8px 12px;
    margin-bottom: 7px;
    background: #f8fafc;
  }
  .a4-box h4 { font-size: 9.5px; color: #0369a1; font-weight: 700; margin-bottom: 3px; }
  .a4-box p { font-size: 8.8px; color: #475569; line-height: 1.35; }

  .a4-signature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-top: 26px;
    padding-top: 8px;
  }
  .a4-signature-box {
    border-top: 1px solid #475569;
    padding-top: 8px;
    text-align: center;
    font-size: 9.5px;
  }
  .a4-signature-box strong { display: block; font-size: 11px; color: #0f172a; margin-bottom: 2px; }
</style>
</head>
<body>
`;

  // PÁGINA 1: CAPA
  html += `
<div class="a4-page">
  ${renderA4Header(1)}
  <div class="a4-page-body">
    <div class="cover-meta-grid">
      <div class="cover-meta-col">
        <h4>Dados do Cliente Contratante</h4>
        <div class="cover-meta-item"><strong>Cliente:</strong> ${c.nome || '-'}</div>
        <div class="cover-meta-item"><strong>A/C:</strong> ${c.contato || '-'}</div>
        <div class="cover-meta-item"><strong>E-mail:</strong> ${c.email || '-'}</div>
        <div class="cover-meta-item"><strong>Telefone:</strong> ${c.telefone || '-'}</div>
        <div class="cover-meta-item"><strong>Local / UF:</strong> ${o.local || '-'}</div>
      </div>
      <div class="cover-meta-col">
        <h4>Dados da Proposta Técnica</h4>
        <div class="cover-meta-item"><strong>Data:</strong> ${p.data || '-'}</div>
        <div class="cover-meta-item"><strong>Ref.ª:</strong> ${p.referencia || '-'}</div>
        <div class="cover-meta-item"><strong>Obra / Local:</strong> ${o.nome || '-'}</div>
        <div class="cover-meta-item"><strong>Objeto:</strong> ${o.objeto || '-'}</div>
        <div class="cover-meta-item"><strong>Comercial:</strong> ${com.responsavel || '-'} (${com.celular || ''})</div>
      </div>
    </div>

    <div class="cover-letter">
      <p><strong>Exmos. Senhores,</strong></p>
      <p>Vimos por este meio submeter à vossa criteriosa apreciação a nossa melhor proposta de prestação de serviços de engenharia e fornecimento de sistemas de revestimento e impermeabilização em cobertura deck e fechamentos metálicos, ficando ao vosso inteiro dispor para prestar qualquer esclarecimento complementar que considerem necessário.</p>
      <p>A Omnitrade é detentora de uma tecnologia exclusiva de montagem para coberturas e fechamentos de estruturas de grande porte, trazendo para o mercado brasileiro mais de 30 anos de experiência adquirida pelos nossos especialistas no desenvolvimento e aplicação desse Know-How de engenharia civil na Europa, Oriente Médio, África e Brasil.</p>
      <p>Temos a flexibilidade de sermos instaladores apenas com a locação de mão de obra especializada para a montagem das estruturas, como também podemos realizar todo o escopo da obra: levantamento dos requerimentos técnicos, elaboração do projeto executivo com ART, execução da montagem e fornecimento dos equipamentos certificados por nós especificados.</p>
    </div>

    <div class="cover-institutional-box">
      <h4>Grandes Projetos Executados no Brasil (Atuação desde 2012)</h4>
      <p>No mercado brasileiro, a Omnitrade já executou projetos icônicos e de grande exigência construtiva e técnica, destacando-se a <strong>Arena Corinthians (SP)</strong>, a <strong>Arena Pernambuco (PE)</strong>, a <strong>Arena Pantanal (MT)</strong> e a <strong>Fábrica da FIAT Automóveis (Goiana/PE)</strong>.</p>
    </div>
  </div>
  ${renderA4Footer(1)}
</div>
`;

  // PÁGINAS 2 A 9: PLANILHA DETALHADA
  const gruposPaginas = [
    {
      num: 2,
      secoes: [
        { titulo: 'SERVIÇOS GERAIS DE CANTEIRO & SEGUROS', itens: itens.filter(i => ['CANT.', 'SEG.', 'GAR.'].includes(i.artigo)) },
        { titulo: '1. COBERTURA DECK - MONTAGEM DE REVESTIMENTO COM MEMBRANA TERMOPLÁSTICA PVC 2,0mm', itens: itens.filter(i => i.artigo && i.artigo.startsWith('1.1.')) }
      ]
    },
    {
      num: 3,
      secoes: [
        { titulo: '1.2 FORNECIMENTO E MONTAGEM DE CALHAS EXTERNAS GALVALUME 0,95mm', itens: itens.filter(i => i.artigo && i.artigo.startsWith('1.2.')) },
        { titulo: '1.3 REMATE DE FECHO DE IMPERMEABILIZAÇÃO TRANSIÇÃO COBERTURA-CALHA', itens: itens.filter(i => i.artigo && i.artigo.startsWith('1.3.')) },
        { titulo: '2. SISTEMAS COMPLEMENTARES - 2.1 CAMINHOS DE CIRCULAÇÃO (WALKWAY PVC REFORÇADO)', itens: itens.filter(i => i.artigo && i.artigo.startsWith('2.1.')) }
      ]
    },
    {
      num: 4,
      secoes: [
        { titulo: '2.2 FORNECIMENTO E MONTAGEM DE SISTEMA DE LINHA DE VIDA COM PROJETO E ART', itens: itens.filter(i => i.artigo && i.artigo.startsWith('2.2.')) },
        { titulo: '2.3 IMPERMEABILIZAÇÃO DE ATRAVESSAMENTOS DE PEQUENO DIÂMETRO (PRUMOS DE ESCADAS)', itens: itens.filter(i => i.artigo && i.artigo.startsWith('2.3.')) }
      ]
    },
    {
      num: 5,
      secoes: [
        { titulo: '2.4 ATRAVESSAMENTOS TUBULARES REDONDOS Ø200mm COM ABRAÇADEIRA INOX', itens: itens.filter(i => i.artigo && i.artigo.startsWith('2.4.')) },
        { titulo: '2.6 SISTEMA SPDA - 2.6.1 SUPORTES DE SPDA COM BASE TERMOPLÁSTICA 200x200mm', itens: itens.filter(i => i.artigo && i.artigo.startsWith('2.6.1.')) }
      ]
    },
    {
      num: 6,
      secoes: [
        { titulo: '2.6.2 ATRAVESSAMENTOS TUBULARES SPDA Ø50mm PARA INTERLIGAÇÃO DE MALHA', itens: itens.filter(i => i.artigo && i.artigo.startsWith('2.6.2.')) },
        { titulo: '2.7 JUNTA DE DILATAÇÃO COM TARUCEL POLIETILENO 30mm E MANTA FATRAFOL', itens: itens.filter(i => i.artigo && i.artigo.startsWith('2.7.')) }
      ]
    },
    {
      num: 7,
      secoes: [
        { titulo: '3. FECHAMENTOS METÁLICOS - 3.1 PAINÉIS SANDWICH VERTICAIS NÚCLEO PIR 70mm', itens: itens.filter(i => i.artigo && i.artigo.startsWith('3.1.')) },
        { titulo: '3.2 REMATES DE CANTO E ARRANQUE EM CHAPA PRÉ-PINTADA RAL 9003', itens: itens.filter(i => i.artigo && i.artigo.startsWith('3.2.')) },
        { titulo: '3.3 REMATES A VÃOS EM CHAPA 0,5mm RAL 9003', itens: itens.filter(i => i.artigo && i.artigo.startsWith('3.3.')) }
      ]
    },
    {
      num: 8,
      secoes: [
        { titulo: '3.4 RUFOS CAPACETE EM CHAPA METÁLICA PRÉ-PINTADA 0,65mm RAL 9003', itens: itens.filter(i => i.artigo && i.artigo.startsWith('3.4.')) },
        { titulo: '3.5 ENVELOPAMENTO DE TUBOS DE QUEDA EM AÇO GALVALUME 0,95mm', itens: itens.filter(i => i.artigo && i.artigo.startsWith('3.5.')) },
        { titulo: '3.6 ATRAVESSAMENTOS A FACHADA (ABERTURAS 210x175mm E 610x120mm)', itens: itens.filter(i => i.artigo && (i.artigo.startsWith('3.6.1.') || i.artigo.startsWith('3.6.2.'))) }
      ]
    },
    {
      num: 9,
      secoes: [
        { titulo: '3.6.3 E 3.6.4 ATRAVESSAMENTOS ESPECIAIS DE GRANDE PORTE', itens: itens.filter(i => i.artigo && (i.artigo.startsWith('3.6.3.') || i.artigo.startsWith('3.6.4.'))) },
        { titulo: '4. SISTEMA DE DETECÇÃO DE VAZAMENTOS EFVM® (MALHA INOX E TESTES ESTANQUEIDADE)', itens: itens.filter(i => i.artigo && (i.artigo.startsWith('4.1.') || i.artigo.startsWith('4.'))) }
      ],
      hasQuadroResumo: true
    }
  ];

  gruposPaginas.forEach(pg => {
    html += `
<div class="a4-page">
  ${renderA4Header(pg.num)}
  <div class="a4-page-body">
    <table class="a4-table">
      <thead>
        <tr>
          <th style="width: 48px;">Art.</th>
          <th>Descrição Detalhada dos Materiais e Serviços</th>
          <th style="width: 35px; text-align: center;">Un.</th>
          <th style="width: 55px;" class="num">Qtd.</th>
          <th style="width: 80px;" class="num">P. Unitário</th>
          <th style="width: 90px;" class="num">P. Total</th>
        </tr>
      </thead>
      <tbody>
    `;

    pg.secoes.forEach(sec => {
      html += `
        <tr class="a4-section-header">
          <td colspan="6">${sec.titulo}</td>
        </tr>
      `;

      sec.itens.forEach(it => {
        html += `
        <tr>
          <td style="font-weight: 700; color: #475569;">${it.artigo || '-'}</td>
          <td>
            <div style="font-weight: 600; color: #0f172a;">${it.descricao}</div>
            ${it.especificacao ? `<div style="font-size: 8px; color: #64748b; margin-top: 1px;">${it.especificacao}</div>` : ''}
            <div style="font-size: 7.5px; color: #0284c7; margin-top: 1px;">Modalidade Fiscal: <strong>${it.tipo || 'Materiais Nacionais'}</strong></div>
          </td>
          <td style="text-align: center; color: #64748b;">${it.unidade || '-'}</td>
          <td class="num">${formatNumero(it.quantidade)}</td>
          <td class="num">${it.incluso ? '-' : formatMoeda(it.preco_unitario)}</td>
          <td class="num" style="font-weight: 700; color: #0f172a;">${it.incluso ? '<span style="color: #16a34a;">INCLUSO</span>' : formatMoeda(it.preco_total)}</td>
        </tr>
        `;
      });
    });

    html += `
      </tbody>
    </table>
    `;

    if (pg.hasQuadroResumo) {
      html += `
    <div class="a4-summary-card-grid">
      <div class="a4-summary-card">
        <div class="a4-summary-card-label">1. Faturamento Direto Fabricante</div>
        <div class="a4-summary-card-val">${formatMoeda(fdTotal)}</div>
      </div>
      <div class="a4-summary-card">
        <div class="a4-summary-card-label">2. Venda Mercadorias Nacionais</div>
        <div class="a4-summary-card-val">${formatMoeda(nacTotal)}</div>
      </div>
      <div class="a4-summary-card">
        <div class="a4-summary-card-label">3. Venda Mercadorias Importadas</div>
        <div class="a4-summary-card-val">${formatMoeda(impTotal)}</div>
      </div>
      <div class="a4-summary-card">
        <div class="a4-summary-card-label">4. Serviços Montagem & Engenharia</div>
        <div class="a4-summary-card-val">${formatMoeda(servTotal)}</div>
      </div>
      <div class="a4-summary-card a4-summary-card-total">
        <div class="a4-summary-card-label" style="color: #bae6fd; font-weight: 700;">VALOR TOTAL GLOBAL DA PROPOSTA (ITENS I A IV)</div>
        <div class="a4-summary-card-val">${formatMoeda(totalGeral)}</div>
      </div>
    </div>
      `;
    }

    html += `
  </div>
  ${renderA4Footer(pg.num)}
</div>
`;
  });

  // PÁGINA 10: NOTAS
  html += `
<div class="a4-page">
  ${renderA4Header(10)}
  <div class="a4-page-body">
    <div class="a4-title-bar">NOTAS APLICÁVEIS À PROPOSTA COMERCIAL E PREMISSAS TÉCNICAS</div>
    <div style="display: flex; flex-direction: column; gap: 4px;">
  `;

  notas.forEach((nota, nIdx) => {
    html += `
      <div class="a4-note-row">
        <div class="a4-note-num">${nIdx + 1}</div>
        <div>${nota}</div>
      </div>
    `;
  });

  html += `
    </div>
  </div>
  ${renderA4Footer(10)}
</div>
`;

  // PÁGINA 11: ANEXO I
  html += `
<div class="a4-page">
  ${renderA4Header(11)}
  <div class="a4-page-body">
    <div class="a4-title-bar">${anexo.titulo || 'ANEXO I - ESPECIFICAÇÕES TÉCNICAS E QUANTITATIVOS'}</div>
    <div style="font-size: 9.5px; color: #64748b; margin-top: -6px; margin-bottom: 12px; font-weight: 600;">
      ${anexo.subtitulo || 'Mapeamento de Áreas, Juntas de Dilatação e Sistemas Construtivos Homologados'}
    </div>

    <h3 style="font-size: 10px; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; font-weight: 800;">1. Soluções e Sistemas Construtivos da Empreitada</h3>
  `;

  (anexo.sistemas || []).forEach(sis => {
    html += `
    <div class="a4-box">
      <h4>${sis.nome}</h4>
      <p>${sis.detalhes}</p>
    </div>
    `;
  });

  html += `
    <h3 style="font-size: 10px; color: #0f172a; margin-top: 10px; margin-bottom: 6px; text-transform: uppercase; font-weight: 800;">2. Extensões e Áreas Homologadas do Projeto</h3>
    <table class="a4-table">
      <thead>
        <tr>
          <th>Descrição do Elemento Construtivo</th>
          <th style="width: 100px; text-align: center;">Unidade</th>
          <th style="width: 120px;" class="num">Quantidade Medida</th>
        </tr>
      </thead>
      <tbody>
  `;

  (anexo.areas_homologadas || []).forEach(ar => {
    html += `
        <tr>
          <td style="font-weight: 500;">${ar.descricao}</td>
          <td style="text-align: center; color: #64748b;">${ar.unidade}</td>
          <td class="num" style="font-weight: 700; color: #0f172a;">${formatNumero(ar.quantidade)}</td>
        </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  </div>
  ${renderA4Footer(11)}
</div>
`;

  // PÁGINA 12: CONDIÇÕES GERAIS
  html += `
<div class="a4-page">
  ${renderA4Header(12)}
  <div class="a4-page-body">
    <div class="a4-title-bar">CONDIÇÕES GERAIS DE FORNECIMENTO, CONTRATO & REGRAS FISCAIS</div>

    <div class="cover-meta-grid" style="margin-bottom: 12px; padding: 10px 14px;">
      <div class="cover-meta-col">
        <h4>Regime de Contratação & Tributos</h4>
        <div class="cover-meta-item"><strong>Regime:</strong> ${cond.regime || 'À medição física'}</div>
        <div class="cover-meta-item"><strong>Tributação:</strong> Inclusos todos os impostos Federais, Estaduais e Municipais</div>
        <div class="cover-meta-item"><strong>Validade:</strong> ${cond.validade_dias || 5} dias a contar da emissão</div>
      </div>
      <div class="cover-meta-col">
        <h4>Garantia & Retenções Contratuais</h4>
        <div class="cover-meta-item"><strong>Retenção:</strong> ${cond.retencao_percentual || 5.0}% do valor total do contrato</div>
        <div class="cover-meta-item"><strong>Liberação:</strong> ${cond.retencao_prazo_dias || 90} dias após entrega definitiva</div>
        <div class="cover-meta-item"><strong>Reajuste:</strong> Preços fixos 12 meses; após, reajuste pelo INCC/FGV</div>
      </div>
    </div>

    <h3 style="font-size: 10px; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; font-weight: 800;">Cronograma Físico-Financeiro & Condições de Faturamento</h3>
    <div style="display: flex; flex-direction: column; gap: 5px;">
  `;

  (cond.condicoes_pagamento || []).forEach((cp, cpIdx) => {
    html += `
      <div class="a4-box" style="display: flex; gap: 10px; align-items: flex-start;">
        <div class="a4-note-num" style="background: #0284c7; color: white; border: none;">${cpIdx + 1}</div>
        <div style="font-size: 9px; color: #334155; line-height: 1.4;">${cp}</div>
      </div>
    `;
  });

  html += `
    </div>
  </div>
  ${renderA4Footer(12)}
</div>
`;

  // PÁGINA 13: MATRIZ
  html += `
<div class="a4-page">
  ${renderA4Header(13)}
  <div class="a4-page-body">
    <div class="a4-title-bar">MATRIZ DE RESPONSABILIDADES DA EMPREITADA (ESCOPO OPERACIONAL)</div>
    <div style="font-size: 9px; color: #64748b; margin-top: -6px; margin-bottom: 8px;">
      Delimitação estrita de obrigações e escopo operacional entre a OMNITRADE BRASIL e o CLIENTE CONTRATANTE.
    </div>

    <table class="a4-table" style="font-size: 8.5px;">
      <thead>
        <tr>
          <th style="width: 25px; text-align: center;">#</th>
          <th>Descrição do Fornecimento / Atividade de Canteiro</th>
          <th style="width: 75px; text-align: center;">OMNITRADE</th>
          <th style="width: 75px; text-align: center;">CLIENTE</th>
        </tr>
      </thead>
      <tbody>
  `;

  matriz.forEach(m => {
    html += `
        <tr>
          <td style="text-align: center; color: #64748b; font-weight: 700;">${m.item}</td>
          <td>${m.descricao}</td>
          <td style="text-align: center; font-weight: 800; font-size: 11px; color: ${m.omnitrade ? '#16a34a' : '#cbd5e1'};">${m.omnitrade ? '✔' : '—'}</td>
          <td style="text-align: center; font-weight: 800; font-size: 11px; color: ${m.cliente ? '#0284c7' : '#cbd5e1'};">${m.cliente ? '✔' : '—'}</td>
        </tr>
    `;
  });

  html += `
      </tbody>
    </table>

    <div style="margin-top: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;">
      <div style="font-weight: 700; font-size: 10px; color: #0f172a; margin-bottom: 4px;">ACEITE FORMAL DA PROPOSTA COMERCIAL</div>
      <div style="font-size: 8.5px; color: #64748b; line-height: 1.35;">
        As partes declaram estar cientes e de acordo com todas as especificações técnicas, quantitativos, notas, condições comerciais e matriz de responsabilidades constantes nesta Proposta Técnica Comercial nº <strong>${p.referencia || 'BR_23263RCS'}</strong>.
      </div>

      <div class="a4-signature-grid">
        <div class="a4-signature-box">
          <strong>${c.nome || 'RACIONAL ENGENHARIA LTDA'}</strong>
          <div>De Acordo / Assinatura do Contratante</div>
          <div style="font-size: 8px; color: #94a3b8; margin-top: 2px;">Data: ____/____/________</div>
        </div>
        <div class="a4-signature-box">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 2px;"><img src="data:image/png;base64,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" style="width: 16px; height: 16px;"> <strong style="font-size: 10.5px; color: #0f172a; margin: 0;">OMNITRADE BRASIL REVESTIMENTOS METÁLICOS, LDA</strong></div>
          <div>Diretoria Comercial & Engenharia de Custos</div>
          <div style="font-size: 8px; color: #94a3b8; margin-top: 2px;">Data: ${p.data || '29/05/2024'}</div>
        </div>
      </div>
    </div>
  </div>
  ${renderA4Footer(13)}
</div>

</body>
</html>
`;

  return html;
}

function gerarPdfDoProjeto(projetoJson, outputPath, callback) {
  const browserPath = getBrowserPath();
  const htmlContent = gerarHtmlProposta(projetoJson);
  const tempHtmlPath = path.join(__dirname, 'temp_proposta.html');

  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  const args = [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    `--print-to-pdf=${outputPath}`,
    `file:///${tempHtmlPath.replace(/\\/g, '/')}`
  ];

  execFile(browserPath, args, (err, stdout, stderr) => {
    try { fs.unlinkSync(tempHtmlPath); } catch(e) {}
    if (err) return callback(err);
    if (!fs.existsSync(outputPath)) return callback(new Error('PDF não foi gerado no caminho esperado.'));
    callback(null, outputPath);
  });
}

module.exports = {
  gerarHtmlProposta,
  gerarPdfDoProjeto
};
