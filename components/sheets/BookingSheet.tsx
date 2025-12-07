"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  BookingStatusModal,
  BookingStatusModalHeader,
  BookingStatusModalBody,
  BookingStatusModalFooter,
} from "@/components/modals/BookingStatusModal";
import { BookingStatusSelector } from "@/components/modals/BookingStatusSelector";
import {
  PaymentStatusModal,
  PaymentStatusModalHeader,
  PaymentStatusModalBody,
  PaymentStatusModalFooter,
} from "@/components/modals/PaymentStatusModal";
import { PaymentStatusSelector } from "@/components/modals/PaymentStatusSelector";
import { Booking, Hotel, User, BookingStatus, PaymentStatus } from "@/app/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye, Trash2 } from "lucide-react";

interface BookingSheetProps {
  bookings: Booking[];
  hotels?: Hotel[];
  users?: User[];
  onView?: (booking: Booking) => void;
  onDelete?: (bookingId: string) => void;
  onStatusChange?: (bookingId: string, newStatus: BookingStatus) => void;
  onPaymentStatusChange?: (bookingId: string, newStatus: PaymentStatus) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Hủy",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  refunded: "Hoàn tiền",
  failed: "Thất bại",
};

const ITEMS_PER_PAGE = 10;

export function BookingSheet({
  bookings,
  hotels = [],
  users = [],
  onView,
  onDelete,
  onStatusChange,
  onPaymentStatusChange,
}: BookingSheetProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Booking status modal state
  const [bookingStatusModalOpen, setBookingStatusModalOpen] = useState(false);
  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState<Booking | null>(null);
  const [nextBookingStatus, setNextBookingStatus] = useState<BookingStatus | null>(null);
  
  // Payment status modal state
  const [paymentStatusModalOpen, setPaymentStatusModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [nextPaymentStatus, setNextPaymentStatus] = useState<PaymentStatus | null>(null);

  const hotelMap = useMemo(() => {
    return new Map(hotels.map((h) => [h._id, h]));
  }, [hotels]);

  const userMap = useMemo(() => {
    return new Map(users.map((u) => [u._id, u]));
  }, [users]);

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((booking) => {
        const customer = userMap.get(booking.customerId);
        const hotel = hotelMap.get(booking.hotelId);
        return (
          booking._id.toLowerCase().includes(query) ||
          customer?.fullName.toLowerCase().includes(query) ||
          hotel?.name.toLowerCase().includes(query)
        );
      });
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    return filtered;
  }, [bookings, searchQuery, statusFilter, hotelMap, userMap]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Tìm mã đơn, tên khách, khách sạn..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ xác nhận</SelectItem>
            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="cancelled">Hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Khách sạn</TableHead>
              <TableHead>Check-in / Check-out</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((booking) => {
                const customer = userMap.get(booking.customerId);
                const hotel = hotelMap.get(booking.hotelId);
                const checkInDate = new Date(booking.checkIn);
                const checkOutDate = new Date(booking.checkOut);

                return (
                  <TableRow key={booking._id}>
                    <TableCell className="font-mono text-sm">{booking._id}</TableCell>
                    <TableCell>{customer?.fullName || "N/A"}</TableCell>
                    <TableCell>{hotel?.name || "N/A"}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {format(checkInDate, "dd/MM/yyyy", { locale: vi })}
                      </div>
                      <div className="text-muted-foreground">
                        {format(checkOutDate, "dd/MM/yyyy", { locale: vi })}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {booking.totalPrice.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${paymentStatusColors[booking.paymentStatus]} cursor-pointer hover:opacity-80`}
                        onClick={() => {
                          setSelectedBookingForPayment(booking);
                          setPaymentStatusModalOpen(true);
                        }}
                        title="Click để thay đổi trạng thái thanh toán"
                      >
                        {paymentStatusLabels[booking.paymentStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusColors[booking.status]} cursor-pointer hover:opacity-80`}
                        onClick={() => {
                          setSelectedBookingForStatus(booking);
                          setBookingStatusModalOpen(true);
                        }}
                        title="Click để thay đổi trạng thái đơn đặt phòng"
                      >
                        {statusLabels[booking.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(booking)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && booking.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(booking._id)}
                            title="Xóa"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy đơn đặt phòng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredBookings.length)} của{" "}
            {filteredBookings.length} đơn đặt phòng
          </p>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Booking Status Modal */}
      {selectedBookingForStatus && (
        <BookingStatusModal
          open={bookingStatusModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setBookingStatusModalOpen(false);
              setSelectedBookingForStatus(null);
              setNextBookingStatus(null);
            } else {
              setBookingStatusModalOpen(true);
            }
          }}
        >
          {nextBookingStatus ? (
            <>
              <BookingStatusModalHeader
                currentStatus={selectedBookingForStatus.status}
                newStatus={nextBookingStatus}
              />
              <BookingStatusModalBody
                currentStatus={selectedBookingForStatus.status}
                newStatus={nextBookingStatus}
                bookingId={selectedBookingForStatus._id}
              />
              <BookingStatusModalFooter
                onConfirm={() => {
                  onStatusChange?.(selectedBookingForStatus._id, nextBookingStatus);
                  setBookingStatusModalOpen(false);
                  setSelectedBookingForStatus(null);
                  setNextBookingStatus(null);
                }}
                onCancel={() => {
                  setNextBookingStatus(null);
                }}
              />
            </>
          ) : (
            <BookingStatusSelector
              currentBooking={selectedBookingForStatus}
              onStatusSelected={(status) => {
                setNextBookingStatus(status);
              }}
              onCancel={() => {
                setBookingStatusModalOpen(false);
                setSelectedBookingForStatus(null);
              }}
            />
          )}
        </BookingStatusModal>
      )}

      {/* Payment Status Modal */}
      {selectedBookingForPayment && (
        <PaymentStatusModal
          open={paymentStatusModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setPaymentStatusModalOpen(false);
              setSelectedBookingForPayment(null);
              setNextPaymentStatus(null);
            } else {
              setPaymentStatusModalOpen(true);
            }
          }}
        >
          {nextPaymentStatus ? (
            <>
              <PaymentStatusModalHeader
                currentStatus={selectedBookingForPayment.paymentStatus}
                newStatus={nextPaymentStatus}
              />
              <PaymentStatusModalBody
                currentStatus={selectedBookingForPayment.paymentStatus}
                newStatus={nextPaymentStatus}
                bookingId={selectedBookingForPayment._id}
                amount={selectedBookingForPayment.totalPrice}
              />
              <PaymentStatusModalFooter
                onConfirm={() => {
                  onPaymentStatusChange?.(selectedBookingForPayment._id, nextPaymentStatus);
                  setPaymentStatusModalOpen(false);
                  setSelectedBookingForPayment(null);
                  setNextPaymentStatus(null);
                }}
                onCancel={() => {
                  setNextPaymentStatus(null);
                }}
              />
            </>
          ) : (
            <PaymentStatusSelector
              currentBooking={selectedBookingForPayment}
              onStatusSelected={(status) => {
                setNextPaymentStatus(status);
              }}
              onCancel={() => {
                setPaymentStatusModalOpen(false);
                setSelectedBookingForPayment(null);
              }}
            />
          )}
        </PaymentStatusModal>
      )}
    </div>
  );
}
