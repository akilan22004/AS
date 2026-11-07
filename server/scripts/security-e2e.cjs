const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const net = require('node:net');
const path = require('node:path');
const { once } = require('node:events');

const serverRoot = path.resolve(__dirname, '..');
const testId = `${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
const testDirectory = path.join(serverRoot, 'test-results', `security-e2e-${testId}`);
const databasePath = path.join(testDirectory, 'security.db');
const databaseUrl = `file:${path.relative(path.join(serverRoot, 'prisma'), databasePath).replace(/\\/g, '/')}`;
const origin = 'https://security.example.test';
let apiBase;
let apiProcess;
let apiOutput = '';

function choosePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

function testEnvironment(port) {
  return {
    ...process.env,
    TS_NODE_FILES: 'true',
    NODE_ENV: 'production',
    DATABASE_URL: databaseUrl,
    ADMIN_AUTH_PROVIDER: 'supabase',
    SUPABASE_URL: 'https://test-project.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_key',
    SESSION_SECRET: crypto.randomBytes(48).toString('base64url'),
    SESSION_MAX_AGE_MS: '3600000',
    SESSION_STORE_DIR: testDirectory,
    UPLOAD_DIR: path.join(testDirectory, 'uploads'),
    CORS_ORIGIN: origin,
    TRUST_PROXY_HOPS: '1',
    PORT: String(port),
  };
}

async function startApi() {
  const port = await choosePort();
  apiBase = `http://127.0.0.1:${port}`;
  let lastProbeResult = 'no response';
  apiProcess = spawn(process.execPath, ['-r', 'ts-node/register', 'src/index.ts'], {
    cwd: serverRoot,
    env: testEnvironment(port),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  apiProcess.stdout.on('data', chunk => { apiOutput += String(chunk); });
  apiProcess.stderr.on('data', chunk => { apiOutput += String(chunk); });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (apiProcess.exitCode !== null) {
      throw new Error(`Isolated Supabase-mode API exited during startup: ${apiOutput.slice(-4000)}`);
    }
    try {
      const response = await fetch(`${apiBase}/api/auth/me`, {
        headers: { 'x-forwarded-proto': 'https' },
      });
      lastProbeResult = `HTTP ${response.status}`;
      if (response.ok) return;
    } catch (error) {
      lastProbeResult = error instanceof Error ? error.message : 'request failed';
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  throw new Error(`Isolated API did not become ready (${lastProbeResult}): ${apiOutput.slice(-4000)}`);
}

function headers(requestOrigin = origin) {
  const result = { 'x-forwarded-proto': 'https' };
  if (requestOrigin) result.origin = requestOrigin;
  return result;
}

async function run() {
  await fs.mkdir(testDirectory, { recursive: true });
  const prismaCli = path.join(serverRoot, 'node_modules', 'prisma', 'build', 'index.js');
  const pushed = spawnSync(process.execPath, [prismaCli, 'db', 'push', '--skip-generate'], {
    cwd: serverRoot,
    env: testEnvironment(0),
    encoding: 'utf8',
  });
  if (pushed.status !== 0) throw new Error(`Isolated SQLite schema setup failed: ${pushed.stderr || pushed.stdout}`);

  await startApi();

  const insecureTransport = await fetch(`${apiBase}/api/auth/me`);
  assert.equal(insecureTransport.status, 400, 'production mode rejects requests without trusted HTTPS');

  const deniedPreflight = await fetch(`${apiBase}/api/products`, {
    method: 'OPTIONS',
    headers: {
      'x-forwarded-proto': 'https',
      origin: 'https://attacker.example.test',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'authorization,content-type',
    },
  });
  assert.equal(deniedPreflight.headers.get('access-control-allow-origin'), null,
    'CORS does not allow an untrusted origin');

  const allowedPreflight = await fetch(`${apiBase}/api/products`, {
    method: 'OPTIONS',
    headers: {
      'x-forwarded-proto': 'https',
      origin,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'authorization,content-type',
    },
  });
  assert.equal(allowedPreflight.headers.get('access-control-allow-origin'), origin,
    'CORS allows the exact configured frontend origin');
  assert.match(allowedPreflight.headers.get('access-control-allow-headers') || '', /authorization/i,
    'CORS allows the Supabase bearer token header');

  const passwordOnlyLegacyLogin = await fetch(`${apiBase}/api/auth/login`, {
    method: 'POST',
    headers: { ...headers(), 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.test', password: 'not-a-real-password' }),
  });
  assert.equal(passwordOnlyLegacyLogin.status, 410,
    'the legacy Express login endpoint cannot authenticate or bypass Supabase Auth');

  const directAdminRead = await fetch(`${apiBase}/api/products/admin/all`, {
    headers: headers(),
  });
  assert.equal(directAdminRead.status, 401, 'direct protected API access without a Supabase token is denied');

  const exactOriginMutation = await fetch(`${apiBase}/api/products`, {
    method: 'POST',
    headers: {
      ...headers(),
      'sec-fetch-site': 'cross-site',
      'content-type': 'application/json',
    },
    body: '{}',
  });
  assert.equal(exactOriginMutation.status, 401,
    'the exact configured origin reaches backend authorization without a cross-origin false positive');

  const wrongOriginMutation = await fetch(`${apiBase}/api/products`, {
    method: 'POST',
    headers: {
      ...headers('https://attacker.example.test'),
      'content-type': 'application/json',
    },
    body: '{}',
  });
  assert.equal(wrongOriginMutation.status, 403, 'mutations from other origins remain rejected');

  const originlessCrossSiteMutation = await fetch(`${apiBase}/api/products`, {
    method: 'POST',
    headers: {
      ...headers(null),
      'sec-fetch-site': 'cross-site',
      'content-type': 'application/json',
    },
    body: '{}',
  });
  assert.equal(originlessCrossSiteMutation.status, 403,
    'origin-less cross-site mutations remain rejected');

  console.log('PASS Supabase auth boundary E2E: legacy login disabled, unauthorized admin operations denied, exact-origin bearer API access is not falsely blocked, hostile origins rejected, and production HTTPS/CORS enforced.');
}

run()
  .catch(error => {
    console.error(error instanceof Error ? error.message : 'Security E2E failed.');
    process.exitCode = 1;
  })
  .finally(async () => {
    if (apiProcess && apiProcess.exitCode === null) {
      apiProcess.kill('SIGTERM');
      await Promise.race([once(apiProcess, 'exit'), new Promise(resolve => setTimeout(resolve, 5000))]);
    }
    await fs.rm(testDirectory, { recursive: true, force: true });
  });
