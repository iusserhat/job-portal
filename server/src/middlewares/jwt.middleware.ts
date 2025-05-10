import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import { PassportStatic } from "passport";
import UserAccount from "../models/user/user-account.model";
import mongoose from "mongoose";

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "jwt_secret"
};

// JWT modülü
module.exports = (passport: PassportStatic): void => {
  passport.use(
    new JwtStrategy(options, (jwt_payload: any, done: any) => {
      console.log("JWT Middleware - Token içeriği:", {
        id: jwt_payload.id,
        email: jwt_payload.email,
        userType: jwt_payload.userType
      });
      
      // ID string veya ObjectId olabilir, güvenli bir şekilde ObjectId'ye çevirelim
      let userId;
      try {
        userId = new mongoose.Types.ObjectId(jwt_payload.id);
      } catch (error) {
        console.error("JWT Middleware - Geçersiz ID formatı:", jwt_payload.id);
        return done(null, false, { message: "Geçersiz kullanıcı ID formatı" });
      }
      
      // JWT payload'dan rol tipini kontrol et (varsa)
      const requestedUserType = jwt_payload.userType;
      
      UserAccount.findById(userId)
        .then((user: any) => {
          if (!user) {
            console.log("JWT Middleware - Kullanıcı bulunamadı");
            return done(null, false, { message: "Kullanıcı bulunamadı" });
          }
          
          // Kullanıcı tiplerini string olarak karşılaştır
          const userTypeStr = user.user_type_id.toString();
          const requestedTypeStr = requestedUserType ? requestedUserType.toString() : null;
          
          console.log("JWT Middleware - Kullanıcı bulundu:", {
            id: user._id.toString(),
            email: user.email,
            userType: userTypeStr,
            requestedType: requestedTypeStr
          });
          
          // Eğer requestedUserType varsa ve kullanıcının gerçek tipiyle eşleşmiyorsa, reddet
          if (requestedTypeStr && userTypeStr !== requestedTypeStr) {
            console.log("JWT Middleware - Kullanıcı tipi uyuşmazlığı:", {
              userType: userTypeStr,
              requestedType: requestedTypeStr
            });
            return done(null, false, { message: "Bu kullanıcı belirtilen rol ile erişim yapamaz" });
          }
          
          return done(null, user);
        })
        .catch((err: Error) => {
          console.error("JWT Middleware - Hata:", err);
          return done(err, false);
        });
    })
  );
};
