import express, { Request, Response, NextFunction } from "express";
import JobApplicationsController from "../controllers/job-applications.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

// Türler
interface RequestWithUser extends Request {
  user?: any;
}

// Router oluştur
const router = express.Router();

/**
 * İş başvuruları için rotalar
 */
router.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "İş başvuruları API çalışıyor",
    data: []
  });
});

// Helper fonksiyonlar - açık tür tanımlamaları
const applyForJob = (req: RequestWithUser, res: Response, next: NextFunction) => {
  return JobApplicationsController.applyForJob(req, res, next);
};

const getJobApplications = (req: RequestWithUser, res: Response, next: NextFunction) => {
  return JobApplicationsController.getJobApplications(req, res, next);
};

const getUserApplications = (req: RequestWithUser, res: Response, next: NextFunction) => {
  return JobApplicationsController.getUserApplications(req, res, next);
};

const updateJobApplication = (req: RequestWithUser, res: Response, next: NextFunction) => {
  return JobApplicationsController.updateJobApplication(req, res, next);
};

const directApplyForJob = (req: Request, res: Response) => {
  return JobApplicationsController.directApplyForJob(req, res);
};

// İş başvuruları
router.post("/:job_id/apply", authMiddleware, applyForJob);

// Başvuruları listeleme
router.get("/:job_id/applications", authMiddleware, getJobApplications);

// Kullanıcının kendi başvurularını listeleme
router.get("/my-applications", authMiddleware, getUserApplications);

// Başvuru durumunu güncelleme
router.put("/application/:id", authMiddleware, updateJobApplication);

// Doğrudan başvuru (authentication olmadan)
router.post("/direct-apply", directApplyForJob);

export default router; 