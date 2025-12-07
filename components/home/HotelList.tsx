"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HotelCard } from "@/components/cards/HotelCard";
import { Button } from "@/components/ui/button";
import { useHotels } from "@/app/contexts/HotelContext";

export function HotelList() {
  const { getFilteredHotels } = useHotels();

  const hotels = useMemo(() => {
    const approvedHotels = getFilteredHotels().filter(
      (hotel) => hotel.status === "APPROVED"
    );
    return approvedHotels.slice(0, 6);
  }, [getFilteredHotels]);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khách sạn nổi bật
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl">
              Khám phá những khách sạn tốt nhất được lựa chọn bởi hàng triệu du khách trên thế giới.
            </p>
          </div>
          <Link href="/hotels" className="mt-4 md:mt-0">
            <Button variant="outline">
              Xem tất cả
            </Button>
          </Link>
        </div>

        {/* Hotels Grid */}
        {hotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Link key={hotel._id} href={`/hotels/${hotel._id}`}>
                <HotelCard
                  hotel={hotel}
                  onDetailClick={() => {
                    // Navigation được xử lý bởi Link wrapper
                  }}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              Hiện tại chưa có khách sạn nào được duyệt. Vui lòng quay lại sau.
            </p>
            <Link href="/hotels">
              <Button>
                Khám phá tất cả khách sạn
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
