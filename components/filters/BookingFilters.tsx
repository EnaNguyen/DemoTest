"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BookingFiltersProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function BookingFilters({ searchQuery = "", onSearchChange }: BookingFiltersProps) {
  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Tìm mã đơn, tên khách..."
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
