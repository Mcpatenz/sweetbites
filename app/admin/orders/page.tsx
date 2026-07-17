"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Order } from "@/lib/types";
import OrderTable from "@/components/Admin/OrderTable";
import OrderTracking from "@/components/Admin/OrderTracking";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Calendar, Package, DollarSign, ShoppingCart, Trash2 } from "lucide-react";

type DateFilterMode = "All" | "Date" | "Month" | "Year";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("All");
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ orderId: string; newStatus: string; currentStatus: string } | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const result = await res.json();
      if (result.success) {
        setOrders(result.data);
      } else {
        toast.error("Failed to load orders");
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch = statusFilter === "All" || order.status === statusFilter;
      const paymentMatch = paymentFilter === "All" || order.paymentStatus === paymentFilter;

      let dateMatch = true;
      if (dateFilterMode !== "All") {
        const orderDate = new Date(order.createdAt);
        if (dateFilterMode === "Date" && filterDate) {
          const selected = new Date(filterDate + "T00:00:00");
          dateMatch =
            orderDate.getFullYear() === selected.getFullYear() &&
            orderDate.getMonth() === selected.getMonth() &&
            orderDate.getDate() === selected.getDate();
        } else if (dateFilterMode === "Month" && filterMonth) {
          const [y, m] = filterMonth.split("-").map(Number);
          dateMatch =
            orderDate.getFullYear() === y && orderDate.getMonth() === m - 1;
        } else if (dateFilterMode === "Year" && filterYear) {
          dateMatch = orderDate.getFullYear() === Number(filterYear);
        }
      }

      return statusMatch && paymentMatch && dateMatch;
    });
  }, [orders, statusFilter, paymentFilter, dateFilterMode, filterDate, filterMonth, filterYear]);

  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalItems = filteredOrders.reduce(
      (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
      0
    );
    const totalAmount = filteredOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );
    return { totalOrders, totalItems, totalAmount };
  }, [filteredOrders]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    orders.forEach((o) => years.add(new Date(o.createdAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    setConfirmStatus({ orderId, newStatus, currentStatus: order.status });
  };

  const confirmStatusChange = async () => {
    if (!confirmStatus) return;
    try {
      const res = await fetch(`/api/orders/${confirmStatus.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: confirmStatus.newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Order status updated");
        setOrders(
          orders.map((o) =>
            o.id === confirmStatus.orderId
              ? { ...o, status: confirmStatus.newStatus as any }
              : o
          )
        );
        if (trackingOrder?.id === confirmStatus.orderId) {
          setTrackingOrder({
            ...trackingOrder,
            status: confirmStatus.newStatus as any,
          });
        }
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setConfirmStatus(null);
    }
  };

  const openTracking = (order: Order) => {
    setTrackingOrder(order);
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrder) return;
    try {
      const res = await fetch(`/api/orders/${deleteOrder.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Order deleted successfully");
        setOrders(orders.filter((o) => o.id !== deleteOrder.id));
      } else {
        toast.error(result.message || "Failed to delete order");
      }
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeleteOrder(null);
    }
  };

  const formatStatus = (s: string) => s.replace(/_/g, " ");

  const resetDateFilter = () => {
    setFilterDate("");
    setFilterMonth("");
    setFilterYear("");
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded mt-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-gray-600 mt-2">View and manage all customer orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-pink-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-100 rounded-lg">
              <ShoppingCart size={22} className="text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package size={22} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₱{stats.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Out_for_Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <span className="text-sm font-semibold text-gray-700 ml-2">Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
          >
            <option value="All">All Payment</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 pt-4">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">View by:</span>
          {(["All", "Date", "Month", "Year"] as DateFilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { setDateFilterMode(mode); resetDateFilter(); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dateFilterMode === mode
                  ? "bg-pink-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {mode === "All" ? "All Dates" : mode}
            </button>
          ))}

          {dateFilterMode === "Date" && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
            />
          )}
          {dateFilterMode === "Month" && (
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
            />
          )}
          {dateFilterMode === "Year" && (
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
            >
              <option value="">Select Year</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <OrderTable
          orders={filteredOrders}
          isAdmin
          onStatusChange={handleStatusChange}
          onTrack={openTracking}
          onDelete={setDeleteOrder}
        />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-500">No orders found</p>
        </div>
      )}

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setTrackingOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gray-50 px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Tracking
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchOrders}
                    className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    onClick={() => setTrackingOrder(null)}
                    className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <OrderTracking
                  order={trackingOrder}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Change Confirmation Dialog */}
      <AnimatePresence>
        {confirmStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmStatus(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw size={28} className="text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Update Order Status
                </h3>
                <p className="text-gray-600 mb-6">
                  Change status from{" "}
                  <span className="font-semibold text-yellow-600">
                    {formatStatus(confirmStatus.currentStatus)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-green-600">
                    {formatStatus(confirmStatus.newStatus)}
                  </span>
                  ?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmStatus(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    className="flex-1 px-4 py-2.5 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 flex items-center justify-center gap-2"
                  >
                    Confirm Update
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Order Confirmation Dialog */}
      <AnimatePresence>
        {deleteOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteOrder(null)}
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
                  <Trash2 size={28} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Delete Order
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete order{" "}
                  <span className="font-semibold text-red-600">
                    {deleteOrder.id.slice(0, 8)}...
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteOrder(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOrder}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
