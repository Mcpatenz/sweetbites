"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import StatCard from "@/components/Admin/StatCard";
import OrderReceipt from "@/components/Receipt";
import ProfileEditModal from "@/components/ProfileEditModal";
import { DollarSign, Wallet, CreditCard, CheckCircle, Package, BarChart3, Printer, MapPin, User, Phone, Mail, Calendar, Briefcase, Hash, Pencil } from "lucide-react";

export default function CashierDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ready" | "verified" | "all">("ready");
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sweet-bites-user");
    if (!stored) { router.push("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "cashier") { router.push("/"); return; }
    setUser(parsed);
    fetchOrders();
    fetchBusinessSettings();
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

  const fetchBusinessSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const result = await res.json();
      if (result.success) setBusinessSettings(result.data);
    } catch {
      // use defaults
    }
  };

  const handlePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Payment ${paymentStatus.toLowerCase()}`);
        fetchOrders();
      }
    } catch {
      toast.error("Failed to update payment");
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Delivered", paymentStatus: "Verified" }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Order marked as delivered!");
        fetchOrders();
      }
    } catch {
      toast.error("Failed to update order");
    }
  };

  const handlePrintReceipt = (order: any) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      toast.error("Please allow popups to print receipts");
      return;
    }

    const itemsHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr style="border-bottom:1px dashed #ccc">
          <td style="padding:4px 0;font-size:12px">${item.product?.name || "Item"}</td>
          <td style="padding:4px 0;text-align:center;font-size:12px">${item.quantity}</td>
          <td style="padding:4px 0;text-align:right;font-size:12px">₱${Number(item.price).toLocaleString()}</td>
          <td style="padding:4px 0;text-align:right;font-size:12px;font-weight:bold">₱${(Number(item.price) * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    const biz = businessSettings || {};
    const customerAddress = order.customer?.address || "";
    const hasCoords =
      order.customer?.latitude != null && order.customer?.longitude != null;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${order.id.slice(0, 8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; padding: 24px; max-width: 360px; margin: 0 auto; color: #333; }
          .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 12px; margin-bottom: 12px; }
          .header h1 { font-size: 18px; margin-bottom: 4px; }
          .header p { font-size: 11px; color: #666; }
          .info-row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; }
          .info-row span:first-child { color: #888; }
          .section-title { font-weight: bold; font-size: 12px; margin: 8px 0 4px; }
          .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; font-size: 10px; color: #888; border-bottom: 1px solid #ddd; padding: 4px 0; }
          th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
          .total-row { font-weight: bold; font-size: 15px; border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 8px; }
          .footer { text-align: center; border-top: 2px dashed #ccc; padding-top: 12px; margin-top: 12px; font-size: 11px; color: #888; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; }
          .badge-green { background: #d1fae5; color: #065f46; }
          .badge-yellow { background: #fef3c7; color: #92400e; }
          .badge-red { background: #fee2e2; color: #991b1b; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${biz.businessName || "Sweet Bites Bakery"}</h1>
          ${biz.address ? `<p>${biz.address}</p>` : ""}
          ${biz.contactNumber ? `<p>Tel: ${biz.contactNumber}</p>` : ""}
          <p style="margin-top:4px">Official Receipt</p>
        </div>

        <div class="info-row"><span>Receipt No:</span><span style="font-weight:bold">${order.id.slice(0, 12).toUpperCase()}</span></div>
        <div class="info-row"><span>Date:</span><span>${new Date(order.createdAt).toLocaleDateString("en-PH")}</span></div>
        <div class="info-row"><span>Time:</span><span>${new Date(order.createdAt).toLocaleTimeString("en-PH")}</span></div>
        <div class="info-row"><span>Cashier:</span><span>${user?.name || "Cashier"}</span></div>

        <div class="divider"></div>
        <div class="section-title">SOLD TO:</div>
        <p style="font-size:12px;font-weight:bold">${order.customer?.name || "Walk-in Customer"}</p>
        ${order.customer?.phone ? `<p style="font-size:11px;color:#666">Tel: ${order.customer.phone}</p>` : ""}
        ${customerAddress ? `<p style="font-size:11px;color:#666">${customerAddress}</p>` : ""}
        ${hasCoords ? `<p style="font-size:10px;color:#888;margin-top:2px">📍 ${order.customer.latitude}, ${order.customer.longitude}</p>` : ""}

        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Price</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div class="divider"></div>
        <div class="info-row"><span>Subtotal:</span><span>₱${Number(order.subtotal).toLocaleString()}</span></div>
        <div class="info-row"><span>Delivery Fee:</span><span>₱${Number(order.deliveryFee).toLocaleString()}</span></div>
        <div class="info-row total-row"><span>TOTAL:</span><span style="color:#ec4899">₱${Number(order.total).toLocaleString()}</span></div>

        <div class="divider"></div>
        <div class="info-row"><span>Payment Method:</span><span style="font-weight:bold">${order.paymentMethod?.replace(/_/g, " ")}</span></div>
        <div class="info-row"><span>Payment Status:</span>
          <span class="badge ${
            order.paymentStatus === "Verified" ? "badge-green" :
            order.paymentStatus === "Rejected" ? "badge-red" : "badge-yellow"
          }">${order.paymentStatus}</span>
        </div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p style="margin-top:4px">${biz.businessName || "Sweet Bites Bakery"}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  if (!user) return null;

  const readyForPayment = orders.filter((o) => o.status === "Out_for_Delivery");
  const verifiedPayments = orders.filter((o) => o.paymentStatus === "Verified" && o.status !== "Delivered");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today && o.status !== "Cancelled");
  const todayRevenue = todayOrders.filter((o: any) => o.paymentStatus === "Verified").reduce((sum: number, o: any) => sum + Number(o.total), 0);

  const tabOrders = activeTab === "ready"
    ? readyForPayment
    : activeTab === "verified"
    ? verifiedPayments
    : [...new Map([...readyForPayment, ...verifiedPayments, ...deliveredOrders].map((o) => [o.id, o])).values()];

  const getPaymentMethodLabel = (pm: string) => pm.replace(/_/g, " ");

  const getStatusColor = (status: string, paymentStatus: string) => {
    if (status === "Delivered") return "bg-green-100 text-green-700";
    if (paymentStatus === "Verified") return "bg-blue-100 text-blue-700";
    if (paymentStatus === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusLabel = (status: string, paymentStatus: string) => {
    if (status === "Delivered") return "Delivered";
    if (paymentStatus === "Verified") return "Payment Verified";
    if (paymentStatus === "Rejected") return "Payment Rejected";
    return "Awaiting Payment";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍰</span>
            <h1 className="text-xl font-bold text-gray-800">Cashier Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/cashier/reports"
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
                  {user.name?.charAt(0)?.toUpperCase() || "C"}
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
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-1">
                <Briefcase size={12} /> Cashier
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
          <h3 className="font-bold text-gray-800 mb-4">Your Role</h3>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Staff prepares order</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">You receive payment</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">Verify & Deliver</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Today's Revenue" value={`₱${todayRevenue.toLocaleString()}`} icon={<DollarSign size={28} />} color="green" />
          <StatCard title="Awaiting Payment" value={String(readyForPayment.length)} icon={<Wallet size={28} />} color="yellow" />
          <StatCard title="Payment Verified" value={String(verifiedPayments.length)} icon={<CreditCard size={28} />} color="blue" />
          <StatCard title="Delivered Today" value={String(deliveredOrders.filter((o) => new Date(o.createdAt) >= today).length)} icon={<CheckCircle size={28} />} color="pink" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "ready" as const, label: `Awaiting Payment (${readyForPayment.length})` },
            { key: "verified" as const, label: `Payment Verified (${verifiedPayments.length})` },
            { key: "all" as const, label: `All Orders (${readyForPayment.length + verifiedPayments.length + deliveredOrders.length})` },
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
                const isReady = order.status === "Out_for_Delivery" && order.paymentStatus === "Pending";
                const isVerified = order.paymentStatus === "Verified" && order.status !== "Delivered";
                const isDelivered = order.status === "Delivered";
                const hasCoords = order.customer?.latitude != null && order.customer?.longitude != null;

                return (
                  <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-800">#{order.id.slice(0, 8)}...</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status, order.paymentStatus)}`}>
                            {getStatusLabel(order.status, order.paymentStatus)}
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
                        <p className="text-sm text-gray-600 mb-1">
                          Customer: <span className="font-medium">{order.customer?.name || "Guest"}</span>
                          {order.customer?.phone && <span className="ml-2">({order.customer.phone})</span>}
                        </p>
                        {order.customer?.address && (
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <MapPin size={12} />
                            {order.customer.address}
                            {hasCoords && (
                              <a
                                href={`https://www.google.com/maps?q=${order.customer.latitude},${order.customer.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-pink-600 hover:text-pink-700 font-semibold underline"
                              >
                                Open in Maps
                              </a>
                            )}
                          </p>
                        )}
                        <div className="text-sm text-gray-500">
                          {items.map((item: any) => item.product?.name || "Item").join(", ")}
                          {totalItems > 0 && <span className="ml-1">({totalItems} item{totalItems > 1 ? "s" : ""})</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Payment: <span className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-pink-600">₱{Number(order.total).toLocaleString()}</span>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {isReady && (
                            <>
                              <button onClick={() => handlePaymentStatus(order.id, "Verified")}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                                <CheckCircle size={14} className="inline mr-1" />
                                Verify Payment
                              </button>
                              <button onClick={() => handlePaymentStatus(order.id, "Rejected")}
                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors">
                                Reject
                              </button>
                            </>
                          )}
                          {isVerified && (
                            <button onClick={() => handleMarkDelivered(order.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                              <CheckCircle size={14} className="inline mr-1" />
                              Mark Delivered
                            </button>
                          )}
                          {isDelivered && (
                            <button onClick={() => handlePrintReceipt(order)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                              <Printer size={14} className="inline mr-1" />
                              Print Receipt
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
