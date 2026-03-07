const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const units = await prisma.unitUsaha.findMany();

  if (units.length === 0) {
    console.log("No units found. Cannot generate dummy data.");
    return;
  }

  const setoran = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 100; i++) {
    const randomUnit = units[Math.floor(Math.random() * units.length)];
    
    // Random date within the current year
    const randomMonth = Math.floor(Math.random() * 12);
    const randomDay = Math.floor(Math.random() * 28) + 1; // Safely up to 28
    const date = new Date(currentYear, randomMonth, randomDay, 10, 0, 0);

    // Random amount between 100,000 and 10,000,000 (modulo 100k)
    const amount = (Math.floor(Math.random() * 100) + 1) * 100000;

    setoran.push({
      unitUsahaId: randomUnit.id,
      tanggal: date,
      jumlah: amount,
      keterangan: `Testing Dummy Setoran #${i+100}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  const result = await prisma.setoranBumdes.createMany({
    data: setoran
  });

  console.log(`Successfully created ${result.count} dummy setoran!`);
}

main()
  .catch((e) => {
    console.error("Error generating dummy data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
