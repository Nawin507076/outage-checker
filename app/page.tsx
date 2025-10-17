"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";



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

export default function Home() {
  const [meterId, setMeterId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [result, setResult] = useState<OutageData | null>(null);
  const [allData, setAllData] = useState<OutageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // โหลดข้อมูลทั้งหมดสำหรับ map
  useEffect(() => {
    const fetchAll = async () => {
      const res = await fetch("/api/check-all");
      const data: OutageData[] = await res.json();
      setAllData(data || []);
    };
    fetchAll();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meter_id: meterId.trim() || undefined,
          customer_id: customerId.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!data.found) setError("ไม่พบข้อมูลการดับไฟของบ้านคุณ");
      else setResult(data.result);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const center: LatLngExpression = result
    ? [parseFloat(result.latitude), parseFloat(result.longitude)]
    : [13.7563, 100.5018]; // Bangkok default
  const zoom = result ? 17 : 8;

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>🔌 ตรวจสอบการดับไฟบ้าน</h1>
      <p>กรอกหมายเลขเครื่องวัดหรือหมายเลขผู้ใช้ไฟฟ้า</p>

      <input
        placeholder="หมายเลขเครื่องวัด (meter id)"
        value={meterId}
        onChange={(e) => setMeterId(e.target.value)}
        style={{ margin: "0.5rem", padding: "0.5rem" }}
      />
      <input
        placeholder="หมายเลขผู้ใช้ไฟฟ้า (customer id)"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        style={{ margin: "0.5rem", padding: "0.5rem" }}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "กำลังค้นหา..." : "ค้นหา"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3>📋 ผลการตรวจสอบ</h3>
          <p><strong>หม้อแปลง:</strong> {result.transformer_id}</p>
          <p><strong>สถานะ:</strong> 🔴 ไฟดับ</p>
          <p><strong>ตั้งแต่:</strong> {result.outage_start}</p>
          <p><strong>ถึง:</strong> {result.outage_end}</p>
          <p><strong>วันที่:</strong> {result.outage_date}</p>
          <p><strong>หมายเหตุ:</strong> {result.notes}</p>
        </div>
      )}

      <div style={{ height: "500px", marginTop: "1rem" }}>
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {(result ? [result] : allData).map((item, idx) => (
            <Marker
              key={idx}
              position={[parseFloat(item.latitude), parseFloat(item.longitude)] as LatLngExpression}
            >
              <Popup>
                <strong>มิเตอร์:</strong> {item.meter_id} <br />
                <strong>ผู้ใช้:</strong> {item.customer_id} <br />
                <strong>หม้อแปลง:</strong> {item.transformer_id} <br />
                <strong>ดับ:</strong> {item.outage_start} - {item.outage_end} <br />
                <strong>วันที่:</strong> {item.outage_date}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
