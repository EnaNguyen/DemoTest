"use client"; 

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { Hotel, HotelStatus, HotelStatusFilter, RoomType } from "@/app/types";
import mockData from "@/app/data/mockData.json";

interface HotelState {
  hotels: Hotel[];
  roomTypes: RoomType[];
  selectedHotel: Hotel | null;
  filters: {
    status?: HotelStatusFilter;
    searchQuery?: string;
    starRating?: number;
  }
}

type HotelAction =
  | { type: "SET_HOTELS"; payload: Hotel[] }
  | { type: "ADD_HOTEL"; payload: Hotel }
  | { type: "UPDATE_HOTEL"; payload: Hotel }
  | { type: "DELETE_HOTEL"; payload: string }
  | { type: "SET_SELECTED_HOTEL"; payload: Hotel | null }
  | { type: "SET_FILTERS"; payload: Partial<HotelState["filters"]> }
  | { type: "ADD_ROOM_TYPE"; payload: RoomType };

interface HotelContextValue extends HotelState {
  createHotel: (hotel: Omit<Hotel, "_id" | "createdAt">) => Hotel;
  updateHotel: (hotelId: string, updates: Partial<Hotel>) => void;
  deleteHotel: (hotelId: string) => void;
  submitHotel: (hotelId: string) => void;
  approveHotel: (hotelId: string) => void;
  rejectHotel: (hotelId: string) => void;
  setSelectedHotel: (hotel: Hotel | null) => void;
  setFilters: (filters: Partial<HotelState["filters"]>) => void;
  getHotelsByOwner: (ownerId: string) => Hotel[];
  getFilteredHotels: () => Hotel[];
  getRoomTypesByHotel: (hotelId: string) => RoomType[];
  addRoomType: (roomType: Omit<RoomType, "_id">) => void;
}

const HotelContext = createContext<HotelContextValue | undefined>(undefined);

const hotelReducer = (state: HotelState, action: HotelAction): HotelState => {
  switch (action.type) {
    case "ADD_HOTEL":
      return { ...state, hotels: [...state.hotels, action.payload] };
    case "UPDATE_HOTEL":
      return {
        ...state,
        hotels: state.hotels.map((h) =>
          h._id === action.payload._id ? action.payload : h
        ),
        selectedHotel:
          state.selectedHotel?._id === action.payload._id
            ? action.payload
            : state.selectedHotel,
      };
    case "DELETE_HOTEL":
      return {
        ...state,
        hotels: state.hotels.filter((h) => h._id !== action.payload),
      };
    case "SET_SELECTED_HOTEL":
      return { ...state, selectedHotel: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "ADD_ROOM_TYPE":
      return { ...state, roomTypes: [...state.roomTypes, action.payload] };
    default:
      return state;
  }
};

const initialState: HotelState = {
  hotels: (mockData.mockHotels as Hotel[]) || [],
  roomTypes: (mockData.mockRoomTypes as RoomType[]) || [],
  selectedHotel: null,
  filters: {},
};

export function HotelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(hotelReducer, initialState);

  const createHotel = useCallback((hotelData: Omit<Hotel, "_id" | "createdAt">): Hotel => {
    const newHotel: Hotel = {
      ...hotelData,
      _id: `hotel_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "DRAFT" as HotelStatus,
    };
    dispatch({ type: "ADD_HOTEL", payload: newHotel });
    return newHotel;
  }, []);

  const updateHotel = useCallback((hotelId: string, updates: Partial<Hotel>) => {
    const hotel = state.hotels.find((h) => h._id === hotelId);
    if (hotel) {
      const updated = { ...hotel, ...updates };
      dispatch({ type: "UPDATE_HOTEL", payload: updated });
    }
  }, [state.hotels]);

  const approveHotel = useCallback((hotelId: string) => {
    updateHotel(hotelId, { status: "APPROVED" as HotelStatus });
  }, [updateHotel]);

  const rejectHotel = useCallback((hotelId: string) => {
    updateHotel(hotelId, { status: "REJECTED" as HotelStatus });
  }, [updateHotel]);

  const submitHotel = useCallback((hotelId: string) => {
    updateHotel(hotelId, { status: "SUBMITTED" as HotelStatus });
  }, [updateHotel]);

  const setFilters = useCallback((filters: Partial<HotelState["filters"]>) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const getFilteredHotels = useCallback(() => {
    let filtered = state.hotels;

    if (state.filters.status && state.filters.status !== "ALL") {
      filtered = filtered.filter((h) => h.status === state.filters.status);
    }

    if (state.filters.searchQuery) {
      const q = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q)
      );
    }

    if (state.filters.starRating != null) {
      filtered = filtered.filter((h) => h.starRating >= state.filters.starRating!);
    }

    return filtered;
  }, [state.hotels, state.filters]);

  const getRoomTypesByHotel = useCallback((hotelId: string) => {
    return state.roomTypes.filter((rt) => rt.hotelId === hotelId);
  }, [state.roomTypes]);

  return (
    <HotelContext.Provider
      value={{
        ...state,
        createHotel,
        updateHotel,
        deleteHotel: (id: string) => dispatch({ type: "DELETE_HOTEL", payload: id }),
        submitHotel,
        approveHotel,
        rejectHotel,
        setSelectedHotel: (hotel) => dispatch({ type: "SET_SELECTED_HOTEL", payload: hotel }),
        setFilters,
        getHotelsByOwner: (ownerId) => state.hotels.filter((h) => h.ownerId === ownerId),
        getFilteredHotels,
        getRoomTypesByHotel,
        addRoomType: (data) => {
          const rt: RoomType = { ...data, _id: `rt_${Date.now()}` };
          dispatch({ type: "ADD_ROOM_TYPE", payload: rt });
        },
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export function useHotels(): HotelContextValue {
  const context = useContext(HotelContext);
  if (!context) throw new Error("useHotels must be used within HotelProvider");
  return context;
}