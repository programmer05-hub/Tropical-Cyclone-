import React, { useState } from "react";
import {
  Radio,
  Send,
  Volume2,
  VolumeX,
  Smartphone,
  ShieldAlert,
  Users,
  Anchor,
  Hospital,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle,
  FileText,
  AlertOctagon,
  LifeBuoy,
  Info
} from "lucide-react";
import { CycloneData, ResidentSOS, AlertBroadcast } from "../types";
import { INITIAL_SOS_PINGS } from "../data/cycloneData";
import {
  playSingleVoiceAudio,
  speakSingleVoiceBrowser,
  stopAllEmergencyAudio
} from "../utils/audioManager";
import { AiAgentNotificationSystem } from "./AiAgentNotificationSystem";

interface EmergencyAlertSystemProps {
  cyclone: CycloneData;
  simulationHour?: number;
  onNavigateToTab?: (tab: "dashboard" | "evacuation" | "alerts" | "search" | "satellite" | "gmaps") => void;
  externalDistanceAlert?: { locationName: string; distanceKm: number } | null;
}

export const EmergencyAlertSystem: React.FC<EmergencyAlertSystemProps> = ({
  cyclone,
  simulationHour = 0,
  onNavigateToTab = () => {},
  externalDistanceAlert = null
}) => {
  const [selectedAudience, setSelectedAudience] = useState<
    "Local Coastal Residents" | "Emergency First Responders" | "Maritime Fishermen & Trawlers" | "Hospital Networks"
  >("Local Coastal Residents");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [selectedVoice, setSelectedVoice] = useState<string>("Kore");
  const [urgency, setUrgency] = useState<"IMMEDIATE_ACTION" | "FLASH_WARNING" | "ADVISORY">("IMMEDIATE_ACTION");
  const [loadingAi, setLoadingAi] = useState(false);
  const [generatedAlert, setGeneratedAlert] = useState<any | null>(null);

  // AI Multilingual Audio Alert Synthesis State
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioObj, setCurrentAudioObj] = useState<HTMLAudioElement | null>(null);
  const [audioAnnouncementText, setAudioAnnouncementText] = useState<string>("");

  // Audio siren playback using Web Audio API
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // SOS Distress list state
  const [sosPings, setSosPings] = useState<ResidentSOS[]>(INITIAL_SOS_PINGS);
  const [newSosModal, setNewSosModal] = useState(false);
  const [newSosCitizen, setNewSosCitizen] = useState("");
  const [newSosSector, setNewSosSector] = useState(cyclone.coastalSectors[0]?.name || "Sector Alpha");
  const [newSosCount, setNewSosCount] = useState(4);
  const [newSosDetails, setNewSosDetails] = useState("");

  // Broadcast History list
  const [broadcastLog, setBroadcastLog] = useState<AlertBroadcast[]>([
    {
      id: "bc-1",
      timestamp: "18 mins ago",
      channel: "SMS_CELL_BROADCAST",
      audience: "COASTAL_RESIDENTS",
      headline: `Cat ${cyclone.category} Cyclone ${cyclone.name} Mandatory Evacuation`,
      content: `EMERGENCY ALERT: Cyclone ${cyclone.name} landfall in 16 hrs. Evacuate Red Zone now to designated safe shelters. Helpline: 112.`,
      status: "TRANSMITTED",
      language: "English",
      recipientsCount: 420000
    },
    {
      id: "bc-2",
      timestamp: "32 mins ago",
      channel: "MARINE_VHF",
      audience: "MARITIME_VESSELS",
      headline: "VHF Marine CH-16 Urgent Weather Warning",
      content: "All fishing vessels, trawlers, and small craft return to harbour immediately. Sea condition high to phenomenal with 4.8m surge.",
      status: "TRANSMITTED",
      language: "English",
      recipientsCount: 1850
    }
  ]);

  // Handle Web Audio API siren
  const toggleSirenAudio = () => {
    if (isPlayingSiren) {
      if (audioCtx) {
        audioCtx.close();
        setAudioCtx(null);
      }
      setIsPlayingSiren(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, ctx.currentTime);

        // Siren frequency modulation (wailing 440Hz -> 880Hz)
        const now = ctx.currentTime;
        for (let i = 0; i < 15; i++) {
          osc.frequency.linearRampToValueAtTime(880, now + i * 1.5 + 0.75);
          osc.frequency.linearRampToValueAtTime(440, now + i * 1.5 + 1.5);
        }

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        setAudioCtx(ctx);
        setIsPlayingSiren(true);
      } catch (err) {
        console.error("Audio error:", err);
      }
    }
  };

  // Generate AI Alert Broadcast via Gemini
  const generateAlertWithAi = async () => {
    setLoadingAi(true);
    const fallbackAlert = {
      headline: `EXTREME CYCLONE ALERT: Cyclone ${cyclone?.name || "Storm"} Approaching Coastline`,
      smsText: `URGENT: Cat ${cyclone?.category || "4"} Cyclone ${cyclone?.name || "Storm"} approaching ${cyclone?.targetRegion || "Coast"}. Evacuate Red Zone now to designated safe shelters. Dial 112 for rescue.`,
      sirenAcousticScript: `[ATTENTION] This is an emergency broadcast. Cyclone ${cyclone?.name || "Storm"} landfall imminent. Move inland immediately to designated cyclone shelters. Do not approach beaches or rivers.`,
      capProtocolData: {
        identifier: `CYCLOSHIELD-${Date.now()}`,
        sender: "National Cyclone Disaster Management Authority",
        status: "Actual",
        msgType: "Alert",
        scope: "Public",
        urgency: urgency,
        severity: "Extreme",
        certainty: "Observed",
        event: "Tropical Cyclone Inundation & Gale Warning",
        headline: `Cat ${cyclone?.category || "4"} Cyclone Warning for ${cyclone?.targetRegion || "Coast"}`,
        instruction: "Move immediately to designated concrete storm shelters. Bring water, flashlight, and medications."
      },
      firstResponderDirectives: [
        "Establish forward Incident Command Post at elevated Regional Stadium.",
        "Pre-position 24 motor inflatable boats and swift-water rescue teams at Sectors Alpha and Bravo.",
        "Clear debris removal earthmovers along Corridor Alpha every 5km."
      ]
    };

    try {
      const res = await fetch("/api/cyclone/broadcast-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cyclone,
          audience: selectedAudience,
          language: selectedLanguage,
          urgency
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.headline) {
          setGeneratedAlert(data);
          return;
        }
      }
      setGeneratedAlert(fallbackAlert);
    } catch (_err) {
      setGeneratedAlert(fallbackAlert);
    } finally {
      setLoadingAi(false);
    }
  };

  // Generate AI Voice Audio Alert Announcement File
  const generateAudioAlert = async () => {
    setIsGeneratingAudio(true);
    const textToSpeak =
      generatedAlert?.sirenAcousticScript ||
      `Attention. This is an urgent emergency broadcast from the National Cyclone Disaster Management Authority. Cyclone ${cyclone.name}, ${cyclone.category}, is advancing toward ${cyclone.targetRegion} with sustained winds of ${cyclone.windSpeedKnots} knots and a peak storm surge of ${cyclone.surgeHeightMeters} meters. Mandatory evacuation is ordered for all coastal red zone communities. Move immediately to certified concrete storm havens. Dial 112 for rescue.`;

    setAudioAnnouncementText(textToSpeak);

    try {
      const res = await fetch("/api/cyclone/synthesize-audio-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          language: selectedLanguage,
          voiceName: selectedVoice
        })
      });

      const data = await res.json();

      if (data.audioBase64) {
        const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
        setAudioBase64(data.audioBase64);
        setAudioUrl(audioSrc);

        // Play strictly single voice without allowing overlapping voices
        const audio = playSingleVoiceAudio(
          audioSrc,
          () => setIsPlayingAudio(true),
          () => setIsPlayingAudio(false)
        );
        setCurrentAudioObj(audio);
      } else {
        // Fallback: Web Speech API synthesis with single voice guarantee
        speakWithBrowserSpeech(textToSpeak, selectedLanguage);
      }
    } catch (err) {
      console.error("Audio generation failed:", err);
      speakWithBrowserSpeech(textToSpeak, selectedLanguage);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const speakWithBrowserSpeech = (text: string, lang: string) => {
    speakSingleVoiceBrowser(
      text,
      lang,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      // Immediate clean stop of all voices
      stopAllEmergencyAudio();
      setIsPlayingAudio(false);
    } else {
      if (audioUrl) {
        const audio = playSingleVoiceAudio(
          audioUrl,
          () => setIsPlayingAudio(true),
          () => setIsPlayingAudio(false)
        );
        setCurrentAudioObj(audio);
      } else if (audioAnnouncementText) {
        speakWithBrowserSpeech(audioAnnouncementText, selectedLanguage);
      }
    }
  };

  const downloadAudioAlertFile = () => {
    if (!audioBase64) return;
    const link = document.createElement("a");
    link.href = `data:audio/wav;base64,${audioBase64}`;
    link.download = `cyclone-emergency-broadcast-${cyclone.name.toLowerCase().replace(/\s+/g, "-")}.wav`;
    link.click();
  };
  const transmitAlert = () => {
    if (!generatedAlert) return;

    const newLogItem: AlertBroadcast = {
      id: `bc-${Date.now()}`,
      timestamp: "Just now",
      channel: "SMS_CELL_BROADCAST",
      audience: selectedAudience === "Local Coastal Residents" ? "COASTAL_RESIDENTS" : "FIRST_RESPONDERS",
      headline: generatedAlert.headline,
      content: generatedAlert.smsText,
      status: "TRANSMITTED",
      language: selectedLanguage,
      recipientsCount: 380000
    };

    setBroadcastLog([newLogItem, ...broadcastLog]);
  };

  // Dispatch S&R Team to SOS Ping
  const dispatchRescueTeam = (id: string) => {
    setSosPings((prev) =>
      prev.map((ping) => (ping.id === id ? { ...ping, dispatched: true } : ping))
    );
  };

  // Add citizen SOS
  const submitCitizenSos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSosCitizen || !newSosDetails) return;
    const newPing: ResidentSOS = {
      id: `sos-${Date.now()}`,
      timestamp: "Just now",
      citizenName: newSosCitizen,
      sector: newSosSector,
      peopleCount: newSosCount,
      situation: newSosDetails,
      urgency: "CRITICAL",
      contact: "Cell / Verified In-App",
      dispatched: false
    };
    setSosPings([newPing, ...sosPings]);
    setNewSosCitizen("");
    setNewSosDetails("");
    setNewSosModal(false);
  };

  return (
    <div className="space-y-6">
      {/* PRESET AI AGENT REAL-TIME DISPATCH ENGINE (Exclusively in Alerts & SOS Pings Tab) */}
      <AiAgentNotificationSystem
        cyclone={cyclone}
        simulationHour={simulationHour}
        onNavigateToTab={onNavigateToTab}
        externalDistanceAlert={externalDistanceAlert}
      />

      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              MULTI-CHANNEL EMERGENCY NOTIFICATION & DISPATCH CONSOLE
            </h2>
            <p className="text-xs text-slate-400">
              Cell Broadcast (SMS) • Common Alerting Protocol (CAP) • Acoustic Siren • First Responder C2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSirenAudio}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition border ${
              isPlayingSiren
                ? "bg-red-500 text-white border-red-400 animate-pulse"
                : "bg-slate-950 text-slate-300 border-slate-700 hover:border-red-400 hover:text-red-300"
            }`}
          >
            {isPlayingSiren ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingSiren ? "Mute Siren Test" : "Test Acoustic Siren"}</span>
          </button>
        </div>
      </div>

      {/* Broadcast Creation & Target Control Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Send className="w-4 h-4 text-cyan-400" />
            <span>AI EMERGENCY ALERT GENERATOR & BROADCASTER</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
            {/* Audience Picker */}
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value as any)}
              className="bg-slate-950 text-cyan-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none font-mono text-xs w-full sm:w-auto"
            >
              <option value="Local Coastal Residents">Audience: Coastal Residents</option>
              <option value="Emergency First Responders">Audience: First Responders (NDRF / Police)</option>
              <option value="Maritime Fishermen & Trawlers">Audience: Maritime & Trawlers</option>
              <option value="Hospital Networks">Audience: Hospital & Trauma Centers</option>
            </select>

            {/* Language Picker */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 text-cyan-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none font-mono text-xs w-full sm:w-auto"
            >
              <option value="English">Language: English</option>
              <option value="Odia">Language: Odia (Local)</option>
              <option value="Hindi">Language: Hindi</option>
              <option value="Bengali">Language: Bengali</option>
              <option value="Tamil">Language: Tamil</option>
              <option value="Spanish">Language: Spanish</option>
              <option value="Tagalog">Language: Tagalog</option>
            </select>

            {/* Voice Actor Picker */}
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-slate-950 text-purple-300 px-2.5 py-1.5 rounded-lg border border-purple-500/40 focus:outline-none font-mono text-xs w-full sm:w-auto"
            >
              <option value="Kore">Voice: Kore (Urgent Anchor)</option>
              <option value="Puck">Voice: Puck (Clear Dispatcher)</option>
              <option value="Fenrir">Voice: Fenrir (Command Authority)</option>
              <option value="Zephyr">Voice: Zephyr (Calm Official)</option>
            </select>

            {/* Generate Alert Text Button */}
            <button
              onClick={generateAlertWithAi}
              disabled={loadingAi}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer w-full sm:w-auto"
            >
              {loadingAi ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              )}
              <span>Generate AI Alert</span>
            </button>

            {/* Dedicated Generate Audio Alert Button */}
            <button
              onClick={generateAudioAlert}
              disabled={isGeneratingAudio}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition disabled:opacity-60 cursor-pointer w-full sm:w-auto"
            >
              {isGeneratingAudio ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white" />
              )}
              <span>{isGeneratingAudio ? "Synthesizing Audio..." : "Generate Audio Alert"}</span>
            </button>
          </div>
        </div>

        {/* AI Voice Announcement Player Banner */}
        {(audioUrl || audioAnnouncementText || isPlayingAudio) && (
          <div className="bg-gradient-to-r from-purple-950/60 via-slate-950 to-slate-950 border border-purple-500/40 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Volume2 className={`w-5 h-5 ${isPlayingAudio ? "animate-bounce text-purple-400" : ""}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-xs font-mono">
                    AI MULTILINGUAL EMERGENCY VOICE BROADCAST
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    {selectedLanguage} • Voice: {selectedVoice}
                  </span>
                  {isPlayingAudio && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      ON AIR
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 max-w-2xl line-clamp-2">
                  "{audioAnnouncementText || generatedAlert?.sirenAcousticScript}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayAudio}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? "Pause Audio" : "Play Announcement"}</span>
              </button>

              {audioBase64 && (
                <button
                  onClick={downloadAudioAlertFile}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Download .wav</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Live Generated Alert Preview Display */}
        {generatedAlert ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            {/* SMS Cell Broadcast View (Simulated Mobile Device) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-red-500/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-red-400 mb-2 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    CELL BROADCAST SMS (MAX 160 CHARS)
                  </span>
                  <span>{generatedAlert.smsText?.length || 0}/160</span>
                </div>
                <div className="bg-red-950/40 border border-red-500/40 p-3 rounded-lg text-xs text-red-100 font-mono leading-relaxed">
                  {generatedAlert.smsText}
                </div>
                <div className="mt-3 text-[11px] text-slate-400 font-mono">
                  Target Language: <strong className="text-cyan-300">{selectedLanguage}</strong>
                </div>
              </div>

              <button
                onClick={transmitAlert}
                className="mt-4 w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Cell Broadcast (All Towers)</span>
              </button>
            </div>

            {/* Acoustic Siren & PA Loudspeaker Script */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 mb-2 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4" />
                    ACOUSTIC LOUDSPEAKER & SIREN SCRIPT
                  </span>
                  <span>MEGAPHONE VANS</span>
                </div>
                <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-lg text-xs text-amber-100 font-sans leading-relaxed">
                  "{generatedAlert.sirenAcousticScript}"
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Automated TTS: ENABLED</span>
                <span className="text-emerald-400 font-bold">142 Sirens Synced</span>
              </div>
            </div>

            {/* CAP XML/JSON Protocol & Responder Directives */}
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    FIRST RESPONDER DEPLOYMENT DIRECTIVES
                  </span>
                  <span>TACTICAL</span>
                </div>
                <div className="space-y-1.5">
                  {generatedAlert.firstResponderDirectives?.map((dir: string, idx: number) => (
                    <div key={idx} className="bg-cyan-950/30 border border-cyan-500/30 p-2 rounded text-[11px] text-cyan-200">
                      • {dir}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 text-[10px] font-mono text-slate-400">
                CAP Identifier: <span className="text-slate-300">{generatedAlert.capProtocolData?.identifier || "CYCLOSHIELD-LIVE"}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-center">
            <Radio className="w-8 h-8 text-cyan-500 mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-slate-300 font-medium">
              Select target audience, localized dialect, and click "Generate AI Alert" to compose tailored emergency bulletins.
            </p>
          </div>
        )}
      </div>

      {/* Incoming Resident SOS Distress Ping Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-400 animate-bounce" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              LIVE RESIDENT DISTRESS SOS INBOX & DISPATCH BOARD
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
              PRIVACY SAFE • MASKED CONTACTS
            </span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-mono font-bold">
              {sosPings.filter((p) => !p.dispatched).length} UNRESOLVED CALLS
            </span>
          </div>

          <button
            onClick={() => setNewSosModal(true)}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ml-auto sm:ml-0"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Simulate Citizen SOS Ping</span>
          </button>
        </div>

        {/* Privacy & Synthetic Data Explanation Box */}
        <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold font-mono text-cyan-300">PRIVACY VERIFICATION:</span>{" "}
            Phone numbers shown below (e.g. <span className="font-mono text-amber-300">+91-94371-XXXXX</span>, <span className="font-mono text-amber-300">+91-98610-XXXXX</span>) are <strong>non-real synthetic demonstration records</strong> created for disaster management training and emergency dispatch rehearsals. No real person's phone number or private personal data is collected or exposed.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sosPings.map((ping) => (
            <div
              key={ping.id}
              className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                ping.dispatched
                  ? "bg-slate-950/60 border-slate-800 opacity-75"
                  : "bg-red-950/20 border-red-500/40 shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ping.citizenName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300">
                      {ping.peopleCount} People
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{ping.timestamp}</span>
                </div>

                <div className="text-xs text-amber-300 font-mono font-semibold mb-1">
                  Sector: {ping.sector}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  {ping.situation}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-400">Contact: {ping.contact}</span>

                {ping.dispatched ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Amphibious S&R En Route
                  </span>
                ) : (
                  <button
                    onClick={() => dispatchRescueTeam(ping.id)}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Dispatch Rescue Unit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen Disaster Preparation Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>LOCAL RESIDENT ACTION & HURRICANE GO-BAG CHECKLIST</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 font-mono">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold block">1. Potable Water & Rations</span>
            <div>• 4 Liters drinking water per person/day for 5 days.</div>
            <div>• Ready-to-eat dry rations, ORS rehydration salts.</div>
            <div>• Baby formula and critical pet food supplies.</div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="text-amber-400 font-bold block">2. Power & Communications</span>
            <div>• Pre-charge 2x mobile battery power banks.</div>
            <div>• Hand-crank or battery emergency AM/FM/VHF radio.</div>
            <div>• Waterproof LED flashlights + extra D/AA batteries.</div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold block">3. Personal & Structural Safety</span>
            <div>• Double ziplock seal on ID, land deeds & medical scripts.</div>
            <div>• Board up coastal glass windows with 5/8" plywood.</div>
            <div>• Move to certified concrete cyclone shelter before gale arrival.</div>
          </div>
        </div>
      </div>

      {/* Modal for adding simulated citizen SOS */}
      {newSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white">Simulate Citizen Distress SOS</h4>
              <button
                onClick={() => setNewSosModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitCitizenSos} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Citizen / Group Contact Name</label>
                <input
                  type="text"
                  value={newSosCitizen}
                  onChange={(e) => setNewSosCitizen(e.target.value)}
                  placeholder="e.g. Maya Devi (Fisherfolk Union)"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Target Coastal Sector</label>
                <select
                  value={newSosSector}
                  onChange={(e) => setNewSosSector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  {cyclone.coastalSectors.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Number of Trapped / At-Risk Individuals</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={newSosCount}
                  onChange={(e) => setNewSosCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Situation Description</label>
                <textarea
                  rows={3}
                  value={newSosDetails}
                  onChange={(e) => setNewSosDetails(e.target.value)}
                  placeholder="e.g. Surge broke saline embankment, 12 elders stranded on temple terrace..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewSosModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Broadcast SOS Ping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
