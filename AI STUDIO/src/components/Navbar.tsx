import React from "react";
import {
  Compass,
  AlertTriangle,
  Radio,
  Search,
  Satellite,
  Layers,
  ShieldAlert,
  Activity,
  Wind
} from "lucide-react";
import { CycloneData } from "../types";

interface NavbarProps {
  cyclones: CycloneData[];
  selectedCyclone: CycloneData;
  onSelectCyclone: (c: CycloneData) => void;
  activeTab: "dashboard" | "evacuation" | "alerts" | "search" | "satellite" | "gmaps";
  setActiveTab: (tab: "dashboard" | "evacuation" | "alerts" | "search" | "satellite" | "gmaps") => void;
  simulationHour?: number;
  setSimulationHour?: (h: number) => void;
  onOpenCustomStormModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cyclones,
  selectedCyclone,
  onSelectCyclone,
  activeTab,
  setActiveTab,
  simulationHour,
  setSimulationHour,
  onOpenCustomStormModal
}) => {
  return (
    <header className="bg-slate-950/95 border-b border-cyan-900/40 text-slate-100 backdrop-blur-md sticky top-0 z-50 shadow-2xl w-full max-w-full overflow-hidden">
      {/* Top Utility & Status Banner */}
      <div className="w-full max-w-[1720px] mx-auto px-2.5 sm:px-5 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs border-b border-slate-800/60">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-red-950/70 border border-red-500/40 text-red-300 font-mono tracking-wide text-[11px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold">CRITICAL DISASTER MONITORING</span>
          </div>
          <span className="text-slate-400 hidden lg:inline-flex items-center gap-1.5 font-mono text-[11px]">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            INSAT-3DR & NOAA-20 GEOSTATIONARY FEED: <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] sm:text-xs">
          <button
            onClick={onOpenCustomStormModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 transition hover:shadow-cyan-500/20 shadow-sm shrink-0"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Simulate Storm</span>
            <span className="xs:hidden sm:hidden">Simulate</span>
          </button>

          <a
            href="/insat3d"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border border-cyan-400/50 text-cyan-200 transition hover:shadow-cyan-500/20 shadow-sm text-[11px] sm:text-xs font-bold shrink-0"
            title="Open responsive single-file HTML INSAT-3D app in Chrome"
          >
            <span>🌀</span>
            <span className="hidden sm:inline">INSAT-3D HTML App</span>
            <span className="sm:hidden">INSAT App</span>
          </a>
        </div>
      </div>

      {/* Main Brand & Tab Bar */}
      <div className="w-full max-w-[1720px] mx-auto px-2.5 sm:px-5 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* App Title & Cyclone Dropdown */}
        <div className="flex flex-wrap items-center justify-between md:justify-start gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-300/30 shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
                  CYCLOSHIELD
                </span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  AI DISASTER OS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:block sm:block">
                Satellite Cyclone Forecasting • Automated Evacuation Corridors • Real-Time Alert Broadcast
              </p>
            </div>
          </div>

          {/* Cyclone Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg p-1 shrink-0 ml-auto md:ml-2">
            <span className="text-[11px] text-slate-400 font-mono px-1.5 hidden xl:inline">STORM:</span>
            <select
              value={selectedCyclone.id}
              onChange={(e) => {
                const found = cyclones.find((c) => c.id === e.target.value);
                if (found) onSelectCyclone(found);
              }}
              className="bg-slate-950 text-cyan-200 text-xs font-semibold px-2 sm:px-3 py-1.5 rounded border border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-400 max-w-[200px] sm:max-w-none"
            >
              {cyclones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category} - {c.windSpeedKnots}kt)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs - Horizontally scrollable on mobile without pushing page width */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto py-1 -my-1 scroll-smooth">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Mission Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("evacuation")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "evacuation"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Evacuation Corridors</span>
          </button>

          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "alerts"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Alerts & SOS Pings</span>
          </button>

          <button
            onClick={() => setActiveTab("satellite")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "satellite"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Satellite className="w-4 h-4" />
            <span>Satellite Lab</span>
          </button>

          <button
            onClick={() => setActiveTab("gmaps")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition border shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "gmaps"
                ? "bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-400 shadow-md shadow-red-500/20"
                : "text-red-300 bg-red-950/40 border-red-500/40 hover:bg-red-900/60"
            }`}
          >
            <span className="text-sm animate-cyclone-spin inline-block">🌀</span>
            <span>Google Maps</span>
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "search"
                ? "bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30"
                : "text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/80"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>AI Search Tab</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
