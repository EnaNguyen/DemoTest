"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { Booking, BookingStatus } from "@/app/types";
import mockData from "@/app/data/mockData.json";

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  filters: {
    status?: BookingStatus;
    customerId?: string;
    hotelId?: string;
  };
}

type BookingAction =
  | { type: "ADD_BOOKING"; payload: Booking }
  | { type: "UPDATE_BOOKING"; payload: Booking }
  | { type: "DELETE_BOOKING"; payload: string }
  | { type: "SET_SELECTED_BOOKING"; payload: Booking | null }
  | { type: "SET_FILTERS"; payload: Partial<BookingState["filters"]> };

interface BookingContextValue extends BookingState {
  createBooking: (booking: Omit<Booking, "_id" | "createdAt">) => Booking;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  cancelBooking: (bookingId: string) => void;
  confirmBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  setFilters: (filters: Partial<BookingState["filters"]>) => void;
  getBookingsByCustomer: (customerId: string) => Booking[];
  getBookingsByHotel: (hotelId: string) => Booking[];
  getFilteredBookings: () => Booking[];
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case "ADD_BOOKING":
      return { ...state, bookings: [...state.bookings, action.payload] };

    case "UPDATE_BOOKING":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b._id === action.payload._id ? action.payload : b
        ),
        selectedBooking:
          state.selectedBooking?._id === action.payload._id
            ? action.payload
            : state.selectedBooking,
      };

    case "DELETE_BOOKING":
      return {
        ...state,
        bookings: state.bookings.filter((b) => b._id !== action.payload),
      };

    case "SET_SELECTED_BOOKING":
      return { ...state, selectedBooking: action.payload };

    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };

    default:
      return state;
  }
};

const initialState: BookingState = {
  bookings: (mockData.mockBookings as Booking[]) || [],
  selectedBooking: null,
  filters: {},
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const createBooking = useCallback(
    (bookingData: Omit<Booking, "_id" | "createdAt">): Booking => {
      const newBooking: Booking = {
        ...bookingData,
        _id: `booking_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "pending" as BookingStatus,
      };
      dispatch({ type: "ADD_BOOKING", payload: newBooking });
      return newBooking;
    },
    []
  );

  const updateBooking = useCallback(
    (bookingId: string, updates: Partial<Booking>) => {
      const booking = state.bookings.find((b) => b._id === bookingId);
      if (booking) {
        const updated = { ...booking, ...updates };
        dispatch({ type: "UPDATE_BOOKING", payload: updated });
        // Persist change to mock data on the server
        try {
          fetch(`/api/bookings/${bookingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          }).then(async (res) => {
            if (!res.ok) {
              let bodyText: unknown = undefined;
              try {
                bodyText = await res.json();
              } catch {
                try {
                  bodyText = await res.text();
                } catch {
                  bodyText = undefined;
                }
              }
              console.error("Failed to persist booking update; status:", res.status, "body:", bodyText);
            }
          }).catch((e) => console.error("Error persisting booking update:", e));
        } catch (e) {
          console.error("Error starting persist request:", e);
        }
      }
    },
    [state.bookings]
  );

  const cancelBooking = useCallback(
    (bookingId: string) => {
      updateBooking(bookingId, { status: "cancelled" as BookingStatus });
    },
    [updateBooking]
  );

  const confirmBooking = useCallback(
    (bookingId: string) => {
      updateBooking(bookingId, { status: "confirmed" as BookingStatus });
    },
    [updateBooking]
  );

  const completeBooking = useCallback(
    (bookingId: string) => {
      updateBooking(bookingId, { status: "completed" as BookingStatus });
    },
    [updateBooking]
  );

  const setSelectedBooking = useCallback((booking: Booking | null) => {
    dispatch({ type: "SET_SELECTED_BOOKING", payload: booking });
  }, []);

  const setFilters = useCallback((filters: Partial<BookingState["filters"]>) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const getBookingsByCustomer = useCallback(
    (customerId: string) => state.bookings.filter((b) => b.customerId === customerId),
    [state.bookings]
  );

  const getBookingsByHotel = useCallback(
    (hotelId: string) => state.bookings.filter((b) => b.hotelId === hotelId),
    [state.bookings]
  );

  const getFilteredBookings = useCallback(() => {
    let filtered = [...state.bookings];

    if (state.filters.status) {
      filtered = filtered.filter((b) => b.status === state.filters.status);
    }
    if (state.filters.customerId) {
      filtered = filtered.filter((b) => b.customerId === state.filters.customerId);
    }
    if (state.filters.hotelId) {
      filtered = filtered.filter((b) => b.hotelId === state.filters.hotelId);
    }

    return filtered;
  }, [state.bookings, state.filters]);

  return (
    <BookingContext.Provider
      value={{
        ...state,
        createBooking,
        updateBooking,
        cancelBooking,
        confirmBooking,
        completeBooking,
        setSelectedBooking,
        setFilters,
        getBookingsByCustomer,
        getBookingsByHotel,
        getFilteredBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
}