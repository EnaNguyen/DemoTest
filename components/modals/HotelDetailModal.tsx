"use client";

import { Hotel, User } from "@/app/types";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MapPin, Star, Check, X } from "lucide-react";
import Image from "next/image";

interface HotelDetailModalProps {
  hotel: Hotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: User | null;
  onApprove?: (hotelId: string) => Promise<void>;
  onReject?: (hotelId: string) => Promise<void>;
  onRevoke?: (hotelId: string) => Promise<void>;
}

export function HotelDetailModal({
  hotel,
  open,
  onOpenChange,
  owner,
  onApprove,
  onReject,
  onRevoke,
}: HotelDetailModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  if (!hotel) return null;

  const getStatusBadgeColor = (status: Hotel["status"]) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";
      case "SUBMITTED":
        return "bg-orange-100 text-orange-700";
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: Hotel["status"]) => {
    switch (status) {
      case "DRAFT":
        return "Nháp";
      case "SUBMITTED":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Bị từ chối";
      default:
        return status;
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    try {
      setIsApproving(true);
      await onApprove(hotel._id);
      toast.success("Duyệt khách sạn thành công!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi duyệt khách sạn");
      console.error(error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    try {
      setIsRejecting(true);
      await onReject(hotel._id);
      toast.success("Từ chối khách sạn thành công!");
      onOpenChange(false);
      setShowRejectDialog(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối khách sạn");
      console.error(error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRevoke = async () => {
    if (!onRevoke) return;
    try {
      setIsRevoking(true);
      await onRevoke(hotel._id);
      toast.success("Đã thu hồi và trả về trạng thái Nháp");
      onOpenChange(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thu hồi khách sạn");
      console.error(error);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-4xl max-h-[95vh] overflow-y-auto p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl">{hotel.name}</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Chi tiết khách sạn - Trạng thái:{" "}
              <Badge className={`${getStatusBadgeColor(hotel.status)} ml-2`}>
                {getStatusLabel(hotel.status)}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Gallery */}
            {hotel.images && hotel.images.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Hình ảnh</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-40 rounded-lg overflow-hidden border"
                    >
                      <Image
                        src={img}
                        alt={`${hotel.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
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
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">
                      Chủ sở hữu
                    </p>
                    <p className="text-base mt-1">{owner?.fullName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">
                      Email
                    </p>
                    <p className="text-base mt-1">{owner?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">
                      Điện thoại
                    </p>
                    <p className="text-base mt-1">{owner?.phone || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {hotel.description && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground font-semibold mb-3">
                    Mô tả
                  </p>
                  <p className="text-base leading-relaxed">
                    {hotel.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground font-semibold mb-3">
                    Tiện ích
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Check-in/Check-out Times */}
            <Card>
              <CardContent className="pt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Thời gian nhận phòng
                  </p>
                  <p className="text-base mt-1">{hotel.checkInTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Thời gian trả phòng
                  </p>
                  <p className="text-base mt-1">{hotel.checkOutTime}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>

            {hotel.status === "SUBMITTED" && (
              <>
                {onRevoke ? (
                  <Button type="button" onClick={handleRevoke} disabled={isRevoking}>
                    {isRevoking ? "Đang xử lý..." : "Thu hồi"}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={isRejecting}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Từ chối
                    </Button>
                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={isApproving}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {isApproving ? "Đang xử lý..." : "Duyệt"}
                    </Button>
                  </>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận từ chối</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn từ chối khách sạn &quot;{hotel.name}&quot;? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isRejecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRejecting ? "Đang xử lý..." : "Xác nhận từ chối"}
            </AlertDialogAction>
          </DialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
