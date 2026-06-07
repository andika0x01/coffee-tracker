import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";
import { CaretRight, ListBullets, Calendar } from "@phosphor-icons/react/dist/ssr";
import { formatDateTime } from "@/lib/utils";
import Footer from "@/components/Footer";

export default async function ListPage() {
  const session = await auth();
  const db = await getDb();

  const logs = await db.prepare("SELECT * FROM logs WHERE user_id = ? ORDER BY logged_at DESC").bind(session?.user?.id).all<any>();

  // Group logs by day
  const groupedLogs = (logs.results || []).reduce((acc: any, log: any) => {
    const date = new Date(log.logged_at).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-12 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-accent text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
            <ListBullets size={14} />
            Riwayat
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">
            Daftar <span className="text-accent">Catatan</span>
          </h1>
        </div>
      </header>

      <div className="space-y-12">
        {sortedDates.length === 0 ? (
          <div className="border border-white/10 p-20 text-center space-y-4">
            <div className="text-white/20 font-mono text-sm tracking-widest uppercase">Belum ada data</div>
            <Link href="/entry" className="text-accent text-xs font-mono underline uppercase tracking-widest">
              Buat catatan pertama
            </Link>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60">
                  {new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                </h2>
                <div className="h-px w-8 bg-white/5" />
              </div>

              <div className="border border-white/10 divide-y divide-white/5 bg-black/40 overflow-hidden">
                {groupedLogs[date].map((log: any) => (
                  <Link
                    key={log.id}
                    href={`/detail/${log.id}`}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-8 mb-4 md:mb-0">
                      <div className="hidden md:block">
                        <div className="w-10 h-10 rounded border border-white/10 flex items-center justify-center text-white/40 group-hover:border-accent/40 group-hover:text-accent transition-colors">
                          <Calendar size={20} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-mono text-lg flex items-baseline gap-2">
                          <span className="text-accent font-bold">{log.coffee_tbsp.toFixed(2)}</span>
                          <span className="text-[10px] text-white/20 uppercase">SDM KOPI</span>
                          <span className="text-white/10 mx-2">/</span>
                          <span className="text-accent font-bold">{log.sugar_tbsp.toFixed(2)}</span>
                          <span className="text-[10px] text-white/20 uppercase">SDM GULA</span>
                        </div>
                        <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{formatDateTime(log.logged_at)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {log.notes && <div className="hidden lg:block text-[11px] font-mono text-white/60 max-w-[200px] truncate">// {log.notes}</div>}
                      <div className="flex items-center gap-2 text-white/20 group-hover:text-accent transition-colors">
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Detail</span>
                        <CaretRight size={18} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Footer userId={session?.user?.id} userName={session?.user?.name || ""} mode="Data_Archive" />
    </div>
  );
}
