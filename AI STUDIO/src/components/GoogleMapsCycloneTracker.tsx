import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Layers,
  Compass,
  Wind,
  Gauge,
  Navigation,
  Search,
  Shield,
  ZoomIn,
  ZoomOut,
  Crosshair,
  AlertTriangle,
  Info,
  CheckCircle2
} from "lucide-react";
import { CycloneData, Shelter } from "../types";

// Public demo key provisioned via CheckMapsDemoKeyEligibilityAndTos & GenerateMapsDemoKey
const GOOGLE_MAPS_API_KEY = "AIzaSyDC3toH5J2v09vITFEA6Vh1fN55Nfqm6KM";

interface GoogleMapsCycloneTrackerProps {
  cyclone: CycloneData;
  onSelectShelter?: (shelter: Shelter) => void;
}

export const GoogleMapsCycloneTracker: React.FC<GoogleMapsCycloneTrackerProps> = ({
  cyclone,
  onSelectShelter
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const animatedOverlayRef = useRef<any>(null);
  const circlesRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const shelterMarkersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  // Single fixed layer: Hybrid (Satellite imagery + road and infrastructure labels)
  const [mapType] = useState<"hybrid">("hybrid");
  const [gmapsEngine, setGmapsEngine] = useState<"api" | "embed">("api");
  const [showWindRadii, setShowWindRadii] = useState(true);
  const [showForecastTrack, setShowForecastTrack] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [distanceToCyclone, setDistanceToCyclone] = useState<number | null>(null);

  // Calculate distance between two lat/lon in km (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Load Google Maps JavaScript API
  useEffect(() => {
    if ((window as any).google && (window as any).google.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = "google-maps-api-script";
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    script.onerror = () => {
      setMapError("Could not load Google Maps API. Switching to high-res Satellite Frame view.");
      setGmapsEngine("embed");
    };

    document.head.appendChild(script);
  }, []);

  // Initialize Map Instance once loaded with ultra-smooth physics
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    const google = (window as any).google;
    if (!google || !google.maps) return;

    try {
      const targetMapTypeId = google.maps.MapTypeId.HYBRID;

      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: cyclone.lat, lng: cyclone.lon },
        zoom: 7,
        mapTypeId: targetMapTypeId,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: false,
        // Smooth gesture handling: smooth panning and pinch zoom without jarring lockups
        gestureHandling: "greedy",
        scrollwheel: true,
        clickableIcons: false, // Disables accidental POI popups for maximum responsiveness
        backgroundColor: "#030712",
        controlSize: 28,
        styles: [] // Clean styles to avoid interfering with terrain topography
      });

      mapInstanceRef.current = map;
      updateMapLayers(map);
    } catch (err: any) {
      console.error("Map initialization error:", err);
      setMapError(err.message || "Failed to initialize Google Maps");
      setGmapsEngine("embed");
    }
  }, [mapLoaded]);

  // Update Cyclone Marker, Track, and Overlays whenever cyclone changes
  const updateMapLayers = (map: any) => {
    const google = (window as any).google;
    if (!google || !map) return;

    // 1. Clear existing overlays
    if (animatedOverlayRef.current) {
      animatedOverlayRef.current.setMap(null);
      animatedOverlayRef.current = null;
    }
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);
    shelterMarkersRef.current.forEach((m) => m.setMap(null));
    shelterMarkersRef.current = [];

    const cyclonePos = { lat: cyclone.lat, lng: cyclone.lon };

    // Common InfoWindow for Cyclone Eye
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="color: #0f172a; font-family: monospace; padding: 6px; max-width: 270px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 15px; color: #dc2626;">
            <span style="font-size: 20px;">🌀</span> ${cyclone.name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 3px; font-weight: 600;">
            ${cyclone.category} (JTWC / IMD Calibrated)
          </div>
          <div style="font-size: 11px; margin-top: 8px; line-height: 1.6; border-top: 1px solid #e2e8f0; pt: 6px;">
            <div>• Eye Coordinates: <strong>${cyclone.lat}°N, ${cyclone.lon}°E</strong></div>
            <div>• Sustained Winds: <strong style="color: #0284c7;">${cyclone.windSpeedKnots} kt</strong> (${Math.round(cyclone.windSpeedKnots * 1.852)} km/h)</div>
            <div>• Central Pressure: <strong>${cyclone.pressureHpa} hPa</strong></div>
            <div>• Peak Storm Surge: <strong style="color: #dc2626;">${cyclone.surgeHeightMeters}m</strong></div>
            <div>• Target Coast: <strong>${cyclone.targetRegion}</strong></div>
          </div>
        </div>
      `
    });
    infoWindowRef.current = infoWindow;

    // 2. Custom HTML OverlayView for FULLY ANIMATED 🌀 SYMBOL AND ANIMATED CONCENTRIC CIRCLES
    try {
      class CycloneOverlay extends google.maps.OverlayView {
        private pos: { lat: number; lng: number };
        private div: HTMLDivElement | null = null;

        constructor(pos: { lat: number; lng: number }) {
          super();
          this.pos = pos;
          this.setMap(map);
        }

        onAdd() {
          const container = document.createElement("div");
          container.style.position = "absolute";
          container.style.cursor = "pointer";
          container.style.transform = "translate(-50%, -50%)";
          container.style.userSelect = "none";
          container.style.zIndex = "1000";

          // Animated DOM content with spinning 🌀 symbol and animated pulsating concentric circles
          container.innerHTML = `
            <div style="position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
              <!-- Outer Animated Pulsing Wave Circle (34kt boundary) -->
              <div class="animate-pulse-wave-outer" style="position: absolute; width: 130px; height: 130px; border-radius: 50%; border: 2px dashed rgba(234, 179, 8, 0.7); background: radial-gradient(circle, rgba(234, 179, 8, 0.12) 0%, rgba(234, 179, 8, 0) 70%);"></div>
              
              <!-- Mid Animated Pulsing Wave Circle (50kt storm ring) -->
              <div class="animate-pulse-wave" style="position: absolute; width: 90px; height: 90px; border-radius: 50%; border: 2px solid rgba(249, 115, 22, 0.85); background: radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, rgba(249, 115, 22, 0) 70%);"></div>

              <!-- Rotating Radar Dashed Ring (Counter-clockwise vortex) -->
              <div class="animate-cyclone-spin-reverse" style="position: absolute; width: 68px; height: 68px; border-radius: 50%; border: 2px dashed #ef4444;"></div>

              <!-- Inner Eyewall Shockwave Circle -->
              <div class="animate-radar-ring" style="position: absolute; width: 52px; height: 52px; border-radius: 50%; border: 2.5px solid #ef4444; background: rgba(239, 68, 68, 0.25);"></div>

              <!-- Central Eye Core Button with Fast Rotating 🌀 Symbol -->
              <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(3, 7, 18, 0.92); border: 2px solid #ffffff; box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease;">
                <span class="animate-cyclone-spin" style="display: inline-block; font-size: 26px; line-height: 1; transform-origin: center center;">🌀</span>
              </div>

              <!-- Floating Storm Identifier Badge -->
              <div style="position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); background: rgba(3, 7, 18, 0.95); border: 1px solid #ef4444; padding: 2px 7px; border-radius: 6px; font-family: monospace; font-size: 10px; font-weight: 800; color: #ffffff; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.8);">
                🌀 ${cyclone.name}
              </div>
            </div>
          `;

          container.addEventListener("click", () => {
            infoWindow.setPosition(new google.maps.LatLng(this.pos.lat, this.pos.lng));
            infoWindow.open(map);
          });

          this.div = container;
          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(container);
        }

        draw() {
          const overlayProjection = this.getProjection();
          if (!overlayProjection || !this.div) return;
          const latLng = new google.maps.LatLng(this.pos.lat, this.pos.lng);
          const pixel = overlayProjection.fromLatLngToDivPixel(latLng);
          if (pixel) {
            this.div.style.left = pixel.x + "px";
            this.div.style.top = pixel.y + "px";
          }
        }

        onRemove() {
          if (this.div && this.div.parentNode) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
          }
        }
      }

      animatedOverlayRef.current = new CycloneOverlay(cyclonePos);
    } catch (e) {
      console.warn("Custom OverlayView fallback:", e);
    }

    // 3. Draw Geographic Wind Radii Circles on Google Maps (64kt, 50kt, 34kt)
    if (showWindRadii) {
      const circle64 = new google.maps.Circle({
        strokeColor: "#ef4444",
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: "#ef4444",
        fillOpacity: 0.16,
        map: map,
        center: cyclonePos,
        radius: 45000 // meters
      });

      const circle50 = new google.maps.Circle({
        strokeColor: "#f97316",
        strokeOpacity: 0.75,
        strokeWeight: 1.5,
        fillColor: "#f97316",
        fillOpacity: 0.1,
        map: map,
        center: cyclonePos,
        radius: 90000
      });

      const circle34 = new google.maps.Circle({
        strokeColor: "#eab308",
        strokeOpacity: 0.65,
        strokeWeight: 1.2,
        fillColor: "#eab308",
        fillOpacity: 0.05,
        map: map,
        center: cyclonePos,
        radius: 160000
      });

      circlesRef.current = [circle64, circle50, circle34];
    }

    // 4. Draw Forecast Track Polyline
    if (showForecastTrack && cyclone.forecastCone) {
      const trackCoords = cyclone.forecastCone.map((fc) => ({
        lat: fc.lat,
        lng: fc.lon
      }));

      const trackPath = new google.maps.Polyline({
        path: trackCoords,
        geodesic: true,
        strokeColor: "#06b6d4",
        strokeOpacity: 0.9,
        strokeWeight: 3.5
      });

      trackPath.setMap(map);
      polylineRef.current = trackPath;
    }

    // 5. Add Inland Cyclone Shelters on Google Maps
    if (showShelters && cyclone.shelters) {
      cyclone.shelters.forEach((shelter) => {
        const shelterMarker = new google.maps.Marker({
          position: { lat: shelter.lat, lng: shelter.lon },
          map: map,
          title: shelter.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="#0d9488" stroke="#ffffff" stroke-width="2"/>
                <text x="16" y="21" font-size="14" text-anchor="middle" font-family="sans-serif" font-weight="bold" fill="#ffffff">S</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          }
        });

        const shelterInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #0f172a; font-family: monospace; padding: 4px; max-width: 220px;">
              <strong style="color: #0d9488; font-size: 13px;">${shelter.name}</strong>
              <div style="font-size: 11px; margin-top: 4px;">
                <div>• Capacity: <strong>${shelter.capacity.toLocaleString()}</strong></div>
                <div>• Elevation: <strong>+${shelter.elevationMeters}m MSL</strong></div>
                <div>• Status: <strong style="color: #059669;">${shelter.status}</strong></div>
              </div>
            </div>
          `
        });

        shelterMarker.addListener("click", () => {
          shelterInfoWindow.open(map, shelterMarker);
          onSelectShelter?.(shelter);
        });

        shelterMarkersRef.current.push(shelterMarker);
      });
    }

    // Smoothly pan to the cyclone position
    map.panTo(cyclonePos);
  };

  // Re-run layers when dependencies change
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapLayers(mapInstanceRef.current);
    }
  }, [cyclone, showWindRadii, showForecastTrack, showShelters]);

  // Smooth Center on Cyclone
  const centerOnCyclone = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: cyclone.lat, lng: cyclone.lon });
      mapInstanceRef.current.setZoom(8);
    }
  };

  // Geocode location search
  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation.trim() || !mapInstanceRef.current) return;
    const google = (window as any).google;
    if (!google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchLocation }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        mapInstanceRef.current.panTo(loc);
        mapInstanceRef.current.setZoom(9);

        // Calculate distance from searched location to cyclone
        const dist = calculateDistance(cyclone.lat, cyclone.lon, loc.lat(), loc.lng());
        setDistanceToCyclone(dist);

        // Place temporary marker on searched city
        new google.maps.Marker({
          position: loc,
          map: mapInstanceRef.current,
          title: results[0].formatted_address,
          animation: google.maps.Animation.DROP
        });
      }
    });
  };

  // Single fixed layer code: 'h' = Hybrid (Satellite imagery + road and border labels)
  const getEmbedMapTypeCode = () => "h";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-2xl space-y-3 sm:space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
            <span className="text-xl animate-cyclone-spin inline-block">🌀</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                GOOGLE MAPS SATELLITE CYCLONE TRACKER
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                LIVE GMAPS INTERFACE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Interactive Google Maps integration showing animated cyclone eye 🌀 with concentric wind shockwaves &amp; coastal infrastructure
            </p>
          </div>
        </div>

        {/* Single Layer: Hybrid (Satellite + Roadways) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400">LAYER:</span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-500 text-slate-950 shadow-sm">
              HYBRID (Satellite + Roadways)
            </span>
          </div>

          <button
            onClick={centerOnCyclone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md shadow-red-500/20 cursor-pointer ml-auto sm:ml-0"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Center on 🌀 Cyclone</span>
          </button>
        </div>
      </div>

      {/* Location Search Bar & Cyclone Proximity Tool */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <form onSubmit={handleLocationSearch} className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search coastal city (e.g., Paradip, Puri, Visakhapatnam)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition shrink-0 cursor-pointer"
          >
            Find City
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-300 font-mono text-[11px]">
          {distanceToCyclone !== null && (
            <div className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
              Distance to 🌀 Eye: {distanceToCyclone} km
            </div>
          )}
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
            <input
              type="checkbox"
              checked={showWindRadii}
              onChange={(e) => setShowWindRadii(e.target.checked)}
              className="accent-cyan-400 cursor-pointer"
            />
            <span>Wind Radii (34/50/64kt)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
            <input
              type="checkbox"
              checked={showForecastTrack}
              onChange={(e) => setShowForecastTrack(e.target.checked)}
              className="accent-cyan-400 cursor-pointer"
            />
            <span>Forecast Track</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="accent-cyan-400 cursor-pointer"
            />
            <span>Shelters (S)</span>
          </label>
        </div>

        {/* Engine switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setGmapsEngine("api")}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              gmapsEngine === "api" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Maps JS API
          </button>
          <button
            onClick={() => setGmapsEngine("embed")}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              gmapsEngine === "embed" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Frame View
          </button>
        </div>
      </div>

      {/* Google Maps Viewport with Smooth Hardware Acceleration */}
      <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[580px] xl:h-[640px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 will-change-transform transform-gpu">
        {gmapsEngine === "embed" || mapError ? (
          /* Google Maps Interactive Frame Mode (Enhanced with animated 🌀 and concentric circles) */
          <div className="relative w-full h-full">
            <iframe
              title="Google Maps Cyclone Eye View"
              src={`https://maps.google.com/maps?q=${cyclone.lat},${cyclone.lon}&t=${getEmbedMapTypeCode()}&z=7&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0 filter brightness-90 contrast-105"
              loading="lazy"
            />

            {/* SUPERIMPOSED ANIMATED 🌀 CYCLONE SYMBOL & CONCENTRIC CIRCLES */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* 1. Outer Animated Pulsing Wave Circle (34kt Gale boundary) */}
                {showWindRadii && (
                  <>
                    <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full border-2 border-dashed border-amber-400/80 animate-pulse-wave-outer" />
                    <div className="absolute w-52 sm:w-72 h-52 sm:h-72 rounded-full border-2 border-orange-500/80 animate-pulse-wave" />
                    <div className="absolute w-36 sm:w-48 h-36 sm:h-48 rounded-full border border-red-500/80 animate-radar-ring" />
                  </>
                )}

                {/* 2. Rotating Radar Dashed Wind Ring */}
                <div className="absolute w-28 sm:w-36 h-28 sm:h-36 rounded-full border-2 border-dashed border-red-500/80 animate-cyclone-spin-reverse" />

                {/* 3. Eyewall Pulsing Warning Core */}
                <div className="absolute w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-red-600/25 border-2 border-red-500 animate-ping opacity-40" />

                {/* 4. Central Eye Core Beacon with Fast Smoothly Rotating 🌀 Symbol */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950/90 border-2 border-white shadow-2xl shadow-red-500/60 flex items-center justify-center pointer-events-auto cursor-pointer hover:scale-110 transition duration-300 backdrop-blur-md">
                  <span className="text-3xl sm:text-4xl animate-cyclone-spin select-none inline-block">🌀</span>
                </div>

                {/* 5. Marker Tag Badge */}
                <div className="absolute top-16 sm:top-18 bg-slate-950/95 border border-red-500/70 px-2.5 sm:px-3.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold text-white shadow-2xl whitespace-nowrap">
                  🌀 {cyclone.name} ({cyclone.category}) • {cyclone.windSpeedKnots}kt
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Google Maps JS API Mode */
          <div className="relative w-full h-full">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>
        )}

        {/* Floating Cyclone Eye Location Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-slate-950/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 rounded-xl border border-red-500/50 shadow-xl text-[10px] sm:text-xs font-mono text-slate-200 space-y-0.5 sm:space-y-1 max-w-[calc(100%-16px)] sm:max-w-xs pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-red-400">
            <span className="text-base sm:text-lg animate-cyclone-spin inline-block">🌀</span>
            <span>ANIMATED CYCLONE TRACKER</span>
          </div>
          <div className="truncate">Storm: <strong className="text-white">{cyclone.name}</strong> ({cyclone.category})</div>
          <div>Coordinates: <strong className="text-cyan-300">{cyclone.lat}°N, {cyclone.lon}°E</strong></div>
          <div>Intensity: <strong className="text-amber-300">{cyclone.windSpeedKnots} kt</strong> • <strong>{cyclone.pressureHpa} hPa</strong></div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">Landfall Target: {cyclone.targetRegion}</div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-3 z-10 bg-slate-950/90 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 text-[9px] sm:text-[10px] font-mono text-slate-400 flex flex-wrap items-center gap-2 sm:gap-3 justify-center sm:justify-start pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-ping" />
            <span className="text-red-300 font-semibold">64kt Hurricane Ring</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span className="text-orange-300">50kt Storm Ring</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
            <span className="text-yellow-300">34kt Gale Ring</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
            <span>Shelters (S)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
