import { Request, Response } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

/**
 * Basit bir iş ilanı kontrolcüsü.
 * Bu kontrolcü, herhangi bir ara katman veya kimlik doğrulama olmadan MongoDB'ye doğrudan erişir.
 * Geliştirme ve test için hazırlanmıştır.
 */
export default class DirectJobsController {
  
  /**
   * Tüm iş ilanlarını listeler
   */
  public static async listJobs(req: Request, res: Response) {
    console.log("DirectJobsController - listJobs çağrıldı");
    
    try {
      // MongoDB'ye doğrudan erişim
      const db = mongoose.connection.db;
      if (!db) {
        console.error("MongoDB bağlantısı bulunamadı");
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          success: false,
          message: "Veritabanı bağlantısı sağlanamadı"
        });
      }
      
      // İş ilanları koleksiyonuna erişim
      const jobCollection = db.collection('job_post');
      console.log("MongoDB koleksiyonuna erişim sağlandı: job_post");
      
      // Tüm iş ilanlarını getir
      const jobs = await jobCollection.find({}).sort({ created_date: -1 }).limit(50).toArray();
      console.log(`${jobs.length} iş ilanı bulundu`);
      
      // Başarılı yanıt
      return res.status(StatusCodes.OK).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      console.error("İş ilanları listelenirken hata:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "İş ilanları listelenirken bir hata oluştu",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Yeni bir iş ilanı oluşturur
   */
  public static async createJob(req: Request, res: Response) {
    console.log("DirectJobsController - createJob çağrıldı");
    console.log("İstek gövdesi:", req.body);
    
    try {
      // İstek gövdesinden iş ilanı bilgilerini al
      const {
        job_title,
        company_name,
        location_name,
        job_description,
        job_type_id,
        salary_range,
        required_skills,
        is_active
      } = req.body;
      
      // Temel doğrulama
      if (!job_title || !company_name) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "İş başlığı ve şirket adı zorunludur"
        });
      }
      
      // Yeni iş ilanı nesnesi
      const newJob = {
        job_title,
        company_name,
        location_name: location_name || "Belirtilmemiş",
        job_description: job_description || "",
        job_type_id: job_type_id || null,
        salary_range: salary_range || "Belirtilmemiş",
        required_skills: required_skills || [],
        is_active: is_active !== undefined ? is_active : true,
        created_date: new Date(),
        posted_by: "test_user" // Test için sabit bir kullanıcı
      };
      
      // MongoDB'ye doğrudan erişim
      const db = mongoose.connection.db;
      if (!db) {
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          success: false,
          message: "Veritabanı bağlantısı sağlanamadı"
        });
      }
      
      // İş ilanları koleksiyonuna erişim
      const jobCollection = db.collection('job_post');
      
      // Yeni iş ilanını kaydet
      const result = await jobCollection.insertOne(newJob);
      console.log("Yeni iş ilanı oluşturuldu, ID:", result.insertedId);
      
      // Başarılı yanıt
      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: "İş ilanı başarıyla oluşturuldu",
        data: {
          ...newJob,
          _id: result.insertedId
        }
      });
    } catch (error) {
      console.error("İş ilanı oluşturulurken hata:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "İş ilanı oluşturulurken bir hata oluştu",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Belirli bir iş ilanını getirir
   */
  public static async getJob(req: Request, res: Response) {
    console.log("DirectJobsController - getJob çağrıldı");
    
    try {
      const { job_id } = req.params;
      
      if (!job_id || !mongoose.Types.ObjectId.isValid(job_id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Geçerli bir iş ilanı ID'si belirtilmelidir"
        });
      }
      
      // MongoDB'ye doğrudan erişim
      const db = mongoose.connection.db;
      if (!db) {
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          success: false,
          message: "Veritabanı bağlantısı sağlanamadı"
        });
      }
      
      // İş ilanları koleksiyonuna erişim
      const jobCollection = db.collection('job_post');
      
      // İş ilanını bul
      const job = await jobCollection.findOne({ _id: new mongoose.Types.ObjectId(job_id) });
      
      if (!job) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "İş ilanı bulunamadı"
        });
      }
      
      // Başarılı yanıt
      return res.status(StatusCodes.OK).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error("İş ilanı getirilirken hata:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "İş ilanı getirilirken bir hata oluştu",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Belirli bir iş ilanına yapılan başvuruları listeler
   */
  public static async getJobApplications(req: Request, res: Response) {
    console.log("DirectJobsController - getJobApplications çağrıldı");
    
    try {
      const { job_id } = req.params;
      
      if (!job_id || !mongoose.Types.ObjectId.isValid(job_id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Geçerli bir iş ilanı ID'si belirtilmelidir"
        });
      }
      
      // MongoDB'ye doğrudan erişim
      const db = mongoose.connection.db;
      if (!db) {
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          success: false,
          message: "Veritabanı bağlantısı sağlanamadı"
        });
      }
      
      // İş başvuruları koleksiyonuna erişim
      const jobApplicationCollection = db.collection('job_applications');
      
      // ID'yi ObjectId olarak dönüştür
      const jobObjectId = new mongoose.Types.ObjectId(job_id);
      
      // Her iki ID formatında da sorgu yap
      // MongoDB $or ile her iki tip ID'yi de sorgula
      const applications = await jobApplicationCollection.find({
        $or: [
          { job_id: jobObjectId },   // ObjectId olarak sorgu
          { job_id: job_id }         // String olarak sorgu
        ]
      }).sort({ applied_date: -1 }).toArray();
      
      console.log(`${applications.length} başvuru bulundu, ilan ID: ${job_id}`);
      
      // Hiç başvuru bulunamadıysa, manuel test amaçlı job_applications koleksiyonundaki tüm başvuruları kontrol et
      if (applications.length === 0) {
        console.log("Hiç başvuru bulunamadı, tüm başvuruları liste olarak yazdırıyorum:");
        const allApplications = await jobApplicationCollection.find({}).toArray();
        console.log("Tüm başvurular:", JSON.stringify(allApplications, null, 2));
        
        if (allApplications.length > 0) {
          // Tüm başvuruları kontrol ederek job_id alanının türünü yazdır
          allApplications.forEach((app, index) => {
            console.log(`Başvuru ${index + 1}:`, {
              id: app._id,
              job_id: app.job_id,
              job_id_type: typeof app.job_id,
              job_id_instanceof_objectid: app.job_id instanceof mongoose.Types.ObjectId,
              job_id_equals_param: app.job_id.toString() === job_id,
              name: app.name
            });
          });
        }
      }
      
      // Başarılı yanıt
      return res.status(StatusCodes.OK).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error("Başvurular listelenirken hata:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Başvurular listelenirken bir hata oluştu",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
} 