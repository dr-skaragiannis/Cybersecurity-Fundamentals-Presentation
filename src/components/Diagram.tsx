import type { CSSProperties } from "react";
import type { Diagram, DiagramNode } from "../lib/types";
import { M, Reveal, SlideTitle } from "./ui";

const PAL = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#fb7185", "#60a5fa", "#fb923c"];
const pal = (i: number) => PAL[i % PAL.length];

function NodeNo({ i, size = 56 }: { i: number; size?: number }) {
  return (
    <span
      className="node-no"
      style={{ width: size, height: size, fontSize: size * 0.5, background: pal(i), boxShadow: `0 0 0 6px ${pal(i)}33` }}
    >
      {i + 1}
    </span>
  );
}

/* ---------- FLOW ---------- */
function Flow({ nodes }: { nodes: DiagramNode[] }) {
  const n = nodes.length;
  const small = n > 5;
  return (
    <div className="flex flex-1 items-stretch justify-center min-h-0">
      {nodes.map((nd, i) => (
        <div key={i} className="flex items-stretch" style={{ flex: 1, minWidth: 0 }}>
          <Reveal d={i} className="dg-card flex-1" style={{ borderTop: `8px solid ${pal(i)}` }}>
            <NodeNo i={i} size={small ? 48 : 60} />
            <div className="dg-t" style={{ fontSize: small ? 28 : 34 }}>
              {nd.t}
            </div>
            {nd.d && (
              <div className="dg-d" style={{ fontSize: small ? 22 : 26 }}>
                <M text={nd.d} />
              </div>
            )}
          </Reveal>
          {i < n - 1 && (
            <div className="flex items-center" style={{ width: small ? 34 : 50 }}>
              <svg viewBox="0 0 50 40" width="100%" height="40">
                <path d="M4 20 H36 M26 8 L40 20 L26 32" stroke="var(--a)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- CYCLE ---------- */
function Cycle({ nodes, center }: { nodes: DiagramNode[]; center?: string }) {
  const n = nodes.length;
  const rx = 33;
  const ry = 36;
  const pos = (k: number) => {
    const a = (-90 + (k * 360) / n) * (Math.PI / 180);
    return { x: 50 + rx * Math.cos(a), y: 50 + ry * Math.sin(a), a };
  };
  return (
    <div className="flex flex-1 gap-8 min-h-0">
      <div className="relative" style={{ width: 860, minHeight: 560 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <ellipse cx="50" cy="50" rx={rx} ry={ry} fill="none" stroke="var(--a)" strokeWidth="2.5" strokeDasharray="1.2 1.6" vectorEffect="non-scaling-stroke" opacity=".7" />
        </svg>
        {nodes.map((_, k) => {
          const mid = (-90 + ((k + 0.5) * 360) / n) * (Math.PI / 180);
          const x = 50 + rx * Math.cos(mid);
          const y = 50 + ry * Math.sin(mid);
          const rot = (Math.atan2(ry * Math.cos(mid), -rx * Math.sin(mid)) * 180) / Math.PI;
          return (
            <div
              key={"a" + k}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) rotate(${rot}deg)`, color: "var(--a)", fontSize: 44, lineHeight: 1 }}
            >
              ➤
            </div>
          );
        })}
        {center && (
          <div className="absolute flex items-center justify-center text-center dg-center" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
            {center}
          </div>
        )}
        {nodes.map((nd, k) => {
          const p = pos(k);
          return (
            <Reveal
              key={k}
              d={k}
              className="dg-pill"
              style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", borderColor: pal(k) } as CSSProperties}
            >
              <NodeNo i={k} size={44} />
              <span>{nd.t}</span>
            </Reveal>
          );
        })}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 min-w-0">
        {nodes.map((nd, k) => (
          <Reveal key={k} d={k} className="dg-line">
            <b style={{ color: pal(k) }}>{nd.t}</b>
            <span>
              <M text={nd.d ?? ""} />
            </span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ---------- LAYERS (concentric) ---------- */
function Layers({ nodes }: { nodes: DiagramNode[] }) {
  const n = nodes.length;
  const R = 300;
  const band = R / n;
  return (
    <div className="flex flex-1 gap-10 min-h-0 items-center">
      <div className="flex items-center justify-center" style={{ width: 760, height: "100%", minHeight: 520 }}>
        <svg viewBox="0 0 640 640" style={{ height: "100%", maxHeight: 640 }}>
          {nodes.map((nd, i) => {
            const r = R - i * band + 14;
            return (
              <g key={i}>
                <circle cx="320" cy="320" r={r} fill={pal(i)} fillOpacity={0.16 + i * 0.05} stroke={pal(i)} strokeWidth="3" />
                <text x="320" y={320 - r + band * 0.55} textAnchor="middle" fill="#fff" fontSize={i === n - 1 ? 26 : 23} fontWeight="700">
                  {i === n - 1 ? nd.t : nd.t.length > 22 ? nd.t.slice(0, 21) + "…" : nd.t}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 min-w-0">
        {nodes.map((nd, i) => (
          <Reveal key={i} d={i} className="dg-line">
            <b style={{ color: pal(i) }}>{nd.t}</b>
            <span>
              <M text={nd.d ?? ""} />
            </span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ---------- STACK ---------- */
function Stack({ nodes }: { nodes: DiagramNode[] }) {
  return (
    <div className="flex flex-1 flex-col gap-3 min-h-0">
      {nodes.map((nd, i) => (
        <Reveal key={i} d={i} className="stack-row flex-1" style={{ borderLeft: `14px solid ${pal(i)}` }}>
          <NodeNo i={i} size={52} />
          <div className="stack-t">{nd.t}</div>
          <div className="stack-d">
            <M text={nd.d ?? ""} />
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- HUB ---------- */
function Hub({ nodes, center }: { nodes: DiagramNode[]; center?: string }) {
  const n = nodes.length;
  const rx = 36;
  const ry = 33;
  return (
    <div className="relative flex-1 min-h-0" style={{ minHeight: 600 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {nodes.map((_, i) => {
          const a = (-90 + (i * 360) / n) * (Math.PI / 180);
          return (
            <line key={i} x1="50" y1="50" x2={50 + rx * Math.cos(a)} y2={50 + ry * Math.sin(a)} stroke={pal(i)} strokeWidth="3" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" opacity=".8" />
          );
        })}
      </svg>
      <div className="absolute dg-center" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 250, height: 250 }}>
        {center}
      </div>
      {nodes.map((nd, i) => {
        const a = (-90 + (i * 360) / n) * (Math.PI / 180);
        return (
          <Reveal
            key={i}
            d={i}
            className="dg-card"
            style={{
              position: "absolute",
              left: `${50 + rx * Math.cos(a)}%`,
              top: `${50 + ry * Math.sin(a)}%`,
              transform: "translate(-50%,-50%)",
              width: 470,
              zIndex: 2,
              background: "#0f1a36",
              padding: "16px 22px",
              borderLeft: `8px solid ${pal(i)}`,
              alignItems: "flex-start",
              gap: 4,
            }}
          >
            <div className="dg-t" style={{ fontSize: 28 }}>
              {nd.t}
            </div>
            {nd.d && (
              <div className="dg-d" style={{ fontSize: 21 }}>
                <M text={nd.d} />
              </div>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

/* ---------- TRIANGLE ---------- */
function Triangle({ nodes, center }: { nodes: DiagramNode[]; center?: string }) {
  const P = [
    { x: 50, y: 14 },
    { x: 16, y: 84 },
    { x: 84, y: 84 },
  ];
  return (
    <div className="relative flex-1 min-h-0" style={{ minHeight: 560 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <polygon points={P.map((p) => `${p.x},${p.y}`).join(" ")} fill="rgba(255,255,255,.04)" stroke="var(--a)" strokeWidth="4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {center && (
        <div className="absolute dg-center" style={{ left: "50%", top: "58%", transform: "translate(-50%,-50%)", width: 240, height: 240, fontSize: 30 }}>
          {center}
        </div>
      )}
      {nodes.slice(0, 3).map((nd, i) => (
        <Reveal
          key={i}
          d={i}
          className="dg-card"
          style={{
            position: "absolute",
            left: `${P[i].x}%`,
            top: `${P[i].y}%`,
            transform: "translate(-50%,-50%)",
            width: 560,
            zIndex: 2,
            background: "#0f1a36",
            padding: "18px 26px",
            borderTop: `8px solid ${pal(i)}`,
            gap: 4,
          }}
        >
          <div className="dg-t" style={{ fontSize: 34 }}>
            {nd.t}
          </div>
          {nd.d && (
            <div className="dg-d" style={{ fontSize: 23 }}>
              <M text={nd.d} />
            </div>
          )}
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- TIMELINE ---------- */
function Timeline({ nodes }: { nodes: DiagramNode[] }) {
  const n = nodes.length;
  const pad = (100 - 0.75 * (n - 1)) / (n + 1);
  const step = n > 1 ? (100 - 2 * pad) / (n - 1) : 0;
  const cw = 2 * step - 1.5;
  return (
    <div className="relative flex-1 min-h-0" style={{ minHeight: 560 }}>
      <div className="absolute left-0 right-0" style={{ top: "50%", height: 8, background: "linear-gradient(90deg,var(--a),var(--b))", borderRadius: 8 }} />
      {nodes.map((nd, i) => {
        const up = i % 2 === 0;
        const left = n > 1 ? pad + i * step : 50;
        return (
          <div key={i}>
            <div className="absolute" style={{ left: `${left}%`, top: "50%", transform: "translate(-50%,-50%)", width: 40, height: 40, borderRadius: 40, background: "#0b1220", border: `8px solid ${pal(i)}` }} />
            <div
              className="absolute"
              style={{ left: `${left}%`, [up ? "bottom" : "top"]: "50%", width: 4, height: 34, background: pal(i), transform: "translateX(-50%)", [up ? "marginBottom" : "marginTop"]: 20 }}
            />
            <Reveal
              d={i}
              className="dg-card"
              style={{
                position: "absolute",
                left: `${left}%`,
                transform: "translateX(-50%)",
                [up ? "bottom" : "top"]: "calc(50% + 56px)",
                width: `calc(${cw}% - 8px)`,
                padding: "16px 20px",
                borderTop: `6px solid ${pal(i)}`,
                gap: 6,
              }}
            >
              <div className="dg-t" style={{ fontSize: 30, color: pal(i) }}>
                {nd.t}
              </div>
              {nd.d && (
                <div className="dg-d" style={{ fontSize: 22 }}>
                  <M text={nd.d} />
                </div>
              )}
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- COMPARE ---------- */
function Compare({ nodes }: { nodes: DiagramNode[] }) {
  return (
    <div className="relative flex flex-1 gap-8 min-h-0">
      {nodes.slice(0, 2).map((nd, i) => (
        <Reveal key={i} d={i} className="glass flex flex-1 flex-col gap-4" style={{ padding: 32, borderTop: `10px solid ${pal(i * 2 + 1)}` }}>
          <div className="dg-t" style={{ fontSize: 40, color: pal(i * 2 + 1) }}>
            {nd.t}
          </div>
          {nd.d && (
            <div className="dg-d" style={{ fontSize: 26 }}>
              <M text={nd.d} />
            </div>
          )}
          <div className="flex flex-col gap-3">
            {(nd.items ?? []).map((it, k) => (
              <div key={k} className="flex gap-4 items-start body-t" style={{ fontSize: 28 }}>
                <span className="bullet-dot" style={{ background: pal(i * 2 + 1) }} />
                <M text={it} />
              </div>
            ))}
          </div>
        </Reveal>
      ))}
      <div className="vs-badge">VS</div>
    </div>
  );
}

/* ---------- MATRIX ---------- */
function Matrix({ nodes, axes }: { nodes: DiagramNode[]; axes?: [string, string] }) {
  return (
    <div className="flex flex-1 min-h-0 gap-4">
      <div className="axis-y">
        <span>{axes?.[1] ?? ""}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 min-w-0">
        <div className="grid flex-1 grid-cols-2 gap-4">
          {nodes.slice(0, 4).map((nd, i) => (
            <Reveal key={i} d={i} className="dg-card" style={{ alignItems: "flex-start", background: `${pal(i * 2 + 4)}1a`, border: `2px solid ${pal(i * 2 + 4)}66`, padding: "22px 30px", gap: 8 }}>
              <div className="dg-t" style={{ fontSize: 34, color: pal(i * 2 + 4) }}>
                {nd.t}
              </div>
              {nd.d && (
                <div className="dg-d" style={{ fontSize: 25 }}>
                  <M text={nd.d} />
                </div>
              )}
            </Reveal>
          ))}
        </div>
        <div className="axis-x">{axes?.[0] ?? ""}</div>
      </div>
    </div>
  );
}

/* ---------- FUNNEL ---------- */
function Funnel({ nodes }: { nodes: DiagramNode[] }) {
  const n = nodes.length;
  return (
    <div className="flex flex-1 flex-col gap-3 min-h-0">
      {nodes.map((nd, i) => (
        <div key={i} className="flex flex-1 items-stretch gap-6">
          <div style={{ width: 880 }} className="flex justify-center">
            <Reveal
              d={i}
              className="funnel-bar"
              style={{ width: `${100 - (i * 55) / Math.max(1, n - 1)}%`, background: `linear-gradient(90deg,${pal(i)}dd,${pal(i)}88)` }}
            >
              <NodeNo i={i} size={46} />
              <span>{nd.t}</span>
            </Reveal>
          </div>
          <div className="dg-d flex items-center flex-1" style={{ fontSize: 26 }}>
            <M text={nd.d ?? ""} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DiagramSlide({ d, secLabel }: { d: Diagram; secLabel: string }) {
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow={d.subtitle ?? secLabel} title={d.title} badge="🧭" size="md" />
      <div className="flex flex-1 flex-col min-h-0" style={{ paddingBottom: 6 }}>
        {d.kind === "flow" && <Flow nodes={d.nodes} />}
        {d.kind === "cycle" && <Cycle nodes={d.nodes} center={d.center} />}
        {d.kind === "layers" && <Layers nodes={d.nodes} />}
        {d.kind === "stack" && <Stack nodes={d.nodes} />}
        {d.kind === "hub" && <Hub nodes={d.nodes} center={d.center} />}
        {d.kind === "triangle" && <Triangle nodes={d.nodes} center={d.center} />}
        {d.kind === "timeline" && <Timeline nodes={d.nodes} />}
        {d.kind === "compare" && <Compare nodes={d.nodes} />}
        {d.kind === "matrix" && <Matrix nodes={d.nodes} axes={d.axes} />}
        {d.kind === "funnel" && <Funnel nodes={d.nodes} />}
      </div>
      <Reveal d={6} className="note-strip">
        <span style={{ fontSize: 34 }}>💡</span>
        <span>
          <M text={d.note} />
        </span>
      </Reveal>
    </div>
  );
}
