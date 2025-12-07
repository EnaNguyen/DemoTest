import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { User } from "@/app/types";

type UserWithRefresh = User & { refreshToken?: string };

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
    if (!provided) return NextResponse.json({ message: "No refresh token" }, { status: 200 });

    const filePath = path.join(process.cwd(), "app", "data", "mockData.json");
    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const users = (data.mockUsers as UserWithRefresh[]) || [];

    const idx = users.findIndex((u) => u.refreshToken === provided);
    if (idx !== -1) {
      const oldRaw = raw;
      users[idx] = { ...users[idx] };
      delete users[idx].refreshToken;
      data.mockUsers = users;
      await fs.promises.writeFile(`${filePath}.bak`, oldRaw, "utf8");
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    }

    // clear cookie
    const cookie = `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

    return NextResponse.json({ ok: true }, { status: 200, headers: { "Set-Cookie": cookie } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
