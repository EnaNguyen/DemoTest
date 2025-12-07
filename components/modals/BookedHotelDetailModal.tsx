"use client";

import { Hotel, Booking, User } from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Calendar } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BookedHotelDetailModalProps {
  hotel: Hotel | null;
  bookings: Booking[];
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookedHotelDetailModal({
  hotel,
  bookings,
  users,
  open,
  onOpenChange,
}: BookedHotelDetailModalProps) {
  if (!hotel) return null;

  const getBookingStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getBookingStatusLabel = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentStatusBadge = (status: Booking["paymentStatus"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "refunded":
        return "bg-blue-100 text-blue-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentStatusLabel = (status: Booking["paymentStatus"]) => {
    switch (status) {
      case "pending":
        return "Chờ thanh toán";
      case "paid":
        return "Đã thanh toán";
      case "refunded":
        return "Đã hoàn tiền";
      case "failed":
        return "Thanh toán thất bại";
      default:
        return status;
    }
  };

  const getCustomerName = (customerId: string) => {
    return users.find((u) => u._id === customerId)?.fullName || "N/A";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-6xl max-h-[95vh] overflow-y-auto p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl">{hotel.name}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Xem chi tiết đặt phòng của khách sạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hotel Info */}
          <div className="flex gap-6">
            {hotel.images && hotel.images[0] && (
              <div className="relative h-40 w-40 rounded-lg overflow-hidden border flex-shrink-0">
                <Image
                  src={hotel.images[0]}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground font-semibold">
                  Địa chỉ
                </p>
                <p className="text-base flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  {hotel.address}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold">
                  Đánh giá
                </p>
                <p className="text-base flex items-center gap-2 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  {hotel.starRating} sao
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold">
                  Tổng số phòng
                </p>
                <p className="text-base mt-1">{hotel.totalRooms} phòng</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">
                  {totalBookings}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tổng đặt phòng
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {confirmedBookings}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Đã xác nhận
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {totalRevenue.toLocaleString()} đ
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tổng doanh thu
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Table */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground font-semibold mb-4">
                Danh sách đặt phòng
              </p>
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có đặt phòng nào
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Nhận phòng</TableHead>
                        <TableHead>Trả phòng</TableHead>
                        <TableHead>Giá (đ)</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thanh toán</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell className="font-medium">
                            {getCustomerName(booking.customerId)}
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(booking.checkIn)}
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(booking.checkOut)}
                          </TableCell>
                          <TableCell>
                            {booking.totalPrice.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getBookingStatusBadge(booking.status)}
                            >
                              {getBookingStatusLabel(booking.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getPaymentStatusBadge(
                                booking.paymentStatus
                              )}
                            >
                              {getPaymentStatusLabel(booking.paymentStatus)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
