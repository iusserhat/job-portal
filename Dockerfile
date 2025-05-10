FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Client ve server klasörlerini kopyala
COPY client ./client
COPY server ./server

# Client kurulum ve build
WORKDIR /app/client
RUN npm install
RUN npm run build

# Server kurulum
WORKDIR /app/server
RUN npm install

# Ana dizine dön
WORKDIR /app

# Portu belirle ve uygulamayı başlat
EXPOSE 5555
CMD ["sh", "-c", "cd server && TS_NODE_TRANSPILE_ONLY=true TS_NODE_SKIP_PROJECT=true npx ts-node src/server.ts"] 