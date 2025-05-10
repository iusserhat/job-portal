FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Sadece server klasörünü kopyala
COPY server ./server

# Server kurulumu
WORKDIR /app/server
RUN npm install

# Portu belirle ve uygulamayı başlat
EXPOSE 5555
CMD ["sh", "-c", "TS_NODE_TRANSPILE_ONLY=true TS_NODE_SKIP_PROJECT=true npx ts-node src/server.ts"] 