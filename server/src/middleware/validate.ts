import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';

export const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const messages = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      sendError(res, messages);
      return;
    }
    next(err);
  }
};
