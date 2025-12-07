import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Booking, Hotel } from "@/app/types";

const dataPath = path.join(process.cwd(), "app", "data", "mockData.json");

// GET /api/bookings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");
    const status = searchParams.get("status");

    const raw = await fs.readFile(dataPath, "utf-8");
    const data = JSON.parse(raw);
    const bookings: Booking[] = (data.mockBookings as Booking[]) || [];

    let result = [...bookings];

    // Filter by provider (by hotel owner)
    if (providerId) {
      const hotels: Hotel[] = (data.mockHotels as Hotel[]) || [];
      const hotelIds = hotels.filter((h) => h.ownerId === providerId).map((h) => h._id);
      result = result.filter((b) => hotelIds.includes(b.hotelId));
    }

    // Filter by status
    if (status && status !== "ALL") {
      result = result.filter((b) => b.status === status);
    }

    return NextResponse.json({ data: result, total: result.length });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const raw = await fs.readFile(dataPath, "utf-8");
    const data = JSON.parse(raw);
    const bookings: Booking[] = (data.mockBookings as Booking[]) || [];

    const newBooking: Booking = {
      _id: `booking_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as Booking;

    bookings.push(newBooking);
    data.mockBookings = bookings;

    await fs.writeFile(dataPath + ".bak", raw, "utf-8");
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
