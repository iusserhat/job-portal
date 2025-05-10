FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Sadece server klasörünü kopyala
COPY server ./server

# Server kurulumu
WORKDIR /app/server
RUN npm install

# TypeScript derleme seçeneklerini ayarla
ENV TS_NODE_TRANSPILE_ONLY=true
ENV TS_NODE_SKIP_PROJECT=true
ENV TS_NODE_IGNORE_DIAGNOSTICS=true

# Portu belirle ve uygulamayı başlat
EXPOSE 5555
CMD ["sh", "-c", "npx ts-node src/server.ts"] 