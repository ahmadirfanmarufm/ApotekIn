import { PrismaClient } from '../../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export * from '../../prisma/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL tidak ditemukan');
}

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });