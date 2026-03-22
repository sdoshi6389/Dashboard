"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Image,
  BookOpen,
  ShoppingCart,
  Sparkles,
  Package,
  Utensils,
  Dumbbell,
  Clock3,
  MapPinned,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/todo", label: "To-Do", icon: CheckSquare },
  { href: "/vision", label: "Vision", icon: Image },
  { href: "/reading", label: "Reading", icon: BookOpen },
  { href: "/purchases", label: "Purchases", icon: ShoppingCart },
  { href: "/fragrances", label: "Fragrances", icon: Sparkles },
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/meals", label: "Meals", icon: Utensils },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/routines", label: "Routines", icon: Clock3 },
  { href: "/travels", label: "Travels", icon: MapPinned },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border bg-card/95 backdrop-blur-sm shadow-xl shadow-black/10">
      <div className="border-b border-border p-4">
        <Link
          href="/"
          className="bg-gradient-to-r from-aurora-teal to-aurora-purple bg-clip-text text-lg font-semibold tracking-tight text-transparent transition-opacity hover:opacity-90"
        >
          Doshi&apos;s Dashboard
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground",
                isActive && "nav-active text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}