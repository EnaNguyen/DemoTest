"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/app/types";

interface BanUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onBan: (userId: string) => void;
  onUnban: (userId: string, newStatus: "active" | "inactive") => void;
}

export function BanUserModal({
  open,
  onOpenChange,
  user,
  onBan,
  onUnban,
}: BanUserModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive">(
    "active"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const isBanned = user.status === "banned";

  const handleBan = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      onBan(user._id);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnban = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      onUnban(user._id, selectedStatus);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isBanned) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Khóa tài khoản người dùng
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-3">
              Bạn chắc chắn muốn khóa tài khoản của <strong>{user.fullName}</strong>? Người dùng sẽ không thể đăng nhập.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Đang khóa..." : "Khóa tài khoản"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl">Mở khóa tài khoản</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Tài khoản của <strong>{user.fullName}</strong> hiện đã bị khóa. Chọn trạng thái mới cho tài khoản.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-base font-semibold">
              Trạng thái mới *
            </label>
            <Select value={selectedStatus} onValueChange={(value: "active" | "inactive") => setSelectedStatus(value)}>
              <SelectTrigger className="text-base h-11">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              {selectedStatus === "active"
                ? "Tài khoản sẽ được kích hoạt và người dùng có thể đăng nhập."
                : "Tài khoản sẽ ở trạng thái không hoạt động."}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleUnban}
            disabled={isSubmitting}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Đang xử lý..." : "Mở khóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
