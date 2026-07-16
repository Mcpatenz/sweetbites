import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: "blue" | "green" | "pink" | "yellow";
}

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    pink: "bg-pink-50 border-pink-200",
    yellow: "bg-yellow-50 border-yellow-200",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    pink: "text-pink-600",
    yellow: "text-yellow-600",
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-lg p-6 flex items-center gap-4`}
    >
      {icon && (
        <div className={`text-4xl ${iconColorClasses[color]}`}>{icon}</div>
      )}
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
