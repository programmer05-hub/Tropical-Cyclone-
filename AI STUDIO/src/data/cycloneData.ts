import { CycloneData, ResidentSOS } from "../types";

export const CYCLONES_DATABASE: CycloneData[] = [
  {
    id: "amir-bob-2026",
    name: "Super Cyclone AMIR",
    basin: "North Indian Ocean (Bay of Bengal)",
    category: "Category 5 / Super Cyclone",
    windSpeedKnots: 145,
    gustKnots: 175,
    pressureHpa: 918,
    lat: 19.4,
    lon: 87.2,
    heading: 325, // NW
    translationSpeedKm: 18,
    hoursToLandfall: 16,
    seaSurfaceTempC: 30.5,
    targetRegion: "Coastal Odisha & Sundarbans Estuary",
    surgeHeightMeters: 4.8,
    dvorakTNumber: "T7.0",
    satelliteFeature: "Pin-hole Eye with Symmetrical Deep Convective Ring",
    historicalPoints: [
      { lat: 14.8, lon: 91.2, label: "Genesis / Deep Depression (T-48h)", hourOffset: -48, windKnots: 35, pressureHpa: 1002 },
      { lat: 16.5, lon: 89.6, label: "Cyclonic Storm (T-36h)", hourOffset: -36, windKnots: 55, pressureHpa: 988 },
      { lat: 17.8, lon: 88.4, label: "Severe Cyclone (T-24h)", hourOffset: -24, windKnots: 85, pressureHpa: 965 },
      { lat: 18.6, lon: 87.8, label: "Very Severe (T-12h)", hourOffset: -12, windKnots: 115, pressureHpa: 942 },
      { lat: 19.4, lon: 87.2, label: "Super Cyclone Eyewall (NOW)", hourOffset: 0, windKnots: 145, pressureHpa: 918 }
    ],
    forecastCone: [
      { hour: 0, lat: 19.4, lon: 87.2, x: 58, y: 64, coneRadiusKm: 25, intensityCategory: "Category 5 / Super Cyclone", windKnots: 145 },
      { hour: 6, lat: 19.9, lon: 86.8, x: 53, y: 56, coneRadiusKm: 42, intensityCategory: "Category 5 / Super Cyclone", windKnots: 140 },
      { hour: 12, lat: 20.5, lon: 86.4, x: 47, y: 47, coneRadiusKm: 60, intensityCategory: "Category 4", windKnots: 130 },
      { hour: 16, lat: 21.0, lon: 86.1, x: 43, y: 41, coneRadiusKm: 75, intensityCategory: "Category 4", windKnots: 120 }, // LANDFALL
      { hour: 24, lat: 21.8, lon: 85.6, x: 37, y: 31, coneRadiusKm: 110, intensityCategory: "Category 2", windKnots: 85 },
      { hour: 48, lat: 23.2, lon: 84.8, x: 28, y: 16, coneRadiusKm: 180, intensityCategory: "Tropical Storm", windKnots: 45 }
    ],
    coastalSectors: [
      {
        id: "sec-alpha",
        name: "Sector Alpha - Paradip Coastal Belt",
        riskLevel: "CRITICAL_RED",
        surgeDepthMeters: 4.8,
        elevationMeters: 1.8,
        population: 165000,
        evacuatedPercent: 78,
        hospitalsCount: 4,
        status: "MANDATORY_EVACUATION",
        coords: [
          { x: 46, y: 48 },
          { x: 50, y: 44 },
          { x: 48, y: 38 },
          { x: 41, y: 42 }
        ]
      },
      {
        id: "sec-bravo",
        name: "Sector Bravo - Kendrapara River Delta",
        riskLevel: "CRITICAL_RED",
        surgeDepthMeters: 4.2,
        elevationMeters: 2.2,
        population: 190000,
        evacuatedPercent: 62,
        hospitalsCount: 3,
        status: "MANDATORY_EVACUATION",
        coords: [
          { x: 41, y: 42 },
          { x: 48, y: 38 },
          { x: 44, y: 32 },
          { x: 38, y: 35 }
        ]
      },
      {
        id: "sec-charlie",
        name: "Sector Charlie - Balasore Tidal Plain",
        riskLevel: "HIGH_ORANGE",
        surgeDepthMeters: 3.1,
        elevationMeters: 3.8,
        population: 230000,
        evacuatedPercent: 49,
        hospitalsCount: 6,
        status: "MANDATORY_EVACUATION",
        coords: [
          { x: 38, y: 35 },
          { x: 44, y: 32 },
          { x: 40, y: 24 },
          { x: 34, y: 26 }
        ]
      },
      {
        id: "sec-delta",
        name: "Sector Delta - Digha Coastal Front",
        riskLevel: "HIGH_ORANGE",
        surgeDepthMeters: 2.6,
        elevationMeters: 4.5,
        population: 140000,
        evacuatedPercent: 88,
        hospitalsCount: 2,
        status: "PREPAREDNESS_WARNING",
        coords: [
          { x: 34, y: 26 },
          { x: 40, y: 24 },
          { x: 37, y: 18 },
          { x: 30, y: 20 }
        ]
      }
    ],
    shelters: [
      {
        id: "sh-1",
        name: "Cuttack Multi-Purpose Cyclone Fortress Hub",
        type: "Concrete Storm Fortress",
        capacity: 45000,
        occupied: 32400,
        elevationMeters: 24,
        lat: 20.46,
        lon: 85.88,
        x: 32,
        y: 50,
        hasGenerator: true,
        hasMedicalTeam: true,
        waterSupplyDays: 8,
        status: "Accepting Residents"
      },
      {
        id: "sh-2",
        name: "Bhubaneswar Central Arena Shelter Complex",
        type: "Inland Sports Arena",
        capacity: 65000,
        occupied: 48900,
        elevationMeters: 38,
        lat: 20.29,
        lon: 85.82,
        x: 26,
        y: 60,
        hasGenerator: true,
        hasMedicalTeam: true,
        waterSupplyDays: 12,
        status: "Accepting Residents"
      },
      {
        id: "sh-3",
        name: "Baripada High-Elevation University Haven",
        type: "Elevated University Hub",
        capacity: 35000,
        occupied: 18500,
        elevationMeters: 42,
        lat: 21.93,
        lon: 86.72,
        x: 28,
        y: 22,
        hasGenerator: true,
        hasMedicalTeam: true,
        waterSupplyDays: 10,
        status: "Accepting Residents"
      },
      {
        id: "sh-4",
        name: "Jajpur Civil Defense Bunker Facility",
        type: "Civic Defense Complex",
        capacity: 30000,
        occupied: 28200,
        elevationMeters: 31,
        lat: 20.85,
        lon: 86.33,
        x: 33,
        y: 38,
        hasGenerator: true,
        hasMedicalTeam: true,
        waterSupplyDays: 6,
        status: "Near Capacity"
      }
    ],
    corridors: [
      {
        id: "cor-1",
        name: "Corridor Alpha - NH-53 Expressway Contraflow",
        code: "COR-ALPHA-53",
        fromSector: "Sector Alpha - Paradip Coastal Belt",
        toShelter: "Cuttack Multi-Purpose Cyclone Fortress Hub",
        distanceKm: 84,
        transitTimeMin: 72,
        status: "CLEAR_ACTIVE",
        contraflowActive: true,
        clearanceVehicleTypes: "All civilian vehicles, buses & convoys",
        waypoints: [
          { x: 46, y: 45 },
          { x: 40, y: 47 },
          { x: 36, y: 49 },
          { x: 32, y: 50 }
        ],
        checkpoints: [
          { name: "Mahanadi Bridge Mile-18", status: "Open / High Flow", hazard: "Wind gusts 70kt, heavy trucks only with convoy" },
          { name: "Jagatsinghpur Bypass Junction", status: "Active Contraflow", hazard: "Emergency buses priority" },
          { name: "Cuttack Western Gate Entry", status: "Unobstructed", hazard: "Medical screening active" }
        ]
      },
      {
        id: "cor-2",
        name: "Corridor Beta - Kendrapara to Jajpur High Ridge Route",
        code: "COR-BETA-HIGH",
        fromSector: "Sector Bravo - Kendrapara River Delta",
        toShelter: "Jajpur Civil Defense Bunker Facility",
        distanceKm: 68,
        transitTimeMin: 65,
        status: "CLEAR_ACTIVE",
        contraflowActive: false,
        clearanceVehicleTypes: "High-clearance buses & emergency transports",
        waypoints: [
          { x: 42, y: 38 },
          { x: 38, y: 38 },
          { x: 33, y: 38 }
        ],
        checkpoints: [
          { name: "Brahmani River Culvert", status: "Watch Water Gauge", hazard: "Water level 0.8m below roadbed" },
          { name: "Dhamra Rail Overpass", status: "Open", hazard: "Clear" }
        ]
      },
      {
        id: "cor-3",
        name: "Corridor Gamma - Balasore North-West Arterial",
        code: "COR-GAMMA-NW",
        fromSector: "Sector Charlie - Balasore Tidal Plain",
        toShelter: "Baripada High-Elevation University Haven",
        distanceKm: 76,
        transitTimeMin: 80,
        status: "HEAVY_CONGESTION",
        contraflowActive: true,
        clearanceVehicleTypes: "Evacuation buses and civilian convoys",
        waypoints: [
          { x: 37, y: 30 },
          { x: 32, y: 26 },
          { x: 28, y: 22 }
        ],
        checkpoints: [
          { name: "Remuna Toll Plaza", status: "Toll Gates Lifted (Free Passage)", hazard: "Congestion moving at 25 km/h" },
          { name: "Kuldiha Forest Pass", status: "Open", hazard: "Rain bands reducing visibility" }
        ]
      }
    ]
  },
  {
    id: "zephyr-arabian-2026",
    name: "Severe Cyclone ZEPHYR",
    basin: "North Indian Ocean (Arabian Sea)",
    category: "Category 3",
    windSpeedKnots: 110,
    gustKnots: 135,
    pressureHpa: 954,
    lat: 21.2,
    lon: 68.8,
    heading: 35, // NE
    translationSpeedKm: 14,
    hoursToLandfall: 22,
    seaSurfaceTempC: 29.8,
    targetRegion: "Saurashtra Coast & Gulf of Kutch",
    surgeHeightMeters: 3.5,
    dvorakTNumber: "T5.5",
    satelliteFeature: "Ragged Eye with Outer Spiral Rainbands",
    historicalPoints: [
      { lat: 17.5, lon: 66.8, label: "T-48h Depression", hourOffset: -48, windKnots: 40, pressureHpa: 998 },
      { lat: 18.8, lon: 67.4, label: "T-36h Cyclonic Storm", hourOffset: -36, windKnots: 65, pressureHpa: 980 },
      { lat: 20.0, lon: 68.1, label: "T-18h Severe Cyclone", hourOffset: -18, windKnots: 95, pressureHpa: 962 },
      { lat: 21.2, lon: 68.8, label: "NOW Cat 3 Intensifying", hourOffset: 0, windKnots: 110, pressureHpa: 954 }
    ],
    forecastCone: [
      { hour: 0, lat: 21.2, lon: 68.8, x: 55, y: 70, coneRadiusKm: 28, intensityCategory: "Category 3", windKnots: 110 },
      { hour: 12, lat: 22.0, lon: 69.4, x: 48, y: 55, coneRadiusKm: 55, intensityCategory: "Category 3", windKnots: 115 },
      { hour: 22, lat: 22.8, lon: 69.9, x: 42, y: 42, coneRadiusKm: 80, intensityCategory: "Category 2", windKnots: 95 },
      { hour: 36, lat: 23.6, lon: 70.8, x: 34, y: 26, coneRadiusKm: 125, intensityCategory: "Category 1", windKnots: 70 }
    ],
    coastalSectors: [
      {
        id: "sec-z1",
        name: "Porbandar Coastal Strip",
        riskLevel: "CRITICAL_RED",
        surgeDepthMeters: 3.5,
        elevationMeters: 2.1,
        population: 130000,
        evacuatedPercent: 82,
        hospitalsCount: 3,
        status: "MANDATORY_EVACUATION",
        coords: [{ x: 48, y: 56 }, { x: 54, y: 52 }, { x: 50, y: 46 }, { x: 44, y: 50 }]
      },
      {
        id: "sec-z2",
        name: "Dwarka Fishery & Harbour Zone",
        riskLevel: "CRITICAL_RED",
        surgeDepthMeters: 3.8,
        elevationMeters: 1.9,
        population: 95000,
        evacuatedPercent: 91,
        hospitalsCount: 2,
        status: "MANDATORY_EVACUATION",
        coords: [{ x: 44, y: 50 }, { x: 50, y: 46 }, { x: 46, y: 38 }, { x: 40, y: 42 }]
      }
    ],
    shelters: [
      {
        id: "sh-z1",
        name: "Rajkot Inland Emergency Complex",
        type: "Concrete Storm Fortress",
        capacity: 40000,
        occupied: 22000,
        elevationMeters: 132,
        lat: 22.3,
        lon: 70.8,
        x: 32,
        y: 44,
        hasGenerator: true,
        hasMedicalTeam: true,
        waterSupplyDays: 14,
        status: "Accepting Residents"
      }
    ],
    corridors: [
      {
        id: "cor-z1",
        name: "Dwarka-Jamnagar-Rajkot Evacuation Highway",
        code: "COR-DJR-27",
        fromSector: "Dwarka Fishery & Harbour Zone",
        toShelter: "Rajkot Inland Emergency Complex",
        distanceKm: 140,
        transitTimeMin: 110,
        status: "CLEAR_ACTIVE",
        contraflowActive: true,
        clearanceVehicleTypes: "All vehicles and government buses",
        waypoints: [{ x: 42, y: 44 }, { x: 37, y: 44 }, { x: 32, y: 44 }],
        checkpoints: [{ name: "Jamnagar Outer Ring Bypass", status: "Clear", hazard: "No hazard" }]
      }
    ]
  },
  {
    id: "marina-pac-2026",
    name: "Super Typhoon MARINA",
    basin: "Western North Pacific",
    category: "Category 5 / Super Cyclone",
    windSpeedKnots: 155,
    gustKnots: 190,
    pressureHpa: 906,
    lat: 18.2,
    lon: 124.6,
    heading: 295, // WNW
    translationSpeedKm: 22,
    hoursToLandfall: 14,
    seaSurfaceTempC: 31.0,
    targetRegion: "Eastern Luzon & Cagayan Valley Coast",
    surgeHeightMeters: 5.6,
    dvorakTNumber: "T7.5",
    satelliteFeature: "Pin-hole Eye with Symmetrical Deep Convective Ring",
    historicalPoints: [
      { lat: 15.0, lon: 132.0, label: "T-48h Developing", hourOffset: -48, windKnots: 60, pressureHpa: 985 },
      { lat: 16.2, lon: 129.5, label: "T-30h Typhoon", hourOffset: -30, windKnots: 105, pressureHpa: 948 },
      { lat: 17.1, lon: 127.2, label: "T-18h Super Typhoon", hourOffset: -18, windKnots: 135, pressureHpa: 924 },
      { lat: 18.2, lon: 124.6, label: "NOW Cat 5 (155kt)", hourOffset: 0, windKnots: 155, pressureHpa: 906 }
    ],
    forecastCone: [
      { hour: 0, lat: 18.2, lon: 124.6, x: 65, y: 62, coneRadiusKm: 22, intensityCategory: "Category 5 / Super Cyclone", windKnots: 155 },
      { hour: 8, lat: 18.6, lon: 123.0, x: 54, y: 53, coneRadiusKm: 40, intensityCategory: "Category 5 / Super Cyclone", windKnots: 150 },
      { hour: 14, lat: 18.9, lon: 121.8, x: 44, y: 44, coneRadiusKm: 65, intensityCategory: "Category 4", windKnots: 135 },
      { hour: 24, lat: 19.3, lon: 120.2, x: 32, y: 34, coneRadiusKm: 95, intensityCategory: "Category 3", windKnots: 105 }
    ],
    coastalSectors: [
      {
        id: "sec-m1",
        name: "Cagayan Eastern Seaboard",
        riskLevel: "CRITICAL_RED",
        surgeDepthMeters: 5.6,
        elevationMeters: 1.5,
        population: 210000,
        evacuatedPercent: 74,
        hospitalsCount: 5,
        status: "MANDATORY_EVACUATION",
        coords: [{ x: 50, y: 50 }, { x: 56, y: 46 }, { x: 52, y: 38 }, { x: 45, y: 42 }]
      }
    ],
    shelters: [
      {
        id: "sh-m1",
        name: "Tuguegarao Concrete Mountain Evacuation Center",
        type: "Concrete Storm Fortress",
        capacity: 55000,
        occupied: 38000,
        elevationMeters: 55,
        lat: 17.61,
        lon: 121.72,
        x: 35,
        y: 42,
        hasGenerator: true,
        hasMedicalTeam: true,
        waterSupplyDays: 15,
        status: "Accepting Residents"
      }
    ],
    corridors: [
      {
        id: "cor-m1",
        name: "Maharlika Highway Inland Mountain Corridor",
        code: "COR-MAHARLIKA-1",
        fromSector: "Cagayan Eastern Seaboard",
        toShelter: "Tuguegarao Concrete Mountain Evacuation Center",
        distanceKm: 92,
        transitTimeMin: 85,
        status: "CLEAR_ACTIVE",
        contraflowActive: true,
        clearanceVehicleTypes: "Heavy convoys and buses only",
        waypoints: [{ x: 47, y: 43 }, { x: 41, y: 42 }, { x: 35, y: 42 }],
        checkpoints: [{ name: "Sierra Madre Ridge Gate", status: "Open with Convoy", hazard: "Crosswinds up to 55kt" }]
      }
    ]
  }
];

export const INITIAL_SOS_PINGS: ResidentSOS[] = [
  {
    id: "sos-101",
    timestamp: "12 mins ago",
    citizenName: "Subhashree Pradhan (Panchayat Head)",
    sector: "Sector Alpha - Paradip Coastal Belt",
    peopleCount: 42,
    situation: "Water entering coastal hamlet, 8 elderly bedridden individuals require amphibious vehicle evacuation.",
    urgency: "CRITICAL",
    contact: "+91-94371-XXXXX",
    dispatched: false
  },
  {
    id: "sos-102",
    timestamp: "24 mins ago",
    citizenName: "Captain Rajesh Verma (Fishing Trawler DeepSea-9)",
    sector: "Mahanadi River Estuary",
    peopleCount: 6,
    situation: "Engine failure while returning to harbour; anchor holding in 3.5m swell.",
    urgency: "CRITICAL",
    contact: "VHF CH-16 / SAT-9821-XX",
    dispatched: true
  },
  {
    id: "sos-103",
    timestamp: "38 mins ago",
    citizenName: "Ananya Sen (Maternity Clinic Director)",
    sector: "Sector Bravo - Kendrapara River Delta",
    peopleCount: 19,
    situation: "Power backup fuel running low, 4 newborns and mothers need transfer to Cuttack Multi-Purpose Fortress.",
    urgency: "HIGH",
    contact: "+91-98610-XXXXX",
    dispatched: true
  },
  {
    id: "sos-104",
    timestamp: "45 mins ago",
    citizenName: "Ramesh Jena",
    sector: "Sector Charlie - Balasore Tidal Plain",
    peopleCount: 14,
    situation: "Livestock secured, family stranded on school rooftop as tidal canal overflowed.",
    urgency: "HIGH",
    contact: "+91-97772-XXXXX",
    dispatched: false
  }
];
