"use client";

import { Cart } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface CartSummaryProps {
  cart: Cart;
  isCheckout?: boolean;
}

export default function CartSummary({ cart, isCheckout }: CartSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      <h3 className="font-bold text-xl mb-4">Order Summary</h3>

      <div className="space-y-3 mb-4 pb-4 border-b">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-semibold">
            {formatCurrency(cart.deliveryFee)}
          </span>
        </div>
      </div>

      <div className="flex justify-between mb-6 text-lg font-bold">
        <span>Total</span>
        <span className="text-pink-600">{formatCurrency(cart.total)}</span>
      </div>

      {!isCheckout && (
        <Link href="/checkout">
          <button className="w-full bg-pink-600 text-white py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors">
            Proceed to Checkout
          </button>
        </Link>
      )}
    </div>
  );
}
