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
  status: string;
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
      {/* <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#9b59b6",
          marginBottom: "1rem",
          textAlign: "left",
        }}
      >
        🔌 ตรวจสอบพื้นที่ไฟดับ
      </h1> */}
      <header className="bg-white text-purple-700 flex items-center justify-between p-4 shadow-md mb-4">
  <div className="flex items-center">
    {/* รูปมัสคอต */}
    <img 
      src="PEA_65-Logo.png" 
      alt="PEA Logo" 
      className="h-12 w-18 mr-2"
    />
<h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-peaPurple text-center sm:text-left leading-tight">
  ตรวจสอบพื้นที่ไฟดับ
</h2>


  </div>

  {/* ไอคอน social header ถ้าต้องการ */}
  <div className="hidden md:flex space-x-4">
    <a href="" target="_blank" rel="noopener noreferrer" title="Facebook">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12.073c0-5.523-4.477-10-10-10S2 6.55 2 12.073c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54v-2.892h2.54v-2.21c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562v1.882h2.773l-.443 2.892h-2.33v6.987C18.343 21.201 22 17.064 22 12.073z"/>
      </svg>
    </a>
    <a href="https://line.me/ti/g2/hPiRO_g9H6RZMYxdu4PjTMp9rAxvtG4xgkiiqw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default" 
 target="_blank" rel="noopener noreferrer" title="Line">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.135 2 11.045c0 2.846 1.397 5.393 3.624 7.085V22l3.48-1.91c.936.263 1.928.405 2.896.405 5.523 0 10-4.135 10-9.045S17.523 2 12 2zm0 16c-.967 0-1.911-.149-2.823-.437l-.393-.142-2.07 1.138.507-2.97-.128-.414C6.152 15.398 6 14.735 6 14c0-3.86 3.582-7 8-7s8 3.14 8 7-3.582 7-8 7z"/>
      </svg>
    </a>
  </div>
</header>


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
           {/* {`วันที่ ${allData.data[0].outage_date} เวลา ${allData.data[0].outage_start} ถึง ${allData.data[0].outage_end} บริเวณ ${shortLocation}`} */}
<span>
  {Array.from(
    new Map(
      allData.data.map(item => [
        `${item.outage_date}-${item.outage_start}-${item.outage_end}`,
        item,
      ])
    ).values()
  )
    .sort((a, b) => {
      const dateA = new Date(`${a.outage_date} ${a.outage_start}`).getTime();
      const dateB = new Date(`${b.outage_date} ${b.outage_start}`).getTime();
      return dateA - dateB;
    })
    .map(
      (uniqueItem, index, arr) =>
        `วันที่ ${uniqueItem.outage_date} เวลา ${uniqueItem.outage_start} ถึง ${uniqueItem.outage_end} บริเวณ ${shortLocation}${
          index < arr.length - 1 ? "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" : "" // ✅ เว้น 3 ช่องว่าง
        }`
    )
    .join("")}
</span>



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
              {/* ✅ Timeline ของ status */}
<div className="mt-4 px-4 border-t border-gray-300">
  <h4 className="mb-4 font-semibold text-lg text-gray-700 text-center pt-2">🕒 สถานะปัจจุบัน</h4>

  <div className="flex flex-col sm:flex-row items-center w-full justify-between">
{/* Step 0: วางแผนดับไฟ */}
<div className="flex flex-col items-center flex-1">
  <div
    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
      result.status === "0"
        ? "bg-yellow-500 text-white animate-pulse"
        : "bg-gray-300 text-gray-500"
    }`}
  >
    📋
  </div>
  <span
    className={`text-center text-sm sm:text-base ${
      result.status === "0" ? "text-gray-800" : "text-gray-400"
    }`}
  >
    วางแผนดับไฟ
  </span>
  <div className="w-full h-1 mt-2">
    <div
      className={`h-1 rounded ${
        result.status === "0" ? "bg-yellow-500" : "bg-gray-300"
      }`}
    ></div>
  </div>
</div>

{/* Step 1: กำลังดับไฟ */}
<div className="flex flex-col items-center flex-1 mt-4 sm:mt-0">
  <div
    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
      result.status === "1"
        ? "bg-purple-600 text-white animate-pulse"
        : "bg-gray-300 text-gray-500"
    }`}
  >
    ⚒️
  </div>
  <span
    className={`text-center text-sm sm:text-base ${
      result.status === "1" ? "text-gray-800" : "text-gray-400"
    }`}
  >
    กำลังดับไฟเพื่อปฏิบัติงาน
  </span>
  <div className="w-full h-1 mt-2">
    <div
      className={`h-1 rounded ${
        result.status === "1" ? "bg-purple-600" : "bg-gray-300"
      }`}
    ></div>
  </div>
</div>

{/* Step 2: ดำเนินการเสร็จ */}
<div className="flex flex-col items-center flex-1 mt-4 sm:mt-0">
  <div
    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
      result.status === "2"
        ? "bg-green-500 text-white animate-pulse"
        : "bg-gray-300 text-gray-500"
    }`}
  >
    ✅
  </div>
  <span
    className={`text-center text-sm sm:text-base ${
      result.status === "2" ? "text-gray-800" : "text-gray-400"
    }`}
  >
    ดำเนินการแล้วเสร็จจ่ายไฟคืนแล้ว
  </span>
  <div className="w-full h-1 mt-2">
    <div
      className={`h-1 rounded ${
        result.status === "2" ? "bg-green-500" : "bg-gray-300"
      }`}
    ></div>
  </div>
</div>

  </div>
</div>



        </div>
        
      )}

      {/* แผนที่ */}
      <div style={{ height: "500px", marginTop: "1rem", marginBottom:"1rem"}}>
        <MapView data={result ? [result] : allData.data} center={center as any} zoom={zoom} />
      </div>
<footer className="bg-white text-purple-700 p-6 text-center mt-auto border-t border-gray-200">
  <div className="mb-2 text-peaPurple">
    © 2025 การไฟฟ้าส่วนภูมิภาค สาขาสิงหนคร | เว็บไซต์ตรวจสอบไฟดับ
  </div>

  <div className="mt-4">
    <span className="mr-2 font-semibold">ติดตามข่าวสารของเราผ่าน:</span>
    <a
      href="https://line.me/ti/g2/hPiRO_g9H6RZMYxdu4PjTMp9rAxvtG4xgkiiqw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default" 
      target="_blank" 
      rel="noopener noreferrer"
      className="mx-2 hover:text-green-500 transition"
      title="Line"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.135 2 11.045c0 2.846 1.397 5.393 3.624 7.085V22l3.48-1.91c.936.263 1.928.405 2.896.405 5.523 0 10-4.135 10-9.045S17.523 2 12 2zm0 16c-.967 0-1.911-.149-2.823-.437l-.393-.142-2.07 1.138.507-2.97-.128-.414C6.152 15.398 6 14.735 6 14c0-3.86 3.582-7 8-7s8 3.14 8 7-3.582 7-8 7z"/>
      </svg>
    </a>
        <a
      href="" 
      target="_blank" 
      rel="noopener noreferrer"
      className="mx-2 hover:text-purple-500 transition"
      title="Facebook"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12.073c0-5.523-4.477-10-10-10S2 6.55 2 12.073c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54v-2.892h2.54v-2.21c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562v1.882h2.773l-.443 2.892h-2.33v6.987C18.343 21.201 22 17.064 22 12.073z"/>
      </svg>
    </a>
  </div>
</footer>


    </div>
  );
}
