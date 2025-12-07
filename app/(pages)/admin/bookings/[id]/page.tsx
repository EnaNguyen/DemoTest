"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
// AdminLayout is provided by the admin segment layout (app/(pages)/admin/layout.tsx)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, AlertCircle } from "lucide-react";
import mockData from "@/app/data/mockData.json";
import Image from "next/image";

const bookingStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  "no-show": "bg-gray-100 text-gray-800",
};

interface Booking {
  _id: string;
  hotelId: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfRooms: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  paymentStatus: "pending" | "completed" | "refunded";
  specialRequests?: string;
  createdAt?: string;
  updatedAt?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  roomTypeId?: string;
  roomIds?: string[];
  hotel?: {
    _id: string;
    name: string;
    address: string;
    images?: string[];
    price?: number;
  };
  user?: {
    _id: string;
    fullname: string;
    email: string;
    phone?: string;
  };
}

interface Hotel {
  _id: string;
  name: string;
  address: string;
  images?: string[];
  price?: number;
}

interface User {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
}

export default function AdminBookingDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { isAuthenticated, isLoading, user, fetchWithAuth } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [guest, setGuest] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/");
      return;
    }
    setInitialized(true);
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (!initialized) return;

    const fetchBookingDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetchWithAuth(`/api/bookings/${id}`);
        if (!response.ok) throw new Error("Failed to fetch booking");
        const data = await response.json();
        setBooking(data);

        // Fetch hotel details
        if (data.hotelId) {
          const hotelResponse = await fetchWithAuth(`/api/hotels/${data.hotelId}`);
          if (hotelResponse.ok) {
            setHotel(await hotelResponse.json());
          }
        }

        // Fetch user/guest details
        if (data.userId) {
          const userResponse = await fetchWithAuth(`/api/users/${data.userId}`);
          if (userResponse.ok) {
            setGuest(await userResponse.json());
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [initialized, id, fetchWithAuth]);

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-500">Booking not found</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const rawCheckIn = booking.checkIn || booking.checkInDate;
  const rawCheckOut = booking.checkOut || booking.checkOutDate;
  const checkInDate = rawCheckIn ? new Date(rawCheckIn) : null;
  const checkOutDate = rawCheckOut ? new Date(rawCheckOut) : null;
  const nights = checkInDate && checkOutDate && !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const roomIds: string[] = booking.roomIds || [];
  const numberOfRooms: number = booking.numberOfRooms || (Array.isArray(roomIds) ? roomIds.length : 0);

  let pricePerNightPerRoom: number | null = null;
  try {
    const mockRooms: Array<{ _id: string; roomTypeId?: string }> = mockData.mockRooms || [];
    const mockRoomTypes: Array<{ _id: string; basePrice?: number }> = mockData.mockRoomTypes || [];
    const basePrices: number[] = [];
    if (Array.isArray(roomIds) && roomIds.length > 0) {
      for (const rid of roomIds) {
        const room = mockRooms.find((r) => r._id === rid);
        const roomTypeId = room?.roomTypeId || booking.roomTypeId;
        if (roomTypeId) {
          const rt = mockRoomTypes.find((t) => t._id === roomTypeId);
          if (rt && typeof rt.basePrice === 'number') basePrices.push(rt.basePrice);
        }
      }
    } else if (booking.roomTypeId) {
      const rt = mockRoomTypes.find((t) => t._id === booking.roomTypeId);
      if (rt && typeof rt.basePrice === 'number') basePrices.push(rt.basePrice);
    }
    if (basePrices.length > 0) {
      const sum = basePrices.reduce((a, b) => a + b, 0);
      pricePerNightPerRoom = Math.round(sum / basePrices.length);
    }
  } catch {
    pricePerNightPerRoom = null;
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <Badge className={bookingStatusColors[booking.status]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {hotel && (
          <Card>
            <CardHeader>
              <CardTitle>Hotel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hotel.images && hotel.images.length > 0 && (
                  <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={hotel.images[0]}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className={hotel.images && hotel.images.length > 0 ? "md:col-span-2" : "md:col-span-3"}>
                  <p className="text-sm text-gray-600">Hotel Name</p>
                  <p className="text-lg font-semibold">{hotel.name}</p>
                  <p className="text-sm text-gray-600 mt-2">Address</p>
                  <p className="font-semibold">{hotel.address}</p>
                  {hotel.price && (
                    <>
                      <p className="text-sm text-gray-600 mt-2">Price per Night</p>
                      <p className="font-semibold">${hotel.price}</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {guest && (
          <Card>
            <CardHeader>
              <CardTitle>Guest</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{guest.fullname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{guest.email}</p>
              </div>
              {guest.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{guest.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Check-in</p>
                <p className="font-semibold">
                  {checkInDate ? checkInDate.toLocaleDateString() : "N/A"} {checkInDate ? "at 2:00 PM" : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out</p>
                <p className="font-semibold">
                  {checkOutDate ? checkOutDate.toLocaleDateString() : "N/A"} {checkOutDate ? "at 11:00 AM" : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Nights</p>
                <p className="font-semibold">{nights} night{nights !== 1 ? "s" : ""}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Guests</p>
                <p className="font-semibold">{(booking.adults ?? booking.numberOfGuests ?? 0) + (booking.children ?? 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Rooms</p>
                <p className="font-semibold">{numberOfRooms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={bookingStatusColors[booking.status]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">Special Requests</p>
                <p className="font-semibold mt-2">{booking.specialRequests}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Details */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Price per night</span>
              <span className="font-semibold">${pricePerNightPerRoom ?? hotel?.price ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of nights</span>
              <span className="font-semibold">{nights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of rooms</span>
              <span className="font-semibold">{numberOfRooms}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg">
              <span className="font-semibold">Total Price</span>
              <span className="font-bold text-green-600">${booking.totalPrice}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={
              booking.paymentStatus === "completed"
                ? "bg-green-100 text-green-800"
                : booking.paymentStatus === "refunded"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </Badge>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booking.createdAt && (
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold">
                  {new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>
            )}
            {booking.updatedAt && (
              <div>
                <p className="text-sm text-gray-600">Updated</p>
                <p className="font-semibold">
                  {new Date(booking.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
}
