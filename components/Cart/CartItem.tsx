"use client";

import { CartItem, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { getImageSrc } from "@/lib/image";
import { Trash2, Plus, Minus } from "lucide-react";

interface CartItemProps {
  item: CartItem;
  product?: Product;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItemComponent({
  item,
  product,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gray-200 rounded shrink-0">
        {product?.image && (
          <img
            src={getImageSrc(product.image)}
            alt={product.name}
            className="w-full h-full object-cover rounded"
          />
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h4 className="font-bold text-lg mb-1">{product?.name}</h4>
        <p className="text-gray-600 text-sm mb-2">
          {formatCurrency(item.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-bold">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
            className="p-1 rounded border border-gray-300 hover:bg-gray-100"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Subtotal & Remove */}
      <div className="text-right flex flex-col justify-between">
        <p className="font-bold text-lg">
          {formatCurrency(item.price * item.quantity)}
        </p>
        <button
          onClick={() => onRemove(item.productId)}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
