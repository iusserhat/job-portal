FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Tüm projeyi kopyala
COPY . .

# Client build
RUN cd client && npm install && npm run build

# Server hazırla
RUN cd server && npm install

# Portu belirle ve uygulamayı başlat
EXPOSE 5555
CMD ["sh", "-c", "cd server && TS_NODE_TRANSPILE_ONLY=true TS_NODE_SKIP_PROJECT=true npx ts-node src/server.ts"] 