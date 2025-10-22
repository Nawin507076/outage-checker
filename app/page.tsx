"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// ✅ Import map แบบ dynamic เพื่อรันเฉพาะ client
const MapView = dynamic(() => import("./components/mapView"), { ssr: false });

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
  name: string;
  location: string;
}

interface AllDataResponse {
  success: boolean;
  total: number;
  data: OutageData[];
}

export default function Home() {
  const [meterId, setMeterId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [result, setResult] = useState<OutageData | null>(null);
  const [allData, setAllData] = useState<AllDataResponse>({ success: false, total: 0, data: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      const res = await fetch("/api/check-all");
      const data: AllDataResponse = await res.json();
      setAllData(data);
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


  const center = result
    ? [parseFloat(result.latitude), parseFloat(result.longitude)]
    : [7.242928, 100.544190];
  const zoom = result ? 17 : 8;

  const shortLocation = allData?.data?.[0]?.location
  ? (() => {
      const fullLocation = allData.data[0].location;
      const index = fullLocation.indexOf("ต.");
      return index !== -1 ? fullLocation.substring(index) : fullLocation;
    })()
  : "";


  return (
    <div style={{ padding: "1rem" }}>
      {/* หัวข้อ */}
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#9b59b6",
          marginBottom: "1rem",
          textAlign: "left",
        }}
      >
        🔌 ตรวจสอบพื้นที่ไฟดับ
      </h1>

      {/* Input */}
      <input
        placeholder="หมายเลขเครื่องวัด (meter id)"
        value={meterId}
        onChange={(e) => setMeterId(e.target.value)}
        style={{
          margin: "0.5rem",
          padding: "0.75rem 1rem",
          fontSize: "1rem",
          border: "2px solid #9b59b6",
          borderRadius: "8px",
          outline: "none",
          transition: "border-color 0.3s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#6c3483")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#9b59b6")}
      />
      หรือ
      <input
        placeholder="หมายเลขผู้ใช้ไฟฟ้า (customer id)"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        style={{
          margin: "0.5rem",
          padding: "0.75rem 1rem",
          fontSize: "1rem",
          border: "2px solid #9b59b6",
          borderRadius: "8px",
          outline: "none",
          transition: "border-color 0.3s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#6c3483")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#9b59b6")}
      />

      {/* ปุ่มค้นหา */}
      <button
        onClick={handleSearch}
        disabled={loading}
        style={{
          margin: "0.5rem",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          fontWeight: "bold",
          color: "#fff",
          backgroundColor: "#9b59b6",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6c3483")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#9b59b6")}
      >
        {loading ? "กำลังค้นหา..." : "ค้นหา"}
      </button>

      {/* ข้อความวิ่ง */}
      {allData.data.length > 0 && (
        <div
          style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "100%",
            background: "#f3f3f3",
            padding: "0.5rem 0",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              display: "inline-block",
              paddingLeft: "100%",
              animation: "marquee 20s linear infinite",
            }}
          >
            ⚡ พื้นที่ไฟฟ้าดับ:{" "}
          
           {`วันที่ ${allData.data[0].outage_date} เวลา ${allData.data[0].outage_start} ถึง ${allData.data[0].outage_end} บริเวณ ${shortLocation}`}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>

      {/* แสดงผลการค้นหา */}
      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <p style={{ color: "green" }}>{error}</p>
          <h3>📋 ผลการตรวจสอบ</h3>
          <p>
            <strong>สถานะ:</strong> 🟢 ไฟปกติ
          </p>
        </div>
      )}

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
          <p>
            <strong>หม้อแปลง:</strong> {result.transformer_id}
          </p>
          <p>
            <strong>สถานะ:</strong> 🔴 ไฟดับ
          </p>
          <p>
            <strong>วันที่:</strong> {result.outage_date}
          </p>
          <p>
            <strong>ตั้งแต่:</strong> {result.outage_start}
          </p>
          <p>
            <strong>ถึง:</strong> {result.outage_end}
          </p>
          <p>
            <strong>หมายเหตุ:</strong> {result.notes}
          </p>
          <p>
            <strong>ชื่อผู้ใช้ไฟฟ้า:</strong> {result.name}
          </p>
          <p>
            <strong>สถานที่ใช้ไฟฟ้า:</strong> {result.location}
          </p>
        </div>
      )}

      {/* แผนที่ */}
      <div style={{ height: "500px", marginTop: "1rem" }}>
        <MapView data={result ? [result] : allData.data} center={center as any} zoom={zoom} />
      </div>
    </div>
  );
}
