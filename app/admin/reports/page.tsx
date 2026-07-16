"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { Download, Calendar, Search, Package, DollarSign, ShoppingCart, Hash } from "lucide-react";

type DateFilterMode = "All" | "Date" | "Month" | "Year";

interface ReportData {
  weeklySales: { week: string; sales: number; orders: number }[];
  bestSellersData: { name: string; quantity: number; revenue: number }[];
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  totalQuantitySold: number;
  totalRevenue: number;
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData>({
    weeklySales: [],
    bestSellersData: [],
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalQuantitySold: 0,
    totalRevenue: 0,
  });

  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("All");
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const fetchReports = async (params?: {
    dateMode?: string;
    filterDate?: string;
    filterMonth?: string;
    filterYear?: string;
    productSearch?: string;
  }) => {
    try {
      const query = new URLSearchParams();
      if (params?.dateMode) query.set("dateMode", params.dateMode);
      if (params?.filterDate) query.set("filterDate", params.filterDate);
      if (params?.filterMonth) query.set("filterMonth", params.filterMonth);
      if (params?.filterYear) query.set("filterYear", params.filterYear);
      if (params?.productSearch) query.set("productSearch", params.productSearch);

      const url = `/api/reports${query.toString() ? "?" + query.toString() : ""}`;
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch {
      // use empty data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const applyFilters = () => {
    setLoading(true);
    fetchReports({
      dateMode: dateFilterMode,
      filterDate,
      filterMonth,
      filterYear,
      productSearch,
    });
  };

  const resetFilters = () => {
    setDateFilterMode("All");
    setFilterDate("");
    setFilterMonth("");
    setFilterYear("");
    setProductSearch("");
    setLoading(true);
    fetchReports({ dateMode: "All", productSearch: "" });
  };

  const tableData = useMemo(() => {
    if (!productSearch.trim()) return data.bestSellersData;
    const search = productSearch.toLowerCase();
    return data.bestSellersData.filter((p) => p.name.toLowerCase().includes(search));
  }, [data.bestSellersData, productSearch]);

  const tableTotalQty = tableData.reduce((s, p) => s + p.quantity, 0);
  const tableTotalRevenue = tableData.reduce((s, p) => s + p.revenue, 0);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    years.add(new Date().getFullYear() - 1);
    return Array.from(years).sort((a, b) => b - a);
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600 mt-2">View and export sales reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">View by:</span>
          {(["All", "Date", "Month", "Year"] as DateFilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { setDateFilterMode(mode); setFilterDate(""); setFilterMonth(""); setFilterYear(""); }}
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

        <div className="flex items-center gap-3 flex-wrap border-t border-gray-100 pt-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by product name..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
            />
          </div>
          <button
            onClick={applyFilters}
            className="px-4 py-1.5 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button className="bg-pink-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-pink-700 flex items-center gap-1.5 ml-auto">
            <Download size={16} /> Export PDF
          </button>
          <button className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-1.5">
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-pink-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-100 rounded-lg">
              <DollarSign size={20} className="text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Sales</p>
              <p className="text-xl font-bold text-gray-900">₱{data.totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ShoppingCart size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{data.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Qty Sold</p>
              <p className="text-xl font-bold text-gray-900">{data.totalQuantitySold}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Hash size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Order Value</p>
              <p className="text-xl font-bold text-gray-900">₱{data.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Weekly Sales</h2>
          {loading ? <div className="h-[300px] bg-gray-100 rounded animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.weeklySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Weekly Orders</h2>
          {loading ? <div className="h-[300px] bg-gray-100 rounded animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.weeklySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Best Selling Products</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              Total Qty: <span className="font-bold text-gray-900">{tableTotalQty}</span>
            </span>
            <span className="text-gray-500">
              Total Revenue: <span className="font-bold text-green-600">₱{tableTotalRevenue.toLocaleString()}</span>
            </span>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-bold">Product Name</th>
              <th className="px-6 py-3 text-center font-bold">Quantity Sold</th>
              <th className="px-6 py-3 text-right font-bold">Revenue</th>
              <th className="px-6 py-3 text-center font-bold">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b animate-pulse">
                  <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div></td>
                  <td className="px-6 py-3 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                  <td className="px-6 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div></td>
                </tr>
              ))
            ) : tableData.length > 0 ? (
              tableData.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{product.name}</td>
                  <td className="px-6 py-3 text-center">{product.quantity}</td>
                  <td className="px-6 py-3 text-right font-bold">₱{product.revenue.toLocaleString()}</td>
                  <td className="px-6 py-3 text-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {tableTotalRevenue > 0 ? ((product.revenue / tableTotalRevenue) * 100).toFixed(1) : "0"}%
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="text-center py-12 text-gray-500">No sales data found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
