import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.upsert({
        where: {
            email: "gaurav@example.com",
        },

        update: {},

        create: {
            name: "Gaurav",
            email: "gaurav@example.com",
            password: "password123",

            wallet: {
                create: {
                    balance: 100,
                },
            },
        },

        include: {
            wallet: true,
        },
    });

    console.log("✅ Database Seeded Successfully");
    console.log(user);
}
main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });