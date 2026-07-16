"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CartSummary from "@/components/Cart/CartSummary";
import { Cart, DeliveryType, PaymentMethod } from "@/lib/types";
import { toast } from "sonner";
import { Package, CreditCard, Calendar, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400 text-sm">Loading map...</span>
    </div>
  ),
});

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, deliveryFee: 50, total: 0 });
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    address: "",
    landmark: "",
    notes: "",
  });
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("Delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pinLatitude, setPinLatitude] = useState<number | null>(null);
  const [pinLongitude, setPinLongitude] = useState<number | null>(null);

  const deliveryFee = deliveryType === "Pickup" ? 0 : 50;

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sweet-bites-cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        const items = Array.isArray(parsed) ? parsed : parsed.items || [];
        const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
        const deliveryFee = 50;
        setCart({ items, subtotal, deliveryFee, total: subtotal + deliveryFee });
      }
    } catch {
      // empty cart
    }

    try {
      const storedUser = localStorage.getItem("sweet-bites-user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFormData((prev) => ({
          ...prev,
          fullName: parsed.name || "",
          contactNumber: parsed.phone || "",
        }));
      }
    } catch {
      // no user logged in
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!deliveryDate) {
      toast.error("Please select a delivery date");
      return;
    }
    if (!deliveryTime) {
      toast.error("Please select a delivery time");
      return;
    }
    if (paymentMethod !== "Cash on Delivery" && !uploadedFile) {
      toast.error("Please upload a payment screenshot");
      return;
    }
    setSubmitting(true);
    try {
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
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          subtotal: cart.subtotal,
          deliveryFee: deliveryFee,
          total: cart.total,
          paymentMethod,
          deliveryType,
          deliveryDate: deliveryDate || null,
          deliveryTime: deliveryTime || null,
          notes: formData.notes || null,
          userId: user?.id || null,
          receiptUrl,
          customerInfo: {
            name: formData.fullName,
            phone: formData.contactNumber,
            address: formData.address,
            landmark: formData.landmark,
            latitude: pinLatitude,
            longitude: pinLongitude,
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Order placed successfully!");
        localStorage.removeItem("sweet-bites-cart");
        window.location.href = `/order-details/${result.data.id}`;
      } else {
        toast.error(result.message || "Failed to place order");
      }
    } catch {
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
              <div className="space-y-4">
                <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
                <input type="tel" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
                <textarea name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
                <input type="text" name="landmark" placeholder="Landmark (optional)" value={formData.landmark} onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
                <textarea name="notes" placeholder="Order Notes (optional)" value={formData.notes} onChange={handleInputChange} rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Pin Your Location</h2>
              <p className="text-sm text-gray-500 mb-4">
                Help our delivery rider find you faster by pinning your exact location on the map.
              </p>
              <LocationPicker
                latitude={pinLatitude}
                longitude={pinLongitude}
                onLocationChange={(lat, lng) => {
                  setPinLatitude(lat);
                  setPinLongitude(lng);
                }}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Package size={24} /> Delivery Options
              </h2>
              <div className="space-y-3">
                {(["Pickup", "Delivery"] as DeliveryType[]).map((option) => (
                  <label key={option} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="deliveryType" value={option} checked={deliveryType === option}
                      onChange={() => setDeliveryType(option)} className="w-4 h-4" />
                    <span className="font-semibold">{option}</span>
                    {option === "Pickup" && <span className="text-sm text-gray-500 ml-auto">Free</span>}
                    {option === "Delivery" && <span className="text-sm text-gray-500 ml-auto">₱50 fee</span>}
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar size={24} /> Preferred Delivery Date & Time
              </h2>
              <p className="text-sm text-gray-500 mb-4">Select when you'd like to receive your order</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={getMinDate()}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
                  >
                    <option value="">Select a time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
              {deliveryDate && deliveryTime && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <Package size={16} /> Delivery Details Confirmed
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium text-gray-900">{new Date(deliveryDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <p className="font-medium text-gray-900">{deliveryTime}</p>
                    </div>
                  </div>
                  {(formData.address || pinLatitude) && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <span className="text-gray-500 text-sm">Delivery Address:</span>
                      <p className="font-medium text-gray-900">{formData.address || "No address provided"}</p>
                      {formData.landmark && <p className="text-sm text-gray-600">Landmark: {formData.landmark}</p>}
                      {pinLatitude && pinLongitude && (
                        <p className="text-xs text-green-700 mt-1">
                          📍 Pinned Location: {pinLatitude.toFixed(5)}, {pinLongitude.toFixed(5)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CreditCard size={24} /> Payment Methods
              </h2>
              <div className="space-y-3">
                {(["Cash on Delivery", "GCash", "Maya"] as PaymentMethod[]).map((method) => (
                  <label key={method} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)} className="w-4 h-4" />
                    <span className="font-semibold">{method}</span>
                  </label>
                ))}
              </div>
              {paymentMethod !== "Cash on Delivery" && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold mb-1">Upload Payment Screenshot</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Please upload a screenshot of your {paymentMethod} payment confirmation.
                  </p>
                  <input type="file" accept="image/*" onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-100 file:text-pink-700 file:font-semibold hover:file:bg-pink-200" />
                  {uploadedFile && (
                    <div className="mt-3 flex items-center gap-2">
                      <img src={URL.createObjectURL(uploadedFile)} alt="Receipt preview" className="w-16 h-16 object-cover rounded-lg border" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button type="submit" disabled={submitting || cart.items.length === 0}
              className="w-full bg-pink-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-pink-700 transition-colors disabled:opacity-50">
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>

        <div>
          <CartSummary cart={{ ...cart, deliveryFee }} isCheckout />
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
