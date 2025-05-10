FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Önce package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Client ve server klasörlerini tamamen kopyala
COPY client ./client
COPY server ./server

# Client build işlemi
WORKDIR /app/client
RUN npm install
RUN npm run build

# Server kurulum
WORKDIR /app/server
RUN npm install

# Çalıştırma
WORKDIR /app
EXPOSE 5555
CMD ["sh", "-c", "cd server && TS_NODE_TRANSPILE_ONLY=true TS_NODE_SKIP_PROJECT=true npx ts-node src/server.ts"] 