import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getPublicSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.getAll();
  // Only expose safe public settings
  const publicKeys = ['businessName', 'whatsappEnabled', 'aboutContent', 'contactEmail'];
  const publicSettings = Object.fromEntries(
    Object.entries(settings).filter(([k]) => publicKeys.includes(k))
  );
  sendSuccess(res, publicSettings);
});

export const getAllSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.getAll();
  sendSuccess(res, settings);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  await settingsService.setMany(req.body);
  sendSuccess(res, null, 'Settings updated');
});
