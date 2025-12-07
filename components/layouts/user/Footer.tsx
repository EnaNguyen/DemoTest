"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeStatus("loading");
    
    // Giả lập gửi email subscription
    setTimeout(() => {
      setSubscribeStatus("success");
      setEmail("");
      setTimeout(() => setSubscribeStatus("idle"), 3000);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <span className="text-xl font-bold">HotelHub</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nền tảng đặt phòng khách sạn hàng đầu, cung cấp các lựa chọn tốt nhất với giá cạnh tranh.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/hotels" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors text-sm">
                  Khách sạn
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors text-sm">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors text-sm">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors text-sm">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+84123456789" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors text-sm">
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:support@hotelhub.com" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors text-sm">
                  support@hotelhub.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Đường Lê Lợi, Quận 1, TP.HCM, Việt Nam
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Nhận tin tức</h3>
            <p className="text-gray-400 text-sm mb-4">
              Đăng ký để nhận các ưu đãi và tin tức mới nhất.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <Button
                type="submit"
                disabled={subscribeStatus === "loading"}
                className="w-full"
              >
                {subscribeStatus === "loading" ? "Đang gửi..." : subscribeStatus === "success" ? "Thành công!" : "Đăng ký"}
              </Button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} HotelHub. Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex justify-start md:justify-end gap-6">
              <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors text-sm">
                Điều khoản
              </Link>
              <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors text-sm">
                Bảo mật
              </Link>
              <Link href="#" className="text-gray-400 border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors text-sm">
                Cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
