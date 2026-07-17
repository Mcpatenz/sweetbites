"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import StatCard from "@/components/Admin/StatCard";
import ProfileEditModal from "@/components/ProfileEditModal";
import { ShoppingCart, Clock, CheckCircle, Send, Package, BarChart3, User, Phone, Mail, MapPin, Calendar, Briefcase, Hash, Pencil } from "lucide-react";

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "preparing" | "ready">("pending");
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sweet-bites-user");
    if (!stored) { router.push("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "staff") { router.push("/"); return; }
    setUser(parsed);
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const result = await res.json();
      if (result.success) setOrders(result.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Order updated to ${status.replace(/_/g, " ")}`);
        fetchOrders();
      } else {
        toast.error("Failed to update order");
      }
    } catch {
      toast.error("Failed to update order");
    }
  };

  if (!user) return null;

  const pendingOrders = orders.filter((o) => o.status === "Confirmed");
  const preparingOrders = orders.filter((o) => o.status === "Preparing");
  const readyForCashier = orders.filter((o) => o.status === "Out_for_Delivery");

  const tabOrders = activeTab === "pending"
    ? pendingOrders
    : activeTab === "preparing"
    ? preparingOrders
    : readyForCashier;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Confirmed": return "bg-blue-100 text-blue-700";
      case "Preparing": return "bg-orange-100 text-orange-700";
      case "Out_for_Delivery": return "bg-purple-100 text-purple-700";
      case "Delivered": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (s: string) => s.replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍰</span>
            <h1 className="text-xl font-bold text-gray-800">Staff Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/staff/reports"
              className="text-sm text-gray-500 hover:text-pink-600 transition-colors flex items-center gap-1">
              <BarChart3 size={14} /> Reports
            </Link>
            <button onClick={() => { localStorage.removeItem("sweet-bites-user"); router.push("/"); }}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-pink-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-pink-200">
                  {user.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <button onClick={() => setEditModalOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-pink-600 transition-colors"
                  title="Edit Profile">
                  <Pencil size={16} />
                </button>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                <Briefcase size={12} /> Staff
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} className="text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{user.address}</span>
                  </div>
                )}
                {user.employeeNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash size={14} className="text-gray-400" />
                    <span>Emp #{user.employeeNumber}</span>
                  </div>
                )}
                {user.gender && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} className="text-gray-400" />
                    <span>{user.gender}</span>
                  </div>
                )}
                {user.birthDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{new Date(user.birthDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                )}
                {user.dateHired && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span>Hired: {new Date(user.dateHired).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-4">Order Workflow</h3>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">Pending</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Confirmed (Admin)</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Preparing (Staff)</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Out for Delivery</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">Delivered (Cashier)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="To Prepare" value={String(pendingOrders.length)} icon={<ShoppingCart size={28} />} color="yellow" />
          <StatCard title="Confirmed" value={String(pendingOrders.length)} icon={<CheckCircle size={28} />} color="blue" />
          <StatCard title="Preparing" value={String(preparingOrders.length)} icon={<Clock size={28} />} color="pink" />
          <StatCard title="Ready for Cashier" value={String(readyForCashier.length)} icon={<Send size={28} />} color="green" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "pending" as const, label: `Confirmed (${pendingOrders.length})` },
            { key: "preparing" as const, label: `Preparing (${preparingOrders.length})` },
            { key: "ready" as const, label: `Ready for Cashier (${readyForCashier.length})` },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.key ? "bg-pink-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : tabOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No orders in this category</p>
            </div>
          ) : (
            <div className="divide-y">
              {tabOrders.map((order) => {
                const items = order.items || [];
                const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                const isPending = order.status === "Confirmed";
                const isPreparing = order.status === "Preparing";

                return (
                  <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-800">#{order.id.slice(0, 8)}...</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                          {order.deliveryDate && (
                            <span className="text-xs text-pink-600 font-semibold">
                              Delivery: {new Date(order.deliveryDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                              {order.deliveryTime ? ` ${order.deliveryTime}` : ""}
                            </span>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 mb-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <User size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-800">{order.customer?.name || "Guest"}</span>
                          </div>
                          {order.customer?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={14} className="text-gray-400" />
                              <span className="text-gray-600">{order.customer.phone}</span>
                            </div>
                          )}
                          {(order.customer?.email || order.customer?.user?.email) && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-gray-600">{order.customer.email || order.customer.user?.email}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {items.map((item: any) => item.product?.name || "Item").join(", ")}
                          {totalItems > 0 && <span className="ml-1">({totalItems} item{totalItems > 1 ? "s" : ""})</span>}
                        </div>
                        {order.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">Note: {order.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-pink-600">₱{Number(order.total).toLocaleString()}</span>
                        <div className="flex gap-2">
                          {isPending && (
                            <button onClick={() => updateStatus(order.id, "Preparing")}
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                              Start Preparing
                            </button>
                          )}
                          {isPreparing && (
                            <button onClick={() => updateStatus(order.id, "Out_for_Delivery")}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                              <Send size={14} className="inline mr-1" />
                              Send to Cashier
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onUpdated={(updated) => setUser(updated)}
      />
    </div>
  );
}
