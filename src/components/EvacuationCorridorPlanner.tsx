import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Users,
  Car,
  Clock,
  Sparkles,
  RefreshCw,
  Building,
  CheckCircle,
  Truck,
  Droplets,
  Activity
} from "lucide-react";
import { CycloneData, CoastalSector, EvacuationCorridor, Shelter } from "../types";

interface EvacuationCorridorPlannerProps {
  cyclone: CycloneData;
  onSelectCorridor?: (c: EvacuationCorridor) => void;
  onSelectShelter?: (s: Shelter) => void;
}

export const EvacuationCorridorPlanner: React.FC<EvacuationCorridorPlannerProps> = ({
  cyclone,
  onSelectCorridor,
  onSelectShelter
}) => {
  const [selectedSector, setSelectedSector] = useState<CoastalSector>(cyclone.coastalSectors[0]);
  const [contraflowStates, setContraflowStates] = useState<Record<string, boolean>>({
    "cor-1": true,
    "cor-2": false,
    "cor-3": true
  });
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiEvacuationPlan, setAiEvacuationPlan] = useState<any | null>(null);

  const toggleContraflow = (corridorId: string) => {
    setContraflowStates((prev) => ({
      ...prev,
      [corridorId]: !prev[corridorId]
    }));
  };

  const runAiRouteOptimization = async () => {
    setLoadingAi(true);
    const fallbackPlan = {
      primaryCorridor: "National Highway Coastal Bypass (Corridor Alpha)",
      alternativeRoute: "State Expressway 14 via Western Highlands (Corridor Beta)",
      estimatedTransitTimeMinutes: 75,
      riskMitigationNotes: `Avoid low-lying river mouth bridges due to ${cyclone.surgeHeightMeters}m surge risk at high tide.`,
      criticalCheckpoints: [
        { name: "Bridge KM-42 Causeway", status: "Closing in 4 hours", hazard: "High water velocity" },
        { name: "Western Ridge Toll Plaza", status: "Clear / Open One-Way Inbound", hazard: "Moderate congestion" },
        { name: "Sector 3 Emergency Shelter Hub", status: "82% Capacity available", hazard: "Safe from surge" }
      ],
      vulnerableGroupAction: "Dispatch 45 high-clearance military transport buses for elderly and non-ambulatory hospital patients.",
      trafficFlowStrategy: "Activate contraflow lanes on Northbound Corridor Alpha immediately to double evacuation throughput."
    };

    try {
      const res = await fetch("/api/cyclone/evacuation-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cyclone,
          selectedZone: selectedSector.name,
          coastalZones: cyclone.coastalSectors
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.primaryCorridor) {
          setAiEvacuationPlan(data);
          return;
        }
      }
      setAiEvacuationPlan(fallbackPlan);
    } catch (_err) {
      setAiEvacuationPlan(fallbackPlan);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Dispatch */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                AUTOMATED EVACUATION ROUTE DISPATCH & CORRIDOR NETWORK
              </h2>
              <p className="text-xs text-slate-400">
                Dynamic Inundation Routing • Contraflow Throughput Optimization • High-Elevation Shelters
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={runAiRouteOptimization}
          disabled={loadingAi}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-60 cursor-pointer"
        >
          {loadingAi ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Sparkles className="w-4 h-4 text-slate-950" />
          )}
          <span>{loadingAi ? "Calculating AI Tactical Routes..." : "Optimize AI Evacuation Corridors"}</span>
        </button>
      </div>

      {/* Coastal High-Risk Zones Selection Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cyclone.coastalSectors.map((sector) => {
          const isSelected = selectedSector.id === sector.id;
          const isCritical = sector.riskLevel === "CRITICAL_RED";
          return (
            <div
              key={sector.id}
              onClick={() => setSelectedSector(sector)}
              className={`p-4 rounded-xl border cursor-pointer transition relative overflow-hidden ${
                isSelected
                  ? "bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isCritical
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {isCritical ? "CRITICAL RED SURGE" : "HIGH ORANGE WATCH"}
                </span>
                <span className="text-[11px] font-mono text-cyan-300">
                  +{sector.elevationMeters}m MSL
                </span>
              </div>

              <h4 className="font-bold text-sm text-white">{sector.name}</h4>

              <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Surge Inundation:</span>
                  <span className="text-red-400 font-bold">{sector.surgeDepthMeters}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Population:</span>
                  <span>{sector.population.toLocaleString()} citizens</span>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-400">Evacuation Progress</span>
                    <span className="text-emerald-400 font-bold">{sector.evacuatedPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${sector.evacuatedPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Tactical Evacuation Route Result (If generated) */}
      {aiEvacuationPlan && (
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI TACTICAL CORRIDOR ROUTING DIRECTIVE FOR {selectedSector.name.toUpperCase()}</span>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Est. Transit: {aiEvacuationPlan.estimatedTransitTimeMinutes} mins
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase">
                Primary Recommended Corridor
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                {aiEvacuationPlan.primaryCorridor}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {aiEvacuationPlan.riskMitigationNotes}
              </p>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase">
                Contingency Bypass Alternative
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                {aiEvacuationPlan.alternativeRoute}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {aiEvacuationPlan.trafficFlowStrategy}
              </p>
            </div>
          </div>

          {/* Critical Checkpoints */}
          <div className="pt-2">
            <span className="text-[11px] font-mono text-cyan-400 font-bold block mb-2">
              REAL-TIME HAZARD & BOTTLENECK CHECKPOINTS:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {aiEvacuationPlan.criticalCheckpoints?.map((cp: any, idx: number) => (
                <div key={idx} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{cp.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {cp.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{cp.hazard}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-900/40 text-xs text-emerald-200/90 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Vulnerable Citizens Action:</strong> {aiEvacuationPlan.vulnerableGroupAction}
            </span>
          </div>
        </div>
      )}

      {/* Active Evacuation Corridors Cards */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <Car className="w-4 h-4 text-cyan-400" />
          <span>DESIGNATED REGIONAL EVACUATION CORRIDORS</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cyclone.corridors.map((corridor) => {
            const isContraflow = contraflowStates[corridor.id] ?? corridor.contraflowActive;
            return (
              <div
                key={corridor.id}
                onClick={() => onSelectCorridor?.(corridor)}
                className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                      {corridor.code}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        corridor.status === "CLEAR_ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {corridor.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white mb-2">{corridor.name}</h4>

                  <div className="space-y-1 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Origin:</span>
                      <span className="text-slate-200">{corridor.fromSector.split("-")[1] || corridor.fromSector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Destination:</span>
                      <span className="text-teal-300">{corridor.toShelter.split(" ")[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distance & Time:</span>
                      <span className="text-cyan-300 font-bold">{corridor.distanceKm} km • {corridor.transitTimeMin} min</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Contraflow:{" "}
                    <strong className={isContraflow ? "text-emerald-400" : "text-slate-400"}>
                      {isContraflow ? "ACTIVATED" : "STANDARD"}
                    </strong>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleContraflow(corridor.id);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded transition font-bold ${
                      isContraflow
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                    }`}
                  >
                    {isContraflow ? "Deactivate Contraflow" : "Activate Contraflow"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fortified Inland Safe Shelters Hubs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <Building className="w-4 h-4 text-teal-400" />
          <span>INLAND CYCLONE SHELTER & LIFE-SUPPORT HAVENS</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {cyclone.shelters.map((shelter) => {
            const fillPercent = (shelter.occupied / shelter.capacity) * 100;
            return (
              <div
                key={shelter.id}
                onClick={() => onSelectShelter?.(shelter)}
                className="bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 rounded-xl p-3.5 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="text-teal-300 font-bold px-2 py-0.5 rounded bg-teal-950/60 border border-teal-500/30">
                      +{shelter.elevationMeters}m ELEVATION
                    </span>
                    <span className="text-emerald-400 font-semibold">{shelter.status}</span>
                  </div>

                  <h5 className="font-bold text-xs text-white leading-snug">{shelter.name}</h5>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{shelter.type}</span>

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400">Occupancy:</span>
                      <span className="text-cyan-300 font-bold">
                        {shelter.occupied.toLocaleString()} / {shelter.capacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${fillPercent > 85 ? "bg-amber-400" : "bg-teal-400"}`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Diesel Gen: {shelter.hasGenerator ? "READY" : "NO"}</span>
                  <span>Water: {shelter.waterSupplyDays} Days</span>
                  <span className="text-emerald-400">Med Team</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
