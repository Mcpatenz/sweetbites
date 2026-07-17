import { prisma } from "./prisma";

export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  orderId?: string;
}) {
  try {
    return await prisma.notification.create({ data });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
