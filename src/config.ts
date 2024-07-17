import dotenv from 'dotenv';
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';
import Logger from 'bunyan';

dotenv.config({});

class Config {
  public log: Logger;
  private readonly DEFAULT_DATABASE_URL = 'mongodb://127.0.0.1:27017/chatty-backend';

  public DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
  public JWT_TOKEN = process.env.JWT_TOKEN;
  public NODE_ENV = process.env.NODE_ENV;
  public SECRET_KEY_ONE = process.env.SECRET_KEY_ONE;
  public SECRET_KEY_TWO = process.env.SECRET_KEY_TWO;
  public CLIENT_URL = process.env.CLIENT_URL;
  public REDIS_HOST = process.env.REDIS_HOST;
  public CLOUD_NAME = process.env.CLOUD_NAME;
  public CLOUD_API_KEY = process.env.CLOUD_API_KEY;
  public CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;
  public SENDER_EMAIL = process.env.SENDER_EMAIL;
  public SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD;
  public SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  public SENDGRID_SENDER = process.env.SENDGRID_SENDER;
  public EC2_URL = process.env.EC2_URL;

  constructor() {
    this.log = this.createLogger('config');
  }

  public validateConfig() {
    const requiredKeys = [
      'DATABASE_URL',
      'JWT_TOKEN',
      'NODE_ENV',
      'SECRET_KEY_ONE',
      'SECRET_KEY_TWO',
      'CLIENT_URL',
      'REDIS_HOST',
      'CLOUD_NAME',
      'CLOUD_API_KEY',
      'CLOUD_API_SECRET',
      'SENDER_EMAIL',
      'SENDER_EMAIL_PASSWORD',
      'SENDGRID_API_KEY',
      'SENDGRID_SENDER',
      'EC2_URL'
    ];

    requiredKeys.forEach((key) => {
      const val = process.env[key];
      if (!val) {
        this.log.error(`Configuration ${key} is undefined`);
      }
    });
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }

  public configCloudinary() {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET
    });
  }
}

export const config: Config = new Config();
