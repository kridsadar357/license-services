import type { Config } from 'drizzle-kit';

// Parse DATABASE_URL to extract connection details
function getDbCredentials() {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname || 'localhost',
      port: parseInt(url.port || '3306', 10),
      user: url.username || 'root',
      password: url.password || '',
      database: url.pathname.slice(1) || 'license_db',
    };
  } catch (error) {
    // Fallback to URL string if parsing fails
    return {
      url: databaseUrl,
    };
  }
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  driver: 'mysql2',
  dbCredentials: getDbCredentials(),
} satisfies Config;

