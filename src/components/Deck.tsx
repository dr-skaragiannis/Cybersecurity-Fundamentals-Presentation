import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import chaptersRaw from "../data/chapters.json";
import { extras } from "../data/extras";
import { buildDeck, fmtMin, PARTS, partIndex } from "../lib/build";
import { CH_ICONS, pad2, stripNum } from "../lib/meta";
import type { Chapter, Slide } from "../lib/types";
import { DiagramSlide } from "./Diagram";
import {
  Agenda,
  BreakSlide,
  CalloutSlide,
  Cover,
  IntroSlide,
  MythsSlide,
  Outcomes,
  ReviewSlide,
  SummarySlide,
  TableSlide,
  TermsSlide,
  TextFromSlide,
} from "./slides1";
import {
  ChecklistSlide,
  ClosingSlide,
  CliIntro,
  CliTasks,
  IncidentSlide,
  LabIntro,
  MilestonesSlide,
  PhaseSlide,
  ProjectIntro,
  QuizSlide,
} from "./slides2";
import { AutoFit, DeckContext, type DeckCtx } from "./ui";

export const chapters = chaptersRaw as unknown as Chapter[];

export function getDeck(ci: number): Slide[] {
  return buildDeck(ci, chapters[ci], extras[ci]);
}

const KIND_ICON: Record<string, string> = {
  cover: "🏁",
  agenda: "🗺️",
  outcomes: "🎯",
  intro: "🧭",
  text: "📝",
  table: "📊",
  callout: "💡",
  diagram: "🧩",
  incident: "🔥",
  myths: "⚖️",
  terms: "📖",
  summary: "📌",
  break: "☕",
  review: "✍️",
  cliIntro: "💻",
  cliTasks: "⌨️",
  labIntro: "🧪",
  phase: "⚙️",
  checklist: "📋",
  projectIntro: "🚀",
  milestones: "📍",
  quiz: "❓",
  closing: "🎓",
};

function SlideBody({ slide, ch }: { slide: Slide; ch: Chapter }) {
  const d = slide.data;
  switch (d.kind) {
    case "cover":
      return <Cover />;
    case "agenda":
      return <Agenda />;
    case "outcomes":
      return <Outcomes />;
    case "intro":
      return <IntroSlide d={d} />;
    case "text":
      return <TextFromSlide d={d} />;
    case "table":
      return <TableSlide d={d} />;
    case "callout":
      return <CalloutSlide d={d} />;
    case "diagram":
      return <DiagramSlide d={d.d} secLabel={`${ch.sections[d.sec].id} · ${ch.sections[d.sec].title}`} />;
    case "incident":
      return <IncidentSlide d={d} />;
    case "myths":
      return <MythsSlide d={d} />;
    case "terms":
      return <TermsSlide d={d} />;
    case "summary":
      return <SummarySlide />;
    case "break":
      return <BreakSlide d={d} />;
    case "review":
      return <ReviewSlide d={d} />;
    case "cliIntro":
      return <CliIntro />;
    case "cliTasks":
      return <CliTasks d={d} />;
    case "labIntro":
      return <LabIntro />;
    case "phase":
      return <PhaseSlide d={d} />;
    case "checklist":
      return <ChecklistSlide />;
    case "projectIntro":
      return <ProjectIntro d={d} />;
    case "milestones":
      return <MilestonesSlide d={d} />;
    case "quiz":
      return <QuizSlide d={d} />;
    case "closing":
      return <ClosingSlide />;
  }
}

export default function Deck({
  ci,
  start,
  onIdx,
  onHome,
  onChapter,
}: {
  ci: number;
  start: number;
  onIdx: (i: number) => void;
  onHome: () => void;
  onChapter: (ci: number) => void;
}) {
  const ch = chapters[ci];
  const slides = useMemo(() => getDeck(ci), [ci]);
  const [idx, setIdx] = useState(Math.min(Math.max(start, 0), slides.length - 1));
  const [scale, setScale] = useState(1);
  const [overview, setOverview] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [fs, setFs] = useState(false);
  const [ui, setUi] = useState(true);
  const [clock, setClock] = useState(0);
  const [running, setRunning] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const hideT = useRef<number | null>(null);
  const pi = partIndex(ch);
  const part = PARTS[pi];

  useEffect(() => {
    setIdx(Math.min(Math.max(start, 0), slides.length - 1));
  }, [ci]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onIdx(idx);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback(
    (n: number) => setIdx((i) => Math.min(Math.max(typeof n === "number" ? n : i, 0), slides.length - 1)),
    [slides.length]
  );

  /* scaling */
  useEffect(() => {
    const fit = () => {
      const w = wrap.current?.clientWidth ?? window.innerWidth;
      const h = wrap.current?.clientHeight ?? window.innerHeight;
      setScale(Math.min(w / 1920, h / 1080));
    };
    fit();
    window.addEventListener("resize", fit);
    document.addEventListener("fullscreenchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      document.removeEventListener("fullscreenchange", fit);
    };
  }, []);

  /* fullscreen */
  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);
  const toggleFs = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else wrap.current?.requestFullscreen?.().catch(() => {});
  }, []);

  /* stopwatch */
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setClock((c) => c + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  /* keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (overview || drawer) {
        if (e.key === "Escape" || e.key.toLowerCase() === "o" || e.key.toLowerCase() === "g") {
          setOverview(false);
          setDrawer(false);
        }
        return;
      }
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          setIdx((i) => Math.min(i + 1, slides.length - 1));
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          setIdx((i) => Math.max(i - 1, 0));
          break;
        case "Home":
          setIdx(0);
          break;
        case "End":
          setIdx(slides.length - 1);
          break;
        case "f":
        case "F":
          toggleFs();
          break;
        case "o":
        case "O":
        case "g":
        case "G":
          setOverview(true);
          break;
        case "c":
        case "C":
          setDrawer(true);
          break;
        case "t":
        case "T":
          setRunning((r) => !r);
          break;
        case "]":
          if (ci < chapters.length - 1) onChapter(ci + 1);
          break;
        case "[":
          if (ci > 0) onChapter(ci - 1);
          break;
        case "Escape":
          if (!document.fullscreenElement) onHome();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overview, drawer, slides.length, toggleFs, ci, onChapter, onHome]);

  /* auto-hide controls */
  const poke = useCallback(() => {
    setUi(true);
    if (hideT.current) window.clearTimeout(hideT.current);
    hideT.current = window.setTimeout(() => setUi(false), 3200);
  }, []);
  useEffect(() => {
    poke();
    return () => {
      if (hideT.current) window.clearTimeout(hideT.current);
    };
  }, [poke]);

  /* swipe */
  const touch = useRef<{ x: number; y: number } | null>(null);

  const slide = slides[idx];
  const next = chapters[ci + 1];
  const ctx: DeckCtx = { ci, ch, slides, idx, next, nextIdx: ci + 1 };
  const pct = ((idx + 1) / slides.length) * 100;
  const cssVars = { "--a": part.a, "--b": part.b, "--glow": part.glow } as CSSProperties;

  return (
    <div
      ref={wrap}
      className="deck-wrap"
      style={cssVars}
      onMouseMove={poke}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        poke();
      }}
      onTouchEnd={(e) => {
        const s = touch.current;
        if (!s) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(idx + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      {/* stage */}
      <div
        className="stage"
        style={{
          transform: `translate(-50%,-50%) scale(${scale})`,
        }}
      >
        <div className="stage-bg" />
        <div className="stage-grid" />
        <div className="orb orb1" />
        <div className="orb orb2" />
        <DeckContext.Provider value={ctx}>
          <div className="frame">
            {slide.data.kind !== "cover" && (
              <div className="frame-head">
                <span className="fh-logo">🛡️ Κυβερνοασφάλεια 101</span>
                <span className="fh-sep" />
                <span className="fh-ch">
                  Κεφ. {ci + 1} · {stripNum(ch.title).slice(0, 88)}
                  {stripNum(ch.title).length > 88 ? "…" : ""}
                </span>
                <span className="fh-part">{part.name.split("·")[0].trim()}</span>
              </div>
            )}
            <div key={slide.id} className="slide-anim flex min-h-0 flex-1 flex-col">
              <AutoFit min={0.5} deps={slide.id}>
                <SlideBody slide={slide} ch={ch} />
              </AutoFit>
            </div>
            <div className="frame-foot">
              <span className="ff-l">
                {KIND_ICON[slide.data.kind]} {slide.label.length > 80 ? slide.label.slice(0, 79) + "…" : slide.label}
              </span>
              <div className="ff-bar">
                <div style={{ width: `${pct}%` }} />
              </div>
              <span className="ff-r">
                ⏱ {fmtMin(slide.start)}–{fmtMin(slide.end)} · {idx + 1}/{slides.length}
              </span>
            </div>
          </div>
        </DeckContext.Provider>
      </div>

      {/* edge nav */}
      <button className="edge left" aria-label="Προηγούμενη" onClick={() => go(idx - 1)} disabled={idx === 0}>
        ‹
      </button>
      <button className="edge right" aria-label="Επόμενη" onClick={() => go(idx + 1)} disabled={idx === slides.length - 1}>
        ›
      </button>

      {/* controls */}
      <div className={"controls " + (ui || overview || drawer ? "show" : "")}>
        <button onClick={onHome} title="Αρχική (Esc)">
          🏠
        </button>
        <button onClick={() => setDrawer(true)} title="Κεφάλαια (C)">
          📚 Κεφ. {ci + 1}/{chapters.length}
        </button>
        <span className="sep" />
        <button onClick={() => go(0)} title="Αρχή (Home)">
          ⏮
        </button>
        <button onClick={() => go(idx - 1)} disabled={idx === 0}>
          ◀
        </button>
        <span className="ctr">
          {idx + 1} / {slides.length}
        </span>
        <button onClick={() => go(idx + 1)} disabled={idx === slides.length - 1}>
          ▶
        </button>
        <button onClick={() => go(slides.length - 1)} title="Τέλος (End)">
          ⏭
        </button>
        <span className="sep" />
        <button onClick={() => setOverview(true)} title="Επισκόπηση (O)">
          ▦ Επισκόπηση
        </button>
        <button onClick={() => setRunning((r) => !r)} title="Χρονόμετρο (T)">
          {running ? "⏸" : "⏱"} {pad2(Math.floor(clock / 60))}:{pad2(clock % 60)}
        </button>
        {clock > 0 && (
          <button
            onClick={() => {
              setClock(0);
              setRunning(false);
            }}
            title="Μηδενισμός"
          >
            ↺
          </button>
        )}
        <span className="sep" />
        <button onClick={toggleFs} title="Πλήρης οθόνη (F)">
          {fs ? "🗗 Έξοδος" : "⛶ Πλήρης οθόνη"}
        </button>
      </div>
      <div className="tiny-progress">
        <div style={{ width: `${pct}%` }} />
      </div>

      {/* overview */}
      {overview && (
        <div className="overlay" onClick={() => setOverview(false)}>
          <div className="overlay-in" onClick={(e) => e.stopPropagation()}>
            <div className="ov-head">
              <h3>
                Κεφάλαιο {ci + 1} · {stripNum(ch.title)}
              </h3>
              <button className="btn-ghost" onClick={() => setOverview(false)}>
                ✕ Κλείσιμο
              </button>
            </div>
            <div className="ov-grid">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  className={"ov-card " + (i === idx ? "cur" : "")}
                  onClick={() => {
                    setIdx(i);
                    setOverview(false);
                  }}
                >
                  <div className="ov-top">
                    <span>{KIND_ICON[s.data.kind]}</span>
                    <b>{i + 1}</b>
                  </div>
                  <div className="ov-label">{s.label}</div>
                  <div className="ov-time">⏱ {fmtMin(s.start)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* chapter drawer */}
      {drawer && (
        <div className="overlay" onClick={() => setDrawer(false)}>
          <div className="overlay-in" onClick={(e) => e.stopPropagation()}>
            <div className="ov-head">
              <h3>Επιλογή κεφαλαίου</h3>
              <button className="btn-ghost" onClick={() => setDrawer(false)}>
                ✕ Κλείσιμο
              </button>
            </div>
            <div className="ch-list">
              {chapters.map((c, i) => {
                const p = PARTS[partIndex(c)];
                return (
                  <button
                    key={i}
                    className={"ch-item " + (i === ci ? "cur" : "")}
                    style={{ "--a": p.a, "--b": p.b } as CSSProperties}
                    onClick={() => {
                      setDrawer(false);
                      if (i !== ci) onChapter(i);
                    }}
                  >
                    <span className="ch-ico">{CH_ICONS[i]}</span>
                    <span className="ch-n">{pad2(i + 1)}</span>
                    <span className="ch-t">{stripNum(c.title)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
