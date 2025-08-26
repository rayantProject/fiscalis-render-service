import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import mongoose from 'mongoose';
import { exempleUserModel, ExempleUserModel } from '../models/exempleUser';
import { fecModel, FECModel } from '../models/fec';

export interface Models {
  ExempleUser: ExempleUserModel;
  FEC: FECModel;
}

export interface Db {
  models: Models;
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
  }
}

const dbPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  const {  DB_PASSWORD, DB_USER } = server.config;
  const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.8v7jcqn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


  try {
    mongoose.connection.on('connected', () => {
      server.log.info({ actor: 'MongoDB' }, 'connected');
    });
    mongoose.connection.on('disconnected', () => {
      server.log.error({ actor: 'MongoDB' }, 'disconnected');
    });

    const models: Models = {
      ExempleUser: exempleUserModel,
      FEC: fecModel,
    };

    server.decorate('db', { models });

    await mongoose.connect(uri);
  } catch (error) {
    server.log.error('MongoDB connection error: ', error);
    throw error;
  }
};

export default fp(dbPlugin);
