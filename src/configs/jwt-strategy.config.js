import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import UserModel from '../modules/user/model/user.model.js';
import { config } from './app.config.js';

export const configureJwtStrategy = () => {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.ACCESS_TOKEN,
      },
      async (payload, done) => {
        try {
          const user = await UserModel.findById(payload.user.id);
          if (user) return done(null, user.omitPassword());
          return done(null, false);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
};
