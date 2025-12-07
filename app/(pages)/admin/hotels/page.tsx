"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { HotelCard } from "@/components/cards/HotelCard";
import { HotelDetailModal } from "@/components/modals/HotelDetailModal";
import { BookedHotelDetailModal } from "@/components/modals/BookedHotelDetailModal";
import { useHotels } from "@/app/contexts/HotelContext";
import { useBookings } from "@/app/contexts/BookingContext";
import { useUsers } from "@/app/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Hotel } from "@/app/types";
import { HotelFilters } from "@/components/filters/HotelFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const HOTELS_PER_PAGE = 6;

export default function AdminHotels() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedDetailHotel, setSelectedDetailHotel] = useState<Hotel | null>(null);
  const [selectedBookedHotel, setSelectedBookedHotel] = useState<Hotel | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBookedDetailModalOpen, setIsBookedDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBookedPage, setCurrentBookedPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/admin/authAdmin");
    }
  }, [isAuthenticated, user, router]);

  const { getFilteredHotels, updateHotel } = useHotels();
  const { bookings } = useBookings();
  const { users } = useUsers();

  const allHotels = getFilteredHotels();

  // Hotels that have bookings (excluding cancelled)
  const hotelsWithBookings = useMemo(() => {
    return allHotels.filter((hotel) =>
      bookings.some((b) => b.hotelId === hotel._id && b.status !== "cancelled")
    );
  }, [allHotels, bookings]);

  const bookingsPerHotel = (hotelId: string) => {
    return bookings.filter((b) => b.hotelId === hotelId && b.status !== "cancelled");
  };

  const totalPages = Math.ceil(allHotels.length / HOTELS_PER_PAGE);
  const startIndex = (currentPage - 1) * HOTELS_PER_PAGE;
  const endIndex = startIndex + HOTELS_PER_PAGE;
  const paginatedHotels = useMemo(
    () => allHotels.slice(startIndex, endIndex),
    [allHotels, startIndex, endIndex]
  );

  const totalBookedPages = Math.ceil(hotelsWithBookings.length / HOTELS_PER_PAGE);
  const bookedStartIndex = (currentBookedPage - 1) * HOTELS_PER_PAGE;
  const bookedEndIndex = bookedStartIndex + HOTELS_PER_PAGE;
  const paginatedBookedHotels = useMemo(
    () => hotelsWithBookings.slice(bookedStartIndex, bookedEndIndex),
    [hotelsWithBookings, bookedStartIndex, bookedEndIndex]
  );

  const handleDetailClick = (hotel: Hotel) => {
    setSelectedDetailHotel(hotel);
    setIsDetailModalOpen(true);
  };

  const handleBookedDetailClick = (hotel: Hotel) => {
    setSelectedBookedHotel(hotel);
    setIsBookedDetailModalOpen(true);
  };

  const { fetchWithAuth } = useAuth();

  const handleApprove = async (hotelId: string) => {
    try {
      const res = await fetchWithAuth(`/api/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Approve failed");
      }
      const updated = await res.json();
      updateHotel(hotelId, updated);
      setIsDetailModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (hotelId: string) => {
    try {
      const res = await fetchWithAuth(`/api/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Reject failed");
      }
      const updated = await res.json();
      updateHotel(hotelId, updated);
      setIsDetailModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChangeFromCard = async (hotelId: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetchWithAuth(`/api/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `${newStatus} failed`);
      }
      const updated = await res.json();
      updateHotel(hotelId, updated);
    } catch (err) {
      console.error(err);
    }
  };

  const getOwner = (ownerId: string) => users.find((u) => u._id === ownerId) || null;

  return (
    <>
      <div className="space-y-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Tất cả khách sạn</TabsTrigger>
            <TabsTrigger value="booked">Khách sạn có đặt phòng ({hotelsWithBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="bg-background border rounded-lg p-4">
              <HotelFilters />
            </div>

            <div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedHotels.map((hotel) => (
                  <HotelCard
                    key={hotel._id}
                    hotel={hotel}
                    onStatusChange={handleStatusChangeFromCard}
                    onDetailClick={() => handleDetailClick(hotel)}
                  />
                ))}
              </div>

              {allHotels.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Không tìm thấy khách sạn nào</div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {startIndex + 1} đến {Math.min(endIndex, allHotels.length)} của {allHotels.length} khách sạn
                  </p>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink onClick={() => setCurrentPage(pageNum)} isActive={currentPage === pageNum} className="cursor-pointer">
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="booked" className="space-y-6">
            <div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedBookedHotels.map((hotel) => (
                  <div key={hotel._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">{hotel.name}</h3>
                      <p className="text-sm text-muted-foreground">{hotel.address}</p>
                      <div className="pt-2 border-t">
                        <p className="text-sm font-semibold text-primary">{bookingsPerHotel(hotel._id).length} đặt phòng</p>
                      </div>
                      <Button className="w-full" onClick={(e) => { e.stopPropagation(); handleBookedDetailClick(hotel); }}>
                        <Info className="h-4 w-4 mr-2" /> Xem chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {hotelsWithBookings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Chưa có khách sạn nào có đặt phòng</div>
              )}

              {totalBookedPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {bookedStartIndex + 1} đến {Math.min(bookedEndIndex, hotelsWithBookings.length)} của {hotelsWithBookings.length} khách sạn
                  </p>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentBookedPage((p) => Math.max(1, p - 1))} className={currentBookedPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalBookedPages) }).map((_, i) => {
                        let pageNum: number;
                        if (totalBookedPages <= 5) pageNum = i + 1;
                        else if (currentBookedPage <= 3) pageNum = i + 1;
                        else if (currentBookedPage >= totalBookedPages - 2) pageNum = totalBookedPages - 4 + i;
                        else pageNum = currentBookedPage - 2 + i;
                        if (pageNum < 1 || pageNum > totalBookedPages) return null;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink onClick={() => setCurrentBookedPage(pageNum)} isActive={currentBookedPage === pageNum} className="cursor-pointer">
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalBookedPages > 5 && currentBookedPage < totalBookedPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentBookedPage((p) => Math.min(totalBookedPages, p + 1))} className={currentBookedPage === totalBookedPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <HotelDetailModal
        hotel={selectedDetailHotel}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        owner={selectedDetailHotel ? getOwner(selectedDetailHotel.ownerId) : null}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <BookedHotelDetailModal
        hotel={selectedBookedHotel}
        bookings={selectedBookedHotel ? bookingsPerHotel(selectedBookedHotel._id) : []}
        users={users}
        open={isBookedDetailModalOpen}
        onOpenChange={setIsBookedDetailModalOpen}
      />
    </>
  );
}