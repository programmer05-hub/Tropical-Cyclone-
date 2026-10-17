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
  Crosshair,
  AlertTriangle,
  Info,
  CheckCircle2,
  Maximize2,
  Minimize2
} from "lucide-react";
import { CycloneData, Shelter } from "../types";

// Public demo key provisioned via CheckMapsDemoKeyEligibilityAndTos & GenerateMapsDemoKey
const GOOGLE_MAPS_API_KEY = "AIzaSyDC3toH5J2v09vITFEA6Vh1fN55Nfqm6KM";

interface GoogleMapsCycloneTrackerProps {
  cyclone: CycloneData;
  onSelectShelter?: (shelter: Shelter) => void;
  onProximityAlert?: (alert: { locationName: string; distanceKm: number }) => void;
}

export const GoogleMapsCycloneTracker: React.FC<GoogleMapsCycloneTrackerProps> = ({
  cyclone,
  onSelectShelter,
  onProximityAlert
}) => {
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
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
  const [showWindRadii, setShowWindRadii] = useState(true);
  const [showForecastTrack, setShowForecastTrack] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [distanceToCyclone, setDistanceToCyclone] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Full screen the device (Fullscreen API with vendor prefixes & responsive fallback)
  // Target only the map viewport so the map alone occupies the screen similar to gmaps
  const toggleDeviceFullScreen = async () => {
    const elem = mapViewportRef.current;
    if (!elem) return;

    const isCurrentlyFullscreen = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement ||
      isFullscreen
    );

    if (!isCurrentlyFullscreen) {
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
      } catch (err) {
        console.warn("Device fullscreen request warning:", err);
      }
      setIsFullscreen(true);
    } else {
      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen && (document as any).webkitFullscreenElement) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen && (document as any).mozFullScreenElement) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen && (document as any).msFullscreenElement) {
          await (document as any).msExitFullscreen();
        }
      } catch (err) {
        console.warn("Exit device fullscreen error:", err);
      }
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen state with native document fullscreen events (e.g., ESC key press)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (!isDocFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Re-adjust Google Maps size & center whenever entering or exiting fullscreen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.trigger(mapInstanceRef.current, "resize");
        mapInstanceRef.current.panTo({ lat: cyclone.lat, lng: cyclone.lon });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullscreen, cyclone.lat, cyclone.lon]);

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

  // Load Google Maps JavaScript API reliably without ever falling back to iframe
  useEffect(() => {
    let isMounted = true;

    const checkAndSetLoaded = () => {
      if ((window as any).google && (window as any).google.maps) {
        if (isMounted) setMapLoaded(true);
        return true;
      }
      return false;
    };

    if (checkAndSetLoaded()) return;

    const scriptId = "google-maps-api-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const interval = setInterval(() => {
      if (checkAndSetLoaded()) {
        clearInterval(interval);
      }
    }, 100);

    script.addEventListener("load", () => {
      checkAndSetLoaded();
      clearInterval(interval);
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Initialize Map Instance once loaded with ultra-smooth physics
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    const google = (window as any).google;
    if (!google || !google.maps) return;

    try {
      const targetMapTypeId = google.maps.MapTypeId.HYBRID;

      if (!mapInstanceRef.current) {
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat: cyclone.lat, lng: cyclone.lon },
          zoom: 7,
          mapTypeId: targetMapTypeId,
          disableDefaultUI: false,
          zoomControl: false, // Explicitly removed + and - symbol as requested
          streetViewControl: false,
          fullscreenControl: false, // Handled by our device fullscreen feature
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
      } else {
        mapInstanceRef.current.panTo({ lat: cyclone.lat, lng: cyclone.lon });
        updateMapLayers(mapInstanceRef.current);
      }
    } catch (err: any) {
      console.error("Map initialization error:", err);
      setMapError(err.message || "Failed to initialize Google Maps");
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

        // Notify AI Agent if distance is <= 100km
        if (dist <= 100 && onProximityAlert) {
          onProximityAlert({
            locationName: results[0].formatted_address,
            distanceKm: dist
          });
        }

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
                LIVE GMAPS JS API
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
            <div
              className={`px-2.5 py-1 rounded font-bold transition ${
                distanceToCyclone <= 100
                  ? "bg-red-600 text-white border border-red-400 shadow-md shadow-red-500/30 animate-pulse"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
            >
              Distance to 🌀 Eye: {distanceToCyclone} km {distanceToCyclone <= 100 ? "(<=100km ALERT!)" : ""}
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
      </div>

      {/* Google Maps Viewport with Smooth Hardware Acceleration & Full Screen Support */}
      <div
        ref={mapViewportRef}
        className={
          isFullscreen
            ? "fixed inset-0 z-[9999999] w-screen h-screen m-0 rounded-none border-0 overflow-hidden bg-slate-950 will-change-transform transform-gpu flex flex-col"
            : "relative w-full h-[380px] sm:h-[480px] lg:h-[580px] xl:h-[640px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 will-change-transform transform-gpu"
        }
      >
        {/* Floating Device Full Screen Symbol on Map - Symbol Only (Similar to Google Maps) */}
        <button
          onClick={toggleDeviceFullScreen}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 w-10 h-10 rounded-lg bg-slate-950/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700/80 hover:border-cyan-400 flex items-center justify-center transition shadow-2xl backdrop-blur-md cursor-pointer group"
          title={isFullscreen ? "Exit full screen" : "Toggle full screen"}
          aria-label={isFullscreen ? "Exit full screen" : "Toggle full screen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 transition-transform group-hover:scale-110" />
          ) : (
            <Maximize2 className="w-5 h-5 transition-transform group-hover:scale-110" />
          )}
        </button>

        {/* Loading Overlay while Google Maps JS API script loads */}
        {!mapLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm text-cyan-400 font-mono text-xs gap-3">
            <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <span className="text-white font-bold tracking-wide">CONNECTING TO GOOGLE MAPS JS SATELLITE...</span>
            <span className="text-[11px] text-slate-400">Loading High-Resolution Hybrid Imagery &amp; Cyclone Eye Vortex</span>
          </div>
        )}

        {/* Pure Google Maps JS API Container (No Frame View fallback) */}
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

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
