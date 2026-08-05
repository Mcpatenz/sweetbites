"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getImageSrc } from "@/lib/image";
import { Package, Truck, MapPin, CreditCard, Calendar, ArrowLeft, ArrowRight, CheckCircle, Clock, ChefHat, XCircle, LayoutDashboard } from "lucide-react";

const statusFlow = ["Pending", "Confirmed", "Preparing", "Out_for_Delivery", "Delivered"];

const statusDetails: Record<string, { label: string; description: string; icon: any; color: string }> = {
  Pending: { label: "Order Placed", description: "Your order has been received and is awaiting confirmation.", icon: Clock, color: "text-yellow-600" },
  Confirmed: { label: "Order Confirmed", description: "The bakery has confirmed your order and will start preparing it soon.", icon: CheckCircle, color: "text-blue-600" },
  Preparing: { label: "Preparing Your Order", description: "Your delicious treats are being freshly prepared!", icon: ChefHat, color: "text-purple-600" },
  Out_for_Delivery: { label: "Out for Delivery", description: "Your order is on its way to you!", icon: Truck, color: "text-indigo-600" },
  Delivered: { label: "Delivered", description: "Your order has been delivered. Enjoy!", icon: CheckCircle, color: "text-green-600" },
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const user = localStorage.getItem("sweet-bites-user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed.role === "admin") setIsAdmin(true);
      }
    } catch {
      // not admin
    }
    if (id) fetchOrder();
    const interval = setInterval(() => {
      if (id) fetchOrder();
    }, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const result = await res.json();
      if (result.success) {
        setOrder(result.data);
      } else {
        setError("Order not found");
      }
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-gray-200 rounded-lg" />
              <div className="h-32 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
      <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-500">{error || "Order not found"}</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Link href={isAdmin ? "/admin/orders" : "/orders"} className="text-pink-600 hover:text-pink-700 font-semibold">
            ← Back to Orders
          </Link>
          {isAdmin && (
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700">
              <LayoutDashboard size={16} />
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
      <Footer />
      </>
    );
  }

  const currentStatusIndex = statusFlow.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";
  const currentStatus = statusDetails[order.status] || statusDetails.Pending;
  const StatusIcon = currentStatus.icon;

  return (
    <>
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={isAdmin ? "/admin/orders" : "/orders"}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors"
        >
          <ArrowLeft size={18} />
          {isAdmin ? "Back to Orders" : "Back to Orders"}
        </Link>
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700 transition-colors"
          >
            <LayoutDashboard size={16} />
            Admin Dashboard
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isCancelled ? "bg-red-100" : "bg-pink-50"} border ${isCancelled ? "border-red-200" : "border-pink-200"}`}>
          <StatusIcon size={20} className={currentStatus.color} />
          <div>
            <span className={`font-bold ${currentStatus.color}`}>{currentStatus.label}</span>
            <p className="text-xs text-gray-500">{currentStatus.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Order Progress</h2>
            {isCancelled ? (
              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
                <XCircle size={32} className="text-red-500" />
                <div>
                  <p className="font-bold text-red-700">Order Cancelled</p>
                  <p className="text-sm text-red-600">This order has been cancelled.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {statusFlow.map((status, index) => {
                  const detail = statusDetails[status];
                  const DetailIcon = detail.icon;
                  const isActive = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isCurrent ? "bg-pink-600 text-white shadow-lg shadow-pink-200 scale-110" : isActive ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                        }`}>
                          <DetailIcon size={18} />
                        </div>
                        {index < statusFlow.length - 1 && (
                          <div className={`w-0.5 h-12 ${isActive ? "bg-green-400" : "bg-gray-200"}`} />
                        )}
                      </div>
                      <div className={`pb-6 ${isCurrent ? "pt-0.5" : "pt-2"}`}>
                        <p className={`font-semibold ${isActive ? "text-gray-900" : "text-gray-400"}`}>{detail.label}</p>
                        <p className={`text-sm ${isActive ? "text-gray-500" : "text-gray-300"}`}>{detail.description}</p>
                        {isCurrent && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">Current</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Package size={22} /> Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                    {item.product?.image && (
                      <img src={getImageSrc(item.product.image)} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{item.product?.name || "Product"}</h4>
                    <p className="text-gray-500 text-sm">{formatCurrency(Number(item.price))} x {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg">{formatCurrency(Number(item.price) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Truck size={22} /> Delivery Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Delivery Type</p>
                <p className="font-semibold">{order.deliveryType?.replace(/_/g, " ") || "Delivery"}</p>
              </div>
              {order.customer && (
                <>
                  <div>
                    <p className="text-gray-500 text-sm">Recipient</p>
                    <p className="font-semibold">{order.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Address</p>
                    <p className="font-semibold flex items-start gap-2">
                      <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" /> {order.customer.address}
                    </p>
                    {order.customer.latitude != null && order.customer.longitude != null && (
                      <a
                        href={`https://www.google.com/maps?q=${order.customer.latitude},${order.customer.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-sm text-pink-600 hover:text-pink-700 font-semibold"
                      >
                        <MapPin size={12} /> View pinned location on map
                      </a>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Contact Number</p>
                    <p className="font-semibold">{order.customer.phone}</p>
                  </div>
                </>
              )}
              {order.deliveryDate && (
                <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                  <p className="text-gray-500 text-sm flex items-center gap-1 mb-1">
                    <Calendar size={14} /> Preferred Delivery Date & Time
                  </p>
                  <p className="font-bold text-pink-700 text-lg">
                    {new Date(order.deliveryDate).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {order.deliveryTime && (
                      <span className="ml-2 text-pink-600">at {order.deliveryTime}</span>
                    )}
                  </p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-gray-500 text-sm">Special Notes</p>
                  <p className="font-semibold italic">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Date:</span>
                <span className="font-semibold">{formatDate(order.createdAt)}</span>
              </div>
              {order.deliveryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Date:</span>
                  <span className="font-semibold text-pink-600">
                    {new Date(order.deliveryDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    {order.deliveryTime ? ` ${order.deliveryTime}` : ""}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <span className={`font-semibold px-2 py-1 rounded text-xs ${
                  order.paymentStatus === "Verified" ? "bg-green-100 text-green-800" :
                  order.paymentStatus === "Rejected" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard size={20} /> Payment
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee:</span>
                <span className="font-semibold">{formatCurrency(Number(order.deliveryFee))}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-pink-600">{formatCurrency(Number(order.total))}</span>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Method: <span className="font-semibold">{order.paymentMethod?.replace(/_/g, " ")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
