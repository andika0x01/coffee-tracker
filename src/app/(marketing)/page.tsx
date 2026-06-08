import { getDb } from "@/lib/db";
import { auth } from "@/auth";
import LandingClient from "./LandingClient";

export const dynamic = "force-dynamic";

async function getGlobalStats() {
  try {
    const db = await getDb();

    const result = await db
      .prepare(
        `
      SELECT 
        SUM(coffee_tbsp) as totalCoffee,
        SUM(sugar_tbsp) as totalSugar,
        COUNT(id) as totalLogs
      FROM logs
    `
      )
      .first();

    return {
      totalCoffee: (result?.totalCoffee as number) || 0,
      totalSugar: (result?.totalSugar as number) || 0,
      totalLogs: (result?.totalLogs as number) || 0,
    };
  } catch (e) {
    console.error("Failed to fetch global stats:", e);
    return {
      totalCoffee: 0,
      totalSugar: 0,
      totalLogs: 0,
    };
  }
}

export default async function LandingPage() {
  const [stats, session] = await Promise.all([getGlobalStats(), auth()]);

  return <LandingClient stats={stats} session={session} />;
}
