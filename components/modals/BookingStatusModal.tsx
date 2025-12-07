"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BookingStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function BookingStatusModal({
  open,
  onOpenChange,
  children,
}: BookingStatusModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Thay đổi trạng thái đặt phòng</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

interface BookingStatusModalHeaderProps {
  currentStatus: string;
  newStatus: string;
}

export function BookingStatusModalHeader({
  currentStatus,
  newStatus,
}: BookingStatusModalHeaderProps) {
  const statusLabels: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancelled: "Hủy",
  };

  return (
    <DialogHeader>
      <DialogTitle>Thay đổi trạng thái đặt phòng</DialogTitle>
      <DialogDescription>
        Bạn muốn thay đổi từ <span className="font-semibold">{statusLabels[currentStatus] || currentStatus}</span> sang{" "}
        <span className="font-semibold">{statusLabels[newStatus] || newStatus}</span>?
      </DialogDescription>
    </DialogHeader>
  );
}

interface BookingStatusModalBodyProps {
  currentStatus: string;
  newStatus: string;
  bookingId: string;
}

export function BookingStatusModalBody({
  currentStatus,
  newStatus,
  bookingId,
}: BookingStatusModalBodyProps) {
  const messages: Record<string, string> = {
    "confirmed-pending":
      "Hành động này sẽ hủy xác nhận đặt phòng. Khách sẽ nhận được thông báo về thay đổi trạng thái.",
    "pending-confirmed":
      "Đặt phòng sẽ được xác nhận và khách sẽ nhận được email xác nhận.",
    "confirmed-cancelled":
      "Đặt phòng sẽ bị hủy. Nếu khách đã thanh toán, vui lòng xử lý hoàn tiền riêng.",
    "completed-pending":
      "Hành động này sẽ thay đổi trạng thái từ Hoàn thành về Chờ xác nhận.",
  };

  const key = `${currentStatus}-${newStatus}`;
  const message = messages[key] || "Xác nhận thay đổi trạng thái đặt phòng này.";

  return (
    <div className="space-y-4 py-4">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
        <p className="text-sm text-amber-900">{message}</p>
      </div>
      <div className="text-xs text-muted-foreground">
        <p>Mã đơn: <span className="font-mono">{bookingId}</span></p>
      </div>
    </div>
  );
}

interface BookingStatusModalFooterProps {
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BookingStatusModalFooter({
  isLoading = false,
  onConfirm,
  onCancel,
}: BookingStatusModalFooterProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Hủy
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Đang xử lý..." : "Xác nhận"}
      </Button>
    </div>
  );
}
