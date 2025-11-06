import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// ใช้ Connection Pool เพื่อประสิทธิภาพที่ดีกว่า
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL, // โหลดจาก .env
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });
export type Database = typeof db;

