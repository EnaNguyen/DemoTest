"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hotel, LogOut, User, Building2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useAuth } from "@/app/contexts/AuthContext";

export function Header() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-bold text-xl">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Hotel className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            HotelHub
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              {/* Role-based menu */}
              {user.role === "client" && (
                <>
                  <Button variant="ghost" asChild size="sm">
                    <Link href="/">Tìm trọ</Link>
                  </Button>
                  <Button variant="ghost" asChild size="sm">
                    <Link href="/client/bookings">Đặt phòng của tôi</Link>
                  </Button>
                </>
              )}

              {user.role === "provider" && (
                <Button variant="ghost" asChild size="sm" className="flex items-center gap-2">
                  <Link href="/provider">
                    <Building2 className="h-4 w-4" />
                    Quản lý trọ
                  </Link>
                </Button>
              )}

              {user.role === "admin" && (
                <Button variant="ghost" asChild size="sm" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                  <Link href="/admin">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-semibold bg-primary/10">
                        {user.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-2">
                      <p className="font-semibold text-base">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground capitalize flex items-center gap-2">
                        {user.role === "admin" && <Shield className="h-3 w-3" />}
                        {user.role === "provider" && <Building2 className="h-3 w-3" />}
                        {user.role === "client" && <User className="h-3 w-3" />}
                        {user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Guest */
            <Button asChild size="sm" className="font-medium">
              <Link href="/auth">Đăng nhập / Đăng ký</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}