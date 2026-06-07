import { Fingerprint, Terminal, Cpu, GlobeHemisphereWest } from "@phosphor-icons/react/dist/ssr";

interface FooterProps {
  userId?: string;
  userName?: string;
  mode?: string;
  className?: string;
}

export default function Footer({ userId, userName, mode, className = "" }: FooterProps) {
  const buildId = "CF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <footer className={`relative mt-20 pt-12 pb-16 border-t border-white/5 ${className}`}>
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-px bg-accent/30" />
      <div className="absolute top-0 left-0 w-px h-4 bg-accent/30" />
      <div className="absolute top-0 right-0 w-4 h-px bg-white/10" />
      <div className="absolute top-0 right-0 w-px h-4 bg-white/10" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 opacity-40 hover:opacity-100 transition-opacity duration-500">
        {/* Branding & Status */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-accent/20 flex items-center justify-center bg-accent/5">
              <Terminal size={16} className="text-accent" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase">Coffee_Tracker</div>
              <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Quantified_Self_Core v1.0.4</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500/80">Uptime: 99.9%</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-white/40">Latency: 24ms</span>
          </div>
        </div>

        {/* User & Identity */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] mb-2">
            <Fingerprint size={12} />
            Identitas_Sesi
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-white/30 uppercase">Operator</span>
              <span className="text-white/80">{userName ? userName.toUpperCase() : "ANONYMOUS_USER"}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-white/30 uppercase">Access_Key</span>
              <span className="text-accent/60 truncate max-w-[120px]">{userId || "GUEST_ROOT_ACCESS"}</span>
            </div>
          </div>
        </div>

        {/* Technical Data */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] mb-2">
            <Cpu size={12} />
            Sistem_Telemetri
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Build_Hash</div>
              <div className="text-[9px] font-mono text-white/60">{buildId}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Region</div>
              <div className="text-[9px] font-mono text-white/60">ASIA-JKT-01</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Bottom Line */}
      <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8">
        <div className="flex items-center gap-6 text-[8px] font-mono text-white/20 uppercase tracking-[0.5em]">
          <span>© 2026 // COFFEE_TRACKER</span>
          <span className="hidden md:inline">•</span>
          <span className="flex items-center gap-1">
            <GlobeHemisphereWest size={10} />
            Jakarta, ID
          </span>
        </div>
        <div className="flex items-center gap-8 text-[8px] font-mono text-white/20 uppercase tracking-widest">
          <a href="#" className="hover:text-accent transition-colors">
            Privasi_Protocol
          </a>
          <a href="#" className="hover:text-accent transition-colors">
            Syarat_Layanan
          </a>
          <a href="#" className="hover:text-accent transition-colors">
            API_Gateway
          </a>
        </div>
      </div>
    </footer>
  );
}
