import { Router } from "express";
import DirectJobsController from "../controllers/direct-jobs.controller";
import JobApplicationsController from "../controllers/job-applications.controller";
import JobDetailController from "../controllers/job-detail.controller";

// Express Router oluştur
const router = Router();

// İş ilanlarını listeleme - GET /api/v1/direct-jobs
router.get("/", DirectJobsController.listJobs);

// Yeni iş ilanı oluşturma - POST /api/v1/direct-jobs
router.post("/", DirectJobsController.createJob);

// Belirli bir iş ilanını getirme - GET /api/v1/direct-jobs/:job_id
router.get("/:job_id", DirectJobsController.getJob);

// İş ilanına başvuru - POST /api/v1/direct-jobs/:job_id/apply
router.post("/:job_id/apply", JobApplicationsController.directApplyForJob);

// İş ilanı başvuru sayısını getirme - GET /api/v1/direct-jobs/:job_id/application-count
router.get("/:job_id/application-count", JobDetailController.getJobApplicationsCount);

// İş ilanına yapılan başvuruları getirme - GET /api/v1/direct-jobs/:job_id/applications
router.get("/:job_id/applications", DirectJobsController.getJobApplications);

// OPTIONS isteklerini karşıla (CORS için)
router.options("*", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.status(200).end();
});

export default router; 