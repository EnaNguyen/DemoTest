"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { HotelCard } from "@/components/cards/HotelCard";
import { useHotels } from "@/app/contexts/HotelContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layouts/user/Header";
import { Footer } from "@/components/layouts/user/Footer";

export default function HotelsPage() {
  const { getFilteredHotels, setFilters } = useHotels();
  const [search, setSearch] = useState("");
  const [star, setStar] = useState<string>("");
  const hotels = useMemo(() => getFilteredHotels(), [getFilteredHotels]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ searchQuery: search });
  };

  const handleStarChange = (value: string) => {
    setStar(value);
    if (!value) setFilters({ starRating: undefined });
    else setFilters({ starRating: Number(value) });
  };

  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Tìm khách sạn</h1>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input placeholder="Tìm theo tên, địa điểm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="submit">Tìm</Button>
          </form>
          
          {/* Star filter */}
          <div className="ml-4 flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Sao:</label>
            <select value={star} onChange={(e) => handleStarChange(e.target.value)} className="border rounded p-2">
              <option value="">Tất cả</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels
          .filter((h) => h.status === "APPROVED")
          .map((hotel) => (
            <Link key={hotel._id} href={`/hotels/${hotel._id}`} className="block">
              <HotelCard hotel={hotel} onDetailClick={() => {}} showStatusBadge={false} />
            </Link>
          ))}
      </div>

      {hotels.length === 0 && (
        <div className="text-center py-16 text-gray-600">Không tìm thấy khách sạn nào</div>
      )}
      </div>

      <Footer />
    </>
  );
}
