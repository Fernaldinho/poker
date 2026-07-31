@echo off
REM Poker Analyzer - boot rápido de desenvolvimento
REM Executa frontend + backend com hot reload

start "backend" cmd /k "cd /d %~dp0.. && npm run dev:backend"
start "frontend" cmd /k "cd /d %~dp0.. && npm run dev:frontend"
echo Ambos servidores iniciados em janelas separadas.
