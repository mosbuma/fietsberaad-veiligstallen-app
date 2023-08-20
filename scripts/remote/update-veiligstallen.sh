source /etc/profile.d/01-locale-fix.sh
. ~/.nvm/nvm.sh

cd ~/fietsberaad-veiligstallen-app
pm2 stop 0
git pull
npm install
npm run build
pm2 start 0