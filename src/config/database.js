const { PrismaClient } = require('@prisma/client');

let prismaInstance; 
function getClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
    });
    console.log('Prisma Client initialized.'); 
  }
  return prismaInstance;
}


process.on('beforeExit', async () => {
  if (prismaInstance) { 
    console.log('🔌 Disconnecting from database (beforeExit)...');
    await prismaInstance.$disconnect();
  }
});

process.on('SIGINT', async () => {
  if (prismaInstance) { 
    console.log('🔌 Disconnecting from database (SIGINT)...');
    await prismaInstance.$disconnect();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (prismaInstance) { 
    console.log('🔌 Disconnecting from database (SIGTERM)...');
    await prismaInstance.$disconnect();
  }
  process.exit(0);
});

const testConnection = async () => {
  try {
    const prisma = getClient(); 
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = {
  getClient,
  testConnection 
};