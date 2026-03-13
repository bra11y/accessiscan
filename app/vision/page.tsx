"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────
interface VisionMode {
  id: string;
  label: string;
  short: string;
  filter: string;
  description: string;
  prevalence: string;
  impact: string;
  color: string;
  cssClass?: string;
}

// ─── Vision Conditions ───────────────────────────────────────────────
// Color matrices from Brettel, Viénot & Mollon (1997)
const VISION_MODES: VisionMode[] = [
  {
    id: "normal",
    label: "Normal vision",
    short: "Baseline",
    filter: "none",
    description: "Standard vision with full color perception and sharp focus.",
    prevalence: "~95% of population",
    impact: "All colors distinguishable. Full detail visible.",
    color: "#10b981",
  },
  {
    id: "protanopia",
    label: "Protanopia",
    short: "Red-blind",
    filter: "url(#protanopia)",
    description: "Cannot perceive red light. Reds appear dark. Red/green combinations become indistinguishable.",
    prevalence: "1% of males",
    impact: "Red text on green backgrounds invisible. Error states may be missed.",
    color: "#f59e0b",
  },
  {
    id: "deuteranopia",
    label: "Deuteranopia",
    short: "Green-blind",
    filter: "url(#deuteranopia)",
    description: "Cannot perceive green light. Most common form of color blindness. Green and red appear similar.",
    prevalence: "5% of males",
    impact: "Success/error states using only color will fail. Charts become unreadable.",
    color: "#f59e0b",
  },
  {
    id: "tritanopia",
    label: "Tritanopia",
    short: "Blue-blind",
    filter: "url(#tritanopia)",
    description: "Cannot perceive blue light. Blue appears green. Yellow appears violet or light grey.",
    prevalence: "0.01% of population",
    impact: "Blue links may vanish. Blue-heavy UIs lose hierarchy.",
    color: "#f59e0b",
  },
  {
    id: "achromatopsia",
    label: "Achromatopsia",
    short: "No color",
    filter: "url(#achromatopsia)",
    description: "Complete color blindness. Everything appears in shades of grey. Also causes sensitivity to bright light.",
    prevalence: "0.003% of population",
    impact: "All color-coded information fails completely. Contrast ratios become critical.",
    color: "#6b7280",
  },
  {
    id: "low-vision",
    label: "Low vision",
    short: "Blurred",
    filter: "url(#low-vision)",
    description: "Significant visual impairment not correctable by glasses. Text blur, reduced contrast sensitivity.",
    prevalence: "246M people globally",
    impact: "Small text becomes unreadable. Low-contrast elements disappear entirely.",
    color: "#8b5cf6",
    cssClass: "low-vision-blur",
  },
  {
    id: "tunnel",
    label: "Tunnel vision",
    short: "Peripheral loss",
    filter: "none",
    description: "Loss of peripheral vision. Only a small central field remains. Common in glaucoma and retinitis pigmentosa.",
    prevalence: "3M+ with glaucoma",
    impact: "Navigation menus, sidebars, and wide layouts become completely unusable.",
    color: "#8b5cf6",
  },
  {
    id: "cataract",
    label: "Cataracts",
    short: "Yellowed",
    filter: "url(#cataract)",
    description: "Lens clouding causes yellowing, hazing, and glare sensitivity. Contrast and color saturation reduce.",
    prevalence: "65M worldwide",
    impact: "Blue-toned UIs lose contrast. Fine details and thin fonts become unreadable.",
    color: "#f59e0b",
  },
];

// ─── Demo website content (simulated browser) ───────────────────────
const DEMO_SITE_HTML = `
<div style="font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.5; color: #1a1a2e;">
  <nav style="background:#1a1a2e;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;">
    <div style="color:#fff;font-weight:700;font-size:16px;">ShopNow</div>
    <div style="display:flex;gap:16px;font-size:12px;">
      <span style="color:#10b981;cursor:pointer;">Home</span>
      <span style="color:#94a3b8;">Products</span>
      <span style="color:#94a3b8;">About</span>
      <span style="color:#94a3b8;">Contact</span>
    </div>
    <button style="background:#ef4444;color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer;">Buy Now</button>
  </nav>
  <div style="padding:20px;">
    <div style="background:linear-gradient(135deg,#10b981,#3b82f6);padding:24px;border-radius:10px;color:#fff;margin-bottom:16px;">
      <div style="font-size:20px;font-weight:700;margin-bottom:8px;">Summer Sale — 50% Off!</div>
      <div style="font-size:13px;opacity:0.9;">Use code RED50 for red items. Green tag items already discounted.</div>
      <div style="margin-top:12px;display:flex;gap:8px;">
        <span style="background:#ef4444;padding:4px 10px;border-radius:20px;font-size:11px;">Red items sale</span>
        <span style="background:#10b981;padding:4px 10px;border-radius:20px;font-size:11px;">Green tag deal</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
      <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <div style="background:#fecaca;height:60px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#991b1b;">OUT OF STOCK</div>
        <div style="padding:10px;">
          <div style="font-weight:600;font-size:12px;">Red Sneakers</div>
          <div style="color:#ef4444;font-size:11px;">$49 — Sale!</div>
        </div>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <div style="background:#bbf7d0;height:60px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#166534;">IN STOCK</div>
        <div style="padding:10px;">
          <div style="font-weight:600;font-size:12px;">Green Jacket</div>
          <div style="color:#10b981;font-size:11px;">$89 — Deal!</div>
        </div>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <div style="background:#bfdbfe;height:60px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#1e40af;">LIMITED</div>
        <div style="padding:10px;">
          <div style="font-weight:600;font-size:12px;">Blue Cap</div>
          <div style="color:#3b82f6;font-size:11px;">$29 — Limited!</div>
        </div>
      </div>
    </div>
    <div style="margin-top:14px;padding:12px;background:#fef3c7;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;font-size:12px;">
      <strong>Status:</strong> <span style="color:#10b981;">●</span> System online &nbsp;|&nbsp; <span style="color:#ef4444;">●</span> 3 errors detected &nbsp;|&nbsp; <span style="color:#f59e0b;">●</span> 2 warnings
    </div>
    <div style="margin-top:12px;">
      <input placeholder="Search products..." style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;box-sizing:border-box;" />
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
      <button style="background:#10b981;color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:11px;">Confirm order</button>
      <button style="background:#ef4444;color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:11px;">Cancel</button>
      <button style="background:#3b82f6;color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:11px;">More info</button>
    </div>
  </div>
</div>`;

// ─── Screen reader simulation lines ──────────────────────────────────
const SR_LINES = [
  { text: 'Link: "ShopNow" — navigation landmark', type: "nav" },
  { text: 'Navigation: 4 items', type: "nav" },
  { text: 'Link: "Home" — current page', type: "link" },
  { text: 'Button: "Buy Now"', type: "button" },
  { text: 'Heading level 2: "Summer Sale — 50% Off!"', type: "heading" },
  { text: 'Text: "Use code RED50 for red items. Green tag items already discounted."', type: "text" },
  { text: 'WARNING: Status indicators use color only — no text label for blind users', type: "warning" },
  { text: 'Image: missing alt text — skipped', type: "error" },
  { text: 'Button: "Confirm order"', type: "button" },
  { text: 'Button: "Cancel"', type: "button" },
  { text: 'End of page — 2 errors, 3 warnings detected', type: "error" },
];

const SR_COLORS: Record<string, string> = {
  nav: "#60a5fa",
  link: "#34d399",
  button: "#a78bfa",
  heading: "#fbbf24",
  text: "#94a3b8",
  warning: "#fb923c",
  error: "#f87171",
};

// ─── Contrast Checker ────────────────────────────────────────────────
function ContrastChecker() {
  const [fg, setFg] = useState("#1a1a2e");
  const [bg, setBg] = useState("#ffffff");

  function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  }
  function linearize(c: number) {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function luminance(hex: string) {
    const [r, g, b] = hexToRgb(hex).map(linearize);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(a: string, b: string) {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  }

  const ratio = contrast(fg, bg);
  const pass4 = ratio >= 4.5;
  const pass3 = ratio >= 3;

  return (
    <div style={{ marginTop: 16, padding: "14px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Contrast checker</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Text color</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="color" value={fg} onChange={e => setFg(e.target.value)} style={{ width: 28, height: 28, border: "1px solid #1e293b", borderRadius: 4, padding: 2, background: "transparent", cursor: "pointer" }} />
            <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{fg}</span>
          </div>
        </label>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Background</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="color" value={bg} onChange={e => setBg(e.target.value)} style={{ width: 28, height: 28, border: "1px solid #1e293b", borderRadius: 4, padding: 2, background: "transparent", cursor: "pointer" }} />
            <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{bg}</span>
          </div>
        </label>
      </div>
      <div style={{ background: bg, padding: "10px 12px", borderRadius: 6, marginBottom: 10 }}>
        <span style={{ color: fg, fontSize: 14, fontWeight: 500 }}>Sample text preview</span>
        <span style={{ color: fg, fontSize: 11, display: "block", opacity: 0.8 }}>Small text (12px)</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, padding: "8px", borderRadius: 6, background: pass4 ? "#052e16" : "#2d0a0a", border: `1px solid ${pass4 ? "#166534" : "#7f1d1d"}`, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: pass4 ? "#4ade80" : "#f87171" }}>{ratio.toFixed(2)}:1</div>
          <div style={{ fontSize: 10, color: pass4 ? "#86efac" : "#fca5a5", marginTop: 2 }}>Normal text {pass4 ? "✓ AA" : "✗ Fail"}</div>
        </div>
        <div style={{ flex: 1, padding: "8px", borderRadius: 6, background: pass3 ? "#052e16" : "#2d0a0a", border: `1px solid ${pass3 ? "#166534" : "#7f1d1d"}`, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: pass3 ? "#4ade80" : "#f87171" }}>{ratio.toFixed(2)}:1</div>
          <div style={{ fontSize: 10, color: pass3 ? "#86efac" : "#fca5a5", marginTop: 2 }}>Large text {pass3 ? "✓ AA" : "✗ Fail"}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen Reader Simulator ─────────────────────────────────────────
function ScreenReaderSim() {
  const [playing, setPlaying] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setLineIndex(0);
    setPlaying(true);
  }
  function stop() {
    setPlaying(false);
    setLineIndex(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setLineIndex(prev => {
        if (prev >= SR_LINES.length) {
          setPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 900);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  return (
    <div style={{ marginTop: 14, padding: "14px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Screen reader sim</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={start} disabled={playing} style={{ fontSize: 11, padding: "4px 10px", background: playing ? "#1e293b" : "#1d4ed8", color: playing ? "#475569" : "#fff", border: "none", borderRadius: 6, cursor: playing ? "default" : "pointer" }}>
            {playing ? "Reading..." : "Simulate"}
          </button>
          <button onClick={stop} disabled={!playing} style={{ fontSize: 11, padding: "4px 10px", background: "#1e293b", color: playing ? "#94a3b8" : "#475569", border: "none", borderRadius: 6, cursor: playing ? "pointer" : "default" }}>
            Stop
          </button>
        </div>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 11, lineHeight: 1.7, minHeight: 120 }}>
        {SR_LINES.slice(0, lineIndex).map((line, i) => (
          <div
            key={i}
            style={{
              padding: "2px 8px",
              borderRadius: 4,
              marginBottom: 2,
              borderLeft: i === lineIndex - 1 ? `2px solid ${SR_COLORS[line.type]}` : "2px solid transparent",
              opacity: i === lineIndex - 1 ? 1 : 0.5,
              color: SR_COLORS[line.type] || "#94a3b8",
              background: i === lineIndex - 1 ? "rgba(255,255,255,0.04)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            {line.text}
          </div>
        ))}
        {!playing && lineIndex === 0 && (
          <div style={{ color: "#334155", fontStyle: "italic", padding: "8px" }}>Press Simulate to see how a screen reader navigates the demo site above.</div>
        )}
      </div>
    </div>
  );
}

// ─── Tunnel Vision Overlay (mouse-tracked) ───────────────────────────
function TunnelVisionWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 }); // percent

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleMouseMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPos({ x, y });
    }

    // Default to centre when mouse is outside
    function handleMouseLeave() {
      setPos({ x: 50, y: 50 });
    }

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", borderRadius: 8, overflow: "hidden", cursor: "none" }}>
      {children}
      {/* Dark overlay with a radial cutout that follows the mouse */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse 18% 22% at ${pos.x}% ${pos.y}%, transparent 55%, rgba(0,0,0,0.97) 80%)`,
          transition: "background 0.04s linear",
        }}
      />
      {/* Soft blur ring at the tunnel edge */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse 22% 26% at ${pos.x}% ${pos.y}%, transparent 50%, rgba(0,0,0,0.4) 68%, transparent 70%)`,
          filter: "blur(4px)",
          transition: "background 0.04s linear",
        }}
      />
      {/* Instruction hint */}
      <div style={{
        position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
        fontSize: 10, color: "rgba(255,255,255,0.4)", pointerEvents: "none",
        background: "rgba(0,0,0,0.5)", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
      }}>
        Move your mouse to navigate
      </div>
    </div>
  );
}

// ─── Simulated browser preview ───────────────────────────────────────
function SiteMockup({ filter, cssClass, isTunnel }: { filter: string; cssClass?: string; isTunnel?: boolean }) {
  const inner = (
    <div
      style={{
        filter: filter !== "none" ? filter : undefined,
        borderRadius: isTunnel ? 0 : 8,
        overflow: "hidden",
        border: isTunnel ? "none" : "1px solid #1e293b",
        position: "relative",
      }}
      className={cssClass}
    >
      <div style={{ background: "#1e293b", padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
        <div style={{ flex: 1, background: "#0f172a", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#475569", marginLeft: 6 }}>demo-shop.com</div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: DEMO_SITE_HTML }} />
    </div>
  );

  if (isTunnel) {
    return (
      <div style={{ border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
        <TunnelVisionWrapper>{inner}</TunnelVisionWrapper>
      </div>
    );
  }

  return inner;
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function VisionSimulationPage() {
  const [activeMode, setActiveMode] = useState("normal");
  const [splitView, setSplitView] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((msg: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = "";
      requestAnimationFrame(() => {
        if (liveRef.current) liveRef.current.textContent = msg;
      });
    }
  }, []);

  const mode = VISION_MODES.find(m => m.id === activeMode) || VISION_MODES[0];

  function selectMode(id: string) {
    setActiveMode(id);
    const m = VISION_MODES.find(v => v.id === id);
    if (m) announce(`Vision mode: ${m.label}. ${m.description}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080c18", color: "#e2e8f0", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Global SVG filters */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.700 0.300 0 0 0  0 0.300 0.700 0 0  0 0 0 1 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.950 0.050 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
          </filter>
          <filter id="achromatopsia">
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <filter id="low-vision">
            <feGaussianBlur stdDeviation="1.8" />
            <feColorMatrix type="saturate" values="0.4" />
          </filter>
          <filter id="cataract">
            <feGaussianBlur stdDeviation="0.7" />
            <feColorMatrix type="matrix" values="1 0.1 0.05 0 0.05  0.05 0.9 0 0 0.02  0 0 0.7 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* CSS for special modes */}
      <style>{`
        .low-vision-blur { filter: blur(1.8px) saturate(0.4); }
      `}</style>

      {/* Screen reader live region */}
      <div ref={liveRef} aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }} />

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e293b", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Vision simulator</h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#475569" }}>See your site through your users' eyes</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#475569" }}>Split view</span>
          <button
            role="switch"
            aria-checked={splitView}
            onClick={() => setSplitView(v => !v)}
            style={{
              width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
              background: splitView ? "#6366f1" : "#334155", position: "relative", transition: "background 0.2s",
            }}
            aria-label="Toggle split view"
          >
            <span style={{
              position: "absolute", top: 2, left: splitView ? 18 : 2, width: 16, height: 16,
              borderRadius: "50%", background: "#fff", transition: "left 0.2s",
            }} />
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 65px)" }}>

        {/* Sidebar — mode selector + tools */}
        <aside style={{ borderRight: "1px solid #1e293b", padding: "16px", overflowY: "auto", background: "#0a0f1e" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Vision conditions
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {VISION_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => selectMode(m.id)}
                aria-pressed={activeMode === m.id}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  border: activeMode === m.id ? `1px solid ${m.color}40` : "1px solid transparent",
                  background: activeMode === m.id ? `${m.color}14` : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: activeMode === m.id ? "#f1f5f9" : "#94a3b8" }}>{m.label}</span>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: activeMode === m.id ? `${m.color}25` : "#1e293b", color: activeMode === m.id ? m.color : "#475569" }}>
                    {m.short}
                  </span>
                </div>
                {activeMode === m.id && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                    {m.prevalence}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Active mode info card */}
          {activeMode !== "normal" && (
            <div style={{ marginTop: 16, padding: 14, background: "#0f172a", borderRadius: 10, border: `1px solid ${mode.color}30` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: mode.color, marginBottom: 6 }}>{mode.label}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 8 }}>{mode.description}</div>
              <div style={{ fontSize: 11, color: "#ef4444", lineHeight: 1.5 }}>
                <strong style={{ color: "#f87171" }}>Impact: </strong>{mode.impact}
              </div>
            </div>
          )}

          <ContrastChecker />
          <ScreenReaderSim />
        </aside>

        {/* Main — preview area */}
        <main style={{ padding: "20px", overflowY: "auto" }}>
          {splitView ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Normal vision</div>
                  <SiteMockup filter="none" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: mode.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    {mode.label}
                  </div>
                  <SiteMockup filter={mode.filter} cssClass={mode.cssClass} isTunnel={activeMode === "tunnel"} />
                </div>
              </div>
              {activeMode !== "normal" && (
                <div style={{ marginTop: 16, padding: "12px 16px", background: "#0f172a", borderRadius: 8, border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    <strong style={{ color: "#94a3b8" }}>What breaks: </strong>{mode.impact}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: activeMode === "normal" ? "#475569" : mode.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {mode.label} — simulated view
                </div>
                {activeMode !== "normal" && (
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${mode.color}20`, color: mode.color, border: `1px solid ${mode.color}40` }}>
                    Active filter
                  </span>
                )}
              </div>
              <SiteMockup filter={mode.filter} cssClass={mode.cssClass} isTunnel={activeMode === "tunnel"} />
              {activeMode === "normal" && (
                <p style={{ marginTop: 12, fontSize: 13, color: "#334155", textAlign: "center" }}>
                  Select a vision condition on the left to simulate how your users see this site.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
