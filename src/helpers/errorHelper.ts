import { FastifyReply, FastifyRequest } from 'fastify';

type ObjError = {
  error: string;
};

type ArrayErrors = {
  errors: string[];
};

type ObjMessage = {
  message: string;
};

export const errorHandler = (error: unknown = {}): string => {
  const defaultMessage = 'Un problème est survenu, veuillez réessayer';
  if (Array.isArray(error) && error.every((item) => typeof item === 'string')) {
    return error.join(', ');
  }
  if (typeof error === 'object') {
    if (
      Array.isArray((error as ArrayErrors).errors) &&
      (error as ArrayErrors).errors.every((item) => typeof item === 'string')
    ) {
      return (error as ArrayErrors).errors.join(', ');
    }
    if ((error as ObjError).error) return (error as ObjError).error || defaultMessage;
    if ((error as ObjMessage).message) return (error as ObjMessage).message || defaultMessage;
  }
  if (typeof error === 'string') return error || defaultMessage;
  return defaultMessage;
};

const getErrorStatusCode = (error: unknown): number => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as { statusCode: unknown }).statusCode === 'number'
  ) {
    return (error as { statusCode: number }).statusCode;
  }
  if (typeof (error as Error).cause === 'number') return (error as Error).cause as number;
  return 500;
};

export const errorResponse = (req: FastifyRequest, res: FastifyReply, error: unknown) => {
  req.log.error(error);
  const code = getErrorStatusCode(error);
  const message = errorHandler(error);
  return res.code(code).send({ error: message });
};
