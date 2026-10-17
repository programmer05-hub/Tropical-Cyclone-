import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  Sparkles,
  RefreshCw,
  Wind,
  Gauge,
  Thermometer,
  Eye,
  Activity,
  ArrowUp,
  Maximize2,
  Sliders,
  CheckCircle2,
  Cpu,
  Info
} from "lucide-react";
import { CycloneData } from "../types";

interface CycloneStructureVisualizerProps {
  cyclone: CycloneData;
}

export const CycloneStructureVisualizer: React.FC<CycloneStructureVisualizerProps> = ({ cyclone }) => {
  // Configurable structural parameters
  const [windKnots, setWindKnots] = useState<number>(cyclone.windSpeedKnots);
  const [pressureHpa, setPressureHpa] = useState<number>(cyclone.pressureHpa);
  const [viewMode, setViewMode] = useState<"cross_section" | "satellite_vortex" | "vortex_3d">("cross_section");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [structureData, setStructureData] = useState<any | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync with cyclone when active cyclone changes
  useEffect(() => {
    setWindKnots(cyclone.windSpeedKnots);
    setPressureHpa(cyclone.pressureHpa);
    generateStructure(cyclone.windSpeedKnots, cyclone.pressureHpa);
  }, [cyclone.id]);

  // Generate structure parameters & AI diagnostic
  const generateStructure = async (currentWind = windKnots, currentPressure = pressureHpa) => {
    setIsGenerating(true);
    const eyeDiameterKm = Math.max(16, Math.round(75 - (currentWind * 0.35)));
    const rmwKm = Math.max(12, Math.round(eyeDiameterKm * 0.75));
    const stadiumTiltDeg = Math.min(82, Math.round(45 + (currentWind * 0.22)));
    const maxUpdraftMs = Math.round(10 + (currentWind * 0.14));
    const warmCoreAnomalyC = (4 + ((1013 - currentPressure) * 0.14)).toFixed(1);
    const cloudTopTempC = -Math.min(88, Math.round(55 + (currentWind * 0.2)));

    const localFallback = {
      eyeDiameterKm,
      rmwKm,
      stadiumTiltDeg,
      maxUpdraftMs,
      warmCoreAnomalyC,
      cloudTopTempC,
      structuralClassification: currentWind > 135
        ? "Compact Annular Vortex with Concentric Stadium Eyewall"
        : currentWind > 95
        ? "Intense Asymmetric Multi-Spiral System"
        : "Developing Tropical Cyclonic Vortex",
      vorticityPattern: `Extreme cyclonic potential vorticity concentrated in inner ${rmwKm}km radius`,
      convectiveStructure: "Violent overshooting cloud tops penetrating 17.5km into the lower stratosphere",
      eyewallDynamics: `Steep ${stadiumTiltDeg}° stadium effect outward flare with strong centrifugal boundary divergence`,
      inflowOutflowSummary: "Deep boundary layer friction-induced inflow at 925 hPa transitioning to expansive anticyclonic outflow canopy at 200 hPa."
    };

    try {
      const res = await fetch("/api/cyclone/structure-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cyclone.name,
          category: cyclone.category,
          windSpeedKnots: currentWind,
          pressureHpa: currentPressure,
          surgeHeightMeters: cyclone.surgeHeightMeters
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.structuralClassification) {
          setStructureData(data);
          return;
        }
      }
      setStructureData(localFallback);
    } catch (_err) {
      setStructureData(localFallback);
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas animation for the Satellite Vortex mode
  useEffect(() => {
    if (viewMode !== "satellite_vortex") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angleOffset = 0;

    // Derived physics from wind speed
    const rotationSpeed = (windKnots / 100) * 0.035;
    const eyeRadius = Math.max(12, Math.round(45 - windKnots * 0.18));
    const eyewallRadius = eyeRadius + Math.max(8, Math.round(18 - windKnots * 0.05));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Deep ocean background
      ctx.fillStyle = "#030c1c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radial coordinate grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      for (let r = 40; r <= 180; r += 40) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw multi-arm logarithmic spiral rainbands
      const numArms = 4;
      const b = 0.22 + (windKnots / 150) * 0.08; // tighter spiral at higher wind speed

      for (let arm = 0; arm < numArms; arm++) {
        const baseAngle = (arm * (Math.PI * 2)) / numArms + angleOffset;

        ctx.beginPath();
        ctx.strokeStyle = arm % 2 === 0 ? "rgba(192, 38, 211, 0.55)" : "rgba(6, 182, 212, 0.5)";
        ctx.lineWidth = Math.max(3, (windKnots / 140) * 7);

        for (let theta = 0; theta < Math.PI * 3.5; theta += 0.05) {
          const r = eyewallRadius + 8 * Math.exp(b * theta * 0.4);
          if (r > 190) break;
          const x = cx + r * Math.cos(baseAngle + theta);
          const y = cy + r * Math.sin(baseAngle + theta);
          if (theta === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Dense Convective Eyewall Ring (Cold Cloud Tops -80°C)
      const grad = ctx.createRadialGradient(cx, cy, eyeRadius, cx, cy, eyewallRadius + 15);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.95)"); // intense convective white
      grad.addColorStop(0.3, "rgba(217, 70, 239, 0.85)"); // cold -75°C magenta
      grad.addColorStop(0.7, "rgba(239, 68, 68, 0.7)"); // violent updraft red
      grad.addColorStop(1, "rgba(14, 165, 233, 0.2)"); // outer rainband blue

      ctx.beginPath();
      ctx.arc(cx, cy, eyewallRadius + 10, 0, Math.PI * 2);
      ctx.arc(cx, cy, eyeRadius, 0, Math.PI * 2, true);
      ctx.fillStyle = grad;
      ctx.fill();

      // Clear Calm Eye Center
      ctx.beginPath();
      ctx.arc(cx, cy, eyeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#020713";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Eye center temperature dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();

      // Swirling wind particles
      ctx.fillStyle = "#ffffff";
      for (let p = 0; p < 36; p++) {
        const pRadius = eyeRadius + 4 + (p * 4) % 140;
        const pSpeed = (windKnots / pRadius) * 0.08;
        const pAngle = angleOffset * 2 + p * 0.6;
        const px = cx + pRadius * Math.cos(pAngle);
        const py = cy + pRadius * Math.sin(pAngle);

        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      angleOffset += rotationSpeed;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [viewMode, windKnots]);

  // Derived calculations for Cross Section visual
  const eyeDiam = structureData?.eyeDiameterKm || Math.max(18, Math.round(75 - windKnots * 0.35));
  const tiltAngle = structureData?.stadiumTiltDeg || Math.min(80, Math.round(45 + windKnots * 0.22));
  const updraftVelocity = structureData?.maxUpdraftMs || Math.round(10 + windKnots * 0.14);
  const warmAnomaly = structureData?.warmCoreAnomalyC || (4 + (1013 - pressureHpa) * 0.14).toFixed(1);
  const cloudTopTemp = structureData?.cloudTopTempC || -Math.min(88, Math.round(55 + windKnots * 0.2));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-2xl space-y-4 sm:space-y-5">
      {/* Module Title & Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-300">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                HIGH-FIDELITY CYCLONE STRUCTURE & VORTEX ANATOMY
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                DYNAMIC GENERATIVE PHYSICS
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Parametric Eyewall Stadium Effect • Atmospheric Cross-Section (0-18 km) • Warm Core Chimney Model
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs font-mono overflow-x-auto no-scrollbar max-w-full w-full sm:w-auto">
          <button
            onClick={() => setViewMode("cross_section")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer ${
              viewMode === "cross_section"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vertical Cross-Section
          </button>
          <button
            onClick={() => setViewMode("satellite_vortex")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer ${
              viewMode === "satellite_vortex"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Satellite Radiometer Vortex
          </button>
          <button
            onClick={() => setViewMode("vortex_3d")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer ${
              viewMode === "vortex_3d"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            3D Stadium Perspective
          </button>
        </div>
      </div>

      {/* Interactive Intensity & Wind Speed Parameter Tweaker */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
          {/* Wind Speed Control */}
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Sustained Winds:</span>
            <input
              type="range"
              min="45"
              max="180"
              value={windKnots}
              onChange={(e) => {
                const val = Number(e.target.value);
                setWindKnots(val);
                // Approximate pressure drop with wind increase
                setPressureHpa(Math.max(895, Math.round(1010 - val * 0.72)));
              }}
              className="w-24 sm:w-28 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-cyan-300 font-bold text-xs sm:text-sm">{windKnots} kt</span>
            <span className="text-slate-500 text-[10px] hidden xs:inline">({Math.round(windKnots * 1.852)} km/h)</span>
          </div>

          {/* Central Pressure Control */}
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Central Pressure:</span>
            <input
              type="range"
              min="895"
              max="995"
              value={pressureHpa}
              onChange={(e) => setPressureHpa(Number(e.target.value))}
              className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-amber-300 font-bold text-xs sm:text-sm">{pressureHpa} hPa</span>
          </div>
        </div>

        {/* Re-generate Action Button */}
        <button
          onClick={() => generateStructure(windKnots, pressureHpa)}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition disabled:opacity-60 cursor-pointer w-full md:w-auto"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Sparkles className="w-4 h-4 text-slate-950" />
          )}
          <span>{isGenerating ? "Synthesizing Structure..." : "Generate High-Fidelity Structure"}</span>
        </button>
      </div>

      {/* Main Structural Visualization Canvas View */}
      <div className="relative w-full h-[340px] sm:h-[420px] lg:h-[480px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* VIEW 1: ATMOSPHERIC VERTICAL CROSS-SECTION (0-18 KM) */}
        {viewMode === "cross_section" && (
          <div className="relative w-full h-full p-4 flex flex-col justify-between select-none">
            {/* Top Atmospheric Altitude Readout */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800/80">
              <span className="text-purple-300 flex items-center gap-1 font-semibold">
                <Thermometer className="w-3.5 h-3.5 text-purple-400" />
                TROPOPAUSE COLD CANOPY (16 - 18 km) • OVERSHOOTING TOP: {cloudTopTemp}°C
              </span>
              <span className="text-cyan-300">
                WARM CORE ANOMALY: +{warmAnomaly}°C AT 250 hPa
              </span>
              <span className="text-amber-300 font-bold">
                STADIUM TILT: {tiltAngle}°
              </span>
            </div>

            {/* SVG Cross-Section Illustration */}
            <div className="relative flex-1 w-full flex items-center justify-center">
              <svg viewBox="0 0 1000 420" className="w-full h-full">
                <defs>
                  {/* Sky Troposphere Gradient */}
                  <linearGradient id="tropoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#080e22" />
                    <stop offset="50%" stopColor="#0a1a36" />
                    <stop offset="100%" stopColor="#040b17" />
                  </linearGradient>

                  {/* Warm Core Chimney Gradient */}
                  <radialGradient id="warmCoreGrad">
                    <stop offset="0%" stopColor="rgba(244, 63, 94, 0.75)" />
                    <stop offset="45%" stopColor="rgba(251, 146, 60, 0.45)" />
                    <stop offset="85%" stopColor="rgba(56, 189, 248, 0.15)" />
                    <stop offset="100%" stopColor="rgba(3, 10, 24, 0)" />
                  </radialGradient>

                  {/* Eyewall Cloud Gradient */}
                  <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#cbd5e1" />
                    <stop offset="70%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>

                  {/* Rain Shaft Pattern */}
                  <pattern id="rainShaft" width="10" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                    <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1.2" />
                  </pattern>
                </defs>

                {/* Sky Canvas Background */}
                <rect width="1000" height="420" fill="url(#tropoGrad)" />

                {/* Altitude Grid Guidelines (18km, 12km, 6km, 0km) */}
                <g stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" strokeDasharray="4,4">
                  <line x1="50" y1="40" x2="950" y2="40" />
                  <line x1="50" y1="120" x2="950" y2="120" />
                  <line x1="50" y1="220" x2="950" y2="220" />
                  <line x1="50" y1="350" x2="950" y2="350" />
                </g>

                {/* Altitude Y-Axis Labels */}
                <text x="15" y="44" fill="#94a3b8" fontSize="11" fontFamily="monospace">18 km (Stratosphere)</text>
                <text x="15" y="124" fill="#94a3b8" fontSize="11" fontFamily="monospace">12 km (Upper Jet)</text>
                <text x="15" y="224" fill="#94a3b8" fontSize="11" fontFamily="monospace">6 km (Free Tropo)</text>
                <text x="15" y="354" fill="#38bdf8" fontSize="11" fontFamily="monospace">0 km (Sea Level)</text>

                {/* Sea Surface Baseline */}
                <rect x="50" y="350" width="900" height="70" fill="#03152d" />
                <line x1="50" y1="350" x2="950" y2="350" stroke="#0ea5e9" strokeWidth="2" />

                {/* Warm Core Thermal Chimney in the Eye Center */}
                <ellipse cx="500" cy="160" rx="45" ry="110" fill="url(#warmCoreGrad)" />
                <text x="500" y="155" fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  WARM CORE (+{warmAnomaly}°C)
                </text>
                <text x="500" y="175" fill="#fecdd3" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  Dry Subsidence Air
                </text>

                {/* Eyewall Cloud Slopes (Stadium Effect based on tiltAngle) */}
                {/* Left Eyewall */}
                <path
                  d={`M 460,350 Q ${460 - (90 - tiltAngle) * 3},180 ${440 - (90 - tiltAngle) * 5},45 L ${360 - (90 - tiltAngle) * 4},45 Q 380,180 390,350 Z`}
                  fill="url(#cloudGrad)"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
                {/* Left Overshooting Top Dome */}
                <ellipse cx={440 - (90 - tiltAngle) * 5} cy="45" rx="35" ry="14" fill="#ffffff" />

                {/* Right Eyewall */}
                <path
                  d={`M 540,350 Q ${540 + (90 - tiltAngle) * 3},180 ${560 + (90 - tiltAngle) * 5},45 L ${640 + (90 - tiltAngle) * 4},45 Q 620,180 610,350 Z`}
                  fill="url(#cloudGrad)"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
                {/* Right Overshooting Top Dome */}
                <ellipse cx={560 + (90 - tiltAngle) * 5} cy="45" rx="35" ry="14" fill="#ffffff" />

                {/* Outer Primary Spiral Rainband (Left) */}
                <path
                  d="M 280,350 Q 270,220 290,130 L 220,130 Q 210,220 220,350 Z"
                  fill="url(#cloudGrad)"
                  opacity="0.85"
                />
                {/* Rain Shaft under Left Eyewall */}
                <rect x="390" y="350" width="70" height="40" fill="url(#rainShaft)" />

                {/* Outer Primary Spiral Rainband (Right) */}
                <path
                  d="M 720,350 Q 730,220 710,130 L 780,130 Q 790,220 780,350 Z"
                  fill="url(#cloudGrad)"
                  opacity="0.85"
                />
                {/* Rain Shaft under Right Eyewall */}
                <rect x="540" y="350" width="70" height="40" fill="url(#rainShaft)" />

                {/* Updraft Flow Velocity Arrows (Eyewall) */}
                <g stroke="#f59e0b" strokeWidth="2.5" fill="none">
                  {/* Left Updraft */}
                  <line x1="420" y1="330" x2="420" y2="100" strokeDasharray="6,4" className="animate-dash" />
                  <polygon points="420,90 415,105 425,105" fill="#f59e0b" />
                  <text x="395" y="210" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    W: {updraftVelocity} m/s
                  </text>

                  {/* Right Updraft */}
                  <line x1="580" y1="330" x2="580" y2="100" strokeDasharray="6,4" className="animate-dash" />
                  <polygon points="580,90 575,105 585,105" fill="#f59e0b" />
                  <text x="595" y="210" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    W: {updraftVelocity} m/s
                  </text>
                </g>

                {/* Upper Tropospheric Outflow Exhaust (Anticyclonic Divergence) */}
                <g stroke="#38bdf8" strokeWidth="2" fill="none">
                  <path d="M 410,50 Q 300,50 160,70" markerEnd="url(#arrow)" />
                  <polygon points="150,72 165,65 163,78" fill="#38bdf8" />
                  <text x="210" y="42" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                    Cirrus Outflow Canopy →
                  </text>

                  <path d="M 590,50 Q 700,50 840,70" />
                  <polygon points="850,72 835,65 837,78" fill="#38bdf8" />
                  <text x="700" y="42" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                    ← Cirrus Outflow Canopy
                  </text>
                </g>

                {/* Boundary Layer Low-Level Inflow */}
                <g stroke="#22c55e" strokeWidth="2" fill="none">
                  <line x1="160" y1="340" x2="380" y2="340" strokeDasharray="4,4" className="animate-dash" />
                  <polygon points="390,340 375,335 375,345" fill="#22c55e" />
                  <text x="200" y="332" fill="#22c55e" fontSize="10" fontFamily="monospace">
                    Marine Boundary Inflow →
                  </text>

                  <line x1="840" y1="340" x2="620" y2="340" strokeDasharray="4,4" className="animate-dash" />
                  <polygon points="610,340 625,335 625,345" fill="#22c55e" />
                  <text x="660" y="332" fill="#22c55e" fontSize="10" fontFamily="monospace">
                    ← Marine Boundary Inflow
                  </text>
                </g>

                {/* Central Eye Diameter & Caliper Indicator */}
                <line x1="460" y1="370" x2="540" y2="370" stroke="#f43f5e" strokeWidth="1.5" />
                <line x1="460" y1="365" x2="460" y2="375" stroke="#f43f5e" strokeWidth="1.5" />
                <line x1="540" y1="365" x2="540" y2="375" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="500" y="388" fill="#fca5a5" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  EYE DIAMETER: {eyeDiam} km
                </text>

                {/* Barometric Pressure Isobar Dip Curve (Bottom Graph) */}
                <path
                  d="M 50,405 Q 350,405 450,412 Q 500,418 550,412 Q 650,405 950,405"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                <text x="500" y="415" fill="#fde68a" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  Vortex Pressure Well: {pressureHpa} hPa
                </text>
              </svg>
            </div>
          </div>
        )}

        {/* VIEW 2: TOP-DOWN SATELLITE RADIOMETER VORTEX (HTML5 CANVAS) */}
        {viewMode === "satellite_vortex" && (
          <div className="relative w-full h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={750}
              height={380}
              className="w-full h-full object-contain"
            />
            {/* Overlay Telemetry HUD */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-[10px] font-mono space-y-1">
              <div>VORTEX MULTISPECTRAL: <strong className="text-cyan-400">IR ENHANCED (10.3 μm)</strong></div>
              <div>SPIRAL ROTATION: <strong className="text-emerald-400">{(windKnots * 1.852).toFixed(0)} km/h</strong></div>
              <div>EYE RADIUS: <strong className="text-amber-400">{Math.round(eyeDiam / 2)} km</strong></div>
              <div>CONVECTIVE CORE: <strong className="text-fuchsia-300">-81.4°C Cold Overshoot</strong></div>
            </div>

            <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Real-Time Particle Wind Vectors Synced to {windKnots} kt</span>
            </div>
          </div>
        )}

        {/* VIEW 3: 3D VOLUMETRIC STADIUM PERSPECTIVE */}
        {viewMode === "vortex_3d" && (
          <div className="relative w-full h-full flex items-center justify-center p-6 text-center bg-gradient-to-b from-[#040b18] via-[#091830] to-[#040b18]">
            <div className="max-w-md space-y-3">
              <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
                {/* 3D Stacked Rings simulating Stadium Effect */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-dashed border-cyan-400/80 animate-spin-slow"
                  style={{ transform: "rotateX(60deg) scale(1.4)" }}
                />
                <div
                  className="absolute inset-4 rounded-full border-2 border-dashed border-fuchsia-400/90 animate-spin-slow"
                  style={{ transform: "rotateX(60deg) scale(1.1)" }}
                />
                <div
                  className="absolute inset-10 rounded-full border-2 border-amber-400 animate-spin-slow"
                  style={{ transform: "rotateX(60deg) scale(0.8)" }}
                />
                <div
                  className="absolute inset-16 rounded-full bg-slate-950 border border-white shadow-2xl flex items-center justify-center"
                  style={{ transform: "rotateX(60deg) scale(0.6)" }}
                >
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">EYE</span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-300">
                <span className="text-cyan-400 font-bold">STADIUM EFFECT GEOMETRY:</span> Eyewall clouds slope outward at{" "}
                <strong className="text-amber-300">{tiltAngle}°</strong> from the {eyeDiam}km surface eye to expand over a{" "}
                {Math.round(eyeDiam * 1.7)}km canopy at the tropopause.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Physical Structural Diagnostic Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] block">EYE DIAMETER</span>
          <span className="text-lg font-black text-cyan-300">{eyeDiam} km</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {eyeDiam < 30 ? "Pin-hole Eye (Cat 4/5)" : "Standard Eye"}
          </span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] block">RADIUS MAX WINDS (RMW)</span>
          <span className="text-lg font-black text-emerald-300">
            {structureData?.rmwKm || Math.max(14, Math.round(eyeDiam * 0.75))} km
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Core Destruction Band</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] block">STADIUM TILT ANGLE</span>
          <span className="text-lg font-black text-amber-300">{tiltAngle}°</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Centrifugal Flare</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] block">PEAK EYEWALL UPDRAFT</span>
          <span className="text-lg font-black text-rose-300">{updraftVelocity} m/s</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Violent Convective Tower</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] block">WARM CORE ANOMALY</span>
          <span className="text-lg font-black text-red-400">+{warmAnomaly}°C</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">250 hPa Thermal Engine</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] block">CLOUD TOP TEMP</span>
          <span className="text-lg font-black text-purple-300">{cloudTopTemp}°C</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">17.8 km Tropopause Core</span>
        </div>
      </div>

      {/* AI Structural Diagnostic Narrative Card */}
      {structureData && (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/40 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>METEOROLOGICAL STRUCTURAL CLASSIFICATION & DYNAMICS</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              {structureData.structuralClassification}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-mono text-[10px] block uppercase">Vorticity Ring Pattern</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{structureData.vorticityPattern}</p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-mono text-[10px] block uppercase">Convective Tower Geometry</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{structureData.convectiveStructure}</p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-mono text-[10px] block uppercase">Inflow & Outflow Couplet</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{structureData.inflowOutflowSummary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
