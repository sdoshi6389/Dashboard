"use client";

import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/todo": "To-Do",
  "/vision": "Vision",
  "/reading": "Reading",
  "/purchases": "Purchases",
  "/fragrances": "Fragrances",
  "/packages": "Packages",
  "/settings": "Settings",
};

export function TopHeader() {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/90 px-6 backdrop-blur-md">
      <div className="aurora-underline absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden />
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-foreground/95">{title}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2 aurora-btn rounded-xl">
              <Plus className="h-4 w-4" />
              Quick add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/todo?add=1">Add Task</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/vision?add=1">Add Board Image</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/vision?tab=goals&add=1">Add Goal</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/reading?add=1">Add Book</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/purchases?add=1">Add Purchase</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/fragrances?add=1">Add Fragrance</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/packages?add=1">Add Package</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
