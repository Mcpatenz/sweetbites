"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import StatCard from "@/components/Admin/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, Clock, CheckCircle, XCircle, ArrowLeft, Download, Printer, Calendar, ChevronLeft, ChevronRight, Wallet, Truck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CashierReport {
  period: { filter: string; label: string; start: string; end: string };
  summary: {
    totalOrders: number;
    pendingPaymentCount: number;
    verifiedCount: number;
    rejectedCount: number;
    deliveredCount: number;
    outForDeliveryCount: number;
    totalCollected: number;
    pendingCollection: number;
    deliveryRevenue: number;
  };
  paymentMethods: Record<string, { count: number; total: number; verified: number; pending: number }>;
  timeBreakdown: { label: string; collected: number; orders: number }[];
  recentOrders: { id: string; customer: string; total: number; paymentMethod: string; paymentStatus: string; status: string; time: string }[];
}

type Filter = "daily" | "monthly" | "yearly";

export default function CashierReportsPage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [report, setReport] = useState<CashierReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("daily");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem("sweet-bites-user");
    if (!stored) { router.push("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "cashier") { router.push("/"); return; }
    setUser(parsed);
  }, [router]);

  useEffect(() => {
    if (user) fetchReport();
  }, [user, filter, currentDate]);

  const getDateParam = () => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(currentDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/cashier?filter=${filter}&date=${getDateParam()}`);
      const result = await res.json();
      if (result.success) setReport(result.data);
      else toast.error("Failed to load report");
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (dir: number) => {
    const d = new Date(currentDate);
    if (filter === "daily") d.setDate(d.getDate() + dir);
    else if (filter === "monthly") d.setMonth(d.getMonth() + dir);
    else d.setFullYear(d.getFullYear() + dir);
    setCurrentDate(d);
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Cashier Report - ${report?.period.label}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #ec4899; padding-bottom: 4px; }
        .subtitle { color: #666; font-size: 13px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
        th { background: #f9f9f9; font-weight: 600; }
        .status { display: inline-block; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        @media print { body { padding: 10px; } }
      </style></head><body>
      <h1>Cashier Report — ${report?.period.label}</h1>
      <p class="subtitle">Generated: ${new Date().toLocaleString("en-PH")} | Cashier: ${user?.name}</p>
      ${content.innerHTML}
      <script>window.onload=function(){window.print();window.close();}<\/script>
      </body></html>
    `);
    win.document.close();
  };

  const handleDownloadCSV = () => {
    if (!report) return;
    const rows = [
      ["Cashier Report", report.period.label],
      ["Generated", new Date().toLocaleString("en-PH")],
      ["Cashier", user?.name],
      [],
      ["Summary"],
      ["Total Orders", report.summary.totalOrders],
      ["Verified Payments", report.summary.verifiedCount],
      ["Pending Payments", report.summary.pendingPaymentCount],
      ["Rejected Payments", report.summary.rejectedCount],
      ["Delivered", report.summary.deliveredCount],
      ["Total Collected", report.summary.totalCollected],
      ["Pending Collection", report.summary.pendingCollection],
      ["Delivery Revenue", report.summary.deliveryRevenue],
      [],
      ["Payment Methods"],
      ["Method", "Orders", "Total", "Verified", "Pending"],
      ...Object.entries(report.paymentMethods).map(([m, d]) => [m, d.count, d.total, d.verified, d.pending]),
      [],
      ["Recent Transactions"],
      ["Order ID", "Customer", "Total", "Payment Method", "Payment Status", "Order Status", "Time"],
      ...report.recentOrders.map((o) => [o.id, o.customer, o.total, o.paymentMethod, o.paymentStatus, o.status, new Date(o.time).toLocaleString("en-PH")]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashier-report-${filter}-${getDateParam()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  if (!user) return null;

  const formatStatus = (s: string) => s.replace(/_/g, " ");
  const getPaymentStatusColor = (s: string) => {
    switch (s) {
      case "Verified": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-red-100 text-red-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  const getOrderStatusColor = (s: string) => {
    switch (s) {
      case "Delivered": return "bg-green-100 text-green-700";
      case "Out_for_Delivery": return "bg-purple-100 text-purple-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍰</span>
            <h1 className="text-xl font-bold text-gray-800">Cashier Reports</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadCSV}
              className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
              <Download size={14} /> Download
            </button>
            <button onClick={handlePrint}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
              <Printer size={14} /> Print
            </button>
            <button onClick={() => router.push("/cashier/dashboard")}
              className="text-sm text-gray-500 hover:text-pink-600 transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Dashboard
            </button>
            <button onClick={() => { localStorage.removeItem("sweet-bites-user"); router.push("/"); }}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 print:p-2">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Payment Report</h2>
            <p className="text-sm text-gray-400 mt-1">Track payments collected and compare with staff</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(["daily", "monthly", "yearly"] as Filter[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                    filter === f ? "bg-pink-600 text-white shadow" : "text-gray-600 hover:text-gray-800"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-white border rounded-lg px-1">
              <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-gray-100 rounded">
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-700 min-w-[140px] text-center flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                {report?.period.label || "..."}
              </span>
              <button onClick={() => navigateDate(1)} className="p-1.5 hover:bg-gray-100 rounded">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : !report ? (
          <div className="text-center py-20 text-gray-500">Failed to load report</div>
        ) : (
          <div ref={printRef}>
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wallet size={20} className="text-pink-600" /> Payment Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{report.summary.verifiedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Payments Verified</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{report.summary.pendingPaymentCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting Payment</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{report.summary.rejectedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Rejected</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{report.summary.outForDeliveryCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready for Pickup</p>
                </div>
              </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard title="Total Collected" value={formatCurrency(report.summary.totalCollected)} icon={<DollarSign size={28} />} color="green" />
              <StatCard title="Pending Collection" value={formatCurrency(report.summary.pendingCollection)} icon={<Clock size={28} />} color="yellow" />
              <StatCard title="Delivery Fees" value={formatCurrency(report.summary.deliveryRevenue)} icon={<Truck size={28} />} color="blue" />
              <StatCard title="Delivered Orders" value={String(report.summary.deliveredCount)} icon={<CheckCircle size={28} />} color="pink" />
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Payment Methods Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Method</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Orders</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Total</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Verified</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(report.paymentMethods).map(([method, data]) => (
                      <tr key={method} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-800">{method}</td>
                        <td className="py-2 px-3 text-right">{data.count}</td>
                        <td className="py-2 px-3 text-right font-semibold">{formatCurrency(data.total)}</td>
                        <td className="py-2 px-3 text-right text-green-600">{formatCurrency(data.verified)}</td>
                        <td className="py-2 px-3 text-right text-yellow-600">{formatCurrency(data.pending)}</td>
                      </tr>
                    ))}
                    {Object.keys(report.paymentMethods).length === 0 && (
                      <tr><td colSpan={5} className="py-4 text-center text-gray-400">No orders in this period</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Collection Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">
                {filter === "daily" ? "Hourly" : filter === "monthly" ? "Daily" : "Monthly"} Collection
              </h3>
              {report.timeBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={report.timeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "collected" ? formatCurrency(Number(value)) : `${value} orders`,
                        name === "collected" ? "Collected" : "Orders",
                      ]}
                    />
                    <Bar dataKey="collected" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">No data for this period</p>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6 pb-0">
                <h3 className="font-bold text-gray-800 mb-4">Recent Transactions</h3>
              </div>
              {report.recentOrders.length === 0 ? (
                <p className="p-6 text-gray-400 text-sm">No transactions in this period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Order</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Customer</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium hidden md:table-cell">Payment</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Payment Status</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium hidden md:table-cell">Order Status</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recentOrders.map((order, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 px-3 font-mono font-bold text-gray-800">#{order.id}</td>
                          <td className="py-2 px-3 text-gray-600">{order.customer}</td>
                          <td className="py-2 px-3 text-gray-500 hidden md:table-cell">{order.paymentMethod}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {formatStatus(order.paymentStatus)}
                            </span>
                          </td>
                          <td className="py-2 px-3 hidden md:table-cell">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                              {formatStatus(order.status)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-pink-600">{formatCurrency(order.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
