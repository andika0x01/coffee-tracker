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

  // --- Data Collection ---

  // 1. Last 50 logs (detailed)
  const logsResult = await db
    .prepare("SELECT logged_at as date, coffee_tbsp, sugar_tbsp, notes FROM logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 50")
    .bind(userId)
    .all<any>();
  const logs = logsResult.results || [];

  // 2. Overall averages and totals
  const averages = await db
    .prepare(
      "SELECT AVG(coffee_tbsp) as avg_coffee, AVG(sugar_tbsp) as avg_sugar, COUNT(*) as total_cups, SUM(coffee_tbsp) as total_coffee_sdm, SUM(sugar_tbsp) as total_sugar_sdm FROM logs WHERE user_id = ?"
    )
    .bind(userId)
    .first<{ avg_coffee: number; avg_sugar: number; total_cups: number; total_coffee_sdm: number; total_sugar_sdm: number }>();

  // 3. Today stats (WIB)
  const today = dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD");
  const todayStats = await db
    .prepare(
      "SELECT SUM(coffee_tbsp) as total_coffee, SUM(sugar_tbsp) as total_sugar, COUNT(*) as total_cups FROM logs WHERE user_id = ? AND date(logged_at, '+7 hours') = ?"
    )
    .bind(userId, today)
    .first<{ total_coffee: number; total_sugar: number; total_cups: number }>();

  // 4. Yesterday stats
  const yesterday = dayjs().tz("Asia/Jakarta").subtract(1, "day").format("YYYY-MM-DD");
  const yesterdayStats = await db
    .prepare(
      "SELECT SUM(coffee_tbsp) as total_coffee, SUM(sugar_tbsp) as total_sugar, COUNT(*) as total_cups FROM logs WHERE user_id = ? AND date(logged_at, '+7 hours') = ?"
    )
    .bind(userId, yesterday)
    .first<{ total_coffee: number; total_sugar: number; total_cups: number }>();

  // 5. Last 7 days daily breakdown
  const last7DaysResult = await db
    .prepare(
      `SELECT date(logged_at, '+7 hours') as day, COUNT(*) as total_cups, SUM(coffee_tbsp) as total_coffee, SUM(sugar_tbsp) as total_sugar
       FROM logs WHERE user_id = ? AND date(logged_at, '+7 hours') >= date('now', '-6 days', '+7 hours')
       GROUP BY day ORDER BY day DESC`
    )
    .bind(userId)
    .all<any>();
  const last7Days = last7DaysResult.results || [];

  // 6. Last 30 days daily breakdown (for streak & pattern)
  const last30DaysResult = await db
    .prepare(
      `SELECT date(logged_at, '+7 hours') as day, COUNT(*) as total_cups, SUM(coffee_tbsp) as total_coffee, SUM(sugar_tbsp) as total_sugar
       FROM logs WHERE user_id = ? AND date(logged_at, '+7 hours') >= date('now', '-29 days', '+7 hours')
       GROUP BY day ORDER BY day DESC`
    )
    .bind(userId)
    .all<any>();
  const last30Days = last30DaysResult.results || [];

  // 7. Peak consumption day (all time)
  const peakDayResult = await db
    .prepare(
      `SELECT date(logged_at, '+7 hours') as day, COUNT(*) as total_cups, SUM(coffee_tbsp) as total_coffee
       FROM logs WHERE user_id = ? GROUP BY day ORDER BY total_cups DESC LIMIT 1`
    )
    .bind(userId)
    .first<{ day: string; total_cups: number; total_coffee: number }>();

  // 8. Total active days
  const activeDaysResult = await db
    .prepare("SELECT COUNT(DISTINCT date(logged_at, '+7 hours')) as active_days FROM logs WHERE user_id = ?")
    .bind(userId)
    .first<{ active_days: number }>();

  // 9. Logs in the last 30 days count (for 30-day active days)
  const activeDays30Result = await db
    .prepare(
      `SELECT COUNT(DISTINCT date(logged_at, '+7 hours')) as active_days FROM logs WHERE user_id = ? AND date(logged_at, '+7 hours') >= date('now', '-29 days', '+7 hours')`
    )
    .bind(userId)
    .first<{ active_days: number }>();

  // 10. First log date (account age)
  const firstLogResult = await db
    .prepare("SELECT MIN(logged_at) as first_log FROM logs WHERE user_id = ?")
    .bind(userId)
    .first<{ first_log: string }>();

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
Anda adalah Dr. AI Health Monitor, seorang dokter virtual yang sangat kompeten, analitis, dan peduli pada kesehatan pasien.
Tugas Anda adalah memberikan laporan kesehatan komprehensif berdasarkan SEMUA data telemetri konsumsi kopi dan gula yang tersedia.

PANDUAN ANALISIS:
Tulis laporan dalam 4-6 kalimat yang padat dan informatif. Setiap kalimat harus membawa nilai analisis yang berbeda.

WAJIB DIBAHAS (gunakan data yang relevan):
1. STATUS KAFEIN HARI INI: Bandingkan konsumsi kafein hari ini dengan batas aman 400 mg. Sebutkan angkanya secara eksplisit.
2. TREN & POLA: Apakah tren 7 hari terakhir meningkat, stabil, atau menurun? Apakah ada hari-hari tertentu yang lebih tinggi?
3. GULA: Evaluasi rata-rata gula per gelas. Jika tinggi (> 2 sdm), edukasi risiko metabolik. Jika rendah, apresiasi.
4. GAMBARAN BESAR: Komentari total akumulasi, hari aktif, dan konsistensi pengguna secara keseluruhan.
5. SARAN SPESIFIK & ACTIONABLE: Berikan 1-2 saran praktis yang relevan dengan profil data pengguna (bukan saran generik).

ATURAN KRITIS:
- SELALU sebutkan angka dan data spesifik dari telemetri (misal: "konsumsi kafein Anda hari ini adalah X mg").
- Jangan hanya memuji atau hanya mengkritik — bersikaplah seimbang dan berbasis data.
- Gunakan Bahasa Indonesia yang sopan, profesional, dan suportif.
- Hindari pengulangan informasi yang sama di beberapa kalimat.
- JANGAN hanya fokus pada kafein hari ini saja — analisis semua dimensi data yang tersedia.
- Jika ada catatan (notes) dari pengguna, perhatikan dan komentari jika relevan.
- Sebutkan pola menarik seperti hari paling tinggi, tren mingguan, atau konsistensi pencatatan.
    `;

    const todayCaffeineMg = (todayStats?.total_coffee || 0) * 60;
    const yesterdayCaffeineMg = (yesterdayStats?.total_coffee || 0) * 60;
    const lastDrink =
      logs.length > 0 ? dayjs(logs[0].date).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm") : "Belum ada data";
    const firstLog = firstLogResult?.first_log
      ? dayjs(firstLogResult.first_log).tz("Asia/Jakarta").format("DD MMM YYYY")
      : "Tidak diketahui";

    // Calculate current streak (consecutive days with logs ending today or yesterday)
    const activeDaySet = new Set(last30Days.map((d: any) => d.day));
    let streak = 0;
    let checkDate = dayjs().tz("Asia/Jakarta");
    while (activeDaySet.has(checkDate.format("YYYY-MM-DD"))) {
      streak++;
      checkDate = checkDate.subtract(1, "day");
    }
    // If today has no log yet, check streak ending yesterday
    if (streak === 0) {
      checkDate = dayjs().tz("Asia/Jakarta").subtract(1, "day");
      while (activeDaySet.has(checkDate.format("YYYY-MM-DD"))) {
        streak++;
        checkDate = checkDate.subtract(1, "day");
      }
    }

    const context = {
      namaPasien: userName,
      waktuPemeriksaan: dayjs().tz("Asia/Jakarta").format("dddd, DD MMMM YYYY, HH:mm [WIB]"),
      tanggalMulaiMencatat: firstLog,

      // === TODAY ===
      hariIni: {
        tanggal: today,
        totalGelasDiminum: todayStats?.total_cups || 0,
        totalKopi_sdm: (todayStats?.total_coffee || 0).toFixed(2),
        totalGula_sdm: (todayStats?.total_sugar || 0).toFixed(2),
        estimasiKafein_mg: todayCaffeineMg.toFixed(0),
        statusKafein:
          todayCaffeineMg > 400
            ? "BAHAYA - Melebihi batas aman 400mg"
            : todayCaffeineMg > 300
              ? "PERINGATAN - Mendekati batas aman"
              : "AMAN",
        batasAmanKafein_mg: 400,
        persentaseKafeinDariBatas: ((todayCaffeineMg / 400) * 100).toFixed(1) + "%",
      },

      // === YESTERDAY ===
      kemarin: {
        tanggal: yesterday,
        totalGelasDiminum: yesterdayStats?.total_cups || 0,
        totalKopi_sdm: (yesterdayStats?.total_coffee || 0).toFixed(2),
        totalGula_sdm: (yesterdayStats?.total_sugar || 0).toFixed(2),
        estimasiKafein_mg: yesterdayCaffeineMg.toFixed(0),
      },

      // === LAST 7 DAYS ===
      tren7HariTerakhir: last7Days.map((d: any) => ({
        tanggal: d.day,
        totalGelas: d.total_cups,
        totalKopi_sdm: parseFloat(d.total_coffee).toFixed(2),
        totalGula_sdm: parseFloat(d.total_sugar).toFixed(2),
        estimasiKafein_mg: (parseFloat(d.total_coffee) * 60).toFixed(0),
      })),

      // === LAST 30 DAYS SUMMARY ===
      ringkasan30HariTerakhir: {
        hariAktifMencatat: activeDays30Result?.active_days || 0,
        dari30HariTotal: 30,
        konsistensiPencatatan: (((activeDays30Result?.active_days || 0) / 30) * 100).toFixed(1) + "%",
        streakHariAktifSaatIni: streak + " hari berturut-turut",
        totalGelasDiminum30Hari: last30Days.reduce((sum: number, d: any) => sum + d.total_cups, 0),
        totalKafein30Hari_mg: last30Days.reduce((sum: number, d: any) => sum + parseFloat(d.total_coffee) * 60, 0).toFixed(0),
      },

      // === ALL TIME STATS ===
      statistikKeseluruhan: {
        totalGelasDiminum: averages.total_cups,
        totalHariAktif: activeDaysResult?.active_days || 0,
        rataRataGelasDiminum_perHariAktif: averages.total_cups && activeDaysResult?.active_days
          ? (averages.total_cups / activeDaysResult.active_days).toFixed(1)
          : "0",
        rataRataKopiPerGelas_sdm: (averages.avg_coffee || 0).toFixed(2),
        rataRataGulaPerGelas_sdm: (averages.avg_sugar || 0).toFixed(2),
        totalKopiAkumulasi_sdm: (averages.total_coffee_sdm || 0).toFixed(2),
        totalGulaAkumulasi_sdm: (averages.total_sugar_sdm || 0).toFixed(2),
        estimasiKafeinTotal_mg: ((averages.total_coffee_sdm || 0) * 60).toFixed(0),
        statusGula:
          (averages.avg_sugar || 0) > 2
            ? "TINGGI - Risiko metabolik"
            : (averages.avg_sugar || 0) > 1
              ? "SEDANG - Perlu perhatian"
              : "BAIK",
        hariKonsumsiTertinggi: peakDayResult
          ? {
              tanggal: peakDayResult.day,
              totalGelas: peakDayResult.total_cups,
              totalKopi_sdm: (peakDayResult.total_coffee || 0).toFixed(2),
            }
          : null,
      },

      // === RECENT LOGS (last 10) ===
      riwayatKonsumsiTerbaru: logs.slice(0, 10).map((log: any) => ({
        waktu: dayjs(log.date).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm"),
        kopi_sdm: log.coffee_tbsp,
        gula_sdm: log.sugar_tbsp,
        estimasiKafein_mg: (log.coffee_tbsp * 60).toFixed(0),
        catatan: log.notes || null,
      })),

      waktuMinumKopiTerakhir: lastDrink,
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Data telemetri kesehatan lengkap pasien ${userName}:\n${JSON.stringify(context, null, 2)}\n\nBerikan laporan medis komprehensif dan anjuran kesehatan yang spesifik berdasarkan SEMUA data di atas.`,
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
