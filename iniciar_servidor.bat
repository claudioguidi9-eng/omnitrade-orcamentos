@echo off
chcp 65001 > nul
title OmniTrade AI - Sistema de Orcamentos e Propostas Oficiais
cd /d "C:\D\Omni\orcamento"
echo ==============================================================
echo       OMNITRADE BRASIL - ENGENHARIA DE CUSTOS & ORCAMENTO
echo ==============================================================
echo.
echo Abrindo aplicacao web em http://localhost:3344 ...
start http://localhost:3344
node server.js
pause
