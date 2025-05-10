FROM node:18.18.0 as build

# Client uygulamasını kur ve build et
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Server uygulamasını kur
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .

# Server'ı başlat
EXPOSE 5555
CMD ["npm", "run", "start"] 