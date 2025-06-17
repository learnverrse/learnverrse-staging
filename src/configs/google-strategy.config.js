import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { googleLoginOrCreateAccountService } from '../services/google-auth.service.js';
import { config } from './app.config.js';
import { AccountProviderEnum } from '../enums/account-provider.enum.js';
import { NotFoundException } from '../utils/appError.js';

export const configureGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const {
            email,
            sub: googleId,
            picture,
            given_name,
            family_name,
          } = profile._json;

          console.log(profile, 'profile');
          console.log(googleId, 'googleId');

          if (!googleId) {
            throw new NotFoundException('Google ID (sub) is missing');
          }

          const user = await googleLoginOrCreateAccountService({
            provider: AccountProviderEnum.GOOGLE,
            providerId: googleId,
            email,
            fullName: profile.displayName,
            profilePicture: picture,
          });

          done(null, user);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
};
