import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { updateLog } from "@/lib/actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { X, Coffee, Drop, Notepad, Terminal, ArrowsClockwise, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/Footer";
import { formatDateTime } from "@/lib/utils";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const db = await getDb();

  const log = await db.prepare("SELECT * FROM logs WHERE id = ? AND user_id = ?").bind(id, session?.user?.id).first<any>();

  if (!log) notFound();

  const handleUpdate = async (formData: FormData) => {
    "use server";
    await updateLog(id, formData);
    redirect(`/detail/${id}`);
  };

  return (
    <div className="space-y-6 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Edit Header */}
      <header className="flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link href={`/detail/${id}`} className="flex items-center gap-3 text-white/30 hover:text-accent transition-colors group">
            <ArrowLeft size={18} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">Batal</span>
          </Link>
          <div className="flex items-center gap-4 text-white/10 font-mono text-[10px] uppercase tracking-widest">
            <span className="hidden sm:inline">ID:</span>
            <span className="text-accent/60 bg-accent/5 px-2 py-1 rounded">{id.slice(0, 8)}...</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-accent text-xs font-mono tracking-[0.5em] uppercase">
              <ArrowsClockwise size={18} weight="bold" />
              Ubah Data
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase">
              Edit <span className="text-accent text-glow">Catatan</span>
            </h1>
          </div>
        </div>
      </header>

      <section className="relative">
        <form action={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)]">
          {/* Main Inputs */}
          <div className="lg:col-span-8 bg-black p-10 md:p-16 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-sm border border-accent/20 bg-accent/5">
                    <Coffee size={24} className="text-accent" />
                  </div>
                  <label htmlFor="coffee" className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 font-bold">
                    Takaran Kopi
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    name="coffee"
                    id="coffee"
                    defaultValue={Number(log.coffee_tbsp).toFixed(2)}
                    required
                    className="input-cockpit w-full text-7xl md:text-8xl py-4 font-bold tracking-tighter"
                  />
                  <span className="absolute right-0 bottom-6 text-sm font-mono text-white/20 uppercase tracking-widest">SDM</span>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-sm border border-accent/20 bg-accent/5">
                    <Drop size={24} className="text-accent" />
                  </div>
                  <label htmlFor="sugar" className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 font-bold">
                    Takaran Gula
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    name="sugar"
                    id="sugar"
                    defaultValue={Number(log.sugar_tbsp).toFixed(2)}
                    required
                    className="input-cockpit w-full text-7xl md:text-8xl py-4 font-bold tracking-tighter"
                  />
                  <span className="absolute right-0 bottom-6 text-sm font-mono text-white/20 uppercase tracking-widest">SDM</span>
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-sm border border-white/10 bg-white/5">
                  <Notepad size={24} className="text-white/40" />
                </div>
                <label htmlFor="notes" className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 font-bold">
                  Catatan
                </label>
              </div>
              <textarea
                name="notes"
                id="notes"
                rows={2}
                defaultValue={log.notes || ""}
                className="input-cockpit w-full text-2xl py-4 resize-none font-light italic text-white/80"
                placeholder="Tulis catatan di sini..."
              />
            </div>
          </div>

          {/* Execution Sidebar */}
          <div className="lg:col-span-4 bg-black/60 backdrop-blur-3xl p-10 md:p-16 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white/20">
                  <Terminal size={24} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold">Status</span>
                </div>
                <div className="p-6 rounded border border-white/5 bg-white/[0.02] space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-white/20">Catatan Asli</span>
                    <span className="text-white/70">{formatDateTime(log.logged_at)}</span>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-green-500/50 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Siap Simpan
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-16">
              <button
                type="submit"
                className="w-full glass-panel py-10 rounded-sm font-mono font-bold tracking-[0.5em] uppercase hover:bg-accent hover:text-black transition-all group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-4">
                  Simpan
                  <ArrowsClockwise size={24} weight="bold" className="group-hover:rotate-180 transition-transform duration-700" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>
          </div>
        </form>
      </section>

      <Footer userId={session?.user?.id} userName={session?.user?.name || ""} mode="Edit Mode" />
    </div>
  );
}
