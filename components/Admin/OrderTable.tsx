"use client";

import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface OrderTableProps {
  orders: Order[];
  isAdmin?: boolean;
  onStatusChange?: (orderId: string, newStatus: string) => void;
  onTrack?: (order: Order) => void;
}

export default function OrderTable({ orders, isAdmin, onStatusChange, onTrack }: OrderTableProps) {
  const formatStatus = (s: string) => s.replace(/_/g, " ");

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-3 text-left">Order ID</th>
            <th className="border border-gray-300 p-3 text-left">
              {isAdmin ? "Customer" : "Date"}
            </th>
            <th className="border border-gray-300 p-3 text-left">Delivery</th>
            <th className="border border-gray-300 p-3 text-left">Items</th>
            <th className="border border-gray-300 p-3 text-right">Total</th>
            <th className="border border-gray-300 p-3 text-center">Status</th>
            <th className="border border-gray-300 p-3 text-center">Payment</th>
            <th className="border border-gray-300 p-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isCancelled = order.status === "Cancelled";
            const isDelivered = order.status === "Delivered";
            return (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 font-bold">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="border border-gray-300 p-3">
                  {isAdmin
                    ? order.customer?.name || "Unknown"
                    : formatDate(order.createdAt)}
                </td>
                <td className="border border-gray-300 p-3 text-sm">
                  {order.deliveryDate ? (
                    <div>
                      <span className="font-semibold">
                        {new Date(order.deliveryDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                      </span>
                      {order.deliveryTime && (
                        <span className="text-gray-500 ml-1">{order.deliveryTime}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="border border-gray-300 p-3">
                  {order.items.length} item(s)
                </td>
                <td className="border border-gray-300 p-3 text-right font-bold">
                  {formatCurrency(Number(order.total))}
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  {isAdmin && onStatusChange ? (
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className={`px-2 py-1 rounded text-sm font-semibold border-0 ${
                        isDelivered
                          ? "bg-green-100 text-green-800"
                          : isCancelled
                            ? "bg-red-100 text-red-800"
                            : order.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Out_for_Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isDelivered
                          ? "bg-green-100 text-green-800"
                          : isCancelled
                            ? "bg-red-100 text-red-800"
                            : order.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.paymentStatus === "Verified"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {isAdmin && onTrack && (
                      <button
                        onClick={() => onTrack(order)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          !isCancelled && !isDelivered
                            ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <MapPin size={12} className="inline mr-1" />
                        Track
                      </button>
                    )}
                    <Link href={`/order-details/${order.id}`}>
                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                        View
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="border border-gray-300 p-8 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
