"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/hotels?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navLinks = [
    { label: "Khách sạn", href: "/hotels" },
    { label: "Về chúng tôi", href: "#about" },
    { label: "Liên hệ", href: "#contact" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900">HotelHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Tìm khách sạn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-48 placeholder-gray-500"
            />
          </form>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Select onValueChange={(value) => {
                if (value === "bookings") {
                  router.push("/bookings");
                } else if (value === "logout") {
                  handleLogout();
                }
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={user.fullName || "Tài khoản"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bookings">Lịch sử đặt phòng</SelectItem>
                  <SelectItem value="logout">Đăng xuất</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Button variant="outline" onClick={() => router.push("/auth")}>
                Đăng nhập / Đăng ký
              </Button>
            )}
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-6 mt-8">
                <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Tìm khách sạn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none placeholder-gray-500"
                  />
                </form>

                <nav className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-gray-700 hover:text-primary transition-colors font-medium py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="flex flex-col gap-2 border-t pt-4">
                  {user ? (
                    <Select onValueChange={(value) => {
                      if (value === "bookings") {
                        router.push("/bookings");
                        setIsOpen(false);
                      } else if (value === "logout") {
                        handleLogout();
                        setIsOpen(false);
                      }
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={user.fullName || "Tài khoản"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bookings">Lịch sử đặt phòng</SelectItem>
                        <SelectItem value="logout">Đăng xuất</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select onValueChange={(value) => {
                      if (value === "login") {
                        router.push("/auth/login");
                        setIsOpen(false);
                      } else if (value === "register") {
                        router.push("/auth/register");
                        setIsOpen(false);
                      }
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Đăng nhập / Đăng ký" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="login">Đăng nhập</SelectItem>
                        <SelectItem value="register">Đăng ký</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
