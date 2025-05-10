FROM node:18.18.0

# Client uygulaması
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Server uygulaması için yeni yaklaşım
WORKDIR /app/server
COPY server/package*.json ./
# TypeScript bağımlılıklarını atlayarak sadece çalışma zamanı bağımlılıklarını kur
RUN npm install --only=production
COPY server/ .

# Ana dizine geç
WORKDIR /app
COPY package.json ./
COPY start.sh ./
RUN chmod +x start.sh

# Node.js'in TypeScript dosyalarını çalıştırması için ts-node ve typescript'i yükle
RUN npm install -g ts-node typescript

# NODE_OPTIONS ile TypeScript hatalarını bastır
ENV NODE_ENV=production
ENV NODE_OPTIONS="--no-warnings --max-old-space-size=2048"
ENV TS_NODE_TRANSPILE_ONLY=true
ENV TS_NODE_SKIP_PROJECT=true

# Server'ı doğrudan ts-node ile başlat ve tip kontrollerini atla
EXPOSE 5555
CMD ["./start.sh"] 