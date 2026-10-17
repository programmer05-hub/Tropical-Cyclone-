import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Radio,
  Send
} from "lucide-react";
import { CycloneData } from "../types";
import { speakSingleVoiceBrowser, stopAllEmergencyAudio } from "../utils/audioManager";

export interface AiAgentMessage {
  id: string;
  timestamp: string;
  type: "PROXIMITY_100KM" | "SIX_HOUR_BULLETIN" | "MANUAL_ADVISORY";
  title: string;
  body: string;
  distanceKm?: number;
  simulationHour?: number;
  read: boolean;
  priority: "CRITICAL" | "HIGH" | "INFO";
}

interface AiAgentNotificationSystemProps {
  cyclone: CycloneData;
  simulationHour: number;
  onNavigateToTab: (tab: "dashboard" | "evacuation" | "alerts" | "search" | "satellite" | "gmaps") => void;
  externalDistanceAlert?: { locationName: string; distanceKm: number } | null;
}

export const AiAgentNotificationSystem: React.FC<AiAgentNotificationSystemProps> = ({
  cyclone,
  simulationHour,
  onNavigateToTab,
  externalDistanceAlert
}) => {
  const [messages, setMessages] = useState<AiAgentMessage[]>([]);
  const [activeUrgentAlert, setActiveUrgentAlert] = useState<AiAgentMessage | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [nextBulletinCountdown, setNextBulletinCountdown] = useState(360); // seconds to next 6h simulated/real bulletin

  const triggered100kmRef = useRef<Record<string, boolean>>({});
  const triggered6hRef = useRef<Record<string, boolean>>({});

  // Check and request browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setNotificationsEnabled(true);
        sendBrowserNotification(
          "🔔 CycloShield AI Agent Connected",
          "Automated 6-hourly bulletins & <=100km critical cyclone alerts enabled."
        );
      }
    }
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "cycloshield-ai-agent"
        });
      } catch (e) {
        console.warn("Notification error:", e);
      }
    }
  };

  // Rule 1: Send message when cyclone is 100km or less than 100km
  useEffect(() => {
    // Distance to target coast based on landfall hours remaining
    const hoursRemaining = Math.max(0, cyclone.hoursToLandfall - simulationHour);
    const estimatedDistanceKm = Math.round(hoursRemaining * 22);

    const alertKey = `${cyclone.id}-${simulationHour}-${estimatedDistanceKm <= 100 ? "near" : "far"}`;

    if (estimatedDistanceKm <= 100 && !triggered100kmRef.current[alertKey]) {
      triggered100kmRef.current[alertKey] = true;

      const newMsg: AiAgentMessage = {
        id: `proximity-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "PROXIMITY_100KM",
        title: `🚨 CRITICAL: Cyclone ${cyclone.name} is ${estimatedDistanceKm} km from Coast (<=100km Threshold)!`,
        body: `AI Emergency Agent Directive: Severe storm core is now at ${estimatedDistanceKm}km proximity to ${cyclone.targetRegion}. Maximum sustained winds: ${cyclone.windSpeedKnots}kt (${Math.round(cyclone.windSpeedKnots * 1.852)} km/h) with peak surge inundation ${cyclone.surgeHeightMeters}m. Mandatory evacuation is in effect. Move immediately to nearest reinforced storm shelter.`,
        distanceKm: estimatedDistanceKm,
        simulationHour,
        read: false,
        priority: "CRITICAL"
      };

      setMessages((prev) => [newMsg, ...prev]);
      setActiveUrgentAlert(newMsg);

      sendBrowserNotification(
        `🚨 CRITICAL: Cyclone within ${estimatedDistanceKm}km!`,
        `AI Agent Warning: ${cyclone.name} is now ${estimatedDistanceKm}km from ${cyclone.targetRegion}. Immediate shelter directive active.`
      );
    }
  }, [cyclone, simulationHour]);

  // Handle external search distance alert from Google Maps location search
  useEffect(() => {
    if (externalDistanceAlert && externalDistanceAlert.distanceKm <= 100) {
      const searchKey = `${externalDistanceAlert.locationName}-${externalDistanceAlert.distanceKm}`;
      if (!triggered100kmRef.current[searchKey]) {
        triggered100kmRef.current[searchKey] = true;

        const newMsg: AiAgentMessage = {
          id: `search-prox-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "PROXIMITY_100KM",
          title: `🚨 PROXIMITY ALERT: ${externalDistanceAlert.locationName} is ${externalDistanceAlert.distanceKm} km from 🌀 Eye!`,
          body: `AI Agent Proximity Assessment: The searched area (${externalDistanceAlert.locationName}) is within the high-risk zone (only ${externalDistanceAlert.distanceKm} km from ${cyclone.name}'s eye). Dangerous gale-force winds exceeding 64 knots and tidal storm surge are imminent. Proceed to the nearest designated civil shelter.`,
          distanceKm: externalDistanceAlert.distanceKm,
          simulationHour,
          read: false,
          priority: "CRITICAL"
        };

        setMessages((prev) => [newMsg, ...prev]);
        setActiveUrgentAlert(newMsg);

        sendBrowserNotification(
          `🚨 Alert for ${externalDistanceAlert.locationName}`,
          `Only ${externalDistanceAlert.distanceKm}km from ${cyclone.name}! Immediate safety measures required.`
        );
      }
    }
  }, [externalDistanceAlert, cyclone.name, simulationHour]);

  // Rule 2: Send notification for every 6 hours about the cyclone
  useEffect(() => {
    const isSixHourMark = simulationHour % 6 === 0;
    const sixHourKey = `${cyclone.id}-hour-${simulationHour}`;

    if (isSixHourMark && !triggered6hRef.current[sixHourKey]) {
      triggered6hRef.current[sixHourKey] = true;

      const newMsg: AiAgentMessage = {
        id: `bulletin-6h-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "SIX_HOUR_BULLETIN",
        title: `🔔 AI AGENT 6-HOURLY BULLETIN (T+${simulationHour}h Advisory)`,
        body: `6-Hourly Synoptic Bulletin for ${cyclone.name} (${cyclone.category}):\n• Eye Coordinates: ${cyclone.lat}°N, ${cyclone.lon}°E\n• Sustained Core Winds: ${cyclone.windSpeedKnots} knots (Gusts ${Math.round(cyclone.windSpeedKnots * 1.25)} kt)\n• Central Pressure: ${cyclone.pressureHpa} hPa\n• Landfall ETA: in ${Math.max(0, cyclone.hoursToLandfall - simulationHour)} hours near ${cyclone.targetRegion}.\nNext scheduled synoptic bulletin in 6 hours.`,
        simulationHour,
        read: false,
        priority: "HIGH"
      };

      setMessages((prev) => [newMsg, ...prev]);

      sendBrowserNotification(
        `🔔 6-Hourly Bulletin: ${cyclone.name} (T+${simulationHour}h)`,
        `Vmax: ${cyclone.windSpeedKnots}kt | Pressure: ${cyclone.pressureHpa}hPa | Landfall in ${Math.max(0, cyclone.hoursToLandfall - simulationHour)}h.`
      );
    }
  }, [simulationHour, cyclone]);

  // Countdown timer for next real-time 6-hour interval
  useEffect(() => {
    const timer = setInterval(() => {
      setNextBulletinCountdown((prev) => {
        if (prev <= 1) {
          triggerManual6HourBulletin();
          return 360; // reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cyclone, simulationHour]);

  // Manual trigger for 6-hourly bulletin
  const triggerManual6HourBulletin = () => {
    const hoursRemaining = Math.max(0, cyclone.hoursToLandfall - simulationHour);
    const newMsg: AiAgentMessage = {
      id: `bulletin-6h-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "SIX_HOUR_BULLETIN",
      title: `🔔 AI AGENT 6-HOURLY BULLETIN: ${cyclone.name}`,
      body: `Regular 6-Hourly Meteorological Advisory:\n• Storm: ${cyclone.name} (${cyclone.category})\n• Coordinates: ${cyclone.lat}°N, ${cyclone.lon}°E\n• Max Winds: ${cyclone.windSpeedKnots} kt | Pressure: ${cyclone.pressureHpa} hPa\n• Coastal Target: ${cyclone.targetRegion}\n• Landfall in ${hoursRemaining} hours.\nAll civil defense units on heightened alert.`,
      simulationHour,
      read: false,
      priority: "HIGH"
    };

    setMessages((prev) => [newMsg, ...prev]);

    sendBrowserNotification(
      `🔔 6-Hourly Bulletin: ${cyclone.name}`,
      `Winds: ${cyclone.windSpeedKnots}kt | Landfall in ${hoursRemaining}h near ${cyclone.targetRegion}.`
    );
  };

  // Manual trigger for <= 100km proximity alert test
  const triggerSimulated100kmAlert = (forcedDistance = 78) => {
    const newMsg: AiAgentMessage = {
      id: `proximity-sim-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "PROXIMITY_100KM",
      title: `🚨 CRITICAL: Cyclone ${cyclone.name} is ${forcedDistance} km from Coast (<=100km Threshold)!`,
      body: `AI Emergency Agent Directive: Cyclone ${cyclone.name} (${cyclone.category}) is now within ${forcedDistance} km of ${cyclone.targetRegion} (exceeding the critical 100km hazard threshold). Sustained winds: ${cyclone.windSpeedKnots}kt (${Math.round(cyclone.windSpeedKnots * 1.852)} km/h), storm surge inundation: ${cyclone.surgeHeightMeters}m. Mandatory evacuation is active. Move to designated storm shelters immediately.`,
      distanceKm: forcedDistance,
      simulationHour,
      read: false,
      priority: "CRITICAL"
    };

    setMessages((prev) => [newMsg, ...prev]);
    setActiveUrgentAlert(newMsg);

    sendBrowserNotification(
      `🚨 CRITICAL: Cyclone within ${forcedDistance}km!`,
      `AI Agent Warning: ${cyclone.name} is now ${forcedDistance}km from ${cyclone.targetRegion}. Immediate shelter directive active.`
    );
  };

  const handleVoiceAnnouncement = (text: string) => {
    if (isSpeaking) {
      stopAllEmergencyAudio();
      setIsSpeaking(false);
    } else {
      speakSingleVoiceBrowser(
        text,
        "English",
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  return (
    <>
      {/* 1. TOP FLOATING NOTIFICATION LAUNCHER & 6-HOUR TIMER BANNER */}
      <div className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 hover:text-white hover:bg-cyan-500/40 transition cursor-pointer shadow-md"
              title="Open AI Agent Messages & Bulletins"
            >
              <Bell className="w-4 h-4 animate-swing" />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold flex items-center justify-center border-2 border-slate-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                AI AGENT REAL-TIME DISPATCH ENGINE
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Auto-dispatches messages at <strong className="text-red-400">&le;100km proximity</strong> &amp; <strong className="text-cyan-300">every 6 hours</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Next 6-hour bulletin ticker */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-slate-400">6H BULLETIN IN:</span>
            <span className="text-[11px] font-bold text-cyan-300">{formatCountdown(nextBulletinCountdown)}</span>
          </div>

          <button
            onClick={() => triggerSimulated100kmAlert(68)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 hover:text-white transition font-bold text-[11px] cursor-pointer shadow-sm"
            title="Test AI agent directive triggered when cyclone is <= 100km from coast"
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>Test &le;100km Alert</span>
          </button>

          <button
            onClick={triggerManual6HourBulletin}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white transition font-bold text-[11px] cursor-pointer"
            title="Dispatch 6-hourly cyclone meteorological bulletin now"
          >
            <Send className="w-3 h-3" />
            <span>Send 6h Bulletin</span>
          </button>

          {!notificationsEnabled && (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-[11px] transition cursor-pointer"
              title="Enable OS Desktop Notifications"
            >
              <Bell className="w-3 h-3" />
              <span>Allow Desktop Alerts</span>
            </button>
          )}

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-[11px] transition shadow-md cursor-pointer"
          >
            <span>Messages ({messages.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. URGENT POPUP MODAL WHEN CYCLONE IS <= 100KM */}
      {activeUrgentAlert && (
        <div className="fixed inset-0 z-[9999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 animate-pulse">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-red-500 text-slate-950">
                      AI AGENT CRITICAL DIRECTIVE
                    </span>
                    <span className="text-xs font-mono text-red-400 font-bold">&le; 100KM THRESHOLD</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1">
                    {activeUrgentAlert.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveUrgentAlert(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/80 border border-red-500/30 rounded-xl p-3.5 font-mono text-xs text-slate-200 leading-relaxed space-y-2">
              <p>{activeUrgentAlert.body}</p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">DISTANCE</span>
                  <strong className="text-red-400 text-sm">{activeUrgentAlert.distanceKm} km</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">WINDS</span>
                  <strong className="text-cyan-300 text-sm">{cyclone.windSpeedKnots} kt</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SURGE</span>
                  <strong className="text-amber-300 text-sm">{cyclone.surgeHeightMeters}m</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                onClick={() => handleVoiceAnnouncement(activeUrgentAlert.body)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  isSpeaking
                    ? "bg-amber-600 text-white border-amber-400 animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/40"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>🔊 Listen (Single Voice)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveUrgentAlert(null);
                    onNavigateToTab("evacuation");
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  View Safe Shelters →
                </button>
                <button
                  onClick={() => setActiveUrgentAlert(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. AI AGENT MESSAGES DRAWER / HISTORY */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[9999999] bg-slate-950/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-4 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Agent Message Log</h3>
                  <p className="text-[11px] text-slate-400">Proximity (&le;100km) &amp; 6-Hourly Bulletins</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  No notifications dispatched yet. Bulletins are sent every 6 hours and whenever the cyclone is &le; 100km.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl border text-xs font-mono space-y-2 transition ${
                      msg.type === "PROXIMITY_100KM"
                        ? "bg-red-950/50 border-red-500/50 text-red-100"
                        : "bg-slate-950/80 border-cyan-500/30 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold flex items-center gap-1">
                        {msg.type === "PROXIMITY_100KM" ? "🚨 PROXIMITY ALERT" : "🔔 6-HOURLY BULLETIN"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-white text-xs">{msg.title}</h4>
                    <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">{msg.body}</p>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleVoiceAnnouncement(msg.body)}
                        className="flex items-center gap-1 text-[10px] text-cyan-300 hover:text-white cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Voice Broadcast</span>
                      </button>
                      {msg.type === "PROXIMITY_100KM" && (
                        <button
                          onClick={() => {
                            setIsDrawerOpen(false);
                            onNavigateToTab("evacuation");
                          }}
                          className="text-[10px] text-emerald-400 hover:underline font-bold"
                        >
                          View Shelters →
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={triggerManual6HourBulletin}
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Send 6-Hourly Bulletin Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
