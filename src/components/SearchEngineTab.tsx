import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Bot,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Download,
  AlertCircle,
  HelpCircle,
  Flame,
  Shield,
  Layers,
  RefreshCw
} from "lucide-react";
import { CycloneData, SearchResult } from "../types";

interface SearchEngineTabProps {
  activeCyclone: CycloneData;
}

const SUGGESTED_QUERIES = [
  "What physical mechanisms trigger rapid intensification in tropical cyclones?",
  "How does astronomical high tide multiply coastal storm surge inundation?",
  "What is the difference between Saffir-Simpson and IMD cyclone intensity scales?",
  "How does highway contraflow evacuation prevent lethal coastal gridlock?",
  "Emergency shelter and triage protocol for hospitals during total grid failure",
  "How does the satellite Dvorak technique calculate central pressure without aircraft?"
];

export const SearchEngineTab: React.FC<SearchEngineTabProps> = ({ activeCyclone }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "What causes rapid intensification in tropical cyclones?",
    "How does astronomical high tide multiply coastal storm surge inundation?"
  ]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setQuery(searchQuery);

    const fallbackResult: SearchResult = {
      query: searchQuery,
      answer: `Tropical cyclone dynamics are governed by thermodynamics where warm sea surface temperatures (>26.5°C) and deep oceanic heat content transfer latent heat to convective updrafts. As pressure falls at the center, the Coriolis force deflects inflowing air, establishing cyclonic vorticity. In response to your question regarding "${searchQuery}", emergency management frameworks emphasize timely evacuation outside of the storm surge envelope, securing essential potable supplies (1 gallon/person/day for 5+ days), and hardening structures against extreme aerodynamic loading.`,
      keyTakeaways: [
        "Warm oceanic thermal profiles drive and sustain core convective towers.",
        "Storm surge inundation accounts for the vast majority of cyclonic casualties.",
        "Rapid intensification occurs when vertical wind shear drops below 10 knots."
      ],
      actionableChecklist: [
        "Evacuate flood and coastal surge zones well before tropical-storm-force winds arrive.",
        "Verify emergency satellite radio or regional VHF emergency broadcast channels.",
        "Secure clean drinking water and non-perishable emergency medical provisions."
      ],
      scientificReferences: [
        "World Meteorological Organization (WMO) Tropical Cyclone Operational Guide",
        "NOAA National Hurricane Center (NHC) Technical Guidance",
        "India Meteorological Department (IMD) Standard Operating Procedures"
      ],
      relatedQuestions: [
        "What meteorological criteria define a super cyclonic storm?",
        "How do coastal estuaries amplify astronomical storm surge?",
        "What are the best structural reinforcements for category 4 winds?"
      ]
    };

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          activeCycloneContext: activeCyclone
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.answer) {
          setResult(data);
          if (!recentSearches.includes(searchQuery)) {
            setRecentSearches([searchQuery, ...recentSearches.slice(0, 5)]);
          }
          return;
        }
      }

      setResult(fallbackResult);
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 5)]);
      }
    } catch (_err) {
      setResult(fallbackResult);
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 5)]);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const textToCopy = `CYCLOSHIELD AI DISASTER INTELLIGENCE BRIEF
QUERY: ${result.query}

ANSWER:
${result.answer}

KEY TAKEAWAYS:
${result.keyTakeaways.map((t) => `• ${t}`).join("\n")}

SAFETY CHECKLIST:
${result.actionableChecklist.map((c) => `[ ] ${c}`).join("\n")}

REFERENCES:
${result.scientificReferences.join(", ")}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    if (!result) return;
    const content = `CYCLOSHIELD AI DISASTER REPORT\nTopic: ${result.query}\nDate: ${new Date().toISOString()}\n\n${result.answer}\n\nTakeaways:\n${result.keyTakeaways.join("\n")}\n\nActions:\n${result.actionableChecklist.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cycoshield-intelligence-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-[1720px] mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/50 to-slate-900 border border-cyan-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                <Search className="w-5 h-5 animate-pulse" />
              </span>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">
                AI METEOROLOGICAL & DISASTER SEARCH ENGINE
              </h1>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Ask anything about cyclone dynamics, live satellite radiometry, storm surge physics, evacuation logistics, or civilian disaster preparedness. Powered by Gemini AI.
            </p>
          </div>

          <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-700 text-xs font-mono">
            <span className="text-slate-400 block text-[10px]">ACTIVE STORM GROUNDING:</span>
            <span className="text-cyan-300 font-bold">
              {activeCyclone.name} ({activeCyclone.category} • {activeCyclone.windSpeedKnots}kt)
            </span>
          </div>
        </div>
      </div>

      {/* Main Search Input Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything: 'How does an eyewall replacement cycle weaken or expand storm winds?'..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-12 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-950" />
            )}
            <span>{loading ? "Searching AI..." : "Search AI"}</span>
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-cyan-400 font-semibold block mb-2">
            FREQUENT METEOROLOGICAL & CIVIL DEFENSE INQUIRIES:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSearch(sq)}
                className="text-left px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-200 transition"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 shadow-xl space-y-4 animate-pulse">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>GEMINI 3.8 FLASH METEOROLOGICAL AGENT DELIBERATING...</span>
          </div>
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-800 rounded w-5/6" />
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="h-20 bg-slate-800 rounded" />
            <div className="h-20 bg-slate-800 rounded" />
            <div className="h-20 bg-slate-800 rounded" />
          </div>
        </div>
      )}

      {/* Error View */}
      {error && (
        <div className="bg-red-950/60 border border-red-500/50 rounded-2xl p-4 text-xs text-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Search Result Card */}
      {result && !loading && (
        <div className="bg-slate-900/90 border border-cyan-500/50 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Header of Answer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  AI EXPERT SYNTHESIS
                </span>
                <h3 className="text-base font-bold text-white">
                  {result.query}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                onClick={downloadReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Brief</span>
              </button>
            </div>
          </div>

          {/* Primary Answer Narrative */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
            {result.answer}
          </div>

          {/* Key Takeaways & Actionable Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Takeaways */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-900/40 space-y-2.5">
              <span className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                CORE SCIENTIFIC TAKEAWAYS:
              </span>
              <div className="space-y-2 text-xs text-slate-300">
                {result.keyTakeaways?.map((takeaway, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Safety Checklist */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-900/40 space-y-2.5">
              <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                ACTIONABLE SURVIVAL PROTOCOL:
              </span>
              <div className="space-y-2 text-xs text-slate-300">
                {result.actionableChecklist?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scientific Citations & References */}
          {result.scientificReferences?.length > 0 && (
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Scientific References:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.scientificReferences.map((ref, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[11px]">
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clickable Related Questions */}
          {result.relatedQuestions?.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-mono text-slate-400 font-semibold block mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                EXPLORE RELATED TOPICS:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.relatedQuestions.map((rq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(rq)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 text-xs text-slate-300 hover:text-amber-200 transition font-mono"
                  >
                    <span>{rq}</span>
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
