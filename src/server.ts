import express from 'express';
import cors from 'cors';
import expressOasGenerator from 'express-oas-generator';
import env from './utils/env';
import routes from './routes';
// import dotenv from 'dotenv';
// dotenv.config({ path: '../.env' });

const app = express();
expressOasGenerator.init(app, {});

// Initialize middlewares
app.use(cors());
app.use(express.json());
app.use('/api/v1', routes);
// console.log('env', env);

app.listen(env.PORT, () => {
  console.log(`[OK] server started on port ${env.PORT}`);
});
