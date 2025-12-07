"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Booking } from "@/app/types";
import { Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingCardProps {
  booking: Booking;
  customerName?: string;
  hotelName?: string;
  onEdit?: (booking: Booking) => void;
  onCancel?: (bookingId: string) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Hủy",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-50 border-yellow-200",
  paid: "bg-green-50 border-green-200",
  refunded: "bg-blue-50 border-blue-200",
  failed: "bg-red-50 border-red-200",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  refunded: "Hoàn tiền",
  failed: "Thất bại",
};

export function BookingCard({
  booking,
  customerName = "Khách hàng",
  hotelName = "Khách sạn",
  onEdit,
  onCancel,
}: BookingCardProps) {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{hotelName}</CardTitle>
            <CardDescription>{customerName}</CardDescription>
          </div>
          <Badge className={statusColors[booking.status]}>
            {statusLabels[booking.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Booking Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Check-in</p>
              <p className="font-medium">
                {format(checkInDate, "dd MMM yyyy", { locale: vi })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Check-out</p>
              <p className="font-medium">
                {format(checkOutDate, "dd MMM yyyy", { locale: vi })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Khách</p>
              <p className="font-medium">
                {booking.adults} người + {booking.children} trẻ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">({nights} đêm)</span>
          </div>
        </div>

        {/* Price & Payment */}
        <div className="space-y-2 border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Tổng tiền:</span>
            <span className="text-lg font-bold text-primary">
              {booking.totalPrice.toLocaleString("vi-VN")}₫
            </span>
          </div>
          <div className={`px-3 py-1 rounded text-sm border ${paymentStatusColors[booking.paymentStatus]}`}>
            {paymentStatusLabels[booking.paymentStatus]}
            {booking.paymentMethod && (
              <span className="ml-1 text-xs">({booking.paymentMethod.toUpperCase()})</span>
            )}
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <div className="bg-muted p-2 rounded text-sm">
            <p className="text-xs font-medium text-muted-foreground mb-1">Yêu cầu đặc biệt</p>
            <p>{booking.specialRequests}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(booking)}
            >
              Chi tiết
            </Button>
          )}
          {onCancel && booking.status === "pending" && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => onCancel(booking._id)}
            >
              Hủy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
