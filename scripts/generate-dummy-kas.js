const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const currentYear = new Date().getFullYear();
  const kas = [];
  
  for (let i = 0; i < 100; i++) {
    // Random date within the current year
    const randomMonth = Math.floor(Math.random() * 12);
    const randomDay = Math.floor(Math.random() * 28) + 1; // Safely up to 28
    const date = new Date(currentYear, randomMonth, randomDay, 10, 0, 0);

    // Determines if income or outcome
    const tipe = Math.random() > 0.5 ? "PEMASUKAN" : "PENGELUARAN";

    // Random amount between 1,000,000 and 20,000,000 (modulo 500k)
    const amount = (Math.floor(Math.random() * 40) + 2) * 500000;

    kas.push({
      tanggal: date,
      jumlah: amount,
      tipe: tipe,
      keterangan: `Testing Dummy Arus Kas #${i+100} (${tipe})`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  const result = await prisma.kasBumdes.createMany({
    data: kas
  });

  console.log(`Successfully created ${result.count} dummy kas entries!`);
}

main()
  .catch((e) => {
    console.error("Error generating dummy data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
