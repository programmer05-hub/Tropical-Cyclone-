// Unified Audio & Speech Synthesis Controller
// Enforces strictly SINGLE voice playback across the entire application.

let activeAudioElement: HTMLAudioElement | null = null;
let isSpeakingUtterance = false;
let pendingSpeakTimeout: any = null;

export const stopAllEmergencyAudio = () => {
  if (pendingSpeakTimeout) {
    clearTimeout(pendingSpeakTimeout);
    pendingSpeakTimeout = null;
  }

  // 1. Cancel browser speech synthesis
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Speech synthesis cancel warning:", e);
    }
  }

  // 2. Pause and reset active HTMLAudioElement
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = "";
    } catch (e) {
      console.warn("Audio element stop warning:", e);
    }
    activeAudioElement = null;
  }

  isSpeakingUtterance = false;
};

export const playSingleVoiceAudio = (
  audioSrc: string,
  onStart?: () => void,
  onEnd?: () => void
): HTMLAudioElement => {
  // Stop ANY ongoing voice announcement immediately before starting
  stopAllEmergencyAudio();

  const audio = new Audio(audioSrc);
  activeAudioElement = audio;

  audio.onplay = () => {
    onStart?.();
  };

  audio.onended = () => {
    if (activeAudioElement === audio) {
      activeAudioElement = null;
    }
    onEnd?.();
  };

  audio.onerror = () => {
    if (activeAudioElement === audio) {
      activeAudioElement = null;
    }
    onEnd?.();
  };

  audio.play().catch((err) => {
    console.warn("Audio playback interrupted or blocked:", err);
    onEnd?.();
  });

  return audio;
};

export const speakSingleVoiceBrowser = (
  text: string,
  lang: string = "English",
  onStart?: () => void,
  onEnd?: () => void
) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported on this device.");
    return;
  }

  // Stop ALL previous audio and speech synthesis to prevent multiple voices announcing
  stopAllEmergencyAudio();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  if (lang === "Spanish") utterance.lang = "es-ES";
  else if (lang === "Hindi") utterance.lang = "hi-IN";
  else if (lang === "Tamil") utterance.lang = "ta-IN";
  else if (lang === "Bengali") utterance.lang = "bn-IN";
  else if (lang === "Odia") utterance.lang = "or-IN";
  else utterance.lang = "en-US";

  // Select appropriate voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const matchedVoice = voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  utterance.onstart = () => {
    isSpeakingUtterance = true;
    onStart?.();
  };

  utterance.onend = () => {
    isSpeakingUtterance = false;
    onEnd?.();
  };

  utterance.onerror = () => {
    isSpeakingUtterance = false;
    onEnd?.();
  };

  // Safe timeout after cancel to allow browser audio pipeline to fully clear before speaking
  pendingSpeakTimeout = setTimeout(() => {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      isSpeakingUtterance = false;
      onEnd?.();
    }
  }, 60);
};

