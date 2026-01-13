import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Admin kullanıcı (ilk kurulum)
  const adminUsername = "admin";
  const adminPassword = "123456";

  const existing = await prisma.user.findUnique({ where: { username: adminUsername } });

  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash: hash,
        createdAt: BigInt(Date.now()),
      },
    });

    console.log("✅ Seed: admin kullanıcı oluşturuldu (admin / 123456)");
  } else {
    console.log("ℹ️ Seed: admin zaten var, geçildi.");
  }

  // Örnek 2. kullanıcı (istersen açık kalsın, istemezsen bu bloğu silebilirsin)
  const user2Username = "user2";
  const user2Password = "abc123";

  const existing2 = await prisma.user.findUnique({ where: { username: user2Username } });

  if (!existing2) {
    const hash2 = await bcrypt.hash(user2Password, 10);

    await prisma.user.create({
      data: {
        username: user2Username,
        passwordHash: hash2,
        createdAt: BigInt(Date.now()),
      },
    });

    console.log("✅ Seed: user2 oluşturuldu (user2 / abc123)");
  } else {
    console.log("ℹ️ Seed: user2 zaten var, geçildi.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
