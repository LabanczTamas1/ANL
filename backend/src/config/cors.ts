import cors from 'cors';
import { env } from './env.js';

const isDev = env.NODE_ENV === 'development';

const allowedOrigins = [
  ...env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
  'http://localhost:5173',
  'http://192.168.0.134:5174',
  'http://192.168.0.134:5173',
  'http://192.168.0.120:5173',
  'http://192.168.0.137:5173',
  'http://192.168.0.156:5173',
  'http://192.168.0.119:5173',
];

const uniqueOrigins = [...new Set(allowedOrigins)];

const corsOptions: cors.CorsOptions = isDev
  ? {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Client-Platform',
        'X-Request-Id',
      ],
      credentials: true,
    }
  : {
      origin(origin, callback) {
        if (!origin || uniqueOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Client-Platform',
        'X-Request-Id',
      ],
      credentials: true,
    };

export const corsMiddleware = cors(corsOptions);
