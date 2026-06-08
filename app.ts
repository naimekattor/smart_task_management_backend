import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { initSocket } from './config/socket.js';
import { apiLimiter } from './middlewares/rate-limit.middleware.js';

const app = express();
const server = createServer(app);

initSocket(server);

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', apiLimiter);

app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Collaboration API is running smoothly.',
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server]: Smart Collaboration Server running on port ${PORT}`);
});
