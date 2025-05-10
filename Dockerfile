FROM node:16-alpine

# TypeScript projenin kök dizini
WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY server/package*.json ./
RUN npm install

# TypeScript ayarlarını ve kaynak kodunu kopyala
COPY server/tsconfig.json ./
COPY server/src ./src

# Derleme ve çalıştırma ayarları
ENV NODE_ENV=production
ENV TS_NODE_TRANSPILE_ONLY=true
ENV TS_NODE_SKIP_PROJECT=true
ENV TS_NODE_IGNORE_DIAGNOSTICS=true

# Port
EXPOSE 5555

# ts-node ile çalıştır (doğru bayraklarla)
CMD ["npx", "ts-node", "--transpile-only", "src/server.ts"] 