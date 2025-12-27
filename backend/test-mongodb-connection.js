require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@'));
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database is accessible. Current user count: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('\n💡 Tip: You may need to whitelist your IP address in MongoDB Atlas:');
      console.error('   1. Go to MongoDB Atlas Dashboard');
      console.error('   2. Click "Network Access"');
      console.error('   3. Add your current IP address (or 0.0.0.0/0 for development)');
    }
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Tip: Check your username and password in the connection string');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

