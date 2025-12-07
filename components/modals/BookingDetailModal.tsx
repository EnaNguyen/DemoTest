"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId?: string | null;
}

const bookingStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  "no-show": "bg-gray-100 text-gray-800",
};

export default function BookingDetailModal({ open, onOpenChange, bookingId }: Props) {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any | null>(null);
  const [hotel, setHotel] = useState<any | null>(null);
  const [guest, setGuest] = useState<any | null>(null);

  useEffect(() => {
    if (!open || !bookingId) return;

    const fetchBookingDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchWithAuth(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error("Failed to fetch booking");
        const data = await res.json();
        setBooking(data);

        if (data.hotelId) {
          const h = await fetchWithAuth(`/api/hotels/${data.hotelId}`);
          if (h.ok) setHotel(await h.json());
        }

        if (data.userId) {
          const u = await fetchWithAuth(`/api/users/${data.userId}`);
          if (u.ok) setGuest(await u.json());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [open, bookingId, fetchWithAuth]);

  const rawCheckIn = booking?.checkIn || booking?.checkInDate;
  const rawCheckOut = booking?.checkOut || booking?.checkOutDate;
  const checkInDate = rawCheckIn ? new Date(rawCheckIn) : null;
  const checkOutDate = rawCheckOut ? new Date(rawCheckOut) : null;
  const nights = checkInDate && checkOutDate && !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const roomIds: string[] = booking?.roomIds || [];
  const numberOfRooms = booking?.numberOfRooms || (Array.isArray(roomIds) ? roomIds.length : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-white border-b p-6 pb-4 z-10">
          <DialogTitle className="text-2xl font-bold">Booking Details</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-700">{error}</p>
                <div className="mt-4">
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              </CardContent>
            </Card>
          ) : booking ? (
            <div className="space-y-6">
              {/* Hotel */}
              {hotel && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hotel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {hotel.images && hotel.images.length > 0 && (
                        <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                          <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover" />
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

              {/* Guest */}
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

              {/* Booking Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-semibold">{checkInDate ? checkInDate.toLocaleDateString() + ' at 2:00 PM' : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-semibold">{checkOutDate ? checkOutDate.toLocaleDateString() + ' at 11:00 AM' : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Number of Nights</p>
                      <p className="font-semibold">{nights} night{nights !== 1 ? 's' : ''}</p>
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
                      <Badge className={bookingStatusColors[booking.status] || 'bg-gray-100'}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
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

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per night</span>
                    <span className="font-semibold">${hotel?.price ?? 'N/A'}</span>
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

              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
