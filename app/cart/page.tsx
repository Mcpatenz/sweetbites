"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
  Truck,
  Clock,
  Shield,
  Gift,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import type { CartItem, Product } from "@/lib/types";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400 text-sm">Loading map...</span>
    </div>
  ),
});

// Cart Item Component
const CartItemComponent = ({
  item,
  product,
  onQuantityChange,
  onRemove,
  
}: {
  item: CartItem;
  product?: Product;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const productName = product?.name || "Unknown Product";
  const productDescription = product?.description || "";
  const productPrice = Number(product?.price || item.price);
  const productStock = product?.stock ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Product Image */}
        <div className="relative w-full sm:w-32 h-32 bg-linear-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shrink-0">
          {product?.image ? (
            <img
              src={product.image}
              alt={productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              🍰
            </div>
          )}
          {productStock <= 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {productName}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-1">
              {productDescription}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-pink-600">
                ₱{productPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400">each</span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() =>
                  onQuantityChange(item.productId, item.quantity - 1)
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="w-10 text-center font-semibold text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  onQuantityChange(item.productId, item.quantity + 1)
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <button
              onClick={() => onRemove(item.productId)}
              className={`p-2 rounded-lg transition-all ${
                isHovered
                  ? "bg-red-50 text-red-500 hover:bg-red-100"
                  : "text-gray-400 hover:text-red-500"
              }`}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Item Total */}
          <div className="text-right min-w-20">
            <div className="text-sm text-gray-500">Subtotal</div>
            <div className="text-xl font-bold text-gray-900">
              ₱{(productPrice * item.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Cart Summary Component
const CartSummary = ({
  cart,
  onCheckout,
}: {
  cart: any;
  onCheckout: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 sticky top-20"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">₱{cart.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-semibold">₱{cart.deliveryFee.toFixed(2)}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Items</span>
          <span className="font-semibold">{cart.itemCount} items</span>
        </div>

        {/* Promo Code */}
        <div className="py-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Promo code"
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button className="px-4 py-1.5 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors">
              Apply
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between py-3 border-t-2 border-gray-200">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-pink-600">
            ₱{cart.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mt-4 p-3 bg-pink-50 rounded-lg text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-pink-600" />
          <span>Free delivery on orders over ₱500</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-pink-600" />
          <span>Estimated delivery: 30-45 minutes</span>
        </div>
      </div>

      {/* Checkout Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCheckout}
        className="w-full mt-6 bg-linear-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <CreditCard className="h-5 w-5" />
        Proceed to Checkout
      </motion.button>

      {/* Payment Methods */}
      <div className="mt-4 flex justify-center gap-2 text-xs text-gray-500">
        <span>💳</span>
        <span>📱</span>
        <span>💰</span>
        <span className="ml-2">Secure payments</span>
      </div>

      {/* Trust Badges */}
      <div className="mt-3 flex justify-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Secure
        </span>
        <span className="flex items-center gap-1">
          <Gift className="h-3 w-3" />
          Rewards
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Fresh
        </span>
      </div>
    </motion.div>
  );
};

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; paymentMethod: string } | null>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  const timeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM",
  ];

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok && data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("sweet-bites-cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        setCartItems(parsed);
      } catch {
        setCartItems([]);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("sweet-bites-cart", JSON.stringify(cartItems));
      window.dispatchEvent(new Event("cart-updated"));
    }
  }, [cartItems, isLoading]);

  const updateCart = (updatedItems: CartItem[]) => {
    setCartItems(updatedItems);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(productId);
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    );
    updateCart(updatedItems);
  };

  const handleRemove = (productId: string) => {
    const updatedItems = cartItems.filter(
      (item) => item.productId !== productId,
    );
    updateCart(updatedItems);
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      updateCart([]);
    }
  };

  // Calculate cart totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryFee - discount;
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Check if all products are available
  const unavailableItems = cartItems.filter((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product && product.stock <= 0;
  });

  const cartSummary = {
    items: cartItems,
    subtotal,
    deliveryFee,
    total,
    itemCount,
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handlePlaceOrder = async (paymentMethod: string) => {
    if (isPlacingOrder) return;
    if (!deliveryDate) {
      toast.error("Please select a delivery date");
      return;
    }
    if (!deliveryTime) {
      toast.error("Please select a delivery time");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (paymentMethod !== "Cash on Delivery" && !uploadedFile) {
      toast.error("Please upload a payment screenshot");
      return;
    }
    setIsPlacingOrder(true);

    try {
      let userId: string | null = null;
      try {
        const storedUser = localStorage.getItem("sweet-bites-user");
        if (storedUser) userId = JSON.parse(storedUser).id;
      } catch {}

      let receiptUrl: string | null = null;
      if (paymentMethod !== "Cash on Delivery" && uploadedFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", uploadedFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          receiptUrl = uploadData.data.url;
        } else {
          toast.error("Failed to upload payment screenshot");
          setIsPlacingOrder(false);
          return;
        }
      }

      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        deliveryType: "Delivery",
        deliveryDate: deliveryDate || null,
        deliveryTime: deliveryTime || null,
        notes: null,
        userId,
        receiptUrl,
        customerInfo: {
          name: null,
          phone: null,
          address: address,
          landmark: landmark || null,
          latitude: pinLatitude,
          longitude: pinLongitude,
        },
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const orderId = data.data.id.slice(0, 8);
        toast.success(`Order #${orderId} submitted successfully!`, {
          description: `Payment method: ${paymentMethod}. We'll start preparing your order right away.`,
          duration: 6000,
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        });
        setOrderSuccess({ orderId: data.data.id, paymentMethod });
        setCartItems([]);
        localStorage.removeItem("sweet-bites-cart");
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        toast.error(data.message || "Failed to place order. Please try again.");
      }
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-100">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
        </div>
      </div>
      <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-6xl mb-6"
          >
            🛒
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start adding delicious items to your order from our menu of freshly
            baked cakes and desserts.
          </p>
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-linear-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Continue Shopping
            </motion.button>
          </Link>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-pink-50 p-4 rounded-xl">
              <div className="text-2xl mb-1">🍰</div>
              <div className="font-semibold text-gray-900">Fresh Cakes</div>
              <div className="text-sm text-gray-500">Baked daily</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-2xl mb-1">🚚</div>
              <div className="font-semibold text-gray-900">Fast Delivery</div>
              <div className="text-sm text-gray-500">30-45 minutes</div>
            </div>
            <div className="bg-pink-50 p-4 rounded-xl">
              <div className="text-2xl mb-1">💳</div>
              <div className="font-semibold text-gray-900">Secure Payment</div>
              <div className="text-sm text-gray-500">GCash / Maya / COD</div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
      </>
    );
  }

  return (
    <>
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <p className="text-gray-500 mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/products">
            <button className="px-4 py-2 text-pink-600 hover:text-pink-700 font-medium transition-colors flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </button>
          </Link>
          <button
            onClick={handleClearCart}
            className="px-4 py-2 text-red-500 hover:text-red-600 font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cart
          </button>
        </div>
      </div>

      {/* Out of Stock Warning */}
      {unavailableItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              Some items are out of stock
            </p>
            <p className="text-sm text-yellow-700">
              {unavailableItems.map((item) => {
                const product = products.find(
                  (p) => p.id === item.productId,
                );
                return (
                  <span key={item.productId} className="font-medium">
                    {product?.name || item.productId} (Out of stock)
                  </span>
                );
              })}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <CartItemComponent
                  key={item.productId}
                  item={item}
                  product={product}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              );
            })}
          </AnimatePresence>

          {/* Suggested Items */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              You might also like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {products
                .filter(
                  (p) =>
                    !cartItems.some((item) => item.productId === p.id) &&
                    !p.archived,
                )
                .slice(0, 4)
                .map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-3 text-center cursor-pointer"
                    onClick={() => {
                      const newItem: CartItem = {
                        productId: product.id,
                        quantity: 1,
                        price: Number(product.price),
                      };
                      const updatedItems = [...cartItems, newItem];
                      updateCart(updatedItems);
                    }}
                  >
                    <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🍰</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {product.name}
                    </div>
                    <div className="text-sm font-bold text-pink-600">
                      ₱{Number(product.price)}
                    </div>
                    <button className="mt-1 text-xs bg-pink-600 text-white px-2 py-1 rounded-full hover:bg-pink-700 transition-colors">
                      Add
                    </button>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div>
          <CartSummary cart={cartSummary} onCheckout={handleCheckout} />
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!orderSuccess) setIsCheckoutModalOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              {!orderSuccess && (
                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}

              {orderSuccess ? (
                /* Order Success State */
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="mb-4"
                  >
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Order Submitted!
                  </h2>
                  <p className="text-gray-600 mb-1">
                    Your order has been received and is being prepared.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 mt-3 mb-2 inline-block">
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono font-bold text-gray-800">{orderSuccess.orderId.slice(0, 8)}</p>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-3 mb-4 inline-block">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-semibold text-pink-700">{orderSuccess.paymentMethod}</p>
                  </div>
                  <button
                    onClick={() => {
                      setOrderSuccess(null);
                      setIsCheckoutModalOpen(false);
                      router.push("/orders");
                    }}
                    className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all"
                  >
                    View My Orders
                  </button>
                </div>
              ) : (
                /* Checkout Form State */
                <>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Ready to Checkout!
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Review your order before confirming
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                    {cartItems.map((item) => {
                      const product = products.find(
                        (p) => p.id === item.productId,
                      );
                      return (
                        <div
                          key={item.productId}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {product?.name || "Unknown"} x{item.quantity}
                          </span>
                          <span className="font-semibold">
                            ₱{(Number(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-pink-600">₱{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-pink-600" /> Delivery Address
                    </h3>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Delivery Address *"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Landmark (optional)"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div className="mt-3">
                      <LocationPicker
                        latitude={pinLatitude}
                        longitude={pinLongitude}
                        onLocationChange={(lat, lng) => {
                          setPinLatitude(lat);
                          setPinLongitude(lng);
                        }}
                      />
                    </div>
                  </div>

                  {/* Delivery Date & Time */}
                  <div className="bg-pink-50 rounded-xl p-4 mb-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-pink-600" /> Preferred Delivery Date & Time
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">Select when you'd like to receive your order</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          min={getMinDate()}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                        <select
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select time</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {deliveryDate && deliveryTime && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-semibold text-green-800 mb-1">Delivery Details Confirmed</p>
                        <p className="text-sm text-gray-900">
                          {new Date(deliveryDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {deliveryTime}
                        </p>
                        {address && (
                          <p className="text-xs text-gray-600 mt-1">
                            📍 {address}{landmark ? ` (${landmark})` : ""}
                            {pinLatitude && pinLongitude ? ` — Pinned: ${pinLatitude.toFixed(5)}, ${pinLongitude.toFixed(5)}` : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-pink-600" /> Payment Method
                    </h3>
                    <div className="space-y-2">
                      {(["GCash", "Maya", "Cash on Delivery"] as const).map((method) => (
                        <label key={method} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === method ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:bg-gray-100"}`}>
                          <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method}
                            onChange={() => { setPaymentMethod(method); setUploadedFile(null); }} className="w-4 h-4 text-pink-600" />
                          <span className="font-semibold text-sm">{method}</span>
                        </label>
                      ))}
                    </div>
                    {paymentMethod && paymentMethod !== "Cash on Delivery" && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Upload Payment Screenshot</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Please upload a screenshot of your {paymentMethod} payment confirmation.
                        </p>
                        <input type="file" accept="image/*" onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                          className="w-full text-sm border border-gray-300 rounded-lg file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-pink-100 file:text-pink-700 file:font-semibold hover:file:bg-pink-200" />
                        {uploadedFile && (
                          <div className="mt-2 flex items-center gap-2">
                            <img src={URL.createObjectURL(uploadedFile)} alt="Receipt preview" className="w-12 h-12 object-cover rounded-lg border" />
                            <div>
                              <p className="text-xs font-medium text-gray-700">{uploadedFile.name}</p>
                              <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Place Order Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePlaceOrder("GCash")}
                      disabled={isPlacingOrder || paymentMethod !== "GCash"}
                      className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlacingOrder ? "Placing Order..." : "Pay with GCash"}
                    </button>
                    <button
                      onClick={() => handlePlaceOrder("Maya")}
                      disabled={isPlacingOrder || paymentMethod !== "Maya"}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlacingOrder ? "Placing Order..." : "Pay with Maya"}
                    </button>
                    <button
                      onClick={() => handlePlaceOrder("Cash on Delivery")}
                      disabled={isPlacingOrder || paymentMethod !== "Cash on Delivery"}
                      className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlacingOrder ? "Placing Order..." : "Cash on Delivery"}
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    You will receive an order confirmation after placing your order
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <Footer />
    </>
  );
}
