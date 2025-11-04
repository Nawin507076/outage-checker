import { NextResponse } from "next/server";
import { google } from "googleapis";

// ใช้ Node.js runtime (จำเป็นบน Vercel)
export const runtime = "nodejs";

export async function GET() {
  try {
    // 🔐 ตั้งค่า Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    // 🔍 อ่านข้อมูลจาก Google Sheet
    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!C2:C", // ✅ คอลัมน์ C = transformer_id
    });

    const rows: string[][] = response.data.values || [];

    // 🧩 แปลงข้อมูลเป็น unique array
    const uniqueTransformers = Array.from(
      new Set(rows.map((r) => r[0]).filter((v) => v && v.trim() !== ""))
    );

    return NextResponse.json({ success: true, data: uniqueTransformers });
  } catch (error) {
    console.error("❌ Error fetching transformers:", error);
    return NextResponse.json(
      { success: false, error: "Server error while fetching transformers" },
      { status: 500 }
    );
  }
}
