import fastify from 'fastify';
import { Models } from '@/plugins/mongodb';
import routes from '@/routes';
import { exempleUserModel } from '@/models/exempleUser';
import { fecModel } from '@/models/fec';

const buildTestServer = () => {
  const server = fastify();
  const models: Models = {
    ExempleUser: exempleUserModel,
    FEC: fecModel,
  };

  server.decorate('db', { models });

  server.register(routes);

  return server;
};

export default buildTestServer;
