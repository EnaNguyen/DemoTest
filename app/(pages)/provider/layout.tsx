"use client";

import { ReactNode } from "react";
import { ProviderLayout } from "@/components/layouts/provider/ProviderLayout";

interface Props { children: ReactNode }

export default function ProviderPagesLayout({ children }: Props) {
  return <ProviderLayout>{children}</ProviderLayout>;
}
