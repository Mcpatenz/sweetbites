"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CustomerData {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  totalOrders: number;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers");
      const result = await res.json();
      if (result.success) {
        setCustomers(result.data);
      } else {
        toast.error("Failed to load customers");
      }
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const totalOrdersValue = customers.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Customer Management</h1>
        <p className="text-gray-600 mt-2">View and manage all customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Total Customers</p>
          <p className="text-3xl font-bold mt-2">{customers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Total Orders</p>
          <p className="text-3xl font-bold mt-2">{totalOrdersValue}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Avg Orders per Customer</p>
          <p className="text-3xl font-bold mt-2">
            {customers.length > 0 ? (totalOrdersValue / customers.length).toFixed(1) : "0"}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-bold">Customer Name</th>
              <th className="px-6 py-3 text-left font-bold">Email</th>
              <th className="px-6 py-3 text-left font-bold">Phone</th>
              <th className="px-6 py-3 text-left font-bold">Address</th>
              <th className="px-6 py-3 text-center font-bold">Total Orders</th>
              <th className="px-6 py-3 text-center font-bold">Member Since</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b animate-pulse">
                  <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                  <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                  <td className="px-6 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
                  <td className="px-6 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                </tr>
              ))
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{customer.name}</td>
                  <td className="px-6 py-3">{customer.email || "-"}</td>
                  <td className="px-6 py-3">{customer.phone}</td>
                  <td className="px-6 py-3 text-sm">{customer.address}</td>
                  <td className="px-6 py-3 text-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                      {customer.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center text-sm">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
