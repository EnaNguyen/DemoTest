import fs from "fs";
import path from "path";
import { NextResponse, NextRequest } from "next/server";
import type { Hotel } from "@/app/types";
import { verify } from "@/lib/jwt";

type JwtPayload = { sub?: string; role?: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const filePath = path.join(process.cwd(), "app", "data", "mockData.json");
    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const hotels: Hotel[] = (data.mockHotels as Hotel[]) || [];

    const hotel = hotels.find((h) => h._id === id);
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    return NextResponse.json(hotel);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = (await req.json()) as Partial<Hotel>;

    // auth: expect Authorization: Bearer <accessToken>
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ message: "Missing access token" }, { status: 401 });

    let payload: JwtPayload;
    try {
      payload = verify(token, process.env.JWT_SECRET || "dev_secret") as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Invalid access token" }, { status: 401 });
    }

    const filePath = path.join(process.cwd(), "app", "data", "mockData.json");
    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const hotels: Hotel[] = (data.mockHotels as Hotel[]) || [];

    const idx = hotels.findIndex((h) => h._id === id);
    if (idx === -1) {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    // Authorization rules:
    // - Providers can ONLY edit DRAFT hotels (prepare/modify) or change status to SUBMITTED (submit for approval)
    // - Providers CANNOT approve (APPROVED) or reject (REJECTED) their own hotels
    // - Admins ONLY can approve/reject SUBMITTED hotels
    const current = hotels[idx];
    const userRole = payload?.role;
    const userId = payload?.sub;

    if (userRole === "provider") {
      if (current.ownerId !== userId) {
        return NextResponse.json({ message: "Forbidden: not owner" }, { status: 403 });
      }
      // Providers can edit when:
      // - current is DRAFT (normal edits)
      // - OR they are revoking a SUBMITTED hotel back to DRAFT
      const isRevokingSubmittedToDraft = current.status === "SUBMITTED" && body.status === "DRAFT";
      const isSubmittingDraftToSubmitted = current.status === "DRAFT" && body.status === "SUBMITTED";
      if (!(current.status === "DRAFT" || isRevokingSubmittedToDraft || isSubmittingDraftToSubmitted)) {
        return NextResponse.json({ message: "Forbidden: providers can only edit DRAFT hotels, submit them, or revoke their own submitted hotels" }, { status: 403 });
      }
      // Prevent providers from changing status to APPROVED or REJECTED
      if (body.status === "APPROVED" || body.status === "REJECTED") {
        return NextResponse.json({ message: "Forbidden: only admins can approve or reject hotels" }, { status: 403 });
      }
    } else if (userRole === "admin") {
      // Admins can only edit SUBMITTED hotels (to approve or reject)
      if (current.status !== "SUBMITTED") {
        return NextResponse.json({ message: "Forbidden: admins can only approve/reject SUBMITTED hotels" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ message: "Forbidden: insufficient role" }, { status: 403 });
    }

    const updatedHotel = { ...hotels[idx], ...body };
    hotels[idx] = updatedHotel;

    data.mockHotels = hotels;

    await fs.promises.writeFile(`${filePath}.bak`, raw, "utf8");
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json(updatedHotel);
  } catch (err) {
    const error = err as unknown;
    console.error(error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
