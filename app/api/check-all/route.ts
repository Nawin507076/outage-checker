import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

interface OutageData {
  meter_id: string;
  customer_id: string;
  transformer_id: string;
  outage_start: string;
  outage_end: string;
  outage_date: string;
  notes: string;
  latitude: string;
  longitude: string;
}

// บังคับให้รันใน Node.js runtime บน Vercel
export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A2:I",
    });

    const headers = [
      "meter_id",
      "customer_id",
      "transformer_id",
      "outage_start",
      "outage_end",
      "outage_date",
      "notes",
      "latitude",
      "longitude",
    ];

    const rows: string[][] = response.data.values || [];
    const data: OutageData[] = rows.map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => (obj[h] = r[i] || ""));
      return obj as unknown as OutageData;
    });

    return NextResponse.json({ success: true, total: data.length, data });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// สำหรับรองรับ POST (optional)
export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ status: "ok", received: body });
}
