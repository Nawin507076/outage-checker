"use client";

import { useEffect, useState } from "react";

export default function UpdateStatusPage() {
  const [transformers, setTransformers] = useState<string[]>([]);
  const [selectedTransformer, setSelectedTransformer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [outageDate, setOutageDate] = useState("");
  const [outageStart, setOutageStart] = useState("");
  const [outageEnd, setOutageEnd] = useState("");

  // โหลดรายการหม้อแปลงจาก API
  useEffect(() => {
    const fetchTransformers = async () => {
      try {
        const res = await fetch("/api/get-transformers");
        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          setTransformers(result.data);
        }
      } catch (err) {
        console.error("Error fetching transformers:", err);
      }
    };

    fetchTransformers();
  }, []);

  // ฟังก์ชันส่งข้อมูลไปอัปเดตสถานะ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTransformer || !selectedStatus) {
      alert("กรุณาเลือกหม้อแปลงและสถานะก่อนส่งข้อมูล");
      return;
    }

    try {
      const res = await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transformer_id: selectedTransformer,
          status: selectedStatus,
          outage_date: outageDate,
          outage_start: outageStart,
          outage_end: outageEnd,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert("อัปเดตสถานะสำเร็จ ✅");
      } else {
        alert("เกิดข้อผิดพลาดในการอัปเดต ❌");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg p-6 rounded-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">อัปเดตสถานะหม้อแปลง</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* เลือกหม้อแปลง */}
        <div>
          <label className="block mb-2 font-medium">เลือกหม้อแปลง:</label>
          <select
            value={selectedTransformer}
            onChange={(e) => setSelectedTransformer(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">-- เลือกหม้อแปลง --</option>
            {transformers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* เลือกสถานะ */}
        <div>
          <label className="block mb-2 font-medium">เลือกสถานะ:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">-- เลือกสถานะ --</option>
            <option value="0">วางแผนดับไฟ</option>
            <option value="1">กำลังปฏิบัติงาน</option>
            <option value="2">ดำเนินการแล้วเสร็จ จ่ายไฟคืนแล้ว</option>
          </select>
        </div>

        {/* ฟิลด์วันที่และเวลา */}
        <div>
          <label className="block mb-2 font-medium">วันที่เกิดเหตุ (Outage Date):</label>
          <input
            type="date"
            value={outageDate}
            onChange={(e) => setOutageDate(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">เริ่มดับไฟ (Outage Start):</label>
          <input
            type="time"
            value={outageStart}
            onChange={(e) => setOutageStart(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">สิ้นสุดดับไฟ (Outage End):</label>
          <input
            type="time"
            value={outageEnd}
            onChange={(e) => setOutageEnd(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700"
        >
          อัปเดตสถานะ
        </button>
      </form>
    </div>
  );
}
