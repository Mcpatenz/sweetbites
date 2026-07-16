import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      id: "admin-1",
      name: "Admin",
      email: "admin@sweetbites.com",
      password: hashedPassword,
      role: "admin",
      phone: "+639123456789",
    },
  });

  await Promise.all([
    prisma.category.create({ data: { id: "cat-1", name: "Cakes", description: "Delicious homemade cakes" } }),
    prisma.category.create({ data: { id: "cat-2", name: "Cupcakes", description: "Fresh baked cupcakes" } }),
    prisma.category.create({ data: { id: "cat-3", name: "Cheesecakes", description: "Creamy cheesecakes" } }),
    prisma.category.create({ data: { id: "cat-4", name: "Cookies", description: "Homemade cookies" } }),
    prisma.category.create({ data: { id: "cat-5", name: "Desserts", description: "Various desserts" } }),
    prisma.category.create({ data: { id: "cat-6", name: "Drinks", description: "Beverages" } }),
    prisma.category.create({ data: { id: "cat-7", name: "Snacks", description: "Light snacks" } }),
    prisma.category.create({ data: { id: "cat-8", name: "Meals", description: "Full meals" } }),
  ]);

  const products = [
    { id: "prod-1", categoryId: "cat-1", name: "Chocolate Moist Cake", description: "Rich and moist chocolate cake, perfect for celebrations", price: 350, stock: 10, image: "/products/08260f21-ae52-414a-8698-8fa16bd59362.jpg" },
    { id: "prod-2", categoryId: "cat-2", name: "Strawberry Cupcakes", description: "Fresh strawberry cupcakes with cream cheese frosting", price: 180, stock: 15, image: "/products/558af3e8-3a45-4456-97de-bc65e1b10313.jpg" },
    { id: "prod-3", categoryId: "cat-3", name: "Cheesecake Slice", description: "Creamy New York style cheesecake", price: 200, stock: 8, image: "/products/7a1571e3-28e5-4d39-90ca-a63a8721d32f.jpg" },
    { id: "prod-4", categoryId: "cat-6", name: "Iced Coffee", description: "Cold brew coffee with vanilla syrup", price: 120, stock: 3, image: "/products/bb1a354b-1c96-4075-a846-ddaaf2703af4.jpg" },
    { id: "prod-5", categoryId: "cat-4", name: "Chocolate Chip Cookies", description: "Homemade chocolate chip cookies", price: 80, stock: 25, image: "/products/d02f46b3-ea3d-4fbe-a362-cad97452b013.jpg" },
    { id: "prod-6", categoryId: "cat-7", name: "Banana Bread", description: "Moist and delicious banana bread", price: 150, stock: 12, image: "/products/ef012d2f-85c4-4ad2-a32c-809a56574efa.jpg" },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  await prisma.businessSetting.create({
    data: {
      id: 1,
      businessName: "Sweet Bites Bakery",
      contactNumber: "+63 912 345 6789",
      address: "123 Main Street, City, Province",
    },
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
