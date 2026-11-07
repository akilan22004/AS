require('dotenv/config');

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { createClient } = require('@supabase/supabase-js');

function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    return Promise.reject(new Error('Run this command in an interactive terminal.'));
  }

  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onData);
      stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') {
          finish(new Error('Setup cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u0008' || character === '\u007f') {
          value = Array.from(value).slice(0, -1).join('');
        } else {
          value += character;
        }
      }
    };

    stdin.on('data', onData);
  });
}

async function main() {
  const url = process.env.SUPABASE_URL?.trim();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey || /service[_-]?role|sb_secret_/i.test(publishableKey)) {
    throw new Error('Set SUPABASE_URL and a publishable SUPABASE_PUBLISHABLE_KEY in server/.env.');
  }
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('Run this command in an interactive terminal.');
  }

  const prompt = readline.createInterface({ input: stdin, output: stdout });
  let supabase;
  try {
    const email = (await prompt.question('Authorized admin email: ')).trim().toLowerCase();
    prompt.close();
    const password = await readHidden('Admin password (input hidden): ');
    supabase = createClient(url, publishableKey, {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    });

    const { data: login, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError || !login.session) {
      throw new Error('Authentication failed. Check the email, password, and Supabase project configuration.');
    }

    const { data: account, error: accountError } = await supabase
      .from('admin_accounts')
      .select('slot')
      .eq('user_id', login.user.id)
      .maybeSingle();
    if (accountError || !account) {
      throw new Error('This Auth user is not assigned to an authorized admin slot.');
    }

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) throw new Error('Could not inspect the account authenticator setup.');
    if (factors.totp.some(factor => factor.status === 'verified')) {
      stdout.write('A verified authenticator is already enrolled for this account.\n');
      return;
    }

    for (const factor of factors.totp) {
      if (factor.status === 'unverified') {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (error) throw new Error('Could not clear an incomplete authenticator enrollment.');
      }
    }

    const { data: enrollment, error: enrollmentError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Annamalai Furniture Admin',
    });
    if (enrollmentError || !enrollment?.totp?.uri) {
      throw new Error('Could not create an authenticator enrollment for this account.');
    }

    stdout.write(
      '\nAuthenticator setup URI (contains the TOTP secret; display only in this trusted terminal):\n' +
      `${enrollment.totp.uri}\n\n`
    );

    let verified = false;
    for (let attempt = 0; attempt < 3 && !verified; attempt += 1) {
      const code = await readHidden('Enter the current 6-digit authenticator code (input hidden): ');
      if (!/^\d{6}$/.test(code)) {
        stdout.write('Enter exactly six digits.\n');
        continue;
      }
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollment.id,
        code,
      });
      if (error) stdout.write('Code not verified; try again.\n');
      else verified = true;
    }

    if (!verified) throw new Error('Authenticator verification failed. Run the setup command again.');
    stdout.write('Authenticator enrolled and verified. Sign-in will now require its 6-digit code.\n');
  } finally {
    prompt.close();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error('Could not end the temporary setup session.');
    }
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Authenticator enrollment failed.');
  process.exitCode = 1;
});
