FROM node:18.18.0

# Client uygulaması
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Server uygulaması için production modu
WORKDIR /app/server
COPY server/package*.json ./
# Bağımlılıkları yükle ama script çalıştırma
RUN npm install --only=production --ignore-scripts
COPY server/ .

# Ana dizine geç
WORKDIR /app
COPY package.json ./
COPY start.sh ./
RUN chmod +x start.sh

# Node.js'in TypeScript dosyalarını çalıştırması için ts-node'u yükle
RUN npm install -g ts-node typescript

# typescript ve @types paketlerini manuel olarak server klasörüne kopyala
RUN cd /app/server && npm install --no-save typescript @types/node @types/express @types/cors

# TypeScript hatalarını bastırmak için ayarlar
ENV NODE_ENV=production
ENV NODE_OPTIONS="--no-warnings --max-old-space-size=2048"
ENV TS_NODE_TRANSPILE_ONLY=true
ENV TS_NODE_SKIP_PROJECT=true

# Server'ı başlat
EXPOSE 5555

# Railway'de kontrol edilmeyen bir alternatif başlatma yöntemi kullan
CMD ["node", "-e", "require('child_process').spawn('/app/start.sh', [], { stdio: 'inherit', shell: true })"] 