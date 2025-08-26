import { FastifyPluginAsync } from 'fastify';
import {
  getFECById,
  getAllFECEntries,
  createFECEntries,
  updateFECEntry,
  deleteFECEntry,
  deleteManyFECEntries,
  importFECFile,
} from '@/controllers/fec';
import {
  GetFECByIdReq,
  CreateFECReq,
  DeleteFECReq,
  DeleteManyFECReq,
  UpdateFECReq,
  ImportFECFileReq,
} from '@/interfaces/fec';

const fecRoutes: FastifyPluginAsync = async (server) => {
  server.get('/fec', getAllFECEntries);
  server.get<GetFECByIdReq>('/fec/:id', getFECById);
  server.post<CreateFECReq>('/fec', createFECEntries);
  server.post<ImportFECFileReq>('/fec/import', importFECFile);
  server.patch<UpdateFECReq>('/fec/:id', updateFECEntry);
  server.delete<DeleteFECReq>('/fec/:id', deleteFECEntry);
  server.delete<DeleteManyFECReq>('/fec/bulk-delete', deleteManyFECEntries);
};

export default fecRoutes;
