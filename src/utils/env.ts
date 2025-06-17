import { port, str, cleanEnv, url, email } from 'envalid';
import dotenv from 'dotenv';
dotenv.config();

// import { z } from 'zod';

const env = cleanEnv(process.env, {
  PORT: port({ default: 9000 }),
  DATABASE_URL: str(),
  ACCESS_TOKEN: str(),
  JWT_SECRET: str(),
  DOMAIN: url(),
  FILE_SERVER_DOMAIN: str(),
  FILE_UPLOAD_PATH: str(),
  SMTP_HOST: str(),
  SMTP_PORT: port(),
  EMAIL_USERNAME: email(),
  EMAIL_PASSWORD: str(),
  CLIENT_DOMAIN: url(),
});

export default env;
