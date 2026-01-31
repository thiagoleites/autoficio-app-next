import "dotenv/config";
import { prisma } from "../src/lib/db";

async function run() {
  const users = await prisma.user.findMany();
  console.log(users);
}

run()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
