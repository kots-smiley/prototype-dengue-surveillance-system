require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await prisma.$connect();
    console.log('Dropping database...');
    const result = await prisma.$runCommandRaw({ dropDatabase: 1 });
    console.log('Database cleared successfully:', JSON.stringify(result));
  } catch (error) {
    console.error('Failed to clear database:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
