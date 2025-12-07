"use client";

import Image from "next/image";
import { Hotel } from "@/app/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Star, Eye } from "lucide-react";

interface HotelCardProps {
  hotel: Hotel;
  onStatusChange?: (hotelId: string, newStatus: "APPROVED" | "REJECTED") => Promise<void>;
  onDetailClick?: () => void;
  onClick?: () => void;
  showStatusBadge?: boolean;
}

export function HotelCard({ hotel, onStatusChange, onDetailClick, onClick, showStatusBadge = true }: HotelCardProps) {
  const getStatusColor = (status: Hotel["status"]) => {
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

  const handleStatusChange = async (newStatus: string) => {
    if (onStatusChange && (newStatus === "APPROVED" || newStatus === "REJECTED")) {
      await onStatusChange(hotel._id, newStatus);
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {hotel.images && hotel.images[0] ? (
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        {showStatusBadge && (
          <div className="absolute top-3 right-3">
            <Badge className={getStatusColor(hotel.status)}>
              {hotel.status === "SUBMITTED" && "Chờ duyệt"}
              {hotel.status === "APPROVED" && "Đã duyệt"}
              {hotel.status === "REJECTED" && "Bị từ chối"}
              {hotel.status === "DRAFT" && "Nháp"}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {hotel.name}
          </CardTitle>
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-semibold">{hotel.starRating}</span>
          </div>
        </div>
        <CardDescription className="flex items-center gap-1 text-sm mt-1">
          <MapPin className="h-4 w-4" />
          {hotel.address}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {hotel.description || "Chưa có mô tả"}
        </p>

        {/* Tiện ích */}
        {hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {hotel.amenities.slice(0, 4).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {hotel.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{hotel.amenities.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4">
        {/* Status change combo box for SUBMITTED hotels */}
        {hotel.status === "SUBMITTED" && onStatusChange && (
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Thao tác" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APPROVED">Duyệt</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Detail button - always full width at bottom */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onDetailClick?.();
          }}
        >
          <Eye className="h-4 w-4 mr-2" /> Chi tiết
        </Button>
      </CardFooter>
    </Card>
  );
}