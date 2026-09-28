import {
  createContext,
  Fragment,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Chapter, Slide } from "../lib/types";

/* ---------------- deck context ---------------- */
export interface DeckCtx {
  ci: number;
  ch: Chapter;
  slides: Slide[];
  idx: number;
  next?: Chapter;
  nextIdx?: number;
}
export const DeckContext = createContext<DeckCtx | null>(null);
export const useDeck = () => useContext(DeckContext)!;

/* ---------------- inline markup ---------------- */
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|(?<![\p{L}\d])_[^_\s][^_]*?_(?![\p{L}\d]))/gu;

export function M({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <span>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.startsWith("**") && p.endsWith("**") && p.length > 4)
          return (
            <strong key={i} className="hl">
              {p.slice(2, -2)}
            </strong>
          );
        if (p.startsWith("`") && p.endsWith("`") && p.length > 2)
          return (
            <code key={i} className="ic">
              {p.slice(1, -1)}
            </code>
          );
        if (p.startsWith("_") && p.endsWith("_") && p.length > 2)
          return (
            <em key={i} className="em">
              {p.slice(1, -1)}
            </em>
          );
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </span>
  );
}

/** text possibly containing fenced code blocks */
export function Rich({ text, code = true }: { text: string; code?: boolean }) {
  if (!code || !text.includes("```")) return <M text={text} />;
  const segs = text.split(/```(?:\w*)\n?([\s\S]*?)```/);
  return (
    <>
      {segs.map((s, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="term-pre">
            {s.trim()}
          </pre>
        ) : s.trim() ? (
          <span key={i} className="block">
            <M text={s.trim()} />
          </span>
        ) : null
      )}
    </>
  );
}

/* ---------------- Auto fit ---------------- */
export function AutoFit({
  children,
  min = 0.5,
  deps = "",
  className = "",
}: {
  children: ReactNode;
  min?: number;
  deps?: string;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  const sRef = useRef(1);

  useLayoutEffect(() => {
    const measure = () => {
      const o = outer.current;
      const i = inner.current;
      if (!o || !i) return;
      const prevT = i.style.transform;
      const prevW = i.style.width;
      const prevH = i.style.height;
      const availH = o.clientHeight;
      i.style.transform = "none";
      let sc = min;
      for (let c = 1; c >= min - 0.001; c -= 0.03) {
        i.style.width = `${100 / c}%`;
        i.style.height = "auto";
        const h = i.scrollHeight * c;
        const w = i.scrollWidth * c;
        if (h <= availH + 1 && w <= o.clientWidth + 1) {
          sc = c;
          break;
        }
      }
      i.style.transform = prevT;
      i.style.width = prevW;
      i.style.height = prevH;
      sc = Math.max(min, Math.floor(sc * 100) / 100);
      if (Math.abs(sc - sRef.current) > 0.004) {
        sRef.current = sc;
        setS(sc);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (outer.current) ro.observe(outer.current);
    if (inner.current) ro.observe(inner.current);
    const t = setTimeout(measure, 120);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [min, deps]);

  return (
    <div ref={outer} className={"relative min-h-0 flex-1 overflow-hidden " + className}>
      <div
        ref={inner}
        style={{
          width: `${100 / s}%`,
          transform: `scale(${s})`,
          transformOrigin: "top left",
          height: s < 1 ? `${100 / s}%` : "100%",
        }}
        className="flex flex-col"
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- small building blocks ---------------- */
export function Reveal({
  children,
  d = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  d?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={"rv " + className} style={{ ...style, animationDelay: `${d * 90}ms` }}>
      {children}
    </div>
  );
}

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={"chip " + className}>{children}</span>;
}

export function IconTile({ icon, size = 120 }: { icon: string; size?: number }) {
  return (
    <div
      className="icon-tile"
      style={{ width: size, height: size, fontSize: size * 0.52, borderRadius: size * 0.28 }}
    >
      {icon}
    </div>
  );
}

export function SlideTitle({
  eyebrow,
  title,
  badge,
  size = "lg",
}: {
  eyebrow?: string;
  title: ReactNode;
  badge?: ReactNode;
  size?: "lg" | "md";
}) {
  return (
    <div className="flex items-center gap-8" style={{ marginBottom: 28 }}>
      {badge && <div className="num-badge">{badge}</div>}
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className={size === "lg" ? "title-lg" : "title-md"}>{title}</h2>
      </div>
    </div>
  );
}
