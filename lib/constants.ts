export const CATEGORIES = [
  "Cakes",
  "Cupcakes",
  "Cheesecakes",
  "Cookies",
  "Desserts",
  "Drinks",
  "Snacks",
  "Meals",
];

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;

export const PAYMENT_METHODS = ["Cash on Delivery", "GCash", "Maya"] as const;

export const DELIVERY_TYPES = ["Pickup", "Delivery"] as const;

export const DELIVERY_FEE = 50; // PHP

export const CURRENCY = "₱";

export const ADMIN_ROUTES = [
  "/admin/dashboard",
  "/admin/products",
  "/admin/orders",
  "/admin/customers",
  "/admin/reports",
  "/admin/settings",
];

export const CUSTOMER_ROUTES = [
  "/",
  "/products",
  "/cart",
  "/checkout",
  "/orders",
];
