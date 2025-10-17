import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // ✅ บอก Next.js ว่าให้รัน dynamic API

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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { meter_id, customer_id } = body;

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

    const found = data.filter(
      (row) =>
        (meter_id && String(row.meter_id) === String(meter_id)) ||
        (customer_id && String(row.customer_id) === String(customer_id))
    );

    if (!found.length) return NextResponse.json({ found: false });
    return NextResponse.json({ found: true, result: found[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
