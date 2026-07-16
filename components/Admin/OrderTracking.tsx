"use client";

import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  XCircle,
  Package,
  ArrowRight,
  MapPin,
} from "lucide-react";

const statusFlow = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out_for_Delivery",
  "Delivered",
];

const statusConfig: Record<
  string,
  { label: string; icon: any; color: string; bgColor: string; borderColor: string }
> = {
  Pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
  },
  Confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  Preparing: {
    label: "Preparing",
    icon: ChefHat,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
  },
  Out_for_Delivery: {
    label: "Out for Delivery",
    icon: Truck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-300",
  },
  Delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
  },
  Cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
  },
};

interface OrderTrackingProps {
  order: Order;
  compact?: boolean;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

export default function OrderTracking({
  order,
  compact = false,
  onStatusChange,
}: OrderTrackingProps) {
  const isCancelled = order.status === "Cancelled";
  const currentStatusIndex = statusFlow.indexOf(order.status);
  const config = statusConfig[order.status] || statusConfig.Pending;
  const StatusIcon = config.icon;

  const formatStatus = (s: string) => s.replace(/_/g, " ");

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-gray-800 text-sm">
              #{order.id.slice(0, 8)}
            </p>
            <p className="text-xs text-gray-500">
              {order.customer?.name || "Unknown"}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color}`}
          >
            {formatStatus(order.status)}
          </span>
        </div>

        {isCancelled ? (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
            <XCircle size={14} className="text-red-500 shrink-0" />
            <span className="text-xs text-red-600">Order cancelled</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {statusFlow.map((status, index) => {
              const isCompleted = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              return (
                <div key={status} className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isCompleted
                        ? "bg-green-500"
                        : isCurrent
                          ? "bg-pink-500 ring-2 ring-pink-200"
                          : "bg-gray-200"
                    }`}
                  />
                  {index < statusFlow.length - 1 && (
                    <div
                      className={`w-4 h-0.5 ${
                        index < currentStatusIndex ? "bg-green-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{formatCurrency(Number(order.total))}</span>
          <span>{order.items.length} item(s)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor}`}>
            <StatusIcon size={20} className={config.color} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">
              Order #{order.id.slice(0, 8)}
            </h3>
            <p className="text-sm text-gray-500">
              {order.customer?.name || "Unknown"} &middot;{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-pink-600">
            {formatCurrency(Number(order.total))}
          </p>
          <p className="text-xs text-gray-500">
            {order.items.length} item(s)
          </p>
        </div>
      </div>

      {isCancelled ? (
        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
          <XCircle size={28} className="text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-red-700">Order Cancelled</p>
            <p className="text-sm text-red-600">
              This order has been cancelled and will not proceed.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {statusFlow.map((status, index) => {
              const detail = statusConfig[status];
              const DetailIcon = detail.icon;
              const isCompleted = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              return (
                <div key={status} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isCurrent
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-200 scale-110"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <DetailIcon size={18} />
                  </div>
                  <p
                    className={`text-xs mt-2 text-center font-medium ${
                      isCurrent || isCompleted ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {detail.label}
                  </p>
                  {isCurrent && (
                    <span className="mt-1 px-2 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-semibold rounded-full">
                      Current
                    </span>
                  )}
                  {index < statusFlow.length - 1 && (
                    <div
                      className={`absolute w-full h-0.5 top-5 ${
                        isCompleted ? "bg-green-400" : "bg-gray-200"
                      }`}
                      style={{ display: "none" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center mt-[-28px] ml-[20px] mr-[20px]">
            {statusFlow.slice(0, -1).map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-0.5 mx-1 ${
                  index < currentStatusIndex ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {order.deliveryDate && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
          <Package size={16} className="text-gray-400" />
          <span className="text-gray-500">Delivery:</span>
          <span className="font-semibold text-gray-700">
            {new Date(order.deliveryDate).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
            })}
            {order.deliveryTime ? ` at ${order.deliveryTime}` : ""}
          </span>
        </div>
      )}

      {order.customer?.latitude != null && order.customer?.longitude != null && (
        <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg text-sm border border-pink-100">
          <MapPin size={16} className="text-pink-500 shrink-0" />
          <span className="text-gray-500">Customer Location:</span>
          <a
            href={`https://www.google.com/maps?q=${order.customer.latitude},${order.customer.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-700 font-semibold underline"
          >
            Open in Maps
          </a>
        </div>
      )}

      {onStatusChange && !isCancelled && currentStatusIndex < statusFlow.length - 1 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Advance to next status:</p>
          <button
            onClick={() =>
              onStatusChange(order.id, statusFlow[currentStatusIndex + 1])
            }
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700 transition-colors"
          >
            Move to {formatStatus(statusFlow[currentStatusIndex + 1])}
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
