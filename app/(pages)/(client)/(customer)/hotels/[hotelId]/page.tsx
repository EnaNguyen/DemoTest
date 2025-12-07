"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useHotels } from "@/app/contexts/HotelContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layouts/user/Header";
import { Footer } from "@/components/layouts/user/Footer";
import { BookingConfirmModal } from "@/components/modals/BookingConfirmModal";
import { Booking } from "@/app/types";

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params?.hotelId as string;

  const { getFilteredHotels, getRoomTypesByHotel } = useHotels();

  const hotel = useMemo(() => getFilteredHotels().find((h) => h._id === hotelId && h.status === "APPROVED") || null, [getFilteredHotels, hotelId]);
  const roomTypes = useMemo(() => getRoomTypesByHotel(hotelId), [getRoomTypesByHotel, hotelId]);

  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(roomTypes?.[0]?._id || null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!hotel) {
    return (
      <>
        <Header />
        <div className="p-8">Khách sạn không tồn tại hoặc chưa được duyệt</div>
        <Footer />
      </>
    );
  }

  const currentRoomType = roomTypes.find((rt) => rt._id === selectedRoomType);

  const calculateTotalPrice = (): number => {
    if (!checkIn || !checkOut || !currentRoomType) return 0;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights > 0 ? currentRoomType.basePrice * nights : 0;
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomType || !checkIn || !checkOut || !currentRoomType) {
      alert("Vui lòng nhập đủ thông tin");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    router.push(`/bookings/${booking._id}`);
  };

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-semibold mb-2">{hotel.name}</h1>
          <p className="text-sm text-muted-foreground mb-4">{hotel.address}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {hotel.images?.slice(0, 3).map((img, i) => (
              <div key={i} className="relative h-40 bg-gray-100 rounded overflow-hidden">
                <Image src={img} alt={hotel.name} fill className="object-cover" />
              </div>
            ))}
          </div>

          <div className="prose max-w-none mb-6">
            <h3>Mô tả</h3>
            <p>{hotel.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="mb-3">Tiện ích</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((a) => (
                <span key={a} className="px-2 py-1 bg-gray-100 rounded text-sm">{a}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3">Loại phòng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomTypes.map((rt) => (
                <div key={rt._id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{rt.name}</h4>
                    <div className="text-primary font-semibold">{rt.basePrice?.toLocaleString?.() ?? rt.basePrice} VNĐ</div>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{rt.description}</div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setSelectedRoomType(rt._id)} variant={selectedRoomType === rt._id ? "secondary" : "outline"}>Chọn</Button>
                    <span className="text-sm text-muted-foreground">Sức chứa: {rt.capacity} khách</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="border rounded p-4">
          <h3 className="font-semibold mb-3">Đặt phòng</h3>
          <form onSubmit={handleOpenConfirmModal} className="flex flex-col gap-3">
            <div>
              <Label>Loại phòng</Label>
              <select value={selectedRoomType || ""} onChange={(e) => setSelectedRoomType(e.target.value)} className="w-full border rounded p-2 mt-1">
                {roomTypes.map((rt) => (
                  <option key={rt._id} value={rt._id}>{rt.name} — {rt.basePrice.toLocaleString()} VNĐ</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Check-in</Label>
              <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>

            <div>
              <Label>Check-out</Label>
              <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Người lớn</Label>
                <Input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
              </div>
              <div className="flex-1">
                <Label>Trẻ em</Label>
                <Input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} />
              </div>
            </div>

            {checkIn && checkOut && currentRoomType && (
              <div className="bg-gray-100 p-3 rounded text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">
                    {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} đêm
                  </span>
                  <span className="font-semibold">
                    {calculateTotalPrice().toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              Tiến hành thanh toán
            </Button>
          </form>
        </aside>
      </div>
      </div>

      {currentRoomType && hotel && (
        <BookingConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          bookingData={{
            hotel,
            roomType: currentRoomType,
            checkIn,
            checkOut,
            adults,
            children,
            totalPrice: calculateTotalPrice(),
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      <Footer />
    </>
  );
}
