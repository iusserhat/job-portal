FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Öncelikle package.json dosyalarını kopyalayalım (daha verimli önbellek kullanımı için)
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Client kurulum ve build
WORKDIR /app/client
RUN npm install

# Server kurulum
WORKDIR /app/server
RUN npm install

# Şimdi tüm kaynak kodları kopyala
WORKDIR /app
COPY client/src ./client/src
COPY client/public ./client/public
COPY client/index.html ./client/
COPY client/tsconfig*.json ./client/
COPY client/vite.config.ts ./client/
COPY client/tailwind.config.js ./client/
COPY client/postcss.config.js ./client/

COPY server/src ./server/src
COPY server/tsconfig.json ./server/

# Client build
WORKDIR /app/client
RUN npm run build

# Ana dizine dön
WORKDIR /app

# Portu belirle ve uygulamayı başlat
EXPOSE 5555
CMD ["sh", "-c", "cd server && TS_NODE_TRANSPILE_ONLY=true TS_NODE_SKIP_PROJECT=true npx ts-node src/server.ts"] 