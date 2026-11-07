import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import { adminEmailAllowlist } from '../config/adminAccess';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env.local'), override: false });

const authProvider = process.env.ADMIN_AUTH_PROVIDER || 'supabase';
const supabaseUrl = process.env.SUPABASE_URL?.trim()
  || process.env.VITE_SUPABASE_URL?.trim()
  || '';
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
  || process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  || process.env.VITE_SUPABASE_ANON_KEY?.trim()
  || '';

if (authProvider !== 'legacy' && authProvider !== 'supabase') {
  throw new Error('ADMIN_AUTH_PROVIDER must be either "legacy" or "supabase".');
}

if (Boolean(supabaseUrl) !== Boolean(publishableKey)) {
  throw new Error('Configure both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, or leave both empty.');
}

if (/service[_-]?role|sb_secret_/i.test(publishableKey)) {
  throw new Error('The Supabase Auth bridge accepts only a publishable/anon key, never a service-role key.');
}

if (supabaseUrl) {
  const parsedUrl = new URL(supabaseUrl);
  const isLocalSupabase = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';
  if (parsedUrl.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && isLocalSupabase)) {
    throw new Error('SUPABASE_URL must use HTTPS outside local development.');
  }
}

if (authProvider === 'supabase' && (!supabaseUrl || !publishableKey)) {
  throw new Error('Supabase admin authentication is enabled but project URL or anon/publishable key is missing.');
}

export const isSupabaseAdminAuthEnabled = authProvider === 'supabase';

export class SupabaseAuthUnavailableError extends Error {
  constructor() {
    super('Supabase authentication could not be reached or is not configured correctly.');
    this.name = 'SupabaseAuthUnavailableError';
  }
}

function createRequestClient(accessToken?: string): SupabaseClient {
  if (!supabaseUrl || !publishableKey) throw new SupabaseAuthUnavailableError();
  return createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
  });
}

function isUnavailable(error: { status?: number; name?: string }): boolean {
  return error.name === 'AuthRetryableFetchError' ||
    error.name === 'FetchError' ||
    (typeof error.status === 'number' && error.status >= 500);
}

export async function resolveSupabaseAdmin(accessToken: string): Promise<{
  admin: Express.AdminRequestUser;
  client: SupabaseClient;
} | null> {
  const client = createRequestClient(accessToken);
  const { data: userData, error: userError } = await client.auth.getUser(accessToken);
  if (userError) {
    if (isUnavailable(userError)) throw new SupabaseAuthUnavailableError();
    return null;
  }

  if (!userData.user.id || !userData.user.email) return null;

  let isAuthorized = false;
  const email = userData.user.email.toLowerCase();

  try {
    const { data: authorized, error: authorizationError } = await client.rpc('is_admin');
    if (!authorizationError && authorized === true) {
      isAuthorized = true;
    }
  } catch {
    // Ignore RPC failure; fallback to allowlist
  }

  if (!isAuthorized && email && adminEmailAllowlist.has(email)) {
    isAuthorized = true;
  }

  if (!isAuthorized) return null;

  const username = userData.user.user_metadata?.username;
  const createdAt = new Date(userData.user.created_at);
  const updatedAt = new Date(userData.user.updated_at || userData.user.created_at);
  return {
    client,
    admin: {
      id: userData.user.id,
      email: userData.user.email,
      username: typeof username === 'string' ? username : userData.user.email.split('@')[0],
      role: 'admin',
      isActive: true,
      createdAt,
      updatedAt,
    },
  };
}

export async function checkSupabaseDatabaseConnection(): Promise<void> {
  const client = createRequestClient();
  const { error } = await client.from('categories').select('id').limit(1);
  if (error && error.code !== 'PGRST205') {
    const { error: storageError } = await client.storage.getBucket('furniture_image');
    if (storageError && (storageError.message?.includes('fetch failed') || (typeof (storageError as any).status === 'number' && (storageError as any).status >= 500))) {
      throw new SupabaseAuthUnavailableError();
    }
  }
}
