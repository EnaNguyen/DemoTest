// components/modals/HotelDetailModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Loader2, ChevronLeft } from "lucide-react";
import { Hotel } from "@/app/types";

const hotelStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

const statusLabel: Record<string, string> = {
  DRAFT: "Nháp",
  SUBMITTED: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  PENDING: "Đang xử lý",
};

interface HotelDetailModalProps {
  hotel: Hotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
}

export function HotelDetailModal({
  hotel,
  open,
  onOpenChange,
  loading = false,
}: HotelDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header cố định */}
        <DialogHeader className="sticky top-0 bg-white border-b p-6 pb-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              {hotel && (
                <>
                  <DialogTitle className="text-2xl font-bold">
                    {hotel.name}
                  </DialogTitle>
                  <Badge className={hotelStatusColors[hotel.status]}>
                    {statusLabel[hotel.status]}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Nội dung */}
        <div className="p-6 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : !hotel ? (
            <div className="text-center py-12 text-muted-foreground text-lg">
              Không thể tải thông tin khách sạn.
            </div>
          ) : (
            <>
              {/* Hình ảnh */}
              {hotel.images && hotel.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hình ảnh khách sạn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {hotel.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Image
                            src={img}
                            alt={`${hotel.name} - ảnh ${idx + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Thông tin chi tiết */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Tên khách sạn</p>
                      <p className="text-lg font-semibold">{hotel.name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Giá mỗi đêm</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${hotel.price || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Địa chỉ</p>
                      <p className="text-lg font-medium">{hotel.address}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Số phòng</p>
                      <p className="text-lg font-semibold">
                        {hotel.totalRooms || hotel.rooms || "Chưa xác định"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Số khách tối đa/phòng</p>
                      <p className="text-lg font-semibold">{hotel.maxGuests || 0}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Xếp hạng</p>
                      <p className="text-lg font-semibold">
                        {hotel.starRating ? `⭐ ${hotel.starRating} sao` : "Chưa xếp hạng"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{hotel.phone || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Email liên hệ</p>
                      <p className="font-medium">{hotel.email || "N/A"}</p>
                    </div>
                  </div>

                  {/* Mô tả */}
                  {hotel.description && (
                    <div className="mt-8 pt-6 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Mô tả</p>
                      <p className="leading-relaxed text-base whitespace-pre-wrap">
                        {hotel.description}
                      </p>
                    </div>
                  )}

                  {/* Tiện ích */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                      <p className="text-sm text-muted-foreground mb-3">Tiện ích</p>
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map((item) => (
                          <Badge key={item} variant="secondary" className="text-sm py-1">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Thông báo trạng thái */}
              <div className="pt-4">
                {hotel.status === "DRAFT" && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <p className="text-blue-800 font-medium">
                        Khách sạn đang ở trạng thái Nháp. Bạn có thể chỉnh sửa hoặc gửi duyệt bất kỳ lúc nào.
                      </p>
                    </CardContent>
                  </Card>
                )}
                {hotel.status === "SUBMITTED" && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <p className="text-blue-800">
                        Đã gửi yêu cầu duyệt. Vui lòng chờ admin xem xét.
                      </p>
                    </CardContent>
                  </Card>
                )}
                {hotel.status === "APPROVED" && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <p className="text-green-800 font-medium">
                        Khách sạn đã được duyệt và đang hiển thị công khai!
                      </p>
                    </CardContent>
                  </Card>
                )}
                {hotel.status === "REJECTED" && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                      <p className="text-red-800 font-medium">
                        Yêu cầu duyệt bị từ chối. Vui lòng chỉnh sửa và gửi lại.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}