import { z } from 'zod';

const emailSchema = z.string().email();
const configuredEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

export const adminEmailAllowlist = new Set(configuredEmails);
export const hasValidAdminAllowlist =
  configuredEmails.length === 2 &&
  new Set(configuredEmails).size === 2 &&
  configuredEmails.every(email => emailSchema.safeParse(email).success);
