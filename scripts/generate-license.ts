#!/usr/bin/env bun
/**
 * Utility script to generate license keys and insert them into the database
 * 
 * Usage:
 *   bun run scripts/generate-license.ts <productId> [count] [licenseKey]
 * 
 * Examples:
 *   bun run scripts/generate-license.ts "my-product" 5
 *   bun run scripts/generate-license.ts "my-product" 1 "CUSTOM-KEY-12345"
 */

import { db } from '../src/db';
import { licenses } from '../src/db/schema';
import { v4 as uuidv4 } from 'uuid';

function generateLicenseKey(): string {
  // Generate a license key in format: XXXX-XXXX-XXXX-XXXX
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(Math.random().toString(36).substring(2, 6).toUpperCase());
  }
  return segments.join('-');
}

async function createLicense(productId: string, licenseKey?: string) {
  const key = licenseKey || generateLicenseKey();
  
  try {
    const result = await db.insert(licenses).values({
      licenseKey: key,
      productId: productId,
      status: 'available',
    });
    
    console.log(`✅ Created license: ${key} for product: ${productId}`);
    return key;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error(`❌ License key already exists: ${key}`);
    } else {
      console.error(`❌ Error creating license:`, error.message);
    }
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: bun run scripts/generate-license.ts <productId> [count] [licenseKey]');
    console.error('');
    console.error('Examples:');
    console.error('  bun run scripts/generate-license.ts "my-product" 5');
    console.error('  bun run scripts/generate-license.ts "my-product" 1 "CUSTOM-KEY-12345"');
    process.exit(1);
  }

  const productId = args[0];
  const count = args[1] ? parseInt(args[1], 10) : 1;
  const customKey = args[2];

  if (isNaN(count) || count < 1) {
    console.error('❌ Count must be a positive number');
    process.exit(1);
  }

  console.log(`\n🔑 Generating ${count} license key(s) for product: ${productId}\n`);

  const keys: string[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const key = customKey && i === 0 ? customKey : undefined;
      const createdKey = await createLicense(productId, key);
      keys.push(createdKey);
    } catch (error) {
      // Error already logged
    }
  }

  console.log(`\n✨ Successfully created ${keys.length} license key(s):\n`);
  keys.forEach((key, index) => {
    console.log(`  ${index + 1}. ${key}`);
  });
  console.log('');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

