import { getDb } from "@/lib/db";
import { generateAiAnalysis } from "@/lib/ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  // Simple security check: check for a secret header or key
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const db = await getDb();

    // Fetch all users who have logged coffee in the last 7 days
    const users = await db
      .prepare(
        `
      SELECT DISTINCT u.id, u.name 
      FROM users u 
      JOIN logs l ON u.id = l.user_id 
      WHERE l.logged_at > datetime('now', '-7 days')
    `
      )
      .all<{ id: string; name: string }>();

    const results = [];
    for (const user of users.results) {
      const analysis = await generateAiAnalysis(user.id, user.name || "Anonymous");
      results.push({ userId: user.id, status: "updated" });
    }

    return NextResponse.json({ success: true, updated: results.length, details: results });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
