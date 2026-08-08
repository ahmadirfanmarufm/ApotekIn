import { prisma } from "@/prisma/config";
import bcryptjs from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcryptjs.hash("admin123", 10);

  await prisma.user.create({
    data: {
      username: "admin",
      fullName: "Admin User",
      password: hashedPassword,
      email: "admin@apotekin.com",
      phone: "081234567890",
      age: 20,
      role: "SUPERADMIN",
    }
  })

  console.log("Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  })