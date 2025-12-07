"use client";

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AdminAuthLayout({ children }: Props) {
  return <div className="min-h-screen">{children}</div>;
}
