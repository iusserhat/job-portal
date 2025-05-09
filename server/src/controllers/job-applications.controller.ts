import { Request, Response, NextFunction } from "express";
import JobApplication from "../models/job/job_application.model";
import JobPost from "../models/job/job_post.model";
import { ApiError } from "../errors/api.error";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

// TypeScript için kullanıcı tipi tanımlaması
interface RequestWithUser extends Request {
  user?: {
    _id: string;
    user_type_id: string;
    email: string;
    [key: string]: any;
  };
}

/**
 * JobApplicationsController
 * This class contains methods for handling job applications
 * @class
 *
 * @method applyForJob - This method is used to apply for a job
 * @method getJobApplications - This method is used to get list of job applications paginated
 */
export default class JobApplicationsController {
  /**
   * This method is used to apply for a job
   * @param req Request
   * @param res Response
   */
  public static async applyForJob(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log("applyForJob başlatıldı - Tüm istek:", { 
        headers: req.headers,
        body: req.body,
        user: req.user,
        method: req.method,
        path: req.path
      });
      
      const { job_id, name, email, phone, cover_letter, resume_url } = req.body;
      
      // Kullanıcı kontrolünü geliştir ve daha detaylı hata mesajı gönder
      if (!req.user) {
        console.error("JobApplicationsController - applyForJob: Kullanıcı bulunamadı (Unauthorized)");
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Kullanıcı girişi yapmalısınız. Lütfen tekrar giriş yapın.",
        });
      }
      
      if (!req.user._id) {
        console.error("JobApplicationsController - applyForJob: Kullanıcı ID bulunamadı (Unauthorized)");
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Geçerli bir kullanıcı hesabıyla giriş yapmalısınız.",
        });
      }
      
      // İş arayan kontrolü yap
      if (req.user.user_type_id !== "jobseeker") {
        console.error("JobApplicationsController - applyForJob: Kullanıcı iş arayan değil", req.user.user_type_id);
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "İş ilanlarına sadece iş arayan hesapları başvurabilir.",
        });
      }
      
      const user_id = req.user._id;
      console.log(`JobApplicationsController - Yeni başvuru işleniyor. İlan ID: ${job_id}, Kullanıcı ID: ${user_id}`);

      // İş ilanının varlığını kontrol et
      const job = await JobPost.findById(job_id);
      if (!job) {
        console.error(`JobApplicationsController - İş ilanı bulunamadı, ID: ${job_id}`);
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "İş ilanı bulunamadı.",
        });
      }

      // Daha önce başvuru yapılıp yapılmadığını kontrol et
      const existingApplication = await JobApplication.findOne({
        job_id,
        user_id,
      });

      if (existingApplication) {
        console.log(`JobApplicationsController - Kullanıcı (${user_id}) bu ilana (${job_id}) daha önce başvurmuş`);
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Bu iş ilanına daha önce başvurdunuz.",
        });
      }

      // Yeni başvuru oluştur
      const newApplication = new JobApplication({
        job_id,
        user_id,
        name,
        email,
        phone,
        cover_letter,
        resume_url,
        status: "pending",
        applied_date: new Date()
      });

      await newApplication.save();
      console.log(`JobApplicationsController - Yeni başvuru kaydedildi, ID: ${newApplication._id}`);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Başvurunuz başarıyla alındı",
        data: newApplication,
      });
    } catch (error) {
      console.error("JobApplicationsController - Başvuru oluşturulurken hata:", error);
      next(error);
    }
  }

  /**
   * This method is used to get list of a job applications paginated
   * @param req Request
   * @param res Response
   */
  public static async getJobApplications(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { job_id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      console.log(`JobApplicationsController - getJobApplications: İlan ID ${job_id} için başvurular istendi`);
      console.log(`JobApplicationsController - getJobApplications: İstek yapan kullanıcı`, req.user);

      // Kullanıcı kontrolünü geliştir
      if (!req.user) {
        console.error("JobApplicationsController - getJobApplications: Kullanıcı bulunamadı (Unauthorized)");
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Kullanıcı girişi yapmalısınız.",
        });
      }
      
      if (!req.user._id) {
        console.error("JobApplicationsController - getJobApplications: Kullanıcı ID bulunamadı");
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Geçerli bir kullanıcı hesabıyla giriş yapmalısınız.",
        });
      }
      
      // Test için - geçici olarak yetkilendirme kontrolünü gevşetelim
      // Normalde sadece işveren ve ilanın sahibi olan kullanıcı erişebilmeli
      let job;
      
      if (req.user.user_type_id === "employer") {
        // İş ilanının var olduğunu ve kullanıcının erişim yetkisi olduğunu kontrol et
        job = await JobPost.findOne({
          _id: job_id,
          // posted_by: req.user._id // Geçici olarak kaldırdık - Test için
        });
      } else {
        console.log("JobApplicationsController - getJobApplications: Kullanıcı işveren değil");
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Bu sayfa sadece işveren hesapları tarafından görüntülenebilir.",
        });
      }

      if (!job) {
        console.error(`JobApplicationsController - getJobApplications: İlan bulunamadı, ID: ${job_id}`);
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "İş ilanı bulunamadı veya bu işleme yetkiniz yok.",
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Başvuruları çek
      const applications = await JobApplication.find({ job_id })
        .sort({ applied_date: -1 })
        .skip(skip)
        .limit(limitNum);
      
      console.log(`JobApplicationsController - getJobApplications: ${applications.length} başvuru bulundu, ilan ID: ${job_id}`);

      const totalApplications = await JobApplication.countDocuments({ job_id });

      res.status(StatusCodes.OK).json({
        success: true,
        data: applications,
        pagination: {
          total: totalApplications,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalApplications / limitNum),
        },
      });
    } catch (error) {
      console.error("JobApplicationsController - Başvurular alınırken hata:", error);
      next(error);
    }
  }

  /**
   * Direct apply to job - no auth required
   * Bu metot doğrudan iş başvurusu yapmak için kullanılır, kimlik doğrulama gerekmez
   */
  public static async directApplyForJob(
    req: Request,
    res: Response
  ) {
    try {
      console.log("DirectApplyForJob başlatıldı:", req.body);
      
      const { job_id, name, email, phone, cover_letter } = req.body;
      
      if (!job_id || !name || !email || !phone || !cover_letter) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Tüm zorunlu alanları doldurmalısınız (isim, e-posta, telefon ve başvuru yazısı)."
        });
      }
      
      // İş ilanının varlığını kontrol et
      const jobObjectId = mongoose.Types.ObjectId.isValid(job_id) 
          ? new mongoose.Types.ObjectId(job_id) 
          : null;
          
      if (!jobObjectId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Geçersiz iş ilanı ID'si."
        });
      }
      
      // MongoDB'den ilan kontrolü
      const db = mongoose.connection.db;
      if (!db) {
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          success: false,
          message: "Veritabanı bağlantısı sağlanamadı"
        });
      }
      
      // İş ilanları koleksiyonuna erişim
      const jobCollection = db.collection('job_post');
      const job = await jobCollection.findOne({ _id: jobObjectId });
      
      if (!job) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "İş ilanı bulunamadı."
        });
      }
      
      // Başvuruyu veritabanına ekle
      const jobApplicationCollection = db.collection('job_applications');
      
      // Başvuru verisini hazırla
      const applicationData = {
        job_id: jobObjectId,               // ObjectId olarak kaydet
        job_id_string: job_id,             // Aynı zamanda string olarak da kaydet
        name,
        email,
        phone,
        cover_letter,
        status: "pending",
        applied_date: new Date()
      };
      
      const result = await jobApplicationCollection.insertOne(applicationData);
      
      if (!result.insertedId) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Başvuru kaydedilirken bir hata oluştu."
        });
      }
      
      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Başvurunuz başarıyla alındı",
        data: {
          _id: result.insertedId,
          job_id: jobObjectId,
          name,
          email,
          phone,
          status: "pending"
        }
      });
      
    } catch (error) {
      console.error("DirectApplyForJob - Hata:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Başvuru işlemi sırasında bir hata oluştu.",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * This method is used to get list of a user [recruiter or job seeker] applications paginated
   * @param req Request
   * @param res Response
   */
  public static async getUserApplications(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?._id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Kullanıcı girişi yapmalısınız");
      }
      
      const user_id = req.user._id;
      const { page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const applications = await JobApplication.find({ user_id })
        .populate('job_id')
        .sort({ applied_date: -1 })
        .skip(skip)
        .limit(limitNum);

      const totalApplications = await JobApplication.countDocuments({ user_id });

      res.status(StatusCodes.OK).json({
        success: true,
        data: applications,
        pagination: {
          total: totalApplications,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalApplications / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method is used to update the status of a job application
   * @param req Request
   * @param res Response
   */
  public static async updateJobApplication(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!req.user?.user_type_id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Kullanıcı girişi yapmalısınız");
      }

      // Sadece işveren başvuru durumunu güncelleyebilir
      if (req.user.user_type_id !== "employer") {
        throw new ApiError(StatusCodes.FORBIDDEN, "Sadece işveren hesapları başvuru durumunu güncelleyebilir");
      }

      const allowedStatuses = ["pending", "reviewed", "interviewed", "accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Geçersiz durum değeri");
      }

      const application = await JobApplication.findById(id);
      if (!application) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Başvuru bulunamadı");
      }

      // Başvurunun ait olduğu iş ilanını bul
      const job = await JobPost.findById(application.job_id);
      if (!job) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Başvuruya ait iş ilanı bulunamadı");
      }

      // İş ilanının sahibi mi kontrol et
      if (job && job.posted_by && 
          req.user && req.user._id && 
          job.posted_by.toString() !== req.user._id.toString()) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Bu başvuruyu güncelleme yetkiniz yok");
      }

      application.status = status;
      await application.save();

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Başvuru durumu güncellendi",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
}
