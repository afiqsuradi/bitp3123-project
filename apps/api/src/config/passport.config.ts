import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { PassportStatic } from "passport";
import { UserService } from "../services/user.service";
import bcrypt from "bcrypt";
import { JwtPayload } from "../types/user.interface";
import { config } from "./environment.config";
import { Request } from "express";

const jwtExtractor = (req: Request) => {
  let token = null;

  // First try to get token from Authorization header (for mobile)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.substring(7);
  }

  // If no token in header, try to get from cookie (for web)
  if (!token && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  return token;
};

export const configurePassport = (passport: PassportStatic) => {
  // email/password
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await UserService.get().getUserByEmail(email);
          if (!user) {
            return done(null, false);
          }
          const isMatch = await bcrypt.compare(password, user.password_hash);
          if (!isMatch) {
            return done(null, false);
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  // jwt
  const opts = {
    jwtFromRequest: jwtExtractor,
    secretOrKey: config.jwt.secret,
    passReqToCallback: true as const,
  };

  passport.use(
    new JwtStrategy(opts, async (req, jwt_payload: JwtPayload, done) => {
      const token = jwtExtractor(req);
      const user = await UserService.get().getUserById(jwt_payload.id);
      console.log(user?.refresh_token, token);
      if (user && token === user.refresh_token) {
        return done(null, user);
      }
      return done(null, false);
    }),
  );
};
