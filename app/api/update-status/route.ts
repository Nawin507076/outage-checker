import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { transformer_id, status, outage_date, outage_start, outage_end } =
      await req.json();

    // ✅ ตรวจเฉพาะฟิลด์ที่จำเป็น
    if (!transformer_id || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: transformer_id or status" },
        { status: 400 }
      );
    }

    // ✅ เตรียม Auth สำหรับ Google Sheets
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    // ✅ อ่านข้อมูลจาก Sheet
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A2:Z",
    });

    const rows = readResponse.data.values || [];

    // ✅ กำหนดตำแหน่งคอลัมน์
    const transformerIndex = 2; // C
    const outageStartCol = 3;   // D
    const outageEndCol = 4;     // E
    const outageDateCol = 5;    // F
    const statusCol = 11;       // L

    // ✅ หาแถวที่มี transformer_id ตรงกัน
    const updates = rows
      .map((row, i) => (row[transformerIndex] === transformer_id ? i + 2 : null))
      .filter((r): r is number => r !== null);

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Transformer not found",
      });
    }

    // ✅ ฟังก์ชันช่วยทำความสะอาดค่า (ให้ค่าว่างแทน null)
    const clean = (value: any) => (value === null || value === undefined ? "" : value);

    // ✅ เตรียมข้อมูลอัปเดต
    const data = updates.flatMap((rowNum) => [
      {
        range: `Sheet1!${String.fromCharCode(65 + statusCol)}${rowNum}`,
        values: [[clean(status)]],
      },
      {
        range: `Sheet1!${String.fromCharCode(65 + outageDateCol)}${rowNum}`,
        values: [[clean(outage_date)]],
      },
      {
        range: `Sheet1!${String.fromCharCode(65 + outageStartCol)}${rowNum}`,
        values: [[clean(outage_start)]],
      },
      {
        range: `Sheet1!${String.fromCharCode(65 + outageEndCol)}${rowNum}`,
        values: [[clean(outage_end)]],
      },
    ]);

    // ✅ batch update ทีเดียว
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data,
      },
    });

    return NextResponse.json({
      success: true,
      updated: updates.length,
    });
  } catch (error: any) {
    console.error("❌ Update Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
