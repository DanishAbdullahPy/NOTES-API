const { PrismaClient } = require('@prisma/client');

let prismaInstance; 

function getClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    console.log('Prisma Client initialized.');
  }
  return prismaInstance;
}

const testConnection = async () => {
  try {
    const prisma = getClient();
    await prisma.$connect();
  } catch (error) {
    console.error('❌ Database connection failed during test:', error.message);
    process.exit(1);
  }
};

process.on('beforeExit', async () => {
  if (prismaInstance) {
    console.log('🔌 Disconnecting from database (beforeExit)...');
    await prismaInstance.$disconnect();
    console.log('✅ Database disconnected (beforeExit).');
  }
});

process.on('SIGINT', async () => {
  if (prismaInstance) {
    console.log('🔌 Disconnecting from database (SIGINT)...');
    await prismaInstance.$disconnect();
    console.log('✅ Database disconnected (SIGINT).');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (prismaInstance) {
    console.log('🔌 Disconnecting from database (SIGTERM)...');
    await prismaInstance.$disconnect();
    console.log('✅ Database disconnected (SIGTERM).');
  }
  process.exit(0);
});

module.exports = {
  getClient,
  testConnection
};