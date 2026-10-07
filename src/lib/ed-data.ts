export type ESI = 1 | 2 | 3 | 4 | 5;

export const ESI_LABEL: Record<ESI, string> = {
  1: "Resuscitation",
  2: "Emergent",
  3: "Urgent",
  4: "Less urgent",
  5: "Non-urgent",
};

// Target max wait (minutes) per ESI level
export const ESI_TARGET: Record<ESI, number> = { 1: 0, 2: 10, 3: 30, 4: 60, 5: 120 };

export type Patient = {
  id: string;
  name: string;
  age: number;
  complaint: string;
  esi: ESI;
  arrivedMinAgo: number;
  status: "waiting" | "in-treatment";
  location?: string;
  provider?: string;
  pending?: string[];
};

export const patients: Patient[] = [
  { id: "P-1041", name: "R. Alvarez", age: 67, complaint: "Chest pain, diaphoresis", esi: 1, arrivedMinAgo: 22, status: "in-treatment", location: "Trauma 1", provider: "Dr. Okafor", pending: ["Troponin", "Cath lab"] },
  { id: "P-1042", name: "J. Chen", age: 34, complaint: "MVC, abd pain", esi: 2, arrivedMinAgo: 41, status: "in-treatment", location: "Trauma 2", provider: "Dr. Patel", pending: ["CT Abd"] },
  { id: "P-1043", name: "M. Brooks", age: 81, complaint: "Altered mental status", esi: 2, arrivedMinAgo: 63, status: "in-treatment", location: "Bed 4", provider: "Dr. Okafor", pending: ["CT Head", "BMP"] },
  { id: "P-1044", name: "T. Nguyen", age: 9, complaint: "Asthma exacerbation", esi: 2, arrivedMinAgo: 18, status: "in-treatment", location: "Peds 2", provider: "PA Rivera" },
  { id: "P-1045", name: "A. Johnson", age: 45, complaint: "Lac, left hand", esi: 4, arrivedMinAgo: 95, status: "in-treatment", location: "Fast Track 1", provider: "NP Kim" },
  { id: "P-1046", name: "S. Patel", age: 29, complaint: "Abd pain, pregnant", esi: 3, arrivedMinAgo: 110, status: "in-treatment", location: "Bed 7", provider: "Dr. Patel", pending: ["US Pelvis"] },
  { id: "P-1047", name: "D. Wright", age: 58, complaint: "SOB, CHF hx", esi: 3, arrivedMinAgo: 74, status: "in-treatment", location: "Bed 9", provider: "Dr. Lee", pending: ["BNP", "CXR"] },
  { id: "P-1048", name: "K. Morris", age: 22, complaint: "Ankle injury", esi: 4, arrivedMinAgo: 52, status: "in-treatment", location: "Fast Track 2", provider: "NP Kim", pending: ["XR Ankle"] },
  { id: "P-1049", name: "L. Garcia", age: 71, complaint: "Fall, hip pain", esi: 3, arrivedMinAgo: 130, status: "in-treatment", location: "Hall 1", provider: "Dr. Lee", pending: ["Ortho consult"] },
  { id: "P-1050", name: "B. Taylor", age: 52, complaint: "Severe headache", esi: 2, arrivedMinAgo: 14, status: "waiting" },
  { id: "P-1051", name: "E. Davis", age: 38, complaint: "Abd pain, vomiting", esi: 3, arrivedMinAgo: 48, status: "waiting" },
  { id: "P-1052", name: "H. Wilson", age: 63, complaint: "Dizziness", esi: 3, arrivedMinAgo: 37, status: "waiting" },
  { id: "P-1053", name: "N. Thomas", age: 27, complaint: "Fever, cough", esi: 4, arrivedMinAgo: 72, status: "waiting" },
  { id: "P-1054", name: "C. White", age: 19, complaint: "Wrist pain", esi: 4, arrivedMinAgo: 66, status: "waiting" },
  { id: "P-1055", name: "G. Harris", age: 44, complaint: "Back pain", esi: 4, arrivedMinAgo: 101, status: "waiting" },
  { id: "P-1056", name: "F. Martin", age: 31, complaint: "Rash", esi: 5, arrivedMinAgo: 88, status: "waiting" },
  { id: "P-1057", name: "O. Clark", age: 4, complaint: "Ear pain", esi: 5, arrivedMinAgo: 40, status: "waiting" },
  { id: "P-1058", name: "V. Lewis", age: 56, complaint: "Med refill", esi: 5, arrivedMinAgo: 135, status: "waiting" },
];

export type StaffRole = { role: string; clockedIn: number; scheduled: number; targetRatio: number; note?: string };

// targetRatio = max patients per staff member
export const staff: StaffRole[] = [
  { role: "Attending Physicians", clockedIn: 3, scheduled: 4, targetRatio: 4, note: "Dr. Singh late — ETA 20m" },
  { role: "PAs / NPs", clockedIn: 2, scheduled: 2, targetRatio: 5 },
  { role: "Registered Nurses", clockedIn: 6, scheduled: 8, targetRatio: 3, note: "2 call-outs" },
  { role: "Techs / CNAs", clockedIn: 3, scheduled: 3, targetRatio: 8 },
  { role: "Triage Nurse", clockedIn: 1, scheduled: 1, targetRatio: 10 },
];

export const shiftEnding = [
  { name: "RN M. Ortiz", inMin: 35 },
  { name: "Dr. Okafor", inMin: 70 },
  { name: "Tech J. Baker", inMin: 95 },
];

export type Alert = {
  id: string;
  type: "crime" | "traffic" | "weather" | "public-health" | "event";
  title: string;
  detail: string;
  distance: string;
  minAgo: number;
  impact: "high" | "medium" | "low";
  source: string;
};

export const alerts: Alert[] = [
  { id: "a1", type: "traffic", title: "Multi-vehicle collision on I-95 NB", detail: "4 vehicles, reported entrapment. Fire & EMS on scene.", distance: "3.2 mi", minAgo: 6, impact: "high", source: "State DOT" },
  { id: "a2", type: "weather", title: "Severe Thunderstorm Warning", detail: "60 mph gusts, hail. Valid until 6:15 AM.", distance: "County-wide", minAgo: 18, impact: "medium", source: "National Weather Service" },
  { id: "a3", type: "crime", title: "Shooting reported, Eastside district", detail: "Police responding. Possible multiple victims.", distance: "1.8 mi", minAgo: 24, impact: "high", source: "Local News 7" },
  { id: "a4", type: "public-health", title: "Influenza A activity rising", detail: "Regional ED visits for ILI up 22% week-over-week.", distance: "Regional", minAgo: 240, impact: "medium", source: "County Health Dept" },
  { id: "a5", type: "event", title: "Stadium concert — 40k attendees", detail: "Event ends 11 PM tonight. Expect intox/heat cases.", distance: "4.5 mi", minAgo: 380, impact: "low", source: "City Events" },
];

export const ems = [
  { unit: "Medic 12", eta: 4, esi: 1 as ESI, summary: "STEMI alert, 61M, BP 88/50", alert: "STEMI" },
  { unit: "Medic 7", eta: 11, esi: 2 as ESI, summary: "MVC I-95, 30F, GCS 14", alert: "Trauma" },
  { unit: "Engine 3", eta: 17, esi: 3 as ESI, summary: "Fall from ladder, 48M, wrist deformity" },
];

export const beds = { total: 28, occupied: 22, cleaning: 2, boarding: 4 };

// Hourly arrivals: actual for past hours, forecast for upcoming
export const arrivals = [
  { h: "22", actual: 9, forecast: 8 },
  { h: "23", actual: 7, forecast: 7 },
  { h: "00", actual: 6, forecast: 6 },
  { h: "01", actual: 5, forecast: 5 },
  { h: "02", actual: 6, forecast: 4 },
  { h: "03", actual: 8, forecast: 4 },
  { h: "04", forecast: 6 },
  { h: "05", forecast: 5 },
  { h: "06", forecast: 6 },
  { h: "07", forecast: 9 },
];
