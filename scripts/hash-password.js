#!/usr/bin/env node

/**
 * Mono Time - Admin Password Hasher
 * Prompts for a password in terminal, generates a secure bcrypt hash,
 * and prints the configuration line for .env.
 * 
 * Never hardcode or commit plaintext passwords!
 */

const readline = require('readline');
const bcrypt = require('bcryptjs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter admin password to hash: ', (password) => {
  if (!password || password.trim().length === 0) {
    console.error('Error: Password cannot be empty.');
    rl.close();
    process.exit(1);
  }

  const saltRounds = 12;
  const hash = bcrypt.hashSync(password.trim(), saltRounds);

  console.log('\n--- Paste this into your .env file ---');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('-------------------------------------\n');

  rl.close();
});

