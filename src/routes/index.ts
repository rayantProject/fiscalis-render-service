import { FastifyPluginAsync } from 'fastify';
import exempleUserRoutes from './exempleUser';
import fecRoutes from './fec';

const routes: FastifyPluginAsync = async (server) => {
  server.get('/', async function (request, reply) {
    return reply.redirect('/public/readme.html');
  });
  server.register(exempleUserRoutes);
  server.register(fecRoutes);
};

export default routes;
