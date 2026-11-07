import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOTP_PERIOD_MS = 30_000;

export function getEncryptionKey(): Buffer {
  const encoded = process.env.MFA_ENCRYPTION_KEY;
  if (!encoded) throw new Error('MFA_ENCRYPTION_KEY must be configured before using admin 2FA.');

  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32 || key.toString('base64') !== encoded) {
    throw new Error('MFA_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  }
  return key;
}

function decodeBase32(value: string): Buffer {
  const normalized = value.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let buffer = 0;
  const bytes: number[] = [];

  for (const character of normalized) {
    const digit = BASE32_ALPHABET.indexOf(character);
    if (digit < 0) throw new Error('Invalid TOTP secret.');
    buffer = (buffer << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  const bytes = randomBytes(20);
  let output = '';
  let bits = 0;
  let buffer = 0;

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(buffer << (5 - bits)) & 31];
  return output;
}

export function createTotpCode(secret: string, timestamp = Date.now()): string {
  const counter = BigInt(Math.floor(timestamp / TOTP_PERIOD_MS));
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(counter);
  const digest = createHmac('sha1', decodeBase32(secret)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const number = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1_000_000;
  return String(number).padStart(6, '0');
}

export function matchTotpStep(secret: string, code: string, timestamp = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const candidate = Buffer.from(code);
  const currentStep = Math.floor(timestamp / TOTP_PERIOD_MS);
  let matchedStep: number | null = null;
  for (const step of [currentStep, currentStep - 1, currentStep + 1]) {
    const expected = Buffer.from(createTotpCode(secret, step * TOTP_PERIOD_MS));
    if (timingSafeEqual(candidate, expected)) matchedStep = step;
  }
  return matchedStep;
}

export function verifyTotpCode(secret: string, code: string, timestamp = Date.now()): boolean {
  return matchTotpStep(secret, code, timestamp) !== null;
}

export function encryptTotpSecret(secret: string, email: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  cipher.setAAD(Buffer.from(email.trim().toLowerCase()));
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

export function decryptTotpSecret(encrypted: string, email: string): string {
  const [version, encodedIv, encodedTag, encodedCiphertext, extra] = encrypted.split('.');
  if (version !== 'v1' || !encodedIv || !encodedTag || !encodedCiphertext || extra) {
    throw new Error('Stored two-factor secret has an unsupported format.');
  }

  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(encodedIv, 'base64url'));
  decipher.setAAD(Buffer.from(email.trim().toLowerCase()));
  decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function createTotpEnrollmentUri(secret: string, email: string): string {
  const label = encodeURIComponent(`Annamalai Furniture:${email.trim().toLowerCase()}`);
  const issuer = encodeURIComponent('Annamalai Furniture');
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}
