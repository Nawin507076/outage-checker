// app/types.ts

export interface OutageData {
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
