import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { ChartLine, TrendUp, Pulse } from "@phosphor-icons/react/dist/ssr";
import StatsChart from "@/components/StatsChart";
import AiAnalysis from "@/components/AiAnalysis";
import { getAiAnalysis, generateAiAnalysis } from "@/lib/ai";
import Link from "next/link";
import Footer from "@/components/Footer";

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range = "7d" } = await searchParams;
  const session = await auth();
  const db = await getDb();

  if (!session?.user?.id) {
    return null;
  }

  let analysis = await getAiAnalysis(session.user.id);
  if (!analysis) {
    analysis = await generateAiAnalysis(session.user.id, session.user.name || "Anonymous");
  }

  let limit = 7;
  if (range === "3d") limit = 3;
  if (range === "30d") limit = 30;
  if (range === "all") limit = 9999;

  const coffeeStats = await db
    .prepare(
      `SELECT date(logged_at, '+7 hours') as date, COUNT(*) as total_cups FROM logs WHERE user_id = ? GROUP BY date(logged_at, '+7 hours') ORDER BY date DESC LIMIT ${limit}`
    )
    .bind(session?.user?.id)
    .all<any>();

  const averages = await db
    .prepare("SELECT AVG(coffee_tbsp) as avg_coffee, AVG(sugar_tbsp) as avg_sugar, COUNT(*) as total_cups FROM logs WHERE user_id = ?")
    .bind(session?.user?.id)
    .first<{ avg_coffee: number; avg_sugar: number; total_cups: number }>();

  const chartData = [...(coffeeStats.results || [])].reverse();

  const ranges = [
    { label: "3 Hari", value: "3d" },
    { label: "7 Hari", value: "7d" },
    { label: "30 Hari", value: "30d" },
    { label: "Semua", value: "all" },
  ];

  return (
    <div className="space-y-12 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-accent text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
            <ChartLine size={14} />
            Analisis Statistik
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">
            Statistik <span className="text-accent">Konsumsi</span>
          </h1>
        </div>
      </header>

      {/* Top Averages Cockpit */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-8 rounded-sm group relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div className="p-2 rounded bg-accent/5 border border-accent/20">
              <TrendUp size={24} className="text-accent" />
            </div>
            <span className="font-mono text-[10px] text-white/20 uppercase">Rata-rata Kopi</span>
          </div>
          <div className="space-y-1">
            <div className="text-5xl font-mono font-bold tracking-tighter group-hover:text-accent transition-colors">{averages?.avg_coffee?.toFixed(1) || "0.0"}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">SDM / Hari</div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-sm group relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div className="p-2 rounded bg-accent/5 border border-accent/20">
              <TrendUp size={24} className="text-accent" />
            </div>
            <span className="font-mono text-[10px] text-white/20 uppercase">Rata-rata Gula</span>
          </div>
          <div className="space-y-1">
            <div className="text-5xl font-mono font-bold tracking-tighter group-hover:text-accent transition-colors">{averages?.avg_sugar?.toFixed(1) || "0.0"}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">SDM / Hari</div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-sm group relative overflow-hidden border-accent/50">
          <div className="flex justify-between items-start mb-8">
            <div className="p-2 rounded bg-accent/5 border border-accent/20">
              <Pulse size={24} className="text-accent" />
            </div>
            <span className="font-mono text-[10px] text-white/20 uppercase">Total Akumulasi</span>
          </div>
          <div className="space-y-1">
            <div className="text-5xl font-mono font-bold tracking-tighter text-accent">{averages?.total_cups || "0"}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Total Gelas</div>
          </div>
        </div>
      </section>

      {/* AI Sarcastic Analysis */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-accent" />
          <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-white/20">AI Health Report</h2>
        </div>
        <AiAnalysis analysis={analysis} />
      </section>

      {/* Historical Graph */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-accent" />
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-white/20">Grafik Konsumsi (Gelas)</h2>
          </div>

          <div className="flex bg-white/5 p-1 rounded-sm border border-white/5">
            {ranges.map((r) => (
              <Link
                key={r.value}
                href={`?range=${r.value}`}
                className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
                  range === r.value ? "bg-accent text-black font-bold" : "text-white/40 hover:text-white"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4 md:p-8">
          <StatsChart data={chartData} />
        </div>
      </section>

      <Footer userId={session?.user?.id} userName={session?.user?.name || ""} mode="Stats Analytics" />
    </div>
  );
}
