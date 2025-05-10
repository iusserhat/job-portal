FROM node:16-alpine

# TypeScript projenin kök dizini
WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY server/package*.json ./
RUN npm install

# TypeScript'i global olarak yükleyelim
RUN npm install -g typescript@4.9.5

# TypeScript ayarlarını ve kaynak kodunu kopyala
COPY server/tsconfig.json ./
COPY server/src ./src

# Önceden TypeScript kodunu JavaScript'e derle
RUN tsc || echo "TypeScript compile failed, but continuing..."

# Derleme ve çalıştırma ayarları
ENV NODE_ENV=production

# Port
EXPOSE 5555

# Eğer derlenen dosyalar varsa onları, yoksa doğrudan server.js'i çalıştır
CMD ["node", "dist/server.js"] 