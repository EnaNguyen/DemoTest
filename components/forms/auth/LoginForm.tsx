
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  onToggle?: () => void;
}

export default function LoginForm({ onToggle }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError?.();

    const result = await login(username, password);
    if (!result.success || !result.user) return;

    // Route based on role from the login response
    if (result.user.role === "provider") {
      router.push("/provider");
    } else if (result.user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between space-y-6 h-full"
      id="login-form"
    >
      <div className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="login-username">Tài khoản</Label>
          <Input
            id="login-username"
            placeholder="Nhập tên tài khoản"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Mật khẩu</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Demo accounts */}
        <div className="text-xs bg-muted/60 p-4 rounded-lg space-y-1">
          <p className="font-medium">Tài khoản demo:</p>
          <p>Khách: minhle96 / client123</p>
          <p>Chủ trọ: owner_an / owner123</p>
          <p>Admin: admin / admin123</p>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Đăng nhập
        </Button>

        {onToggle && (
          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onToggle}
              className="text-primary hover:underline font-medium"
            >
              Đăng ký ngay
            </button>
          </p>
        )}
      </div>
    </form>
  );
}