import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
import path from 'path';
import config from '@/plugins/config';
import routes from '@/routes';
import mongodbPlugin from '@/plugins/mongodb';

const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  },
});

server.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/public/',
});

// Configuration CORS pour permettre les requêtes depuis le frontend Next.js
server.register(fastifyCors, {
  origin: [
    'http://localhost:3000', // Next.js en développement
    'http://127.0.0.1:3000', // Alternative localhost
    process.env.FRONTEND_URL || 'http://localhost:3000', // Variable d'environnement pour production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});

server.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
    files: 1, // Maximum number of files
  },
});
server.register(config);
server.register(mongodbPlugin);
server.register(routes);

export default server;
