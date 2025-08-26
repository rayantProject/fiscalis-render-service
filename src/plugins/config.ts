import dotenv from 'dotenv';

dotenv.config();

import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import Ajv from 'ajv';

export enum NodeEnv {
  development = 'development',
  test = 'test',
  production = 'production',
}

const ConfigSchema = Type.Object({
  NODE_ENV: Type.Enum(NodeEnv),
  LOG_LEVEL: Type.String(),
  API_HOST: Type.String(),
  API_PORT: Type.String(),
  DB_HOST: Type.String(),
  DB_PORT: Type.String(),
  DB_NAME: Type.String(),
  DB_USER: Type.Optional(Type.String()),
  DB_PASSWORD: Type.Optional(Type.String()),
});

const ajv = new Ajv({
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
});

export type Config = Static<typeof ConfigSchema>;

const configPlugin: FastifyPluginAsync = async (server) => {
  const validate = ajv.compile(ConfigSchema);
  const valid = validate(process.env);
  if (!valid) {
    throw new Error('.env file validation failed - ' + JSON.stringify(validate.errors, null, 2));
  }
  server.decorate('config', process.env as Config);
};

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
}

export default fp(configPlugin);
