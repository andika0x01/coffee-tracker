import { GoogleGenAI } from "@google/genai";
import { getDb } from "./db";

export async function generateAiAnalysis(userId: string, userName: string) {
  const db = await getDb();

  const logs = await db.prepare("SELECT logged_at as date, coffee_tbsp, sugar_tbsp FROM logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 50").bind(userId).all<any>();

  const averages = await db
    .prepare("SELECT AVG(coffee_tbsp) as avg_coffee, AVG(sugar_tbsp) as avg_sugar, COUNT(*) as total_cups FROM logs WHERE user_id = ?")
    .bind(userId)
    .first<{ avg_coffee: number; avg_sugar: number; total_cups: number }>();

  if (!averages || averages.total_cups === 0) {
    return "Belum ada data untuk dianalisis. Minum kopi dulu sana, biar otakmu jalan.";
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      Anda adalah asisten AI yang sarkastik, cyber-noir, dan sangat jujur tentang kesehatan.
      Nama Anda adalah "Coffee_System_Core".
      Tugas Anda adalah memberikan analisis singkat (maks 3 kalimat) tentang konsumsi kopi dan gula pengguna.
      Gunakan Bahasa Indonesia yang gaul/santai tapi tajam.
      Berikan rekomendasi kesehatan yang benar tapi dengan nada menghina/sarkastik.
      Fokus pada efisiensi kafein dan risiko diabetes jika gula terlalu tinggi.
      High thinking level: analisis pola, bukan hanya angka.
    `;

    const context = {
      userName,
      averages,
      recentLogs: logs.results,
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Data pengguna ${userName}:\n${JSON.stringify(context, null, 2)}\n\nBerikan analisis sarkastikmu sekarang.`,
      config: {
        systemInstruction,
      },
    });

    const analysis = response.text;

    await db
      .prepare(
        "INSERT INTO ai_analysis (user_id, analysis, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET analysis = EXCLUDED.analysis, updated_at = CURRENT_TIMESTAMP"
      )
      .bind(userId, analysis)
      .run();

    return analysis;
  } catch (error: any) {
    console.error("AI Generation Error:", error);

    if (error.message?.includes("API key not valid") || error.status === "INVALID_ARGUMENT") {
      return "Sistem AI ngambek karena API Key-mu sampah. Benerin dulu konfigurasinya kalau mau dapet omelan kesehatan dari gue.";
    }

    return "Terjadi malfungsi pada modul analisis. Sepertinya otak AI-nya korslet kena tumpahan kopi. Coba lagi nanti.";
  }
}

export async function generateAiWithRetry(userId: string, userName: string, maxRetries = 5) {
  let delay = 1000; // Start with 1 second

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await generateAiAnalysis(userId, userName);
      // If it returned a failure message instead of throwing (for some handled cases), we still count it as success in terms of execution
      if (result && (result.includes("malfungsi") || result.includes("ngambek"))) {
        console.warn(`AI Analysis attempt ${i + 1} returned error message, retrying in ${delay}ms...`);
      } else {
        console.log(`AI Analysis successful on attempt ${i + 1}`);
        return result;
      }
    } catch (error) {
      console.error(`AI Analysis attempt ${i + 1} failed:`, error);
    }

    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  console.error(`AI Analysis failed after ${maxRetries} attempts.`);
  return null;
}

export async function getAiAnalysis(userId: string) {
  const db = await getDb();
  const cached = await db.prepare("SELECT analysis FROM ai_analysis WHERE user_id = ?").bind(userId).first<{ analysis: string }>();

  return cached?.analysis;
}
