"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
  ChevronRight,
  Crown,
  Users,
  ShoppingBag,
  Star,
  ArrowRight,
  UserPlus,
  LogIn,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "staff" as "admin" | "staff" | "cashier",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
    name: false,
    phone: false,
    confirmPassword: false,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<
    Array<{
      x: number;
      y: number;
      size: number;
      duration: number;
      delay: number;
    }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message);
        setIsLoading(false);
        return;
      }

      const userData = {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        role: result.data.role,
      };

      localStorage.setItem("sweet-bites-user", JSON.stringify(userData));

      toast.success("Welcome back, " + result.data.name + "!");

      const role = result.data.role;
      if (role === "admin") router.push("/admin/dashboard");
      else if (role === "staff") router.push("/admin/dashboard");
      else if (role === "cashier") router.push("/admin/dashboard");
      else router.push("/");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (registerData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
          role: registerData.role,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message);
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! You can now log in.");
      setMode("login");
      setLoginData({ email: registerData.email, password: "" });
      setRegisterData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "staff",
      });
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const FloatingParticles = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white/20 backdrop-blur-sm"
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            y: [`${particle.y}%`, `${particle.y - 30}%`, `${particle.y}%`],
            x: [`${particle.x}%`, `${particle.x + 15}%`, `${particle.x}%`],
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
          style={{ width: particle.size, height: particle.size }}
        />
      ))}
    </div>
  );

  const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"
        animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );

  const FloatingShapes = () => {
    const shapes = [
      { emoji: "\u{1F370}", x: "10%", y: "20%", delay: 0 },
      { emoji: "\u{1F382}", x: "85%", y: "15%", delay: 2 },
      { emoji: "\u{1F9C1}", x: "15%", y: "75%", delay: 4 },
      { emoji: "\u{1F36A}", x: "88%", y: "70%", delay: 1 },
      { emoji: "\u{2615}", x: "5%", y: "50%", delay: 3 },
      { emoji: "\u{1F950}", x: "92%", y: "45%", delay: 5 },
    ];

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {shapes.map((shape, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl md:text-5xl opacity-20"
            style={{ left: shape.x, top: shape.y }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              delay: shape.delay,
              ease: "easeInOut",
            }}
          >
            {shape.emoji}
          </motion.div>
        ))}
      </div>
    );
  };

  const inputClass = (field: string) =>
    `w-full py-4 pl-12 pr-4 rounded-xl bg-white/5 backdrop-blur-sm border transition-all duration-300 focus:outline-none text-white placeholder-transparent ${
      isFocused[field as keyof typeof isFocused]
        ? "border-pink-400 ring-2 ring-pink-400/30 bg-white/10"
        : "border-white/20 hover:border-white/30"
    }`;

  const labelClass = (field: string, value: string) =>
    `absolute left-12 transition-all duration-300 pointer-events-none text-white/50 ${
      isFocused[field as keyof typeof isFocused] || value
        ? "-top-2 text-xs text-pink-300 font-medium bg-linear-to-br from-pink-600 via-purple-600 to-indigo-700 px-2 py-0.5 rounded"
        : "top-1/2 -translate-y-1/2 text-sm"
    }`;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-linear-to-br from-pink-600 via-purple-600 to-indigo-700"
    >
      <AnimatedBackground />
      <FloatingParticles />
      <FloatingShapes />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
          }}
          className="relative w-full max-w-md"
        >
          <motion.div
            className="absolute -inset-1 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl blur-2xl opacity-30"
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            <div className="relative p-8 md:p-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mb-6"
              >
                <motion.div
                  className="inline-block mb-4"
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-linear-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-50" />
                    <div className="relative text-6xl md:text-7xl">{"\u{1F370}"}</div>
                  </div>
                </motion.div>

                <motion.h1
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Sweet Bites
                </motion.h1>

                <motion.div
                  className="flex items-center justify-center gap-2 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Shield className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm text-white/80 font-medium">
                    {mode === "login" ? "Admin Dashboard" : "Create Staff Account"}
                  </p>
                </motion.div>
              </motion.div>

              {/* Mode Toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex mb-6 bg-white/5 rounded-xl p-1 border border-white/10"
              >
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === "login"
                      ? "bg-pink-600 text-white shadow-lg"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === "register"
                      ? "bg-pink-600 text-white shadow-lg"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </button>
              </motion.div>

              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLogin}
                    className="space-y-5"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white/80 transition-colors z-10">
                          <Mail className="h-5 w-5" />
                        </div>
                        <input
                          type="email"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData({ ...loginData, email: e.target.value })
                          }
                          onFocus={() => setIsFocused({ ...isFocused, email: true })}
                          onBlur={() => setIsFocused({ ...isFocused, email: false })}
                          placeholder=" "
                          required
                          className={inputClass("email")}
                        />
                        <label className={labelClass("email", loginData.email)}>
                          Email Address
                        </label>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white/80 transition-colors z-10">
                          <Lock className="h-5 w-5" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({ ...loginData, password: e.target.value })
                          }
                          onFocus={() => setIsFocused({ ...isFocused, password: true })}
                          onBlur={() => setIsFocused({ ...isFocused, password: false })}
                          placeholder=" "
                          required
                          className={inputClass("password")}
                        />
                        <label className={labelClass("password", loginData.password)}>
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors z-10"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        className={`relative w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 ${
                          isLoading
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-pink-600 via-purple-600 to-indigo-600" />
                        <motion.div
                          className="absolute inset-0 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0"
                          animate={{ opacity: isHovered && !isLoading ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                          animate={{
                            translateX: isHovered && !isLoading ? "200%" : "-100%",
                          }}
                          transition={{ duration: 0.8 }}
                        />
                        <span className="relative flex items-center justify-center gap-2">
                          {isLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Authenticating...
                            </>
                          ) : (
                            <>
                              Login to Dashboard
                              <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`} />
                            </>
                          )}
                        </span>
                      </motion.button>
                    </motion.div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleRegister}
                    className="space-y-4"
                  >
                    {/* Name */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white/80 transition-colors z-10">
                          <Users className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          value={registerData.name}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, name: e.target.value })
                          }
                          onFocus={() => setIsFocused({ ...isFocused, name: true })}
                          onBlur={() => setIsFocused({ ...isFocused, name: false })}
                          placeholder=" "
                          required
                          className={inputClass("name")}
                        />
                        <label className={labelClass("name", registerData.name)}>
                          Full Name
                        </label>
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white/80 transition-colors z-10">
                          <Mail className="h-5 w-5" />
                        </div>
                        <input
                          type="email"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, email: e.target.value })
                          }
                          onFocus={() => setIsFocused({ ...isFocused, email: true })}
                          onBlur={() => setIsFocused({ ...isFocused, email: false })}
                          placeholder=" "
                          required
                          className={inputClass("email")}
                        />
                        <label className={labelClass("email", registerData.email)}>
                          Email Address
                        </label>
                      </div>
                    </motion.div>

                    {/* Phone */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white/80 transition-colors z-10">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                        </div>
                        <input
                          type="tel"
                          value={registerData.phone}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, phone: e.target.value })
                          }
                          onFocus={() => setIsFocused({ ...isFocused, phone: true })}
                          onBlur={() => setIsFocused({ ...isFocused, phone: false })}
                          placeholder=" "
                          className={inputClass("phone")}
                        />
                        <label className={labelClass("phone", registerData.phone)}>
                          Phone (optional)
                        </label>
                      </div>
                    </motion.div>

                    {/* Role Selector */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label className="block text-xs text-white/50 mb-2 ml-1">Role</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["admin", "staff", "cashier"] as const).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setRegisterData({ ...registerData, role })}
                            className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                              registerData.role === role
                                ? "bg-pink-600 border-pink-500 text-white shadow-lg"
                                : "bg-white/5 border-white/20 text-white/60 hover:border-white/40 hover:text-white/80"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              {role === "admin" && <Crown className="h-4 w-4" />}
                              {role === "staff" && <Users className="h-4 w-4" />}
                              {role === "cashier" && <ShoppingBag className="h-4 w-4" />}
                              {role}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Password */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white/80 transition-colors z-10">
                          <Lock className="h-5 w-5" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, password: e.target.value })
                          }
                          onFocus={() => setIsFocused({ ...isFocused, password: true })}
                          onBlur={() => setIsFocused({ ...isFocused, password: false })}
                          placeholder=" "
                          required
                          className={inputClass("password")}
                        />
                        <label className={labelClass("password", registerData.password)}>
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors z-10"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white/80 transition-colors z-10">
                          <Lock className="h-5 w-5" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={registerData.confirmPassword}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              confirmPassword: e.target.value,
                            })
                          }
                          onFocus={() =>
                            setIsFocused({ ...isFocused, confirmPassword: true })
                          }
                          onBlur={() =>
                            setIsFocused({ ...isFocused, confirmPassword: false })
                          }
                          placeholder=" "
                          required
                          className={inputClass("confirmPassword")}
                        />
                        <label
                          className={labelClass("confirmPassword", registerData.confirmPassword)}
                        >
                          Confirm Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors z-10"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        className={`relative w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 ${
                          isLoading
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-pink-600 via-purple-600 to-indigo-600" />
                        <motion.div
                          className="absolute inset-0 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0"
                          animate={{ opacity: isHovered && !isLoading ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                          animate={{
                            translateX: isHovered && !isLoading ? "200%" : "-100%",
                          }}
                          transition={{ duration: 0.8 }}
                        />
                        <span className="relative flex items-center justify-center gap-2">
                          {isLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Create Account
                            </>
                          )}
                        </span>
                      </motion.button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Footer link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-center"
              >
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors text-sm group"
                >
                  <ChevronRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Sweet Bites
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
