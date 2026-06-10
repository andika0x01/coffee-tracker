import { GoogleGenAI } from "@google/genai";
import { getDb } from "./db";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function generateAiAnalysis(userId: string, userName: string): Promise<{ analysis: string; updated_at: string }> {
  const db = await getDb();

  const logsResult = await db.prepare("SELECT logged_at as date, coffee_tbsp, sugar_tbsp FROM logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 50").bind(userId).all<any>();
  const logs = logsResult.results || [];

  const averages = await db
    .prepare("SELECT AVG(coffee_tbsp) as avg_coffee, AVG(sugar_tbsp) as avg_sugar, COUNT(*) as total_cups FROM logs WHERE user_id = ?")
    .bind(userId)
    .first<{ avg_coffee: number; avg_sugar: number; total_cups: number }>();

  const today = dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD");
  const todayStats = await db
    .prepare("SELECT SUM(coffee_tbsp) as total_coffee FROM logs WHERE user_id = ? AND date(logged_at, '+7 hours') = ?")
    .bind(userId, today)
    .first<{ total_coffee: number }>();

  const todayCaffeineMg = (todayStats?.total_coffee || 0) * 60;

  if (!averages || averages.total_cups === 0) {
    return {
      analysis: "Halo! Saya Dr. AI Health Monitor. Sepertinya Anda belum mencatat konsumsi kopi. Mari mulai hidup sehat dengan mencatat asupan harian Anda.",
      updated_at: new Date().toISOString(),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      Anda adalah seorang dokter profesional, empatik, dan berwawasan luas yang peduli pada kesehatan pasien.
      Nama Anda adalah "Dr. AI Health Monitor".
      Tugas Anda adalah memberikan analisis singkat (maks 3-5 kalimat) tentang pola konsumsi kopi dan gula pengguna berdasarkan data telemetri yang diberikan.
      Gunakan Bahasa Indonesia yang sopan, profesional, menenangkan, namun tetap tegas terkait anjuran kesehatan.
      
      ATURAN KRITIS:
      1. Batas aman kafein harian adalah 400 mg (sekitar 4 cangkir kopi).
      2. Jika konsumsi kafein hari ini ('konsumsiKafeinHariIni') > 400 mg, peringatkan pengguna dengan lembut namun tegas tentang risiko kesehatan seperti jantung berdebar, insomnia, dan kecemasan.
      3. Jika rata-rata konsumsi gula terlalu tinggi (rataRataGulaPerGelas > 2), berikan edukasi mengenai risiko diabetes dan sarankan pengurangan gula secara bertahap.
      4. JIKA PENGGUNA HIDUP SEHAT (kafein < 400mg DAN rataRataGulaPerGelas <= 1), berikan apresiasi dan motivasi agar mereka mempertahankan pola hidup sehat tersebut.
      5. Berikan saran praktis yang relevan, seperti anjuran minum air putih, waktu minum kopi terakhir agar tidak mengganggu tidur (idealnya 6-8 jam sebelum tidur), atau membatasi gula.
      6. Fokus pada gaya bahasa medis yang suportif, tanpa kesan menghakimi atau sarkas.
    `;

    const lastDrink = logs.length > 0 ? dayjs(logs[0].date).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm") : "Belum ada data";

    const context = {
      namaPasien: userName,
      waktuPemeriksaan: dayjs().tz("Asia/Jakarta").format("dddd, DD MMMM YYYY, HH:mm"),
      totalGelasKopiKeseluruhan: averages.total_cups,
      rataRataKopiPerGelas: (averages.avg_coffee || 0).toFixed(2) + " sdm",
      rataRataGulaPerGelas: (averages.avg_sugar || 0).toFixed(2) + " sdm",
      konsumsiKafeinHariIni: todayCaffeineMg + " mg",
      waktuMinumKopiTerakhir: lastDrink,
      riwayatKonsumsiTerbaru: logs.slice(0, 5).map((log) => ({
        waktu: dayjs(log.date).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm"),
        kopi: log.coffee_tbsp + " sdm",
        gula: log.sugar_tbsp + " sdm",
      })),
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Data telemetri kesehatan pasien ${userName}:\n${JSON.stringify(context, null, 2)}\n\nBerikan laporan medis dan anjuran kesehatan Anda.`,
      config: {
        systemInstruction,
      },
    });

    const analysis = response.text || "Terjadi kendala dalam merumuskan analisis medis.";
    const updatedAt = new Date().toISOString();

    await db
      .prepare(
        "INSERT INTO ai_analysis (user_id, analysis, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET analysis = EXCLUDED.analysis, updated_at = CURRENT_TIMESTAMP"
      )
      .bind(userId, analysis)
      .run();

    return { analysis, updated_at: updatedAt };
  } catch (error: any) {
    console.error("AI Generation Error:", error);

    const errorMsg =
      error.message?.includes("API key not valid") || error.status === "INVALID_ARGUMENT"
        ? "Sistem analisis sedang mengalami gangguan konfigurasi teknis. Mohon hubungi administrator."
        : "Maaf, sistem pemantau kesehatan AI kami sedang mengalami malfungsi sementara. Mohon coba beberapa saat lagi.";

    return { analysis: errorMsg, updated_at: new Date().toISOString() };
  }
}

export async function generateAiWithRetry(userId: string, userName: string, maxRetries = 5) {
  let delay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await generateAiAnalysis(userId, userName);
      if (result && (result.analysis.includes("malfungsi") || result.analysis.includes("ngambek"))) {
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
      delay *= 2;
    }
  }

  console.error(`AI Analysis failed after ${maxRetries} attempts.`);
  return null;
}

export async function getAiAnalysis(userId: string): Promise<{ analysis: string; updated_at: string } | null> {
  const db = await getDb();
  const cached = await db.prepare("SELECT analysis, updated_at FROM ai_analysis WHERE user_id = ?").bind(userId).first<{ analysis: string; updated_at: string }>();

  return cached || null;
}
