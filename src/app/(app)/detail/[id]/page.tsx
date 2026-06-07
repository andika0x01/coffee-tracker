import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Coffee, Drop, Calendar, Notepad, Pencil, Terminal, Hash, Fingerprint } from "@phosphor-icons/react/dist/ssr";
import DeleteButton from "@/components/DeleteButton";
import Footer from "@/components/Footer";
import { formatDateTime } from "@/lib/utils";

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const db = await getDb();

  const log = await db.prepare("SELECT * FROM logs WHERE id = ? AND user_id = ?").bind(id, session?.user?.id).first<any>();

  if (!log) notFound();

  return (
    <div className="space-y-6 lg:space-y-12">
      {/* Detail Header */}
      <header className="flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link href="/list" className="flex items-center gap-3 text-white/30 hover:text-accent transition-colors group">
            <ArrowLeft size={18} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">Kembali</span>
          </Link>
          <div className="flex items-center gap-4 text-white/10 font-mono text-[10px] uppercase tracking-widest">
            <span className="hidden sm:inline">ID:</span>
            <span className="text-white/30 bg-white/5 px-2 py-1 rounded select-all">{id}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-accent text-xs font-mono tracking-[0.5em] uppercase">
              <Terminal size={18} weight="fill" />
              Detail Catatan
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase">
              Data <span className="text-accent text-glow">Kopi</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 text-right border-l md:border-l-0 border-white/10 pl-6 md:pl-0">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/20">Waktu Catatan</div>
            <div className="text-2xl font-mono text-white/80 font-bold leading-none">{formatDateTime(log.logged_at)}</div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)]">
        {/* Metric Area: Coffee */}
        <div className="lg:col-span-4 bg-black p-10 md:p-16 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Coffee size={160} weight="thin" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-16">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-sm border border-accent/20 bg-accent/5">
                  <Coffee size={32} className="text-accent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Takaran Kopi</span>
                </div>
              </div>
              <Hash size={20} className="text-white/10" />
            </div>
            <div className="flex items-baseline gap-6">
              <span className="text-8xl md:text-9xl font-mono font-bold tracking-tighter group-hover:text-accent transition-colors">{log.coffee_tbsp.toFixed(2)}</span>
              <span className="text-lg font-mono text-white/20 uppercase tracking-[0.3em]">SDM</span>
            </div>
          </div>
        </div>

        {/* Metric Area: Sugar */}
        <div className="lg:col-span-4 bg-black p-10 md:p-16 group border-t lg:border-t-0 lg:border-l border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Drop size={160} weight="thin" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-16">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-sm border border-accent/20 bg-accent/5">
                  <Drop size={32} className="text-accent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Takaran Gula</span>
                </div>
              </div>
              <Hash size={20} className="text-white/10" />
            </div>
            <div className="flex items-baseline gap-6">
              <span className="text-8xl md:text-9xl font-mono font-bold tracking-tighter group-hover:text-accent transition-colors">{log.sugar_tbsp.toFixed(2)}</span>
              <span className="text-lg font-mono text-white/20 uppercase tracking-[0.3em]">SDM</span>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 bg-black/60 backdrop-blur-3xl p-10 md:p-16 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white/20">
                <Calendar size={24} />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold">Waktu Lengkap</span>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-mono text-white/90">{formatDateTime(log.logged_at)}</div>
              </div>
            </div>

            <div className="space-y-6 border-t border-white/5 pt-10">
              <div className="flex items-center gap-4 text-white/20">
                <Notepad size={24} />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold">Catatan</span>
              </div>
              <div className="text-lg font-light text-white/60 leading-relaxed italic border-l-4 border-accent/40 pl-8 py-2">{log.notes ? log.notes : "Tidak ada catatan."}</div>
            </div>
          </div>

          <div className="pt-16 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.5em]">Aksi</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Link
              href={`/detail/${id}/edit`}
              className="w-full glass-panel py-6 rounded-sm font-mono font-bold tracking-[0.5em] uppercase hover:bg-white hover:text-black transition-all group flex items-center justify-center gap-4 text-sm shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              <Pencil size={20} weight="bold" />
              Ubah Data
            </Link>

            <DeleteButton id={id} />
          </div>
        </div>
      </div>

      <Footer userId={session?.user?.id} userName={session?.user?.name || ""} mode="Detail View" />
    </div>
  );
}
