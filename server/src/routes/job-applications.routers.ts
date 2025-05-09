import { Router } from "express";
import JobApplicationsController from "../controllers/job-applications.controller";
import { asyncWrapper } from "../helpers/async-wrapper";
import passport from "passport";

export default class JobApplicationsRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes() {
    // JWT ile korunan rotalar için middleware
    const authenticate = passport.authenticate("jwt", { session: false });

    // İş ilanına başvurma
    this.router.post(
      "/jobs/:job_id/apply",
      authenticate,
      asyncWrapper(JobApplicationsController.applyForJob)
    );
    
    // Bir iş ilanına yapılan başvuruları görüntüleme (işveren)
    this.router.get(
      "/jobs/:job_id/applications",
      authenticate,
      asyncWrapper(JobApplicationsController.getJobApplications)
    );
    
    // Kullanıcının kendi başvurularını görüntüleme
    this.router.get(
      "/applications",
      authenticate,
      asyncWrapper(JobApplicationsController.getUserApplications)
    );
    
    // Başvuru durumunu güncelleme (işveren)
    this.router.put(
      "/applications/:application_id",
      authenticate,
      asyncWrapper(JobApplicationsController.updateJobApplication)
    );
  }
}
