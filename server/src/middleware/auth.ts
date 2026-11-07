import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import {
  isSupabaseAdminAuthEnabled,
  resolveSupabaseAdmin,
  SupabaseAuthUnavailableError,
} from '../security/supabaseAuth';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!isSupabaseAdminAuthEnabled) {
    sendError(res, 'Supabase admin authentication is required.', 503);
    return;
  }

  const token = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '')?.[1];
  if (!token) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  try {
    const context = await resolveSupabaseAdmin(token);
    if (!context) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    req.admin = context.admin;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const adminId = context.admin.id;
      const client = context.client;
      res.once('finish', () => {
        if (res.statusCode < 400) {
          void client.from('admin_audit_logs').insert({
            admin_user_id: adminId,
            action: `ADMIN_${req.method}`,
            resource: `${req.baseUrl}${req.route?.path || req.path}`,
            metadata: { statusCode: res.statusCode },
          }).then(({ error }) => {
            if (error) console.error('[Audit] Failed to record a Supabase admin mutation.');
          });
        }
      });
    }
    next();
  } catch (error) {
    if (error instanceof SupabaseAuthUnavailableError) {
      console.error('[Auth] Supabase admin authorization is unavailable.');
      sendError(res, 'Admin authorization is temporarily unavailable', 503);
      return;
    }
    next(error);
  }
};
