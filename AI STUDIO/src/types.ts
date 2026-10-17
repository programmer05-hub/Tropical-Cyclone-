export type CycloneCategory =
  | "Tropical Storm"
  | "Category 1"
  | "Category 2"
  | "Category 3"
  | "Category 4"
  | "Category 5 / Super Cyclone";

export interface GeoPoint {
  lat: number;
  lon: number;
  label?: string;
  hourOffset?: number; // relative to now (-24h, -12h, 0h, +12h, +24h, etc.)
  windKnots?: number;
  pressureHpa?: number;
}

export interface CoastalSector {
  id: string;
  name: string;
  riskLevel: "CRITICAL_RED" | "HIGH_ORANGE" | "ADVISORY_YELLOW";
  surgeDepthMeters: number;
  elevationMeters: number;
  population: number;
  evacuatedPercent: number;
  hospitalsCount: number;
  status: "MANDATORY_EVACUATION" | "PREPAREDNESS_WARNING" | "WATCH_ADVISORY";
  coords: { x: number; y: number }[]; // Polygon for visual map
}

export interface Shelter {
  id: string;
  name: string;
  type: "Concrete Storm Fortress" | "Elevated University Hub" | "Inland Sports Arena" | "Civic Defense Complex";
  capacity: number;
  occupied: number;
  elevationMeters: number;
  lat: number;
  lon: number;
  x: number; // canvas map relative coord %
  y: number; // canvas map relative coord %
  hasGenerator: boolean;
  hasMedicalTeam: boolean;
  waterSupplyDays: number;
  status: "Accepting Residents" | "Near Capacity" | "Full" | "Staging Rescue Teams";
}

export interface EvacuationCorridor {
  id: string;
  name: string;
  code: string;
  fromSector: string;
  toShelter: string;
  distanceKm: number;
  transitTimeMin: number;
  status: "CLEAR_ACTIVE" | "HEAVY_CONGESTION" | "CLOSING_SOON" | "FLOOD_RISK";
  contraflowActive: boolean;
  clearanceVehicleTypes: string;
  waypoints: { x: number; y: number }[];
  checkpoints: { name: string; status: string; hazard: string }[];
}

export interface CycloneData {
  id: string;
  name: string;
  basin: string;
  category: CycloneCategory;
  windSpeedKnots: number;
  gustKnots: number;
  pressureHpa: number;
  lat: number;
  lon: number;
  heading: number; // degrees (e.g. 315 NW)
  translationSpeedKm: number;
  hoursToLandfall: number;
  seaSurfaceTempC: number;
  targetRegion: string;
  surgeHeightMeters: number;
  dvorakTNumber: string; // e.g. "T6.5"
  satelliteFeature: "Pin-hole Eye with Symmetrical Deep Convective Ring" | "Ragged Eye with Outer Spiral Rainbands" | "Intense Eyewall Replacement Active";
  historicalPoints: GeoPoint[];
  forecastCone: {
    hour: number;
    lat: number;
    lon: number;
    x: number; // map %
    y: number; // map %
    coneRadiusKm: number;
    intensityCategory: CycloneCategory;
    windKnots: number;
  }[];
  coastalSectors: CoastalSector[];
  shelters: Shelter[];
  corridors: EvacuationCorridor[];
}

export interface ForecastAnalysis {
  summary: string;
  intensificationRisk: string;
  eyewallStatus: string;
  landfallProjection: string;
  stormSurgeThreat: string;
  tacticalDirectives: string[];
  windShearTrend: string;
  meteorologicalConfidence: string;
}

export interface ImpactProjection {
  baselineRiskScore: number;
  projectedCasualtyRangeWithoutEvacuation: string;
  projectedCasualtyWithEvacuation: string;
  displacedPersonsCount: string;
  housingDamageEstimate: string;
  powerGridOutageExpectation: string;
  hospitalBedCapacityImpact: string;
  economicDamageIndex: string;
}

export interface AlertBroadcast {
  id: string;
  timestamp: string;
  channel: "SMS_CELL_BROADCAST" | "CAP_RADIO_TV" | "ACOUSTIC_SIREN" | "MARINE_VHF" | "PUSH_NOTIF";
  audience: "COASTAL_RESIDENTS" | "FIRST_RESPONDERS" | "MARITIME_VESSELS" | "HOSPITAL_NETWORKS";
  headline: string;
  content: string;
  status: "TRANSMITTED" | "BROADCASTING" | "SCHEDULED";
  language: string;
  recipientsCount: number;
}

export interface ResidentSOS {
  id: string;
  timestamp: string;
  citizenName: string;
  sector: string;
  peopleCount: number;
  situation: string;
  urgency: "CRITICAL" | "HIGH" | "MODERATE";
  contact: string;
  dispatched: boolean;
}

export interface SearchResult {
  query: string;
  answer: string;
  keyTakeaways: string[];
  actionableChecklist: string[];
  scientificReferences: string[];
  relatedQuestions: string[];
}
