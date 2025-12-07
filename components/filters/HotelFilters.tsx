"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useHotels } from "@/app/contexts/HotelContext";
import type { HotelStatusFilter } from "@/app/types";

export function HotelFilters() {
  const { filters, setFilters } = useHotels();

  const currentStatus = filters.status ?? "ALL";
  const currentRating = filters.starRating?.toString() ?? "ALL";

  const handleStatusChange = (value: string) => {
    setFilters({
      status: value === "ALL" ? undefined : (value as HotelStatusFilter),
    });
  };

  const handleRatingChange = (value: string) => {
    setFilters({
      starRating: value === "ALL" ? undefined : Number(value),
    });
  };

  const handleSearchChange = (value: string) => {
    setFilters({ searchQuery: value || undefined });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="flex-1 min-w-0">
        <label className="text-sm font-medium mb-2 block">Tìm kiếm</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tên, địa chỉ..."
            value={filters.searchQuery || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-full sm:w-48">
        <label className="text-sm font-medium mb-2 block">Trạng thái</label>
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="DRAFT">Nháp</SelectItem>
            <SelectItem value="SUBMITTED">Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
            <SelectItem value="REJECTED">Bị từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-48">
        <label className="text-sm font-medium mb-2 block">Số sao tối thiểu</label>
        <Select value={currentRating} onValueChange={handleRatingChange}>
          <SelectTrigger>
            <SelectValue placeholder="Bất kỳ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Bất kỳ</SelectItem>
            <SelectItem value="5">5 sao</SelectItem>
            <SelectItem value="4">4+ sao</SelectItem>
            <SelectItem value="3">3+ sao</SelectItem>
            <SelectItem value="2">2+ sao</SelectItem>
            <SelectItem value="1">1+ sao</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}