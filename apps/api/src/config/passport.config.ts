import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { PassportStatic } from "passport";
import { UserService } from "../services/user.service";
import bcrypt from "bcrypt";
import { JwtPayload } from "../types/user.interface";
import { config } from "./environment.config";

export const configurePassport = (passport: PassportStatic) => {
  // email/password
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await UserService.get().getUserByUsername(username);
        if (!user) {
          return done(null, false);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  // jwt
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret,
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload: JwtPayload, done) => {
      const user = await UserService.get().getUserById(jwt_payload.userId);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    }),
  );
};
