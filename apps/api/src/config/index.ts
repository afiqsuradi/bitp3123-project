import dotenv from "dotenv";
import path from "node:path";

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
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      },
    };
  }

  private validateConfig(): void {
    // const requiredEnvVars = [];
    //
    // const missingEnvVars = requiredEnvVars.filter(
    //   (envVar) => !process.env[envVar]
    // );
    //
    // if (missingEnvVars.length > 0) {
    //   throw new Error(
    //     `Missing required environment variables: ${missingEnvVars.join(', ')}`
    //   );
    // }

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
}

export const config = new ConfigService().get();
export const configService = new ConfigService();
export default config;
