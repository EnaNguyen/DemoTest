import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Booking } from "@/app/types";

const dataPath = path.join(process.cwd(), "app", "data", "mockData.json");

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const updates = await request.json();

    if (updates.status !== "cancelled") {
      return NextResponse.json(
        { error: "Only cancellation is allowed" },
        { status: 400 }
      );
    }

    const raw = await fs.readFile(dataPath, "utf-8");
    const data = JSON.parse(raw);
    const bookings: Booking[] = (data.mockBookings as Booking[]) || [];

    const bookingIndex = bookings.findIndex((b) => b._id === id);
    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const booking = bookings[bookingIndex];
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending bookings can be cancelled" },
        { status: 400 }
      );
    }

    const updatedBooking: Booking = {
      ...booking,
      status: "cancelled",
    };

    bookings[bookingIndex] = updatedBooking;
    data.mockBookings = bookings;

    await fs.writeFile(dataPath + ".bak", raw, "utf-8");
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
