"use client";

import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ShoppingBag,
  Star,
  Truck,
  Clock,
  ChevronRight,
  Sparkles,
  Heart,
  ShoppingCart,
  Search,
  Menu,
  X,
  Award,
  ThumbsUp,
  ArrowUpRight,
  Play,
  Coffee,
  Cake,
  Cookie,
  GlassWater,
  Pizza,
  IceCream,
  LogIn,
  User,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  KeyRound,
  Shield,
  Crown,
  Gift,
  Phone,
  Store,
  Users,
  LayoutDashboard,
} from "lucide-react";
import type { CartItem, Product } from "@/lib/types";

const categoryIcons: Record<string, typeof Cake> = {
  cakes: Cake,
  cupcakes: Coffee,
  cheesecakes: Cookie,
  cookies: Cookie,
  desserts: IceCream,
  drinks: GlassWater,
  snacks: Pizza,
  meals: Coffee,
};

// Enhanced category data with icons
const categories = [
  { name: "Cakes", icon: Cake, color: "from-pink-500 to-rose-500" },
  { name: "Cupcakes", icon: Coffee, color: "from-purple-500 to-indigo-500" },
  { name: "Cheesecakes", icon: Cookie, color: "from-amber-500 to-orange-500" },
  { name: "Cookies", icon: Cookie, color: "from-amber-600 to-yellow-600" },
  { name: "Desserts", icon: IceCream, color: "from-emerald-500 to-teal-500" },
  { name: "Drinks", icon: GlassWater, color: "from-blue-500 to-cyan-500" },
  { name: "Snacks", icon: Pizza, color: "from-rose-500 to-red-500" },
  { name: "Meals", icon: Coffee, color: "from-violet-500 to-purple-500" },
];

const floatingParticles = Array.from({ length: 20 }, (_, id) => ({
  id,
  x: (id * 37 + 11) % 100,
  y: (id * 53 + 7) % 100,
  size: 2 + ((id * 7) % 5),
  duration: 10 + ((id * 13) % 11),
  delay: (id * 3) % 5,
}));

// Floating particles for background
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {floatingParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            y: [`${particle.y}%`, `${particle.y - 20}%`, `${particle.y}%`],
            x: [`${particle.x}%`, `${particle.x + 10}%`, `${particle.x}%`],
            scale: [0, 1, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
          style={{
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}
    </div>
  );
};

// Animated Counter Component
type AnimatedCounterProps = {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
};

const AnimatedCounter = ({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-gray-900">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </div>
  );
};

// Parallax Section Component
type ParallaxSectionProps = {
  children: ReactNode;
  speed?: number;
  className?: string;
};

const ParallaxSection = ({
  children,
  speed = 0.5,
  className = "",
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50 * speed]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

// 3D Tilt Card Component
type TiltCardProps = {
  children: ReactNode;
  className?: string;
};

const TiltCard = ({ children, className = "" }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotateX(rotateX);
    setRotateY(rotateY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.1s ease-out",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

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
      className={`fixed bottom-6 left-6 z-50 ${getStyles()} px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-md`}
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

// Floating Label Input Component
const FloatingInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  required = false,
  className = "",
  maxLength,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ElementType;
  required?: boolean;
  className?: string;
  maxLength?: number;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    setHasValue(value.length > 0);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-colors duration-200 z-10">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
          className={`
            w-full py-3 px-4 border rounded-xl 
            bg-gray-50/50 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent
            ${Icon ? "pl-10" : "pl-4"}
            ${isFocused || hasValue ? "pt-5 pb-2" : ""}
            border-gray-200
          `}
          required={required}
          placeholder=" "
        />
        <label
          htmlFor={id}
          className={`
            absolute left-4 transition-all duration-200 pointer-events-none
            ${Icon ? "left-10" : "left-4"}
            ${
              isFocused || hasValue
                ? "text-xs top-1.5 text-pink-600 font-medium"
                : "text-gray-500 top-1/2 transform -translate-y-1/2"
            }
          `}
        >
          {label}
        </label>
      </div>
    </div>
  );
};

// Role Badge Component
const RoleBadge = ({ role }: { role: string }) => {
  const roleConfig = {
    admin: {
      icon: Shield,
      color: "bg-purple-100 text-purple-700",
      label: "Admin",
    },
    staff: { icon: Users, color: "bg-blue-100 text-blue-700", label: "Staff" },
    cashier: {
      icon: Store,
      color: "bg-green-100 text-green-700",
      label: "Cashier",
    },
    customer: {
      icon: User,
      color: "bg-pink-100 text-pink-700",
      label: "Customer",
    },
  };

  const config =
    roleConfig[role as keyof typeof roleConfig] || roleConfig.customer;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

// Premium Auth Modal Component
const AuthModal = ({
  isOpen,
  onClose,
  onLogin,
  productName,
  onShowToast,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
  productName?: string;
  onShowToast: (message: string, type: "success" | "error" | "info") => void;
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [selectedRole, setSelectedRole] = useState("customer");

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<
    "none" | "email" | "code" | "reset" | "done"
  >("none");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotGeneratedCode, setForgotGeneratedCode] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const resetForgotState = () => {
    setForgotStep("none");
    setForgotEmail("");
    setForgotCode("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotGeneratedCode("");
    setForgotError("");
  };

  useEffect(() => {
    resetForgotState();
  }, [isOpen]);

  const handleForgotRequestCode = async () => {
    setForgotLoading(true);
    setForgotError("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const result = await res.json();
      if (!res.ok) {
        setForgotError(result.message);
        setForgotLoading(false);
        return;
      }
      setForgotGeneratedCode(result.code);
      setForgotStep("code");
    } catch {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyCode = () => {
    if (forgotCode !== forgotGeneratedCode) {
      setForgotError("Invalid code. Please check and try again.");
      return;
    }
    setForgotError("");
    setForgotStep("reset");
  };

  const handleForgotResetPassword = async () => {
    if (forgotNewPassword.length < 8) {
      setForgotError("Password must be at least 8 characters.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotCode,
          newPassword: forgotNewPassword,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setForgotError(result.message);
        setForgotLoading(false);
        return;
      }
      setForgotStep("done");
      onShowToast(
        "Password reset successfully! You can now sign in.",
        "success",
      );
    } catch {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message);
        onShowToast(result.message, "error");
        setIsLoading(false);
        return;
      }

      const userData = {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        phone: result.data.phone || "",
        role: result.data.role || "customer",
        profilePicture: result.data.profilePicture || null,
        address: result.data.address || null,
        employeeNumber: result.data.employeeNumber || null,
        birthDate: result.data.birthDate || null,
        gender: result.data.gender || null,
        dateHired: result.data.dateHired || null,
      };

      localStorage.setItem("sweet-bites-user", JSON.stringify(userData));
      setSuccess(`Welcome back, ${userData.name}! Redirecting...`);
      onShowToast(`Welcome back, ${userData.name}! 🎉`, "success");

      setTimeout(() => {
        onLogin(userData);
        onClose();
        setIsLoading(false);
      }, 1000);
    } catch {
      setError("Something went wrong. Please try again.");
      onShowToast("Something went wrong. Please try again.", "error");
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords do not match");
      onShowToast("Passwords do not match", "error");
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions");
      onShowToast("Please agree to the terms and conditions", "error");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          phone: registerPhone,
          password: registerPassword,
          role: selectedRole,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message);
        onShowToast(result.message, "error");
        setIsLoading(false);
        return;
      }

      const userData = {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        phone: result.data.phone || "",
        role: result.data.role || "customer",
        profilePicture: result.data.profilePicture || null,
        address: result.data.address || null,
        employeeNumber: result.data.employeeNumber || null,
        birthDate: result.data.birthDate || null,
        gender: result.data.gender || null,
        dateHired: result.data.dateHired || null,
      };

      localStorage.setItem("sweet-bites-user", JSON.stringify(userData));
      setSuccess(`Account created! Welcome, ${userData.name}!`);
      onShowToast(`Account created successfully! 🎉`, "success");

      setTimeout(() => {
        onLogin(userData);
        onClose();
        setIsLoading(false);
      }, 1000);
    } catch {
      setError("Something went wrong. Please try again.");
      onShowToast("Something went wrong. Please try again.", "error");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  // Check if registration form is valid
  const isRegisterFormValid = () => {
    return (
      registerName.trim() !== "" &&
      registerEmail.trim() !== "" &&
      registerPhone.trim() !== "" &&
      registerPassword.length >= 8 &&
      registerConfirmPassword.length >= 8 &&
      registerPassword === registerConfirmPassword &&
      agreeToTerms
    );
  };

  const roles = [{ value: "customer", label: "Customer", icon: User }];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Premium Gradient Header */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500" />

            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl" />

            <div className="relative p-6 pt-8">
              {/* Header with logo and close */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-linear-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">🍰</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      C & J Sweet Bites
                    </h2>
                    <p className="text-xs text-gray-500">Premium Pastries</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                    isLogin
                      ? "bg-white shadow-md text-pink-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                    !isLogin
                      ? "bg-white shadow-md text-purple-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Create Account
                </motion.button>
              </div>

              {/* Product context */}
              {productName && isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-linear-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-xl flex items-center gap-3"
                >
                  <Gift className="h-5 w-5 text-pink-500 shrink-0" />
                  <p className="text-sm text-gray-700">
                    Sign in to add <strong>"{productName}"</strong> to your cart
                  </p>
                </motion.div>
              )}

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-start gap-2"
                  >
                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form */}
              {isLogin ? (
                forgotStep !== "none" ? (
                  <div className="space-y-4">
                    {/* Step 0: Enter Email */}
                    {forgotStep === "email" && (
                      <>
                        <div className="text-center mb-2">
                          <Lock className="h-10 w-10 text-pink-500 mx-auto mb-2" />
                          <p className="text-sm font-bold text-gray-800">
                            Reset your password
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Enter your email and we'll send you a reset code
                          </p>
                        </div>
                        <FloatingInput
                          id="forgot-email"
                          label="Email Address"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          icon={Mail}
                          required
                        />
                        {forgotError && (
                          <p className="text-sm text-red-500 text-center">
                            {forgotError}
                          </p>
                        )}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleForgotRequestCode}
                          disabled={forgotLoading || !forgotEmail}
                          className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-70"
                        >
                          {forgotLoading
                            ? "Sending code..."
                            : "Send Reset Code"}
                        </motion.button>
                        <button
                          type="button"
                          onClick={resetForgotState}
                          className="w-full text-center text-sm text-gray-500 hover:text-pink-600 transition-colors"
                        >
                          Back to sign in
                        </button>
                      </>
                    )}

                    {/* Step 1: Enter Code */}
                    {forgotStep === "code" && (
                      <>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                          <p className="text-sm text-blue-700 font-medium mb-1">
                            Verification Code
                          </p>
                          <p className="text-xs text-blue-500">
                            Your 6-digit code is shown below (demo mode — no
                            email sent)
                          </p>
                          <p className="text-2xl font-mono font-bold text-blue-800 mt-2 tracking-[0.3em]">
                            {forgotGeneratedCode}
                          </p>
                        </div>
                        <FloatingInput
                          id="forgot-code"
                          label="Enter 6-digit code"
                          type="text"
                          value={forgotCode}
                          onChange={(e) => setForgotCode(e.target.value)}
                          icon={KeyRound}
                          maxLength={6}
                          required
                        />
                        {forgotError && (
                          <p className="text-sm text-red-500 text-center">
                            {forgotError}
                          </p>
                        )}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleForgotVerifyCode}
                          className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all"
                        >
                          Verify Code
                        </motion.button>
                        <button
                          type="button"
                          onClick={resetForgotState}
                          className="w-full text-center text-sm text-gray-500 hover:text-pink-600 transition-colors"
                        >
                          Back to sign in
                        </button>
                      </>
                    )}

                    {/* Step 2: New Password */}
                    {forgotStep === "reset" && (
                      <>
                        <div className="text-center mb-2">
                          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Code verified! Set your new password.
                          </p>
                        </div>
                        <div className="relative">
                          <FloatingInput
                            id="forgot-new-password"
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={forgotNewPassword}
                            onChange={(e) =>
                              setForgotNewPassword(e.target.value)
                            }
                            icon={Lock}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {forgotNewPassword.length > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`h-1.5 flex-1 rounded-full ${forgotNewPassword.length >= 8 ? "bg-green-400" : forgotNewPassword.length >= 5 ? "bg-yellow-400" : "bg-red-400"}`}
                            />
                            <span
                              className={
                                forgotNewPassword.length >= 8
                                  ? "text-green-600"
                                  : forgotNewPassword.length >= 5
                                    ? "text-yellow-600"
                                    : "text-red-500"
                              }
                            >
                              {forgotNewPassword.length >= 8
                                ? "Strong"
                                : forgotNewPassword.length >= 5
                                  ? "Medium"
                                  : "Weak"}
                            </span>
                          </div>
                        )}
                        <div className="relative">
                          <FloatingInput
                            id="forgot-confirm-password"
                            label="Confirm New Password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={forgotConfirmPassword}
                            onChange={(e) =>
                              setForgotConfirmPassword(e.target.value)
                            }
                            icon={Lock}
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {forgotConfirmPassword.length > 0 && (
                          <p
                            className={`text-xs text-center ${forgotNewPassword === forgotConfirmPassword ? "text-green-500" : "text-red-500"}`}
                          >
                            {forgotNewPassword === forgotConfirmPassword
                              ? "Passwords match"
                              : "Passwords do not match"}
                          </p>
                        )}
                        {forgotError && (
                          <p className="text-sm text-red-500 text-center">
                            {forgotError}
                          </p>
                        )}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleForgotResetPassword}
                          disabled={forgotLoading}
                          className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-70"
                        >
                          {forgotLoading ? "Resetting..." : "Reset Password"}
                        </motion.button>
                        <button
                          type="button"
                          onClick={resetForgotState}
                          className="w-full text-center text-sm text-gray-500 hover:text-pink-600 transition-colors"
                        >
                          Back to sign in
                        </button>
                      </>
                    )}

                    {/* Step 3: Done */}
                    {forgotStep === "done" && (
                      <>
                        <div className="text-center py-4">
                          <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" />
                          <p className="text-lg font-bold text-gray-800">
                            Password Reset!
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            You can now sign in with your new password.
                          </p>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetForgotState}
                          className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all"
                        >
                          Back to Sign In
                        </motion.button>
                      </>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <FloatingInput
                      id="login-email"
                      label="Email Address"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      icon={Mail}
                      required
                    />

                    <div className="relative">
                      <FloatingInput
                        id="login-password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        icon={Lock}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        Remember me
                      </label>
                      <button
                        type="button"
                        className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
                        onClick={() => {
                          resetForgotState();
                          setForgotEmail(loginEmail);
                          setForgotStep("email");
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                      className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        "Sign In"
                      )}
                    </motion.button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">
                          or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        <span className="text-sm font-medium">Google</span>
                      </motion.button>
                    </div>
                  </form>
                )
              ) : (
                // Register Form
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <FloatingInput
                      id="register-name"
                      label="Full Name"
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      icon={User}
                      required
                    />
                    <div className="relative">
                      <FloatingInput
                        id="register-phone"
                        label="Phone Number"
                        type="tel"
                        value={registerPhone}
                        icon={Phone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <FloatingInput
                    id="register-email"
                    label="Email Address"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    icon={Mail}
                    required
                  />

                  <div className="relative">
                    <FloatingInput
                      id="register-password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      icon={Lock}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <FloatingInput
                      id="register-confirm-password"
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerConfirmPassword}
                      onChange={(e) =>
                        setRegisterConfirmPassword(e.target.value)
                      }
                      icon={Shield}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-xl border border-pink-200 text-pink-700">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Registering as Customer
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      required
                    />
                    <label className="text-sm text-gray-600">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="text-purple-600 hover:underline font-medium"
                        onClick={() =>
                          onShowToast(
                            "Terms & Conditions coming soon! 📝",
                            "info",
                          )
                        }
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="text-purple-600 hover:underline font-medium"
                        onClick={() =>
                          onShowToast("Privacy Policy coming soon! 🔒", "info")
                        }
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={isRegisterFormValid() ? { scale: 1.02 } : {}}
                    whileTap={isRegisterFormValid() ? { scale: 0.98 } : {}}
                    disabled={!isRegisterFormValid() || isLoading}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                      isRegisterFormValid() && !isLoading
                        ? "bg-linear-to-r from-purple-600 to-indigo-600 text-white hover:shadow-xl"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      "Create Customer Account"
                    )}
                  </motion.button>

                  {!isRegisterFormValid() && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-500 text-center"
                    >
                      {!agreeToTerms
                        ? "✓ Please agree to the Terms of Service and Privacy Policy"
                        : !registerName.trim()
                          ? "✓ Please enter your full name"
                          : !registerEmail.trim()
                            ? "✓ Please enter your email address"
                            : !registerPhone.trim()
                              ? "✓ Please enter your phone number"
                              : registerPassword.length < 8
                                ? "✓ Password must be at least 8 characters"
                                : registerConfirmPassword.length < 8
                                  ? "✓ Please confirm your password"
                                  : registerPassword !== registerConfirmPassword
                                    ? "✓ Passwords do not match"
                                    : "✓ Please complete all fields"}
                    </motion.p>
                  )}

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Crown className="h-3 w-3 text-yellow-500" />
                    <span>Join 10,000+ happy customers</span>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [siteStats, setSiteStats] = useState({
    happyCustomers: 0,
    deliciousTreats: 0,
    ordersDelivered: 0,
    fiveStarReviews: 0,
    yearsOfExcellence: 0,
  });

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok && data.success) {
          setProducts(data.data.filter((p: Product) => !p.archived));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success) setSiteStats(data.data);
      } catch {}
    };
    fetchStats();
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const user = localStorage.getItem("sweet-bites-user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setUserRole(userData.role || "customer");
      } catch {
        localStorage.removeItem("sweet-bites-user");
      }
    }
  }, []);

  useEffect(() => {
    const storedCart = window.localStorage.getItem("sweet-bites-cart");

    if (!storedCart) return undefined;

    try {
      const savedItems = JSON.parse(storedCart) as CartItem[];
      const timeoutId = window.setTimeout(() => setCartItems(savedItems), 0);
      return () => window.clearTimeout(timeoutId);
    } catch {
      window.localStorage.removeItem("sweet-bites-cart");
      return undefined;
    }
  }, []);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory ||
      product.categoryId === selectedCategory.toLowerCase();
    const matchesSearch =
      !normalizedSearchQuery ||
      product.name.toLowerCase().includes(normalizedSearchQuery) ||
      product.description.toLowerCase().includes(normalizedSearchQuery);

    return matchesCategory && matchesSearch;
  });

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      setPendingProduct(product);
      setIsAuthModalOpen(true);
      return;
    }

    addProductToCart(product);
  };

  const addProductToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast(`Sorry, "${product.name}" is out of stock! 😢`, "error");
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === product.id,
      );

      if (existingItem && existingItem.quantity + 1 > product.stock) {
        showToast(`Only ${product.stock} left in stock! 🚫`, "error");
        return currentItems;
      }

      const updatedItems = existingItem
        ? currentItems.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [
            ...currentItems,
            { productId: product.id, quantity: 1, price: product.price },
          ];

      window.localStorage.setItem(
        "sweet-bites-cart",
        JSON.stringify(updatedItems),
      );
      window.dispatchEvent(new Event("cart-updated"));
      showToast(`${product.name} added to your cart! 🎉`, "success");
      return updatedItems;
    });
  };

  const handleLoginSuccess = (user: any) => {
    setIsAuthenticated(true);
    setUserRole(user.role || "customer");

    if (pendingProduct) {
      addProductToCart(pendingProduct);
      setPendingProduct(null);
    }

    // Redirect based on role
    const role = user?.role || "customer";
    const roleRoutes: Record<string, string> = {
      admin: "/admin/dashboard",
      staff: "/staff/dashboard",
      cashier: "/cashier/dashboard",
      customer: "/",
    };

    const redirectPath = roleRoutes[role] || "/";
    if (redirectPath !== "/") {
      router.push(redirectPath);
    }
  };

  const stats = [
    { label: "Happy Customers", value: siteStats.happyCustomers || 0, suffix: "+", icon: ThumbsUp },
    { label: "Delicious Treats", value: siteStats.deliciousTreats || 0, suffix: "+", icon: Cake },
    { label: "Orders Delivered", value: siteStats.ordersDelivered || 0, suffix: "+", icon: Truck },
    { label: "5-Star Reviews", value: siteStats.fiveStarReviews || 0, suffix: "+", icon: Star },
    { label: "Years of Excellence", value: siteStats.yearsOfExcellence || 0, suffix: "+", icon: Award },
  ];

  // Role badge component for header
  const RoleBadge = ({ role }: { role: string }) => {
    const roleConfig: Record<
      string,
      { icon: any; color: string; label: string }
    > = {
      admin: {
        icon: Shield,
        color: "bg-purple-100 text-purple-700",
        label: "Admin",
      },
      staff: {
        icon: Users,
        color: "bg-blue-100 text-blue-700",
        label: "Staff",
      },
      cashier: {
        icon: Store,
        color: "bg-green-100 text-green-700",
        label: "Cashier",
      },
      customer: {
        icon: User,
        color: "bg-pink-100 text-pink-700",
        label: "Customer",
      },
    };

    const config = roleConfig[role] || roleConfig.customer;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="relative min-h-screen bg-linear-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

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

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🍰</span>
              <span className="text-xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Sweet Bites
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-gray-600 hover:text-pink-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-600 hover:text-pink-600 transition-colors"
              >
                Menu
              </Link>
              <Link
                href="#about"
                className="text-gray-600 hover:text-pink-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-gray-600 hover:text-pink-600 transition-colors"
              >
                Contact
              </Link>
              {isAuthenticated && (
                <Link
                  href="/orders"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                >
                  My Orders
                </Link>
              )}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search products"
              >
                <Search className="h-5 w-5 text-gray-600" />
              </motion.button>

              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  onClick={() => {
                    showToast("Favorites feature coming soon! ❤️", "info");
                  }}
                  aria-label="View favorites"
                >
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </motion.button>
              )}

              {isAuthenticated && (
                <Link
                  href="/cart"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  aria-label="View cart"
                >
                  <ShoppingBag className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                </Link>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white">
                      <User className="h-4 w-4" />
                    </div>
                    {userRole && <RoleBadge role={userRole} />}
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("sweet-bites-user");
                      setIsAuthenticated(false);
                      setUserRole(null);
                      showToast("You have been signed out. 👋", "info");
                    }}
                    className="text-sm text-gray-500 hover:text-pink-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden md:flex items-center gap-2 bg-linear-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              )}

              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search for cakes, desserts, and more..."
                      className="w-full pl-10 pr-24 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          router.push(
                            `/products?search=${encodeURIComponent(searchQuery.trim())}`,
                          );
                        }
                      }}
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          if (searchQuery.trim()) {
                            router.push(
                              `/products?search=${encodeURIComponent(searchQuery.trim())}`,
                            );
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-600 text-white text-sm px-3 py-1 rounded-md font-medium hover:bg-pink-700 transition-colors"
                      >
                        Search
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <Link
                  href="/"
                  className="block text-gray-600 hover:text-pink-600 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-pink-600 transition-colors"
                >
                  Menu
                </Link>
                <Link
                  href="#about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-pink-600 transition-colors"
                >
                  About
                </Link>
                <Link
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-pink-600 transition-colors"
                >
                  Contact
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    My Orders
                  </Link>
                )}

                {isAuthenticated && (
                  <>
                    <div className="flex items-center gap-2">
                      {userRole && <RoleBadge role={userRole} />}
                    </div>
                    <Link
                      href="/cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-gray-600 hover:text-pink-600 transition-colors items-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Cart ({cartCount})
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        showToast("Favorites feature coming soon! ❤️", "info");
                      }}
                      className="block text-gray-600 hover:text-pink-600 transition-colors items-center gap-2 w-full text-left"
                    >
                      <Heart className="h-4 w-4" />
                      Favorites
                    </button>
                    {userRole &&
                      (userRole === "admin" ||
                        userRole === "staff" ||
                        userRole === "cashier") && (
                        <Link
                          href={`/${userRole}/dashboard`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block text-gray-600 hover:text-pink-600 transition-colors items-center gap-2"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      )}
                  </>
                )}

                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      localStorage.removeItem("sweet-bites-user");
                      setIsAuthenticated(false);
                      setUserRole(null);
                      setIsMobileMenuOpen(false);
                      showToast("You have been signed out. 👋", "info");
                    }}
                    className="block w-full text-center bg-red-500 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="block w-full text-center bg-linear-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-pink-500 via-purple-500 to-indigo-600">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <motion.div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Freshly Baked Daily</span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Delicious Cakes
                <br />
                <span className="bg-linear-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                  Made with Love
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-white/90 mb-8 max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Indulge in our handcrafted cakes, desserts, and treats made from
                the finest ingredients. Every bite tells a story of passion and
                perfection.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link
                  href="#featured"
                  className="group bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  Order Now
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="#about"
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30"
                >
                  <Play className="h-5 w-5" />
                  Our Story
                </Link>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 gap-6 mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div>
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-white/70">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50+</div>
                  <div className="text-white/70">Delicious Treats</div>
                </div>
              </motion.div>
            </div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-linear-to-br from-pink-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
                <div className="relative grid grid-cols-2 gap-4">
                  {products.slice(0, 4).map((product, index) => (
                    <motion.div
                      key={product.id}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                      whileHover={{ scale: 1.05, y: -5 }}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        delay: index * 0.1 + 0.8,
                      }}
                    >
                      <div className="aspect-square bg-white/20 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">🍰</span>
                        )}
                      </div>
                      <div className="text-white text-sm font-medium truncate">
                        {product.name}
                      </div>
                      <div className="text-white/80 text-sm">
                        ₱{product.price}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-2xl"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Truck className="h-6 w-6 text-pink-600" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-2xl"
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  <Clock className="h-6 w-6 text-purple-600" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900">
                Featured{" "}
                <span className="bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Delights
                </span>
              </h2>
              <p className="text-gray-600 mt-2">
                Our most loved treats, freshly made daily
              </p>
            </div>
            <Link
              href="/products"
              className="text-pink-600 font-semibold flex items-center gap-2 hover:text-pink-700 transition-colors"
            >
              View All <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product, index) => (
              <TiltCard key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative h-64 bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent z-10"></div>
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-pink-600">
                        ⭐ {product.rating}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <motion.img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          animate={{
                            scale: hoveredProduct === product.id ? 1.1 : 1,
                            rotate: hoveredProduct === product.id ? 5 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <motion.div
                          className="text-6xl"
                          animate={{
                            scale: hoveredProduct === product.id ? 1.1 : 1,
                            rotate: hoveredProduct === product.id ? 5 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          🍰
                        </motion.div>
                      )}
                    </div>
                    {product.stock <= 0 && (
                      <div className="absolute top-4 right-4 z-20 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Sold Out
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <Link href={`/products/${product.id}`} className="text-pink-600 text-sm font-semibold hover:text-pink-700 transition-colors mb-3 inline-block">
                      View Details →
                    </Link>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-pink-600">
                          ₱{product.price}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{product.rating}</span>
                          <span>({product.reviews})</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-full transition-all ${
                          product.stock > 0
                            ? "bg-linear-to-r from-pink-600 to-purple-600 text-white hover:shadow-lg"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <ParallaxSection speed={0.2}>
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-pink-50 via-white to-purple-50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900">
                Browse by{" "}
                <span className="bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Category
                </span>
              </h2>
              <p className="text-gray-600 mt-2">
                Find your perfect treat from our wide selection
              </p>
            </motion.div>

            <div className="flex flex-nowrap gap-3 justify-center">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 300 },
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category.name
                          ? null
                          : category.name,
                      )
                    }
                    className={`relative group shrink-0 px-4 py-3 rounded-2xl transition-all ${
                      selectedCategory === category.name
                        ? `bg-linear-to-r ${category.color} text-white shadow-lg`
                        : "bg-white text-gray-700 hover:shadow-lg border border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-full transition-all ${
                          selectedCategory === category.name
                            ? "bg-white/20"
                            : "bg-linear-to-br from-pink-100 to-purple-100 group-hover:scale-110"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            selectedCategory === category.name
                              ? "text-white"
                              : "text-pink-600"
                          }`}
                        />
                      </div>
                      <span className="font-semibold text-sm whitespace-nowrap">
                        {category.name}
                      </span>
                      {selectedCategory === category.name && (
                        <motion.div
                          layoutId="selectedCategory"
                          className="absolute inset-0 rounded-2xl border-2 border-white/50"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🍰</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-pink-600 font-bold mt-1">
                    ₱{product.price}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 w-full bg-linear-to-r from-pink-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
            {filteredProducts.length === 0 && (
              <p className="mt-12 text-center text-gray-600">
                No treats match your search. Try a different keyword or
                category.
              </p>
            )}
          </div>
        </section>
      </ParallaxSection>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-pink-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <FloatingParticles />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-6xl mb-6"
            >
              🎂
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Order Your Sweet Bites?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get 15% off on your first order! Use code:{" "}
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-mono font-bold">
                WELCOME15
              </span>
            </p>
            <Link
              href="#featured"
              className="group bg-white text-pink-600 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-2 mx-auto"
            >
              Order Now
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <ParallaxSection speed={0.3}>
        <section className="relative py-20 bg-linear-to-br from-pink-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Sweet Bites by the Numbers
              </h2>
              <p className="text-gray-600 mt-4 text-lg">
                The love and dedication behind every treat we create
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center group"
                  >
                    <div className="inline-flex p-3 rounded-full bg-linear-to-br from-pink-100 to-purple-100 text-pink-600 mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8" />
                    </div>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    <div className="text-gray-600 font-medium mt-2">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* Footer */}
      <footer id="about" className="bg-gray-900 text-white py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div id="contact" className="scroll-mt-20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🍰</span>
                <span className="text-xl font-bold">Sweet Bites</span>
              </div>
              <p className="text-gray-400">
                Delicious homemade cakes and desserts made with love since 2020.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/menu"
                    className="hover:text-pink-500 transition-colors"
                  >
                    Menu
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-pink-500 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-pink-500 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-pink-500 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/delivery"
                    className="hover:text-pink-500 transition-colors"
                  >
                    Delivery Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="hover:text-pink-500 transition-colors"
                  >
                    Returns
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📞 (02) 8123-4567</li>
                <li>📧 hello@sweetbites.com</li>
                <li>📍 123 Sweet Street, City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Sweet Bites. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingProduct(null);
        }}
        onLogin={handleLoginSuccess}
        productName={pendingProduct?.name}
        onShowToast={showToast}
      />

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
