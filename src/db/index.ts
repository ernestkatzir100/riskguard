import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dns from 'dns';

// Force IPv4 DNS resolution — Railway containers can't reach Supabase over IPv6
dns.setDefaultResultOrder('ipv4first');

const connectionString = process.env.DATABASE_URL!;

// Connection pool for server-side queries
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
