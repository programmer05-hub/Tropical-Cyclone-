import React, { useState } from "react";
import { Wind, Gauge, MapPin, Compass, Waves, Thermometer, Check } from "lucide-react";
import { CycloneData, CycloneCategory } from "../types";

interface CustomCycloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCyclone: (cyclone: CycloneData) => void;
}

export const CustomCycloneModal: React.FC<CustomCycloneModalProps> = ({
  isOpen,
  onClose,
  onCreateCyclone
}) => {
  const [name, setName] = useState("Cyclone NEER");
  const [basin, setBasin] = useState("North Indian Ocean");
  const [category, setCategory] = useState<CycloneCategory>("Category 4");
  const [windKnots, setWindKnots] = useState(130);
  const [pressureHpa, setPressureHpa] = useState(930);
  const [surgeMeters, setSurgeMeters] = useState(4.2);
  const [seaSurfaceTemp, setSeaSurfaceTemp] = useState(30.2);
  const [targetRegion, setTargetRegion] = useState("Coastal Bengal & Sundarbans");
  const [hoursToLandfall, setHoursToLandfall] = useState(18);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCyclone: CycloneData = {
      id: `custom-${Date.now()}`,
      name,
      basin,
      category,
      windSpeedKnots: windKnots,
      gustKnots: Math.round(windKnots * 1.25),
      pressureHpa,
      lat: 19.8,
      lon: 87.5,
      heading: 320,
      translationSpeedKm: 16,
      hoursToLandfall,
      seaSurfaceTempC: seaSurfaceTemp,
      targetRegion,
      surgeHeightMeters: surgeMeters,
      dvorakTNumber: windKnots > 130 ? "T6.5" : "T5.5",
      satelliteFeature: "Pin-hole Eye with Symmetrical Deep Convective Ring",
      historicalPoints: [
        { lat: 16.5, lon: 89.8, label: "T-24h", hourOffset: -24, windKnots: windKnots - 35, pressureHpa: pressureHpa + 28 },
        { lat: 18.2, lon: 88.5, label: "T-12h", hourOffset: -12, windKnots: windKnots - 15, pressureHpa: pressureHpa + 14 },
        { lat: 19.8, lon: 87.5, label: "NOW", hourOffset: 0, windKnots, pressureHpa }
      ],
      forecastCone: [
        { hour: 0, lat: 19.8, lon: 87.5, x: 57, y: 62, coneRadiusKm: 25, intensityCategory: category, windKnots },
        { hour: 8, lat: 20.4, lon: 86.8, x: 49, y: 52, coneRadiusKm: 48, intensityCategory: category, windKnots: Math.round(windKnots * 0.95) },
        { hour: hoursToLandfall, lat: 21.2, lon: 86.2, x: 42, y: 42, coneRadiusKm: 70, intensityCategory: "Category 3", windKnots: Math.round(windKnots * 0.85) },
        { hour: 36, lat: 22.5, lon: 85.5, x: 33, y: 28, coneRadiusKm: 120, intensityCategory: "Category 1", windKnots: Math.round(windKnots * 0.6) }
      ],
      coastalSectors: [
        {
          id: "custom-sec-1",
          name: `${targetRegion} Primary Surge Sector`,
          riskLevel: "CRITICAL_RED",
          surgeDepthMeters: surgeMeters,
          elevationMeters: 2.0,
          population: 175000,
          evacuatedPercent: 65,
          hospitalsCount: 4,
          status: "MANDATORY_EVACUATION",
          coords: [{ x: 46, y: 48 }, { x: 50, y: 44 }, { x: 48, y: 38 }, { x: 41, y: 42 }]
        }
      ],
      shelters: [
        {
          id: "custom-sh-1",
          name: "Regional Fortress Evacuation Arena",
          type: "Concrete Storm Fortress",
          capacity: 50000,
          occupied: 28000,
          elevationMeters: 28,
          lat: 20.5,
          lon: 86.0,
          x: 32,
          y: 48,
          hasGenerator: true,
          hasMedicalTeam: true,
          waterSupplyDays: 10,
          status: "Accepting Residents"
        }
      ],
      corridors: [
        {
          id: "custom-cor-1",
          name: "Inland High-Capacity Emergency Expressway",
          code: "COR-CUSTOM-EXP",
          fromSector: `${targetRegion} Primary Surge Sector`,
          toShelter: "Regional Fortress Evacuation Arena",
          distanceKm: 75,
          transitTimeMin: 68,
          status: "CLEAR_ACTIVE",
          contraflowActive: true,
          clearanceVehicleTypes: "All evacuation convoys",
          waypoints: [{ x: 46, y: 45 }, { x: 39, y: 46 }, { x: 32, y: 48 }],
          checkpoints: [{ name: "River Estuary Bridge", status: "Open with Monitoring", hazard: "Wind gusts 65kt" }]
        }
      ]
    };

    onCreateCyclone(newCyclone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Simulate Custom Satellite Meteorological Telemetry</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Cyclone Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Oceanic Basin</label>
              <input
                type="text"
                value={basin}
                onChange={(e) => setBasin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Category Intensity</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="Category 2">Category 2 (83-95 kt)</option>
                <option value="Category 3">Category 3 (96-112 kt)</option>
                <option value="Category 4">Category 4 (113-136 kt)</option>
                <option value="Category 5 / Super Cyclone">Category 5 / Super Cyclone (137+ kt)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Target Coastal Region</label>
              <input
                type="text"
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Winds (knots)</label>
              <input
                type="number"
                min="40"
                max="195"
                value={windKnots}
                onChange={(e) => setWindKnots(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Pressure (hPa)</label>
              <input
                type="number"
                min="880"
                max="1010"
                value={pressureHpa}
                onChange={(e) => setPressureHpa(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Surge (m)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="12"
                value={surgeMeters}
                onChange={(e) => setSurgeMeters(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-red-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Ingest & Track Storm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
