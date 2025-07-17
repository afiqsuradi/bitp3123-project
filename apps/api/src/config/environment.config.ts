import dotenv from "dotenv";
import path from "node:path";
import { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
interface Config {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string;
  };
}

class ConfigService {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private loadConfig(): Config {
    return {
      port: parseInt(process.env.PORT || "3000", 10),
      nodeEnv: process.env.NODE_ENV || "development",
      database: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        name: process.env.DB_NAME || "",
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
      },
      jwt: {
        secret: process.env.JWT_SECRET || "",
        expiresIn: process.env.JWT_EXPIRES_IN || "",
      },
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      },
    };
  }

  private validateConfig(): void {
    const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "JWT_EXPIRES_IN"];

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar],
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`,
      );
    }

    if (this.config.port < 1 || this.config.port > 65535) {
      throw new Error("PORT must be between 1 and 65535");
    }
  }

  public get(): Config {
    return this.config;
  }

  public isDevelopment(): boolean {
    return this.config.nodeEnv === "development";
  }

  public isProduction(): boolean {
    return this.config.nodeEnv === "production";
  }

  public isTest(): boolean {
    return this.config.nodeEnv === "test";
  }

  public getPassportConfigurator() {
    return (passport: PassportStatic) => {
      passport.use(new LocalStrategy((username, password, done) => {}));
    };
  }
}

export const config = new ConfigService().get();
export const configService = new ConfigService();
export default config;
