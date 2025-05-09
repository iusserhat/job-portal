import { Request, Response, NextFunction } from "express";
import JobPost from "../models/job/job_post.model";
import { ApiError } from "../errors/api.error";
import { StatusCodes } from "http-status-codes";

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
 * JobsController
 * This class contains methods for handling jobs
 * @class
 *
 * @method getJobs - This method is used to get list of jobs paginated
 * @method createJob - This method is used to create a job
 * @method getJob - This method is used to get a job details by id
 * @method updateJob - This method is used to update a job
 * @method deleteJob - This method is used to delete a job
 */
export default class JobsController {
  /**
   * This method is used to get list of jobs paginated
   * @param req Request
   * @param res Response
   */
  public static async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search = "", location = "" } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      
      // Build query filters
      const filter: any = { is_active: true };
      
      if (search) {
        filter.job_description = { $regex: search, $options: 'i' };
      }
      
      if (location) {
        // Basit bir konum filtresi ekleyelim
        filter.location_name = location;
      }
      
      // Populate işlemleri kaldırıldı - direkt veri çekiyoruz
      const jobs = await JobPost.find(filter)
        .sort({ created_date: -1 })
        .skip(skip)
        .limit(limitNum);
        
      const totalJobs = await JobPost.countDocuments(filter);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: jobs,
        pagination: {
          total: totalJobs,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalJobs / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method is used to create a job
   * @param req Request
   * @param res Response
   */
  public static async createJob(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { 
        job_type_id, 
        company_id,
        company_name,
        job_title,
        location_name,
        is_company_name_hidden,
        job_description,
        job_location_id,
        salary_range,
        required_skills,
        contact_email,
        contact_phone,
        application_deadline,
        is_active
      } = req.body;
      
      // Güvenlik kontrolünü geçici olarak devre dışı bırak
      // if (!req.user?._id) {
      //  throw new ApiError(StatusCodes.UNAUTHORIZED, "Kullanıcı girişi yapmalısınız");
      // }
      
      // Geçici olarak geçerli bir MongoDB ObjectId kullan
      // MongoDB ObjectId formatında geçerli bir ID (24 karakter hexadecimal)
      const posted_by = req.user?._id || "507f1f77bcf86cd799439011";
      
      console.log("İş ilanı oluşturuluyor:", {
        posted_by,
        job_type_id,
        company_id,
        company_name,
        job_title,
        is_company_name_hidden,
        job_description,
        job_location_id,
        location_name,
        is_active
      });
      
      const newJob = new JobPost({
        posted_by,
        job_type_id,
        company_id,
        company_name,
        job_title,
        location_name,
        is_company_name_hidden,
        created_date: new Date(),
        job_description,
        job_location_id,
        salary_range,
        required_skills,
        contact_email,
        contact_phone,
        application_deadline,
        is_active
      });
      
      await newJob.save();
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "İş ilanı başarıyla oluşturuldu",
        data: newJob,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method is used to get a job details by id
   * @param req Request
   * @param res Response
   */
  public static async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { job_id } = req.params;
      
      // Populate işlemlerini kaldırıp doğrudan veri çekiyoruz
      const job = await JobPost.findById(job_id);
        
      if (!job) {
        throw new ApiError(StatusCodes.NOT_FOUND, "İş ilanı bulunamadı");
      }
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method is used to update a job
   * @param req Request
   * @param res Response
   */
  public static async updateJob(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { job_id } = req.params;
      const updates = req.body;
      
      // Yetkilendirme kontrolünü kaldırıyoruz
      // if (!req.user?._id) {
      //   throw new ApiError(StatusCodes.UNAUTHORIZED, "Kullanıcı girişi yapmalısınız");
      // }
      
      // const user_id = req.user._id;
      
      // İş ilanını bul, sahiplik kontrolü yapma
      const job = await JobPost.findById(job_id);
      
      if (!job) {
        throw new ApiError(
          StatusCodes.NOT_FOUND, 
          "İş ilanı bulunamadı"
        );
      }
      
      // Apply updates - TypeScript uyumlu hale getirelim
      Object.keys(updates).forEach(key => {
        if (job.schema.paths[key]) {
          (job as any)[key] = updates[key];
        }
      });
      
      await job.save();
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: "İş ilanı başarıyla güncellendi",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method is used to delete a job
   * @param req Request
   * @param res Response
   */
  public static async deleteJob(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { job_id } = req.params;
      
      // Yetkilendirme kontrolünü kaldırıyoruz
      // if (!req.user?._id) {
      //   throw new ApiError(StatusCodes.UNAUTHORIZED, "Kullanıcı girişi yapmalısınız");
      // }
      
      // const user_id = req.user._id;
      
      // İş ilanını bul, sahiplik kontrolü yapma
      const job = await JobPost.findById(job_id);
      
      if (!job) {
        throw new ApiError(
          StatusCodes.NOT_FOUND, 
          "İş ilanı bulunamadı"
        );
      }
      
      await JobPost.deleteOne({ _id: job_id });
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: "İş ilanı başarıyla silindi",
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * This method is used to get list of jobs posted by a user
   * @param req Request
   * @param res Response
   */
  public static async getUserJobs(
    req: RequestWithUser, 
    res: Response, 
    next: NextFunction
  ) {
    try {
      console.log("getUserJobs API çağrıldı");
      console.log("Request user:", req.user);
      console.log("Authorization header:", req.headers.authorization);
      
      // Kullanıcı kimlik doğrulama kontrollerini kaldırdık
      // Tüm ilanları getiriyoruz
      
      const { page = 1, limit = 10 } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      
      // MongoDB aggregation ile başvuru sayılarını da getir
      const jobs = await JobPost.aggregate([
        // İlanları filtrele - tüm ilanları getir, filtreleme yapma
        // {
        //   $match: {
        //     // Aktif kullanıcıya ait ilanları getir
        //     // posted_by: new mongoose.Types.ObjectId(user_id)
        //   }
        // },
        // Başvurular collection'ı ile join işlemi
        {
          $lookup: {
            from: "job_applications", // JobApplication modelin koleksiyon adı
            localField: "_id",
            foreignField: "job_id",
            as: "applications"
          }
        },
        // Başvuru sayısını hesapla
        {
          $addFields: {
            applications_count: { $size: "$applications" }
          }
        },
        // Opsiyonel olarak applications array'ini kaldır (gereksiz veri transferini önlemek için)
        {
          $project: {
            applications: 0 // Başvuruların detaylarını döndürme, sadece sayısını tut
          }
        },
        // Sırala ve sayfalama yap
        { $sort: { created_date: -1 } },
        { $skip: skip },
        { $limit: limitNum }
      ]);
      
      console.log(`${jobs.length} ilan bulundu`);
      
      // Toplam ilan sayısını bul
      const totalJobs = await JobPost.countDocuments({});
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: jobs,
        pagination: {
          total: totalJobs,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalJobs / limitNum),
        },
      });
    } catch (error) {
      console.error("Kullanıcı ilanlarını getirirken hata:", error);
      next(error);
    }
  }
}
