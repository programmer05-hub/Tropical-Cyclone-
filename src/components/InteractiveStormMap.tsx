import React, { useState, useEffect } from "react";
import {
  Layers,
  Eye,
  Maximize2,
  Navigation,
  Shield,
  Hospital,
  AlertCircle,
  Wind,
  Waves,
  MapPin,
  Info
} from "lucide-react";
import { CycloneData, Shelter, CoastalSector, EvacuationCorridor } from "../types";

interface InteractiveStormMapProps {
  cyclone: CycloneData;
  simulationHour: number;
  onSelectShelter?: (shelter: Shelter) => void;
  onSelectSector?: (sector: CoastalSector) => void;
  onSelectCorridor?: (corridor: EvacuationCorridor) => void;
}

export const InteractiveStormMap: React.FC<InteractiveStormMapProps> = ({
  cyclone,
  simulationHour,
  onSelectShelter,
  onSelectSector,
  onSelectCorridor
}) => {
  // Layer toggles
  const [showRadarReflectivity, setShowRadarReflectivity] = useState(true);
  const [showSatelliteIR, setShowSatelliteIR] = useState(true);
  const [showForecastCone, setShowForecastCone] = useState(true);
  const [showWindRadii, setShowWindRadii] = useState(true);
  const [showSurgeInundation, setShowSurgeInundation] = useState(true);
  const [showEvacuationCorridors, setShowEvacuationCorridors] = useState(true);
  const [showShelters, setShowShelters] = useState(true);

  // Selected item modal/card
  const [activeItem, setActiveItem] = useState<{
    type: "storm" | "shelter" | "sector" | "corridor";
    data: any;
  } | null>(null);

  // Compute animated current storm position based on simulationHour
  // cone points: hour 0 is base, hour 16 is landfall
  const currentStep = cyclone.forecastCone.reduce((prev, curr) => {
    return Math.abs(curr.hour - simulationHour) < Math.abs(prev.hour - simulationHour) ? curr : prev;
  }, cyclone.forecastCone[0]);

  const stormX = currentStep.x;
  const stormY = currentStep.y;

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[620px] xl:h-[680px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Map Toolbar */}
      <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
        {/* Layer Controls Bar - Horizontally scrollable without pushing container */}
        <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-1.5 pointer-events-auto text-[10px] sm:text-[11px] text-slate-300 overflow-x-auto max-w-full no-scrollbar whitespace-nowrap">
          <span className="font-mono text-cyan-400 font-bold flex items-center gap-1 mr-1 shrink-0">
            <Layers className="w-3.5 h-3.5" />
            LAYERS:
          </span>

          <button
            onClick={() => setShowRadarReflectivity(!showRadarReflectivity)}
            className={`px-2 py-1 rounded transition shrink-0 cursor-pointer ${
              showRadarReflectivity ? "bg-red-500/20 text-red-300 border border-red-500/40 font-semibold" : "opacity-50 hover:opacity-100"
            }`}
          >
            Radar dBZ
          </button>

          <button
            onClick={() => setShowSatelliteIR(!showSatelliteIR)}
            className={`px-2 py-1 rounded transition shrink-0 cursor-pointer ${
              showSatelliteIR ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold" : "opacity-50 hover:opacity-100"
            }`}
          >
            Satellite IR
          </button>

          <button
            onClick={() => setShowForecastCone(!showForecastCone)}
            className={`px-2 py-1 rounded transition shrink-0 cursor-pointer ${
              showForecastCone ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold" : "opacity-50 hover:opacity-100"
            }`}
          >
            Cone 72h
          </button>

          <button
            onClick={() => setShowWindRadii(!showWindRadii)}
            className={`px-2 py-1 rounded transition shrink-0 cursor-pointer ${
              showWindRadii ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold" : "opacity-50 hover:opacity-100"
            }`}
          >
            Wind Radii
          </button>

          <button
            onClick={() => setShowSurgeInundation(!showSurgeInundation)}
            className={`px-2 py-1 rounded transition shrink-0 cursor-pointer ${
              showSurgeInundation ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold" : "opacity-50 hover:opacity-100"
            }`}
          >
            Surge {cyclone.surgeHeightMeters}m
          </button>

          <button
            onClick={() => setShowEvacuationCorridors(!showEvacuationCorridors)}
            className={`px-2 py-1 rounded transition shrink-0 cursor-pointer ${
              showEvacuationCorridors ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold" : "opacity-50 hover:opacity-100"
            }`}
          >
            Evac Routes
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2 py-1 rounded transition shrink-0 cursor-pointer ${
              showShelters ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold" : "opacity-50 hover:opacity-100"
            }`}
          >
            Shelters ({cyclone.shelters.length})
          </button>
        </div>

        {/* Live Storm Header Badge */}
        <div className="bg-slate-900/90 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-red-500/40 shadow-lg flex items-center gap-1.5 sm:gap-2 pointer-events-auto text-[11px] sm:text-xs font-mono self-start sm:self-auto shrink-0">
          <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-white font-bold">{cyclone.name}</span>
          <span className="text-red-400 font-semibold">[{currentStep.intensityCategory}]</span>
          <span className="text-slate-400 hidden sm:inline">
            Vmax: <strong className="text-cyan-300">{currentStep.windKnots} kt</strong>
          </span>
          <span className="text-slate-400 hidden md:inline">
            T+{simulationHour}h Projection
          </span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative flex-1 w-full h-full overflow-hidden select-none bg-[#07111e]">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Ocean Gradient */}
            <linearGradient id="oceanGrad" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#031024" />
              <stop offset="60%" stopColor="#081e3d" />
              <stop offset="100%" stopColor="#0c274d" />
            </linearGradient>

            {/* Land Gradient */}
            <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d2319" />
              <stop offset="70%" stopColor="#122b1e" />
              <stop offset="100%" stopColor="#1a3b2b" />
            </linearGradient>

            {/* Storm Surge Inundation Gradient */}
            <linearGradient id="surgeGrad" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.65)" />
              <stop offset="50%" stopColor="rgba(249, 115, 22, 0.45)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.15)" />
            </linearGradient>

            {/* Forecast Cone Gradient */}
            <linearGradient id="coneGrad" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.35)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.2)" />
              <stop offset="100%" stopColor="rgba(147, 51, 234, 0.1)" />
            </linearGradient>

            {/* Radial Radar Spiral Glow */}
            <radialGradient id="radarSpiral">
              <stop offset="0%" stopColor="rgba(255, 0, 80, 0.9)" />
              <stop offset="25%" stopColor="rgba(255, 140, 0, 0.7)" />
              <stop offset="55%" stopColor="rgba(250, 204, 21, 0.5)" />
              <stop offset="80%" stopColor="rgba(34, 197, 94, 0.3)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
            </radialGradient>

            {/* Satellite IR Cold Cloud Top Gradient */}
            <radialGradient id="satelliteIRGlow">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
              <stop offset="30%" stopColor="rgba(192, 38, 211, 0.65)" />
              <stop offset="65%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
            </radialGradient>

            {/* Grid Pattern */}
            <pattern id="coordGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(56, 189, 248, 0.07)" strokeWidth="0.2" />
            </pattern>
          </defs>

          {/* Deep Ocean Background */}
          <rect width="100" height="100" fill="url(#oceanGrad)" />
          <rect width="100" height="100" fill="url(#coordGrid)" />

          {/* Continental Coastline / Landmass Polygon (Inland Northwest) */}
          <polygon
            points="0,0 48,0 46,14 42,22 44,28 40,34 46,38 48,44 44,52 46,58 40,68 38,78 30,86 24,100 0,100"
            fill="url(#landGrad)"
            stroke="#2dd4bf"
            strokeWidth="0.35"
            strokeOpacity="0.4"
          />

          {/* Coastal Estuary / Mangrove Inlets */}
          <path
            d="M 44,28 Q 41,30 38,32 T 40,34"
            fill="none"
            stroke="#081e3d"
            strokeWidth="0.8"
          />
          <path
            d="M 46,38 Q 42,41 38,40 T 44,46"
            fill="none"
            stroke="#081e3d"
            strokeWidth="1"
          />
          <path
            d="M 44,52 Q 38,55 35,53"
            fill="none"
            stroke="#081e3d"
            strokeWidth="0.9"
          />

          {/* Coastal Surge Inundation Zones (Overlaid along shoreline) */}
          {showSurgeInundation && (
            <g>
              <polygon
                points="42,22 47,24 45,30 42,34 48,39 50,45 46,54 42,50 45,43 39,37 41,31"
                fill="url(#surgeGrad)"
                stroke="#ef4444"
                strokeWidth="0.3"
                strokeDasharray="1,0.5"
                className="animate-pulse"
              />
              <text x="46" y="27" fill="#fca5a5" fontSize="1.4" fontFamily="monospace" fontWeight="bold">
                HIGH SURGE RISK ZONE ({cyclone.surgeHeightMeters}m INUNDATION)
              </text>
            </g>
          )}

          {/* Coastal Sectors (Clickable Polygons) */}
          {cyclone.coastalSectors.map((sector) => {
            const pointsStr = sector.coords.map((c) => `${c.x},${c.y}`).join(" ");
            const isRed = sector.riskLevel === "CRITICAL_RED";
            return (
              <g
                key={sector.id}
                onClick={() => {
                  setActiveItem({ type: "sector", data: sector });
                  onSelectSector?.(sector);
                }}
                className="cursor-pointer group"
              >
                <polygon
                  points={pointsStr}
                  fill={isRed ? "rgba(239, 68, 68, 0.28)" : "rgba(249, 115, 22, 0.22)"}
                  stroke={isRed ? "#ef4444" : "#f97316"}
                  strokeWidth="0.4"
                  className="transition duration-200 group-hover:fill-opacity-50"
                />
                <circle
                  cx={sector.coords[0].x - 1}
                  cy={sector.coords[0].y}
                  r="0.8"
                  fill={isRed ? "#ef4444" : "#f97316"}
                />
                <text
                  x={sector.coords[0].x - 1}
                  y={sector.coords[0].y - 1}
                  fill="#ffffff"
                  fontSize="1.1"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {sector.name.split("-")[1] || sector.name}
                </text>
              </g>
            );
          })}

          {/* Historical Storm Track (T-48h to T-0h) */}
          <path
            d="M 85,92 Q 74,80 66,72 T 58,64"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.6"
            strokeDasharray="1,1"
          />
          {cyclone.historicalPoints.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.lon ? (pt.lon - 80) * 8 + 10 : 85 - idx * 7}
                cy={pt.lat ? 100 - (pt.lat - 14) * 8 - 15 : 92 - idx * 7}
                r="1"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="0.3"
              />
            </g>
          ))}

          {/* 72-Hour Forecast Cone of Uncertainty */}
          {showForecastCone && (
            <g>
              {/* Cone polygon widening as it advances inland */}
              <polygon
                points="58,64 54,52 48,40 40,26 22,10 32,8 52,24 60,38 66,50 62,64"
                fill="url(#coneGrad)"
                stroke="#06b6d4"
                strokeWidth="0.35"
                strokeDasharray="1,0.5"
              />

              {/* Multi-Model Spaghetti Track Ensemble */}
              {/* Consensus GFS Track */}
              <path
                d="M 58,64 Q 52,54 44,42 T 33,24"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="0.7"
              />
              {/* ECMWF Ensemble Track */}
              <path
                d="M 58,64 Q 54,52 47,38 T 38,20"
                fill="none"
                stroke="#a855f7"
                strokeWidth="0.4"
                strokeDasharray="1,0.5"
                opacity="0.8"
              />
              {/* UKMET Ensemble Track */}
              <path
                d="M 58,64 Q 50,56 41,45 T 28,30"
                fill="none"
                stroke="#22c55e"
                strokeWidth="0.4"
                strokeDasharray="1,0.5"
                opacity="0.8"
              />

              {/* Forecast Time Markers */}
              {cyclone.forecastCone.map((fc, i) => (
                <g key={i}>
                  <circle
                    cx={fc.x}
                    cy={fc.y}
                    r="1.2"
                    fill={fc.hour === 16 ? "#f59e0b" : "#06b6d4"}
                    stroke="#ffffff"
                    strokeWidth="0.4"
                  />
                  <text
                    x={fc.x + 2}
                    y={fc.y + 0.5}
                    fill="#e2e8f0"
                    fontSize="1.1"
                    fontFamily="monospace"
                  >
                    T+{fc.hour}h ({fc.windKnots}kt)
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Evacuation Corridors (Animated Flow Vectors from Coast to Inland) */}
          {showEvacuationCorridors && (
            <g>
              {cyclone.corridors.map((corridor) => {
                const pathData = `M ${corridor.waypoints.map((w) => `${w.x},${w.y}`).join(" L ")}`;
                return (
                  <g
                    key={corridor.id}
                    onClick={() => {
                      setActiveItem({ type: "corridor", data: corridor });
                      onSelectCorridor?.(corridor);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Shadow track */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    {/* Active Route Flow line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={corridor.status === "CLEAR_ACTIVE" ? "#10b981" : "#f59e0b"}
                      strokeWidth="1.2"
                      strokeDasharray="2,1.2"
                      strokeLinecap="round"
                      className="animate-dash"
                    />
                    {/* Waypoint circles */}
                    {corridor.waypoints.map((wp, wIdx) => (
                      <circle
                        key={wIdx}
                        cx={wp.x}
                        cy={wp.y}
                        r="0.7"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="0.2"
                      />
                    ))}
                  </g>
                );
              })}
            </g>
          )}

          {/* Safe Inland Shelters */}
          {showShelters && (
            <g>
              {cyclone.shelters.map((shelter) => {
                const fillPercent = (shelter.occupied / shelter.capacity) * 100;
                const isNearFull = fillPercent > 85;
                return (
                  <g
                    key={shelter.id}
                    onClick={() => {
                      setActiveItem({ type: "shelter", data: shelter });
                      onSelectShelter?.(shelter);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Shelter Aura */}
                    <circle
                      cx={shelter.x}
                      cy={shelter.y}
                      r="2.8"
                      fill={isNearFull ? "rgba(245, 158, 11, 0.2)" : "rgba(20, 184, 166, 0.25)"}
                      className="animate-pulse"
                    />
                    {/* Shelter Solid Core */}
                    <circle
                      cx={shelter.x}
                      cy={shelter.y}
                      r="1.6"
                      fill={isNearFull ? "#f59e0b" : "#14b8a6"}
                      stroke="#ffffff"
                      strokeWidth="0.4"
                    />
                    {/* Shelter Icon / Symbol */}
                    <text
                      x={shelter.x}
                      y={shelter.y + 0.4}
                      fill="#0f172a"
                      fontSize="1.1"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      S
                    </text>
                    <text
                      x={shelter.x}
                      y={shelter.y - 2.2}
                      fill="#5eead4"
                      fontSize="1.1"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {shelter.name.split(" ")[0]} ({Math.round(fillPercent)}%)
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* SATELLITE IR CONVECTIVE VORTEX LAYER */}
          {showSatelliteIR && (
            <circle
              cx={stormX}
              cy={stormY}
              r="18"
              fill="url(#satelliteIRGlow)"
              className="opacity-75"
            />
          )}

          {/* RADAR REFLECTIVITY DBZ VORTEX & SPIRAL RAINBANDS */}
          {showRadarReflectivity && (
            <g transform={`translate(${stormX}, ${stormY})`}>
              <circle r="14" fill="url(#radarSpiral)" className="opacity-80" />
              {/* Outer Spiral Band 1 */}
              <path
                d="M 0,0 C 5,-8 14,-10 18,-4 C 20,2 18,10 12,14"
                fill="none"
                stroke="rgba(239, 68, 68, 0.7)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Outer Spiral Band 2 */}
              <path
                d="M 0,0 C -6,6 -12,12 -16,8 C -20,2 -18,-8 -10,-14"
                fill="none"
                stroke="rgba(249, 115, 22, 0.65)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* WIND RADII QUADRANT RINGS (ANIMATED) */}
          {showWindRadii && (
            <g transform={`translate(${stormX}, ${stormY})`}>
              {/* 34-knot Gale Force Radius (Large Yellow Ring - Animated Dash) */}
              <circle
                r="16"
                fill="none"
                stroke="#eab308"
                strokeWidth="0.45"
                strokeDasharray="2,1.2"
                className="animate-dash"
              />
              <text x="16.5" y="0.5" fill="#fef08a" fontSize="0.9" fontFamily="monospace">
                34kt Gale
              </text>

              {/* 50-knot Storm Force Radius (Orange Ring - Animated Pulse) */}
              <circle
                r="10"
                fill="none"
                stroke="#f97316"
                strokeWidth="0.55"
                strokeDasharray="1.8,1.2"
                className="animate-radar-ring"
              />
              <text x="10.5" y="0.5" fill="#fed7aa" fontSize="0.9" fontFamily="monospace">
                50kt Storm
              </text>

              {/* 64-knot Hurricane Force Radius (Red Ring - Animated Pulse) */}
              <circle
                r="5.5"
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#ef4444"
                strokeWidth="0.75"
                strokeDasharray="1.5,1"
                className="animate-dash"
              />
              <text x="5.8" y="0.5" fill="#fca5a5" fontSize="0.9" fontFamily="monospace" fontWeight="bold">
                64kt Hurricane
              </text>
            </g>
          )}

          {/* ACTIVE CYCLONE EYE CENTER WITH ANIMATED 🌀 AND CONCENTRIC CIRCLES */}
          <g
            transform={`translate(${stormX}, ${stormY})`}
            onClick={() => setActiveItem({ type: "storm", data: cyclone })}
            className="cursor-pointer"
          >
            {/* 1. Outer Animated Pulsing Wave Circle */}
            <circle r="4.6" fill="none" stroke="#ef4444" strokeWidth="0.3" strokeDasharray="1.5,1" className="animate-radar-ring" />

            {/* 2. Rotating Concentric Dashed Wave */}
            <circle r="3.2" fill="none" stroke="#f97316" strokeWidth="0.35" strokeDasharray="1.2,0.8" className="animate-cyclone-spin-reverse opacity-85" />

            {/* 3. Pulsing Eye Warning Wave */}
            <circle r="3.5" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="0.4" className="animate-ping opacity-60" />

            {/* 4. Concentric Eyewall Core */}
            <circle r="2.2" fill="#030712" stroke="#ffffff" strokeWidth="0.5" />

            {/* 5. Smoothly Rotating 🌀 Symbol */}
            <g className="animate-cyclone-spin" style={{ transformOrigin: "0 0" }}>
              <text
                x="0"
                y="0.85"
                fontSize="2.4"
                textAnchor="middle"
                filter="drop-shadow(0px 0px 3px rgba(239,68,68,0.9))"
              >
                🌀
              </text>
            </g>

            {/* Track Heading Arrow */}
            <g transform={`rotate(${cyclone.heading})`}>
              <line x1="0" y1="0" x2="0" y2="-5" stroke="#ffffff" strokeWidth="0.6" markerEnd="url(#arrow)" />
              <polygon points="0,-6.5 -1,-4.5 1,-4.5" fill="#ffffff" />
            </g>

            {/* Storm Tag */}
            <text
              x="0"
              y="4.5"
              fill="#ffffff"
              fontSize="1.3"
              fontWeight="900"
              textAnchor="middle"
              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.9))"
            >
              EYE: {cyclone.name.toUpperCase()}
            </text>
          </g>
        </svg>

        {/* Selected Map Item Floating Detail Card */}
        {activeItem && (
          <div className="absolute bottom-12 sm:bottom-4 left-2 sm:left-4 z-40 max-w-[calc(100%-16px)] sm:max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-xl p-3 sm:p-4 shadow-2xl text-slate-200 text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>
                  {activeItem.type === "storm" && `Storm Center: ${activeItem.data.name}`}
                  {activeItem.type === "shelter" && `Shelter: ${activeItem.data.name}`}
                  {activeItem.type === "sector" && `Risk Sector: ${activeItem.data.name}`}
                  {activeItem.type === "corridor" && `Evacuation Corridor: ${activeItem.data.name}`}
                </span>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-2.5 space-y-1.5 font-mono text-[11px]">
              {activeItem.type === "storm" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Category:</span>
                    <span className="text-red-400 font-bold">{activeItem.data.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sustained Winds:</span>
                    <span className="text-cyan-300 font-bold">{activeItem.data.windSpeedKnots} knots ({Math.round(activeItem.data.windSpeedKnots * 1.852)} km/h)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Central Pressure:</span>
                    <span className="text-amber-300">{activeItem.data.pressureHpa} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surge Inundation:</span>
                    <span className="text-red-300">{activeItem.data.surgeHeightMeters}m peak marine tide</span>
                  </div>
                </>
              )}

              {activeItem.type === "shelter" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occupancy:</span>
                    <span className="text-teal-300 font-bold">
                      {activeItem.data.occupied.toLocaleString()} / {activeItem.data.capacity.toLocaleString()} (
                      {Math.round((activeItem.data.occupied / activeItem.data.capacity) * 100)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elevation:</span>
                    <span className="text-emerald-400">+{activeItem.data.elevationMeters}m MSL (Above Surge)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Medical Crew:</span>
                    <span className={activeItem.data.hasMedicalTeam ? "text-emerald-400" : "text-amber-400"}>
                      {activeItem.data.hasMedicalTeam ? "Dispatched On-Site" : "Pending Convoy"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Supply:</span>
                    <span className="text-cyan-300">{activeItem.data.waterSupplyDays} Days Stored</span>
                  </div>
                </>
              )}

              {activeItem.type === "sector" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Assessment:</span>
                    <span className="text-red-400 font-bold">{activeItem.data.riskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Population at Risk:</span>
                    <span className="text-amber-300 font-bold">{activeItem.data.population.toLocaleString()} citizens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Evacuated So Far:</span>
                    <span className="text-emerald-400">{activeItem.data.evacuatedPercent}% completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surge Inundation Depth:</span>
                    <span className="text-red-300">{activeItem.data.surgeDepthMeters} meters</span>
                  </div>
                </>
              )}

              {activeItem.type === "corridor" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flow Status:</span>
                    <span className="text-emerald-400 font-bold">{activeItem.data.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transit Duration:</span>
                    <span className="text-cyan-300">{activeItem.data.transitTimeMin} mins ({activeItem.data.distanceKm} km)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contraflow Lanes:</span>
                    <span className="text-amber-300">{activeItem.data.contraflowActive ? "ACTIVE (Double Outbound Flow)" : "Standard 2-Way"}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] pt-1">
                    Checkpoints: {activeItem.data.checkpoints.map((c: any) => c.name).join(" → ")}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Legend & Scale */}
        <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-3 z-30 bg-slate-900/90 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/70 text-[9px] sm:text-[10px] text-slate-400 flex flex-wrap items-center gap-2 sm:gap-4 font-mono pointer-events-none justify-center sm:justify-start">
          <div className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-500" />
            <span>Surge Red Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500" />
            <span>Active Evac Corridor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-teal-400" />
            <span>Safe Shelter Haven</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-1 bg-cyan-400" />
            <span>Spaghetti Consensus</span>
          </div>
        </div>
      </div>
    </div>
  );
};
