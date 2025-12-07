"use client";

import Link from "next/link";
import { useHotels } from "@/app/contexts/HotelContext";
import { HotelCard } from "@/components/cards/HotelCard";
import { HotelFilters } from "@/components/filters/HotelFilters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hotel as HotelIcon, Search } from "lucide-react";

export function HotelList() {
  const { getFilteredHotels, hotels } = useHotels();
  const filteredHotels = getFilteredHotels();

  // Nếu không có khách sạn nào
  if (hotels.length === 0) {
    return (
      <Card className="text-center py-16">
        <CardContent>
          <HotelIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Chưa có khách sạn nào trong hệ thống
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80">
          <HotelFilters />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">
                Tìm thấy{" "}
                <span className="text-primary">{filteredHotels.length}</span> khách
                sạn
              </h3>
              {filteredHotels.length !== hotels.length && (
                <p className="text-sm text-muted-foreground mt-1">
                  từ tổng số {hotels.length} khách sạn
                </p>
              )}
            </div>
          </div>
          {filteredHotels.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Không tìm thấy khách sạn nào</CardTitle>
                <CardDescription>
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Không có khách sạn phù hợp với điều kiện lọc hiện tại
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredHotels.map((hotel) => (
                <HotelCard
                  key={hotel._id}
                  hotel={hotel}
                  onClick={() => {}}
                  action={
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <Link href={`/admin/hotels/${hotel._id}`}>
                          Xem chi tiết
                        </Link>
                      </Button>
                      {hotel.status === "SUBMITTED" && (
                        <Badge variant="secondary" className="animate-pulse">
                          Chờ duyệt
                        </Badge>
                      )}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}