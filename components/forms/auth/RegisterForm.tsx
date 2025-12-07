"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";              
import { useAuth } from "@/app/contexts/AuthContext";
import { UserRole } from "@/app/types";                        ;                   
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface RegisterFormProps {
  onToggle?: () => void; 
}

export default function RegisterForm({ onToggle }: RegisterFormProps) {
  const router = useRouter();    
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    role: "client" as UserRole,
    idCard: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError?.();

    const success = await register(formData);
    if (success) {
      router.push("/"); // hoặc router.push("/dashboard")
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between h-full space-y-6"
      id="register-form"
    >
      <div className="space-y-4 overflow-y-auto max-h-[480px] pr-2">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Họ và tên</Label>
            <Input
              id="fullname"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              placeholder="0909123456"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idCard">CMND/CCCD</Label>
            <Input
              id="idCard"
              placeholder="012345678901"
              value={formData.idCard}
              onChange={(e) => updateField("idCard", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Tên tài khoản</Label>
            <Input
              id="username"
              placeholder="username"
              value={formData.username}
              onChange={(e) => updateField("username", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Bạn là?</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => updateField("role", value as UserRole)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Khách thuê phòng</SelectItem>
                <SelectItem value="provider">Người cho thuê</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Tạo tài khoản
        </Button>

        {onToggle && (
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={onToggle}
              className="text-primary hover:underline font-medium"
            >
              Đăng nhập ngay
            </button>
          </p>
        )}
      </div>
    </form>
  );
}