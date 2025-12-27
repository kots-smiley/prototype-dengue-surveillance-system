import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Delete all barangays
  const deletedBarangays = await prisma.barangay.deleteMany({});
  console.log(`🗑️  Deleted ${deletedBarangays.count} barangays`);

  // Delete all users except admin
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        not: 'admin@dengue.local'
      }
    }
  });
  console.log(`🗑️  Deleted ${deletedUsers.count} users`);

  // Create or update admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dengue.local' },
    update: {
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true
    },
    create: {
      email: 'admin@dengue.local',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true
    }
  });
  console.log(`✅ Created/Updated admin user: ${admin.email}`);

  console.log('\n📝 Default login credentials:');
  console.log('Admin: admin@dengue.local / admin123');
  console.log('\n💡 Note: Barangays and other users should be created through the admin interface.');
  console.log('\n✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


