const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const units = await prisma.unitUsaha.findMany();
  const kategories = await prisma.kategoriTransaksi.findMany();

  if (units.length === 0 || kategories.length === 0) {
    console.log("No units or categories found. Cannot generate dummy data.");
    return;
  }

  const transactions = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 100; i++) {
    const randomUnit = units[Math.floor(Math.random() * units.length)];
    const randomKat = kategories[Math.floor(Math.random() * kategories.length)];
    
    // Random date within the current year
    const randomMonth = Math.floor(Math.random() * 12);
    const randomDay = Math.floor(Math.random() * 28) + 1; // Safely up to 28
    const date = new Date(currentYear, randomMonth, randomDay, 10, 0, 0);

    // Random amount between 50,000 and 5,000,000 (modulo 50k)
    const amount = (Math.floor(Math.random() * 100) + 1) * 50000;

    transactions.push({
      unitUsahaId: randomUnit.id,
      kategoriId: randomKat.id,
      tanggal: date,
      jumlah: amount,
      keterangan: `Testing Dummy Transaksi #${i+100}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  const result = await prisma.transaksiUnit.createMany({
    data: transactions
  });

  console.log(`Successfully created ${result.count} dummy transactions!`);
}

main()
  .catch((e) => {
    console.error("Error generating dummy data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
