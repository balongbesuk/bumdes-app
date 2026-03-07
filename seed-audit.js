const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Menurunkan 350 log audit palsu untuk tes pagination...");
  const u = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!u) { console.error("Admin tdk ditemukan"); return; }
  
  let data = [];
  for (let i = 0; i < 350; i++) {
     let date = new Date();
     date.setHours(date.getHours() - i);
     data.push({
       userId: u.id,
       action: i % 3 === 0 ? "UPDATE" : i % 5 === 0 ? "DELETE" : "CREATE",
       entity: "SimulasiData",
       details: `Log simulasi aktivitas sistem ke-${i + 1} untuk testing pagination.`,
       createdAt: date,
     });
  }
  
  await prisma.auditLog.createMany({ data });
  console.log("Sukses!");
}
main().finally(() => prisma.$disconnect());
