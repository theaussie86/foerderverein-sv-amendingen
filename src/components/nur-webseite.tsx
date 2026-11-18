"use client";

import { usePathname } from "next/navigation";

// Blendet Kopf und Fuß der öffentlichen Webseite im internen Bereich aus. Der hat eine eigene Shell.
export function NurWebseite({ children }: { children: React.ReactNode }) {
  const pfad = usePathname();
  if (pfad === "/admin" || pfad.startsWith("/admin/")) return null;
  return children;
}
