"use client";

import { Heart, Zap, Shield, Globe } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Tôn trọng khách hàng",
    description: "Chúng tôi đặt sự hài lòng của bạn lên hàng đầu với dịch vụ tận tâm.",
  },
  {
    icon: Zap,
    title: "Đặt phòng nhanh chóng",
    description: "Hoàn thành đặt phòng trong vài giây với giao diện dễ sử dụng.",
  },
  {
    icon: Shield,
    title: "Bảo mật tuyệt đối",
    description: "Bảo vệ thông tin cá nhân của bạn với công nghệ mã hóa hiện đại.",
  },
  {
    icon: Globe,
    title: "Phạm vi toàn cầu",
    description: "Tiếp cận hàng triệu khách sạn trên khắp thế giới.",
  },
];

export function Slogan() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Slogan */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tại sao chọn HotelHub?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp trải nghiệm đặt phòng tốt nhất với những tiện ích vượt trội
            và giá cả cạnh tranh nhất trên thị trường.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-200">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
              50K+
            </p>
            <p className="text-gray-600">Khách sạn trên khắp thế giới</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
              1M+
            </p>
            <p className="text-gray-600">Khách hàng hài lòng</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
              24/7
            </p>
            <p className="text-gray-600">Hỗ trợ khách hàng</p>
          </div>
        </div>
      </div>
    </section>
  );
}
