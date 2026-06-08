"use server";

import { auth } from "@/auth";
import { getDb } from "./db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateAiWithRetry } from "./ai";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function addLog(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const coffee = parseFloat(formData.get("coffee") as string) || 0;
  const sugar = parseFloat(formData.get("sugar") as string) || 0;
  const notes = (formData.get("notes") as string) || "";

  const db = await getDb();
  const id = crypto.randomUUID();

  await db.prepare("INSERT INTO logs (id, user_id, coffee_tbsp, sugar_tbsp, notes) VALUES (?, ?, ?, ?, ?)").bind(id, session.user.id, coffee, sugar, notes).run();

  try {
    const { ctx } = await getCloudflareContext();
    ctx.waitUntil(generateAiWithRetry(session.user.id, session.user.name || "Anonymous"));
  } catch (e) {
    // Fallback for local development or environments where context is missing
    console.warn("Cloudflare context not found, running AI analysis synchronously");
    await generateAiWithRetry(session.user.id, session.user.name || "Anonymous");
  }

  revalidatePath("/home");
  revalidatePath("/list");
  revalidatePath("/stats");
  redirect("/list");
}

export async function deleteLog(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  await db.prepare("DELETE FROM logs WHERE id = ? AND user_id = ?").bind(id, session.user.id).run();

  try {
    const { ctx } = await getCloudflareContext();
    ctx.waitUntil(generateAiWithRetry(session.user.id, session.user.name || "Anonymous"));
  } catch (e) {
    console.warn("Cloudflare context not found, running AI analysis synchronously");
    await generateAiWithRetry(session.user.id, session.user.name || "Anonymous");
  }

  revalidatePath("/home");
  revalidatePath("/list");
  revalidatePath("/stats");
}

export async function updateLog(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const coffee = parseFloat(formData.get("coffee") as string) || 0;
  const sugar = parseFloat(formData.get("sugar") as string) || 0;
  const notes = (formData.get("notes") as string) || "";

  const db = await getDb();
  await db.prepare("UPDATE logs SET coffee_tbsp = ?, sugar_tbsp = ?, notes = ? WHERE id = ? AND user_id = ?").bind(coffee, sugar, notes, id, session.user.id).run();

  try {
    const { ctx } = await getCloudflareContext();
    ctx.waitUntil(generateAiWithRetry(session.user.id, session.user.name || "Anonymous"));
  } catch (e) {
    console.warn("Cloudflare context not found, running AI analysis synchronously");
    await generateAiWithRetry(session.user.id, session.user.name || "Anonymous");
  }

  revalidatePath("/home");
  revalidatePath("/list");
  revalidatePath("/stats");
  revalidatePath(`/detail/${id}`);
}
