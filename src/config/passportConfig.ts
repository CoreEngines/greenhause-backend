import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { Strategy as GitHubStrategy, Profile as ProfileGithub } from "passport-github2";
import User from "../models/users";
import dotenv from "dotenv";

dotenv.config();

class PassportConfig {
  constructor() {
    this.GoogleStrategy();
    this.GitHubStrategy();
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

  private GitHubStrategy() {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          callbackURL: process.env.GITHUB_CALLBACK_URI!,
          scope: ["user.email"],
        },
        async (accessToken:string ,refreshToken:string,profile:ProfileGithub,done: VerifyCallback) => {
          try {
            const {id,displayName,emails} = profile;
            let user = await User.findOne({"providers.providerId":id});

            if(!user){
              const userExists = await User.findOne({email: emails?.[0].value})
              if (userExists) {
                return done(new Error("Email already exists"), { message: "Email already exists" });
              }
              
              user = await User.create({
                name:displayName,
                email:emails?.[0].value || "",
                isVerified : true,
                providers : [
                  {
                    providerId:id,
                    providerName:"github",
                  },
                ],
              });
            }
            done(null, user, { accessToken, refreshToken })
          } catch (error) {
            done(error as Error,{message: "An error occurred while authenticating with Google"});
          }

        }
      )
    )
  }

  public initialize() {
    return passport.initialize();
  }
}


export default PassportConfig;