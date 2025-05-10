import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

/**
 * BasicJobsController
 * Hiçbir populate işlemi veya karmaşık sorgulama olmayan basit bir controller.
 * Temel CRUD işlemleri için.
 */
export default class BasicJobsController {
  
  /**
   * İş ilanlarını getiren basit metod - populate kullanmaz
   */
  public static async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      // CORS header'ları ekle - Tüm origin'lere izin ver
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      
      // OPTIONS isteği gelirse hemen yanıt ver
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      console.log("BasicJobsController - getJobs - istek alındı:", req.url);
      
      // Sayfalama için querystring'den parametreleri al, ama opsiyonel
      const { page = 1, limit = 50 } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      
      // job_post koleksiyonundan doğrudan çekim yapıyoruz
      // Hiçbir karmaşık ilişki veya populate kullanmıyoruz
      const db = mongoose.connection.db;
      
      // Doğrudan MongoDB koleksiyonundan çekiyoruz, Mongoose model katmanını bypass ediyoruz
      const jobsCollection = db.collection('job_post');
      
      console.log("BasicJobsController - ilanlar getiriliyor");
      
      try {
        // Doğrudan find() ile tüm kayıtları al (sınırlı sayıda)
        const jobs = await jobsCollection.find({})
          .sort({ created_date: -1 })
          .skip(skip)
          .limit(limitNum)
          .toArray();
        
        console.log(`BasicJobsController - ${jobs.length} ilan bulundu`);
        
        return res.status(StatusCodes.OK).json({
          success: true,
          data: jobs
        });
      } catch (dbError) {
        console.error('MongoDB sorgu hatası:', dbError);
        
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "İş ilanları getirilemedi, veritabanı sorgusu başarısız",
          error: dbError instanceof Error ? dbError.message : String(dbError)
        });
      }
    } catch (error) {
      console.error('İş ilanları getirme hatası:', error);
      
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "İş ilanları getirilemedi",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Tekil iş ilanı getiren basit metod
   */
  public static async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      // CORS header'ları ekle - Tüm origin'lere izin ver
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      
      // OPTIONS isteği gelirse hemen yanıt ver
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      console.log("BasicJobsController - getJob - istek alındı:", req.url);
      
      const { job_id } = req.params;
      
      if (!job_id || !mongoose.Types.ObjectId.isValid(job_id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false, 
          message: "Geçersiz iş ilanı ID'si"
        });
      }
      
      console.log("BasicJobsController - getJob - job_id:", job_id);
      
      // Doğrudan MongoDB koleksiyonundan çekiyoruz
      const db = mongoose.connection.db;
      const jobsCollection = db.collection('job_post');
      
      try {
        const job = await jobsCollection.findOne({ 
          _id: new mongoose.Types.ObjectId(job_id) 
        });
        
        console.log("BasicJobsController - getJob - sonuç:", job ? "İlan bulundu" : "İlan bulunamadı");
        
        if (!job) {
          return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "İş ilanı bulunamadı"
          });
        }
        
        return res.status(StatusCodes.OK).json({
          success: true,
          data: job
        });
      } catch (dbError) {
        console.error('MongoDB sorgu hatası:', dbError);
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "İş ilanı getirilemedi, veritabanı sorgusu başarısız",
          error: dbError instanceof Error ? dbError.message : String(dbError)
        });
      }
    } catch (error) {
      console.error('İş ilanı getirme hatası:', error);
      
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "İş ilanı getirilemedi",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
} 