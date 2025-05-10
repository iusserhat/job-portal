import express from "express";
import AuthRoutes from "./auth.routes";
import JobsRoutes from "./jobs.routes";
import BasicJobsRoutes from "./basic-jobs.routes";
import DirectJobsRoutes from "./direct-jobs.routes";
import JobApplicationsRoutes from "./job-applications.routes";
import path from "path";
import JobApplicationsController from "../controllers/job-applications.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Request, Response, NextFunction } from "express";

// RequestWithUser tipini burada tanımlıyoruz
interface RequestWithUser extends Request {
  user?: {
    _id: string;
    user_type_id: string;
    email: string;
    [key: string]: any;
  };
}

class Routes {
  constructor(server: express.Express) {
    // API Routes
    server.use("/api/v1/auth", new AuthRoutes().router);
    server.use("/api/v1/jobs", new JobsRoutes().router);
    
    // İş ilanı başvuruları için özel route - bunu jobs rotasına bağlıyoruz
    server.get("/api/v1/jobs/:job_id/applications", 
      authMiddleware,
      (req: Request, res: Response, next: NextFunction) => {
        console.log("DEBUG: Başvurular isteniyor, API: /api/v1/jobs/:job_id/applications");
        JobApplicationsController.getJobApplications(req as RequestWithUser, res, next);
      });
    
    // Basic Jobs routes - Doğrudan router kullanacak
    server.use("/api/v1/basic-jobs", BasicJobsRoutes);
    
    // Direct Jobs routes - MongoDB'ye doğrudan erişim için özel rotalar
    server.use("/api/v1/direct-jobs", DirectJobsRoutes);
    
    // Job Applications routes - Burada direk router'ı kullanıyoruz
    server.use("/api/v1/job-applications", JobApplicationsRoutes);
    
    // Uygulamalar endpoint'i (Başvuruları güncelleme için)
    server.use("/api/v1/applications", JobApplicationsRoutes);

    // Frontend Build dosyaları için statik sunma
    server.use(express.static(path.join(__dirname, "../../public")));
    
    // Public uploads klasörü
    server.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

    // Tüm diğer GET isteklerini index.html'e yönlendir (SPA desteği)
    server.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../../public/index.html"));
    });
  }
}

export default Routes;
