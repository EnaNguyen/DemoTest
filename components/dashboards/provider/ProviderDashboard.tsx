"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { Hotel as HotelType, Booking } from "@/app/types";

export function ProviderDashboard() {
  const { user, fetchWithAuth } = useAuth();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      setIsLoading(true);
      try {
        // Fetch provider's hotels
        const hotelsRes = await fetchWithAuth("/api/hotels?ownerId=" + user._id);
        if (hotelsRes.ok) {
          const data = await hotelsRes.json();
          setHotels(data.data || []);
        }
        // Fetch provider's bookings
        const bookingsRes = await fetchWithAuth("/api/bookings?providerId=" + user._id);
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?._id, fetchWithAuth]);

  const stats = {
    totalHotels: hotels.length,
    draftHotels: hotels.filter(h => h.status === "DRAFT").length,
    submittedHotels: hotels.filter(h => h.status === "SUBMITTED").length,
    approvedHotels: hotels.filter(h => h.status === "APPROVED").length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === "pending").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Chào mừng quay lại, {user?.fullName}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khách sạn</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHotels}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draftHotels} nháp, {stats.submittedHotels} chờ duyệt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách sạn đã duyệt</CardTitle>
            <Hotel className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedHotels}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đặt phòng</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingBookings} chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hành động</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/provider/hotels/create">
              <Button size="sm" className="w-full">
                Tạo khách sạn
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Hotels */}
          <Card>
            <CardHeader>
              <CardTitle>Khách sạn gần đây</CardTitle>
              <CardDescription>Những khách sạn được cập nhật gần đây nhất</CardDescription>
            </CardHeader>
            <CardContent>
              {hotels.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có khách sạn nào</p>
              ) : (
                <div className="space-y-4">
                  {hotels.slice(0, 5).map((hotel) => (
                    <div key={hotel._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{hotel.name}</p>
                        <p className="text-xs text-muted-foreground">{hotel.status}</p>
                      </div>
                      <Link href={`/provider/hotels/${hotel._id}`}>
                        <Button variant="ghost" size="sm">Xem</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Đặt phòng gần đây</CardTitle>
              <CardDescription>Những đặt phòng được tạo gần đây nhất</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có đặt phòng nào</p>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Booking #{booking._id.slice(-4)}</p>
                        <p className="text-xs text-muted-foreground">{booking.status}</p>
                      </div>
                      <Link href={`/provider/bookings/${booking._id}`}>
                        <Button variant="ghost" size="sm">Xem</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
