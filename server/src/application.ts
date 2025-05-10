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

class Application {
  public server;

  constructor() {
    this.server = express();

    this.environment();
    this.database();
    this.middlewares();
    this.passport();
    this.routes();
    this.initDirectories();
  }

  private environment() {
    dotenv.config();
  }

  private middlewares() {
    this.server.use(cors({
      origin: ['http://localhost:5137', 'http://localhost:3000', 'http://127.0.0.1:5137', '*'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization']
    }));
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
    
    // CORS ön kontrol isteklerini her durumda kabul et
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

  private routes() {
    new Routes(this.server);
    this.server.use(errorMiddleware);

    // Health check endpoint'i ekle
    this.server.get('/api/v1/health', (req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private initDirectories() {
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
        
        await Seeders.run();
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
