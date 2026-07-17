"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Home,
  Package,
  LogOut,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  UserCog,
  LogOut as LogOutIcon,
  X,
  LogIn,
  Bell,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userRole, setUserRole] = useState<string>("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const readCartCount = () => {
    try {
      const stored = localStorage.getItem("sweet-bites-cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        const items = Array.isArray(parsed) ? parsed : parsed.items || [];
        const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    try {
      const user = localStorage.getItem("sweet-bites-user");
      if (user) {
        const parsed = JSON.parse(user);
        setIsLoggedIn(true);
        setUserRole(parsed.role || "");
      }
    } catch {
      // not logged in
    }
    readCartCount();

    const onFocus = () => readCartCount();
    const onCartUpdated = () => readCartCount();
    window.addEventListener("focus", onFocus);
    window.addEventListener("cart-updated", onCartUpdated);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("cart-updated", onCartUpdated);
    };
  }, []);

  const isStaffRole = ["admin", "staff", "cashier"].includes(userRole);

  const fetchNotifications = async () => {
    if (!isStaffRole) return;
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch {}
  };

  useEffect(() => {
    if (isStaffRole) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isStaffRole]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const customerLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    ...(isLoggedIn ? [{ href: "/orders", label: "My Orders", icon: ShoppingCart }] : []),
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/employees", label: "Employees", icon: UserCog },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  const handleLogout = () => {
    setIsLoggingOut(true);

    // Simulate logout process
    setTimeout(() => {
      // Clear user data from localStorage
      localStorage.removeItem("sweet-bites-user");
      localStorage.removeItem("sweet-bites-cart");

      // Redirect to homepage
      router.push("/");

      // Reset states
      setIsLoggedIn(false);
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }, 1000);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href={isAdmin ? "/admin/dashboard" : "/"}
              className="font-bold text-2xl text-pink-600 flex items-center gap-2"
            >
              <span className="text-3xl">🍰</span>
              Sweet Bites
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex gap-8">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 transition-colors ${
                    pathname === href
                      ? "text-pink-600 font-semibold"
                      : "text-gray-600 hover:text-pink-600"
                  }`}
                >
                  {Icon && <Icon size={20} />}
                  {label}
                </Link>
              ))}
            </div>

            {/* Cart, Notifications & Auth Icons */}
            <div className="flex items-center gap-4">
              {!isAdmin && isLoggedIn && (
                <Link href="/cart" className="relative">
                  <ShoppingCart
                    className="text-gray-600 hover:text-pink-600 transition-colors"
                    size={24}
                  />
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                </Link>
              )}
              {isStaffRole && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Bell size={22} className="text-gray-600 hover:text-pink-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                          <h3 className="font-bold text-gray-800">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-pink-600 hover:text-pink-700 font-semibold">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="overflow-y-auto max-h-72">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-center text-gray-400 text-sm">No notifications</p>
                          ) : (
                            notifications.slice(0, 20).map((n) => (
                              <div key={n.id} className={`p-3 border-b border-gray-50 ${!n.read ? "bg-pink-50" : ""}`}>
                                <div className="flex items-start gap-2">
                                  {!n.read && <div className="w-2 h-2 bg-pink-500 rounded-full mt-1.5 shrink-0" />}
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(n.createdAt).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              {isLoggedIn ? (
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline text-sm font-medium">
                    Logout
                  </span>
                </button>
              ) : (
                <Link
                  href="/register"
                  className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors px-3 py-2 rounded-lg hover:bg-pink-50"
                >
                  <LogIn size={20} />
                  <span className="hidden sm:inline text-sm font-medium">
                    Login
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleCancelLogout}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOutIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to sign out? You'll be redirected to the
                  homepage.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelLogout}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing Out...
                      </>
                    ) : (
                      <>
                        <LogOutIcon className="h-4 w-4" />
                        Sign Out
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Toast Notification */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-600 border-t-transparent" />
              <span className="text-sm font-medium text-gray-700">
                Logging out...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
