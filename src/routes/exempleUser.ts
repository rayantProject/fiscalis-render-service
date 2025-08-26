import { FastifyPluginAsync } from 'fastify';
import {
  getExempleUserById,
  getAllExempleUsers,
  createExempleUsers,
  updateExempleUser,
  deleteExempleUser,
} from '@/controllers/exempleUser';
import {
  GetExempleUserByIdReq,
  CreateExempleUserReq,
  DeleteExempleUserReq,
  UpdateExempleUserReq,
} from '@/interfaces/exempleUser';

const exempleUserRoutes: FastifyPluginAsync = async (server) => {
  server.get('/exemple-users', getAllExempleUsers);
  server.get<GetExempleUserByIdReq>('/exemple-users/:id', getExempleUserById);
  server.post<CreateExempleUserReq>('/exemple-users', createExempleUsers);
  server.patch<UpdateExempleUserReq>('/exemple-users/:id', updateExempleUser);
  server.delete<DeleteExempleUserReq>('/exemple-users/:id', deleteExempleUser);
};

export default exempleUserRoutes;
