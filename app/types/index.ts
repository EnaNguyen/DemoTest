export type UserRole = "client" | "provider" | "admin";
export type UserStatus = "active" | "inactive" | "banned";

export type HotelStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PENDING";
export type HotelStatusFilter = HotelStatus | "ALL";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no-show";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export type RoomStatus = "available" | "booked" | "maintenance" | "cleaning";

export interface User {
  _id: string;
  fullName: string;
  gender: string;
  age: number;
  birthday: string;
  idCard: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  status: UserStatus;
  createdAt: string;
  businessLicense?: string;
  address?: string;
  businessType?: string;
  taxCode?: string;
}

export interface Hotel {
  _id: string;
  ownerId: string;
  name: string;
  slug: string;
  address: string;
  description: string;
  businessTypes: string[];
  starRating: number;
  totalRooms: number;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  status: HotelStatus;
  images: string[];
  createdAt: string;

  phone?: string;
  email?: string;
  price?: number;
  maxGuests?: number;
  rooms?: number;
}

export interface RoomType {
  _id: string;
  hotelId: string;
  name: string;
  slug?: string;
  capacity: number;
  bedType: string;
  size: number;
  description?: string;
  amenities: string[];
  basePrice: number;
  images: string[];
}

export interface Room {
  _id: string;
  hotelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
}

export interface Booking {
  _id: string;
  customerId: string;
  hotelId: string;
  roomIds: string[];
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  specialRequests?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  hotelId: string;
  customerId: string;
  bookingId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export interface Payment {
  _id: string;
  bookingId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionId: string;
  paidAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export interface RequestState {
  loading: boolean;
  error: string | null;
  success: boolean;
}
