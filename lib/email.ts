import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const BUSINESS_NAME = "Sweet Bites";
const BUSINESS_PHONE = "(02) 8123-4567";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function baseTemplate(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#ec4899,#8b5cf6);padding:30px;text-align:center;">
          <h1 style="color:#ffffff;font-size:24px;margin:0;">🍰 ${BUSINESS_NAME}</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0 0;font-size:14px;">${title}</p>
        </div>
        <div style="padding:30px;">
          ${content}
        </div>
        <div style="background-color:#f3f4f6;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">${BUSINESS_NAME} · ${BUSINESS_PHONE}</p>
          <p style="color:#9ca3af;font-size:12px;margin:4px 0 0 0;">Delicious homemade cakes and desserts</p>
        </div>
      </div>
    </body>
    </html>`;
}

function orderItemsHtml(items: { product?: { name: string }; quantity: number; price: number }[]) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#374151;">${item.product?.name || "Product"}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#374151;text-align:right;font-weight:600;">${formatCurrency(item.quantity * item.price)}</td>
      </tr>`
    )
    .join("");
}

export async function sendOrderConfirmation(order: {
  id: string;
  total: number;
  deliveryFee: number;
  subtotal: number;
  paymentMethod: string;
  deliveryType: string;
  deliveryDate?: Date | string | null;
  deliveryTime?: string | null;
  notes?: string | null;
  items: { product?: { name: string }; quantity: number; price: number }[];
  customer: { name: string; email?: string | null; phone: string; address: string };
}) {
  const customerEmail = order.customer.email;
  if (!customerEmail) return;

  const html = baseTemplate("Order Confirmed!", `
    <p style="color:#374151;font-size:16px;margin:0 0 16px 0;">Hi <strong>${order.customer.name}</strong>,</p>
    <p style="color:#374151;font-size:16px;margin:0 0 20px 0;">Thank you for your order! We've received it and are getting it ready.</p>

    <div style="background-color:#fdf2f8;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="color:#9d174d;font-size:14px;margin:0;"><strong>Order ID:</strong> ${order.id.slice(0, 8)}...</p>
      <p style="color:#9d174d;font-size:14px;margin:4px 0 0 0;"><strong>Status:</strong> Pending</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;">Item</th>
          <th style="text-align:center;padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;">Qty</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml(order.items)}
      </tbody>
    </table>

    <div style="border-top:2px solid #e5e7eb;padding-top:12px;margin-top:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="color:#6b7280;">Subtotal</span>
        <span style="color:#374151;">${formatCurrency(order.subtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="color:#6b7280;">Delivery Fee</span>
        <span style="color:#374151;">${formatCurrency(order.deliveryFee)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">
        <span style="color:#111827;font-weight:bold;font-size:16px;">Total</span>
        <span style="color:#ec4899;font-weight:bold;font-size:16px;">${formatCurrency(order.total)}</span>
      </div>
    </div>

    <div style="background-color:#f9fafb;border-radius:8px;padding:16px;margin-top:20px;">
      <p style="color:#374151;font-size:14px;margin:0;"><strong>Payment:</strong> ${formatStatus(order.paymentMethod)}</p>
      <p style="color:#374151;font-size:14px;margin:4px 0 0 0;"><strong>Delivery:</strong> ${formatStatus(order.deliveryType)}</p>
      ${order.deliveryDate ? `<p style="color:#374151;font-size:14px;margin:4px 0 0 0;"><strong>Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}${order.deliveryTime ? ` at ${order.deliveryTime}` : ""}</p>` : ""}
    </div>

    <p style="color:#6b7280;font-size:14px;margin:20px 0 0 0;">We'll notify you when your order status changes.</p>
  `);

  try {
    await transporter.sendMail({
      from: `"${BUSINESS_NAME}" <${process.env.SMTP_EMAIL}>`,
      to: customerEmail,
      subject: `Order Confirmed - ${order.id.slice(0, 8)}...`,
      html,
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}

export async function sendNewOrderToAdmin(order: {
  id: string;
  total: number;
  paymentMethod: string;
  deliveryType: string;
  items: { product?: { name: string }; quantity: number; price: number }[];
  customer: { name: string; phone: string; address: string };
}) {
  if (!ADMIN_EMAIL) return;

  const html = baseTemplate("New Order Received!", `
    <p style="color:#374151;font-size:16px;margin:0 0 16px 0;">A new order has been placed!</p>

    <div style="background-color:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="color:#166534;font-size:14px;margin:0;"><strong>Order ID:</strong> ${order.id.slice(0, 8)}...</p>
      <p style="color:#166534;font-size:14px;margin:4px 0 0 0;"><strong>Customer:</strong> ${order.customer.name}</p>
      <p style="color:#166534;font-size:14px;margin:4px 0 0 0;"><strong>Phone:</strong> ${order.customer.phone}</p>
      <p style="color:#166534;font-size:14px;margin:4px 0 0 0;"><strong>Address:</strong> ${order.customer.address}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;">Item</th>
          <th style="text-align:center;padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;">Qty</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml(order.items)}
      </tbody>
    </table>

    <div style="border-top:2px solid #e5e7eb;padding-top:12px;margin-top:8px;">
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#111827;font-weight:bold;font-size:16px;">Total</span>
        <span style="color:#ec4899;font-weight:bold;font-size:16px;">${formatCurrency(order.total)}</span>
      </div>
    </div>

    <div style="background-color:#f9fafb;border-radius:8px;padding:16px;margin-top:20px;">
      <p style="color:#374151;font-size:14px;margin:0;"><strong>Payment:</strong> ${formatStatus(order.paymentMethod)}</p>
      <p style="color:#374151;font-size:14px;margin:4px 0 0 0;"><strong>Delivery:</strong> ${formatStatus(order.deliveryType)}</p>
    </div>

    <p style="color:#6b7280;font-size:14px;margin:20px 0 0 0;">Log in to the admin panel to manage this order.</p>
  `);

  try {
    await transporter.sendMail({
      from: `"${BUSINESS_NAME}" <${process.env.SMTP_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `🍰 New Order - ${order.id.slice(0, 8)}... - ${order.customer.name}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send new order email to admin:", error);
  }
}

export async function sendStatusUpdateToCustomer(order: {
  id: string;
  status: string;
  total: number;
  items: { product?: { name: string }; quantity: number; price: number }[];
  customer: { name: string; email?: string | null; phone: string };
}) {
  const customerEmail = order.customer.email;
  if (!customerEmail) return;

  const statusColor: Record<string, string> = {
    Pending: "#eab308",
    Confirmed: "#3b82f6",
    Preparing: "#f97316",
    Out_for_Delivery: "#8b5cf6",
    Delivered: "#22c55e",
    Cancelled: "#ef4444",
  };

  const color = statusColor[order.status] || "#6b7280";

  const html = baseTemplate("Order Status Updated", `
    <p style="color:#374151;font-size:16px;margin:0 0 16px 0;">Hi <strong>${order.customer.name}</strong>,</p>
    <p style="color:#374151;font-size:16px;margin:0 0 20px 0;">Your order status has been updated.</p>

    <div style="background-color:#f9fafb;border-radius:8px;padding:20px;margin-bottom:20px;text-align:center;">
      <p style="color:#6b7280;font-size:14px;margin:0 0 8px 0;">Order ${order.id.slice(0, 8)}...</p>
      <p style="background-color:${color};color:#ffffff;display:inline-block;padding:8px 24px;border-radius:20px;font-weight:bold;font-size:16px;margin:0;">${formatStatus(order.status)}</p>
    </div>

    <div style="background-color:#fdf2f8;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="color:#9d174d;font-size:14px;margin:0;"><strong>Total:</strong> ${formatCurrency(order.total)}</p>
    </div>

    ${order.status === "Delivered" ? `
      <p style="color:#374151;font-size:16px;margin:0 0 8px 0;">🎉 Your order has been delivered! We hope you enjoy your treats.</p>
      <p style="color:#6b7280;font-size:14px;margin:0;">We'd love to hear your feedback — leave a review on our website!</p>
    ` : order.status === "Cancelled" ? `
      <p style="color:#374151;font-size:16px;margin:0 0 8px 0;">Your order has been cancelled.</p>
      <p style="color:#6b7280;font-size:14px;margin:0;">If you have any questions, please contact us at ${BUSINESS_PHONE}.</p>
    ` : `
      <p style="color:#6b7280;font-size:14px;margin:0;">We'll keep you updated as your order progresses.</p>
    `}
  `);

  try {
    await transporter.sendMail({
      from: `"${BUSINESS_NAME}" <${process.env.SMTP_EMAIL}>`,
      to: customerEmail,
      subject: `Order ${formatStatus(order.status)} - ${order.id.slice(0, 8)}...`,
      html,
    });
  } catch (error) {
    console.error("Failed to send status update email:", error);
  }
}

export async function sendStatusUpdateToAdmin(order: {
  id: string;
  status: string;
  total: number;
  customer: { name: string };
}) {
  if (!ADMIN_EMAIL) return;

  const html = baseTemplate("Order Status Changed", `
    <p style="color:#374151;font-size:16px;margin:0 0 16px 0;">An order status has been updated.</p>

    <div style="background-color:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="color:#374151;font-size:14px;margin:0;"><strong>Order:</strong> ${order.id.slice(0, 8)}...</p>
      <p style="color:#374151;font-size:14px;margin:4px 0 0 0;"><strong>Customer:</strong> ${order.customer.name}</p>
      <p style="color:#374151;font-size:14px;margin:4px 0 0 0;"><strong>New Status:</strong> ${formatStatus(order.status)}</p>
      <p style="color:#374151;font-size:14px;margin:4px 0 0 0;"><strong>Total:</strong> ${formatCurrency(order.total)}</p>
    </div>
  `);

  try {
    await transporter.sendMail({
      from: `"${BUSINESS_NAME}" <${process.env.SMTP_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `Order ${formatStatus(order.status)} - ${order.id.slice(0, 8)}...`,
      html,
    });
  } catch (error) {
    console.error("Failed to send status update email to admin:", error);
  }
}
