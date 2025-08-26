import {
  GetExempleUserByIdReq,
  CreateExempleUserReq,
  UpdateExempleUserReq,
  DeleteExempleUserReq,
} from '@/interfaces/exempleUser';
import { FastifyRequest, FastifyReply } from 'fastify';
import { errorResponse } from '../helpers/errorHelper';
import createError from '@fastify/error';

const ExempleUserNotFound = createError('EXEMPLE_USER_NOT_FOUND', 'ExempleUser not found', 404);
ExempleUserNotFound.prototype.statusCode = 404;

export const getAllExempleUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const { db } = request.server;
  const { ExempleUser } = db.models;

  try {
    const users = await ExempleUser.getAll().lean();
    return reply.send(users);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

export const getExempleUserById = async (request: FastifyRequest<GetExempleUserByIdReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { ExempleUser } = db.models;
  const { id } = request.params;

  try {
    const user = await ExempleUser.getById(id).lean();
    if (!user) throw new ExempleUserNotFound();
    return reply.send(user);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

export const createExempleUsers = async (request: FastifyRequest<CreateExempleUserReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { ExempleUser } = db.models;
  const { users } = request.body;

  try {
    const createdUsers = await ExempleUser.createManyUsers(users);
    return reply.status(201).send(createdUsers);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

export const updateExempleUser = async (request: FastifyRequest<UpdateExempleUserReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { ExempleUser } = db.models;
  const { id } = request.params;
  const { user } = request.body;

  try {
    const updatedUser = await ExempleUser.updateUser(id, user);
    if (!updatedUser) throw new ExempleUserNotFound();
    return reply.send(updatedUser);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

export const deleteExempleUser = async (request: FastifyRequest<DeleteExempleUserReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { ExempleUser } = db.models;
  const { id } = request.params;

  try {
    const user = await ExempleUser.deleteUser(id);
    if (!user) {
      return reply.status(404).send({ message: 'ExempleUser not found' });
    }
    return reply.send(user);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};
