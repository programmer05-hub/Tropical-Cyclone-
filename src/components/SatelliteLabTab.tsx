import React, { useState } from "react";
import {
  Satellite,
  Layers,
  Thermometer,
  Activity,
  Maximize2,
  RefreshCw,
  Eye,
  Info,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { CycloneData } from "../types";

interface SatelliteLabTabProps {
  cyclone: CycloneData;
}

export const SatelliteLabTab: React.FC<SatelliteLabTabProps> = ({ cyclone }) => {
  const [selectedBand, setSelectedBand] = useState<
    "BAND_13_IR" | "BAND_8_WV" | "MICROWAVE_89GHZ" | "VIS_GEO"
  >("BAND_13_IR");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Satellite className="w-5 h-5 animate-spin-slow" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              SATELLITE METEOROLOGY & RADIOMETER DIAGNOSTIC LAB
            </h2>
            <p className="text-xs text-slate-400">
              INSAT-3DR / NOAA-20 VIIRS / GCOM-W1 AMSR2 Multispectral Radiometry
            </p>
          </div>
        </div>

        {/* Spectral Band Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedBand("BAND_13_IR")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedBand === "BAND_13_IR"
                ? "bg-purple-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Enhanced IR 10.3μm
          </button>
          <button
            onClick={() => setSelectedBand("BAND_8_WV")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedBand === "BAND_8_WV"
                ? "bg-cyan-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Water Vapor 6.9μm
          </button>
          <button
            onClick={() => setSelectedBand("MICROWAVE_89GHZ")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedBand === "MICROWAVE_89GHZ"
                ? "bg-amber-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Passive Microwave 89GHz
          </button>
          <button
            onClick={() => setSelectedBand("VIS_GEO")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedBand === "VIS_GEO"
                ? "bg-emerald-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Visible Day/Night
          </button>
        </div>
      </div>

      {/* Main Satellite Radiometer Canvas & Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radiometer Visual Display (2 cols) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-slate-800 text-slate-300">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              RADIOMETRIC CHANNEL: <strong>{selectedBand}</strong>
            </span>
            <span className="text-slate-400">RESOLUTION: 1.0 km/pixel • REFRESH: 10 mins</span>
          </div>

          {/* Visual Simulation of the Spectral Band */}
          <div className="relative my-4 w-full h-80 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
            {/* Colorized cloud vortex representation */}
            {selectedBand === "BAND_13_IR" && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-fuchsia-600 to-slate-950 opacity-90 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-red-500/80 animate-spin-slow flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-slate-950 border-2 border-white/80 shadow-2xl flex items-center justify-center">
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">+18.5°C</span>
                  </div>
                </div>
              </div>
            )}

            {selectedBand === "BAND_8_WV" && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-blue-800 to-slate-950 opacity-90 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full border-4 border-dashed border-cyan-400/80 animate-spin-slow flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-slate-950 border-2 border-cyan-300 shadow-2xl flex items-center justify-center">
                    <span className="text-[10px] font-mono text-cyan-200 font-bold">DRY SLOT</span>
                  </div>
                </div>
              </div>
            )}

            {selectedBand === "MICROWAVE_89GHZ" && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-orange-800 to-slate-950 opacity-90 flex items-center justify-center">
                <div className="w-44 h-44 rounded-full border-4 border-amber-400/90 animate-spin-slow flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-950 border border-amber-300 shadow-2xl flex items-center justify-center">
                    <span className="text-[9px] font-mono text-amber-300 font-bold">CORE SCAT</span>
                  </div>
                </div>
              </div>
            )}

            {selectedBand === "VIS_GEO" && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-500 to-slate-950 opacity-90 flex items-center justify-center">
                <div className="w-52 h-52 rounded-full border-4 border-white/60 animate-spin-slow flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-slate-950 border border-white shadow-2xl flex items-center justify-center">
                    <span className="text-[9px] font-mono text-white font-bold">EYE SUNLIT</span>
                  </div>
                </div>
              </div>
            )}

            {/* Overlaid Crosshair and Telemetry Pins */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-700 text-[10px] font-mono space-y-1">
              <div>EYE LAT/LON: {cyclone.lat}°N, {cyclone.lon}°E</div>
              <div>EYE TEMP: <strong className="text-red-400">+18.5°C (Warm Core)</strong></div>
              <div>CLOUD TOP TEMP: <strong className="text-purple-300">-81.4°C (Violent Updrafts)</strong></div>
              <div>EYE DIAMETER: <strong>26.4 km (Pin-hole Core)</strong></div>
            </div>

            <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 text-[10px] font-mono text-cyan-300">
              DVORAK CURRENT INTENSITY (CI): {cyclone.dvorakTNumber}
            </div>
          </div>

          {/* Color Scale Legend */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Thermal Infrared (°C):</span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-white text-slate-950 font-bold">-80°C</span>
              <span className="px-1.5 py-0.5 rounded bg-fuchsia-600 text-white">-65°C</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white">-45°C</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white">-20°C</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">+20°C</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Metrics & Dvorak Breakdown (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              ADVANCED METEOROLOGICAL SOUNDINGS
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">VERTICAL WIND SHEAR (VWS)</span>
                <span className="text-emerald-400 font-bold text-sm">8 - 11 knots</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">Extremely favorable for intensification</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">OCEAN HEAT CONTENT (OHC)</span>
                <span className="text-rose-400 font-bold text-sm">115 kJ/cm²</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">Deep warm water layer provides unlimited thermal fuel</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">CORIOLIS PARAMETER (f)</span>
                <span className="text-cyan-300 font-bold text-sm">4.82 × 10⁻⁵ s⁻¹</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">Optimal vorticity spin generation</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">MID-LEVEL TROPOSPHERIC MOISTURE</span>
                <span className="text-blue-300 font-bold text-sm">84% Relative Humidity</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">Dry air entrainment absent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
