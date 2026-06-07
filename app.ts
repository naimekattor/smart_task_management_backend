import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load Env variables
dotenv.config();

import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { initSocket } from './config/socket.js';
import { apiLimiter } from './middlewares/rate-limit.middleware.js';

const app = express();
const server = createServer(app);

// Initialize Socket.IO
initSocket(server);

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows displaying uploaded images on frontend
}));

// CORS Configuration
app.use(
  cors({
    origin: '*', // In production, replace with specific frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically for previewing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Global API Limiter
app.use('/api', apiLimiter);

// Bind routing modules
app.use('/api/v1', routes);

// Base route for health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Collaboration API is running smoothly.',
  });
});

// Global Error Handler
app.use(errorHandler);

// Listen on Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server]: Smart Collaboration Server running on port ${PORT}`);
});
