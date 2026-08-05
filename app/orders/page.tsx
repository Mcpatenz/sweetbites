"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getImageSrc } from "@/lib/image";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChefHat,
  ArrowRight,
  Calendar,
  MapPin,
  Filter,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: { name: string; image?: string };
}

interface OrderData {
  id: string;
  customerId: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryType: string;
  deliveryDate?: string;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  customer?: { name: string; address: string; phone: string };
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  Pending: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: Clock },
  Confirmed: { label: "Confirmed", color: "text-blue-700", bgColor: "bg-blue-100", icon: CheckCircle },
  Preparing: { label: "Preparing", color: "text-purple-700", bgColor: "bg-purple-100", icon: ChefHat },
  Out_for_Delivery: { label: "Out for Delivery", color: "text-indigo-700", bgColor: "bg-indigo-100", icon: Truck },
  Delivered: { label: "Delivered", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle },
  Cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100", icon: XCircle },
};

const statusTabs = ["All", "Pending", "Confirmed", "Preparing", "Out_for_Delivery", "Delivered", "Cancelled"];

const statusFlow = ["Pending", "Confirmed", "Preparing", "Out_for_Delivery", "Delivered"];

function OrderTrackingBar({ status }: { status: string }) {
  const currentIdx = statusFlow.indexOf(status);
  const isCancelled = status === "Cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <XCircle size={16} className="text-red-500" />
        <span className="text-sm font-semibold text-red-600">This order has been cancelled</span>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1">
        {statusFlow.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`h-1.5 flex-1 rounded-full ${i <= currentIdx ? "bg-pink-500" : "bg-gray-200"}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className={`text-xs ${currentIdx >= 0 ? "text-pink-600 font-semibold" : "text-gray-400"}`}>Ordered</span>
        <span className={`text-xs ${currentIdx >= 4 ? "text-pink-600 font-semibold" : "text-gray-400"}`}>Delivered</span>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sweet-bites-user");
      if (stored) {
        const user = JSON.parse(stored);
        setUserId(user.id);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchOrders = async () => {
    try {
      let url = "/api/orders";
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === "All" ? orders : orders.filter((o) => o.status === activeTab);

  const tabCounts = statusTabs.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-48" />
          <div className="flex gap-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded-full w-24" />)}</div>
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-xl" />)}</div>
        </div>
      </div>
      <Footer />
      </>
    );
  }

  return (
    <>
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {statusTabs.map((tab) => {
          const config = tab !== "All" ? statusConfig[tab] : null;
          const Icon = config?.icon || Filter;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {config?.label || tab.replace(/_/g, " ")}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {tabCounts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {activeTab === "All" ? "No orders yet" : `No ${activeTab.replace(/_/g, " ").toLowerCase()} orders`}
          </h2>
          <p className="text-gray-500 mb-6">
            {activeTab === "All" ? "Start ordering delicious treats from our menu!" : "Try checking a different status."}
          </p>
          {activeTab === "All" && (
            <Link href="/products">
              <span className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors">
                Browse Menu <ArrowRight size={18} />
              </span>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const config = statusConfig[order.status] || statusConfig.Pending;
            const StatusIcon = config.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/order-details/${order.id}`}>
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 p-6 cursor-pointer group">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-gray-900">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color}`}>
                          <StatusIcon size={14} />
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div key={item.id} className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white overflow-hidden">
                            {item.product?.image ? (
                              <img src={getImageSrc(item.product.image)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm">🍰</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {order.items.map((item) => item.product?.name || "Item").join(", ")}
                      </span>
                    </div>

                    {/* Delivery Date */}
                    {order.deliveryDate && (
                      <div className="flex items-center gap-2 text-sm text-pink-600 mb-3">
                        <Truck size={14} />
                        <span className="font-medium">
                          Delivery: {new Date(order.deliveryDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          {order.deliveryTime ? ` at ${order.deliveryTime}` : ""}
                        </span>
                      </div>
                    )}

                    {/* Tracking Progress */}
                    <OrderTrackingBar status={order.status} />

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xl font-bold text-pink-600">
                        {formatCurrency(Number(order.total))}
                      </span>
                      <span className="text-sm text-gray-500 group-hover:text-pink-600 transition-colors flex items-center gap-1">
                        View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}
