"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/types";
import {
  Plus,
  Edit2,
  Trash2,
  Archive,
  Upload,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
  TrendingUp,
  Clock,
  RefreshCw,
  Image as ImageIcon,
  Tag,
  Layers,
  DollarSign,
  ShoppingBag,
} from "lucide-react";

// Toast Component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-800 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "info":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 20 }}
      className={`fixed bottom-6 right-6 z-50 ${getStyles()} px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md backdrop-blur-sm`}
      role="status"
    >
      <span className="text-xl">{getIcon()}</span>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [viewingImage, setViewingImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    price: "",
    stock: "",
    image: "",
  });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();

      if (res.ok && data.success) {
        setProducts(data.data);
      } else {
        showToast(data.message || "Failed to fetch products", "error");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      showToast(
        "Failed to fetch products. Please check your connection.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      showToast("Please upload a valid image (JPG, PNG, WebP, GIF)", "error");
      return;
    }

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFormData((prev) => ({ ...prev, image: data.data.url }));
        setImagePreview(data.data.url);
        showToast("Image uploaded successfully!", "success");
      } else {
        showToast(data.error ? `${data.message}: ${data.error}` : data.message || "Failed to upload image", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      description: "",
      price: "",
      stock: "",
      image: "",
    });
    setImagePreview(null);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate form
    if (!formData.name.trim()) {
      showToast("Product name is required", "error");
      setSubmitting(false);
      return;
    }
    if (!formData.categoryId) {
      showToast("Please select a category", "error");
      setSubmitting(false);
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      showToast("Please enter a valid price", "error");
      setSubmitting(false);
      return;
    }
    const stock = parseInt(formData.stock, 10);
    if (isNaN(stock) || stock < 0) {
      showToast("Please enter a valid stock quantity", "error");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        description: formData.description.trim() || null,
        price: price,
        stock: stock,
        image: formData.image || null,
      };

      let response;
      if (editingId) {
        response = await fetch(`/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(
          editingId
            ? "Product updated successfully! 🎉"
            : "Product created successfully! 🎉",
          "success",
        );
        setShowForm(false);
        resetForm();
        await fetchProducts();
      } else {
        showToast(data.message || "Failed to save product", "error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      image: product.image || "",
    });
    setImagePreview(product.image || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Product deleted successfully!", "success");
        await fetchProducts();
      } else {
        showToast(data.message || "Failed to delete product", "error");
      }
    } catch {
      showToast("Failed to delete product", "error");
    }
  };

  const handleArchive = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !product.archived }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(
          product.archived
            ? "Product unarchived successfully!"
            : "Product archived successfully!",
          "success",
        );
        await fetchProducts();
      } else {
        showToast(data.message || "Failed to update product", "error");
      }
    } catch {
      showToast("Failed to update product", "error");
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => !p.archived).length;
  const lowStockProducts = products.filter(
    (p) => p.stock <= 5 && !p.archived,
  ).length;
  const lowStockItems = products.filter(
    (p) => p.stock <= 5 && !p.archived,
  );
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const filterCategories = [
    { id: "all", name: "All Categories" },
    ...categories,
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Products Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
              if (!showForm) window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bg-linear-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </motion.button>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
        >
          {[
            {
              label: "Total Products",
              value: totalProducts,
              icon: Package,
              color: "from-blue-500 to-blue-600",
            },
            {
              label: "Active Products",
              value: activeProducts,
              icon: ShoppingBag,
              color: "from-green-500 to-green-600",
            },
            {
              label: "Low Stock Alert",
              value: lowStockProducts,
              icon: AlertCircle,
              color: "from-yellow-500 to-yellow-600",
            },
            {
              label: "Total Value",
              value: formatCurrency(totalValue),
              icon: DollarSign,
              color: "from-purple-500 to-purple-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg bg-linear-to-r ${stat.color} text-white`}
                >
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₱) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      placeholder="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-1 w-full">
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-400 transition-colors hover:bg-pink-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingImage ? (
                            <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                          ) : (
                            <Upload size={28} className="text-gray-400 mb-2" />
                          )}
                          <p className="text-sm text-gray-500">
                            {uploadingImage
                              ? "Uploading..."
                              : "Click to upload image"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG, WebP (max 5MB)
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <AnimatePresence>
                      {imagePreview && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative"
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-xl border-2 border-pink-200"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X size={16} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="bg-linear-to-r from-pink-600 to-purple-600 text-white px-8 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : editingId ? (
                      "Update Product"
                    ) : (
                      "Save Product"
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition bg-white"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter size={20} className="text-gray-500" />
            <span className="text-gray-700">Filter</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={fetchProducts}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
              <div className="flex flex-wrap gap-3">
                {filterCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-linear-to-r from-pink-600 to-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first product"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`transition-colors ${
                      product.stock <= 5
                        ? "bg-red-50 hover:bg-red-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      {product.image ? (
                        <button
                          type="button"
                          onClick={() =>
                            setViewingImage({
                              src: product.image,
                              alt: product.name,
                            })
                          }
                          className="cursor-pointer"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 hover:scale-110 hover:shadow-md transition-all"
                          />
                        </button>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-400 line-clamp-1 md:hidden">
                        {product.category?.name ?? product.categoryId}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">
                        {product.category?.name ?? product.categoryId}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-pink-600">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.stock <= 5
                            ? "bg-red-100 text-red-800"
                            : product.stock <= 10
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {product.archived ? (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                          Archived
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleArchive(product.id)}
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
                          title={product.archived ? "Unarchive" : "Archive"}
                        >
                          <Archive size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500"
      >
        <div>
          Showing {filteredProducts.length} of {products.length} products
        </div>
        <div className="flex items-center gap-4">
          <span>🟢 Active: {activeProducts}</span>
          <span>🔴 Archived: {products.length - activeProducts}</span>
          <button
            onClick={() => setShowLowStockModal(true)}
            className="cursor-pointer hover:text-orange-600 transition-colors font-medium"
          >
            ⚠️ Low Stock: {lowStockProducts}
          </button>
        </div>
      </motion.div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewingImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewingImage(null)}
                className="absolute -top-3 -right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
              <img
                src={viewingImage.src}
                alt={viewingImage.alt}
                className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]"
              />
              <div className="text-center mt-3 text-white font-medium text-lg drop-shadow">
                {viewingImage.alt}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low Stock Modal */}
      <AnimatePresence>
        {showLowStockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLowStockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <AlertCircle size={22} className="text-orange-500" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Low Stock Products
                  </h2>
                </div>
                <button
                  onClick={() => setShowLowStockModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[60vh]">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
                    <p className="font-medium">All products are well stocked!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowStockItems.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                            <ImageIcon size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {product.category?.name ?? product.categoryId}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              product.stock === 0
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {product.stock === 0
                              ? "Out of Stock"
                              : `${product.stock} left`}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function for currency formatting (if not imported)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

