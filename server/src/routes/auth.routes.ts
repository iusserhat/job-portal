import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { asyncWrapper } from "../helpers/async-wrapper";
import RequestValidator from "../validators/RequestValidator";
import { RegisterUserAccountRequest } from "../requests/RegisterUserAccountRequest";
import passport from "passport";
import { asyncHandler } from "../middlewares/async.middleware";

export default class AuthRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes() {
    // OPTIONS isteklerini karşıla (CORS preflight için)
    this.router.options("*", (req, res) => {
      // CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      res.status(200).end();
    });

    this.router.post("/login", asyncHandler(AuthController.login));
    this.router.post(
      "/signup",
      RequestValidator.validate(RegisterUserAccountRequest),
      asyncHandler(AuthController.signup)
    );
    this.router.get(
      "/me",
      passport.authenticate("jwt", { session: false }),
      asyncHandler(AuthController.me)
    );
  }
}
