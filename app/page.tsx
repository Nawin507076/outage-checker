"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapContainer as LeafletMapContainer } from "react-leaflet";


const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

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

  const center: [number, number] = result
    ? [parseFloat(result.latitude), parseFloat(result.longitude)]
    : [13.7563, 100.5018];
  const zoom = result ? 17 : 8;

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>🔌 ตรวจสอบการดับไฟบ้าน</h1>
      <input
        placeholder="หมายเลขเครื่องวัด"
        value={meterId}
        onChange={(e) => setMeterId(e.target.value)}
        style={{ margin: "0.5rem", padding: "0.5rem" }}
      />
      <input
        placeholder="หมายเลขผู้ใช้ไฟฟ้า"
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
          <p><strong>หม้อแปลง:</strong> {result.transformer_id}</p>
          <p><strong>สถานะ:</strong> 🔴 ไฟดับ</p>
          <p><strong>ตั้งแต่:</strong> {result.outage_start}</p>
<p><strong>ถึง:</strong> {result.outage_end}</p>
<p><strong>วันที่:</strong> {result.outage_date}</p>
<p><strong>หมายเหตุ:</strong> {result.notes}</p>
</div>
)}
  <div style={{ height: "500px", marginTop: "1rem" }}>
    <MapContainer   center={center as LatLngExpression}
  zoom={zoom}
  style={{ height: "500px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {(result ? [result] : allData).map((item, idx) => (
        <Marker
          key={idx}
          position={[parseFloat(item.latitude), parseFloat(item.longitude)]}
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
