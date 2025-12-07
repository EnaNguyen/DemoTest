"use client";

import { useState } from "react";
import { Booking, Hotel, RoomType } from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useBookings } from "@/app/contexts/BookingContext";

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    hotel: Hotel;
    roomType: RoomType;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    totalPrice: number;
  };
  onSuccess?: (booking: Booking) => void;
}

export function BookingConfirmModal({
  isOpen,
  onClose,
  bookingData,
  onSuccess,
}: BookingConfirmModalProps) {
  const { createBooking } = useBookings();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "vnpay">("cash");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setStatus("idle");
      setErrorMessage("");

      // Create booking with paymentStatus based on payment method
      const paymentStatus =
        paymentMethod === "cash" ? ("pending" as const) : ("paid" as const);

      const newBooking = createBooking({
        customerId: "customer_anon", // TODO: Replace with actual user ID from AuthContext
        hotelId: bookingData.hotel._id,
        roomIds: [],
        roomTypeId: bookingData.roomType._id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        adults: bookingData.adults,
        children: bookingData.children,
        totalPrice: bookingData.totalPrice,
        status: "pending",
        paymentStatus,
        paymentMethod,
      });

      // Persist to API (mockData endpoint)
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      if (!response.ok) {
        throw new Error("Failed to save booking");
      }

      setStatus("success");
      setTimeout(() => {
        onSuccess?.(newBooking);
        onClose();
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const checkOutDate = new Date(bookingData.checkOut);
  const checkInDate = new Date(bookingData.checkIn);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận đặt phòng</DialogTitle>
          <DialogDescription>
            Vui lòng xem lại thông tin và chọn phương thức thanh toán
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Booking Summary */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Khách sạn</p>
                <p className="font-semibold">{bookingData.hotel.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loại phòng</p>
                <p className="font-semibold">{bookingData.roomType.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Check-in</p>
                  <p className="font-semibold">
                    {checkInDate.toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-out</p>
                  <p className="font-semibold">
                    {checkOutDate.toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Đêm</p>
                  <p className="font-semibold">{nights}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Người lớn</p>
                  <p className="font-semibold">{bookingData.adults}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trẻ em</p>
                  <p className="font-semibold">{bookingData.children}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <div className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {bookingData.roomType.basePrice.toLocaleString()} VNĐ × {nights} đêm
              </span>
              <span className="font-semibold">
                {(bookingData.roomType.basePrice * nights).toLocaleString()} VNĐ
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-lg font-bold text-primary">
                {bookingData.totalPrice.toLocaleString()} VNĐ
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          {status === "idle" && (
            <div className="border rounded-lg p-4 space-y-3">
              <p className="font-semibold">Phương thức thanh toán</p>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "cash" | "vnpay")}>
                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer flex-1">
                    <div>
                      <p className="font-medium">Tiền mặt</p>
                      <p className="text-xs text-muted-foreground">
                        Thanh toán khi tới khách sạn (Trạng thái: Chờ xác nhận)
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="vnpay" id="vnpay" />
                  <Label htmlFor="vnpay" className="cursor-pointer flex-1">
                    <div>
                      <p className="font-medium">VNPay</p>
                      <p className="text-xs text-muted-foreground">
                        Thanh toán online (Trạng thái: Đã thanh toán)
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex flex-col items-center gap-3 text-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Đặt phòng thành công!</p>
                <p className="text-sm text-green-700">
                  Mã đơn đặt phòng của bạn sẽ được gửi đến email
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="text-sm text-red-700">{errorMessage}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleConfirmBooking} disabled={loading || status === "success"}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : status === "success" ? (
              "Hoàn tất"
            ) : (
              "Xác nhận đặt phòng"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
