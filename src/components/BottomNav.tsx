"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ListBullets, ChartLine, Gear, Plus } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { href: "/home", label: "Home", Icon: House },
  { href: "/entry", label: "Add", Icon: Plus },
  { href: "/list", label: "Logs", Icon: ListBullets },
  { href: "/stats", label: "Analyze", Icon: ChartLine },
  { href: "/settings", label: "Settings", Icon: Gear },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-panel rounded-full px-4 py-2 flex items-center gap-6 shadow-2xl border-white/5">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} className="relative group flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className={cn("p-2 rounded-full transition-colors relative z-10", isActive ? "text-accent" : "text-white/60 group-hover:text-white")}
              >
                <Icon size={22} weight={isActive ? "fill" : "regular"} />
              </motion.div>

              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest font-mono transition-opacity duration-300",
                  isActive ? "opacity-100 text-accent font-bold" : "opacity-40 group-hover:opacity-100"
                )}
              >
                {label}
              </span>

              {isActive && (
                <motion.div layoutId="active-pill" className="absolute inset-0 bg-accent/5 rounded-full -z-0" transition={{ type: "spring", bounce: 0.3, duration: 0.6 }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
