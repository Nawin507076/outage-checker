"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";

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

const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  data: OutageData[]; 
  center: LatLngExpression;
  zoom: number;
}

export default function MapView({ data, center, zoom }: MapViewProps) {
  const safeData = Array.isArray(data) ? data : []; // fallback
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
{(safeData || []).map((item, idx) => (
  <Marker
    key={idx}
    position={[parseFloat(item.latitude), parseFloat(item.longitude)] as LatLngExpression}
    icon={redIcon}
  >
    <Popup>
      <strong>มิเตอร์:</strong> {item.meter_id} <br />
      <strong>ผู้ใช้:</strong> {item.customer_id} <br />
      <strong>หม้อแปลง:</strong> {item.transformer_id} <br />
      <strong>ดับ:</strong> {item.outage_start} - {item.outage_end} <br />
      <strong>วันที่:</strong> {item.outage_date} <br />
      <strong>ชื่อผู้ใช้ไฟฟ้า:</strong> {item.name} <br />
      <strong>สถานที่ใช้ไฟฟ้า:</strong> {item.location}
    </Popup>
  </Marker>
))}
    </MapContainer>
  );
}
