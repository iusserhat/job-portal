import { Router } from "express";
import JobsController from "../controllers/jobs.controller";
import { asyncWrapper } from "../helpers/async-wrapper";
import passport from "passport";

export default class JobsRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes() {
    // JWT ile korunan rotalar için middleware
    const authenticate = passport.authenticate("jwt", { session: false });
    
    // Tüm iş ilanlarını alma - Herkes erişebilir
    this.router.get("/", asyncWrapper(JobsController.getJobs));
    
    // Kullanıcının kendi ilanlarını alma - GEÇİCİ OLARAK authenticate kaldırıldı
    this.router.get("/user-jobs", asyncWrapper(JobsController.getUserJobs));
    
    // İlan oluşturma - Yetkilendirme kontrolünü geçici olarak kaldırdık
    this.router.post("/", asyncWrapper(JobsController.createJob));
    
    // Belirli bir iş ilanı detayını alma - Herkes erişebilir
    this.router.get("/:job_id", asyncWrapper(JobsController.getJob));
    
    // İlan güncelleme - Sadece ilana sahip kullanıcı
    this.router.put("/:job_id", asyncWrapper(JobsController.updateJob));
    
    // İlan silme - Sadece ilana sahip kullanıcı
    this.router.delete("/:job_id", asyncWrapper(JobsController.deleteJob));
  }
}
