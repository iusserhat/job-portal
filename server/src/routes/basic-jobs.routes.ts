import { Router } from "express";
import BasicJobsController from "../controllers/basic-jobs.controller";
import { asyncWrapper } from "../helpers/async-wrapper";

const router = Router();

// Tüm iş ilanlarını getir - Herkese açık
router.get("/", asyncWrapper(BasicJobsController.getJobs));

// Belirli bir iş ilanını getir - Herkese açık
router.get("/:job_id", asyncWrapper(BasicJobsController.getJob));

// OPTIONS isteklerini kabul et
router.options("*", (req, res) => {
  res.status(200).end();
});

export default router; 