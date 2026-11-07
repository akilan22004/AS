require('ts-node/register/transpile-only');

const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const {
  createTotpCode,
  decryptTotpSecret,
  encryptTotpSecret,
  generateTotpSecret,
  matchTotpStep,
  verifyTotpCode,
} = require('../src/security/totp');

process.env.MFA_ENCRYPTION_KEY = randomBytes(32).toString('base64');

const vectorSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
assert.equal(createTotpCode(vectorSecret, 59_000), '287082');
assert.equal(createTotpCode(vectorSecret, 1_111_111_109_000), '081804');
assert.equal(verifyTotpCode(vectorSecret, createTotpCode(vectorSecret, 59_000), 59_000), true);
assert.equal(verifyTotpCode(vectorSecret, '000000', 59_000), false);
assert.equal(verifyTotpCode(vectorSecret, '12345', 59_000), false);
assert.equal(verifyTotpCode(vectorSecret, createTotpCode(vectorSecret, 59_000), 59_000 + 60_000), false);
assert.equal(matchTotpStep(vectorSecret, createTotpCode(vectorSecret, 59_000), 59_000), 1);
assert.equal(matchTotpStep(vectorSecret, '12345', 59_000), null);

const secret = generateTotpSecret();
const email = 'admin@example.com';
const encrypted = encryptTotpSecret(secret, email);
assert.notEqual(encrypted, secret);
assert.equal(decryptTotpSecret(encrypted, email), secret);
assert.throws(() => decryptTotpSecret(encrypted, 'other@example.com'));
const parts = encrypted.split('.');
parts[2] = `${parts[2][0] === 'A' ? 'B' : 'A'}${parts[2].slice(1)}`;
assert.throws(() => decryptTotpSecret(parts.join('.'), email));

console.log('PASS TOTP RFC vectors, format validation, clock tolerance, replay step identification, encryption, tamper detection, and account binding.');
