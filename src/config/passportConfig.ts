import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import User from "../models/users";
import dotenv from "dotenv";

dotenv.config();

class PassportConfig {
  constructor() {
    this.GoogleStrategy();
  }

  private GoogleStrategy() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: process.env.GOOGLE_CALLBACK_URI!,
        },
        async (accessToken: string, refreshToken: string | undefined, profile: Profile, done: VerifyCallback) => {
          console.log("[INFO]: Google Strategy Configured");
          try {
            const { id, displayName, emails } = profile;
            
            let user = await User.findOne({ "providers.providerId": id });
            if (!user) {
              const userExists = await User.findOne({ email: emails?.[0].value });
              if (userExists) {
                console.log("[INFO]: Email already exists");
                return done(new Error("Email already exists"), { message: "Email already exists" });
              }
              user = await User.create({
                name: displayName,
                email: emails?.[0].value,
                isVerified: true,
                providers: [
                  {
                    providerId: id,
                    providerName: "google",
                  },
                ],
              });
            }

            done(null, user, { accessToken, refreshToken });
          } catch (error) {
            done(error as Error,{message: "An error occurred while authenticating with Google"});
          }
        }
      )
    );
  }

  public initialize() {
    return passport.initialize();
  }
}


export default PassportConfig;