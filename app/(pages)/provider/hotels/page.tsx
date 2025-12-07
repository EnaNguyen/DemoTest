// app/provider/hotels/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useUsers } from "@/app/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { HotelDetailModal } from "@/components/modals/HotelDetailModal";
import { CreateHotelModal } from "@/components/modals/ProviderCreateHotelModal";
import { EditHotelModal } from "@/components/modals/ProviderEditHotelModal";
import { ProviderHotelCard } from "@/components/cards/ProviderHotelCard";

// Import chuẩn từ app/types - Hotel đầy đủ
import type { Hotel } from "@/app/types";

export default function ProviderHotelsPage() {
  const { user, fetchWithAuth } = useAuth();
  const { getUserById } = useUsers();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Hotel["status"] | "ALL">("ALL");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Detail modal - dùng Hotel đầy đủ từ types
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailHotel, setDetailHotel] = useState<Hotel | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Submit loading
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Fetch danh sách khách sạn
  useEffect(() => {
    if (!user?._id) return;

    const fetchHotels = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/hotels?ownerId=${user._id}`);
        if (!res.ok) throw new Error("Failed to fetch hotels");
        const { data } = await res.json();
        setHotels(data || []);
      } catch (err) {
        console.error("Error fetching hotels:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, [user?._id]);

  // Lọc theo tên/địa chỉ và trạng thái
  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || hotel.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Xem chi tiết - FIX: Trả về void, không Promise
  const handleView = (hotel: Hotel) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    setDetailHotel(null);

    // Fetch async nhưng không return Promise - chỉ side effect
    fetch(`/api/hotels/${hotel._id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải chi tiết");
        return res.json();
      })
      .then((data: Hotel) => {
        setDetailHotel(data);
      })
      .catch((err) => {
        console.error("Lỗi tải chi tiết:", err);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  // Gửi duyệt
  const handleSubmitForReview = async (hotelId: string) => {
    if (!confirm("Bạn có chắc chắn muốn gửi khách sạn này để duyệt?")) return;

    setSubmittingId(hotelId);
    try {
      const res = await fetchWithAuth(`/api/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SUBMITTED" }),
      });

      if (!res.ok) throw new Error("Gửi duyệt thất bại");

      setHotels((prev) =>
        prev.map((h) => (h._id === hotelId ? { ...h, status: "SUBMITTED" } : h))
      );
    } catch (err) {
      alert("Gửi duyệt thất bại. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  // Thu hồi: chuyển SUBMITTED -> DRAFT (provider)
  const handleRevokeSubmission = async (hotelId: string) => {
    if (!confirm("Bạn có chắc chắn muốn thu hồi và trả trạng thái về Nháp?")) return;

    try {
      setSubmittingId(hotelId);
      const res = await fetchWithAuth(`/api/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DRAFT" }),
      });
      if (!res.ok) throw new Error("Thu hồi thất bại");
      const updated = await res.json();
      setHotels((prev) => prev.map((h) => (h._id === hotelId ? { ...h, ...updated } : h)));
    } catch (err) {
      console.error(err);
      alert("Thu hồi thất bại. Vui lòng thử lại.");
    } finally {
      setSubmittingId(null);
    }
  };



  // Refresh danh sách sau tạo/sửa
  const refreshHotels = async () => {
    if (!user?._id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotels?ownerId=${user._id}`);
      if (res.ok) {
        const { data } = await res.json();
        setHotels(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Khách sạn của tôi</h1>
        <p className="text-muted-foreground mt-2">Quản lý và gửi duyệt khách sạn của bạn</p>
      </div>

      {/* Tìm kiếm & lọc */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm & lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Tìm theo tên hoặc địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as Hotel["status"] | "ALL")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="SUBMITTED">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                <SelectItem value="PENDING">Đang xử lý</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateModal(true)}>Tạo khách sạn mới</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách khách sạn */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredHotels.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "ALL"
                ? "Không tìm thấy khách sạn nào phù hợp"
                : "Bạn chưa có khách sạn nào"}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>Tạo khách sạn đầu tiên</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredHotels.map((hotel) => (
            <ProviderHotelCard
              key={hotel._id}
              hotel={hotel}
              onView={handleView}
              onEdit={() => {
                setSelectedHotel(hotel);
                setShowEditModal(true);
              }}
              onDelete={() => {
                if (confirm("Xóa khách sạn này? Không thể hoàn tác.")) {
                  setHotels((prev) => prev.filter((h) => h._id !== hotel._id));
                }
              }}
              onSubmit={handleSubmitForReview}
              isSubmitting={submittingId === hotel._id}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateHotelModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          refreshHotels();
        }}
      />

      {selectedHotel && (
        <EditHotelModal
          hotel={selectedHotel}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedHotel(null);
            refreshHotels();
          }}
        />
      )}

      <HotelDetailModal
        hotel={detailHotel}
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open);
          if (!open) {
            setDetailHotel(null);
            setDetailLoading(false);
          }
        }}
        owner={detailHotel ? getUserById(detailHotel.ownerId) || null : null}
        onRevoke={handleRevokeSubmission}
      />
    </div>
  );
}