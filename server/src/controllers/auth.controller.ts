import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const login = asyncHandler(async (_req: Request, res: Response) => {
  sendError(res, 'Use Supabase Email and Password authentication.', 410);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.session.adminId;
  if (adminId) {
    try {
      await authService.logAction(adminId, 'LOGOUT', 'admin_session');
    } catch {
      console.error('[Auth] Failed to record logout audit event.');
    }
  }
  req.session.destroy(error => {
    if (error) {
      console.error('[Auth] Failed to destroy admin session.');
      sendError(res, 'Could not securely end the session', 500);
      return;
    }
    res.clearCookie('af_session', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    sendSuccess(res, null, 'Logged out successfully');
  });
});

export const getMe = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, null);
});
