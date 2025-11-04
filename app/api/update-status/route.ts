import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { transformer_id, status } = await req.json();

    if (!transformer_id || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ ตั้งค่า Auth (พร้อมสิทธิ์เขียน)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"], // ต้องใช้สิทธิ์นี้!
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ✅ โหลดข้อมูลเพื่อตรวจหาตำแหน่งแถวที่มี transformer_id นี้
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A2:Z",
    });

    const rows = readResponse.data.values || [];
    const transformerIndex = 2; // สมมติ transformer_id อยู่คอลัมน์ C (A=0, B=1, C=2)
    const locationIndex = 10; // สมมติ location อยู่คอลัมน์ K (A=0 ... K=10)
    const statusCol = locationIndex + 1; // คอลัมน์ถัดไปจาก location

    const updates = rows
      .map((row, i) => (row[transformerIndex] === transformer_id ? i + 2 : null))
      .filter(Boolean);

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Transformer not found",
      });
    }

    // ✅ เขียนสถานะใหม่กลับเข้าไปทุกแถวที่เจอ
    for (const rowNum of updates) {
      const cell = `Sheet1!${String.fromCharCode(65 + statusCol)}${rowNum}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: cell,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[status]] },
      });
    }

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
