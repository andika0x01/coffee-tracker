import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { addLog } from "@/lib/actions";
import { Coffee, Drop, Plus, Terminal } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Footer from "@/components/Footer";

dayjs.extend(utc);
dayjs.extend(timezone);

export default async function HomePage() {
  const session = await auth();
  const db = await getDb();

  const today = dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD");
  const stats = await db
    .prepare("SELECT SUM(coffee_tbsp) as total_coffee, SUM(sugar_tbsp) as total_sugar, COUNT(*) as total_cups FROM logs WHERE user_id = ? AND date(logged_at, '+7 hours') = ?")
    .bind(session?.user?.id, today)
    .first<{ total_coffee: number; total_sugar: number; total_cups: number }>();

  return (
    <div className="space-y-12 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-accent text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
            <Terminal size={14} />
            Sesi Aktif
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">
            Ringkasan <span className="text-accent">Hari Ini</span>
          </h1>
        </div>
        <div className="text-right">
          <div className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">Pengguna</div>
          <div className="text-lg font-mono">{session?.user?.name}</div>
        </div>
      </header>

      {/* Cockpit Grid Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-8 rounded-sm group">
          <div className="flex justify-between items-start mb-8">
            <div className="p-2 rounded bg-accent/5 border border-accent/20">
              <Coffee size={24} className="text-accent" />
            </div>
            <span className="font-mono text-[10px] text-white/20 uppercase">Total Kopi</span>
          </div>
          <div className="space-y-1">
            <div className="text-6xl font-mono font-bold tracking-tighter group-hover:text-accent transition-colors">{stats?.total_coffee?.toFixed(2) || "0.00"}</div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-white/40">SDM Kopi</div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-sm group">
          <div className="flex justify-between items-start mb-8">
            <div className="p-2 rounded bg-accent/5 border border-accent/20">
              <Drop size={24} className="text-accent" />
            </div>
            <span className="font-mono text-[10px] text-white/20 uppercase">Total Gula</span>
          </div>
          <div className="space-y-1">
            <div className="text-6xl font-mono font-bold tracking-tighter group-hover:text-accent transition-colors">{stats?.total_sugar?.toFixed(2) || "0.00"}</div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-white/40">SDM Gula</div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-sm group border-accent/50">
          <div className="flex justify-between items-start mb-8">
            <div className="p-2 rounded bg-accent/5 border border-accent/20">
              <Coffee size={24} weight="fill" className="text-accent" />
            </div>
            <span className="font-mono text-[10px] text-white/20 uppercase">Total Gelas</span>
          </div>
          <div className="space-y-1">
            <div className="text-6xl font-mono font-bold tracking-tighter text-accent">{stats?.total_cups || "0"}</div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-white/40">Gelas Kopi</div>
          </div>
        </div>
      </section>

      {/* Quick Action & System Info */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-accent" />
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-white/20">Aksi Cepat</h2>
          </div>
          <Link href="/entry" className="glass-panel w-full py-12 rounded-sm flex flex-col items-center justify-center gap-4 group hover:border-accent/50 transition-all">
            <div className="p-4 rounded-full bg-accent/5 border border-accent/20 group-hover:bg-accent group-hover:text-black transition-all">
              <Plus size={32} weight="bold" />
            </div>
            <div className="text-sm font-mono font-bold tracking-[0.3em] uppercase">Catat Kopi Baru</div>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-white/10" />
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-white/20">Status</h2>
          </div>
          <div className="glass-panel p-8 rounded-sm space-y-4 border-white/5 h-[172px] flex flex-col justify-center">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/40">
              <span>Status Server</span>
              <span className="text-green-500">Online</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/40">
              <span>Database</span>
              <span className="text-accent">Terhubung</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/40">
              <span>Versi</span>
              <span>1.0.0</span>
            </div>
          </div>
        </div>
      </section>

      <Footer userId={session?.user?.id} userName={session?.user?.name || ""} mode="Dashboard Analytics" />
    </div>
  );
}
