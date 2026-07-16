"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    businessName: "",
    contactNumber: "",
    address: "",
    facebook: "",
    instagram: "",
    gcashQR: "",
    mayaQR: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        setSettings({
          businessName: d.businessName || "",
          contactNumber: d.contactNumber || "",
          address: d.address || "",
          facebook: d.facebook || "",
          instagram: d.instagram || "",
          gcashQR: d.gcashQR || "",
          mayaQR: d.mayaQR || "",
        });
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(result.message || "Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your business information and payment settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Business Information</h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-200 rounded"></div>)}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                  <input type="text" name="businessName" value={settings.businessName} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                  <input type="tel" name="contactNumber" value={settings.contactNumber} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <textarea name="address" value={settings.address} onChange={handleInputChange} rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Social Media</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook URL</label>
                <input type="url" name="facebook" value={settings.facebook} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram Handle</label>
                <input type="text" name="instagram" value={settings.instagram} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">GCash Number / QR</label>
                <input type="text" name="gcashQR" value={settings.gcashQR} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Maya Number / QR</label>
                <input type="text" name="mayaQR" value={settings.mayaQR} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600" />
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={isSaving}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
            <Save size={20} />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <h3 className="font-bold text-lg mb-3">Tip</h3>
            <p className="text-sm text-gray-700">
              Make sure to update your payment information so customers can reach you. These details will be displayed during checkout.
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
            <h3 className="font-bold text-lg mb-3">Important</h3>
            <p className="text-sm text-gray-700">
              Double-check all payment numbers and social media links before saving. Incorrect information may confuse customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
