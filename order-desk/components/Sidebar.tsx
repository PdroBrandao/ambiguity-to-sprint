"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, PlusCircle, Settings } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/orders/new", label: "New Order", icon: PlusCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
        <Image src="/logo.png" alt="Turbo" width={28} height={28} />
        <span className="font-semibold text-gray-900 tracking-tight">OrderDesk</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href || (href !== "/orders" && pathname.startsWith(href))
                ? "bg-violet-700 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100"
        >
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
