import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OrderDesk",
  description: "Medical supply order management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top bar */}
            <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
              <div />
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">Logged in as</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-700 flex items-center justify-center text-white text-sm font-semibold">
                    C
                  </div>
                  <span className="text-sm font-medium">Camila</span>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
