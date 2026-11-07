import session from 'express-session';
import ConnectSQLite from 'connect-sqlite3';
import path from 'path';

const SQLiteStore = ConnectSQLite(session);
const sessionSecret = process.env.SESSION_SECRET;

const maxAge = Number(process.env.SESSION_MAX_AGE_MS || 28800000);
if (!Number.isSafeInteger(maxAge) || maxAge < 300000 || maxAge > 86400000) {
  throw new Error('SESSION_MAX_AGE_MS must be between five minutes and 24 hours.');
}

if (process.env.NODE_ENV === 'production') {
  if (!sessionSecret || sessionSecret.length < 64 || /change[_ -]?this|development/i.test(sessionSecret)) {
    throw new Error('Production SESSION_SECRET must be a unique, random value of at least 64 characters.');
  }
}

export const sessionConfig = session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: process.env.SESSION_STORE_DIR || path.join(__dirname, '../../'),
  }) as session.Store,
  secret: sessionSecret || 'development-only-session-secret',
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
  },
  name: 'af_session',
});
