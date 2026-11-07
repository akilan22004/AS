import 'dotenv/config';
import http from 'http';
import app from './app';
import { prisma } from './config/database';
import { ensureDirectoryExists } from './utils/fileHelpers';
import path from 'path';
import { uploadRoot } from './config/uploads';
import { isSupabaseAdminAuthEnabled } from './security/supabaseAuth';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function main() {
  if (!isSupabaseAdminAuthEnabled) {
    throw new Error('Set ADMIN_AUTH_PROVIDER=supabase to enable Admin Portal authentication.');
  }

  // Ensure upload directories exist
  await ensureDirectoryExists(path.join(uploadRoot, 'products'));
  await ensureDirectoryExists(path.join(uploadRoot, 'thumbnails'));
  await ensureDirectoryExists(path.join(uploadRoot, 'promotional'));

  // Test database connection
  await prisma.$connect();
  console.log('[DB] Connected to database');

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`[Server] Listening on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Server] CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  });

  const shutdown = async () => {
    console.log('[Server] Shutting down...');
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch(err => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
