"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Coffee, GithubLogo, GoogleLogo, Fingerprint } from "@phosphor-icons/react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col lg:flex-row overflow-hidden selection:bg-accent selection:text-black">
      {/* Left Side: Visual/Abstract */}
      <div className="hidden lg:flex lg:w-2/3 relative items-center justify-center border-r border-white/5 bg-[radial-gradient(circle_at_center,_var(--accent-dim)_0%,_transparent_100%)] opacity-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="z-10 flex flex-col items-center">
          <Fingerprint size={120} weight="thin" className="text-accent/20 mb-8" />
          <div className="text-4xl font-mono font-bold tracking-[0.5em] text-white/10 uppercase">Verifikasi_Identitas</div>
        </motion.div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 bg-black">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-sm mx-auto w-full space-y-12">
          <header className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-6 h-6 rounded bg-accent flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Coffee size={14} weight="fill" className="text-black" />
              </div>
              <span className="font-mono text-xs tracking-widest text-white/40 group-hover:text-accent transition-colors uppercase">Beranda</span>
            </Link>
            <h1 className="text-4xl font-bold tracking-tighter uppercase">Selamat Datang</h1>
            <p className="text-white/40 text-sm font-mono tracking-tight">Silakan masuk menggunakan akun Google Anda untuk mengakses dashboard Coffee Tracker.</p>
          </header>

          <div className="space-y-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/home" })}
              className="w-full glass-panel py-4 rounded-sm flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all group"
            >
              <GoogleLogo size={24} weight="fill" />
              <span className="font-mono text-sm tracking-widest uppercase">Masuk dengan Google</span>
            </button>
          </div>

          <Footer className="pt-12" mode="Auth Gate" />
        </motion.div>
      </div>
    </div>
  );
}
