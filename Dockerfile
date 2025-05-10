FROM node:18.18.0

# Client uygulaması
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Server uygulaması
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --ignore-scripts
COPY server/ .

# TypeScript'i global olarak yükle
RUN npm install -g ts-node typescript

# Environemnt değişkenlerini ayarla
ENV NODE_ENV=production

# Server'ı doğrudan ts-node ile başlat (derleme hatasını atla)
EXPOSE 5555
CMD ["ts-node", "src/server.ts"] 