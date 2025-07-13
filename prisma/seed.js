 
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create sample notes
  const notes = await prisma.note.createMany({
    data: [
      {
        title: 'Welcome to Notes App',
        content: 'This is My first note! You can create, edit, and organize your thoughts here.',
        tags: ['welcome', 'getting-started'],
        isFavorite: true,
        userId: user.id,
      },
      {
        title: 'Project Ideas',
        content: 'Some project ideas:\n- Building a chat app\n- you Create a todo list\n- Develop a blog platform',
        tags: ['projects', 'ideas', 'development'],
        isFavorite: false,
        userId: user.id,
      },
      {
        title: 'Learning Resources',
        content: 'Great resources for learning:\n- MDN Web Docs\n- FreeCodeCamp\n- Prisma Documentation',
        tags: ['learning', 'resources', 'web-development'],
        isFavorite: true,
        userId: user.id,
      },
    ],
  });

  console.log('✅ Created notes:', notes.count);

  // Create sample bookmarks
  const bookmarks = await prisma.bookmark.createMany({
    data: [
      {
        title: 'Prisma Documentation',
        url: 'https://prisma.io/docs',
        description: 'Complete documentation for Prisma ORM',
        tags: ['documentation', 'database', 'prisma'],
        isFavorite: true,
        userId: user.id,
      },
      {
        title: 'Express.js Guide',
        url: 'https://expressjs.com/en/guide/routing.html',
        description: 'Official Express.js routing guide',
        tags: ['express', 'nodejs', 'backend'],
        isFavorite: false,
        userId: user.id,
      },
      {
        title: 'PostgreSQL Tutorial',
        url: 'https://www.postgresql.org/docs/current/tutorial.html',
        description: 'Official PostgreSQL tutorial',
        tags: ['database', 'postgresql', 'sql'],
        isFavorite: true,
        userId: user.id,
      },
    ],
  });

  console.log('✅ Created bookmarks:', bookmarks.count);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });