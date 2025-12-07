"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Eye, Check } from "lucide-react";
import { toast } from "sonner";
import BookingDetailModal from "@/components/modals/BookingDetailModal";
import { Booking } from "@/app/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  "no-show": "bg-gray-100 text-gray-800",
};

export default function AdminBookingsPage() {
  const { fetchWithAuth } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await fetchWithAuth("/api/bookings");
        if (res.ok) {
          const data = await res.json();
          setBookings(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [fetchWithAuth]);

  const filteredBookings = bookings.filter((booking) => {
    return statusFilter === "ALL" || booking.status === statusFilter;
  });

  const handleStatusChange = async (bookingId: string, newStatus: "confirmed" | "cancelled") => {
    setIsUpdating(bookingId);
    try {
      const res = await fetchWithAuth(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBookings(bookings.map((b) => (b._id === bookingId ? { ...b, status: newStatus as "confirmed" | "cancelled" } : b)));
        toast.success(`Booking ${newStatus === "confirmed" ? "xác nhận" : "từ chối"} thành công`);
      } else {
        toast.error("Lỗi cập nhật trạng thái");
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      toast.error("Lỗi cập nhật trạng thái");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirmPaymentId) return;

    setIsUpdating(confirmPaymentId);
    try {
      const res = await fetchWithAuth(`/api/bookings/${confirmPaymentId}`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: "paid" }),
      });

      if (res.ok) {
        setBookings(bookings.map((b) => (b._id === confirmPaymentId ? { ...b, paymentStatus: "paid" } : b)));
        toast.success("Xác nhận thanh toán thành công");
        setConfirmPaymentId(null);
      } else {
        toast.error("Lỗi xác nhận thanh toán");
      }
    } catch (err) {
      console.error("Error confirming payment:", err);
      toast.error("Lỗi xác nhận thanh toán");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Đặt phòng</h1>
        <p className="text-muted-foreground mt-2">Xem và quản lý tất cả đặt phòng</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lọc theo trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xác nhận</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="cancelled">Hủy</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Không có đặt phòng nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">Booking #{booking._id.slice(-8)}</h3>
                        <Badge className={statusColors[booking.status] || "bg-gray-100"}>
                          {booking.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {booking.paymentStatus === "paid" ? "💳 Đã thanh toán" : "💰 Chờ thanh toán"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(booking.checkIn).toLocaleDateString("vi-VN")} - {new Date(booking.checkOut).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.adults} người lớn{booking.children > 0 ? `, ${booking.children} trẻ em` : ""} • {booking.roomIds?.length || 0} phòng
                      </p>
                      <p className="text-sm font-medium mt-2">
                        Tổng: {booking.totalPrice?.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBookingId(booking._id);
                        setBookingModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {booking.status === "pending" && (
                      <div className="flex gap-2 w-full">
                        <Select onValueChange={(newStatus) => handleStatusChange(booking._id, newStatus as "confirmed" | "cancelled")}>
                          <SelectTrigger className="w-40 h-9">
                            <SelectValue placeholder="Chọn hành động" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">✓ Xác nhận</SelectItem>
                            <SelectItem value="cancelled">✕ Từ chối</SelectItem>
                          </SelectContent>
                        </Select>
                        {isUpdating === booking._id && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                    )}

                    {booking.status === "confirmed" && booking.paymentStatus === "pending" && (
                      <AlertDialog open={confirmPaymentId === booking._id} onOpenChange={(open) => {
                        if (!open) setConfirmPaymentId(null);
                      }}>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => setConfirmPaymentId(booking._id)}
                          disabled={isUpdating === booking._id}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Xác nhận thanh toán
                        </Button>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận thanh toán</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xác nhận thanh toán cho booking này? (Số tiền: {booking.totalPrice?.toLocaleString("vi-VN")} VNĐ)
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-2">
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700">
                              Xác nhận
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BookingDetailModal open={bookingModalOpen} onOpenChange={(v) => setBookingModalOpen(v)} bookingId={selectedBookingId} />
    </div>
  );
}
