import { useState } from "react";
import { fmtMin } from "../lib/build";
import { stripNum } from "../lib/meta";
import type { Block, SlideData } from "../lib/types";
import { Chip, IconTile, M, Reveal, Rich, SlideTitle, useDeck } from "./ui";

type Of<K extends SlideData["kind"]> = Extract<SlideData, { kind: K }>;

const clean = (s: string) => s.replace(/^[^\p{L}\d]+/u, "").trim();

/* ================= CLI INTRO ================= */
export function CliIntro() {
  const { ch } = useDeck();
  const cli = ch.cli;
  const prompt = (cli.meta[1] || "analyst@lab:~$").replace(/^[^\p{L}]+/u, "");
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow="Διαδραστικό εργαστήριο CLI" title={cli.title} badge="💻" size="md" />
      <div className="flex flex-1 gap-10 min-h-0">
        <div className="flex flex-col gap-6" style={{ width: 640 }}>
          <Reveal className="lead-box" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div className="body-t">{cli.desc}</div>
          </Reveal>
          <Reveal d={1} className="flex gap-4 flex-wrap">
            {cli.meta.map((m) => (
              <span key={m} className="pill">
                {m}
              </span>
            ))}
          </Reveal>
          <Reveal d={2} className="glass card-p" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div className="eyebrow mb-3">4 tasks</div>
            {cli.tasks.map((t) => (
              <div key={t.pill} className="flex gap-4 items-start body-t" style={{ fontSize: 26, marginBottom: 8 }}>
                <span className="mini-no" style={{ flexShrink: 0 }}>
                  {t.pill.replace("Task ", "")}
                </span>
                <span>{t.name}</span>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal d={1} className="terminal flex-1 min-w-0">
          <div className="term-bar">
            <i style={{ background: "#ff5f56" }} />
            <i style={{ background: "#ffbd2e" }} />
            <i style={{ background: "#27c93f" }} />
            <span>{prompt.replace(/\$$/, "").trim()}</span>
          </div>
          <div className="term-body">
            {cli.tasks.map((t, i) => (
              <div key={i} className="type-line" style={{ animationDelay: `${0.4 + i * 0.5}s` }}>
                <span className="text-emerald-400">{prompt} </span>
                <span>{t.cmd.replace(/^\$\s*/, "").split("\n")[0]}</span>
              </div>
            ))}
            <div className="mt-4">
              <span className="text-emerald-400">{prompt} </span>
              <span className="cursor" />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ================= CLI TASKS ================= */
export function CliTasks({ d }: { d: Of<"cliTasks"> }) {
  const { ch } = useDeck();
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow={ch.cli.title} title={d.tasks.map((t) => t.pill).join(" & ")} badge="⌨️" size="md" />
      <div className="grid flex-1 grid-cols-2 gap-7 min-h-0">
        {d.tasks.map((t, i) => (
          <Reveal key={t.pill} d={i} className="glass flex flex-col gap-4" style={{ padding: 34 }}>
            <div className="flex items-center gap-4">
              <span className="pill-solid">{t.pill}</span>
              <div className="task-name">{t.name}</div>
            </div>
            <div className="body-t" style={{ fontSize: 28 }}>
              <M text={t.instr} />
            </div>
            {t.hint && <div className="hint">💡 {t.hint}</div>}
            <div className="terminal" style={{ minHeight: 0 }}>
              <div className="term-bar">
                <i style={{ background: "#ff5f56" }} />
                <i style={{ background: "#ffbd2e" }} />
                <i style={{ background: "#27c93f" }} />
                <span>solution</span>
              </div>
              <pre className="term-body" style={{ fontSize: 24, margin: 0, whiteSpace: "pre-wrap" }}>
                {t.cmd}
              </pre>
            </div>
            <div className="ok-box">
              <b>✓ Επιτυχία:</b> {t.ok}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ================= LAB INTRO ================= */
export function LabIntro() {
  const { ch } = useDeck();
  const lab = ch.lab;
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow="Τεχνικό εργαστήριο · ~2 ώρες στο πλήρες βιβλίο" title={lab.title} badge="🧪" size="md" />
      <div className="flex flex-1 gap-8 min-h-0">
        <div className="flex flex-1 flex-col gap-6 min-w-0">
          <Reveal className="lead-box" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div className="body-t">{lab.desc}</div>
          </Reveal>
          <div className="flex gap-3 flex-wrap">
            {lab.meta.map((m) => (
              <span key={m} className="pill">
                {m}
              </span>
            ))}
          </div>
          <div className="flex flex-1 items-stretch gap-3">
            {lab.phases.map((p, i) => (
              <Reveal key={p.badge} d={i + 1} className="phase-chev flex-1">
                <div className="eyebrow">{p.badge}</div>
                <div className="chev-t">{clean(p.name)}</div>
                <div className="chev-d">{p.dur.replace(/^[^\p{L}\d]+/u, "")}</div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal d={2} className="glass" style={{ width: 640, padding: 34 }}>
          <div className="eyebrow mb-4">🖥️ Περιβάλλον & τοπολογία εργαστηρίου</div>
          <div className="flex flex-col gap-3">
            {lab.env.map((e, i) => (
              <div key={i} className="flex gap-4 items-start body-t" style={{ fontSize: 26 }}>
                <span className="bullet-dot" />
                <span>
                  <M text={e} />
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ================= PHASE ================= */
function StepBlock({ b }: { b: Block }) {
  if (b.type === "p")
    return (
      <div className="body-t" style={{ fontSize: 27 }}>
        <Rich text={b.text} />
      </div>
    );
  if (b.type === "code") return <pre className="term-pre">{b.text.trim()}</pre>;
  if (b.type === "ul")
    return (
      <div className="flex flex-col gap-2">
        {b.items.map((it, i) => (
          <div key={i} className="flex gap-3 body-t" style={{ fontSize: 26 }}>
            <span className="bullet-dot" />
            <M text={it} />
          </div>
        ))}
      </div>
    );
  if (b.type === "table")
    return (
      <div className="tbl-wrap">
        <table className="tbl small">
          <thead>
            <tr>
              {b.head.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={j === 0 ? "first" : ""}>
                    <M text={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return null;
}

export function PhaseSlide({ d }: { d: Of<"phase"> }) {
  const { ch } = useDeck();
  const p = d.p;
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow={`${ch.lab.title.slice(0, 70)}${ch.lab.title.length > 70 ? "…" : ""}`} title={clean(p.name)} badge={`P${d.n}`} size="md" />
      <div className="flex flex-1 gap-8 min-h-0">
        <Reveal className="glass flex flex-col gap-5" style={{ width: 640, padding: 34 }}>
          <div className="flex gap-3">
            <span className="pill-solid">{p.badge}</span>
            <span className="pill">{p.dur}</span>
          </div>
          <div className="eyebrow">🎯 Στόχοι</div>
          <div className="flex flex-col gap-3">
            {p.objs.map((o, i) => (
              <div key={i} className="flex gap-4 items-start body-t" style={{ fontSize: 27 }}>
                <span className="check" style={{ width: 40, height: 40, fontSize: 22, flexShrink: 0 }}>
                  ✓
                </span>
                <span>
                  <M text={o} />
                </span>
              </div>
            ))}
          </div>
        </Reveal>
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          <div className="eyebrow">⚙️ Βήματα</div>
          {p.steps.map((s, i) => (
            <Reveal key={i} d={i} className="step-card">
              <StepBlock b={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= CHECKLIST ================= */
export function ChecklistSlide() {
  const { ch, idx } = useDeck();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const items = ch.lab.checklist;
  const n = items.filter((_, i) => done[`${idx}-${i}`]).length;
  const pct = items.length ? n / items.length : 0;
  const R = 110;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow="Πριν παραδώσετε το εργαστήριο" title="Λίστα επαλήθευσης" badge="📋" />
      <div className="flex flex-1 gap-10 min-h-0">
        <div className="flex flex-1 flex-col justify-center gap-4">
          {items.map((it, i) => {
            const k = `${idx}-${i}`;
            return (
              <button key={i} className={"chk-row " + (done[k] ? "on" : "")} onClick={() => setDone((x) => ({ ...x, [k]: !x[k] }))}>
                <span className="chk-box">{done[k] ? "✓" : ""}</span>
                <span className="body-t text-left" style={{ fontSize: 30 }}>
                  <M text={it} />
                </span>
              </button>
            );
          })}
        </div>
        <Reveal className="glass flex flex-col items-center justify-center" style={{ width: 520 }}>
          <svg width="290" height="290" viewBox="0 0 290 290">
            <circle cx="145" cy="145" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="24" />
            <circle
              cx="145"
              cy="145"
              r={R}
              fill="none"
              stroke="var(--a)"
              strokeWidth="24"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct)}
              transform="rotate(-90 145 145)"
              style={{ transition: "stroke-dashoffset .5s" }}
            />
            <text x="145" y="165" textAnchor="middle" fill="#fff" fontSize="72" fontWeight="800">
              {n}/{items.length}
            </text>
          </svg>
          <div className="eyebrow mt-4">Κάντε κλικ σε κάθε κριτήριο</div>
        </Reveal>
      </div>
    </div>
  );
}

/* ================= PROJECTS ================= */
export function ProjectIntro({ d }: { d: Of<"projectIntro"> }) {
  const { ch } = useDeck();
  const p = ch.projects[d.pi];
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow={clean(p.badge)} title={p.title} badge={d.pi === 0 ? "🚀" : "⚡"} size="md" />
      <div className="flex flex-1 gap-8 min-h-0">
        <div className="flex flex-1 flex-col gap-5 min-w-0">
          <Reveal className="lead-box" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div className="body-t" style={{ fontSize: 29 }}>
              {p.desc}
            </div>
          </Reveal>
          <div className="eyebrow">📍 Ορόσημα υλοποίησης</div>
          <div className="grid grid-cols-2 gap-4">
            {p.milestones.map((m, i) => (
              <Reveal key={m.num} d={i} className="ms-mini">
                <span className="mini-no">{m.num}</span>
                <span className="ms-mini-t">{m.title}</span>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal d={2} className="glass flex flex-col gap-4" style={{ width: 620, padding: 34 }}>
          <div className="eyebrow">📦 Παραδοτέα έργου</div>
          {p.deliverables.map((x, i) => (
            <div key={i} className="flex gap-4 items-start body-t" style={{ fontSize: 26 }}>
              <span className="bullet-dot" />
              <M text={x} />
            </div>
          ))}
          <div className="mt-auto flex gap-3 flex-wrap">
            {p.meta.filter(Boolean).map((m) => (
              <Chip key={m}>{m}</Chip>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export function MilestonesSlide({ d }: { d: Of<"milestones"> }) {
  const { ch } = useDeck();
  const p = ch.projects[d.pi];
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow={clean(p.badge)} title="Ορόσημα & τεχνικές προδιαγραφές" badge="📍" size="md" />
      <div className="grid flex-1 grid-cols-2 gap-5 min-h-0">
        {d.ms.map((m, i) => (
          <Reveal key={m.num} d={i} className="glass flex flex-col gap-3" style={{ padding: 28 }}>
            <div className="flex items-center gap-4">
              <span className="mini-no">{m.num}</span>
              <div className="ms-title">{m.title}</div>
            </div>
            <div className="body-t" style={{ fontSize: 23, opacity: 0.8 }}>
              {m.desc}
            </div>
            <div className="flex flex-col gap-2">
              {m.spec.slice(0, 3).map((s, k) => (
                <div key={k} className="flex gap-3 body-t" style={{ fontSize: 23 }}>
                  <span className="bullet-dot" />
                  <M text={s} />
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ================= QUIZ ================= */
export function QuizSlide({ d }: { d: Of<"quiz"> }) {
  const { ch, idx } = useDeck();
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [pick, setPick] = useState<Record<string, string>>({});
  const all = d.items.every((it) => shown[`${idx}-${it.n}`]);
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <SlideTitle eyebrow={ch.quizTitle || "Κουίζ κεφαλαίου"} title={`Ερωτήσεις ${d.items[0].n}–${d.items[d.items.length - 1].n}`} badge="❓" size="md" />
        <button
          className="btn-solid"
          onClick={() => {
            const next: Record<string, boolean> = {};
            d.items.forEach((it) => (next[`${idx}-${it.n}`] = !all));
            setShown((s) => ({ ...s, ...next }));
          }}
        >
          {all ? "🙈 Απόκρυψη απαντήσεων" : "🎯 Εμφάνιση απαντήσεων"}
        </button>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-6 min-h-0">
        {d.items.map(({ n, q }) => {
          const key = `${idx}-${n}`;
          const rev = shown[key];
          return (
            <div key={n} className="glass flex flex-col gap-3" style={{ padding: 28 }}>
              <div className="flex gap-4 items-start">
                <span className="q-badge">Q{n}</span>
                <div className="body-t" style={{ fontSize: 26, fontWeight: 600 }}>
                  <M text={q.q} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {q.opts.map((o) => {
                  const correct = rev && o.k === q.ans;
                  const wrong = pick[key] === o.k && rev && o.k !== q.ans;
                  return (
                    <button
                      key={o.k}
                      onClick={() => {
                        setPick((p) => ({ ...p, [key]: o.k }));
                        setShown((s) => ({ ...s, [key]: true }));
                      }}
                      className={"opt " + (correct ? "correct" : wrong ? "wrong" : "")}
                    >
                      <b>{o.k}</b>
                      <span>
                        <M text={o.v} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {rev && (
                <div className="exp">
                  <b>💡 Αιτιολόγηση:</b> <M text={q.exp} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= INCIDENT ================= */
export function IncidentSlide({ d }: { d: Of<"incident"> }) {
  const i = d.i;
  return (
    <div className="flex flex-1 gap-8 min-h-0">
      <Reveal className="incident-side">
        <div className="pill-solid" style={{ alignSelf: "flex-start" }}>
          🔥 Πραγματικό περιστατικό #{d.n}
        </div>
        <div className="incident-year">{i.year}</div>
        <IconTile icon={i.icon} size={150} />
        <div className="incident-name">{i.name}</div>
        <div className="incident-org">{i.org}</div>
        <Chip>{i.tag}</Chip>
      </Reveal>
      <div className="flex flex-1 flex-col gap-5 min-w-0">
        <div className="eyebrow">Τι συνέβη</div>
        <div className="flex flex-col gap-4">
          {i.story.map((s, k) => (
            <Reveal key={k} d={k} className="step-row">
              <div className="step-dot">{k + 1}</div>
              <div className="body-t">
                <M text={s} />
              </div>
            </Reveal>
          ))}
        </div>
        <div className="flex gap-5">
          {i.stats.map((s, k) => (
            <Reveal key={k} d={k + 3} className="stat-card flex-1">
              <div className="stat-big">{s.v}</div>
              <div className="stat-lab">{s.l}</div>
            </Reveal>
          ))}
        </div>
        <Reveal d={6} className="lesson">
          <div className="eyebrow" style={{ color: "#fff" }}>
            🎓 Μάθημα · σύνδεση με «{i.concept}»
          </div>
          <div className="lesson-t">
            <M text={i.lesson} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ================= CLOSING ================= */
export function ClosingSlide() {
  const { ch, slides, next, nextIdx } = useDeck();
  const total = slides[slides.length - 1].end;
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center gap-8">
      <Reveal>
        <IconTile icon="🎓" size={170} />
      </Reveal>
      <Reveal d={1}>
        <h2 className="cover-title" style={{ fontSize: 88 }}>
          Ερωτήσεις & συζήτηση
        </h2>
      </Reveal>
      <Reveal d={2} className="body-t" style={{ fontSize: 34, maxWidth: 1300 }}>
        Ολοκληρώσαμε το «{stripNum(ch.title)}» · διάρκεια {fmtMin(total)} ώρες · {slides.length} διαφάνειες
      </Reveal>
      {next && (
        <Reveal d={3} className="lead-box" style={{ maxWidth: 1300 }}>
          <div className="text-left">
            <div className="eyebrow">Επόμενο κεφάλαιο</div>
            <div className="lead-t" style={{ fontSize: 40 }}>
              {nextIdx! + 1}. {stripNum(next.title)}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
