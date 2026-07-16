"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "@/components/Admin/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import OrderTracking from "@/components/Admin/OrderTracking";
import { Order } from "@/lib/types";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertCircle,
  LogOut,
  User,
  Settings,
  Bell,
  ChevronDown,
  Home,
  Plus,
  Eye,
  FileText,
  Truck,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    dailySales: [] as { date: string; sales: number; orders: number }[],
    bestSellingData: [] as { name: string; sales: number }[],
    recentActivity: [] as { text: string; time: string }[],
    lowStockProducts: [] as { name: string; stock: number }[],
  });
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  useEffect(() => {
    setIsMounted(true);
    try {
      const user = localStorage.getItem("sweet-bites-user");
      if (user) setUserData(JSON.parse(user));
    } catch {
      setUserData(null);
    }
    fetchStats();
    fetchActiveOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const result = await res.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch {
      // use zero stats
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const result = await res.json();
      if (result.success) {
        const active = result.data.filter(
          (o: Order) => o.status !== "Delivered" && o.status !== "Cancelled"
        );
        setActiveOrders(active.slice(0, 6));
      }
    } catch {
      // ignore
    }
  };

  const handleDashboardStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setActiveOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
        fetchStats();
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("sweet-bites-user");
      localStorage.removeItem("sweet-bites-cart");
      router.push("/");
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      setIsDropdownOpen(false);
    }, 1000);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
  };

  if (!isMounted) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-6 h-32"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back{userData?.name ? `, ${userData.name}` : ""}!
            Here&apos;s your business overview.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            {stats.lowStockProducts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {userData?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">
                  {userData?.role || "Administrator"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">
                      {userData?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userData?.email || "admin@sweetbites.com"}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => router.push("/admin/settings")}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-sm font-medium"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
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
                  <LogOut className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to sign out?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoggingOut ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Today's Sales"
          value={`₱${stats.todaySales.toLocaleString()}`}
          icon={<TrendingUp size={28} />}
          color="green"
        />
        <StatCard
          title="Today's Orders"
          value={String(stats.todayOrders)}
          icon={<ShoppingCart size={28} />}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={String(stats.totalProducts)}
          icon={<Package size={28} />}
          color="pink"
        />
        <StatCard
          title="Pending Orders"
          value={String(stats.pendingOrders)}
          icon={<AlertCircle size={28} />}
          color="yellow"
        />
      </div>

      {/* Active Orders Tracking */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck size={22} className="text-pink-600" />
            <h2 className="text-xl font-bold text-gray-800">Active Orders</h2>
            {activeOrders.length > 0 && (
              <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">
                {activeOrders.length}
              </span>
            )}
          </div>
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-sm text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1"
          >
            View All <Eye size={14} />
          </button>
        </div>
        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map((order) => (
              <OrderTracking
                key={order.id}
                order={order}
                compact
                onStatusChange={handleDashboardStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Truck size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No active orders right now</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Daily Sales</h2>
          {loading ? (
            <div className="h-75 bg-gray-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#ec4899"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Best Selling Products</h2>
          {loading ? (
            <div className="h-75 bg-gray-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.bestSellingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Orders Trend</h2>
          {loading ? (
            <div className="h-75 bg-gray-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Low Stock Alerts</h2>
          {stats.lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockProducts.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <span className="font-medium text-red-700">{p.name}</span>
                  <span className="text-sm text-red-600">{p.stock} left</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              All products well stocked
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/admin/products/new")}
              className="w-full text-left px-4 py-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 font-semibold flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Add New Product
            </button>
            <button
              onClick={() => router.push("/admin/orders")}
              className="w-full text-left px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 font-semibold flex items-center gap-2"
            >
              <Eye className="h-5 w-5" /> View Pending Orders
            </button>
            <button
              onClick={() => router.push("/admin/reports")}
              className="w-full text-left px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 font-semibold flex items-center gap-2"
            >
              <FileText className="h-5 w-5" /> Generate Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3 text-sm">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">{a.text}</span>
                  <span className="text-gray-400 text-xs">
                    {timeAgo(a.time)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
