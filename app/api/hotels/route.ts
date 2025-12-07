import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import type { Hotel } from "@/app/types";

const filePath = path.join(process.cwd(), "app", "data", "mockData.json");

// GET /api/hotels
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const status = searchParams.get("status");

    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const hotels: Hotel[] = (data.mockHotels as Hotel[]) || [];

    let result = [...hotels];

    if (ownerId) result = result.filter((h) => h.ownerId === ownerId);
    if (status && status !== "ALL") result = result.filter((h) => h.status === status);

    return NextResponse.json({ data: result, total: result.length });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json({ error: "Failed to fetch hotels" }, { status: 500 });
  }
}

// POST /api/hotels
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const hotels: Hotel[] = (data.mockHotels as Hotel[]) || [];

    const newHotel: Hotel = {
      _id: `hotel_${Date.now()}`,
      ...body,
      status: (body.status as string) || "DRAFT",
      createdAt: new Date().toISOString(),
    } as unknown as Hotel;

    hotels.push(newHotel);
    data.mockHotels = hotels;

    // backup and write
    await fs.promises.writeFile(`${filePath}.bak`, raw, "utf8");
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json(newHotel, { status: 201 });
  } catch (error) {
    console.error("Error creating hotel:", error);
    return NextResponse.json({ error: "Failed to create hotel" }, { status: 500 });
  }
}
