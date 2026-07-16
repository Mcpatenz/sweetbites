"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import StatCard from "@/components/Admin/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, ShoppingCart, Clock, Package, ArrowLeft, TrendingUp, Download, Printer, Calendar, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StaffReport {
  period: { filter: string; label: string; start: string; end: string };
  summary: {
    totalOrders: number;
    pendingCount: number;
    confirmedCount: number;
    preparingCount: number;
    sentToCashierCount: number;
    deliveredCount: number;
    totalRevenue: number;
    pendingRevenue: number;
    avgOrderValue: number;
  };
  paymentMethods: Record<string, { count: number; total: number }>;
  deliveryBreakdown: Record<string, number>;
  bestSellers: { name: string; quantity: number; revenue: number }[];
  timeBreakdown: { label: string; orders: number; revenue: number }[];
  recentOrders: { id: string; customer: string; items: number; total: number; status: string; paymentMethod: string; time: string }[];
}

type Filter = "daily" | "monthly" | "yearly";

export default function StaffReportsPage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [report, setReport] = useState<StaffReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("daily");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem("sweet-bites-user");
    if (!stored) { router.push("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "staff") { router.push("/"); return; }
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
      const res = await fetch(`/api/reports/staff?filter=${filter}&date=${getDateParam()}`);
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
      <html><head><title>Staff Report - ${report?.period.label}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #ec4899; padding-bottom: 4px; }
        .subtitle { color: #666; font-size: 13px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
        th { background: #f9f9f9; font-weight: 600; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
        .card .num { font-size: 22px; font-weight: bold; }
        .card .label { font-size: 11px; color: #666; }
        .pink { color: #ec4899; }
        .status { display: inline-block; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        @media print { body { padding: 10px; } }
      </style></head><body>
      <h1>Staff Report — ${report?.period.label}</h1>
      <p class="subtitle">Generated: ${new Date().toLocaleString("en-PH")} | Staff: ${user?.name}</p>
      ${content.innerHTML}
      <script>window.onload=function(){window.print();window.close();}<\/script>
      </body></html>
    `);
    win.document.close();
  };

  const handleDownloadCSV = () => {
    if (!report) return;
    const rows = [
      ["Staff Report", report.period.label],
      ["Generated", new Date().toLocaleString("en-PH")],
      ["Staff", user?.name],
      [],
      ["Summary"],
      ["Total Orders", report.summary.totalOrders],
      ["Pending", report.summary.pendingCount],
      ["Confirmed", report.summary.confirmedCount],
      ["Preparing", report.summary.preparingCount],
      ["Sent to Cashier", report.summary.sentToCashierCount],
      ["Delivered", report.summary.deliveredCount],
      ["Delivered Revenue", report.summary.totalRevenue],
      ["Pending Revenue", report.summary.pendingRevenue],
      ["Avg Order Value", report.summary.avgOrderValue],
      [],
      ["Payment Methods"],
      ["Method", "Orders", "Total"],
      ...Object.entries(report.paymentMethods).map(([m, d]) => [m, d.count, d.total]),
      [],
      ["Best Selling Products"],
      ["Product", "Qty Sold", "Revenue"],
      ...report.bestSellers.map((p) => [p.name, p.quantity, p.revenue]),
      [],
      ["Recent Orders"],
      ["Order ID", "Customer", "Items", "Total", "Status", "Payment Method", "Time"],
      ...report.recentOrders.map((o) => [o.id, o.customer, o.items, o.total, o.status, o.paymentMethod, new Date(o.time).toLocaleString("en-PH")]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-report-${filter}-${getDateParam()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  if (!user) return null;

  const formatStatus = (s: string) => s.replace(/_/g, " ");
  const getStatusColor = (s: string) => {
    switch (s) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Confirmed": return "bg-blue-100 text-blue-700";
      case "Preparing": return "bg-orange-100 text-orange-700";
      case "Out_for_Delivery": return "bg-purple-100 text-purple-700";
      case "Delivered": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍰</span>
            <h1 className="text-xl font-bold text-gray-800">Staff Reports</h1>
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
            <button onClick={() => router.push("/staff/dashboard")}
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
            <h2 className="text-2xl font-bold text-gray-800">End of Shift Report</h2>
            <p className="text-sm text-gray-400 mt-1">Compare with cashier before ending your shift</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
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
            {/* Date Navigation */}
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
            {/* Printable Header */}
            <div className="hidden print:block mb-4">
              <h1 style={{ fontSize: 22, fontWeight: "bold" }}>Staff Report — {report.period.label}</h1>
              <p style={{ color: "#666", fontSize: 13 }}>Generated: {new Date().toLocaleString("en-PH")} | Staff: {user?.name}</p>
            </div>

            {/* Processing Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-pink-600" /> Processing Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{report.summary.pendingCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Pending</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{report.summary.confirmedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Confirmed</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{report.summary.preparingCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Preparing</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{report.summary.sentToCashierCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Sent to Cashier</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{report.summary.deliveredCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Delivered</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard title="Total Orders" value={String(report.summary.totalOrders)} icon={<ShoppingCart size={28} />} color="blue" />
              <StatCard title="Delivered Revenue" value={formatCurrency(report.summary.totalRevenue)} icon={<DollarSign size={28} />} color="green" />
              <StatCard title="Pending Revenue" value={formatCurrency(report.summary.pendingRevenue)} icon={<Clock size={28} />} color="yellow" />
              <StatCard title="Avg Order Value" value={formatCurrency(report.summary.avgOrderValue)} icon={<Package size={28} />} color="pink" />
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Payment Methods (Cashier Verification Reference)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(report.paymentMethods).map(([method, data]) => (
                  <div key={method} className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">{method}</p>
                    <p className="text-xl font-bold text-gray-800">{data.count} orders</p>
                    <p className="text-sm text-pink-600 font-semibold">{formatCurrency(data.total)}</p>
                  </div>
                ))}
                {Object.keys(report.paymentMethods).length === 0 && (
                  <p className="text-gray-400 text-sm col-span-3">No orders in this period</p>
                )}
              </div>
            </div>

            {/* Delivery Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Delivery Breakdown</h3>
              <div className="flex gap-6">
                {Object.entries(report.deliveryBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{type}:</span>
                    <span className="font-bold text-gray-800">{count}</span>
                  </div>
                ))}
                {Object.keys(report.deliveryBreakdown).length === 0 && (
                  <p className="text-gray-400 text-sm">No orders in this period</p>
                )}
              </div>
            </div>

            {/* Time Breakdown Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">
                {filter === "daily" ? "Hourly" : filter === "monthly" ? "Daily" : "Monthly"} Order Activity
              </h3>
              {report.timeBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={report.timeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "orders" ? `${value} orders` : formatCurrency(Number(value)),
                        name === "orders" ? "Orders" : "Revenue",
                      ]}
                    />
                    <Bar dataKey="orders" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">No data for this period</p>
              )}
            </div>

            {/* Best Selling Products */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Best Selling Products</h3>
              {report.bestSellers.length === 0 ? (
                <p className="text-gray-400 text-sm">No sales in this period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">#</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Product</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">Qty Sold</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.bestSellers.map((item, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                          <td className="py-2 px-3 font-medium text-gray-800">{item.name}</td>
                          <td className="py-2 px-3 text-right">{item.quantity}</td>
                          <td className="py-2 px-3 text-right font-semibold text-pink-600">{formatCurrency(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6 pb-0">
                <h3 className="font-bold text-gray-800 mb-4">Recent Orders</h3>
              </div>
              {report.recentOrders.length === 0 ? (
                <p className="p-6 text-gray-400 text-sm">No orders in this period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Order</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Customer</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium hidden md:table-cell">Items</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium hidden md:table-cell">Payment</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recentOrders.map((order, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 px-3 font-mono font-bold text-gray-800">#{order.id}</td>
                          <td className="py-2 px-3 text-gray-600">{order.customer}</td>
                          <td className="py-2 px-3 text-gray-500 hidden md:table-cell">{order.items}</td>
                          <td className="py-2 px-3 text-gray-500 hidden md:table-cell">{order.paymentMethod}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
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
