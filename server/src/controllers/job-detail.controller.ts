import { Request, Response } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

/**
 * İş ilanı ve başvuru detayları için controller
 */
export default class JobDetailController {
  
  /**
   * Bir iş ilanına ait başvuruları sayar
   */
  public static async getJobApplicationsCount(req: Request, res: Response) {
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
      const jobObjectId = new mongoose.Types.ObjectId(job_id);
      
      // Başvuru sayısını al - İki farklı ID formatı için ayrı ayrı sorgu yap
      const objectIdCount = await jobApplicationCollection.countDocuments({ 
        job_id: jobObjectId
      });
      
      const stringIdCount = await jobApplicationCollection.countDocuments({ 
        job_id: job_id
      });
      
      // Toplam sayıyı hesapla (muhtemelen belirtilerden biri her zaman 0 olacak)
      const applicationsCount = objectIdCount + stringIdCount;
      
      console.log(`JobDetailController: Başvuru sayısı - ObjectId ile: ${objectIdCount}, String ile: ${stringIdCount}, Toplam: ${applicationsCount}, İlan ID: ${job_id}`);
      
      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          count: applicationsCount
        }
      });
      
    } catch (error) {
      console.error("Başvuru sayısı alınırken hata:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Başvuru sayısı alınırken bir hata oluştu",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
} 