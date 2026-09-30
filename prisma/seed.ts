import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const categories = ["Latest Articles", "Algorithms & Problem Solving", "Backend Engineering", "Installations", "DevOps", "Cloud"];

async function main() {
  for (const [order, name] of categories.entries()) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await prisma.category.upsert({ where: { slug }, update: { name, order }, create: { name, slug, order } });
  }
  await prisma.siteSettings.upsert({ where: { id: "site" }, update: {}, create: { id: "site" } });
}

main().finally(() => prisma.$disconnect());