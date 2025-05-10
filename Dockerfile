FROM node:18-alpine

WORKDIR /app

# Server kodlarını kopyala
COPY server ./

# Bağımlılıkları yükle
RUN npm install

# Çalışma zamanı ayarları
ENV NODE_ENV=production
ENV TS_NODE_TRANSPILE_ONLY=true
ENV TS_NODE_SKIP_PROJECT=true
ENV TS_NODE_IGNORE_DIAGNOSTICS=true

# Uygulamayı başlat
EXPOSE 5555
CMD ["npm", "run", "railway"] 