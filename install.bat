@echo off
cd /d "%~dp0"
set npm_config_offline=false
set npm_config_cache=%USERPROFILE%\.npm
npm install
pause
