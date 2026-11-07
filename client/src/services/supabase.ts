import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Strip any accidental path suffixes (e.g. /rest/v1, /rest/v1/) that some
// users copy from the Supabase dashboard API URL.  The supabase-js SDK
// internally appends those paths itself; if they are already present the SDK
// produces duplicated paths like /rest/v1/rest/v1 → PGRST125 404 errors.
const _rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseUrl = _rawSupabaseUrl.replace(/\/(rest\/v1|auth\/v1|storage\/v1|realtime\/v1)\/?$/, '').replace(/\/+$/, '');
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  || '';

if (Boolean(supabaseUrl) !== Boolean(publishableKey)) {
  throw new Error('Configure both VITE_SUPABASE_URL and a publishable/anon key, or leave both empty.');
}

if (/service[_-]?role|sb_secret_/i.test(publishableKey)) {
  throw new Error('A Supabase service-role/secret key must never be configured in the frontend.');
}

if (supabaseUrl) {
  const parsedUrl = new URL(supabaseUrl);
  const isLocalSupabase = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';
  if (parsedUrl.protocol !== 'https:' && !(import.meta.env.DEV && isLocalSupabase)) {
    throw new Error('Supabase URL must use HTTPS outside local development.');
  }
}

const sessionStorage = {
  getItem(key: string): string | null {
    return globalThis.localStorage?.getItem(key) ?? globalThis.sessionStorage?.getItem(key) ?? null;
  },
  setItem(key: string, value: string): void {
    globalThis.localStorage?.removeItem(key);
    globalThis.sessionStorage?.removeItem(key);
    globalThis.sessionStorage?.setItem(key, value);
  },
  removeItem(key: string): void {
    globalThis.localStorage?.removeItem(key);
    globalThis.sessionStorage?.removeItem(key);
  },
};

export const supabase: SupabaseClient | null = supabaseUrl && publishableKey
  ? createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: sessionStorage,
      },
    })
  : null;

export async function getSupabaseAuthorizationHeader(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error('Could not read the Supabase session.');
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}
