"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X, UserCog, Camera, Eye, EyeOff } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "staff" | "cashier";
  employeeNumber: string | null;
  birthDate: string | null;
  gender: string | null;
  address: string | null;
  dateHired: string | null;
  profilePicture: string | null;
  createdAt: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "staff" as "staff" | "cashier",
  birthDate: "",
  gender: "",
  address: "",
  dateHired: "",
  profilePicture: "",
};

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Medium", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  const segments = 5;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        score <= 2 ? "text-red-500" : score <= 3 ? "text-yellow-600" : "text-green-600"
      }`}>
        {label}
      </p>
    </div>
  );
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/admin/employees");
      const result = await res.json();
      if (result.success) {
        setEmployees(result.data);
      } else {
        toast.error("Failed to load employees");
      }
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.employeeNumber &&
        emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const staffCount = employees.filter((e) => e.role === "staff").length;
  const cashierCount = employees.filter((e) => e.role === "cashier").length;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile picture must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        profilePicture: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (emp: Employee) => {
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || "",
      password: "",
      confirmPassword: "",
      role: emp.role,
      birthDate: emp.birthDate ? emp.birthDate.split("T")[0] : "",
      gender: emp.gender || "",
      address: emp.address || "",
      dateHired: emp.dateHired ? emp.dateHired.split("T")[0] : "",
      profilePicture: emp.profilePicture || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password || (!editingId)) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(true);

    try {
      if (editingId) {
        const body: Record<string, string> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          birthDate: formData.birthDate,
          gender: formData.gender,
          address: formData.address,
          dateHired: formData.dateHired,
          profilePicture: formData.profilePicture,
        };
        if (formData.password) body.password = formData.password;

        const res = await fetch(`/api/admin/employees/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await res.json();

        if (!res.ok) {
          toast.error(result.message);
          return;
        }

        toast.success("Employee updated successfully");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new employees");
          return;
        }

        const res = await fetch("/api/admin/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await res.json();

        if (!res.ok) {
          toast.error(result.message);
          return;
        }

        toast.success("Employee created successfully");
      }

      closeForm();
      fetchEmployees();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Employee Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage staff and cashier accounts
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Total Employees</p>
          <p className="text-3xl font-bold mt-2">{employees.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Staff</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">{staffCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Cashiers</p>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {cashierCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {editingId ? "Edit Employee" : "Add New Employee"}
            </h2>
            <button
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-pink-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Upload Profile Picture
                </button>
                <p className="text-xs text-gray-500">Max 2MB, JPG/PNG</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicture}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder=" "
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="peer w-full px-4 pt-5 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-all duration-200 peer-focus:translate-y-[-1.1rem] peer-focus:text-xs peer-focus:text-pink-600 peer-not-placeholder-shown:translate-y-[-1.1rem] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-600">
                  Full Name
                </label>
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder=" "
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="peer w-full px-4 pt-5 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-all duration-200 peer-focus:translate-y-[-1.1rem] peer-focus:text-xs peer-focus:text-pink-600 peer-not-placeholder-shown:translate-y-[-1.1rem] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-600">
                  Email Address
                </label>
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder=" "
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="peer w-full px-4 pt-5 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-all duration-200 peer-focus:translate-y-[-1.1rem] peer-focus:text-xs peer-focus:text-pink-600 peer-not-placeholder-shown:translate-y-[-1.1rem] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-600">
                  Phone Number
                </label>
              </div>

              {/* Role */}
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="peer w-full px-4 pt-5 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white appearance-none"
                >
                  <option value="staff">Staff</option>
                  <option value="cashier">Cashier</option>
                </select>
                <label className="absolute left-4 top-1 translate-y-0 text-xs text-gray-600 pointer-events-none">
                  Role
                </label>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Birth Date */}
              <div className="relative">
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="peer w-full px-4 pt-5 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
                />
                <label className="absolute left-4 top-1 translate-y-0 text-xs text-gray-600 pointer-events-none">
                  Birth Date
                </label>
              </div>

              {/* Gender */}
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="peer w-full px-4 pt-5 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white appearance-none"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <label className="absolute left-4 top-1 translate-y-0 text-xs text-gray-600 pointer-events-none">
                  Gender
                </label>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Date Hired */}
              <div className="relative">
                <input
                  type="date"
                  name="dateHired"
                  value={formData.dateHired}
                  onChange={handleInputChange}
                  className="peer w-full px-4 pt-5 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
                />
                <label className="absolute left-4 top-1 translate-y-0 text-xs text-gray-600 pointer-events-none">
                  Date Hired
                </label>
              </div>

              {/* Password */}
              <div className="relative md:col-span-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingId}
                    className="peer w-full px-4 pt-5 pb-1 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-all duration-200 peer-focus:translate-y-[-1.1rem] peer-focus:text-xs peer-focus:text-pink-600 peer-not-placeholder-shown:translate-y-[-1.1rem] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-600">
                    {editingId ? "New password (leave blank to keep)" : "Password"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password.length > 0 && (
                  <PasswordStrengthIndicator password={formData.password} />
                )}
                {editingId && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative md:col-span-2">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder=" "
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!editingId || formData.password.length > 0}
                    className="peer w-full px-4 pt-5 pb-1 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-all duration-200 peer-focus:translate-y-[-1.1rem] peer-focus:text-xs peer-focus:text-pink-600 peer-not-placeholder-shown:translate-y-[-1.1rem] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-600">
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-600 mt-1">Passwords match</p>
                )}
              </div>

              {/* Address - spans full width */}
              <div className="relative md:col-span-2">
                <textarea
                  name="address"
                  placeholder=" "
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={1}
                  className="peer w-full px-4 pt-5 pb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white resize-none"
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-all duration-200 peer-focus:translate-y-[-1.1rem] peer-focus:text-xs peer-focus:text-pink-600 peer-not-placeholder-shown:translate-y-[-1.1rem] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-600">
                  Address
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Update Employee"
                    : "Create Employee"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-bold">Employee #</th>
                <th className="px-6 py-3 text-left font-bold">Name</th>
                <th className="px-6 py-3 text-left font-bold">Email</th>
                <th className="px-6 py-3 text-left font-bold">Phone</th>
                <th className="px-6 py-3 text-left font-bold">Gender</th>
                <th className="px-6 py-3 text-left font-bold">Role</th>
                <th className="px-6 py-3 text-center font-bold">Date Hired</th>
                <th className="px-6 py-3 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-sm font-semibold text-gray-600">
                    {emp.employeeNumber || "-"}
                  </td>
                  <td className="px-6 py-3 font-semibold flex items-center gap-2">
                    {emp.profilePicture ? (
                      <img
                        src={emp.profilePicture}
                        alt={emp.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCog size={18} className="text-gray-400" />
                    )}
                    {emp.name}
                  </td>
                  <td className="px-6 py-3">{emp.email}</td>
                  <td className="px-6 py-3">{emp.phone || "-"}</td>
                  <td className="px-6 py-3">{emp.gender || "-"}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        emp.role === "staff"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center text-sm">
                    {formatDate(emp.dateHired)}
                  </td>
                  <td className="px-6 py-3 text-center space-x-2">
                    <button
                      onClick={() => openEditForm(emp)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id, emp.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No employees found</p>
        </div>
      )}
    </div>
  );
}
