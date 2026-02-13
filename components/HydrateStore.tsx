"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function HydrateStore({ children }: { children: React.ReactNode }) {
  const loadFromStorage = useStore((s) => s.loadFromStorage);
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  return <>{children}</>;
}
