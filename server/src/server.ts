import Application from "./application";
import { loadModels } from "./models";
import path from "path";
import express from "express";

// Önce modelleri yükle
console.log("🔧 Mongoose modellerini yükleme...");
loadModels();

const app = new Application();

// Production ortamında client build dosyalarını servis et
if (process.env.NODE_ENV === 'production') {
  app.server.use(express.static(path.join(__dirname, '../../client/dist')));
  
  app.server.get('*', (req, res) => {
    // API endpoint'leri dışındaki tüm istekleri client uygulamasına yönlendir
    if (!req.url.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    }
  });
}

app.start();

process.on("uncaughtException", (err: Error) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");

  process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");

  process.exit(1);
});
