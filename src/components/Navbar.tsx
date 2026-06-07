"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee } from "@/components/Icons";

export default function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-border rounded-full px-6 py-3 flex items-center justify-between z-50 w-[90%] max-w-lg">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <Coffee size={18} className="text-black" weight="fill" />
        </div>
        <span className="font-semibold tracking-tighter text-white">Coffee Tracker</span>
      </Link>
      {!isLoginPage && (
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs uppercase tracking-widest font-medium text-muted-text hover:text-white transition-colors">
            Masuk
          </Link>
        </div>
      )}
    </nav>
  );
}
