import { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/apiResponse';

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const requireSameOrigin = (req: Request, res: Response, next: NextFunction): void => {
  if (!mutatingMethods.has(req.method)) {
    next();
    return;
  }

  const allowedOrigin = new URL(process.env.CORS_ORIGIN || 'http://localhost:5173').origin;
  const requestOrigin = req.get('origin');
  const fetchSite = req.get('sec-fetch-site');
  const isExactAllowedOrigin = requestOrigin === allowedOrigin;

  if (
    (requestOrigin && !isExactAllowedOrigin) ||
    (fetchSite === 'cross-site' && !requestOrigin) ||
    (process.env.NODE_ENV === 'production' && !requestOrigin)
  ) {
    sendError(res, 'Cross-origin request rejected', 403);
    return;
  }

  next();
};
