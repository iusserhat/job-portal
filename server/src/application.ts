import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Routes from "./routes";
import Seeders from "./seeders";
import { errorMiddleware } from "./middlewares/error.middleware";
import passport from "passport";
import { loadModels } from "./models";
import { corsMiddleware } from "./middlewares/cors.middleware";

class Application {
  public server;

  constructor() {
    this.server = express();

    this.environment();
    this.setupCORS();
    this.middlewares();
    this.setupHealthChecks();
    this.database();
    this.passport();
    this.routes();
    this.initDirectories();
    this.serveClientFiles();
  }

  private environment() {
    dotenv.config();
  }

  private setupCORS() {
    // CORS ayarları için tüm olası client origin'lerini tanımlayalım
    const allowedOrigins = [
      'https://serene-begonia-ded421.netlify.app',
      'https://job-portal-gfus.onrender.com',
      'http://localhost:5138', 
      'http://localhost:5137',
      'http://localhost:3000'
    ];
  
    // Temel CORS middleware'ini ayarlayalım
    this.server.use(cors({
      origin: function(origin, callback) {
        // Origin boş olabilir (örn. doğrudan Postman istekleri için)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log('CORS origin denied:', origin);
          callback(null, true); // Üretimde tüm origin'lere izin verelim şimdilik
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true
    }));
    
    // OPTIONS isteklerine direkt cevap vermek için
    this.server.options('*', (req, res) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      res.status(200).end();
    });
  }

  private middlewares() {
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
    
    // Her istekte CORS başlıklarını eklemek için middleware
    this.server.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      next();
    });
  }

  private setupHealthChecks() {
    // Health check endpoint'leri ayarla
    // Health check endpoint'i - Backend'in sağlık durumunu kontrol eder
    this.server.get('/api/v1/health', (req, res) => {
      // CORS başlıklarını ekle
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    // Root endpoint'i için health check
    this.server.get('/', (req, res) => {
      // CORS başlıklarını ekle
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      
      return res.status(200).json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
    });
    
    // Render özel health check endpoint'i
    this.server.get('/health', (req, res) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private serveClientFiles() {
    if (process.env.NODE_ENV === 'production' && process.env.API_ONLY !== 'true') {
      console.log("📂 Production modunda client dosyalarını servis etme ayarları yapılıyor");
  
      try {
        const clientDistPath = path.join(__dirname, '../../client/dist');
    
        // Client dist klasörünün varlığını kontrol et
        if (fs.existsSync(clientDistPath)) {
          // Express uygulamamıza erişim
          this.server.use(express.static(clientDistPath));
      
          // API olmayan tüm istekleri index.html'e yönlendir (React router için)
          this.server.get('*', (req, res, next) => {
            if (!req.url.startsWith('/api/') && !req.url.startsWith('/health')) {
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
  }

  private routes() {
    // Ana rota işleyicisini ekle
    new Routes(this.server);
    
    // En son hata middleware'ini ekle
    this.server.use(errorMiddleware);
  }

  private initDirectories() {
    try {
      // Public directory
      if (!fs.existsSync(path.join(__dirname, "../public"))) {
        fs.mkdirSync(path.join(__dirname, "../public"));
      }

      // Resume directory
      if (!fs.existsSync(path.join(__dirname, "../public/resumes"))) {
        fs.mkdirSync(path.join(__dirname, "../public/resumes"));
      }

      // Uploads directory
      if (!fs.existsSync(path.join(__dirname, "../public/uploads"))) {
        fs.mkdirSync(path.join(__dirname, "../public/uploads"));
      }
    } catch (error) {
      console.error("Dizin oluşturma hatası:", error);
    }
  }

  private database() {
    const MONGO_URL: string = process.env.MONGO_URL || "";
    console.log(`MongoDB bağlantısı kuruluyor: ${MONGO_URL.substring(0, 20)}...`);

    // MongoDB bağlantı seçenekleri
    const mongooseOptions: any = {
      serverSelectionTimeoutMS: process.env.MONGO_CONNECT_TIMEOUT ? parseInt(process.env.MONGO_CONNECT_TIMEOUT) : 30000,
      socketTimeoutMS: process.env.MONGO_SOCKET_TIMEOUT ? parseInt(process.env.MONGO_SOCKET_TIMEOUT) : 45000,
      retryWrites: true,
      w: 'majority'
    };

    mongoose
      .connect(MONGO_URL, mongooseOptions)
      .then(async () => {
        console.log(`✅[Server]: Database is connected`);
        
        // Modelleri yükle - populate için gerekli
        loadModels();
        
        try {
          console.log(`🌱[Server]: Running seeders`);
          await Seeders.run();
          console.log(`✅[Server]: Seeders completed`);
        } catch (seedError) {
          console.error(`❌[Server]: Seeder error:`, seedError);
        }
      })
      .catch((error) => {
        console.log(`❌[Server] Database connection error: ${error}`);
      });
  }

  private passport() {
    this.server.use(passport.initialize());
    require("./middlewares/jwt.middleware")(passport);
  }

  public start() {
    const PORT: number = process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : 5555;
    this.server
      .listen(PORT, () => {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⚡️[Server]: Server is running at http://localhost:${PORT}`
          );
        } else {
          console.log(`⚡️[Server]: Server is running`);
        }
      })
      .on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.log(`❌ Error: address already in use`);
        } else {
          console.log(err);
        }
      });
  }
}

export default Application;