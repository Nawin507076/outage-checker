import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { transformer_id, status, outage_date, outage_start, outage_end } =
      await req.json();

    if (!transformer_id || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A2:Z",
    });

    const rows = readResponse.data.values || [];

    // index ตามตัวอย่าง
    const transformerIndex = 2; // C
    const statusCol = 11;       // L
    const outageDateCol = 12;   // F
    const outageStartCol = 13;  // D
    const outageEndCol = 14;    // E

    const matchingRows = rows
      .map((row, i) => (row[transformerIndex] === transformer_id ? i + 2 : null))
      .filter((n): n is number => n !== null);

    if (matchingRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Transformer not found",
      });
    }

    // ✅ เตรียม data ทั้งหมดใน request เดียว
    const data = matchingRows.flatMap((rowNum) => [
      { range: `Sheet1!L${rowNum}`, values: [[status]] },
      { range: `Sheet1!F${rowNum}`, values: [[outage_date]] },
      { range: `Sheet1!D${rowNum}`, values: [[outage_start]] },
      { range: `Sheet1!E${rowNum}`, values: [[outage_end]] },
    ]);

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data,
      },
    });

    return NextResponse.json({
      success: true,
      updated: matchingRows.length,
    });
  } catch (error: any) {
    console.error("❌ Update Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
