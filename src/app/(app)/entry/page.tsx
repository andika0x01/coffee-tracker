import { auth } from "@/auth";
import { addLog } from "@/lib/actions";
import { Plus, Coffee, Drop, Notepad, Terminal } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Footer from "@/components/Footer";
import SubmitButton from "@/components/SubmitButton";

export default async function EntryPage() {
  const session = await auth();

  return (
    <div className="space-y-12 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-accent text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
            <Plus size={14} />
            Tambah Data
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">
            Catat <span className="text-accent">Kopi</span>
          </h1>
        </div>
        <div className="text-right">
          <Link href="/home" className="text-[10px] font-mono uppercase tracking-widest text-white/20 hover:text-accent transition-colors">
            Batal
          </Link>
        </div>
      </header>

      <section className="relative">
        {/* Decorative Background Element */}
        <div className="absolute -left-20 top-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <form action={addLog} className="grid grid-cols-1 lg:grid-cols-12 gap-1px bg-white/5 border border-white/5 relative z-10">
          {/* Main Inputs */}
          <div className="lg:col-span-8 bg-black p-8 md:p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Coffee size={20} className="text-accent" />
                  <label htmlFor="coffee" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
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
                    required
                    autoFocus
                    className="input-cockpit w-full text-6xl py-4"
                    placeholder="0.00"
                  />
                  <span className="absolute right-0 bottom-4 text-xs font-mono text-white/20 uppercase tracking-widest">SDM</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Drop size={20} className="text-accent" />
                  <label htmlFor="sugar" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
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
                    required
                    className="input-cockpit w-full text-6xl py-4"
                    placeholder="0.00"
                  />
                  <span className="absolute right-0 bottom-4 text-xs font-mono text-white/20 uppercase tracking-widest">SDM</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3">
                <Notepad size={20} className="text-white/20" />
                <label htmlFor="notes" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">
                  Catatan Tambahan
                </label>
              </div>
              <textarea name="notes" id="notes" rows={2} className="input-cockpit w-full text-xl py-2 resize-none" placeholder="Tulis detail di sini..." />
            </div>
          </div>

          {/* Execution Sidebar */}
          <div className="lg:col-span-4 bg-black p-8 md:p-12 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/5">
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                <Terminal size={14} />
                Informasi
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between text-[10px] font-mono uppercase tracking-tighter">
                  <span className="text-white/40">Tipe Log</span>
                  <span className="text-accent">Asupan Kafein</span>
                </li>
                <li className="flex justify-between text-[10px] font-mono uppercase tracking-tighter">
                  <span className="text-white/40">Sistem</span>
                  <span className="text-white/70">Coffee Tracker v1</span>
                </li>
                <li className="flex justify-between text-[10px] font-mono uppercase tracking-tighter">
                  <span className="text-white/40">Pengguna</span>
                  <span className="text-white/70">{session?.user?.name?.split(" ")[0]}</span>
                </li>
              </ul>
            </div>

            <SubmitButton />
          </div>
        </form>
      </section>

      <Footer userId={session?.user?.id} userName={session?.user?.name || ""} mode="Data Entry" />
    </div>
  );
}
