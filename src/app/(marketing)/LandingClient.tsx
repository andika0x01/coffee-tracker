"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Link from "next/link";
import { Coffee, ArrowRight, Drop, ListBullets } from "@phosphor-icons/react";
import Footer from "@/components/Footer";

interface CounterProps {
  value: number;
  decimals?: number;
}

function Counter({ value, decimals = 0 }: CounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
}

interface LandingClientProps {
  stats: {
    totalCoffee: number;
    totalSugar: number;
    totalLogs: number;
  };
  session: any;
}

export default function LandingClient({ stats, session }: LandingClientProps) {
  const targetHref = session ? "/home" : "/login";
  const buttonLabel = session ? "Dashboard" : "Masuk";

  return (
    <div className="min-h-[100dvh] bg-black text-white overflow-hidden selection:bg-accent selection:text-black">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Coffee size={20} weight="fill" className="text-black" />
            </div>
            <span className="font-mono font-bold tracking-tighter text-xl">COFFEE TRACKER</span>
          </div>
          <Link href={targetHref} className="glass-panel px-6 py-2 rounded-sm text-sm font-medium hover:border-accent/50 transition-colors">
            {buttonLabel}
          </Link>
        </div>
      </header>

      <main className="relative pt-32 lg:pt-0 lg:flex lg:items-center lg:min-h-screen max-w-[1400px] mx-auto px-6">
        {/* Left Side: Typography Content */}
        <div className="lg:w-1/2 space-y-8 z-10">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-[10px] uppercase tracking-[0.2em] font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Sistem Aktif
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6 uppercase">
              Lacak.
              <br />
              <span className="text-accent text-glow">Kopi.</span> <br />
              Harian.
            </h1>
            <p className="text-white/40 max-w-[45ch] text-lg leading-relaxed font-light">
              Catat dan pantau asupan kafein harian Anda dengan presisi. Dashboard minimalis untuk produktivitas yang terukur.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="flex flex-col sm:flex-row gap-4">
            <Link href={targetHref} className="bg-accent text-black px-8 py-4 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-white transition-colors group">
              {session ? "KE DASHBOARD" : "MULAI SEKARANG"}
              <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Right Side: High Density Visuals */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Fake Dashboard Cockpit */}
            <div className="glass-panel p-1 rounded-2xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] perspective-1000">
              <div className="bg-black/80 rounded-xl overflow-hidden grid grid-cols-2 gap-[1px] bg-white/5">
                {/* Metric 1: Total Kopi */}
                <div className="p-8 bg-black space-y-4">
                  <div className="flex justify-between items-start">
                    <Coffee size={24} className="text-accent" />
                    <span className="font-mono text-[10px] text-white/20">DB_STAT_01</span>
                  </div>
                  <div>
                    <div className="text-4xl font-mono font-bold">
                      <Counter value={stats.totalCoffee} decimals={1} />
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40">Total Kopi (SDM)</div>
                  </div>
                  <div className="h-1 bg-white/5 w-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1, duration: 2 }}
                      className="h-full bg-accent shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    />
                  </div>
                </div>

                {/* Metric 2: Total Gula */}
                <div className="p-8 bg-black space-y-4">
                  <div className="flex justify-between items-start">
                    <Drop size={24} className="text-accent" />
                    <span className="font-mono text-[10px] text-white/20">DB_STAT_02</span>
                  </div>
                  <div>
                    <div className="text-4xl font-mono font-bold text-accent">
                      <Counter value={stats.totalSugar} decimals={1} />
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40">Total Gula (SDM)</div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="h-4 w-1 bg-accent" />
                    ))}
                  </div>
                </div>

                {/* Big Metric: Total Logs */}
                <div className="col-span-2 p-8 bg-black border-t border-white/5">
                  <div className="flex items-center gap-4 mb-6">
                    <ListBullets size={20} className="text-accent" />
                    <span className="font-mono text-xs uppercase tracking-[0.3em]">Total Pencatatan Global</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-mono font-bold">
                      <Counter value={stats.totalLogs} />
                    </span>
                    <span className="text-accent font-bold uppercase text-xl">Entries</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <div className="max-w-[1400px] mx-auto px-6">
        <Footer mode="Landing_Phase" />
      </div>
    </div>
  );
}
