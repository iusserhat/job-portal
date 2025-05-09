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
      UserAccount.findById(jwt_payload._id || jwt_payload.id)
        .then((user: any) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err: Error) => {
          return done(err, false);
        });
    })
  );
};
