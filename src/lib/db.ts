import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getDb(): Promise<D1Database> {
  try {
    const ctx = await getCloudflareContext();
    const db = ctx.env.DB as unknown as D1Database;
    if (!db) {
      throw new Error("D1 Database (DB) binding not found in cloudflare context");
    }
    return db;
  } catch (e) {
    const db = (process.env as any).DB as unknown as D1Database;
    if (!db) {
      throw new Error("D1 Database not found in environment or context");
    }
    return db;
  }
}
