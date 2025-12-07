import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { User } from "@/app/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<User>;

    const dataPath = path.join(process.cwd(), "app", "data", "mockData.json");
    const backupPath = path.join(process.cwd(), "app", "data", "mockData.json.bak");

    const original = await fs.readFile(dataPath, "utf-8");
    await fs.writeFile(backupPath, original);
    const data = JSON.parse(original);
    const mockUsers = (data.mockUsers as User[]) || [];

    const newUserId = `user_${Date.now()}`;
    const newUser: User = {
      _id: newUserId,
      fullName: body.fullName || "",
      email: body.email || "",
      phone: body.phone || "",
      username: body.username || "",
      password: body.password || "",
      role: body.role || "client",
      gender: body.gender || "",
      age: body.age || 0,
      birthday: body.birthday || "",
      idCard: body.idCard || "000000000000",
      twoFactorEnabled: body.twoFactorEnabled || false,
      status: body.status || "active",
      createdAt: new Date().toISOString(),
      address: body.address,
    };

    mockUsers.push(newUser);
    data.mockUsers = mockUsers;
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
