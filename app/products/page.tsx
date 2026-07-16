"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpDown,
  Grid3x3,
  List,
  SlidersHorizontal,
  Eye,
  Heart,
  ShoppingBag,
  Truck,
  Coffee,
  Cake,
  Cookie,
  IceCream,
  Pizza,
  GlassWater,
  Utensils,
  ShoppingCart,
  User,
  LogIn,
  Home,
  AlertCircle,
} from "lucide-react";
import { Product } from "@/lib/types";



// Category icons mapping
const categoryIcons: Record<string, any> = {
  cakes: Cake,
  cupcakes: Coffee,
  cheesecakes: IceCream,
  cookies: Cookie,
  desserts: Star,
  drinks: GlassWater,
  snacks: Pizza,
  meals: Utensils,
};

// Category colors
const categoryColors: Record<string, string> = {
  cakes: "from-pink-500 to-rose-500",
  cupcakes: "from-purple-500 to-indigo-500",
  cheesecakes: "from-amber-500 to-orange-500",
  cookies: "from-amber-600 to-yellow-600",
  desserts: "from-emerald-500 to-teal-500",
  drinks: "from-blue-500 to-cyan-500",
  snacks: "from-rose-500 to-red-500",
  meals: "from-violet-500 to-purple-500",
};

// Toast Notification Component
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
    const timer = setTimeout(onClose, 3000);
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
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 20 }}
      className={`fixed bottom-8 left-8 z-50 ${getStyles()} px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-md`}
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

// Product Card Component with enhanced design
const ProductCardEnhanced = ({
  product,
  onAddToCart,
  index,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddClick = () => {
    if (product.stock <= 0) {
      // Don't add to cart, show toast instead
      return;
    }
    onAddToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-56 bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent z-10" />

        {/* Product Image */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div
              className="text-7xl"
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              🍰
            </motion.div>
          )}
        </div>

        {/* Stock Badge */}
        {product.stock <= 0 ? (
          <div className="absolute top-3 right-3 z-20 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Out of Stock
          </div>
        ) : product.stock < 5 ? (
          <div className="absolute top-3 right-3 z-20 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Only {product.stock} left
          </div>
        ) : null}

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 z-15 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              Currently Unavailable
            </span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-pink-600 shadow-lg flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {product.rating} ({product.reviews})
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 left-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
          disabled={product.stock <= 0}
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </button>

        {/* Quick View Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          className="absolute bottom-3 right-3 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
        >
          <Eye className="h-4 w-4 text-gray-600" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-pink-600 transition-colors">
            {product.name}
          </h3>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
            {product.categoryId}
          </span>
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-pink-600">
              ₱{product.price}
            </span>
            <span className="text-xs text-gray-400 ml-1">each</span>
          </div>
          <motion.button
            whileHover={product.stock > 0 ? { scale: 1.05 } : {}}
            whileTap={product.stock > 0 ? { scale: 0.95 } : {}}
            onClick={handleAddClick}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-full transition-all ${
              product.stock > 0
                ? "bg-linear-to-r from-pink-600 to-purple-600 text-white hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Filter Modal Component
const FilterModal = ({
  isOpen,
  onClose,
  onApply,
  categories,
  selectedCategories,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
}: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat: string) => (
                    <button
                      key={cat}
                      onClick={() => {
                        // Toggle category selection
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedCategories.includes(cat)
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Price Range
                </h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="latest">Latest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "latest" | "price-low" | "price-high" | "rating" | "popular"
  >("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok && data.success) {
          setProducts(
            data.data.filter((p: Product) => !p.archived),
          );
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Load cart count from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("sweet-bites-cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        const count = parsed.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        );
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }
  }, []);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    "Cakes",
    "Cupcakes",
    "Cheesecakes",
    "Cookies",
    "Desserts",
    "Drinks",
    "Snacks",
    "Meals",
  ];

  // Filter and sort products
  let filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || p.categoryId === selectedCategory.toLowerCase();
    const matchesPriceRange =
      (!priceRange.min || p.price >= Number(priceRange.min)) &&
      (!priceRange.max || p.price <= Number(priceRange.max));
    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  // Sort products
  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === "popular") {
    filteredProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
  }

  const handleAddToCart = (product: Product) => {
    // Check if product is in stock
    if (product.stock <= 0) {
      setToast({
        message: `Sorry, "${product.name}" is currently out of stock! 😢`,
        type: "error",
      });
      return;
    }

    // Get existing cart
    const storedCart = localStorage.getItem("sweet-bites-cart");
    let cartItems = [];
    if (storedCart) {
      try {
        cartItems = JSON.parse(storedCart);
      } catch {
        cartItems = [];
      }
    }

    // Check if product already in cart
    const existingItem = cartItems.find(
      (item: any) => item.productId === product.id,
    );
    if (existingItem) {
      // Check if adding more would exceed stock
      if (existingItem.quantity + 1 > product.stock) {
        setToast({
          message: `Only ${product.stock} left in stock! 🚫`,
          type: "error",
        });
        return;
      }
      existingItem.quantity += 1;
    } else {
      cartItems.push({
        productId: product.id,
        quantity: 1,
        price: product.price,
      });
    }

    // Save to localStorage
    localStorage.setItem("sweet-bites-cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cart-updated"));

    // Update cart count
    const count = cartItems.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );
    setCartCount(count);

    // Show success notification
    setToast({
      message: `${product.name} added to cart! 🎉`,
      type: "success",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToCart = () => {
    router.push("/cart");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const goToHome = () => {
    router.push("/");
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Banner */}
      <div className="relative bg-linear-to-r from-pink-600 via-purple-600 to-indigo-600 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-3"
          >
            Our Sweet Menu 🍰
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-lg max-w-2xl mx-auto"
          >
            Discover our handcrafted cakes, desserts, and treats made with love
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Navigation Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToHome}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToCart}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors relative"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-8 sticky top-16 z-30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for cakes, desserts, drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters and Controls */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filters</span>
              </button>

              <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-pink-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-pink-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? "bg-linear-to-r from-pink-600 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.toLowerCase()] || Coffee;
              const color =
                categoryColors[cat.toLowerCase()] ||
                "from-pink-500 to-rose-500";
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isSelected ? null : cat)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? `bg-linear-to-r ${color} text-white shadow-md`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredProducts.length}
            </span>{" "}
            products
          </p>
          {filteredProducts.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort & Filter
            </motion.button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            } gap-6`}
          >
            {filteredProducts.map((product, index) => (
              <ProductCardEnhanced
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              We couldn&apos;t find any products matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                setPriceRange({ min: "", max: "" });
              }}
              className="bg-linear-to-r from-pink-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-40 p-3 bg-linear-to-r from-pink-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <ChevronDown className="h-6 w-6 rotate-180" />
            </motion.button>
          )}
        </AnimatePresence>

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

        {/* Filter Modal */}
        <FilterModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={() => {}}
          categories={categories}
          selectedCategories={selectedCategories}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
    <Footer />
    </>
  );
}
