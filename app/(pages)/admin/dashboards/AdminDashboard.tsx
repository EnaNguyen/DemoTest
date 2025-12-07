"use client";

import { PieChartCard } from "@/components/charts/PieChartCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { useUsers } from "@/app/contexts/UserContext";
import { useHotels } from "@/app/contexts/HotelContext";


const AUTO_COLORS = [
  "#3b82f6", 
  "#10b981", 
  "#f59e0b", 
  "#ef4444", 
  "#8b5cf6", 
  "#ec4899", 
  "#06b6d4", 
  "#f97316",
  "#6366f1", 
  "#14b8a6", 
  "#a855f7", 
  "#f43f5e", 
];

export default function AdminDashboard() {
  const { users } = useUsers();
  const { hotels } = useHotels();

  const roleData = [
    { name: "Admin", value: users.filter(u => u.role === "admin").length, color: "#f59e0b" },
    { name: "Chủ khách sạn", value: users.filter(u => u.role === "provider").length, color: "#8b5cf6" },
    { name: "Khách hàng", value: users.filter(u => u.role === "client").length, color: "#3b82f6" },
  ];

  const businessTypeCount: Record<string, number> = {};
  hotels.forEach(hotel => {
    hotel.businessTypes?.forEach(type => {
      businessTypeCount[type] = (businessTypeCount[type] || 0) + 1;
    });
  });

  const formatLabel = (type: string) => {
    const labels: Record<string, string> = {
      hotel: "Khách sạn",
      resort: "Resort",
      homestay: "Homestay",
      motel: "Motel",
      villa: "Villa",
      apartment: "Căn hộ",
      hostel: "Hostel",
      guesthouse: "Nhà nghỉ",
      bungalow: "Bungalow",
      capsule: "Capsule Hotel",
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const businessTypeData = Object.entries(businessTypeCount)
    .map(([type, count], index) => ({
      name: formatLabel(type),
      value: count,
      color: AUTO_COLORS[index % AUTO_COLORS.length], 
    }))
    .sort((a, b) => b.value - a.value); 

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Thống kê hệ thống HotelHub – Tự động cập nhật
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PieChartCard
          title="Phân bố vai trò người dùng"
          description="Tỷ lệ tài khoản theo vai trò"
          data={roleData}
          unit="người"
        />

        <BarChartCard
          title="Loại hình kinh doanh"
          description="Phân bố khách sạn theo loại hình"
          data={businessTypeData}
          unit="khách sạn"
        />
      </div>
    </div>
  );
}