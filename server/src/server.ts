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
  console.log("📂 Production modunda client dosyalarını servis etme ayarları yapılıyor");
  
  // Express uygulamamıza erişim
  app.server.use(express.static(path.join(__dirname, '../../client/dist')));
  
  // API olmayan tüm istekleri index.html'e yönlendir (React router için)
  app.server.get('*', (req, res) => {
    if (!req.url.startsWith('/api/')) {
      console.log(`📄 Client rotasına yönlendiriliyor: ${req.url}`);
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
