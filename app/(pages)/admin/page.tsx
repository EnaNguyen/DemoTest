
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// AdminLayout is provided by the admin segment layout (app/(pages)/admin/layout.tsx)
import { StatsCards } from "@/components/cards/StatsCards";
import AdminDashboard from "./dashboards/AdminDashboard"; // Client Component
import { useAuth } from "@/app/contexts/AuthContext";

export default function AdminPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/admin/authAdmin");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/");
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Chào mừng quay lại, Admin!</p>
      </div>
      <StatsCards />
      <AdminDashboard />
      {/* <div>
        <h2 className="text-2xl font-bold mb-4">Khách sạn mới đăng ký</h2>
        <HotelList />
      </div> */}
    </div>
  );
}