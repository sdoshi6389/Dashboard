import type { Metadata } from "next";
import "./globals.css";
import { HydrateStore } from "@/components/HydrateStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";

export const metadata: Metadata = {
  title: "Doshi's Dashboard",
  description: "Personal dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <HydrateStore>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0 pl-56">
              <TopHeader />
              <main className="flex-1 p-6 max-w-[1440px] mx-auto w-full">
                {children}
              </main>
            </div>
          </div>
        </HydrateStore>
      </body>
    </html>
  );
}
