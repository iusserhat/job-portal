import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Authorization header'ı kontrol et
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log("Authorization header bulunamadı");
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Access token not provided" });
  }
  
  console.log("Auth header:", authHeader.substring(0, 30) + "...");
  
  passport.authenticate("jwt", function (err: any, user: any, info: any) {
    if (err) {
      console.error("Passport authenticate hatası:", err);
      return next(err);
    }

    if (!user) {
      console.log("Geçersiz token veya kullanıcı bulunamadı", info);
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ 
          success: false, 
          message: "Unauthorized. Invalid token or user not found",
          error: info?.message || "Authentication failed"
        });
    }

    console.log("Kullanıcı doğrulandı:", {
      id: user._id,
      email: user.email,
      user_type_id: user.user_type_id
    });
    req.user = user;
    next();
  })(req, res, next);
};
