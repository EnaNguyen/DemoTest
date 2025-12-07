"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Hotel as FullHotel } from "@/app/types";

type HotelStatus = FullHotel["status"];

interface ProviderHotelCardProps {
  hotel: FullHotel;
  onView: (hotel: FullHotel) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSubmit: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

const statusColors: Record<HotelStatus, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PENDING: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<HotelStatus, string> = {
  DRAFT: "Nháp",
  SUBMITTED: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  PENDING: "Đang xử lý",
};

export function ProviderHotelCard({
  hotel,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  isSubmitting,
}: ProviderHotelCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {hotel && hotel.images && hotel.images.length > 0 ? (
            <div className="w-full lg:w-48 flex-shrink-0 rounded-md overflow-hidden mr-4">
              <div className="relative h-40 lg:h-28 w-full">
                <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover" />
              </div>
            </div>
          ) : null}

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <Badge className={statusColors[hotel.status]}>
                {statusLabels[hotel.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{hotel.address}</p>
            <p className="text-sm text-muted-foreground">
              {(hotel.totalRooms || hotel.rooms || 0)} phòng •{" "}
              {hotel.starRating ? `⭐ ${hotel.starRating} sao` : "Chưa xếp hạng"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onView(hotel)}>
              <Eye className="h-4 w-4 mr-2" />
              Xem
            </Button>

            {hotel.status === "DRAFT" && (
              <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Sửa
                </Button>

                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onSubmit(hotel._id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi duyệt
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </Button>
              </>
            )}

            {hotel.status === "SUBMITTED" && (
              <Badge variant="secondary">Đã gửi duyệt</Badge>
            )}
            {hotel.status === "APPROVED" && (
              <Badge className="bg-green-600">Đã được duyệt</Badge>
            )}
            {hotel.status === "REJECTED" && (
              <Badge variant="destructive">Bị từ chối</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}