FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Global modülleri kur
RUN npm install -g ts-node typescript

# Önce package.json dosyasını kopyala
COPY server/package.json .

# Bağımlılıkları yükle
RUN npm install

# Kodları kopyala
COPY server/src ./src
COPY server/tsconfig.json .

# Environment değişkenlerini ayarla
ENV NODE_ENV=production
ENV TS_NODE_TRANSPILE_ONLY=true
ENV TS_NODE_SKIP_PROJECT=true

# Uygulamayı başlat
EXPOSE 5555
CMD ["ts-node", "--transpile-only", "--skip-project", "src/server.ts"] 