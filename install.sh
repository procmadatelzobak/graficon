#!/bin/bash

# --- KONFIGURACE ---
APP_USER="graficon"
APP_PASS="graficon"
APP_HOME="/home/$APP_USER"
REPO_URL="https://github.com/procmadatelzobak/graficon.git"
APP_DIR="$APP_HOME/graficon"
PM2_APP_NAME="graficon"

# Zastav skript při chybě
set -e

echo "=================================================="
echo "   GRAFICON INSTALLER & UPDATER"
echo "=================================================="

# 1. Kontrola root oprávnění
if [ "$EUID" -ne 0 ]; then
  echo "!! Prosím spusťte tento skript jako root (sudo ./install.sh)"
  exit 1
fi

# 2. Aktualizace systému a instalace prerekvizit
echo "--- [1/6] Aktualizace systému a instalace nástrojů ---"
apt-get update
apt-get upgrade -y
apt-get install -y curl git unzip build-essential sudo

# 3. Instalace Node.js 20 (LTS)
if ! command -v node &> /dev/null; then
    echo "Instaluji Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js již nainstalován: $(node -v)"
fi

# 4. Instalace PM2 (Process Manager)
if ! command -v pm2 &> /dev/null; then
    echo "Instaluji PM2..."
    npm install -g pm2
else
    echo "PM2 již nainstalován."
fi

# 5. Vytvoření uživatele graficon
echo "--- [2/6] Nastavení uživatele $APP_USER ---"
if id "$APP_USER" &>/dev/null; then
    echo "Uživatel $APP_USER již existuje."
else
    echo "Vytvářím uživatele $APP_USER..."
    useradd -m -s /bin/bash $APP_USER
    echo "$APP_USER:$APP_PASS" | chpasswd
    echo "Uživatel vytvořen."
fi

# 6. Stažení nebo aktualizace repozitáře (Git)
echo "--- [3/6] Stahování zdrojového kódu ---"
if [ -d "$APP_DIR" ]; then
    echo "Složka existuje, provádím GIT PULL..."
    # Spustíme git pull jako uživatel graficon, abychom nerozbili práva
    sudo -u $APP_USER git -C "$APP_DIR" pull
else
    echo "Klonuji repozitář..."
    sudo -u $APP_USER git clone "$REPO_URL" "$APP_DIR"
fi

# 7. Instalace závislostí a Build
echo "--- [4/6] Instalace závislostí a Build aplikace ---"
cd "$APP_DIR"

# Backend deps
echo "Instaluji Backend dependencies..."
sudo -u $APP_USER npm install

# Frontend deps & Build
echo "Instaluji Frontend dependencies..."
cd frontend
sudo -u $APP_USER npm install

echo "Spouštím Build frontendu..."
# Pokud máte v package.json skript "build", spustí se.
# Vite build vytvoří složku 'dist'.
sudo -u $APP_USER npm run build
cd ..

# 8. Konfigurace .env (pokud neexistuje)
echo "--- [5/6] Konfigurace prostředí ---"
if [ ! -f "$APP_DIR/.env" ]; then
    echo "Vytvářím výchozí .env soubor..."
    # Vytvoříme soubor rovnou se správnými právy
    sudo -u $APP_USER bash -c "echo 'API_TOKEN=tajneheslo123' > $APP_DIR/.env"
    sudo -u $APP_USER bash -c "echo 'PORT=3000' >> $APP_DIR/.env"
    sudo -u $APP_USER bash -c "echo 'ADMIN_USER=admin' >> $APP_DIR/.env"
    echo "POZOR: Byl vytvořen soubor .env s výchozím heslem. Doporučujeme ho změnit!"
else
    echo "Soubor .env již existuje, přeskakuji."
fi

# 9. Restart aplikace přes PM2
echo "--- [6/6] Restartování služby ---"

# Zastavíme případný běžící proces (pokud běžel pod rootem z minula, smažeme ho)
pm2 delete $PM2_APP_NAME 2>/dev/null || true

# Spustíme aplikaci pod uživatelem graficon
echo "Spouštím aplikaci pod uživatelem $APP_USER..."
cd "$APP_DIR"
sudo -u $APP_USER pm2 start server.js --name $PM2_APP_NAME

# Uložíme stav PM2 pro uživatele graficon
sudo -u $APP_USER pm2 save

# Nastavíme Startup skript (aby to naběhlo po rebootu)
# PM2 startup generuje příkaz, který se musí spustit jako root.
# Zde říkáme PM2, aby generoval startup skript pro uživatele 'graficon'
echo "Nastavuji autostart..."
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $APP_USER --hp $APP_HOME | bash 2>/dev/null || true

echo "=================================================="
echo "   INSTALACE DOKONČENA!"
echo "   Aplikace běží pod uživatelem '$APP_USER'."
echo "   Web: http://$(curl -s ifconfig.me):3000"
echo "=================================================="
