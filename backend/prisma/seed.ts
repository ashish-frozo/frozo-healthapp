import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create a demo user for testing in staging environments
    const demoUser = await prisma.user.upsert({
        where: { phoneNumber: '0000000000' },
        update: {},
        create: {
            phoneNumber: '0000000000',
            profiles: {
                create: {
                    name: 'Demo User',
                    relationship: 'myself',
                    role: 'caregiver',
                    dateOfBirth: new Date('1990-01-01'),
                    bloodType: 'O+',
                    allergies: [],
                    conditions: [],
                    medications: [],
                },
            },
        },
    });

    console.log('✅ Demo user created:', demoUser.id);

    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
