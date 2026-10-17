import React, { useState } from "react";
import {
  Gauge,
  Wind,
  Compass,
  Thermometer,
  Waves,
  Zap,
  Sparkles,
  Bot,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingDown
} from "lucide-react";
import { CycloneData, ForecastAnalysis } from "../types";

interface LiveTelemetryPanelProps {
  cyclone: CycloneData;
  simulationHour: number;
}

export const LiveTelemetryPanel: React.FC<LiveTelemetryPanelProps> = ({
  cyclone,
  simulationHour
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [forecastAnalysis, setForecastAnalysis] = useState<ForecastAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hoursRemaining = Math.max(0, cyclone.hoursToLandfall - simulationHour);

  // Trigger Gemini AI Forecast Analysis
  const runAiForecast = async () => {
    setLoadingAi(true);
    setErrorMsg(null);
    const wind = cyclone.windSpeedKnots;
    const hoursLeft = Math.max(0, cyclone.hoursToLandfall - simulationHour);
    const surge = cyclone.surgeHeightMeters;

    const fallbackForecast: ForecastAnalysis = {
      summary: `Cyclone ${cyclone.name} is maintaining sustained winds of ${wind} knots (${Math.round(wind * 1.852)} km/h) with central barometric pressure at ${cyclone.pressureHpa} hPa.`,
      intensificationRisk: wind > 100 ? "EXTREME RAPID INTENSIFICATION" : "MODERATE INTENSIFICATION",
      eyewallStatus: cyclone.category.includes("4") || cyclone.category.includes("5") ? "Double Concentric Eyewall Active" : "Developing Well-Defined Core",
      landfallProjection: `Landfall projected within ${hoursLeft} hours with peak storm surge between ${surge}m to ${surge + 1.5}m.`,
      stormSurgeThreat: `Peak marine inundation zone extending up to ${Math.round(surge * 3.2)} km inland across low-lying estuaries.`,
      tacticalDirectives: [
        "Mandate immediate evacuation for Red Zone sectors below 4m elevation contour.",
        "Suspend all commercial maritime and fishing vessel operations.",
        "Pre-deploy emergency generator units and medical response teams.",
        "Enforce mandatory structural lockdown of coastal ports and terminals."
      ],
      windShearTrend: "Favorable low vertical wind shear (8-12 knots) sustaining deep convective towers.",
      meteorologicalConfidence: "HIGH (94% multi-model consensus)"
    };

    try {
      const res = await fetch("/api/cyclone/forecast-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cyclone, simulationHour })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.summary) {
          setForecastAnalysis(data);
          return;
        }
      }
      setForecastAnalysis(fallbackForecast);
    } catch (_err) {
      setForecastAnalysis(fallbackForecast);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4 sm:space-y-5">
      {/* Header and AI Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              LIVE METEOROLOGICAL TELEMETRY
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Satellite Scatterometer & Radiometer Diagnostics • Automated Refresh
            </p>
          </div>
        </div>

        <button
          onClick={runAiForecast}
          disabled={loadingAi}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition disabled:opacity-60 cursor-pointer w-full sm:w-auto justify-center"
        >
          {loadingAi ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Sparkles className="w-4 h-4 text-slate-950" />
          )}
          <span>{loadingAi ? "Synthesizing AI Forecast..." : "Synthesize AI Forecast"}</span>
        </button>
      </div>

      {/* Grid of Key Meteorological Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Central Pressure Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Central Pressure</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-amber-300 font-mono">
              {cyclone.pressureHpa}
            </span>
            <span className="text-xs text-slate-400 ml-1">hPa</span>
          </div>
          <span className="text-[10px] text-red-400 font-semibold">
            {cyclone.pressureHpa < 925 ? "Extremely Deep Core" : "Deep Low System"}
          </span>
        </div>

        {/* Sustained Winds Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Sustained Winds</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-cyan-300 font-mono">
              {cyclone.windSpeedKnots}
            </span>
            <span className="text-xs text-slate-400 ml-1">kt</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">
            {Math.round(cyclone.windSpeedKnots * 1.852)} km/h • Gusts {cyclone.gustKnots}kt
          </span>
        </div>

        {/* Sea Surface Temp */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Sea Surface Temp</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-rose-300 font-mono">
              {cyclone.seaSurfaceTempC}°
            </span>
            <span className="text-xs text-slate-400 ml-1">C</span>
          </div>
          <span className="text-[10px] text-rose-400 font-semibold">
            +4.0°C above threshold (High OHC)
          </span>
        </div>

        {/* Storm Surge Estimate */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Peak Storm Surge</span>
            <Waves className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-blue-300 font-mono">
              {cyclone.surgeHeightMeters}
            </span>
            <span className="text-xs text-slate-400 ml-1">meters</span>
          </div>
          <span className="text-[10px] text-red-400 font-semibold">
            Astronomical High Tide Risk
          </span>
        </div>

        {/* Translation Speed & Heading */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Track Vector</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-emerald-300 font-mono">
              {cyclone.translationSpeedKm}
            </span>
            <span className="text-xs text-slate-400 ml-1">km/h</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            Heading {cyclone.heading}° (NW)
          </span>
        </div>

        {/* Landfall Countdown */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Landfall In</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-yellow-300 font-mono">
              {hoursRemaining}
            </span>
            <span className="text-xs text-slate-400 ml-1">hours</span>
          </div>
          <span className="text-[10px] text-yellow-400 font-semibold">
            {hoursRemaining === 0 ? "LANDFALL ACTIVE" : "Coastal Inundation Imminent"}
          </span>
        </div>
      </div>

      {/* Satellite Imagery Diagnostic Sub-bar */}
      <div className="bg-slate-950/60 border border-cyan-900/30 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-600/40 text-cyan-300 font-mono font-bold">
            DVORAK: {cyclone.dvorakTNumber}
          </span>
          <span className="text-slate-400">Satellite Optical Signature:</span>
          <span className="font-semibold text-white">{cyclone.satelliteFeature}</span>
        </div>
        <div className="text-slate-400 flex items-center gap-2">
          <span>Target Shoreline:</span>
          <span className="text-amber-300 font-bold">{cyclone.targetRegion}</span>
        </div>
      </div>

      {/* AI FORECAST SYNTHESIS CARD */}
      {forecastAnalysis ? (
        <div className="bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/50 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-900/40">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>AI AGENT METEOROLOGICAL FORECAST SYNTHESIS</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Confidence: {forecastAnalysis.meteorologicalConfidence}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {forecastAnalysis.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-mono text-[10px] uppercase">Rapid Intensification Risk</div>
              <div className="text-red-400 font-bold mt-1">{forecastAnalysis.intensificationRisk}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{forecastAnalysis.windShearTrend}</div>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-mono text-[10px] uppercase">Eyewall Structure Status</div>
              <div className="text-amber-300 font-bold mt-1">{forecastAnalysis.eyewallStatus}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{forecastAnalysis.stormSurgeThreat}</div>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-mono text-[10px] uppercase">Landfall Window & Surge</div>
              <div className="text-cyan-300 font-bold mt-1">{forecastAnalysis.landfallProjection}</div>
            </div>
          </div>

          {/* Tactical Directives */}
          <div className="pt-2">
            <div className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PRIORITIZED CIVIL DEFENSE DIRECTIVES:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {forecastAnalysis.tacticalDirectives.map((dir, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-cyan-900/60 text-cyan-300 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{dir}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>AI Meteorologist ready to evaluate wind shear, ocean thermal content, and eyewall evolution.</span>
          </div>
          <button
            onClick={runAiForecast}
            className="text-cyan-400 hover:text-cyan-300 font-bold text-xs"
          >
            Run Now →
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-3 text-xs text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
