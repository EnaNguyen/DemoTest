import { NextResponse, NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Booking, Hotel } from "@/app/types";
import { verify } from "@/lib/jwt";

type JwtPayload = { sub?: string; role?: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const dataPath = path.join(process.cwd(), "app", "data", "mockData.json");
    const raw = await fs.readFile(dataPath, "utf-8");

    interface MockDataType {
      mockBookings?: Booking[];
      [key: string]: unknown;
    }
    const data = JSON.parse(raw) as MockDataType;
    const bookings = (data.mockBookings || []) as Booking[];

    const booking = bookings.find((b) => b._id === id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = (await req.json()) as Partial<Booking>;
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ message: "Missing access token" }, { status: 401 });

    let payload: JwtPayload;
    try {
      payload = verify(token, process.env.JWT_SECRET || "dev_secret") as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Invalid access token" }, { status: 401 });
    }

    const dataPath = path.join(process.cwd(), "app", "data", "mockData.json");
    const raw = await fs.readFile(dataPath, "utf-8");

    await fs.writeFile(dataPath + ".bak", raw, "utf-8");

    interface MockDataType {
      mockBookings?: Booking[];
      [key: string]: unknown;
    }
    const data = JSON.parse(raw) as MockDataType;
    const bookings = (data.mockBookings || []) as Booking[];

    const idx = bookings.findIndex((b) => b._id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookings[idx];
    const hotelsRaw = (data.mockHotels || []) as Hotel[];
    const hotel = hotelsRaw.find((h) => h._id === booking.hotelId);
    const userRole = payload?.role;
    const userId = payload?.sub;

    if (userRole === "admin") {
      // allowed
    } else if (userRole === "provider") {
      if (!hotel || hotel.ownerId !== userId) {
        return NextResponse.json({ error: "Forbidden: not hotel owner" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Forbidden: insufficient role" }, { status: 403 });
    }

    bookings[idx] = { ...bookings[idx], ...body };

    data.mockBookings = bookings;

    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true, booking: bookings[idx] });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
