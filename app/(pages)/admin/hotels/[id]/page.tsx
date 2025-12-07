"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
// AdminLayout is provided by the admin segment layout (app/(pages)/admin/layout.tsx)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, ChevronLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";

const hotelStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

interface Hotel {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  images: string[];
  amenities: string[];
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PENDING";
  price: number;
  maxGuests: number;
  rooms: number;
  ownerId: string;
  owner?: { fullname?: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
}

export default function AdminHotelDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { isAuthenticated, isLoading, user, fetchWithAuth } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
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

    const fetchHotelDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetchWithAuth(`/api/hotels/${id}`);
        if (!response.ok) throw new Error("Failed to fetch hotel");
        const data = await response.json();
        setHotel(data);

        // Fetch owner details
        if (data.ownerId) {
          const ownerResponse = await fetchWithAuth(`/api/users/${data.ownerId}`);
          if (ownerResponse.ok) {
            setOwner(await ownerResponse.json());
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hotel");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, [initialized, id, fetchWithAuth]);

  const handleApprove = async () => {
    try {
      setUpdating(true);
      const response = await fetchWithAuth(`/api/hotels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!response.ok) throw new Error("Failed to approve hotel");
      const updated = await response.json();
      setHotel(updated);
      setShowApproveDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve hotel");
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    try {
      setUpdating(true);
      const response = await fetchWithAuth(`/api/hotels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", rejectReason }),
      });
      if (!response.ok) throw new Error("Failed to reject hotel");
      const updated = await response.json();
      setHotel(updated);
      setShowRejectDialog(false);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject hotel");
    } finally {
      setUpdating(false);
    }
  };

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

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-500">Hotel not found</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{hotel.name}</h1>
          <Badge className={hotelStatusColors[hotel.status]}>
            {hotel.status}
          </Badge>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}


        {hotel.images && hotel.images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotel.images.map((image, idx) => (
                  <div key={idx} className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${hotel.name} - ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        <Card>
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{hotel.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-semibold">${hotel.price}/night</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold">{hotel.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Max Guests</p>
                <p className="font-semibold">{hotel.maxGuests}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{hotel.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rooms</p>
                <p className="font-semibold">{hotel.rooms}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{hotel.email}</p>
              </div>
            </div>

            {hotel.description && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-semibold mt-2">{hotel.description}</p>
              </div>
            )}

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        {owner && (
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Provider Name</p>
                <p className="font-semibold">{owner.fullname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{owner.email}</p>
              </div>
              {owner.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{owner.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}


        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotel.createdAt && (
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold">
                  {new Date(hotel.createdAt).toLocaleString()}
                </p>
              </div>
            )}
            {hotel.updatedAt && (
              <div>
                <p className="text-sm text-gray-600">Updated</p>
                <p className="font-semibold">
                  {new Date(hotel.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>


        {hotel.status === "SUBMITTED" && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>Approve or reject this submitted hotel</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                onClick={() => setShowApproveDialog(true)}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={updating}
                variant="destructive"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {hotel.status !== "SUBMITTED" && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
                {hotel.status === "APPROVED" && "✅ Hotel has been approved"}
                {hotel.status === "REJECTED" && "❌ Hotel has been rejected"}
                {hotel.status === "DRAFT" && "📝 Hotel is still in draft state"}
              </p>
            </CardContent>
          </Card>
        )}


      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Hotel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this hotel? The provider will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            disabled={updating}
            className="bg-green-600 hover:bg-green-700"
          >
            {updating ? "Approving..." : "Approve"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>


      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Hotel</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this hotel submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={updating || !rejectReason.trim()}
                variant="destructive"
              >
                {updating ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
