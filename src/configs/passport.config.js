import passport from 'passport';
// import { configureGoogleStrategy } from './google-strategy.config.js';
import { configureJwtStrategy } from './jwt-strategy.config.js';

// Setup all strategies
configureJwtStrategy();
// configureGoogleStrategy();

export default passport;
