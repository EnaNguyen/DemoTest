import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { User } from "@/app/types";

type UserWithReset = User & { resetToken?: string; resetExpires?: number };

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: "Email required" }, { status: 400 });

    const filePath = path.join(process.cwd(), "app", "data", "mockData.json");
    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const users = (data.mockUsers as UserWithReset[]) || [];

    const idx = users.findIndex((u) => u.email === email || u.username === email);
    if (idx === -1) {

      return NextResponse.json({ message: "If that email exists, a reset token was generated." }, { status: 200 });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expires = Math.floor(Date.now() / 1000) + 60 * 60;

    users[idx] = { ...users[idx], resetToken: token, resetExpires: expires };
    data.mockUsers = users;

    await fs.promises.writeFile(`${filePath}.bak`, raw, "utf8");
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json({ message: "Reset token generated", token }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
