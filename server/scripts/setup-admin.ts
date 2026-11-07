import 'dotenv/config';
import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { z } from 'zod';
import {
  createTotpEnrollmentUri,
  encryptTotpSecret,
  generateTotpSecret,
  verifyTotpCode,
} from '../src/security/totp';

const prisma = new PrismaClient();
const localEnvPath = path.resolve(__dirname, '../.env');
const emailSchema = z.string().email().max(254);

function ask(prompt: string): Promise<string> {
  const interfaceInstance = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    interfaceInstance.question(prompt, answer => {
      interfaceInstance.close();
      resolve(answer.trim());
    });
  });
}

function askSecret(prompt: string): Promise<string> {
  const input = process.stdin;
  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    throw new Error('Run this setup from a local interactive terminal so passwords and OTPs are not echoed.');
  }

  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error?: Error) => {
      input.removeListener('data', onData);
      input.setRawMode(false);
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk: Buffer | string) => {
      for (const character of String(chunk)) {
        if (character === '\u0003') {
          finish(new Error('Admin setup cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
        } else if (/^[\x20-\x7e]$/.test(character)) {
          value += character;
        }
      }
    };

    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
    process.stdout.write(prompt);
  });
}

function validateStrongPassword(password: string): boolean {
  return password.length >= 14 &&
    password.length <= 128 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

async function updateLocalSetting(key: string, value: string): Promise<void> {
  let contents = '';
  try {
    contents = await fs.readFile(localEnvPath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  const lines = contents.split(/\r?\n/);
  const prefix = `${key}=`;
  const entry = `${prefix}${value}`;
  let replaced = false;
  const updatedLines = lines.flatMap(line => {
    if (!line.startsWith(prefix)) return [line];
    if (replaced) return [];
    replaced = true;
    return [entry];
  });
  if (!replaced) updatedLines.push(entry);

  await fs.writeFile(localEnvPath, `${updatedLines.join('\n').replace(/\n+$/, '')}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  try {
    await fs.chmod(localEnvPath, 0o600);
  } catch (error) {
    if (process.platform !== 'win32') throw error;
  }
}

function configuredEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

async function collectAdmin(email: string) {
  const username = await ask(`Unique username for ${email}: `);
  if (!/^[A-Za-z0-9._-]{3,40}$/.test(username)) {
    throw new Error('Username must be 3–40 characters and contain only letters, numbers, dot, underscore, or hyphen.');
  }
  const password = await askSecret(`Password for ${email} (hidden; 14+ characters): `);
  const confirmation = await askSecret(`Confirm password for ${email}: `);
  if (password !== confirmation || !validateStrongPassword(password)) {
    throw new Error('Password confirmation failed or password does not meet the 14-character complexity requirements.');
  }

  const totpSecret = generateTotpSecret();
  console.log(`\nEnroll ${email} in an authenticator app before continuing.`);
  console.log(`Manual setup key (one-time display): ${totpSecret}`);
  console.log(`Authenticator URI: ${createTotpEnrollmentUri(totpSecret, email)}\n`);
  const code = await askSecret('Enter the current 6-digit authenticator code to confirm enrollment: ');
  if (!verifyTotpCode(totpSecret, code)) {
    throw new Error('The authenticator code was not accepted. No account changes were saved.');
  }

  return {
    email,
    username,
    passwordHash: await bcrypt.hash(password, 12),
    totpSecret: encryptTotpSecret(totpSecret, email),
  };
}

async function main(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalDevelopment = process.env.NODE_ENV === 'development' &&
    /^file:/i.test(process.env.DATABASE_URL || '');
  if (!isLocalDevelopment && !isProduction) {
    throw new Error('Admin setup is allowed only for development SQLite or an explicitly confirmed production operator session.');
  }
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Admin setup must be run from a local interactive terminal.');
  }

  let encryptionKey = process.env.MFA_ENCRYPTION_KEY;
  if (encryptionKey) {
    const decodedKey = Buffer.from(encryptionKey, 'base64');
    if (decodedKey.length !== 32 || decodedKey.toString('base64') !== encryptionKey) {
      throw new Error('Existing MFA_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
    }
  } else if (isLocalDevelopment) {
    encryptionKey = randomBytes(32).toString('base64');
    await updateLocalSetting('MFA_ENCRYPTION_KEY', encryptionKey);
    process.env.MFA_ENCRYPTION_KEY = encryptionKey;
  } else {
    throw new Error('Production MFA_ENCRYPTION_KEY must be injected through the host secret manager.');
  }

  console.log('\n=== Secure Annamalai Furniture Admin Setup ===');
  console.log('Configure exactly two admin accounts. Password and OTP input is hidden.\n');
  const emails: string[] = [];
  for (let index = 0; index < 2; index += 1) {
    const email = (await ask(`Authorized admin email ${index + 1} of 2: `)).toLowerCase();
    if (!emailSchema.safeParse(email).success || emails.includes(email)) {
      throw new Error('Enter two distinct valid email addresses.');
    }
    emails.push(email);
  }

  if (isProduction) {
    const allowlist = configuredEmails();
    if (
      process.env.ADMIN_SETUP_CONFIRM_PRODUCTION !== 'true' ||
      allowlist.length !== 2 ||
      new Set(allowlist).size !== 2 ||
      emails.some(email => !allowlist.includes(email))
    ) {
      throw new Error('Production setup requires ADMIN_SETUP_CONFIRM_PRODUCTION=true and the two entered emails to match the existing ADMIN_EMAILS allowlist exactly.');
    }
    if (
      !process.env.SESSION_SECRET ||
      process.env.SESSION_SECRET.length < 64 ||
      /change[_ -]?this|development/i.test(process.env.SESSION_SECRET)
    ) {
      throw new Error('Production SESSION_SECRET must be configured before provisioning administrators.');
    }
    if ((await ask('Type PROVISION ADMINS to confirm this production database change: ')) !== 'PROVISION ADMINS') {
      throw new Error('Production setup confirmation did not match; no account changes were saved.');
    }
  }

  const admins = [];
  for (const email of emails) admins.push(await collectAdmin(email));

  const usernames = new Set(admins.map(admin => admin.username.toLowerCase()));
  if (usernames.size !== 2) throw new Error('The two admin usernames must be distinct.');

  const previousAllowlist = process.env.ADMIN_EMAILS;
  if (isLocalDevelopment) {
    await updateLocalSetting('ADMIN_EMAILS', emails.join(','));
    process.env.ADMIN_EMAILS = emails.join(',');
  }
  try {
    await prisma.$transaction(admins.map(admin => prisma.adminUser.upsert({
      where: { email: admin.email },
      create: {
        email: admin.email,
        username: admin.username,
        password: admin.passwordHash,
        totpSecret: admin.totpSecret,
        totpEnabled: true,
        totpLastUsedStep: null,
        role: 'admin',
        isActive: true,
      },
      update: {
        username: admin.username,
        password: admin.passwordHash,
        totpSecret: admin.totpSecret,
        totpEnabled: true,
        totpLastUsedStep: null,
        role: 'admin',
        isActive: true,
      },
    })));
  } catch (error) {
    if (isLocalDevelopment && previousAllowlist !== undefined) {
      await updateLocalSetting('ADMIN_EMAILS', previousAllowlist);
      process.env.ADMIN_EMAILS = previousAllowlist;
    }
    throw error;
  }

  console.log('\nBoth allowlisted admin accounts are configured with password hashing and confirmed 2FA enrollment.');
  console.log('Keep the local MFA encryption key private and backed up; losing it requires re-enrollment.');
  console.log('No passwords or OTP values were written to the environment file or database in plaintext.\n');
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : 'Admin setup failed.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
