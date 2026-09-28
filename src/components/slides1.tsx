import { useEffect, useState } from "react";
import { splitSentences, keywords, fmtMin } from "../lib/build";
import { CALLOUT_META, CH_ICONS, pad2, stripNum } from "../lib/meta";
import type { Block, SlideData } from "../lib/types";
import { Chip, IconTile, M, Reveal, SlideTitle, useDeck } from "./ui";

type Of<K extends SlideData["kind"]> = Extract<SlideData, { kind: K }>;

/* ================= COVER ================= */
export function Cover() {
  const { ch, ci, slides } = useDeck();
  const subs = ch.subtitle.split("·").map((s) => s.trim()).filter(Boolean);
  const icon = CH_ICONS[ci];
  return (
    <div className="flex flex-1 items-center gap-16">
      <div className="flex-1 min-w-0">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="pill-solid">{ch.part.split("|")[0].trim()}</span>
            <span className="pill">⏱ 3 ώρες διδασκαλίας</span>
          </div>
        </Reveal>
        <Reveal d={1}>
          <div className="cover-no">ΚΕΦΑΛΑΙΟ {pad2(ci + 1)}</div>
        </Reveal>
        <Reveal d={2}>
          <h1 className="cover-title">{stripNum(ch.title)}</h1>
        </Reveal>
        <Reveal d={3}>
          <div className="mt-10 flex flex-wrap gap-3">
            {subs.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </Reveal>
        <Reveal d={4}>
          <div className="mt-12 flex gap-12">
            <Stat v={String(slides.length)} l="διαφάνειες" />
            <Stat v={String(ch.sections.length)} l="ενότητες θεωρίας" />
            <Stat v="2" l="εργαστήρια + 2 έργα" />
            <Stat v={String(ch.quiz.length)} l="ερωτήσεις κουίζ" />
          </div>
        </Reveal>
      </div>
      <div className="relative shrink-0" style={{ width: 700, height: 700 }}>
        <svg viewBox="0 0 700 700" className="absolute inset-0">
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--a)" />
              <stop offset="1" stopColor="var(--b)" />
            </linearGradient>
          </defs>
          <g className="spin-slow" style={{ transformOrigin: "350px 350px" }}>
            <circle cx="350" cy="350" r="320" fill="none" stroke="url(#cg)" strokeWidth="2" strokeDasharray="4 14" opacity=".8" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <circle key={a} cx={350 + 320 * Math.cos((a * Math.PI) / 180)} cy={350 + 320 * Math.sin((a * Math.PI) / 180)} r="9" fill="url(#cg)" />
            ))}
          </g>
          <g className="spin-rev" style={{ transformOrigin: "350px 350px" }}>
            <circle cx="350" cy="350" r="250" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
            {[30, 150, 270].map((a) => (
              <circle key={a} cx={350 + 250 * Math.cos((a * Math.PI) / 180)} cy={350 + 250 * Math.sin((a * Math.PI) / 180)} r="14" fill="none" stroke="url(#cg)" strokeWidth="4" />
            ))}
          </g>
          <circle cx="350" cy="350" r="180" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.12)" />
          <path d="M350 130 L520 195 V350 C520 450 440 520 350 560 C260 520 180 450 180 350 V195 Z" fill="url(#cg)" opacity=".16" />
          <path d="M350 130 L520 195 V350 C520 450 440 520 350 560 C260 520 180 450 180 350 V195 Z" fill="none" stroke="url(#cg)" strokeWidth="5" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 210 }}>
          <span style={{ filter: "drop-shadow(0 12px 40px rgba(var(--glow),.55))" }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <div className="stat-v">{v}</div>
      <div className="stat-l">{l}</div>
    </div>
  );
}

/* ================= AGENDA ================= */
const GROUPS: { name: string; color: string; kinds: SlideData["kind"][] }[] = [
  { name: "Εισαγωγή", color: "#94a3b8", kinds: ["cover", "agenda", "outcomes", "intro"] },
  {
    name: "Θεωρία & περιστατικά",
    color: "var(--a)",
    kinds: ["text", "table", "callout", "diagram", "incident", "myths", "break", "terms", "summary", "review"],
  },
  { name: "Εργαστήρια", color: "#38bdf8", kinds: ["cliIntro", "cliTasks", "labIntro", "phase", "checklist"] },
  { name: "Έργα", color: "#c084fc", kinds: ["projectIntro", "milestones"] },
  { name: "Κουίζ & κλείσιμο", color: "#f472b6", kinds: ["quiz", "closing"] },
];

export function Agenda() {
  const { ch, slides } = useDeck();
  const secStart = ch.sections.map((_, si) => {
    const s = slides.find((x) => "sec" in x.data && (x.data as { sec: number }).sec === si && x.data.kind !== "diagram");
    return s ? s.start : 0;
  });
  const groups = GROUPS.map((g) => ({
    ...g,
    min: slides.filter((s) => g.kinds.includes(s.data.kind)).reduce((a, s) => a + s.weight, 0),
  }));
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow="Πλάνο διδασκαλίας" title="Οδικός χάρτης των 3 ωρών" badge="🗺️" />
      <div className="flex flex-1 gap-12 min-h-0">
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {ch.sections.map((s, i) => (
            <Reveal key={s.id} d={i} className="agenda-row">
              <div className="agenda-no">{s.id}</div>
              <div className="flex-1 min-w-0 agenda-t">{s.title}</div>
              <div className="agenda-time">{fmtMin(secStart[i])}</div>
            </Reveal>
          ))}
        </div>
        <div className="flex flex-col gap-6" style={{ width: 640 }}>
          <Reveal d={2} className="glass" style={{ padding: 36 }}>
            <div className="eyebrow mb-4">Κατανομή χρόνου (180′)</div>
            <div className="flex overflow-hidden rounded-2xl" style={{ height: 56 }}>
              {groups.map((g) => (
                <div key={g.name} style={{ width: `${(g.min / 180) * 100}%`, background: g.color }} />
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {groups.map((g) => (
                <div key={g.name} className="flex items-center gap-4 legend">
                  <span className="dot" style={{ background: g.color }} />
                  <span className="flex-1">{g.name}</span>
                  <b>{Math.round(g.min)}′</b>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal d={3} className="glass flex items-center gap-6" style={{ padding: 28 }}>
            <IconTile icon="📈" size={92} />
            <div className="legend" style={{ lineHeight: 1.35 }}>
              Ενδιάμεσο διάλειμμα 5′ · κουίζ αξιολόγησης στο τέλος · εργαστήρια με εντολές CLI
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ================= OUTCOMES ================= */
export function Outcomes() {
  const { ch } = useDeck();
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow="Στο τέλος του κεφαλαίου θα μπορείτε…" title="Μαθησιακά αποτελέσματα" badge="🎯" />
      <div className="flex flex-1 flex-col gap-4 justify-center">
        {ch.outcomes.map((o, i) => (
          <Reveal key={i} d={i} className="outcome-row">
            <div className="check">✓</div>
            <div className="outcome-t">
              <M text={o} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ================= TEXT ================= */
export function TextSlide({
  heading,
  no,
  opener,
  text,
  layout,
  icon,
  eyebrow,
}: {
  heading: string;
  no: string;
  opener: boolean;
  text: string;
  layout: number;
  icon: string;
  eyebrow?: string;
}) {
  const sents = splitSentences(text);
  const lead = sents[0];
  const rest = sents.slice(1);
  const kws = keywords(text);
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle
        eyebrow={eyebrow ?? (opener ? "Νέα ενότητα" : "Συνέχεια ενότητας")}
        title={heading}
        badge={no}
        size={opener ? "lg" : "md"}
      />
      {layout === 0 && <LayoutCards lead={lead} rest={rest} icon={icon} kws={kws} />}
      {layout === 1 && <LayoutSplit sents={sents} icon={icon} kws={kws} />}
      {layout === 2 && <LayoutFocus lead={lead} rest={rest} icon={icon} kws={kws} />}
    </div>
  );
}

function LayoutCards({ lead, rest, icon, kws }: { lead: string; rest: string[]; icon: string; kws: string[] }) {
  const cols = rest.length <= 1 ? 1 : rest.length === 2 ? 2 : rest.length === 4 ? 2 : 3;
  return (
    <div className="flex flex-1 flex-col gap-6 min-h-0">
      <Reveal className="lead-box">
        <div className="flex-1 min-w-0 lead-t">
          <M text={lead} />
        </div>
        <IconTile icon={icon} size={150} />
      </Reveal>
      {rest.length > 0 && (
        <div className="grid flex-1 gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {rest.map((s, i) => (
            <Reveal key={i} d={i + 1} className="glass card-p">
              <div className="mini-no">{i + 2}</div>
              <div className="body-t">
                <M text={s} />
              </div>
            </Reveal>
          ))}
        </div>
      )}
      {kws.length > 0 && <KeywordRow kws={kws} />}
    </div>
  );
}

function KeywordRow({ kws }: { kws: string[] }) {
  return (
    <Reveal d={5} className="flex flex-wrap items-center gap-3">
      <span className="eyebrow" style={{ marginRight: 8 }}>
        Λέξεις-κλειδιά
      </span>
      {kws.map((k) => (
        <Chip key={k}>{k}</Chip>
      ))}
    </Reveal>
  );
}

function LayoutSplit({ sents, icon, kws }: { sents: string[]; icon: string; kws: string[] }) {
  return (
    <div className="flex flex-1 gap-10 min-h-0">
      <Reveal className="glass flex flex-col items-center gap-8" style={{ width: 520, padding: 40 }}>
        <IconTile icon={icon} size={230} />
        <div className="w-full">
          <div className="eyebrow mb-4 text-center">Λέξεις-κλειδιά</div>
          <div className="flex flex-wrap justify-center gap-3">
            {kws.length ? kws.map((k) => <Chip key={k}>{k}</Chip>) : <Chip>Ασφάλεια</Chip>}
          </div>
        </div>
      </Reveal>
      <div className="flex flex-1 flex-col justify-center gap-5 min-w-0">
        {sents.map((s, i) => (
          <Reveal key={i} d={i} className="step-row">
            <div className="step-dot">{i + 1}</div>
            <div className={i === 0 ? "lead-t2" : "body-t"}>
              <M text={s} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function LayoutFocus({ lead, rest, icon, kws }: { lead: string; rest: string[]; icon: string; kws: string[] }) {
  return (
    <div className="flex flex-1 flex-col gap-7 min-h-0">
      <Reveal className="focus-box">
        <div className="quote-mark">“</div>
        <div className="focus-t">
          <M text={lead} />
        </div>
        <div className="focus-icon">{icon}</div>
      </Reveal>
      {rest.length > 0 && (
        <div className="flex flex-1 gap-5">
          {rest.map((s, i) => (
            <Reveal key={i} d={i + 1} className="glass card-p flex-1" style={{ borderTop: "6px solid var(--a)" }}>
              <div className="body-t">
                <M text={s} />
              </div>
            </Reveal>
          ))}
        </div>
      )}
      {kws.length > 0 && <KeywordRow kws={kws} />}
    </div>
  );
}

export function TextFromSlide({ d }: { d: Of<"text"> }) {
  const { ch } = useDeck();
  const sec = ch.sections[d.sec];
  return <TextSlide heading={sec.title} no={sec.id} opener={d.opener} text={d.text} layout={d.layout} icon={d.icon} />;
}

export function IntroSlide({ d }: { d: Of<"intro"> }) {
  const { ch } = useDeck();
  return (
    <TextSlide
      heading={d.idx === 0 ? "Γιατί αυτό το κεφάλαιο;" : "Πώς θα κινηθούμε"}
      no={d.idx === 0 ? "★" : "➜"}
      opener={d.idx === 0}
      text={ch.intro[d.idx]}
      layout={d.idx === 0 ? 1 : 0}
      icon={d.idx === 0 ? "🧭" : "🗺️"}
      eyebrow="Εισαγωγή κεφαλαίου"
    />
  );
}

/* ================= CALLOUT ================= */
export function CalloutSlide({ d }: { d: Of<"callout"> }) {
  const { ch } = useDeck();
  const sec = ch.sections[d.sec];
  const meta = CALLOUT_META[d.block.kind] ?? CALLOUT_META.note;
  const sents = splitSentences(d.block.text);
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow={`${sec.id} · ${sec.title}`} title={d.block.title.replace(/^[^\p{L}]+/u, "") || meta.label} badge={meta.icon} size="md" />
      <div className="flex flex-1 gap-8 min-h-0">
        <Reveal className="callout-side">
          <div style={{ fontSize: 190 }}>{meta.icon}</div>
          <div className="pill-solid" style={{ marginTop: 20 }}>
            {meta.label}
          </div>
        </Reveal>
        <div className="flex flex-1 flex-col justify-center gap-5 min-w-0">
          {sents.map((s, i) => (
            <Reveal key={i} d={i} className={i === 0 ? "lead-box" : "glass card-p"}>
              <div className={i === 0 ? "lead-t" : "body-t"}>
                <M text={s} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= TABLE ================= */
export function TableSlide({ d }: { d: Of<"table"> }) {
  const { ch } = useDeck();
  const sec = ch.sections[d.sec];
  const b = d.block as Extract<Block, { type: "table" }>;
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow={`${sec.id} · ${sec.title}`} title={b.caption.replace(/^Πίνακας\s[\w.]+\s—\s/, "") || "Πίνακας"} badge="📊" size="md" />
      <Reveal className="flex-1 min-h-0">
        <div className="tbl-wrap">
          <table className="tbl">
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
      </Reveal>
      <div className="mt-5 eyebrow">{b.caption.split("—")[0]}</div>
    </div>
  );
}

/* ================= TERMS ================= */
export function TermsSlide({ d }: { d: Of<"terms"> }) {
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow={`Γλωσσάριο κεφαλαίου · ${d.part + 1}/2`} title="Βασικοί όροι" badge="📖" />
      <div className="grid flex-1 grid-cols-3 gap-7">
        {d.items.map((t, i) => (
          <Reveal key={t.name} d={i} className="term-card">
            <div className="term-letter">{t.name.charAt(0)}</div>
            <div className="term-name">{t.name}</div>
            <div className="term-def">
              <M text={t.def} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ================= SUMMARY ================= */
export function SummarySlide() {
  const { ch } = useDeck();
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow="Τι κρατάμε" title="Σύνοψη κεφαλαίου" badge="📌" />
      <div className="relative flex flex-1 flex-col justify-center gap-4">
        {ch.summary.map((s, i) => (
          <Reveal key={i} d={i} className="sum-row">
            <div className="sum-no">{i + 1}</div>
            <div className="sum-t">
              <M text={s} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ================= BREAK ================= */
export function BreakSlide({ d }: { d: Of<"break"> }) {
  const { ch } = useDeck();
  const [sec, setSec] = useState(300);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [run]);
  const done = ch.sections.slice(0, d.upto + 1);
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow="Μέση διάλεξης" title="Διάλειμμα & γρήγορη ανασκόπηση" badge="☕" />
      <div className="flex flex-1 gap-10 min-h-0">
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          <div className="eyebrow">Καλύψαμε μέχρι εδώ</div>
          {done.map((s, i) => (
            <Reveal key={s.id} d={i} className="agenda-row">
              <div className="check" style={{ width: 54, height: 54, fontSize: 30 }}>
                ✓
              </div>
              <div className="flex-1 agenda-t">
                {s.id} · {s.title}
              </div>
            </Reveal>
          ))}
        </div>
        <div className="flex flex-col gap-6" style={{ width: 720 }}>
          <Reveal d={2} className="glass text-center" style={{ padding: 36 }}>
            <div className="eyebrow">Χρονόμετρο διαλείμματος</div>
            <div className="timer-big">
              {pad2(Math.floor(sec / 60))}:{pad2(sec % 60)}
            </div>
            <div className="flex justify-center gap-4">
              <button className="btn-ghost" onClick={() => setRun((r) => !r)}>
                {run ? "⏸ Παύση" : "▶ Έναρξη"}
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setRun(false);
                  setSec(300);
                }}
              >
                ↺ Επαναφορά
              </button>
            </div>
          </Reveal>
          <Reveal d={3} className="lead-box" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div className="eyebrow">💭 Σκέψου κατά το διάλειμμα</div>
            <div className="body-t" style={{ marginTop: 8 }}>
              <M text={ch.review[0]} />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ================= REVIEW ================= */
export function ReviewSlide({ d }: { d: Of<"review"> }) {
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow="Συζήτηση σε ομάδες των 3–4 ατόμων · 2′ ανά ερώτηση" title="Ερωτήσεις ανασκόπησης" badge="✍️" />
      <div className="grid flex-1 grid-cols-2 gap-6">
        {d.items.map((q, i) => (
          <Reveal key={q.n} d={i} className="glass card-p" style={{ alignItems: "flex-start" }}>
            <div className="q-badge">Q{q.n}</div>
            <div className="body-t" style={{ fontSize: 34 }}>
              <M text={q.q} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ================= MYTHS ================= */
export function MythsSlide({ d }: { d: Of<"myths"> }) {
  return (
    <div className="flex flex-1 flex-col">
      <SlideTitle eyebrow="Συνηθισμένες παρανοήσεις" title="Μύθοι vs Πραγματικότητα" badge="⚖️" />
      <div className="flex flex-1 flex-col justify-center gap-5">
        {d.items.map((m, i) => (
          <Reveal key={i} d={i} className="myth-row">
            <div className="myth-l">
              <span className="myth-tag bad">ΜΥΘΟΣ</span>
              <div className="body-t">
                <M text={m.myth} />
              </div>
            </div>
            <div className="myth-arrow">➜</div>
            <div className="myth-r">
              <span className="myth-tag good">ΠΡΑΓΜΑΤΙΚΟΤΗΤΑ</span>
              <div className="body-t">
                <M text={m.fact} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
