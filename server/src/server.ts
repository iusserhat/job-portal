import Application from "./application";
import { loadModels } from "./models";
import path from "path";
import express from "express";

// Önce modelleri yükle
console.log("🔧 Mongoose modellerini yükleme...");
loadModels();

const app = new Application();

// Root endpoint'i sağlık kontrolü için ekleyelim - tüm middlewarelerden önce
app.server.get('/api/v1/root-health', (req, res) => {
  res.json({ 
    status: 'live',
    message: 'Job Portal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API_ONLY modunda çalışmıyorsak ve Production ortamındaysak client dosyalarını servis et
if (process.env.NODE_ENV === 'production' && process.env.API_ONLY !== 'true') {
  console.log("📂 Production modunda client dosyalarını servis etme ayarları yapılıyor");
  
  try {
    const clientDistPath = path.join(__dirname, '../../client/dist');
    
    // Client dist klasörünün varlığını kontrol et
    if (require('fs').existsSync(clientDistPath)) {
      // Express uygulamamıza erişim
      app.server.use(express.static(clientDistPath));
      
      // API olmayan tüm istekleri index.html'e yönlendir (React router için)
      app.server.get('*', (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          console.log(`📄 Client rotasına yönlendiriliyor: ${req.url}`);
          res.sendFile(path.join(clientDistPath, 'index.html'));
        } else {
          next(); // API isteklerini bir sonraki middleware'e ilet
        }
      });
    } else {
      console.log("⚠️ Client dist klasörü bulunamadı, sadece API modunda çalışılıyor");
    }
  } catch (error) {
    console.log("⚠️ Client dosyalarını servis ederken hata oluştu:", error);
  }
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
