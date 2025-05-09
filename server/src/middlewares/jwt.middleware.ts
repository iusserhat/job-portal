import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import { PassportStatic } from "passport";
import UserAccount from "../models/user/user-account.model";

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "jwt_secret"
};

// JWT modülü
module.exports = (passport: PassportStatic): void => {
  passport.use(
    new JwtStrategy(options, (jwt_payload: any, done: any) => {
      console.log("JWT Middleware - Token doğrulandı, kullanıcı aranıyor:", jwt_payload._id || jwt_payload.id);
      
      UserAccount.findById(jwt_payload._id || jwt_payload.id)
        .then((user: any) => {
          if (user) {
            console.log("JWT Middleware - Kullanıcı bulundu:", {
              id: user._id,
              email: user.email,
              user_type_id: user.user_type_id
            });
            return done(null, user);
          }
          console.log("JWT Middleware - Kullanıcı bulunamadı");
          return done(null, false);
        })
        .catch((err: Error) => {
          console.error("JWT Middleware - Hata:", err);
          return done(err, false);
        });
    })
  );
};
