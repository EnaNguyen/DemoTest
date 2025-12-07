"use client";

import { AdminLayout } from "@/components/layouts/admin/AdminLayout";
import { usePathname } from "next/navigation";

export default function AdminSegmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't apply AdminLayout to authAdmin page
  if (pathname === "/admin/authAdmin") {
    return children;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
}
