"use client";

import { formatCurrency, formatDate } from "@/lib/utils";

interface ReceiptProps {
  order: any;
  businessSettings?: any;
  cashierName?: string;
}

export default function OrderReceipt({ order, businessSettings, cashierName }: ReceiptProps) {
  const business = businessSettings || {};
  const items = order.items || [];

  return (
    <div className="bg-white p-8 max-w-md mx-auto font-mono text-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {business.businessName || "Sweet Bites Bakery"}
        </h1>
        {business.address && (
          <p className="text-gray-600 text-xs mt-1">{business.address}</p>
        )}
        {business.contactNumber && (
          <p className="text-gray-600 text-xs">Tel: {business.contactNumber}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">Official Receipt</p>
      </div>

      {/* Order Info */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Receipt No:</span>
          <span className="font-bold">{order.id.slice(0, 12).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Date:</span>
          <span>{new Date(order.createdAt).toLocaleDateString("en-PH")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Time:</span>
          <span>{new Date(order.createdAt).toLocaleTimeString("en-PH")}</span>
        </div>
        {cashierName && (
          <div className="flex justify-between">
            <span className="text-gray-500">Cashier:</span>
            <span>{cashierName}</span>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="border-t border-dashed border-gray-300 pt-3 mb-4 space-y-1">
        <p className="font-bold text-gray-700 mb-1">SOLD TO:</p>
        <p className="font-semibold">{order.customer?.name || "Walk-in Customer"}</p>
        {order.customer?.phone && (
          <p className="text-gray-500 text-xs">Tel: {order.customer.phone}</p>
        )}
        {order.customer?.address && (
          <p className="text-gray-500 text-xs">{order.customer.address}</p>
        )}
      </div>

      {/* Items */}
      <div className="border-t border-dashed border-gray-300 pt-3 mb-4">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-200">
              <th className="text-left pb-1">Item</th>
              <th className="text-center pb-1">Qty</th>
              <th className="text-right pb-1">Price</th>
              <th className="text-right pb-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-1 text-xs">{item.product?.name || "Item"}</td>
                <td className="py-1 text-center text-xs">{item.quantity}</td>
                <td className="py-1 text-right text-xs">
                  {formatCurrency(Number(item.price))}
                </td>
                <td className="py-1 text-right text-xs font-semibold">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t border-dashed border-gray-300 pt-3 mb-4 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Subtotal:</span>
          <span>{formatCurrency(Number(order.subtotal))}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Delivery Fee:</span>
          <span>{formatCurrency(Number(order.deliveryFee))}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
          <span>TOTAL:</span>
          <span className="text-pink-600">{formatCurrency(Number(order.total))}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="border-t border-dashed border-gray-300 pt-3 mb-4 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Payment Method:</span>
          <span className="font-semibold">{order.paymentMethod?.replace(/_/g, " ")}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Payment Status:</span>
          <span className={`font-semibold ${
            order.paymentStatus === "Verified" ? "text-green-600" :
            order.paymentStatus === "Rejected" ? "text-red-600" :
            "text-yellow-600"
          }`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-dashed border-gray-300 pt-4 text-center">
        <p className="text-xs text-gray-400">Thank you for your purchase!</p>
        <p className="text-xs text-gray-400 mt-1">
          {business.businessName || "Sweet Bites Bakery"}
        </p>
      </div>
    </div>
  );
}
