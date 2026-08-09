import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
type Phase = "boot" | "lock" | "desktop";
type ChatMessage = { role: "user" | "assistant"; content: string };
type WindowData = {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  x: number;
  y: number;
  zIndex: number;
  width?: number;
};

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeCtx = createContext({ isDark: false });
const useTheme = () => useContext(ThemeCtx);

// ─── Wallpapers ───────────────────────────────────────────────────────────────
const WALLPAPERS = [
  "linear-gradient(180deg,#ffc86b 0%,#ff8c42 8%,#e8503a 20%,#c8305a 32%,#a0267e 46%,#6e1a90 60%,#3e0d72 75%,#190540 90%,#080018 100%)",
  "linear-gradient(135deg,#0f2027 0%,#203a43 40%,#2c5364 70%,#1a4731 100%)",
  "linear-gradient(135deg,#0d0221 0%,#1a0533 30%,#0a1628 60%,#020b18 100%)",
  "linear-gradient(180deg,#1a6b8a 0%,#0e4d6e 30%,#083d5e 60%,#041f36 100%)",
  "linear-gradient(135deg,#1a2e1a 0%,#2d5a27 40%,#1e3b1e 70%,#0d1f0d 100%)",
  "linear-gradient(135deg,#b5838d 0%,#e5989b 30%,#ffb4a2 60%,#e8a87c 100%)",
];
const WALLPAPER_NAMES = ["Sunset","Aurora","Deep Space","Ocean","Forest","Rose Gold"];
const WALLPAPER_THUMBS = [
  "from-orange-400 to-purple-900",
  "from-teal-800 to-green-900",
  "from-purple-900 to-blue-950",
  "from-cyan-700 to-blue-950",
  "from-green-800 to-green-950",
  "from-pink-400 to-orange-300",
];
const MENUBAR_BG: Record<number, string> = {
  0: "rgba(232,22,138,0.95)",
  1: "rgba(44,83,100,0.95)",
  2: "rgba(26,5,51,0.95)",
  3: "rgba(14,77,110,0.95)",
  4: "rgba(45,90,39,0.95)",
  5: "rgba(181,131,141,0.95)",
};

// ─── Default windows factory ──────────────────────────────────────────────────
function makeDefaultWindows(): WindowData[] {
  return [
    { id: "about",    title: "About Me",                isOpen: false, isMinimized: false, x: 160, y: 60,  zIndex: 10 },
    { id: "projects", title: "Projects",                 isOpen: false, isMinimized: false, x: 200, y: 80,  zIndex: 11 },
    { id: "contact",  title: "Contact",                  isOpen: false, isMinimized: false, x: 240, y: 100, zIndex: 12 },
    { id: "terminal", title: "Terminal — udayraj@macbook",isOpen:false, isMinimized: false, x: 180, y: 70,  zIndex: 13 },
    { id: "finder",   title: "Finder",                   isOpen: false, isMinimized: false, x: 120, y: 55,  zIndex: 14 },
    { id: "safari",   title: "Safari",                   isOpen: false, isMinimized: false, x: 100, y: 50,  zIndex: 15, width: 600 },
    { id: "photos",   title: "Photos",                   isOpen: false, isMinimized: false, x: 220, y: 75,  zIndex: 16 },
    { id: "truck",    title: "🚛 Truck Game",             isOpen: false, isMinimized: false, x: 180, y: 60,  zIndex: 17 },
    { id: "downloads",title: "Downloads",                isOpen: false, isMinimized: false, x: 200, y: 80,  zIndex: 18 },
    { id: "launchpad",title: "Launchpad",                isOpen: false, isMinimized: false, x: 160, y: 70,  zIndex: 19 },
    { id: "resume",   title: "Resume — Udayraj Singh",   isOpen: false, isMinimized: false, x: 190, y: 65,  zIndex: 20 },
    { id: "calendar", title: "Calendar",                 isOpen: false, isMinimized: false, x: 210, y: 75,  zIndex: 21 },
    { id: "clock",    title: "Clock",                    isOpen: false, isMinimized: false, x: 230, y: 85,  zIndex: 22 },
    { id: "music",    title: "Music",                    isOpen: false, isMinimized: false, x: 140, y: 60,  zIndex: 23, width: 520 },
    { id: "chess",    title: "Chess",                    isOpen: false, isMinimized: false, x: 170, y: 65,  zIndex: 24 },
    { id: "duolingo", title: "Duolingo",                 isOpen: false, isMinimized: false, x: 190, y: 70,  zIndex: 25 },
    { id: "notes",    title: "Notes",                    isOpen: false, isMinimized: false, x: 210, y: 80,  zIndex: 26 },
    { id: "rubik",    title: "Rubik's Cube AI Coach",    isOpen: false, isMinimized: false, x: 200, y: 75,  zIndex: 27 },
  ];
}

// ─── AI Chatbot ───────────────────────────────────────────────────────────────
function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hey! 👋 I'm Udayraj Singh's AI assistant. Ask me anything about him — his skills, projects, or how to reach him!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops! Something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="absolute bottom-20 right-5 w-80 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 border border-white/20"
            style={{ background: "rgba(20,20,28,0.92)", backdropFilter: "blur(30px)", height: "420px" }}
          >
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/10 flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                <img src="/udayraj.jpg" alt="Udayraj" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold leading-tight">Ask Udayraj's AI</div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/40 text-[10px]">Online</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-white/30 hover:text-white/70 transition-colors text-lg leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.role === "user" ? "bg-[#e8168a] text-white rounded-br-sm" : "bg-white/10 text-white/90 rounded-bl-sm"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                    {[0,1,2].map((i) => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block" animate={{ opacity:[0.3,1,0.3] }} transition={{ repeat:Infinity, duration:1, delay:i*0.2 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="px-3 py-3 border-t border-white/10 flex-shrink-0 flex gap-2">
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder="Ask me anything…" className="flex-1 bg-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none placeholder-white/30 border border-white/10 focus:border-white/25 transition-colors" />
              <button onClick={sendMessage} disabled={!input.trim() || loading} className="w-8 h-8 rounded-xl bg-[#e8168a] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#c8108a] transition-colors flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setOpen((p) => !p)} className="absolute bottom-7 right-5 w-12 h-12 rounded-full flex items-center justify-center z-50 shadow-2xl border border-white/20" style={{ background: open ? "#e8168a" : "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)" }}>
        <span className="text-xl">{open ? "×" : "🤖"}</span>
      </motion.button>
    </>
  );
}

// ─── Apple Logo SVG ───────────────────────────────────────────────────────────
function AppleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [bootProgress, setBootProgress] = useState(0);
  const [time, setTime] = useState(new Date());
  const [showNotification, setShowNotification] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [wallpaperIdx, setWallpaperIdx] = useState(0);
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [currentSpace, setCurrentSpace] = useState(0);
  const [showSpaces, setShowSpaces] = useState(false);
  const [spacesWindows, setSpacesWindows] = useState<WindowData[][]>([
    makeDefaultWindows(), makeDefaultWindows(), makeDefaultWindows(),
    makeDefaultWindows(), makeDefaultWindows(),
  ]);
  // ── New feature state ───────────────────────────────────────────────────────
  const [battery, setBattery] = useState(() => 72 + Math.floor(Math.random() * 20));
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const [bouncingApp, setBouncingApp] = useState<string | null>(null);
  const [konamiActive, setKonamiActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const windows = spacesWindows[currentSpace];
  const setWindows = useCallback((updater: (prev: WindowData[]) => WindowData[]) => {
    setSpacesWindows((prev) => {
      const next = [...prev];
      next[currentSpace] = updater(prev[currentSpace]);
      return next;
    });
  }, [currentSpace]);

  // Boot progress bar — use ref to avoid side-effects inside state updaters
  const bootProgressRef = useRef(0);
  useEffect(() => {
    if (phase !== "boot") return;
    bootProgressRef.current = 0;
    setBootProgress(0);
    const interval = setInterval(() => {
      const p = bootProgressRef.current;
      const step = p < 70 ? 1.8 : p < 90 ? 0.8 : 0.3;
      const next = Math.min(100, p + step);
      bootProgressRef.current = next;
      setBootProgress(next);
      if (next >= 100) {
        clearInterval(interval);
        setTimeout(() => setPhase("lock"), 500);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (phase === "desktop") {
      const t = setTimeout(() => setShowNotification(true), 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        setWindows((prev) => {
          const open = prev.filter((w) => w.isOpen && !w.isMinimized);
          if (!open.length) return prev;
          const top = open.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
          return prev.map((w) => (w.id === top.id ? { ...w, isOpen: false } : w));
        });
      }
      // Ctrl+Left/Right to switch spaces
      if (e.ctrlKey && e.key === "ArrowLeft") setCurrentSpace((s) => Math.max(0, s - 1));
      if (e.ctrlKey && e.key === "ArrowRight") setCurrentSpace((s) => Math.min(spacesWindows.length - 1, s + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setWindows]);

  const openWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
      return prev.map((w) => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: maxZ + 1 } : w);
    });
    // Dock bounce
    setBouncingApp(id);
    setTimeout(() => setBouncingApp(null), 700);
  }, [setWindows]);

  const closeWindow = useCallback((id: string) => setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w))), [setWindows]);
  const minimizeWindow = useCallback((id: string) => setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))), [setWindows]);
  const bringToFront = useCallback((id: string) => setWindows((prev) => {
    const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
    return prev.map((w) => w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w);
  }), [setWindows]);
  const updatePos = useCallback((id: string, x: number, y: number) => setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w))), [setWindows]);

  // ── Battery drain (ticks every 45s, never below 15) ────────────────────────
  useEffect(() => {
    const t = setInterval(() => setBattery((b) => Math.max(15, b - 1)), 45000);
    return () => clearInterval(t);
  }, []);

  // ── Camera flicker on desktop entry ────────────────────────────────────────
  useEffect(() => {
    if (phase === "desktop") {
      setCameraActive(true);
      const t = setTimeout(() => setCameraActive(false), 2500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase]);

  // ── Deep-link: ?app=xxx opens that window on desktop entry ─────────────────
  useEffect(() => {
    if (phase !== "desktop") return;
    const params = new URLSearchParams(window.location.search);
    const app = params.get("app");
    if (app) setTimeout(() => openWindow(app), 400);
  }, [phase, openWindow]);

  // ── Konami code: ↑↑↓↓←→←→BA ───────────────────────────────────────────────
  useEffect(() => {
    const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === SEQ[idx]) { idx++; if (idx === SEQ.length) { setKonamiActive(true); idx = 0; } }
      else idx = e.key === SEQ[0] ? 1 : 0;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Spotlight: Cmd+Space ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "desktop") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === " ") { e.preventDefault(); setSpotlightOpen((o) => !o); setSpotlightQuery(""); }
      if (e.key === "Escape") { setSpotlightOpen(false); setSpotlightQuery(""); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const lockDate = time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const menuDate = `${time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ${time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;

  // ── Boot Screen ─────────────────────────────────────────────────────────────
  if (phase === "boot") {
    return (
      <div
        data-testid="boot-screen"
        className="w-screen h-screen bg-black flex items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => { setBootProgress(100); }}
      >
        <div className="absolute top-4 right-5 text-white/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.8 }} className="flex flex-col items-center gap-10">
          <div className="relative flex items-center justify-center">
            <motion.div className="absolute w-52 h-52 rounded-full bg-white/8 blur-3xl" animate={{ scale:[1,1.4,1], opacity:[0.4,0.1,0.4] }} transition={{ repeat:Infinity, duration:3.5, ease:"easeInOut" }} />
            <motion.div className="absolute w-32 h-32 rounded-full bg-white/20 blur-2xl" animate={{ scale:[1,1.2,1], opacity:[0.6,0.2,0.6] }} transition={{ repeat:Infinity, duration:3.5, ease:"easeInOut", delay:0.3 }} />
            <motion.div animate={{ scale:[1,1.04,1] }} transition={{ repeat:Infinity, duration:3.5, ease:"easeInOut" }} className="relative z-10">
              <AppleLogo className="w-24 h-24 text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.95)]" />
            </motion.div>
          </div>
          {/* Animated progress bar */}
          <div className="flex flex-col items-center gap-3 w-48">
            <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                animate={{ width: `${bootProgress}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </div>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }} className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-light">
              macOS Portfolio
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Lock Screen ─────────────────────────────────────────────────────────────
  if (phase === "lock") {
    return (
      <motion.div
        data-testid="lock-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-screen h-screen flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse 60% 70% at 15% 50%,#14453a 0%,transparent 60%),radial-gradient(ellipse 60% 70% at 85% 50%,#3d1230 0%,transparent 60%),#080810" }}
        onClick={() => setPhase("desktop")}
      >
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.7, ease:"easeOut" }} className="text-white font-thin tabular-nums" style={{ fontSize:"clamp(5rem,15vw,9rem)", lineHeight:1, letterSpacing:"-0.02em" }}>
          {hh}:{mm}
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45, duration:0.6, ease:"easeOut" }} className="text-white/75 text-lg font-light mt-2 mb-10">
          {lockDate}
        </motion.div>
        <motion.div initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.7, duration:0.5, type:"spring", stiffness:260, damping:20 }} className="flex flex-col items-center gap-2">
          <motion.div animate={{ y:[0,-6,0] }} transition={{ repeat:Infinity, duration:4, ease:"easeInOut", delay:1.2 }} className="w-20 h-20 rounded-full border-2 border-white/30 shadow-2xl overflow-hidden">
            <img src="/udayraj.jpg" alt="Udayraj" className="w-full h-full object-cover object-top" />
          </motion.div>
          <span className="text-white/90 text-sm font-medium">Udayraj</span>
          <span className="text-white/40 text-xs mt-1">Click anywhere to unlock</span>
        </motion.div>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.0, duration:0.6 }} className="absolute bottom-10 flex gap-10 text-white/50">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>
        </motion.div>
      </motion.div>
    );
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  const leftIcons = [
    { id:"finder-desk",   appId:"finder",   label:"Finder",    action:()=>openWindow("finder") },
    { id:"safari-desk",   appId:"safari",   label:"Safari",    action:()=>openWindow("safari") },
    { id:"terminal-desk", appId:"terminal", label:"Terminal",  action:()=>openWindow("terminal") },
    { id:"launchpad-desk",appId:"launchpad",label:"Launchpad", action:()=>openWindow("launchpad") },
    { id:"contact-desk",  appId:"contact",  label:"Contact",   action:()=>openWindow("contact") },
  ];
  const rightIcons = [
    { id:"truck-desk",  appId:"truck",    label:"Truck Game", action:()=>openWindow("truck") },
    { id:"photos-desk", appId:"photos",   label:"Photos",     action:()=>openWindow("photos") },
    { id:"about-desk",  appId:"about",    label:"About Me",   action:()=>openWindow("about") },
    { id:"resume-desk", appId:"resume",   label:"Resume",     action:()=>openWindow("resume") },
    { id:"music-desk",  appId:"music",    label:"Music",      action:()=>openWindow("music") },
  ];

  const dockItems = [
    { id:"finder",   appId:"finder",   label:"Finder" },
    { id:"safari",   appId:"safari",   label:"Safari" },
    { id:"terminal", appId:"terminal", label:"Terminal" },
    { id:"music",    appId:"music",    label:"Music" },
    { id:"clock",    appId:"clock",    label:"Clock" },
    { id:"calendar", appId:"calendar", label:"Calendar" },
    { id:"photos",   appId:"photos",   label:"Photos" },
    { id:"truck",    appId:"truck",    label:"Truck Game" },
    { id:"launchpad",appId:"launchpad",label:"Launchpad" },
    { id:"trash",    appId:"trash",    label:"Trash" },
  ];

  const menuBg = MENUBAR_BG[wallpaperIdx];

  return (
    <ThemeCtx.Provider value={{ isDark }}>
      <motion.div
        data-testid="desktop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-screen h-screen overflow-hidden relative select-none font-sans"
        style={{ background: customWallpaper ? `url(${customWallpaper}) center/cover no-repeat` : WALLPAPERS[wallpaperIdx] }}
        onClick={() => setShowControlCenter(false)}
      >
        {/* ── Screen glare overlay ─────────────────────────────────────────── */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.045) 0%,transparent 50%,rgba(255,255,255,0.012) 100%)" }} />

        {/* ── Menu Bar ─────────────────────────────────────────────────────── */}
        <div
          className="absolute top-0 left-0 w-full h-7 flex items-center justify-between px-3 z-50 text-white text-xs font-medium"
          style={{ background: menuBg, backdropFilter: "blur(20px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <AppleLogo className="w-3.5 h-3.5 text-white" />
            <span className="font-bold">Finder</span>
            <span className="opacity-75">File</span>
            <span className="opacity-75">Edit</span>
            <span className="opacity-75">View</span>
            <span className="opacity-75">Window</span>
            <span className="opacity-75">Help</span>
          </div>
          {/* ── Notch ── */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center" style={{ width:110, height:28, background:"#000", borderRadius:"0 0 14px 14px" }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-black border border-white/5 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${cameraActive ? "bg-green-400 shadow-[0_0_4px_#4ade80]" : "bg-zinc-700"}`} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            {/* DnD indicator */}
            {doNotDisturb && <span className="text-sm" title="Do Not Disturb">🌙</span>}
            {/* Dark/Light toggle */}
            <button
              onClick={() => setIsDark((d) => !d)}
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/15 transition-colors"
              title={isDark ? "Switch to Light" : "Switch to Dark"}
            >
              <span className="text-sm">{isDark ? "☀️" : "🌙"}</span>
            </button>
            {/* Battery */}
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
              {battery}%
            </span>
            {/* Wifi */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M1.41 1.14L0 2.55l3 3C1.13 7.06 0 9.4 0 12c0 3.31 1.34 6.3 3.51 8.49L5 19c-1.78-1.77-2.88-4.21-2.98-6.91L5 15.08V12c0-1.85.63-3.55 1.68-4.9L9 9.41V12h2v-2.59l-1-1V6.58L7.05 3.62C8.4 2.6 10.13 2 12 2c1.68 0 3.24.49 4.55 1.32L18 1.87C16.32.71 14.25 0 12 0 7.86 0 4.24 2.05 1.95 5.15L1.41 1.14zM12 4c-.73 0-1.43.1-2.1.29L15.73 10H18V8.6C16.85 5.96 14.65 4 12 4z"/></svg>
            {/* Control Center button */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowControlCenter((v) => !v); }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/15 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4zM3 10h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4zM3 17h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4z"/></svg>
            </button>
            <span className="font-mono tracking-tight">{menuDate}</span>
          </div>
        </div>

        {/* ── Control Center Panel ──────────────────────────────────────────── */}
        <AnimatePresence>
          {showControlCenter && (
            <motion.div
              initial={{ opacity:0, y:-10, scale:0.95 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-10, scale:0.95 }}
              transition={{ type:"spring", stiffness:400, damping:30 }}
              className="absolute top-9 right-3 z-[200] w-72 rounded-2xl shadow-2xl border border-white/15 overflow-hidden"
              style={{ background: isDark ? "rgba(22,22,28,0.96)" : "rgba(240,240,248,0.96)", backdropFilter:"blur(40px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`px-4 pt-4 pb-3 ${isDark ? "text-white" : "text-slate-800"}`}>
                <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">Control Center</div>

                {/* Dark / Light toggle row */}
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-2 ${isDark ? "bg-white/10" : "bg-black/6"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{isDark ? "🌙" : "☀️"}</span>
                    <span className="text-sm font-medium">{isDark ? "Dark Mode" : "Light Mode"}</span>
                  </div>
                  <button
                    onClick={() => setIsDark((d) => !d)}
                    className={`w-10 h-5.5 rounded-full relative transition-colors duration-300 ${isDark ? "bg-blue-500" : "bg-gray-300"}`}
                    style={{ width:40, height:22 }}
                  >
                    <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-300 ${isDark ? "translate-x-5" : "translate-x-0.5"}`} style={{ width:18, height:18, top:2, left: isDark ? 20 : 2 }} />
                  </button>
                </div>

                {/* Do Not Disturb row */}
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-2 ${isDark ? "bg-white/10" : "bg-black/6"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌙</span>
                    <span className="text-sm font-medium">Do Not Disturb</span>
                  </div>
                  <button
                    onClick={() => setDoNotDisturb((d) => !d)}
                    className={`rounded-full relative transition-colors duration-300 ${doNotDisturb ? "bg-blue-500" : "bg-gray-300"}`}
                    style={{ width:40, height:22 }}
                  >
                    <span className={`absolute top-0.5 rounded-full bg-white shadow transition-all duration-300`} style={{ width:18, height:18, top:2, left: doNotDisturb ? 20 : 2 }} />
                  </button>
                </div>

                {/* Wallpaper picker */}
                <div className={`px-3 py-3 rounded-xl ${isDark ? "bg-white/10" : "bg-black/6"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold opacity-60">Wallpaper</div>
                    <label className="cursor-pointer text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
                      + Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => { setCustomWallpaper(ev.target?.result as string); };
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {WALLPAPERS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setWallpaperIdx(i); setCustomWallpaper(null); }}
                        className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${!customWallpaper && wallpaperIdx === i ? "border-blue-500 scale-95" : "border-transparent hover:scale-95"}`}
                      >
                        <div className={`w-full h-full bg-gradient-to-br ${WALLPAPER_THUMBS[i]}`} />
                        {!customWallpaper && wallpaperIdx === i && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow">✓</span>
                          </div>
                        )}
                        <span className="absolute bottom-0 left-0 right-0 text-[8px] text-white/80 text-center pb-0.5 bg-black/30">{WALLPAPER_NAMES[i]}</span>
                      </button>
                    ))}
                    {customWallpaper && (
                      <button
                        onClick={() => {}}
                        className="relative rounded-xl overflow-hidden aspect-video border-2 border-blue-500 scale-95"
                      >
                        <img src={customWallpaper} className="w-full h-full object-cover" alt="Custom" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold drop-shadow">✓</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setCustomWallpaper(null); }} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[8px] flex items-center justify-center">×</button>
                        <span className="absolute bottom-0 left-0 right-0 text-[8px] text-white/80 text-center pb-0.5 bg-black/30">Custom</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Desktop Icons ─────────────────────────────────────────────────── */}
        <div className="absolute top-9 left-4 flex gap-2">
          <div className="flex flex-col gap-3">
            {leftIcons.map((icon, i) => (
              <motion.div key={icon.id} initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1+i*0.07, duration:0.4, ease:"easeOut" }}>
                <DesktopAppIcon appId={icon.appId} label={icon.label} action={icon.action} />
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {rightIcons.map((icon, i) => (
              <motion.div key={icon.id} initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15+i*0.07, duration:0.4, ease:"easeOut" }}>
                <DesktopAppIcon appId={icon.appId} label={icon.label} action={icon.action} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Space indicator (top center) ──────────────────────────────────── */}
        <div className="absolute top-9 left-1/2 -translate-x-1/2 flex gap-1.5 mt-2 z-40">
          {spacesWindows.map((_,i) => (
            <button
              key={i}
              onClick={() => setCurrentSpace(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${currentSpace === i ? "bg-white scale-125" : "bg-white/35 hover:bg-white/60"}`}
              title={`Space ${i+1}`}
            />
          ))}
        </div>

        {/* ── Welcome Notification ──────────────────────────────────────────── */}
        <AnimatePresence>
          {showNotification && !doNotDisturb && (
            <motion.div
              initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:60 }}
              transition={{ type:"spring", stiffness:300, damping:25 }}
              className="absolute top-10 right-4 z-50 w-72 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
              style={{ background:"rgba(28,28,30,0.88)", backdropFilter:"blur(30px)" }}
            >
              <div className="flex items-start gap-3 p-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-base flex-shrink-0 shadow">💻</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold leading-snug">Welcome back, Udayraj!</div>
                  <div className="text-white/55 text-xs mt-0.5 leading-snug">Your macOS portfolio is ready. 🚀</div>
                </div>
                <button onClick={() => setShowNotification(false)} className="text-white/35 hover:text-white/70 text-xl leading-none flex-shrink-0 mt-0.5 transition-colors">×</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mission Control / Spaces overlay ─────────────────────────────── */}
        <AnimatePresence>
          {showSpaces && (
            <motion.div
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              exit={{ opacity:0 }}
              className="fixed inset-0 z-[500] flex flex-col items-center justify-center"
              style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(20px)" }}
              onClick={() => setShowSpaces(false)}
            >
              <div className="text-white text-xl font-semibold mb-6">Mission Control</div>
              <div className="flex gap-3 flex-wrap justify-center max-w-3xl">
                {spacesWindows.map((_,i) => (
                  <motion.button
                    key={i}
                    initial={{ y:40, opacity:0 }}
                    animate={{ y:0, opacity:1 }}
                    transition={{ delay:i*0.07 }}
                    onClick={(e) => { e.stopPropagation(); setCurrentSpace(i); setShowSpaces(false); }}
                    className={`w-40 h-28 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${currentSpace === i ? "border-blue-400" : "border-white/20"}`}
                    style={{ background: customWallpaper ? `url(${customWallpaper}) center/cover no-repeat` : WALLPAPERS[wallpaperIdx], backdropFilter:"blur(4px)" }}
                  >
                    <span className="text-white/60 text-xs font-medium drop-shadow">Desktop {i+1}</span>
                    <span className="text-white/40 text-[10px] drop-shadow">
                      {spacesWindows[i].filter(w=>w.isOpen).length} window{spacesWindows[i].filter(w=>w.isOpen).length!==1?"s":""}
                    </span>
                    {currentSpace === i && <span className="text-blue-400 text-[10px] font-semibold drop-shadow">● Active</span>}
                  </motion.button>
                ))}
                {/* Add desktop button */}
                <motion.button
                  initial={{ y:40, opacity:0 }}
                  animate={{ y:0, opacity:1 }}
                  transition={{ delay: spacesWindows.length * 0.07 }}
                  onClick={(e) => { e.stopPropagation(); setSpacesWindows(prev => [...prev, makeDefaultWindows()]); }}
                  className="w-40 h-28 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 hover:border-white/40"
                >
                  <span className="text-white/40 text-3xl">+</span>
                  <span className="text-white/30 text-[10px]">New Desktop</span>
                </motion.button>
              </div>
              <div className="text-white/30 text-xs mt-6">Ctrl+← → to switch · Click to select · + to add</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Windows ───────────────────────────────────────────────────────── */}
        {windows.map((w) => (
          <AnimatePresence key={`${currentSpace}-${w.id}`}>
            {w.isOpen && !w.isMinimized && (
              <AppWindow
                key={w.id}
                {...w}
                isDark={isDark}
                onClose={() => closeWindow(w.id)}
                onMinimize={() => minimizeWindow(w.id)}
                onFocus={() => bringToFront(w.id)}
                onMove={(x, y) => updatePos(w.id, x, y)}
                onOpenApp={openWindow}
              />
            )}
          </AnimatePresence>
        ))}

        {/* ── Dock ─────────────────────────────────────────────────────────── */}
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1.5 px-4 py-2.5 rounded-2xl z-50 shadow-2xl"
          style={{ background:"rgba(100,50,160,0.45)", backdropFilter:"blur(40px)", border:"1px solid rgba(255,255,255,0.18)" }}
          data-testid="dock"
        >
          {dockItems.map((item) => (
            <DockAppIcon
              key={item.id}
              appId={item.appId}
              label={item.label}
              onClick={() => { if (item.id !== "trash") openWindow(item.id); }}
              isOpen={windows.find((w) => w.id === item.id)?.isOpen}
              bouncing={bouncingApp === item.id}
            />
          ))}
        </div>

        {/* ── Mission Control button (bottom right corner) ──────────────────── */}
        <motion.button
          whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
          onClick={() => setShowSpaces((v)=>!v)}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center z-50 shadow-xl border border-white/20 text-sm"
          style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(20px)" }}
          title="Mission Control (Ctrl+←→)"
        >
          ⊞
        </motion.button>

        {/* ── Spotlight Search ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {spotlightOpen && (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="absolute inset-0 z-[300] flex items-start justify-center pt-28"
              style={{ background:"rgba(0,0,0,0.35)", backdropFilter:"blur(6px)" }}
              onClick={() => { setSpotlightOpen(false); setSpotlightQuery(""); }}
            >
              <motion.div
                initial={{ opacity:0, scale:0.92, y:-12 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.92, y:-12 }}
                transition={{ type:"spring", stiffness:420, damping:30 }}
                className="w-[560px] max-w-[92vw] rounded-2xl shadow-2xl overflow-hidden"
                style={{ background:"rgba(28,28,32,0.92)", backdropFilter:"blur(40px)", border:"1px solid rgba(255,255,255,0.15)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                  <input
                    autoFocus
                    value={spotlightQuery}
                    onChange={(e) => setSpotlightQuery(e.target.value)}
                    placeholder="Spotlight Search"
                    className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/30"
                  />
                  <kbd className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/10">esc</kbd>
                </div>
                {spotlightQuery.trim() && (
                  <div className="max-h-72 overflow-y-auto p-2">
                    {[
                      { id:"about", label:"About Me", icon:"👤" },
                      { id:"projects", label:"Projects", icon:"🗂️" },
                      { id:"contact", label:"Contact", icon:"📬" },
                      { id:"terminal", label:"Terminal", icon:"💻" },
                      { id:"finder", label:"Finder", icon:"📁" },
                      { id:"safari", label:"Safari", icon:"🌐" },
                      { id:"photos", label:"Photos", icon:"🌸" },
                      { id:"music", label:"Music", icon:"🎵" },
                      { id:"resume", label:"Resume", icon:"📄" },
                      { id:"clock", label:"Clock", icon:"🕐" },
                      { id:"calendar", label:"Calendar", icon:"📅" },
                      { id:"truck",    label:"Truck Game",       icon:"🚛" },
                      { id:"launchpad",label:"Launchpad",         icon:"🚀" },
                      { id:"downloads",label:"Downloads",         icon:"⬇️" },
                      { id:"chess",    label:"Chess",             icon:"♟️" },
                      { id:"duolingo", label:"Duolingo",          icon:"🦉" },
                      { id:"notes",    label:"Notes",             icon:"📝" },
                      { id:"rubik",    label:"Rubik's Cube AI",   icon:"🎲" },
                    ]
                      .filter((a) => a.label.toLowerCase().includes(spotlightQuery.toLowerCase()))
                      .map((a) => (
                        <button
                          key={a.id}
                          onClick={() => { openWindow(a.id); setSpotlightOpen(false); setSpotlightQuery(""); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left"
                        >
                          <span className="text-xl w-7 text-center">{a.icon}</span>
                          <span className="text-white text-sm font-medium">{a.label}</span>
                          <span className="ml-auto text-white/30 text-xs">App</span>
                        </button>
                      ))}
                    {[
                      { id:"about",    label:"About Me",          icon:"👤" },
                      { id:"projects", label:"Projects",          icon:"🗂️" },
                      { id:"contact",  label:"Contact",           icon:"📬" },
                      { id:"terminal", label:"Terminal",          icon:"💻" },
                      { id:"finder",   label:"Finder",            icon:"📁" },
                      { id:"safari",   label:"Safari",            icon:"🌐" },
                      { id:"photos",   label:"Photos",            icon:"🌸" },
                      { id:"music",    label:"Music",             icon:"🎵" },
                      { id:"resume",   label:"Resume",            icon:"📄" },
                      { id:"clock",    label:"Clock",             icon:"🕐" },
                      { id:"calendar", label:"Calendar",          icon:"📅" },
                      { id:"truck",    label:"Truck Game",        icon:"🚛" },
                      { id:"launchpad",label:"Launchpad",         icon:"🚀" },
                      { id:"downloads",label:"Downloads",         icon:"⬇️" },
                      { id:"chess",    label:"Chess",             icon:"♟️" },
                      { id:"duolingo", label:"Duolingo",          icon:"🦉" },
                      { id:"notes",    label:"Notes",             icon:"📝" },
                      { id:"rubik",    label:"Rubik's Cube AI",   icon:"🎲" },
                    ].filter((a) => a.label.toLowerCase().includes(spotlightQuery.toLowerCase())).length === 0 && (
                      <div className="text-white/30 text-sm text-center py-6">No results for "{spotlightQuery}"</div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Konami Easter Egg ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {konamiActive && (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="absolute inset-0 z-[400] flex items-center justify-center"
              style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
              onClick={() => setKonamiActive(false)}
            >
              <motion.div
                initial={{ scale:0.5, rotate:-10 }} animate={{ scale:1, rotate:0 }} exit={{ scale:0.5 }}
                transition={{ type:"spring", stiffness:300, damping:20 }}
                className="text-center max-w-sm px-8 py-10 rounded-3xl shadow-2xl border border-white/15"
                style={{ background:"rgba(20,20,28,0.95)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div className="text-8xl mb-4" animate={{ rotate:[0,15,-15,10,-10,0], scale:[1,1.2,1.1,1.15,1] }} transition={{ duration:0.8 }}>🎮</motion.div>
                <div className="text-white text-2xl font-bold mb-2">Konami Code Unlocked!</div>
                <div className="text-white/60 text-sm mb-1">↑↑↓↓←→←→BA</div>
                <div className="text-white/50 text-xs mt-3 mb-6">You found the easter egg! Udayraj definitely put this here hoping someone would try it. You're awesome.</div>
                <div className="flex gap-2 justify-center text-4xl mb-4">
                  {["🌟","🏆","🎊","🚀","💎"].map((e, i) => (
                    <motion.span key={i} animate={{ y:[0,-12,0] }} transition={{ repeat:Infinity, duration:1.2, delay:i*0.15 }}>{e}</motion.span>
                  ))}
                </div>
                <button onClick={() => setKonamiActive(false)} className="px-6 py-2 bg-[#e8168a] hover:bg-[#c8108a] text-white font-semibold rounded-xl transition-colors text-sm">
                  Continue →
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AI Chatbot ────────────────────────────────────────────────────── */}
        <AIChatbot />
      </motion.div>
    </ThemeCtx.Provider>
  );
}

// ─── App Icon (macOS-style SVG icons) ────────────────────────────────────────
function AppIcon({ appId, size = 48 }: { appId: string; size?: number }) {
  const r = Math.round(size * 0.22);
  const s = size;
  const wrap = (bg: string, children: React.ReactNode) => (
    <div style={{ width:s, height:s, borderRadius:r, background:bg, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.28)" }}>
      {children}
    </div>
  );
  const ico = (d: string, fill = "white") => (
    <svg viewBox="0 0 24 24" fill={fill} width={s*0.6} height={s*0.6}><path d={d}/></svg>
  );
  const now = new Date();

  switch (appId) {
    case "finder": return (
      <div style={{ width:s, height:s, borderRadius:r, overflow:"hidden", flexShrink:0, position:"relative", boxShadow:"0 2px 8px rgba(0,0,0,0.28)" }}>
        <div style={{ position:"absolute", left:0, top:0, width:"50%", height:"100%", background:"#2266d0" }}/>
        <div style={{ position:"absolute", right:0, top:0, width:"50%", height:"100%", background:"#5ba6f5" }}/>
        <svg viewBox="0 0 48 48" width={s} height={s} style={{ position:"absolute", top:0, left:0 }}>
          <ellipse cx="15" cy="19" rx="5.5" ry="6.5" fill="white"/>
          <ellipse cx="33" cy="19" rx="5.5" ry="6.5" fill="white"/>
          <ellipse cx="15.5" cy="20" rx="3.2" ry="3.8" fill="#1a2a4a"/>
          <ellipse cx="33.5" cy="20" rx="3.2" ry="3.8" fill="#1a2a4a"/>
          <circle cx="14.5" cy="18.5" r="1" fill="white" opacity="0.6"/>
          <circle cx="32.5" cy="18.5" r="1" fill="white" opacity="0.6"/>
          <path d="M13 31 Q24 40 35 31" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    );
    case "safari": return wrap("linear-gradient(145deg,#3291ff,#0960de)", (
      <svg viewBox="0 0 24 24" fill="none" width={s*0.82} height={s*0.82}>
        <circle cx="12" cy="12" r="10.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" fill="none"/>
        <circle cx="12" cy="12" r="8.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none"/>
        <polygon points="12,3 13.8,10.5 12,9.2 10.2,10.5" fill="#ff3b30"/>
        <polygon points="12,21 10.2,13.5 12,14.8 13.8,13.5" fill="rgba(255,255,255,0.7)"/>
        <polygon points="3,12 10.5,13.8 9.2,12 10.5,10.2" fill="rgba(255,255,255,0.7)"/>
        <polygon points="21,12 13.5,10.2 14.8,12 13.5,13.8" fill="rgba(255,255,255,0.7)"/>
        <circle cx="12" cy="12" r="1.5" fill="white"/>
      </svg>
    ));
    case "terminal": return wrap("linear-gradient(145deg,#1c1c1e,#2c2c2e)", (
      <svg viewBox="0 0 24 24" fill="none" width={s*0.65} height={s*0.65}>
        <path d="M4 8 L10 12 L4 16" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="16" x2="20" y2="16" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    ));
    case "music": return wrap("linear-gradient(145deg,#fc3c44,#a8000a)", (
      <svg viewBox="0 0 24 24" fill="white" width={s*0.62} height={s*0.62}>
        <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
      </svg>
    ));
    case "photos": return wrap("white", (
      <svg viewBox="0 0 24 24" fill="none" width={s*0.78} height={s*0.78}>
        <ellipse cx="12" cy="7" rx="3" ry="5" fill="#ff3b30"/>
        <ellipse cx="12" cy="7" rx="3" ry="5" fill="#ff9500" transform="rotate(60,12,12)"/>
        <ellipse cx="12" cy="7" rx="3" ry="5" fill="#ffcc00" transform="rotate(120,12,12)"/>
        <ellipse cx="12" cy="7" rx="3" ry="5" fill="#34c759" transform="rotate(180,12,12)"/>
        <ellipse cx="12" cy="7" rx="3" ry="5" fill="#007aff" transform="rotate(240,12,12)"/>
        <ellipse cx="12" cy="7" rx="3" ry="5" fill="#af52de" transform="rotate(300,12,12)"/>
        <circle cx="12" cy="12" r="2.5" fill="white"/>
      </svg>
    ));
    case "calendar": {
      const mo = now.toLocaleDateString("en-US",{month:"short"}).toUpperCase();
      const d  = now.getDate();
      return (
        <div style={{ width:s, height:s, borderRadius:r, background:"white", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.28)" }}>
          <div style={{ background:"#ff3b30", display:"flex", alignItems:"center", justifyContent:"center", height:"38%", borderRadius:`${r}px ${r}px 0 0` }}>
            <span style={{ color:"white", fontSize:s*0.18, fontWeight:700, letterSpacing:1 }}>{mo}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flex:1 }}>
            <span style={{ color:"#1c1c1e", fontSize:s*0.42, fontWeight:200, lineHeight:1 }}>{d}</span>
          </div>
        </div>
      );
    }
    case "clock": {
      const hDeg = (now.getHours()%12)*30 + now.getMinutes()*0.5;
      const mDeg = now.getMinutes()*6;
      const cx = s/2, cy = s/2, rad = s*0.38;
      const ha = (hDeg-90)*Math.PI/180;
      const ma = (mDeg-90)*Math.PI/180;
      return (
        <div style={{ width:s, height:s, borderRadius:r, background:"white", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.28)" }}>
          <svg viewBox={`0 0 ${s} ${s}`} width={s} height={s}>
            <circle cx={cx} cy={cy} r={rad} fill="white" stroke="#e5e5ea" strokeWidth="1.5"/>
            {Array.from({length:12},(_,i)=>{const a=(i*30-90)*Math.PI/180,o=rad-1.5,n=rad-(i%3===0?7:4);return <line key={i} x1={cx+o*Math.cos(a)} y1={cy+o*Math.sin(a)} x2={cx+n*Math.cos(a)} y2={cy+n*Math.sin(a)} stroke={i%3===0?"#8e8e93":"#c7c7cc"} strokeWidth={i%3===0?2:1} strokeLinecap="round"/>;})}
            <line x1={cx} y1={cy} x2={cx+(rad*0.52)*Math.cos(ha)} y2={cy+(rad*0.52)*Math.sin(ha)} stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1={cx} y1={cy} x2={cx+(rad*0.73)*Math.cos(ma)} y2={cy+(rad*0.73)*Math.sin(ma)} stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round"/>
            <circle cx={cx} cy={cy} r="2.5" fill="#ff3b30"/>
          </svg>
        </div>
      );
    }
    case "launchpad": return wrap("radial-gradient(ellipse at 40% 35%,#3b1080 0%,#0d0025 100%)", (
      <svg viewBox="0 0 24 24" fill="none" width={s*0.68} height={s*0.68}>
        {[5,12,19].flatMap(x=>[5,12,19].map(y=><circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" fill="white" opacity={x===12&&y===12?1:0.5}/>))}
        <path d="M12 2c-2 4.5-5 7.5-5 11a5 5 0 0010 0c0-3.5-3-6.5-5-11z" fill="white"/>
      </svg>
    ));
    case "about":     return wrap("linear-gradient(145deg,#7b4dde,#5a2fb5)", ico("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"));
    case "projects":  return wrap("linear-gradient(145deg,#00b894,#00897b)", ico("M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"));
    case "contact":   return wrap("linear-gradient(145deg,#1d7bde,#1560ac)", ico("M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"));
    case "resume":    return wrap("linear-gradient(145deg,#00b894,#00897b)", ico("M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"));
    case "truck":     return wrap("linear-gradient(145deg,#ff9500,#e65c00)", ico("M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"));
    case "downloads": return wrap("linear-gradient(145deg,#4a6fa1,#2d4f82)", ico("M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"));
    case "trash":     return wrap("linear-gradient(145deg,#c8c8cc,#9a9aa0)", ico("M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"));
    case "chess":     return wrap("linear-gradient(145deg,#4a5568,#2d3748)", (
      <svg viewBox="0 0 24 24" fill="white" width={s*0.62} height={s*0.62}>
        <path d="M19 22H5v-2h14v2M9.69 3l.51 2H8l1 4H7l1.5 3.56L7 14h10l-1.5-1.44L17 9h-2l1-4h-2.2L14.31 3H9.69z"/>
      </svg>
    ));
    case "duolingo":  return wrap("linear-gradient(145deg,#58cc02,#3d9900)", (
      <svg viewBox="0 0 24 24" fill="white" width={s*0.7} height={s*0.7}>
        <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4L12 22l4.5-10C17.5 11 18 9.5 18 8c0-3.5-2.5-6-6-6zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
      </svg>
    ));
    case "notes":     return wrap("linear-gradient(145deg,#ffd60a,#ffb800)", (
      <svg viewBox="0 0 24 24" fill="rgba(0,0,0,0.75)" width={s*0.62} height={s*0.62}>
        <path d="M3 18h12v-2H3v2zm0-5h12v-2H3v2zm0-7v2h12V6H3zm13 9.17V20h2.83l8.34-8.34-2.83-2.83L16 15.17zm13.42-7.25l-1.17-1.17a1 1 0 0 0-1.41 0l-1.17 1.17 2.83 2.83 1.17-1.17a1 1 0 0 0 0-1.66z"/>
      </svg>
    ));
    case "rubik":     return wrap("linear-gradient(145deg,#e63946,#c62828)", (
      <svg viewBox="0 0 24 24" fill="white" width={s*0.65} height={s*0.65}>
        <path d="M4 4h4v4H4V4m6 0h4v4h-4V4m6 0h4v4h-4V4M4 10h4v4H4v-4m6 0h4v4h-4v-4m6 0h4v4h-4v-4M4 16h4v4H4v-4m6 0h4v4h-4v-4m6 0h4v4h-4v-4z"/>
      </svg>
    ));
    default:          return wrap("linear-gradient(145deg,#8e8e93,#636366)", <span style={{ color:"white", fontSize:s*0.35, lineHeight:1 }}>📱</span>);
  }
}

// ─── Desktop Icon ─────────────────────────────────────────────────────────────
function DesktopAppIcon({ appId, label, action }: { appId:string; label:string; action:()=>void }) {
  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer group w-[72px]" onClick={action}>
      <div className="group-hover:scale-110 transition-transform duration-150">
        <AppIcon appId={appId} size={56} />
      </div>
      <span className="text-white text-[10px] font-medium text-center leading-tight px-1 py-0.5 rounded bg-black/25 backdrop-blur-sm group-hover:bg-blue-500/60 transition-colors drop-shadow w-full truncate">
        {label}
      </span>
    </div>
  );
}

// ─── Dock Icon ────────────────────────────────────────────────────────────────
function DockAppIcon({ appId, label, onClick, isOpen, bouncing }: { appId:string; label:string; onClick:()=>void; isOpen?:boolean; bouncing?:boolean }) {
  return (
    <div className="relative group flex flex-col items-center cursor-pointer" onClick={onClick} data-testid={`dock-icon-${label.toLowerCase().replace(/\s+/g,"-")}`}>
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900/85 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">{label}</div>
      <div className={`transition-all duration-200 group-hover:-translate-y-3 group-hover:scale-125 origin-bottom ${bouncing ? "animate-bounce" : ""}`}>
        <AppIcon appId={appId} size={48} />
      </div>
      {isOpen && <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-white/80 shadow-[0_0_4px_white]" />}
    </div>
  );
}

// ─── App Window ───────────────────────────────────────────────────────────────
// ─── New App Content Components ──────────────────────────────────────────────
function ChessContent() {
  const { isDark } = useTheme();
  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/50" : "text-slate-500";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-2xl shadow-md">♟️</div>
        <div>
          <h2 className={`text-lg font-bold ${t}`}>Chess</h2>
          <p className={`text-xs ${ts}`}>Play · Analyze · Improve</p>
        </div>
      </div>
      <p className={`text-sm leading-relaxed ${isDark?"text-white/70":"text-slate-600"}`}>
        Udayraj enjoys playing Chess as one of his favourite games. Open Chess.com to play a game online, solve puzzles, or analyze your games.
      </p>
      <div className={`rounded-xl p-4 text-center border ${isDark?"border-white/10 bg-white/5":"border-slate-200 bg-slate-50"}`}>
        <div className="text-5xl mb-3">♞</div>
        <p className={`text-xs ${ts} mb-3`}>Chess.com opens in a new tab for the best experience.</p>
        <a href="https://www.chess.com/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md">
          ♟ Play on Chess.com ↗
        </a>
      </div>
      <div className={`grid grid-cols-2 gap-2 text-xs ${ts}`}>
        {[["♙ Puzzles","Sharpen your tactics"],["📊 Analysis","Review your games"],["🏆 Tournaments","Compete online"],["📚 Lessons","Learn openings"]].map(([icon,desc])=>(
          <div key={icon} className={`p-2.5 rounded-lg border ${isDark?"border-white/8 bg-white/4":"border-slate-200 bg-white/60"}`}>
            <div className={`font-medium text-xs mb-0.5 ${t}`}>{icon}</div>
            <div className="text-[10px]">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DuolingoContent() {
  const { isDark } = useTheme();
  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/50" : "text-slate-500";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-2xl shadow-md">🦉</div>
        <div>
          <h2 className={`text-lg font-bold ${t}`}>Duolingo</h2>
          <p className={`text-xs ${ts}`}>Learn Languages · Free · Fun</p>
        </div>
      </div>
      <p className={`text-sm leading-relaxed ${isDark?"text-white/70":"text-slate-600"}`}>
        Udayraj uses Duolingo to learn new languages as part of his love for exploring new things. Language learning is one of his favourite skill-building activities.
      </p>
      <div className={`rounded-xl p-4 text-center border ${isDark?"border-white/10 bg-white/5":"border-slate-200 bg-slate-50"}`}>
        <div className="text-5xl mb-3">🦉</div>
        <p className={`text-xs ${ts} mb-3`}>Duolingo opens in a new tab.</p>
        <a href="https://www.duolingo.com/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-md">
          🦉 Open Duolingo ↗
        </a>
      </div>
      <div className={`text-xs ${ts} rounded-xl p-3 border ${isDark?"border-white/8 bg-white/4":"border-slate-200 bg-white/60"}`}>
        💡 Tip: Set a daily streak goal and keep it going — consistency beats intensity every time.
      </div>
    </div>
  );
}

function NotesContent() {
  const [notes, setNotes] = useState(() => localStorage.getItem("udayraj-notes") ?? "");
  const { isDark } = useTheme();
  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/50" : "text-slate-500";
  const save = (val: string) => { setNotes(val); localStorage.setItem("udayraj-notes", val); };
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-bold ${t}`}>📝 Notes</h2>
        <span className={`text-[10px] ${ts}`}>{notes.length} chars · auto-saved</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => save(e.target.value)}
        placeholder="Start typing your notes here… They're saved automatically in your browser."
        spellCheck={false}
        className={`flex-1 w-full min-h-[320px] rounded-xl border p-4 text-sm leading-relaxed outline-none resize-none font-mono transition-colors ${isDark?"bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-white/20":"bg-white/70 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-200"}`}
      />
      <div className="flex gap-2">
        <button onClick={() => save("")} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${isDark?"bg-white/8 hover:bg-white/14 text-white/50":"bg-slate-100 hover:bg-slate-200 text-slate-500"}`}>Clear</button>
        <button onClick={() => { const blob = new Blob([notes],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="notes.txt"; a.click(); }} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${isDark?"bg-blue-500/20 hover:bg-blue-500/30 text-blue-300":"bg-blue-50 hover:bg-blue-100 text-blue-600"}`}>Download .txt</button>
      </div>
    </div>
  );
}

function RubikContent() {
  const { isDark } = useTheme();
  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/50" : "text-slate-500";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl shadow-md">🎲</div>
        <div>
          <h2 className={`text-lg font-bold ${t}`}>Rubik's Cube AI Coach</h2>
          <p className={`text-xs ${ts}`}>AI-Powered · Solve Faster · Learn Smarter</p>
        </div>
      </div>
      <p className={`text-sm leading-relaxed ${isDark?"text-white/70":"text-slate-600"}`}>
        Udayraj can solve a standard 3×3 Rubik's Cube in around <strong>50 seconds</strong>. His obsession with cubing eventually inspired him to build the Rubik's Cube AI Coach — a project that uses AI to analyze solves and provide personalized coaching.
      </p>
      <div className={`rounded-xl p-3 border ${isDark?"border-white/10 bg-white/5":"border-slate-200 bg-slate-50"}`}>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${ts}`}>Puzzles Solved</h3>
        <div className="flex flex-wrap gap-2">
          {["3×3 Rubik's Cube","2×2 Cube","Pyraminx","Megaminx","Other Twisty Puzzles"].map((p)=>(
            <span key={p} className={`px-2 py-1 rounded-full text-xs font-medium ${isDark?"bg-red-500/20 border border-red-400/30 text-red-300":"bg-red-50 border border-red-100 text-red-700"}`}>{p}</span>
          ))}
        </div>
      </div>
      <div className={`rounded-xl p-3 border ${isDark?"border-white/10 bg-white/5":"border-slate-200 bg-white/60"}`}>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${ts}`}>AI Coach Features</h3>
        <ul className={`text-xs leading-relaxed space-y-1 ${isDark?"text-white/65":"text-slate-600"}`}>
          <li>🎯 Analyze your solve speed and consistency</li>
          <li>🧠 AI-powered algorithm recommendations</li>
          <li>📊 Track your improvement over time</li>
          <li>🔬 Pattern recognition for common cases</li>
        </ul>
      </div>
      <a href="https://cosmos-115619459091.asia-southeast1.run.app" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-md">
        🎲 Explore Project ↗
      </a>
    </div>
  );
}

function AppWindow({ id, title, x, y, zIndex, width, isDark, onClose, onMinimize, onFocus, onMove, onOpenApp }:
  WindowData & { isDark:boolean; onClose:()=>void; onMinimize:()=>void; onFocus:()=>void; onMove:(x:number,y:number)=>void; onOpenApp:(id:string)=>void }
) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x:0, y:0 });
  const [fullscreen, setFullscreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const winBg = isDark ? "rgba(28,28,32,0.92)" : "rgba(240,240,245,0.82)";
  const winBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.30)";
  const titleBarBg = isDark ? "rgba(38,38,44,0.85)" : "rgba(248,248,252,0.75)";
  const titleColor = isDark ? "rgba(255,255,255,0.80)" : "rgba(50,50,80,0.90)";

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if (fullscreen || !ref.current) return;
    onFocus();
    const rect = ref.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const onMove_ = (e: MouseEvent) => {
      if (!dragging) return;
      let nx = e.clientX - offset.x;
      let ny = e.clientY - offset.y;
      nx = Math.max(0, Math.min(nx, window.innerWidth - 200));
      ny = Math.max(28, Math.min(ny, window.innerHeight - 100));
      onMove(nx, ny);
    };
    const onUp = () => setDragging(false);
    if (dragging) { document.addEventListener("mousemove", onMove_); document.addEventListener("mouseup", onUp); }
    return () => { document.removeEventListener("mousemove", onMove_); document.removeEventListener("mouseup", onUp); };
  }, [dragging, offset, onMove]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && fullscreen) setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const renderContent = () => {
    if (id === "about")     return <AboutContent />;
    if (id === "projects")  return <ProjectsContent />;
    if (id === "contact")   return <ContactContent />;
    if (id === "terminal")  return <TerminalContent onOpenApp={onOpenApp} />;
    if (id === "finder")    return <FinderContent onOpenApp={onOpenApp} />;
    if (id === "safari")    return <SafariContent />;
    if (id === "photos")    return <PhotosContent />;
    if (id === "truck")     return <TruckGameContent />;
    if (id === "downloads") return <DownloadsContent />;
    if (id === "launchpad") return <LaunchpadContent onOpenApp={onOpenApp} />;
    if (id === "resume")    return <ResumeContent />;
    if (id === "calendar")  return <CalendarContent />;
    if (id === "clock")     return <ClockContent />;
    if (id === "music")     return <MusicContent />;
    if (id === "chess")     return <ChessContent />;
    if (id === "duolingo")  return <DuolingoContent />;
    if (id === "notes")     return <NotesContent />;
    if (id === "rubik")     return <RubikContent />;
    return null;
  };

  const trafficLights = (isFs: boolean) => (
    <div className="flex gap-2 z-10 relative">
      <button onClick={(e) => { e.stopPropagation(); onClose(); if (isFs) setFullscreen(false); }} className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0433e] hover:brightness-90 group flex items-center justify-center">
        <span className="text-[7px] text-red-900/50 opacity-0 group-hover:opacity-100 font-bold leading-none">✕</span>
      </button>
      <button onClick={(e) => { e.stopPropagation(); onMinimize(); if (isFs) setFullscreen(false); }} className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#de9f22] hover:brightness-90 group flex items-center justify-center">
        <span className="text-[7px] text-yellow-900/50 opacity-0 group-hover:opacity-100 font-bold leading-none">−</span>
      </button>
      <button onClick={(e) => { e.stopPropagation(); setFullscreen(!fullscreen); onFocus(); }} className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] hover:brightness-90 group flex items-center justify-center">
        <span className="text-[7px] text-green-900/50 opacity-0 group-hover:opacity-100 font-bold leading-none">{fullscreen ? "⊙" : "+"}</span>
      </button>
    </div>
  );

  if (fullscreen) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        exit={{ opacity:0 }}
        transition={{ duration:0.2 }}
        style={{ zIndex:9999, position:"fixed", inset:0, background: winBg, backdropFilter:"blur(32px)" }}
        onMouseDown={onFocus}
        className="flex flex-col"
        data-testid={`window-${id}`}
      >
        <div className="h-9 flex items-center px-4 border-b border-black/8 cursor-default select-none relative flex-shrink-0" style={{ background: titleBarBg }}>
          {trafficLights(true)}
          <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold pointer-events-none" style={{ color: titleColor }}>{title}</div>
          <div className="ml-auto z-10 relative">
            <button onClick={() => setFullscreen(false)} className="text-[10px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded hover:bg-black/5 transition-colors">Esc to exit</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
          {renderContent()}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity:0, scale:0.88 }}
      animate={{ opacity:1, scale:1, x, y }}
      exit={{ opacity:0, scale:0.88 }}
      transition={{ type:"spring", stiffness:320, damping:26 }}
      style={{ zIndex, position:"absolute", top:0, left:0, background: winBg, backdropFilter:"blur(32px)", border:`1px solid ${winBorder}`, width: Math.min(width ?? 480, typeof window !== "undefined" ? window.innerWidth * 0.94 : 480) }}
      onMouseDown={onFocus}
      className="rounded-xl shadow-2xl overflow-hidden flex flex-col"
      data-testid={`window-${id}`}
    >
      <div
        className="h-9 flex items-center px-4 border-b border-black/8 cursor-default select-none relative"
        style={{ background: titleBarBg }}
        onMouseDown={onHeaderMouseDown}
        onDoubleClick={() => { setFullscreen(true); onFocus(); }}
      >
        {trafficLights(false)}
        <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold pointer-events-none" style={{ color: titleColor }}>{title}</div>
      </div>
      <div className="p-5 overflow-y-auto max-h-[68vh]">
        {renderContent()}
      </div>
    </motion.div>
  );
}

// ─── Content Components ───────────────────────────────────────────────────────

function AboutContent() {
  const { isDark } = useTheme();
  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/60" : "text-slate-500";
  const skills = ["HTML","CSS","JavaScript","React","Node.js","Python","C++","AI","UI/UX Design","Robotics","3D Design"];
  const personality = ["Explorer","Builder","Curious","Continuous Learner","Problem Solver","Pattern Seeker","Overthinker","Experimenter"];
  const interests = ["Artificial Intelligence","AI Agents","Machine Learning","Astronomy","Physics","Quantum Mechanics","Robotics","Space Exploration","Mechanical Engineering","3D Design","Cars & Engines","Product Building","Content Creation"];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
          <img src="/udayraj.jpg" alt="Udayraj Singh" className="w-full h-full object-cover object-top" />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${t}`}>Hi, I'm Udayraj!</h2>
          <p className={`${ts} text-sm font-medium`}>Student · Explorer · Builder</p>
          <p className={`${isDark?"text-white/40":"text-slate-400"} text-[10px] mt-0.5`}>Birthday: November 9 🎂</p>
        </div>
      </div>

      <p className={`${isDark?"text-white/75":"text-slate-700"} text-sm leading-relaxed`}>
        I'm a curious student who loves exploring ideas, understanding how things work, and turning those ideas into real projects. Most of my ideas are currently bigger than my skillset — and that's exactly why I'm constantly learning.
      </p>

      <div className={`rounded-xl p-3 border text-sm italic ${isDark?"border-blue-400/20 bg-blue-500/8 text-blue-200/70":"border-blue-100 bg-blue-50/60 text-blue-700/70"}`}>
        "My ideas are currently bigger than my skillset. I'm working on fixing that."
      </div>

      <div>
        <h3 className={`text-[11px] font-bold ${ts} uppercase tracking-widest mb-2`}>Long-Term Mission</h3>
        <p className={`${isDark?"text-white/65":"text-slate-600"} text-xs leading-relaxed`}>
          I want to explore the universe. Astronomy and physics aren't just interests — they're what I hope to spend a significant part of my life understanding. I want to build technology that helps people learn, explore, and experience the universe in new ways.
        </p>
      </div>

      <div>
        <h3 className={`text-[11px] font-bold ${ts} uppercase tracking-widest mb-3`}>Skills</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((s,i) => (
            <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${isDark ? "bg-blue-500/20 border border-blue-400/30 text-blue-300" : "bg-blue-50 border border-blue-100 text-blue-700"}`}>{s}</span>
          ))}
        </div>
      </div>

      <div>
        <h3 className={`text-[11px] font-bold ${ts} uppercase tracking-widest mb-3`}>Personality</h3>
        <div className="flex flex-wrap gap-2">
          {personality.map((p,i) => (
            <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-purple-500/20 border border-purple-400/30 text-purple-300" : "bg-purple-50 border border-purple-100 text-purple-700"}`}>{p}</span>
          ))}
        </div>
      </div>

      <div>
        <h3 className={`text-[11px] font-bold ${ts} uppercase tracking-widest mb-3`}>Currently Exploring</h3>
        <div className="flex flex-wrap gap-2">
          {interests.slice(0,8).map((interest,i) => (
            <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-green-500/20 border border-green-400/30 text-green-300" : "bg-green-50 border border-green-100 text-green-700"}`}>{interest}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsContent() {
  const { isDark } = useTheme();
  const t = isDark ? "text-white" : "text-slate-800";
  const projects = [
    { icon:"🌌", title:"Cosmos",           desc:"A full-stack AI-powered platform — live deployed on Google Cloud Run",        tag:"AI",   tech:"Python · React · Cloud Run",        href:"https://cosmos-115619459091.asia-southeast1.run.app" },
    { icon:"🔢", title:"ChromaCalc",       desc:"A beautifully designed AI calculator built on ai.studio",                     tag:"AI",   tech:"AI Studio",                          href:"https://chromacalc.ai.studio" },
    { icon:"🔥", title:"Flames",           desc:"An interactive Flames game — fun and fast",                                   tag:"Game", tech:"AI Studio",                          href:"https://flames-interactive-game.ai.studio" },
    { icon:"🛸", title:"UFO Files",        desc:"A mysterious UFO-themed project with immersive design",                       tag:"Web",  tech:"Flames App",                         href:"https://prj-4tjxabu6-frontend.flames.app" },
    { icon:"🛍️", title:"PinDeals",         desc:"A deals platform with better offers than Amazon",                             tag:"Web",  tech:"HTML · CSS",                         href:"https://udayk7r3992.github.io/pinterest/" },
    { icon:"🍎", title:"macOS Portfolio",  desc:"This immersive macOS-style interactive portfolio",                             tag:"Web",  tech:"React · Vite · Tailwind",            href:"https://document-parser--udaykhurana20.replit.app/" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <h2 className={`text-lg font-bold ${t}`}>📂 Featured Projects</h2>
      <div className="flex flex-col gap-2">
        {projects.map((p,i) => (
          <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group shadow-sm no-underline ${isDark ? "bg-white/8 border-white/10 hover:bg-blue-500/15 hover:border-blue-400/30" : "bg-white/60 border-white/70 hover:bg-blue-50/60 hover:border-blue-100"}`}>
            <div className="text-3xl">{p.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold text-sm group-hover:text-blue-${isDark?"300":"600"} transition-colors ${t}`}>{p.title}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isDark ? "bg-white/10 text-white/50" : "bg-slate-100 text-slate-500"}`}>{p.tag}</span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark?"text-white/50":"text-slate-500"} truncate`}>{p.desc}</p>
              <p className={`text-[10px] mt-0.5 font-mono ${isDark?"text-white/30":"text-slate-400"}`}>{p.tech}</p>
            </div>
            <span className={`ml-auto text-sm flex-shrink-0 transition-colors ${isDark?"text-white/20 group-hover:text-blue-300":"text-slate-300 group-hover:text-blue-500"}`}>↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function ContactContent() {
  const { isDark } = useTheme();
  const t = isDark ? "text-white" : "text-slate-800";
  const contacts = [
    { icon:"🐙", label:"GitHub",   value:"github.com/udayk7r3992",                 href:"https://github.com/udayk7r3992" },
    { icon:"💼", label:"LinkedIn", value:"Udayraj Singh",                           href:"https://www.linkedin.com/in/udayraj-singh-9b604b3b5" },
    { icon:"📧", label:"Gmail",    value:"udayrajk007@gmail.com",                   href:"mailto:udayrajk007@gmail.com" },
    { icon:"🐦", label:"X (Twitter)", value:"@udayraj67",                           href:"https://x.com/udayraj67?s=11" },
    { icon:"🤖", label:"Reddit",   value:"u/Cube_solver23",                         href:"https://www.reddit.com/u/Cube_solver23/s/DEE5zDjAlN" },
    { icon:"💬", label:"Discord",  value:"udayraj0575",                             href:"#discord", isDiscord: true },
  ];
  return (
    <div className="flex flex-col gap-3">
      <h2 className={`text-lg font-bold ${t}`}>📫 Get in Touch</h2>
      <p className={`text-sm ${isDark?"text-white/50":"text-slate-500"}`}>Feel free to reach out for collaborations or just a friendly hello!</p>
      <div className="flex flex-col gap-1 mt-1">
        {contacts.map((c,i) => {
          const isDiscord = (c as {isDiscord?:boolean}).isDiscord;
          if (isDiscord) {
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer group no-underline ${isDark?"hover:bg-white/8":"hover:bg-white/70"}`}
                onClick={() => { navigator.clipboard?.writeText("udayraj0575"); }}>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{c.icon}</div>
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark?"text-white/40":"text-slate-400"}`}>{c.label}</div>
                  <div className={`text-sm font-medium ${t}`}>{c.value}</div>
                </div>
                <span className={`ml-auto text-xs transition-colors ${isDark?"text-white/30 group-hover:text-white/70":"text-slate-300 group-hover:text-slate-500"}`}>copy</span>
              </div>
            );
          }
          return (
            <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer group no-underline ${isDark?"hover:bg-white/8":"hover:bg-white/70"}`}>
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{c.icon}</div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark?"text-white/40":"text-slate-400"}`}>{c.label}</div>
                <div className={`text-sm font-medium group-hover:text-blue-${isDark?"300":"600"} transition-colors ${t}`}>{c.value}</div>
              </div>
              <span className={`ml-auto text-sm transition-colors ${isDark?"text-white/20 group-hover:text-blue-300":"text-slate-300 group-hover:text-blue-400"}`}>↗</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function TerminalContent({ onOpenApp }: { onOpenApp?: (id: string) => void }) {
  const [history, setHistory] = useState<{ type:"input"|"output"; text:string }[]>([
    { type:"output", text:"Last login: " + new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}) },
    { type:"output", text:'Type "help" to see available commands.' },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newHistory = [...history, { type:"input" as const, text:cmd }];
    if (trimmed === "clear") { setHistory([]); setInput(""); return; }
    let output: string[] = [];
    if (trimmed === "help") {
      output = [
        "Available commands:",
        "  help           — show this help",
        "  whoami         — who am I?",
        "  cat skills.txt       — list my skills",
        "  cat architecture.md  — how this portfolio was built",
        "  ls                   — list directory",
        "  ls projects/         — list projects",
        "  open <app>           — open an app",
        "  date                 — current date & time",
        "  neofetch             — system info",
        "  echo <text>          — print text",
        "  clear                — clear terminal",
        "",
        "  Apps: about, projects, contact, finder,",
        "        safari, photos, truck, downloads,",
        "        resume, calendar, clock",
      ];
    } else if (trimmed === "whoami") {
      output = ["Udayraj Singh — Developer · AI Enthusiast · UI/UX Designer 🚀"];
    } else if (trimmed === "cat architecture.md") {
      output = [
        "# architecture.md — How this portfolio was built",
        "──────────────────────────────────────────────",
        "  Stack:    React 18 + TypeScript + Vite",
        "  Styling:  Tailwind CSS v4",
        "  Motion:   Framer Motion (springs & AnimatePresence)",
        "  Backend:  Express 5 on Node.js 24",
        "  AI:       Gemini 1.5 Flash via /api/chat",
        "",
        "  Key design decisions:",
        "  ├─ Single App.tsx with all windows as React state",
        "  ├─ Each 'app' is a content component rendered inside",
        "  │  a draggable AppWindow that handles z-index, move,",
        "  │  minimize, and fullscreen.",
        "  ├─ Multiple desktops (Spaces) via spacesWindows[3][]",
        "  ├─ Wallpaper index drives frosted menu bar colour",
        "  └─ Chat fallback: rule-based if Gemini key missing",
        "",
        "  Total bundle: ~390 KB JS (gzip: ~120 KB)",
        "──────────────────────────────────────────────",
      ];
    } else if (trimmed === "cat skills.txt") {
      output = [
        "──────────────────────────────────",
        "  Languages:  JavaScript, Python, C++, HTML, CSS",
        "  Frontend:   React, UI/UX Design, Framer Motion",
        "  Backend:    Node.js, REST APIs",
        "  Other:      AI, Git",
        "──────────────────────────────────",
      ];
    } else if (trimmed === "ls" || trimmed === "ls -la") {
      output = ["drwxr-xr-x  about/","drwxr-xr-x  projects/","drwxr-xr-x  contact/","-rw-r--r--  skills.txt","-rw-r--r--  resume.pdf"];
    } else if (trimmed === "ls projects/" || trimmed === "ls projects") {
      output = ["🤖 aria-chatbot/      — AI chatbot (HTML · CSS)","🛍️  pin-deals/         — Deals platform (HTML · CSS)","🍎 macos-portfolio/   — This very site (React · Vite)"];
    } else if (trimmed === "date") {
      output = [new Date().toLocaleString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"})];
    } else if (trimmed === "neofetch") {
      output = [
        "       🍎        udayraj@macbook",
        "    ________     ─────────────────────",
        "   /       /     OS:     macOS Portfolio 1.0",
        "  /  🍎   /      Host:   Udayraj's MacBook Pro",
        " /       /       Shell:  portfolio-sh 1.0",
        "/________/       Theme:  Monterey Dark",
        "                 CPU:    React 18 @ ∞ GHz",
        "                 Memory: Unlimited creativity",
        "                 Uptime: Always online 🚀",
      ];
    } else if (trimmed.startsWith("open ")) {
      const appName = trimmed.slice(5).trim();
      const appMap: Record<string,string> = {
        about:"about","about me":"about",projects:"projects",contact:"contact",finder:"finder",
        safari:"safari",photos:"photos",terminal:"terminal",truck:"truck","truck game":"truck",
        downloads:"downloads",launchpad:"launchpad",resume:"resume",calendar:"calendar",clock:"clock",
      };
      const windowId = appMap[appName];
      if (windowId) { output = [`Opening ${appName}...`]; setTimeout(() => onOpenApp?.(windowId), 200); }
      else output = [`open: app "${appName}" not found.`];
    } else if (trimmed.startsWith("echo ")) {
      output = [cmd.slice(5)];
    } else if (trimmed === "") {
      output = [];
    } else {
      output = [`zsh: command not found: ${cmd.trim()}`];
    }
    setHistory([...newHistory, ...output.map((t) => ({ type:"output" as const, text:t }))]);
    setInput("");
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-sm shadow-inner min-h-[260px] max-h-[420px] overflow-y-auto cursor-text select-text" onClick={() => inputRef.current?.focus()}>
      <div className="flex gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" /><div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /><div className="w-3 h-3 rounded-full bg-[#28c840]" />
      </div>
      {history.map((line,i) => (
        <div key={i} className="leading-5 mt-0.5">
          {line.type === "input" ? (
            <div className="flex flex-wrap text-green-400">
              <span className="text-blue-400">udayraj@macbook</span><span className="text-white/50">:</span><span className="text-yellow-400">~</span><span className="text-white"> $ </span><span className="text-white">{line.text}</span>
            </div>
          ) : (
            <div className="text-green-300 whitespace-pre-wrap">{line.text}</div>
          )}
        </div>
      ))}
      <div className="flex items-center text-green-400 mt-1">
        <span className="text-blue-400">udayraj@macbook</span><span className="text-white/50">:</span><span className="text-yellow-400">~</span><span className="text-white"> $&nbsp;</span>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleCommand(input); }} className="flex-1 bg-transparent outline-none text-white caret-green-400 min-w-0" autoFocus spellCheck={false} autoComplete="off" />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

type GHStats = { public_repos: number; followers: number; following: number; name: string } | null;

function FinderContent({ onOpenApp }: { onOpenApp?: (id: string) => void }) {
  const { isDark } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [ghStats, setGhStats] = useState<GHStats>(null);
  const [ghLoading, setGhLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.github.com/users/udayk7r3992")
      .then((r) => r.json())
      .then((d) => setGhStats(d as GHStats))
      .catch(() => setGhStats(null))
      .finally(() => setGhLoading(false));
  }, []);

  const folders = [
    { id:"about",     name:"About Me",   icon:"👤", desc:"Who is Udayraj?", size:"2.4 MB", modified:"Jul 28", isExternal: false },
    { id:"projects",  name:"Projects",   icon:"🗂️", desc:"Featured work",   size:"12.1 MB", modified:"Jul 29", isExternal: false },
    { id:"contact",   name:"Contact",    icon:"📬", desc:"Get in touch",    size:"380 KB",  modified:"Jul 27", isExternal: false },
    { id:"photos",    name:"Photos",     icon:"🌸", desc:"Gallery",         size:"8.7 MB",  modified:"Jul 20", isExternal: false },
    { id:"downloads", name:"Downloads",  icon:"⬇️", desc:"Resume & assets", size:"2.8 MB",  modified:"Jul 15", isExternal: false },
    { id:"resume",    name:"Resume",     icon:"📄", desc:"CV / Resume",     size:"142 KB",  modified:"Jul 10", isExternal: false },
    { id:"__mentors__", name:"My Mentors", icon:"🎓", desc:"People who shaped my journey", size:"—", modified:"Aug 3", isExternal: true, externalUrl:"https://udayrajsingh.github.io/My-Mentors/" },
  ];

  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/50" : "text-slate-500";

  return (
    <div className="flex flex-col gap-3">
      {/* GitHub Live Stats */}
      <div className={`rounded-xl border p-3 flex items-center gap-3 ${isDark?"bg-white/5 border-white/10":"bg-slate-50 border-slate-200"}`}>
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold ${t}`}>
            {ghLoading ? "Loading GitHub stats…" : ghStats ? `@udayk7r3992` : "GitHub (offline)"}
          </div>
          {!ghLoading && ghStats && (
            <div className="flex gap-3 mt-0.5">
              <span className={`text-[10px] ${ts}`}><span className="font-bold text-green-500">{ghStats.public_repos}</span> repos</span>
              <span className={`text-[10px] ${ts}`}><span className="font-bold text-blue-500">{ghStats.followers}</span> followers</span>
              <span className={`text-[10px] ${ts}`}><span className="font-bold text-purple-500">{ghStats.following}</span> following</span>
            </div>
          )}
          {ghLoading && <div className={`text-[10px] ${ts} mt-0.5`}>Fetching live data…</div>}
        </div>
        <a href="https://github.com/udayk7r3992" target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline flex-shrink-0">View ↗</a>
      </div>

      <div className="flex h-[260px] rounded-xl overflow-hidden border border-black/10" style={{ background: isDark?"rgba(30,30,36,0.9)":"rgba(250,250,252,0.9)" }}>
        <div className={`w-36 border-r py-2 flex flex-col gap-0.5 px-1 flex-shrink-0 ${isDark?"bg-[#28282e] border-white/10":"bg-[#f0f0f5] border-black/8"}`}>
          <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 mt-1 ${isDark?"text-white/30":"text-slate-400"}`}>Favorites</div>
          {folders.map((f) => (
            <button key={f.id} onClick={() => setSelected(f.id)} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs font-medium transition-colors w-full ${selected === f.id ? "bg-blue-500 text-white" : isDark ? "text-white/70 hover:bg-white/8" : "text-slate-700 hover:bg-black/5"}`}>
              <span>{f.icon}</span><span className="truncate">{f.name}</span>
            </button>
          ))}
        </div>
        <div className={`flex-1 p-4 overflow-y-auto ${isDark?"bg-[#1e1e24]":""}`}>
          {selected ? (
            <div className="flex flex-col items-center gap-3 justify-center h-full">
              <div className="text-5xl">{folders.find(f=>f.id===selected)?.icon}</div>
              <div className={`font-semibold ${isDark?"text-white":"text-slate-700"}`}>{folders.find(f=>f.id===selected)?.name}</div>
              <div className={`text-xs ${isDark?"text-white/40":"text-slate-400"}`}>{folders.find(f=>f.id===selected)?.desc}</div>
              <div className={`text-[10px] ${ts}`}>{folders.find(f=>f.id===selected)?.size} · Modified {folders.find(f=>f.id===selected)?.modified}</div>
              <button onClick={() => {
                const f = folders.find(f=>f.id===selected);
                if (f?.isExternal && f.externalUrl) window.open(f.externalUrl, "_blank", "noopener,noreferrer");
                else onOpenApp?.(selected);
              }} className="mt-2 px-4 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors">Open {folders.find(f=>f.id===selected)?.isExternal ? "↗" : "→"}</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {folders.map((f) => (
                <button key={f.id} onClick={() => setSelected(f.id)} onDoubleClick={() => onOpenApp?.(f.id)} className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border border-transparent hover:border-blue-100 transition-all text-center ${isDark?"hover:bg-blue-500/10":"hover:bg-blue-50"}`}>
                  <span className="text-4xl">{f.icon}</span>
                  <span className={`text-xs font-medium ${isDark?"text-white/70":"text-slate-700"}`}>{f.name}</span>
                  <span className={`text-[9px] ${ts}`}>{f.size} · {f.modified}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SafariContent() {
  const [urlInput, setUrlInput] = useState("");

  const navigate = (q: string) => {
    const t = q.trim();
    if (!t) return;
    let url: string;
    if (/^https?:\/\//i.test(t)) url = t;
    else if (/^[\w-]+\.[\w.]+([/?].*)?$/.test(t) && !t.includes(" ")) url = `https://${t}`;
    else url = `https://duckduckgo.com/?q=${encodeURIComponent(t)}&ia=web`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const fav = [
    { label:"GitHub",   url:"https://github.com/udayk7r3992",                  icon:"🐙" },
    { label:"LinkedIn", url:"https://linkedin.com/in/udayraj-singh-9b604b3b5", icon:"💼" },
    { label:"Google",   url:"https://google.com",                               icon:"🔍" },
    { label:"YouTube",  url:"https://youtube.com",                              icon:"▶️" },
    { label:"ChatGPT",  url:"https://chat.openai.com",                         icon:"🤖" },
    { label:"MDN",      url:"https://developer.mozilla.org",                   icon:"📚" },
  ];

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-black/10" style={{ background:"rgba(250,250,252,0.99)", minHeight:420 }}>
      {/* Toolbar */}
      <div className="bg-[#e8e8ed] border-b border-black/10 px-3 py-1.5 flex items-center gap-1.5">
        <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#8e8e93] hover:bg-black/8 hover:text-slate-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#c7c7cc]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
        </button>
        <form className="flex-1 flex items-center gap-1.5 bg-white rounded-lg px-3 py-1 border border-black/10 shadow-sm" onSubmit={e => { e.preventDefault(); navigate(urlInput); }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="#34c759"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onFocus={e => e.target.select()}
            placeholder="Search or enter website address"
            className="flex-1 text-[11px] text-center text-slate-600 outline-none bg-transparent"
          />
          {urlInput && <button type="submit" className="text-blue-500 text-[10px] font-semibold hover:text-blue-600 flex-shrink-0">↵</button>}
        </form>
        <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#8e8e93] hover:bg-black/8 hover:text-slate-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35A7.958 7.958 0 0012 4C7.58 4 4 7.58 4 12s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
        </button>
      </div>

      {/* Bookmarks bar */}
      <div className="bg-[#f0f0f5] border-b border-black/8 px-3 py-1 flex items-center gap-0.5 overflow-x-auto">
        {fav.map((f, i) => (
          <button key={i} onClick={() => { setUrlInput(f.url); navigate(f.url); }} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#3c3c43] hover:bg-black/8 transition-colors whitespace-nowrap font-medium">
            <span className="text-[11px]">{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      {/* Start page */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center gap-6">
        {/* Logo + Search */}
        <div className="w-full max-w-sm mt-2">
          <div className="flex items-center justify-center gap-2 mb-5">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <circle cx="12" cy="12" r="9.5" stroke="#3291ff" strokeWidth="1.2" fill="none"/>
              <polygon points="12,3.5 13.5,10 12,9 10.5,10" fill="#ff3b30"/>
              <polygon points="12,20.5 10.5,14 12,15 13.5,14" fill="#3291ff" opacity="0.6"/>
              <polygon points="3.5,12 10,10.5 9,12 10,13.5" fill="#3291ff" opacity="0.6"/>
              <polygon points="20.5,12 14,13.5 15,12 14,10.5" fill="#3291ff" opacity="0.6"/>
              <circle cx="12" cy="12" r="1.5" fill="#3291ff"/>
            </svg>
            <span className="text-lg font-semibold text-slate-700 tracking-tight">Safari</span>
          </div>
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); navigate(urlInput); }}>
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
              placeholder="Search DuckDuckGo or enter URL…"
            />
            <button type="submit" className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">Go</button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2">Opens in a new tab · Searches DuckDuckGo</p>
        </div>

        {/* Favourites grid */}
        <div className="w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center mb-3">Favourites</p>
          <div className="grid grid-cols-3 gap-3">
            {fav.map((f, i) => (
              <button key={i} onClick={() => { setUrlInput(f.url); navigate(f.url); }} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-black/5 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-white shadow border border-black/8 flex items-center justify-center text-3xl group-hover:shadow-md transition-shadow">{f.icon}</div>
                <span className="text-[10px] text-slate-500 font-medium text-center truncate w-full">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotosContent() {
  const { isDark } = useTheme();
  const [tab, setTab] = useState<"photos"|"certs">("photos");
  const [selected, setSelected] = useState<number | null>(null);

  const realPhotos = [
    { src:"/udayraj.jpg",  alt:"Udayraj Singh",                  label:"Portrait" },
    { src:"/photo5.jpg",   alt:"Udayraj at tech campus",          label:"Tech Campus" },
    { src:"/photo4.jpg",   alt:"Udayraj at art gallery",          label:"Art Gallery" },
    { src:"/photo1.jpg",   alt:"At the campus",                   label:"Campus" },
    { src:"/photo2.jpg",   alt:"Globe installation",              label:"Globe" },
    { src:"/photo3.jpg",   alt:"Flight view",                     label:"Journey" },
    { src:"/svyasa.jpg",   alt:"S-VYASA University campus",       label:"S-VYASA" },
    { src:"/flags.jpg",    alt:"International flags at S-VYASA",  label:"International" },
  ];

  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/50" : "text-slate-500";

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-bold ${t}`}>🌸 Photos & Certs</h2>
        <div className={`flex rounded-lg overflow-hidden border text-xs font-medium ${isDark?"border-white/15":"border-slate-200"}`}>
          {(["photos","certs"] as const).map((tb) => (
            <button key={tb} onClick={() => { setTab(tb); setSelected(null); }}
              className={`px-3 py-1 capitalize transition-colors ${tab===tb ? "bg-blue-500 text-white" : isDark?"text-white/60 hover:bg-white/10":"text-slate-600 hover:bg-slate-100"}`}>
              {tb === "photos" ? "📷 Photos" : "🏆 Certs"}
            </button>
          ))}
        </div>
      </div>

      {tab === "photos" && (
        <>
          {selected !== null && (
            <div className="relative w-full h-52 rounded-xl overflow-hidden bg-slate-100 border border-black/8">
              <img src={realPhotos[selected].src} alt={realPhotos[selected].alt} className="w-full h-full object-cover object-center" />
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                <span className="text-white text-xs font-medium">{realPhotos[selected].label}</span>
              </div>
              <button onClick={() => setSelected(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 transition-colors">✕</button>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            {realPhotos.map((p, i) => (
              <button key={i} onClick={() => setSelected(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selected===i?"border-blue-500 scale-95":"border-transparent hover:scale-95"}`}>
                <img src={p.src} alt={p.alt} className="w-full h-full object-cover object-center" />
              </button>
            ))}
          </div>
          <p className={`text-[10px] text-center ${ts}`}>{realPhotos.length} photos · Click to preview</p>
        </>
      )}

      {tab === "certs" && (
        <div className="flex flex-col gap-5">
          {/* U-19 AI Olympics Gold */}
          <div className="flex flex-col gap-3">
            <div className={`rounded-2xl overflow-hidden border shadow-lg ${isDark?"border-white/10":"border-slate-200"}`}>
              <img src="/cert-ai-olympics.png" alt="U-19 AI Olympics Certificate" className="w-full object-contain bg-white" />
            </div>
            <div className={`flex flex-col gap-1.5 px-1 ${isDark?"text-white/80":"text-slate-700"}`}>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-lg">🥇</span>
                <div>
                  <div className={`text-sm font-bold ${t}`}>U-19 AI Olympics — Gold</div>
                  <div className={`text-xs ${ts}`}>Tensor School of CS &amp; AI · June 21, 2026 · Ranked TOP 25</div>
                </div>
              </div>
              <a href="https://ai-camp26.flames.app/verify/i5P2Bg5gXf" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors bg-green-500 hover:bg-green-600 text-white shadow-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Verify Certificate ↗
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className={`border-t ${isDark?"border-white/10":"border-slate-200"}`} />

          {/* be10x AI Tools Workshop */}
          <div className="flex flex-col gap-3">
            <div className={`rounded-2xl overflow-hidden border shadow-lg ${isDark?"border-white/10":"border-slate-200"}`}>
              <img src="/cert-be10x.png" alt="be10x AI Tools Workshop Certificate" className="w-full object-contain bg-white" />
            </div>
            <div className={`flex flex-col gap-1.5 px-1 ${isDark?"text-white/80":"text-slate-700"}`}>
              <div className="flex items-center gap-2">
                <span className="text-blue-500 text-lg">🎓</span>
                <div>
                  <div className={`text-sm font-bold ${t}`}>AI Tools Workshop — be10x</div>
                  <div className={`text-xs ${ts}`}>be10x · August 2, 2026 · AI Tools &amp; ChatGPT</div>
                </div>
              </div>
              <a href="https://certx.in/certificate/0270772f-3809-4400-b29b-1e1c61cd09971624118" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors bg-blue-500 hover:bg-blue-600 text-white shadow-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Verify Certificate ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TruckGameContent() {
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [truckX, setTruckX] = useState(50);
  const [obstacles, setObstacles] = useState<{ x:number; y:number; id:number }[]>([]);
  const idRef = useRef(0); const truckRef = useRef(50); const scoreRef = useRef(0);

  useEffect(() => {
    if (!started || gameOver) return;
    const scoreTicker = setInterval(() => { scoreRef.current += 1; setScore(scoreRef.current); }, 100);
    const spawner = setInterval(() => { idRef.current += 1; setObstacles((prev) => [...prev, { x:5+Math.random()*80, y:0, id:idRef.current }]); }, 1100);
    const mover = setInterval(() => {
      setObstacles((prev) => {
        const moved = prev.map((o) => ({ ...o, y:o.y+5 })).filter((o) => o.y < 105);
        const hit = moved.some((o) => o.y > 72 && o.y < 92 && Math.abs(o.x-truckRef.current) < 10);
        if (hit) setGameOver(true);
        return moved;
      });
    }, 50);
    return () => { clearInterval(scoreTicker); clearInterval(spawner); clearInterval(mover); };
  }, [started, gameOver]);

  useEffect(() => {
    if (!started || gameOver) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setTruckX((p) => { const n=Math.max(5,p-6); truckRef.current=n; return n; });
      if (e.key === "ArrowRight") setTruckX((p) => { const n=Math.min(90,p+6); truckRef.current=n; return n; });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, gameOver]);

  const reset = () => { setGameOver(false); setScore(0); scoreRef.current=0; setTruckX(50); truckRef.current=50; setObstacles([]); idRef.current=0; setStarted(true); };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-lg font-bold text-slate-800">🚛 Truck Game</h2>
        <span className="text-sm font-mono font-bold text-slate-600">Score: {(score/10).toFixed(1)}s</span>
      </div>
      <div className="relative w-full h-64 rounded-xl border border-black/10 overflow-hidden cursor-pointer" style={{ background:"linear-gradient(180deg,#87ceeb 0%,#b0e0e6 60%,#90ee90 80%,#556b2f 100%)" }} onClick={() => { if (!started || gameOver) reset(); }}>
        <div className="absolute bottom-0 left-0 right-0 h-14 rounded-b-xl flex items-center" style={{ background:"#5a5a5a" }}>
          <div className="absolute inset-x-8 top-1/2 border-dashed border-t border-white/30" />
        </div>
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-xl z-10">
            <div className="text-5xl mb-2">🚛</div>
            <div className="text-white font-bold text-lg drop-shadow-lg">Click to Start!</div>
            <div className="text-white/80 text-xs mt-1">Use ← → arrow keys to dodge rocks</div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl z-10">
            <div className="text-white font-bold text-2xl drop-shadow-lg">💥 Game Over!</div>
            <div className="text-white text-sm mt-1">Score: {(score/10).toFixed(1)}s</div>
            <div className="text-white/70 text-xs mt-2">Click to play again</div>
          </div>
        )}
        {obstacles.map((o) => (
          <div key={o.id} className="absolute text-xl pointer-events-none" style={{ left:`${o.x}%`, top:`${o.y}%`, transform:"translateX(-50%)" }}>🪨</div>
        ))}
        {started && <div className="absolute text-3xl pointer-events-none" style={{ left:`${truckX}%`, bottom:"16px", transform:"translateX(-50%)" }}>🚛</div>}
      </div>
      <p className="text-xs text-slate-400">Click to start · ← → arrow keys to steer · Avoid the rocks!</p>
    </div>
  );
}

function generateProjectsPPT() {
  const slides = [
    { bg:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)", title:"Udayraj Singh", sub:"Developer · AI Enthusiast · UI/UX Designer", body:"", accent:"#a78bfa" },
    { bg:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)", title:"🌌 Cosmos", sub:"Full-Stack AI Platform", body:"Live on Google Cloud Run. An AI-powered platform built end-to-end — from model inference to a React frontend. Demonstrates cloud deployment, REST APIs, and real-time AI responses.", accent:"#60a5fa", link:"https://cosmos-115619459091.asia-southeast1.run.app" },
    { bg:"linear-gradient(135deg,#0d1117,#161b22,#21262d)", title:"🔢 ChromaCalc", sub:"AI-Powered Calculator", body:"A beautifully designed calculator built on Google AI Studio. Goes beyond arithmetic — natural language math, history tracking, and a chromatic UI that makes numbers feel alive.", accent:"#34d399", link:"https://chromacalc.ai.studio" },
    { bg:"linear-gradient(135deg,#1c0a00,#3d1200,#7c2d12)", title:"🔥 Flames", sub:"Interactive Game", body:"A modern, playable Flames love-calculator game. Fast, fun, and shareable. Built on AI Studio with a polished interface and smooth animations.", accent:"#fb923c", link:"https://flames-interactive-game.ai.studio" },
    { bg:"linear-gradient(135deg,#0a0a1a,#111133,#1a1a55)", title:"🛸 UFO Files", sub:"Immersive Web Experience", body:"A mysterious, atmospheric project exploring UFO lore through immersive design. Cinematic visuals, dramatic typography, and an experience that lingers.", accent:"#818cf8", link:"https://prj-4tjxabu6-frontend.flames.app" },
    { bg:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)", title:"🛍️ PinDeals", sub:"Deals Discovery Platform", body:"A curated deals platform that finds offers better than Amazon. Pinterest-style grid, real product links, clean HTML/CSS — proves great UX without heavy frameworks.", accent:"#38bdf8", link:"https://udayk7r3992.github.io/pinterest/" },
    { bg:"linear-gradient(135deg,#1a0533,#2d0a5e,#1a0533)", title:"🍎 macOS Portfolio", sub:"This Very Site", body:"A full macOS desktop simulation in React + Vite. Boot screen, lock screen, draggable windows, Dock with magnification, Spotlight, Konami easter egg, live GitHub stats, and an AI chatbot.", accent:"#e879f9", link:"https://document-parser--udaykhurana20.replit.app/" },
    { bg:"linear-gradient(135deg,#064e3b,#065f46,#047857)", title:"🏆 Achievement", sub:"U-19 AI Olympics — Gold", body:"Ranked in the TOP 25 among all participants at the U-19 AI Olympics by Tensor School of CS & AI. Awarded Gold for exceptional learning, innovation, and teamwork.", accent:"#fbbf24" },
    { bg:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)", title:"Let's Build Together", sub:"udayrajk007@gmail.com", body:"github.com/udayk7r3992  ·  linkedin.com/in/udayraj-singh-9b604b3b5", accent:"#a78bfa" },
  ];
  const slideHTML = slides.map((s, i) => `
  <section class="slide" style="background:${s.bg};" id="slide-${i}">
    <div class="slide-inner">
      ${i === 0 ? `<div class="avatar-wrap"><img src="https://document-parser--udaykhurana20.replit.app/udayraj.jpg" onerror="this.style.display='none'" class="avatar"/></div>` : ""}
      <h1 style="color:${s.accent}">${s.title}</h1>
      <h2>${s.sub}</h2>
      ${s.body ? `<p>${s.body}</p>` : ""}
      ${s.link ? `<a href="${s.link}" target="_blank" style="color:${s.accent};border-color:${s.accent}">View Live ↗</a>` : ""}
      <div class="slide-num">${i + 1} / ${slides.length}</div>
    </div>
  </section>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Udayraj Singh — Projects Overview</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:100%; height:100%; overflow:hidden; background:#000; font-family:'Segoe UI',system-ui,sans-serif; }
.slide { display:none; width:100vw; height:100vh; align-items:center; justify-content:center; position:relative; }
.slide.active { display:flex; animation:fadeIn 0.6s ease; }
@keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
.slide-inner { text-align:center; max-width:760px; padding:48px 40px; }
.avatar-wrap { margin-bottom:24px; }
.avatar { width:100px; height:100px; border-radius:50%; object-fit:cover; object-position:top; border:3px solid rgba(255,255,255,0.3); box-shadow:0 0 40px rgba(167,139,250,0.4); }
h1 { font-size:clamp(2rem,6vw,4rem); font-weight:800; letter-spacing:-0.02em; margin-bottom:12px; }
h2 { font-size:clamp(1rem,3vw,1.5rem); color:rgba(255,255,255,0.7); font-weight:400; margin-bottom:20px; }
p { font-size:clamp(0.85rem,2vw,1.05rem); color:rgba(255,255,255,0.55); line-height:1.8; max-width:580px; margin:0 auto 24px; }
a { display:inline-block; padding:10px 28px; border:1.5px solid; border-radius:50px; font-size:0.85rem; font-weight:600; text-decoration:none; margin-top:8px; transition:opacity 0.2s; }
a:hover { opacity:0.75; }
.slide-num { position:absolute; bottom:28px; right:36px; color:rgba(255,255,255,0.25); font-size:0.75rem; font-mono:monospace; }
.nav { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); display:flex; gap:12px; z-index:100; }
.nav button { padding:10px 28px; border-radius:50px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.08); color:#fff; font-size:0.85rem; cursor:pointer; backdrop-filter:blur(10px); transition:background 0.2s; }
.nav button:hover { background:rgba(255,255,255,0.18); }
.dots { position:fixed; bottom:64px; left:50%; transform:translateX(-50%); display:flex; gap:6px; }
.dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.25); cursor:pointer; transition:all 0.2s; }
.dot.active { background:#fff; width:18px; border-radius:4px; }
</style>
</head>
<body>
${slideHTML}
<div class="dots">${slides.map((_,i)=>`<div class="dot${i===0?' active':''}" onclick="goto(${i})"></div>`).join("")}</div>
<div class="nav">
  <button onclick="prev()">← Prev</button>
  <button onclick="next()">Next →</button>
</div>
<script>
let cur=0;
function show(n){
  document.querySelectorAll('.slide').forEach((s,i)=>{s.classList.toggle('active',i===n);});
  document.querySelectorAll('.dot').forEach((d,i)=>{d.classList.toggle('active',i===n);});
  cur=n;
}
function next(){show((cur+1)%${slides.length});}
function prev(){show((cur-1+${slides.length})%${slides.length});}
function goto(n){show(n);}
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' ')next();if(e.key==='ArrowLeft')prev();});
show(0);
</script>
</body></html>`;

  const blob = new Blob([html], { type:"text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "Udayraj_Singh_Projects_Overview.html";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function DownloadsContent() {
  const { isDark } = useTheme();
  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/40" : "text-slate-400";
  const files = [
    {
      icon:"📄", name:"Udayraj_Resume.pdf", size:"~15 KB", desc:"Latest CV / Resume — downloads as HTML",
      action: () => {
        const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Udayraj Singh — Resume</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 24px;color:#1a1a1a;line-height:1.6}h1{font-size:2rem;font-weight:800;letter-spacing:-0.02em}h2{font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;color:#888;margin:24px 0 8px;border-top:1px solid #eee;padding-top:12px}a{color:#2563eb;text-decoration:none}.tags span{display:inline-block;background:#f3f4f6;padding:3px 10px;border-radius:20px;font-size:.78rem;margin:2px}.project{margin-bottom:12px}.project b{font-size:.95rem}.project .tech{font-size:.78rem;color:#888;font-family:monospace}.project p{font-size:.85rem;color:#555;margin-top:2px}.info{display:flex;gap:16px;flex-wrap:wrap;margin:8px 0;font-size:.85rem;color:#555}</style></head><body>
<h1>Udayraj Singh</h1>
<p style="color:#666;margin-top:4px">Student · Explorer · Builder</p>
<div class="info">
  <span>📧 udayrajk007@gmail.com</span>
  <span>🐙 github.com/udayk7r3992</span>
  <span>💼 linkedin.com/in/udayraj-singh-9b604b3b5</span>
  <span>🐦 x.com/udayraj67</span>
</div>
<h2>About</h2>
<p>I'm a curious student who loves exploring ideas, understanding how things work, and turning them into real projects. Most of my ideas are currently bigger than my skillset — and that's exactly why I'm constantly learning. Long-term mission: explore the universe and build technology that helps people experience it in new ways.</p>
<h2>Skills</h2>
<div class="tags">
  <span>JavaScript</span><span>Python</span><span>C++</span><span>HTML</span><span>CSS</span>
  <span>React</span><span>Vite</span><span>Tailwind CSS</span><span>Framer Motion</span>
  <span>Node.js</span><span>REST APIs</span><span>Express</span>
  <span>AI / ML</span><span>UI/UX Design</span><span>3D Design</span>
</div>
<h2>Projects</h2>
<div class="project"><b>🌌 Cosmos</b> <span class="tech">Python · React · Google Cloud Run</span><p>Full-stack AI-powered platform live on Google Cloud Run — model inference, real-time responses, and a polished React frontend. <a href="https://cosmos-115619459091.asia-southeast1.run.app">↗ Live</a></p></div>
<div class="project"><b>🔢 ChromaCalc</b> <span class="tech">Google AI Studio</span><p>AI-powered calculator with natural language math and a chromatic UI. <a href="https://chromacalc.ai.studio">↗ Live</a></p></div>
<div class="project"><b>🔥 Flames</b> <span class="tech">Google AI Studio</span><p>Interactive Flames game with polished animations. <a href="https://flames-interactive-game.ai.studio">↗ Live</a></p></div>
<div class="project"><b>🛸 UFO Files</b> <span class="tech">Flames App</span><p>Immersive atmospheric web experience exploring UFO lore. <a href="https://prj-4tjxabu6-frontend.flames.app">↗ Live</a></p></div>
<div class="project"><b>🛍️ PinDeals</b> <span class="tech">HTML · CSS</span><p>Deals discovery platform with a Pinterest-style grid UI. <a href="https://udayk7r3992.github.io/pinterest/">↗ Live</a></p></div>
<div class="project"><b>🍎 macOS Portfolio</b> <span class="tech">React · Vite · Tailwind · Framer Motion</span><p>This immersive macOS-style portfolio with draggable windows, spaces, and an AI chatbot. <a href="https://document-parser--udaykhurana20.replit.app/">↗ Live</a></p></div>
<h2>Achievements</h2>
<p>🥇 <b>U-19 AI Olympics — Gold</b> · Tensor School of CS &amp; AI · June 21, 2026 · Ranked TOP 25</p>
<p style="margin-top:6px">🎓 <b>AI Tools Workshop Certificate</b> · be10x · August 2, 2026</p>
<h2>Interests</h2>
<div class="tags"><span>Artificial Intelligence</span><span>AI Agents</span><span>Astronomy</span><span>Physics</span><span>Quantum Mechanics</span><span>Robotics</span><span>Space Exploration</span><span>Mechanical Engineering</span><span>3D Design</span><span>Product Building</span><span>Rubik's Cubes</span><span>Chess</span><span>Formula 1</span></div>
</body></html>`;
        const blob = new Blob([html], { type:"text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "Udayraj_Singh_Resume.html";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
    },
    {
      icon:"🎬", name:"Projects_Overview.html", size:"~20 KB", desc:"Cinematic slide deck — all projects",
      action: generateProjectsPPT
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <h2 className={`text-lg font-bold ${t}`}>⬇️ Downloads</h2>
      <p className={`text-xs ${ts}`}>Click any file to download it directly.</p>
      <div className="flex flex-col gap-2">
        {files.map((f,i) => (
          <button key={i} onClick={f.action} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group text-left w-full ${isDark?"border-white/8 hover:bg-white/8 hover:border-blue-400/30":"border-black/5 hover:bg-white/70 hover:border-blue-100"}`}>
            <div className="text-3xl">{f.icon}</div>
            <div className="flex-1">
              <div className={`text-sm font-semibold group-hover:text-blue-${isDark?"300":"600"} transition-colors ${t}`}>{f.name}</div>
              <div className={`text-xs ${ts}`}>{f.desc} · {f.size}</div>
            </div>
            <span className={`transition-colors text-lg ${isDark?"text-white/20 group-hover:text-blue-300":"text-slate-300 group-hover:text-blue-500"}`}>⬇</span>
          </button>
        ))}
      </div>
      <div className={`rounded-xl p-3 border text-xs ${isDark?"border-white/10 bg-white/5 text-white/40":"border-slate-200 bg-slate-50 text-slate-400"}`}>
        💡 The Projects Overview opens as a self-contained interactive slide deck in your browser — use ← → arrow keys or the on-screen buttons to navigate.
      </div>
    </div>
  );
}

function LaunchpadContent({ onOpenApp }: { onOpenApp?: (id: string) => void }) {
  const apps = [
    { id:"about",    label:"About Me"  },
    { id:"projects", label:"Projects"  },
    { id:"contact",  label:"Contact"   },
    { id:"finder",   label:"Finder"    },
    { id:"safari",   label:"Safari"    },
    { id:"terminal", label:"Terminal"  },
    { id:"music",    label:"Music"     },
    { id:"photos",   label:"Photos"    },
    { id:"resume",   label:"Resume"    },
    { id:"calendar", label:"Calendar"  },
    { id:"clock",    label:"Clock"     },
    { id:"truck",    label:"Truck Game"},
    { id:"downloads",label:"Downloads" },
    { id:"chess",    label:"Chess"     },
    { id:"duolingo", label:"Duolingo"  },
    { id:"notes",    label:"Notes"     },
    { id:"rubik",    label:"Rubik's AI"},
  ];
  const { isDark } = useTheme();
  return (
    <div className="flex flex-col gap-4">
      <h2 className={`text-lg font-bold ${isDark?"text-white":"text-slate-800"}`}>Launchpad</h2>
      <div className="grid grid-cols-4 gap-4">
        {apps.map((app) => (
          <button key={app.id} onClick={() => onOpenApp?.(app.id)} className="flex flex-col items-center gap-1.5 group">
            <div className="group-hover:scale-110 transition-transform">
              <AppIcon appId={app.id} size={56} />
            </div>
            <span className={`text-[10px] font-medium text-center ${isDark?"text-white/70":"text-slate-600"}`}>{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Resume Content ───────────────────────────────────────────────────────────
function ResumeContent() {
  const { isDark } = useTheme();
  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/50" : "text-slate-500";
  const divider = isDark ? "border-white/10" : "border-slate-200";

  return (
    <div className={`flex flex-col gap-5 text-sm ${isDark?"text-white/80":"text-slate-700"}`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/20 shadow">
          <img src="/udayraj.jpg" alt="Udayraj Singh" className="w-full h-full object-cover object-top" />
        </div>
        <div className="flex-1">
          <h1 className={`text-2xl font-bold tracking-tight ${t}`}>Udayraj Singh</h1>
          <p className={`${ts} text-sm`}>Developer · AI Enthusiast · UI/UX Designer</p>
          <div className="flex gap-3 mt-2 flex-wrap">
            <a href="https://github.com/udayk7r3992" target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">github.com/udayk7r3992</a>
            <a href="https://www.linkedin.com/in/udayraj-singh-9b604b3b5" target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">LinkedIn ↗</a>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <h2 className={`text-[11px] font-bold uppercase tracking-widest ${ts} mb-2`}>Summary</h2>
        <p className="text-sm leading-relaxed">
          Passionate developer who loves building things for the web — from sleek AI chatbots to deal-finding platforms. Skilled in front-end development, UI/UX design, and integrating AI into real-world products.
        </p>
      </div>

      <div className={`border-t ${divider}`} />

      {/* Skills */}
      <div>
        <h2 className={`text-[11px] font-bold uppercase tracking-widest ${ts} mb-3`}>Skills</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {[
            { cat:"Languages",  items:"JavaScript, Python, C++, HTML, CSS" },
            { cat:"Frontend",   items:"React, Vite, Tailwind, UI/UX Design" },
            { cat:"Backend",    items:"Node.js, REST APIs, Express" },
            { cat:"Other",      items:"AI, Git, Framer Motion" },
          ].map((row) => (
            <div key={row.cat}>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${ts}`}>{row.cat}</span>
              <p className="text-xs mt-0.5">{row.items}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`border-t ${divider}`} />

      {/* Projects */}
      <div>
        <h2 className={`text-[11px] font-bold uppercase tracking-widest ${ts} mb-3`}>Projects</h2>
        <div className="flex flex-col gap-3">
          {[
            { name:"Cosmos",          tech:"Python · React · Cloud Run",        href:"https://cosmos-115619459091.asia-southeast1.run.app",  desc:"Full-stack AI-powered platform — live on Google Cloud Run with model inference and real-time responses." },
            { name:"ChromaCalc",      tech:"AI Studio",                          href:"https://chromacalc.ai.studio",                         desc:"AI-powered calculator built on Google AI Studio with natural language math and chromatic UI." },
            { name:"Flames",          tech:"AI Studio",                          href:"https://flames-interactive-game.ai.studio",            desc:"Interactive Flames game — polished interface with smooth animations built on AI Studio." },
            { name:"UFO Files",       tech:"Flames App",                         href:"https://prj-4tjxabu6-frontend.flames.app",             desc:"Immersive atmospheric web experience exploring UFO lore with cinematic design." },
            { name:"PinDeals",        tech:"HTML · CSS",                         href:"https://udayk7r3992.github.io/pinterest/",             desc:"Deals discovery platform with better offers than Amazon — Pinterest-style grid UI." },
            { name:"macOS Portfolio", tech:"React · Vite · Tailwind · Framer Motion", href:"https://document-parser--udaykhurana20.replit.app/", desc:"This immersive macOS-style interactive portfolio with draggable windows, spaces, and an AI chatbot." },
          ].map((p) => (
            <div key={p.name}>
              <div className="flex items-baseline gap-2">
                <span className={`font-semibold text-sm ${t}`}>{p.name}</span>
                <span className={`text-[10px] font-mono ${ts}`}>{p.tech}</span>
              </div>
              <p className="text-xs mt-0.5 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`border-t ${divider}`} />

      {/* Links */}
      <div className="flex gap-4">
        <a href="https://github.com/udayk7r3992" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline">🐙 GitHub</a>
        <a href="https://www.linkedin.com/in/udayraj-singh-9b604b3b5" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline">💼 LinkedIn</a>
      </div>
    </div>
  );
}

// ─── Calendar Content ─────────────────────────────────────────────────────────
function CalendarContent() {
  const { isDark } = useTheme();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en-US", { month:"long", year:"numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const days = Array.from({ length: firstDay }, (_,i) => ({ day:0, key:`pre-${i}` }))
    .concat(Array.from({ length: daysInMonth }, (_,i) => ({ day:i+1, key:`d-${i+1}` })));

  const t = isDark ? "text-white" : "text-slate-800";
  const cell = isDark ? "hover:bg-white/8" : "hover:bg-blue-50";

  const events: Record<string, string[]> = {
    [`${year}-${String(month+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`]: ["Today 🎉"],
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-bold ${t}`}>📅 Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewDate(new Date(year, month-1, 1))} className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${isDark?"hover:bg-white/10":"hover:bg-black/5"} transition-colors`}>‹</button>
          <span className={`text-sm font-semibold w-36 text-center ${t}`}>{monthName}</span>
          <button onClick={() => setViewDate(new Date(year, month+1, 1))} className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${isDark?"hover:bg-white/10":"hover:bg-black/5"} transition-colors`}>›</button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className={`text-center text-[10px] font-bold uppercase tracking-widest ${isDark?"text-white/30":"text-slate-400"}`}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map(({ day, key }) => {
          if (!day) return <div key={key} />;
          const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasEvent = events[dateKey];
          return (
            <div key={key} className={`aspect-square flex flex-col items-center justify-center rounded-full text-xs font-medium cursor-default transition-colors relative ${isToday ? "bg-red-500 text-white" : `${t} ${cell}`}`}>
              {day}
              {hasEvent && !isToday && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-500" />}
            </div>
          );
        })}
      </div>

      {/* Today info */}
      <div className={`mt-2 p-3 rounded-xl ${isDark?"bg-white/8 border border-white/10":"bg-blue-50 border border-blue-100"}`}>
        <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark?"text-white/40":"text-blue-400"} mb-1`}>Today</div>
        <div className={`text-sm font-semibold ${t}`}>{today.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
      </div>
    </div>
  );
}

// ─── Music Content ────────────────────────────────────────────────────────────
const SONGS = [
  { id:1,  title:"GOAT",              artist:"Karan Aujla",  album:"GOAT",          genre:"Punjabi", dur:"3:58", ytId:"eqDqFJNkbhE", color:"#ff6b35" },
  { id:2,  title:"Softly",            artist:"Karan Aujla",  album:"BacThaCity",    genre:"Punjabi", dur:"3:29", ytId:"urzK_Vmo_50", color:"#f7b731" },
  { id:3,  title:"52 Bars",           artist:"Karan Aujla",  album:"52 Bars",       genre:"Punjabi", dur:"5:12", ytId:"rULiOH4xzYo", color:"#fd7272" },
  { id:4,  title:"Brown Munde",       artist:"AP Dhillon",   album:"Brown Munde",   genre:"Punjabi", dur:"2:59", ytId:"LJMbEsLlI10", color:"#a29bfe" },
  { id:5,  title:"With You",          artist:"AP Dhillon",   album:"With You",      genre:"Punjabi", dur:"3:12", ytId:"FDMZz1j5RjI", color:"#74b9ff" },
  { id:6,  title:"Excuses",           artist:"AP Dhillon",   album:"Excuses",       genre:"Punjabi", dur:"3:02", ytId:"YRWBxerFaTI", color:"#55efc4" },
  { id:7,  title:"Tum Hi Ho",         artist:"Arijit Singh", album:"Aashiqui 2",    genre:"Hindi",   dur:"4:22", ytId:"Umqb9KENgmk", color:"#fd79a8" },
  { id:8,  title:"Kesariya",          artist:"Arijit Singh", album:"Brahmastra",    genre:"Hindi",   dur:"4:28", ytId:"BddP6PYo2gs", color:"#e17055" },
  { id:9,  title:"Agar Tum Saath Ho", artist:"Arijit Singh", album:"Tamasha",       genre:"Hindi",   dur:"5:42", ytId:"6Urs2a5-IME", color:"#d63031" },
  { id:10, title:"Blinding Lights",   artist:"The Weeknd",   album:"After Hours",   genre:"R&B",     dur:"3:20", ytId:"4NRXx6U8ABQ", color:"#e17055" },
  { id:11, title:"Starboy",           artist:"The Weeknd",   album:"Starboy",       genre:"R&B",     dur:"3:50", ytId:"34Na4j8AVgA", color:"#6c5ce7" },
  { id:12, title:"Save Your Tears",   artist:"The Weeknd",   album:"After Hours",   genre:"R&B",     dur:"3:35", ytId:"XXYlFuWEuKI", color:"#74b9ff" },
  { id:13, title:"Anti-Hero",         artist:"Taylor Swift", album:"Midnights",     genre:"Pop",     dur:"3:21", ytId:"b1kbLwvqugk", color:"#a29bfe" },
  { id:14, title:"Shake It Off",      artist:"Taylor Swift", album:"1989",          genre:"Pop",     dur:"3:39", ytId:"nfWlot6h_JM", color:"#fdcb6e" },
  { id:15, title:"Love Story (TV)",   artist:"Taylor Swift", album:"Fearless (TV)", genre:"Pop",     dur:"3:55", ytId:"8xg3vE8Ie_E", color:"#ff7675" },
  { id:16, title:"Shape of You",      artist:"Ed Sheeran",   album:"÷",             genre:"Pop",     dur:"3:53", ytId:"JGwWNGJdvx8", color:"#00b894" },
  { id:17, title:"Perfect",           artist:"Ed Sheeran",   album:"÷",             genre:"Pop",     dur:"4:23", ytId:"2Vv-BfVoq4g", color:"#fdcb6e" },
  { id:18, title:"Photograph",        artist:"Ed Sheeran",   album:"x",             genre:"Pop",     dur:"4:19", ytId:"nSDgHBa17Ak", color:"#fd79a8" },
  // More The Weeknd
  { id:19, title:"Can't Feel My Face",artist:"The Weeknd",   album:"Beauty Behind the Madness", genre:"R&B", dur:"3:34", ytId:"KEI4qSrkSAE", color:"#e55039" },
  { id:20, title:"The Hills",         artist:"The Weeknd",   album:"Beauty Behind the Madness", genre:"R&B", dur:"3:41", ytId:"yzTuBuRdAyA", color:"#6c3483" },
  { id:21, title:"Earned It",         artist:"The Weeknd",   album:"Fifty Shades of Grey", genre:"R&B",      dur:"4:18", ytId:"waU75jdUnYo", color:"#1a5276" },
  { id:22, title:"Die For You",       artist:"The Weeknd",   album:"Starboy",       genre:"R&B",     dur:"4:20", ytId:"e9xfOhCJmJU", color:"#922b21" },
  // More Karan Aujla
  { id:23, title:"Don't Look",        artist:"Karan Aujla",  album:"Don't Look",    genre:"Punjabi", dur:"3:14", ytId:"QfOLkFzp-dg", color:"#117a65" },
  { id:24, title:"Jee Kardan",        artist:"Karan Aujla",  album:"Jee Kardan",    genre:"Punjabi", dur:"3:38", ytId:"s-GUfSBi9Dk", color:"#1d6a96" },
  { id:25, title:"Yaarian",           artist:"Karan Aujla",  album:"Yaarian",       genre:"Punjabi", dur:"3:52", ytId:"sG1y1BG9HOw", color:"#d35400" },
  // More Ed Sheeran
  { id:26, title:"Thinking Out Loud", artist:"Ed Sheeran",   album:"x",             genre:"Pop",     dur:"4:41", ytId:"lp-EO5I60KA", color:"#27ae60" },
  { id:27, title:"Castle on the Hill",artist:"Ed Sheeran",   album:"÷",             genre:"Pop",     dur:"4:21", ytId:"K0ibBPhiaG0", color:"#2980b9" },
  { id:28, title:"Bad Habits",        artist:"Ed Sheeran",   album:"=",             genre:"Pop",     dur:"3:51", ytId:"orJSJGHjBLI", color:"#8e44ad" },
] as const;
type Song = (typeof SONGS)[number];

function MusicContent() {
  const { isDark } = useTheme();
  const [current, setCurrent] = useState<Song | null>(null);
  const [playing, setPlaying] = useState(false);
  const [genre, setGenre] = useState("All");

  const genres = ["All","Punjabi","Hindi","R&B","Pop"];
  const list = genre === "All" ? SONGS : SONGS.filter(s => s.genre === genre);

  const bg      = isDark ? "#1c1c1e" : "#f5f5f7";
  const hdrBg   = isDark ? "#141416" : "#ececec";
  const t       = isDark ? "text-white" : "text-[#1c1c1e]";
  const ts      = isDark ? "text-white/50" : "text-[#8e8e93]";
  const bdr     = isDark ? "border-white/8" : "border-black/8";
  const rowHov  = isDark ? "hover:bg-white/8" : "hover:bg-black/5";
  const rowAct  = isDark ? "bg-red-500/20" : "bg-red-50";

  const play = (s: Song) => { setCurrent(s); setPlaying(true); };
  const prev = () => { const i = SONGS.findIndex(s=>s.id===current?.id); if(i>0) play(SONGS[i-1]); };
  const next = () => { const i = SONGS.findIndex(s=>s.id===current?.id); if(i<SONGS.length-1) play(SONGS[i+1]); };

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden border ${bdr}`} style={{ background:bg, minHeight:420 }}>

      {/* ── Now Playing ──────────────────────────────────────────────────── */}
      <div className={`p-3 border-b ${bdr}`} style={{ background:hdrBg }}>
        <div className="flex gap-3 items-start">
          {/* Album art / YouTube embed */}
          <div className="w-[76px] h-[76px] rounded-xl overflow-hidden flex-shrink-0 shadow-lg" style={{ background: current ? `linear-gradient(135deg,${current.color}66,${current.color})` : "linear-gradient(135deg,#fc3c44,#8b0000)" }}>
            {current && playing ? (
              <iframe
                key={current.id}
                src={`https://www.youtube-nocookie.com/embed/${current.ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                width="76" height="76"
                allow="autoplay; encrypted-media"
                style={{ border:"none", display:"block" }}
                title={current.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" width="34" height="34" opacity="0.9"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
              </div>
            )}
          </div>

          {/* Info + controls */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className={`font-semibold text-sm truncate ${t}`}>{current?.title ?? "Not Playing"}</div>
            <div className={`text-xs truncate mt-0.5 ${ts}`}>{current ? `${current.artist} · ${current.album}` : "Select a song below"}</div>
            <div className="flex items-center gap-3 mt-3">
              <button onClick={prev} className={`${ts} hover:text-red-400 transition-colors`}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
              </button>
              <button onClick={() => current && setPlaying(p=>!p)} className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-md transition-colors">
                {playing
                  ? <svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  : <svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>}
              </button>
              <button onClick={next} className={`${ts} hover:text-red-400 transition-colors`}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z"/></svg>
              </button>
              <span className={`ml-auto text-[10px] font-mono ${ts}`}>{current?.dur ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Genre tabs ───────────────────────────────────────────────────── */}
      <div className={`flex gap-1 px-3 py-2 border-b ${bdr} overflow-x-auto`} style={{ background:hdrBg }}>
        {genres.map(g => (
          <button key={g} onClick={() => setGenre(g)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${genre===g?"bg-red-500 text-white":"text-red-500 hover:bg-red-500/10"}`}>{g}</button>
        ))}
      </div>

      {/* ── Song list ────────────────────────────────────────────────────── */}
      <div className="overflow-y-auto" style={{ maxHeight:240 }}>
        {list.map((song, i) => (
          <button key={song.id} onClick={() => play(song)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${current?.id===song.id ? rowAct : rowHov}`}>
            <span className={`w-5 text-center text-[10px] flex-shrink-0 ${ts}`}>
              {current?.id===song.id && playing ? "▶" : i+1}
            </span>
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background:`linear-gradient(135deg,${song.color}44,${song.color})` }}>
              {current?.id===song.id && playing && (
                <div className="flex gap-0.5 items-end" style={{ height:14 }}>
                  {[3,6,4].map((h,b) => <div key={b} className="w-1 rounded-sm bg-white animate-bounce" style={{ height:h, animationDelay:`${b*0.12}s` }}/>)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-semibold truncate ${current?.id===song.id?"text-red-500":t}`}>{song.title}</div>
              <div className={`text-[10px] truncate ${ts}`}>{song.artist}</div>
            </div>
            <span className={`text-[10px] font-mono flex-shrink-0 ${ts}`}>{song.dur}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Clock Content ────────────────────────────────────────────────────────────
function ClockContent() {
  const { isDark } = useTheme();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const sec = now.getSeconds();
  const min = now.getMinutes();
  const hr  = now.getHours() % 12;
  const secDeg  = sec * 6;
  const minDeg  = min * 6 + sec * 0.1;
  const hrDeg   = hr * 30 + min * 0.5;

  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true});
  const dateStr = now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

  const clockFace = isDark ? "bg-[#1a1a24] border-white/10" : "bg-white border-slate-200";
  const t = isDark ? "text-white" : "text-slate-800";
  const ts = isDark ? "text-white/40" : "text-slate-400";

  return (
    <div className="flex flex-col items-center gap-5">
      <h2 className={`text-lg font-bold self-start ${t}`}>🕐 Clock</h2>

      {/* Analog Clock */}
      <div className={`w-52 h-52 rounded-full border-4 ${clockFace} relative shadow-xl flex items-center justify-center`}>
        {/* Hour markers */}
        {Array.from({ length:12 },(_,i) => (
          <div key={i} className="absolute w-full h-full flex items-start justify-center" style={{ transform:`rotate(${i*30}deg)` }}>
            <div className={`w-0.5 mt-2 rounded-full ${isDark?"bg-white/20":"bg-slate-300"}`} style={{ height: i%3===0 ? 10 : 5 }} />
          </div>
        ))}
        {/* Hour hand */}
        <div className="absolute w-full h-full flex items-center justify-center">
          <div className={`absolute rounded-full ${isDark?"bg-white":"bg-slate-800"}`} style={{ width:4, height:52, bottom:"50%", left:"calc(50% - 2px)", transformOrigin:"bottom center", transform:`rotate(${hrDeg}deg)` }} />
        </div>
        {/* Minute hand */}
        <div className="absolute w-full h-full flex items-center justify-center">
          <div className={`absolute rounded-full ${isDark?"bg-white/80":"bg-slate-600"}`} style={{ width:3, height:72, bottom:"50%", left:"calc(50% - 1.5px)", transformOrigin:"bottom center", transform:`rotate(${minDeg}deg)` }} />
        </div>
        {/* Second hand */}
        <div className="absolute w-full h-full flex items-center justify-center">
          <div className="absolute rounded-full bg-red-500" style={{ width:2, height:80, bottom:"50%", left:"calc(50% - 1px)", transformOrigin:"bottom center", transform:`rotate(${secDeg}deg)`, transition:"transform 0.2s ease" }} />
        </div>
        {/* Center dot */}
        <div className={`w-3 h-3 rounded-full z-10 ring-2 ${isDark?"bg-white ring-[#1a1a24]":"bg-slate-800 ring-white"}`} />
      </div>

      {/* Digital time */}
      <div className="text-center">
        <div className={`text-3xl font-thin tabular-nums tracking-tight ${t}`}>{timeStr}</div>
        <div className={`text-xs mt-1 ${ts}`}>{dateStr}</div>
      </div>

      {/* Timezones */}
      <div className={`w-full rounded-xl p-3 flex flex-col gap-1.5 ${isDark?"bg-white/8 border border-white/10":"bg-slate-50 border border-slate-200"}`}>
        <div className={`text-[10px] font-bold uppercase tracking-widest ${ts} mb-1`}>World Clock</div>
        {[
          { city:"New York",  tz:"America/New_York" },
          { city:"London",    tz:"Europe/London" },
          { city:"Tokyo",     tz:"Asia/Tokyo" },
          { city:"New Delhi", tz:"Asia/Kolkata" },
        ].map((wc) => (
          <div key={wc.city} className="flex items-center justify-between">
            <span className={`text-xs ${ts}`}>{wc.city}</span>
            <span className={`text-xs font-mono font-semibold ${t}`}>
              {now.toLocaleTimeString("en-US",{timeZone:wc.tz,hour:"2-digit",minute:"2-digit",hour12:true})}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
