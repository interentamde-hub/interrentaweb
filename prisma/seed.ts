import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.sector.createMany({
    data: [{ name: "Norte" }, { name: "Sur" }, { name: "Centro" }],
    skipDuplicates: true,
  });

  const norte = await prisma.sector.findFirst({ where: { name: "Norte" } });
  if (norte) {
    await prisma.subsector.createMany({
      data: [
        { name: "Suburbio", sectorId: norte.id },
        { name: "Barrio exclusivo", sectorId: norte.id },
      ],
      skipDuplicates: true,
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: "CHANGEME",
      role: "ADMIN",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
