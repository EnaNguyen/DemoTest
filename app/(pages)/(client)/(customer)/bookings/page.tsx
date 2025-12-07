"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBookings } from "@/app/contexts/BookingContext";
import { useHotels } from "@/app/contexts/HotelContext";
import { Header } from "@/components/layouts/user/Header";
import { Footer } from "@/components/layouts/user/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BookingsPage() {
  const router = useRouter();
  const { getFilteredBookings } = useBookings();
  const { getFilteredHotels } = useHotels();
  
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const bookings = useMemo(() => getFilteredBookings(), [getFilteredBookings]);
  const hotels = useMemo(() => getFilteredHotels(), [getFilteredHotels]);


  const filteredBookings = useMemo(() => {
    let result = bookings.filter((b) => b.customerId === "customer_anon"); 
    
    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.status === statusFilter);
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, statusFilter]);

  const getHotelName = (hotelId: string) => {
    return hotels.find((h) => h._id === hotelId)?.name || "Unknown Hotel";
  };

  const handleCancelBooking = async () => {
    if (!cancelingBookingId) return;

    setIsCanceling(true);
    try {
      const response = await fetch(`/api/bookings/cancel/${cancelingBookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Lỗi hủy đặt phòng");
        setIsCanceling(false);
        return;
      }

      // Update UI state by refreshing the bookings
      toast.success("Hủy đặt phòng thành công");
      setCancelingBookingId(null);
      
      // Refresh bookings from mock data
      router.refresh();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Lỗi hủy đặt phòng");
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "refunded":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "pending":
        return "Chưa thanh toán";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Lịch sử đặt phòng</h1>
          <p className="text-muted-foreground">
            Quản lý và xem lại tất cả các đơn đặt phòng của bạn
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Trạng thái:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground ml-auto">
              Tìm thấy {filteredBookings.length} đơn đặt phòng
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-muted-foreground mb-4">Bạn chưa có đơn đặt phòng nào</p>
              <Button onClick={() => router.push("/hotels")}>
                Tìm và đặt khách sạn
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {getHotelName(booking.hotelId)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Mã đơn: {booking._id}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in</p>
                      <p className="font-semibold">
                        {new Date(booking.checkIn).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Check-out</p>
                      <p className="font-semibold">
                        {new Date(booking.checkOut).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Khách</p>
                      <p className="font-semibold">
                        {booking.adults} người lớn {booking.children > 0 && `+ ${booking.children} trẻ em`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng tiền</p>
                      <p className="font-semibold text-primary">
                        {booking.totalPrice.toLocaleString()} VNĐ
                      </p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Thanh toán:</span>
                      <Badge variant="outline" className={getPaymentStatusColor(booking.paymentStatus)}>
                        {getPaymentStatusLabel(booking.paymentStatus)}
                      </Badge>
                      {booking.paymentMethod && (
                        <span className="text-xs text-muted-foreground">
                          ({booking.paymentMethod === "cash" ? "Tiền mặt" : "VNPay"})
                        </span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/bookings/${booking._id}`)}
                      >
                        Chi tiết
                      </Button>
                      {booking.status === "pending" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCancelingBookingId(booking._id)}
                          disabled={isCanceling}
                        >
                          {isCanceling ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang xử lý
                            </>
                          ) : (
                            "Hủy đặt phòng"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelingBookingId !== null} onOpenChange={(open) => {
        if (!open && !isCanceling) setCancelingBookingId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đơn đặt phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn đặt phòng này? Hành động này không thể được hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isCanceling}>Không hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelBooking} 
              disabled={isCanceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCanceling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý
                </>
              ) : (
                "Xác nhận hủy"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </>
  );
}
