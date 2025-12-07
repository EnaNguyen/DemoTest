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

interface PaymentStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function PaymentStatusModal({
  open,
  onOpenChange,
  children,
}: PaymentStatusModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Thay đổi trạng thái thanh toán</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

interface PaymentStatusModalHeaderProps {
  currentStatus: string;
  newStatus: string;
}

export function PaymentStatusModalHeader({
  currentStatus,
  newStatus,
}: PaymentStatusModalHeaderProps) {
  const statusLabels: Record<string, string> = {
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    refunded: "Hoàn tiền",
    failed: "Thất bại",
  };

  return (
    <DialogHeader>
      <DialogTitle>Thay đổi trạng thái thanh toán</DialogTitle>
      <DialogDescription>
        Bạn muốn thay đổi từ <span className="font-semibold">{statusLabels[currentStatus] || currentStatus}</span> sang{" "}
        <span className="font-semibold">{statusLabels[newStatus] || newStatus}</span>?
      </DialogDescription>
    </DialogHeader>
  );
}

interface PaymentStatusModalBodyProps {
  currentStatus: string;
  newStatus: string;
  bookingId: string;
  amount: number;
}

export function PaymentStatusModalBody({
  currentStatus,
  newStatus,
  bookingId,
  amount,
}: PaymentStatusModalBodyProps) {
  const messages: Record<string, string> = {
    "pending-paid":
      "Đánh dấu đơn đặt phòng này là đã thanh toán. Khách sẽ nhận được xác nhận thanh toán.",
    "paid-refunded":
      "Khởi tạo quy trình hoàn tiền. Số tiền sẽ được hoàn lại cho khách hàng.",
    "pending-failed":
      "Đánh dấu thanh toán này là thất bại. Khách sẽ cần phải thử lại.",
    "paid-pending":
      "Thay đổi trạng thái thanh toán từ Đã thanh toán về Chờ thanh toán.",
    "failed-pending":
      "Trả lại trạng thái Chờ thanh toán. Khách có thể thử thanh toán lại.",
    "refunded-pending":
      "Thay đổi trạng thái từ Hoàn tiền về Chờ thanh toán.",
  };

  const key = `${currentStatus}-${newStatus}`;
  const message = messages[key] || "Xác nhận thay đổi trạng thái thanh toán.";

  return (
    <div className="space-y-4 py-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-900">{message}</p>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mã đơn:</span>
          <span className="font-mono">{bookingId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Số tiền:</span>
          <span className="font-semibold">{amount.toLocaleString("vi-VN")}₫</span>
        </div>
      </div>
    </div>
  );
}

interface PaymentStatusModalFooterProps {
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentStatusModalFooter({
  isLoading = false,
  onConfirm,
  onCancel,
}: PaymentStatusModalFooterProps) {
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
