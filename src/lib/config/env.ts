import fs from 'fs';
import path from 'path';

interface EnvConfig {
  NODE_ENV: string;
  APP_NAME: string;
  API_URL: string;
  [key: string]: string;
}

class EnvLoader {
  private static instance: EnvLoader;
  private config: EnvConfig = {} as EnvConfig;
  private envPath: string;
  private envExamplePath: string;

  private constructor() {
    const rootDir = path.resolve(__dirname, '../../../');
    this.envPath = path.join(rootDir, '.env');
    this.envExamplePath = path.join(rootDir, '.env.example');
  }

  public static getInstance(): EnvLoader {
    if (!EnvLoader.instance) {
      EnvLoader.instance = new EnvLoader();
    }
    return EnvLoader.instance;
  }

  private readEnvFile(filePath: string): Record<string, string> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const env: Record<string, string> = {};
      
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const [, key, value] = match;
          env[key.trim()] = value.trim();
        }
      });
      
      return env;
    } catch (error) {
      console.error(`Error reading env file: ${filePath}`, error);
      return {};
    }
  }

  public load(): void {
    // Load .env file
    const env = this.readEnvFile(this.envPath);
    
    // Validate required variables
    const requiredVars = ['NODE_ENV', 'API_URL', 'APP_NAME'];
    requiredVars.forEach(varName => {
      if (!env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });

    // Validate NODE_ENV
    const validEnvs = ['development', 'test', 'production'];
    if (!validEnvs.includes(env.NODE_ENV)) {
      throw new Error(`Invalid NODE_ENV: ${env.NODE_ENV}`);
    }

    // Validate API_URL format
    if (!env.API_URL.match(/^https?:\/\/.+/)) {
      throw new Error(`Invalid API_URL format: ${env.API_URL}`);
    }

    // Validate required variables are not empty
    Object.entries(env).forEach(([key, value]) => {
      if (key.startsWith('REQUIRED_') && !value) {
        throw new Error(`Required environment variable is empty: ${key}`);
      }
    });

    this.config = env as EnvConfig;
  }

  public getConfig(): EnvConfig {
    return this.config;
  }

  public get(key: keyof EnvConfig): string {
    return this.config[key];
  }
}

export const envLoader = EnvLoader.getInstance();
export const getEnv = (key: keyof EnvConfig): string => envLoader.get(key); 