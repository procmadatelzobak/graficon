#!/bin/bash

# Zastav skript při chybě
set -e

APP_DIR="/opt/graficon"
USER="root" # Pod kým to poběží (ideálně vytvořit usera 'graficon', ale pro zjednodušení root)

echo "--- [1/5] Aktualizace systému a instalace závislostí ---"
apt-get update
apt-get install -y curl git unzip build-essential

# Instalace Node.js 20 (LTS)
if ! command -v node &> /dev/null; then
    echo "Instaluji Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js již nainstalován: $(node -v)"
fi

# Instalace PM2 (Process Manager)
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo "--- [2/5] Příprava aplikace ---"
cd "$APP_DIR"

# Instalace závislostí backendu
echo "Instaluji Backend deps..."
npm install

# Instalace závislostí frontendu
echo "Instaluji Frontend deps..."
cd frontend
npm install
cd ..

echo "--- [3/5] Build Frontendu ---"
# Environment variables pro build (pokud by byly potřeba)
npm run build:all # Tento skript musíš mít v package.json (viz níže), nebo to uděláme ručně:
# Ruční build:
cd frontend
npm run build
cd ..
# Přesun dist do backend public (pokud to server.js očekává v /frontend/dist, nemusíme přesouvat, jen se ujistit, že cesta sedí)

echo "--- [4/5] Konfigurace ---"
if [ ! -f .env ]; then
    echo "Vytvářím vzorový .env (Nezapomeň ho upravit!)"
    echo "API_TOKEN=tajneheslo123" > .env
    echo "PORT=3000" >> .env
    echo "ADMIN_USER=admin" >> .env
fi

echo "--- [5/5] Spuštění přes PM2 ---"
# Zastav starý proces, pokud běží
pm2 delete graficon 2>/dev/null || true

# Spusť nový
pm2 start server.js --name graficon

# Uložení PM2, aby naběhl po restartu
pm2 save
pm2 startup | bash 2>/dev/null || true # Toto občas vyžaduje ruční copy-paste příkazu, co to vypíše

echo "=== HOTOVO! Graficon běží na portu 3000 ==="
