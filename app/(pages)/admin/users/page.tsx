"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect } from "react";
import { UserSheet } from "@/components/sheets/UserSheet";
import { useUsers } from "@/app/contexts/UserContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditUserModal } from "@/components/modals/EditUserModal";

export default function AdminUsers() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { users, updateUser, addUser } = useUsers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/admin/authAdmin");
    }
  }, [isAuthenticated, user, router]);

  const handleEditSave = async (userId: string, data: { fullName: string; email: string; phone: string; username: string; password: string; confirmPassword: string; role: "admin" | "provider" | "client"; gender: string; age: number; birthday: string; twoFactorEnabled: boolean; address?: string }) => {
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        username: data.username,
        ...(data.password && { password: data.password }),
        role: data.role,
        gender: data.gender,
        age: data.age,
        birthday: data.birthday,
        twoFactorEnabled: data.twoFactorEnabled,
        address: data.address,
      };

      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const result = await response.json();
      updateUser(userId, result.data);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Lỗi cập nhật người dùng. Vui lòng thử lại.");
    }
  };

  const handleBan = (userId: string) => {
    updateUser(userId, { status: "banned" });
  };

  const handleUnban = (userId: string, status: "active" | "inactive") => {
    updateUser(userId, { status });
  };

  const handleCreateSave = async (data: { fullName: string; email: string; phone: string; username: string; password: string; confirmPassword: string; role: "admin" | "provider" | "client"; gender: string; age: number; birthday: string; twoFactorEnabled: boolean; address?: string }) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          username: data.username,
          password: data.password,
          role: data.role,
          gender: data.gender,
          age: data.age,
          birthday: data.birthday,
          twoFactorEnabled: data.twoFactorEnabled,
          address: data.address,
          idCard: "000000000000",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const result = await response.json();
      addUser(result.data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Lỗi tạo người dùng. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý tất cả người dùng trong hệ thống
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>

        <UserSheet
          users={users}
          onEditSave={handleEditSave}
          onBan={handleBan}
          onUnban={handleUnban}
        />

        {/* Create User Modal */}
        <EditUserModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSave={handleCreateSave}
        />
      </div>
  );
}
