import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { verify, sign } from "@/lib/jwt";
import { User } from "@/app/types";

type UserWithRefresh = User & { refreshToken?: string };
type JwtPayload = { sub?: string; exp?: number; iat?: number; type?: string; role?: string; username?: string };

const ACCESS_EXPIRES_SEC = Number(process.env.ACCESS_TOKEN_EXPIRES_IN_SEC) || 60 * 15; // 15m
const REFRESH_EXPIRES_SEC = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_SEC) || 60 * 60 * 24 * 7; // 7d
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {};
  return Object.fromEntries(cookieHeader.split(";").map((c) => {
    const [k, ...v] = c.trim().split("=");
    return [k, v.join("=")];
  }));
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const cookies = parseCookies(cookieHeader);
    const provided = cookies.refreshToken;
    if (!provided) return NextResponse.json({ message: "No refresh token" }, { status: 401 });

    let payload: JwtPayload | null = null;
    try {
      payload = verify(provided, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });
    }

    const filePath = path.join(process.cwd(), "app", "data", "mockData.json");
    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const users = (data.mockUsers as UserWithRefresh[]) || [];

    const user = users.find((u) => u._id === payload?.sub && u.refreshToken === provided);
    if (!user) return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });

    // rotate refresh token
    const newRefresh = sign({ sub: user._id, type: "refresh" }, JWT_SECRET, REFRESH_EXPIRES_SEC);
    const accessToken = sign({ sub: user._id, role: user.role, username: user.username }, JWT_SECRET, ACCESS_EXPIRES_SEC);

    const idx = users.findIndex((u) => u._id === user._id);
    users[idx] = { ...users[idx], refreshToken: newRefresh };
    data.mockUsers = users;

    await fs.promises.writeFile(`${filePath}.bak`, raw, "utf8");
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");

    const cookie = `refreshToken=${newRefresh}; HttpOnly; Path=/; Max-Age=${REFRESH_EXPIRES_SEC}; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

    const { password, refreshToken, ...safeUser } = user as UserWithRefresh;
    void password;
    void refreshToken;

    return NextResponse.json({ accessToken, user: safeUser }, { status: 200, headers: { "Set-Cookie": cookie } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
