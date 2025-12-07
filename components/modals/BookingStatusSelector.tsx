"use client";

import { Booking, BookingStatus } from "@/app/types";
import { Button } from "@/components/ui/button";

interface BookingStatusSelectorProps {
  currentBooking: Booking | null;
  onStatusSelected: (status: BookingStatus) => void;
  onCancel: () => void;
}

export function BookingStatusSelector({
  currentBooking,
  onStatusSelected,
  onCancel,
}: BookingStatusSelectorProps) {
  if (!currentBooking) return null;

  const transitions: Record<BookingStatus, BookingStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "pending", "cancelled"],
    completed: ["pending"],
    cancelled: ["pending"],
    "no-show": ["pending", "completed"],
  };

  const statusLabels: Record<BookingStatus, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancelled: "Hủy",
    "no-show": "Vắng mặt",
  };

  const availableStatuses = transitions[currentBooking.status as BookingStatus] || [];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Chọn trạng thái mới:</div>
      <div className="grid gap-2">
        {availableStatuses.map((status) => (
          <Button
            key={status}
            variant="outline"
            className="justify-start h-auto py-2"
            onClick={() => onStatusSelected(status)}
          >
            {statusLabels[status]}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <Button
          variant="ghost"
          className="flex-1"
          onClick={onCancel}
        >
          Hủy
        </Button>
      </div>
    </div>
  );
}
