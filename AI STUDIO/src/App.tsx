import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { InteractiveStormMap } from "./components/InteractiveStormMap";
import { LiveTelemetryPanel } from "./components/LiveTelemetryPanel";
import { CasualtyImpactDashboard } from "./components/CasualtyImpactDashboard";
import { EvacuationCorridorPlanner } from "./components/EvacuationCorridorPlanner";
import { EmergencyAlertSystem } from "./components/EmergencyAlertSystem";
import { SearchEngineTab } from "./components/SearchEngineTab";
import { SatelliteLabTab } from "./components/SatelliteLabTab";
import { CycloneStructureVisualizer } from "./components/CycloneStructureVisualizer";
import { GoogleMapsCycloneTracker } from "./components/GoogleMapsCycloneTracker";
import { CustomCycloneModal } from "./components/CustomCycloneModal";
import { CYCLONES_DATABASE } from "./data/cycloneData";
import { CycloneData, Shelter, CoastalSector, EvacuationCorridor } from "./types";
import { Shield, Radio, Satellite, AlertTriangle, Compass, Heart } from "lucide-react";

export default function App() {
  const [cyclones, setCyclones] = useState<CycloneData[]>(CYCLONES_DATABASE);
  const [selectedCyclone, setSelectedCyclone] = useState<CycloneData>(CYCLONES_DATABASE[0]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "evacuation" | "alerts" | "search" | "satellite" | "gmaps">("dashboard");
  const [dashboardMapMode, setDashboardMapMode] = useState<"gmaps" | "radar">("radar");
  const [simulationHour, setSimulationHour] = useState<number>(0);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  const handleCreateCustomCyclone = (newCyclone: CycloneData) => {
    setCyclones([newCyclone, ...cyclones]);
    setSelectedCyclone(newCyclone);
    setSimulationHour(0);
    setActiveTab("dashboard");
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Primary Top Bar & Mission Navigation */}
      <Navbar
        cyclones={cyclones}
        selectedCyclone={selectedCyclone}
        onSelectCyclone={(c) => {
          setSelectedCyclone(c);
          setSimulationHour(0);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        simulationHour={simulationHour}
        setSimulationHour={setSimulationHour}
        onOpenCustomStormModal={() => setIsCustomModalOpen(true)}
      />

      {/* Main Content Area - Fluid responsive width for Android & Widescreen Desktop */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-2.5 sm:px-5 lg:px-8 py-3.5 sm:py-6">
        {/* TAB 1: MISSION CONTROL DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
            {/* Top Quick Threat Banner */}
            <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border border-red-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xl">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">
                      ACTIVE SYSTEM: {selectedCyclone.name} ({selectedCyclone.category})
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      MANDATORY EVACUATION IN EFFECT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Heading toward {selectedCyclone.targetRegion}. Peak surge expected at{" "}
                    <strong className="text-red-400">{selectedCyclone.surgeHeightMeters}m</strong>. Est. Landfall in{" "}
                    <strong className="text-cyan-300">
                      {Math.max(0, selectedCyclone.hoursToLandfall - simulationHour)}h
                    </strong>
                    .
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("gmaps")}
                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <span>🌀</span>
                  <span>Open Google Maps</span>
                </button>
                <button
                  onClick={() => setActiveTab("evacuation")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
                >
                  View Evacuation Corridors →
                </button>
                <button
                  onClick={() => setActiveTab("alerts")}
                  className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-bold transition shadow-sm"
                >
                  Broadcast Alerts →
                </button>
              </div>
            </div>

            {/* Geospatial Map Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
                  <span className="text-xl animate-cyclone-spin inline-block">🌀</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-cyan-300">
                      LIVE GEOSPATIAL MAP INTERFACE
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      TRACKING 🌀 EYE POSITION
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Inspect storm location on real Google Maps Satellite with animated 🌀 marker or Doppler Radar canvas
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* 1st Default Option: Doppler Radar Canvas */}
                <button
                  onClick={() => setDashboardMapMode("radar")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    dashboardMapMode === "radar"
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20"
                      : "bg-slate-950 text-slate-400 hover:text-white border-slate-800"
                  }`}
                >
                  <span>📡 Doppler Radar Canvas</span>
                </button>

                {/* 2nd Option: Google Maps Interface (Redirects to Google Maps tab at taskbar) */}
                <button
                  onClick={() => setActiveTab("gmaps")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border-red-400 shadow-md shadow-red-500/20"
                  title="Redirect to Google Maps in taskbar"
                >
                  <span className="text-sm animate-cyclone-spin inline-block">🌀</span>
                  <span>Google Maps Interface →</span>
                </button>
              </div>
            </div>

            {/* Render Selected Map Interface */}
            {dashboardMapMode === "gmaps" ? (
              <GoogleMapsCycloneTracker
                cyclone={selectedCyclone}
                onSelectShelter={() => setActiveTab("evacuation")}
              />
            ) : (
              <InteractiveStormMap
                cyclone={selectedCyclone}
                simulationHour={simulationHour}
                onSelectShelter={() => setActiveTab("evacuation")}
                onSelectSector={() => setActiveTab("evacuation")}
                onSelectCorridor={() => setActiveTab("evacuation")}
              />
            )}

            {/* Real-Time Live Telemetry Panel & AI Forecast Synthesis */}
            <LiveTelemetryPanel
              cyclone={selectedCyclone}
              simulationHour={simulationHour}
            />

            {/* High-Fidelity Cyclone Structure & Vortex Anatomy Generator */}
            <CycloneStructureVisualizer cyclone={selectedCyclone} />

            {/* Casualty & Infrastructure Impact Projections */}
            <CasualtyImpactDashboard cyclone={selectedCyclone} />
          </div>
        )}

        {/* TAB 2: AUTOMATED EVACUATION ROUTE CORRIDORS */}
        {activeTab === "evacuation" && (
          <div className="animate-in fade-in duration-300">
            <EvacuationCorridorPlanner
              cyclone={selectedCyclone}
              onSelectShelter={() => {}}
            />
          </div>
        )}

        {/* TAB 3: EMERGENCY NOTIFICATION & RESIDENT SOS DISPATCH */}
        {activeTab === "alerts" && (
          <div className="animate-in fade-in duration-300">
            <EmergencyAlertSystem cyclone={selectedCyclone} />
          </div>
        )}

        {/* TAB 4: SATELLITE & RADAR METEOROLOGICAL LAB */}
        {activeTab === "satellite" && (
          <div className="animate-in fade-in duration-300">
            <SatelliteLabTab cyclone={selectedCyclone} />
          </div>
        )}

        {/* TAB 5: DEDICATED AI DISASTER & METEOROLOGY SEARCH TAB */}
        {activeTab === "search" && (
          <div className="animate-in fade-in duration-300">
            <SearchEngineTab activeCyclone={selectedCyclone} />
          </div>
        )}

        {/* TAB 6: GOOGLE MAPS LIVE CYCLONE TRACKER */}
        {activeTab === "gmaps" && (
          <div className="animate-in fade-in duration-300">
            <GoogleMapsCycloneTracker
              cyclone={selectedCyclone}
              onSelectShelter={() => setActiveTab("evacuation")}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-12 py-6 text-xs text-slate-500 font-mono">
        <div className="w-full max-w-[1720px] mx-auto px-2.5 sm:px-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-semibold">CycloShield AI Autonomous Disaster Operations Center</span>
            <span className="hidden sm:inline">•</span>
            <span>Version 2026.4 Production Build</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-slate-400">
            <span>INSAT-3DR / NOAA-20 Radiometer Telemetry</span>
            <span className="hidden sm:inline">•</span>
            <span>WMO Tropical Cyclone Operational Plan Compliant</span>
            <span className="text-emerald-400 font-bold">● AI Engines Online</span>
          </div>
        </div>
      </footer>

      {/* Custom Storm Simulation Modal */}
      <CustomCycloneModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onCreateCyclone={handleCreateCustomCyclone}
      />
    </div>
  );
}
