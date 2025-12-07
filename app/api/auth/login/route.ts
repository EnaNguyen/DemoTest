import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { sign } from "@/lib/jwt";
import { User } from "@/app/types";

type UserWithRefresh = User & { refreshToken?: string };

const ACCESS_EXPIRES_SEC = Number(process.env.ACCESS_TOKEN_EXPIRES_IN_SEC) || 60 * 15; 
const REFRESH_EXPIRES_SEC = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_SEC) || 60 * 60 * 24 * 7; 
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const filePath = path.join(process.cwd(), "app", "data", "mockData.json");
    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const users = (data.mockUsers as UserWithRefresh[]) || [];

    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const accessToken = sign({ sub: user._id, role: user.role, username: user.username }, JWT_SECRET, ACCESS_EXPIRES_SEC);
    const refreshToken = sign({ sub: user._id, type: "refresh" }, JWT_SECRET, REFRESH_EXPIRES_SEC);

    const idx = users.findIndex((u) => u._id === user._id);
    const oldRaw = raw;
    users[idx] = { ...users[idx], refreshToken };
    data.mockUsers = users;

    await fs.promises.writeFile(`${filePath}.bak`, oldRaw, "utf8");
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");

    const cookie = `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${REFRESH_EXPIRES_SEC}; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

    const { password: _password, refreshToken: _refreshToken, ...safeUser } = user as UserWithRefresh;
    void _password;
    void _refreshToken;

    return NextResponse.json({ accessToken, user: safeUser }, { status: 200, headers: { "Set-Cookie": cookie } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
