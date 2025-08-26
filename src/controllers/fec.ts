import {
  GetFECByIdReq,
  CreateFECReq,
  UpdateFECReq,
  DeleteFECReq,
  DeleteManyFECReq,
  ImportFECFileReq,
} from '@/interfaces/fec';
import { FastifyRequest, FastifyReply } from 'fastify';
import { errorResponse } from '../helpers/errorHelper';
import createError from '@fastify/error';
import { parseFECFromBuffer, validateFECEntries, FECParseError } from '../utils/fecParser';
import mongoose from 'mongoose';

const FECNotFound = createError('FEC_NOT_FOUND', 'FEC entry not found', 404);
const InvalidObjectId = createError('INVALID_OBJECT_ID', 'Invalid ObjectId format', 400);
FECNotFound.prototype.statusCode = 404;
InvalidObjectId.prototype.statusCode = 400;

export const getAllFECEntries = async (request: FastifyRequest, reply: FastifyReply) => {
  const { db } = request.server;
  const { FEC } = db.models;

  try {
    const entries = await FEC.getAll().lean();
    return reply.send(entries);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

export const getFECById = async (request: FastifyRequest<GetFECByIdReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { FEC } = db.models;
  const { id } = request.params;

  try {
    request.log.info(`getFECById called with id: "${id}" (type: ${typeof id})`);
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      request.log.warn(`Invalid ObjectId received: "${id}"`);
      throw new InvalidObjectId();
    }

    const entry = await FEC.getById(id).lean();
    if (!entry) throw new FECNotFound();
    return reply.send(entry);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

export const createFECEntries = async (request: FastifyRequest<CreateFECReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { FEC } = db.models;
  const { entries } = request.body;

  try {
    const createdEntries = await FEC.createManyEntries(entries);
    return reply.status(201).send(createdEntries);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

export const updateFECEntry = async (request: FastifyRequest<UpdateFECReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { FEC } = db.models;
  const { id } = request.params;
  const { entry } = request.body;

  try {
    // Valider que l'ID est un ObjectId MongoDB valide
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new InvalidObjectId();
    }

    const updatedEntry = await FEC.updateEntry(id, entry);
    if (!updatedEntry) throw new FECNotFound();
    return reply.send(updatedEntry);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

export const deleteFECEntry = async (request: FastifyRequest<DeleteFECReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { FEC } = db.models;
  const { id } = request.params;

  try {
    // Valider que l'ID est un ObjectId MongoDB valide
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new InvalidObjectId();
    }

    const entry = await FEC.deleteEntry(id);
    if (!entry) {
      return reply.status(404).send({ message: 'FEC entry not found' });
    }
    return reply.send(entry);
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

/**
 * Contrôleur pour supprimer plusieurs entrées FEC en même temps
 */
export const deleteManyFECEntries = async (request: FastifyRequest<DeleteManyFECReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { FEC } = db.models;
  const { ids } = request.body;

  try {
    // Valider que les IDs sont fournis
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return reply.status(400).send({
        error: 'IDs manquants',
        message: "Veuillez fournir un tableau d'IDs à supprimer",
      });
    }

    // Valider que tous les IDs sont des ObjectId MongoDB valides
    const invalidIds = ids.filter((id) => !id || !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return reply.status(400).send({
        error: 'IDs invalides',
        message: `Les IDs suivants ne sont pas valides: ${invalidIds.join(', ')}`,
      });
    }

    request.log.info(`Tentative de suppression de ${ids.length} entrées FEC`);

    // Supprimer toutes les entrées correspondantes
    const deleteResult = await FEC.deleteMany({ _id: { $in: ids } });

    if (deleteResult.deletedCount === 0) {
      return reply.status(404).send({
        message: 'Aucune entrée FEC trouvée avec les IDs fournis',
        deletedCount: 0,
      });
    }

    request.log.info(`${deleteResult.deletedCount} entrées FEC supprimées avec succès`);

    return reply.send({
      message: `${deleteResult.deletedCount} entrée(s) FEC supprimée(s) avec succès`,
      deletedCount: deleteResult.deletedCount,
      requestedCount: ids.length,
    });
  } catch (error) {
    return errorResponse(request, reply, error);
  }
};

/**
 * Contrôleur pour importer un fichier FEC et créer les entrées correspondantes
 */
export const importFECFile = async (request: FastifyRequest<ImportFECFileReq>, reply: FastifyReply) => {
  const { db } = request.server;
  const { FEC } = db.models;

  try {
    // Récupérer le fichier depuis le multipart
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({
        error: 'Aucun fichier fourni',
        message: 'Veuillez fournir un fichier FEC à importer',
      });
    }

    // Vérifier le type de fichier
    const allowedMimeTypes = ['text/plain', 'text/csv', 'application/octet-stream'];
    const allowedExtensions = ['.txt', '.csv', '.fec'];
    const fileExtension = data.filename ? '.' + data.filename.split('.').pop()?.toLowerCase() : '';

    if (!allowedMimeTypes.includes(data.mimetype) && !allowedExtensions.includes(fileExtension)) {
      return reply.status(400).send({
        error: 'Type de fichier non supporté',
        message: 'Veuillez fournir un fichier FEC (.txt, .csv, .fec)',
      });
    }

    request.log.info(`Import du fichier FEC: ${data.filename} (${data.mimetype})`);

    // Lire le contenu du fichier
    const fileBuffer = await data.toBuffer();

    // Options de parsing (peuvent être personnalisées via query params dans le futur)
    const options = {
      separator: '|',
      encoding: 'utf8' as BufferEncoding,
      skipFirstLine: true, // Skip header line
    };

    // Parser le fichier FEC
    const entries = parseFECFromBuffer(fileBuffer, options);
    request.log.info(`${entries.length} entrées parsées depuis le fichier`);

    // Valider les entrées
    validateFECEntries(entries);

    // Créer les entrées en base de données
    const createdEntries = await FEC.createManyEntries(entries);

    request.log.info(`${createdEntries.length} entrées FEC créées en base de données`);

    return reply.status(201).send({
      message: `${createdEntries.length} entrées FEC importées avec succès`,
      count: createdEntries.length,
      filename: data.filename,
      entries: createdEntries,
    });
  } catch (error) {
    if (error instanceof FECParseError) {
      request.log.error('Erreur de parsing du fichier FEC:', error);
      return reply.status(400).send({
        error: 'Erreur de parsing du fichier FEC',
        message: error.message,
        line: error.line,
        field: error.field,
      });
    }
    return errorResponse(request, reply, error);
  }
};
