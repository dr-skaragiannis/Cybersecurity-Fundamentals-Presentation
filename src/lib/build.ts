import type { Chapter, Extras, Slide, SlideData } from "./types";

/* ------------------------------------------------------------------ */
/*  Text helpers                                                       */
/* ------------------------------------------------------------------ */
export function splitSentences(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const raw = clean.split(/(?<=[.;?!])\s+(?=[Α-ΩΆ-Ώ«"“A-Z0-9`*_(])/u);
  const out: string[] = [];
  for (const part of raw) {
    const prev = out[out.length - 1];
    if (
      prev &&
      (/(?:^|[\s(])(?:\p{L}\.){1,3}$/u.test(prev) ||
        /(?:π\.χ\.|κ\.λπ\.|δηλ\.|βλ\.|π\.Χ\.|κ\.ά\.|π\.χ|Σχ\.|έτ\.)$/u.test(prev) ||
        /\b(?:vs|etc|e\.g|i\.e)\.$/.test(prev))
    ) {
      out[out.length - 1] = prev + " " + part;
    } else out.push(part);
  }
  return out.filter((s) => s.length > 0);
}

export function keywords(text: string, max = 6): string[] {
  const m = [...text.matchAll(/\*\*([^*]+)\*\*/g)].map((x) => x[1].trim());
  const uniq: string[] = [];
  for (const k of m) if (!uniq.includes(k) && k.length < 42) uniq.push(k);
  return uniq.slice(0, max);
}

export function plain(text: string): string {
  return text.replace(/\*\*/g, "").replace(/`/g, "").replace(/(^|\s)_([^_]+)_/g, "$1$2");
}

const ICONS: [RegExp, string][] = [
  [/κρυπτο|κλειδ|κατακερμ|υπογραφ|πιστοποιητ/i, "🔐"],
  [/ransom|λυτρισμ|wiper|malware|κακόβουλ|rootkit|σκουλήκ|trojan/i, "🦠"],
  [/phishing|ψάρεμ|κοινωνικ|ψυχολογ|προσχήμα|BEC/i, "🎣"],
  [/δίκτυ|firewall|τείχ|botnet|DDoS|VPN|802\.1X|ασύρμ/i, "🌐"],
  [/ταυτ|MFA|FIDO|Kerberos|LDAP|Active Directory|SAML|OAuth|IAM|RBAC/i, "🪪"],
  [/SQL|XSS|CSRF|API|shift-left|DevSecOps|λογισμικ|SAST|DAST/i, "🧑‍💻"],
  [/ευπάθ|CVSS|δοκιμ|διείσδυσ|pentest/i, "🔎"],
  [/SOC|SIEM|IDS|IPS|YARA|Sigma|απόκριση|περιστατικ|αναζήτηση/i, "🚨"],
  [/OSINT|εγκληματολ|forensic|sandbox|εντροπία|αναγνώριση/i, "🕵️"],
  [/ανθεκτικ|RPO|RTO|αντίγραφ|συνέχεια|ISO|NIST|ΓΚΠΔ|NIS2|κίνδυν/i, "🛡️"],
  [/Windows|POSIX|Linux|SetUID|ACL|token|UAC|δικαιώμα/i, "🖥️"],
  [/δράστ|APT|Kill Chain|ATT&CK|Διαμαντ|CTI|απειλ/i, "🎯"],
  [/CIA|εμπιστευτικ|ακεραιότ|διαθεσιμότ/i, "🔺"],
];
const FALLBACK = ["🧩", "📡", "🛰️", "🧠", "⚙️", "🔬", "🗂️", "🔒"];
export function pickIcon(text: string, i: number): string {
  for (const [re, ic] of ICONS) if (re.test(text)) return ic;
  return FALLBACK[i % FALLBACK.length];
}

/* ------------------------------------------------------------------ */
/*  Slide builder                                                      */
/* ------------------------------------------------------------------ */
const WEIGHTS: Record<SlideData["kind"], number> = {
  cover: 2,
  agenda: 3,
  outcomes: 3,
  intro: 3,
  text: 4,
  table: 4,
  callout: 3,
  diagram: 4,
  incident: 5,
  myths: 3,
  terms: 3,
  summary: 3,
  break: 5,
  review: 6,
  cliIntro: 3,
  cliTasks: 5,
  labIntro: 3,
  phase: 5,
  checklist: 2,
  projectIntro: 3,
  milestones: 4,
  quiz: 4,
  closing: 1,
};

export function buildDeck(ci: number, ch: Chapter, ex: Extras | undefined): Slide[] {
  const list: { data: SlideData; label: string }[] = [];
  const push = (data: SlideData, label: string) => list.push({ data, label });

  push({ kind: "cover" }, "Τίτλος");
  push({ kind: "agenda" }, "Πλάνο 3 ωρών");
  push({ kind: "outcomes" }, "Μαθησιακά αποτελέσματα");
  ch.intro.forEach((_, i) => push({ kind: "intro", idx: i }, "Εισαγωγή"));

  const nSec = ch.sections.length;
  const breakAfter = Math.floor(nSec / 2) - 1;
  ch.sections.forEach((sec, si) => {
    let first = true;
    let pi = 0;
    sec.blocks.forEach((b) => {
      if (b.type === "p") {
        push(
          {
            kind: "text",
            sec: si,
            opener: first,
            text: b.text,
            layout: (si + pi) % 3,
            icon: pickIcon(sec.title + " " + b.text, si + pi),
          },
          sec.id + " " + sec.title
        );
        pi++;
      } else if (b.type === "table") {
        push({ kind: "table", sec: si, opener: first, block: b }, sec.id + " Πίνακας");
      } else if (b.type === "callout") {
        push({ kind: "callout", sec: si, block: b }, sec.id + " " + b.title);
      }
      first = false;
    });
    ex?.diagrams
      .filter((d) => d.after === si)
      .forEach((d) => push({ kind: "diagram", d, sec: si }, "Διάγραμμα: " + d.title));
    ex?.incidents
      .filter((x) => x.after === si)
      .forEach((x) =>
        push({ kind: "incident", i: x, n: ex.incidents.indexOf(x) + 1 }, "Περιστατικό: " + x.name)
      );
    if (si === breakAfter) push({ kind: "break", upto: si }, "Διάλειμμα & ανασκόπηση");
  });

  if (ex?.myths?.length) push({ kind: "myths", items: ex.myths }, "Μύθοι vs Πραγματικότητα");
  for (let i = 0; i < ch.terms.length; i += 3)
    push({ kind: "terms", items: ch.terms.slice(i, i + 3), part: i / 3 }, "Βασικοί όροι");
  push({ kind: "summary" }, "Σύνοψη κεφαλαίου");
  push(
    { kind: "review", items: ch.review.map((q, i) => ({ n: i + 1, q })) },
    "Ερωτήσεις ανασκόπησης"
  );

  push({ kind: "cliIntro" }, "Εργαστήριο CLI");
  for (let i = 0; i < ch.cli.tasks.length; i += 2)
    push({ kind: "cliTasks", tasks: ch.cli.tasks.slice(i, i + 2) }, "CLI Tasks " + (i + 1));
  push({ kind: "labIntro" }, "Τεχνικό εργαστήριο");
  ch.lab.phases.forEach((p, i) => push({ kind: "phase", p, n: i + 1 }, p.badge + ": " + p.name));
  push({ kind: "checklist" }, "Λίστα επαλήθευσης");
  ch.projects.forEach((p, pi) => {
    push({ kind: "projectIntro", pi }, p.badge.replace(/^[^\p{L}]+/u, ""));
    for (let i = 0; i < p.milestones.length; i += 4)
      push({ kind: "milestones", pi, ms: p.milestones.slice(i, i + 4), part: i / 4 }, "Ορόσημα έργου");
  });
  for (let i = 0; i < ch.quiz.length; i += 2)
    push(
      {
        kind: "quiz",
        part: i / 2,
        items: ch.quiz.slice(i, i + 2).map((q, k) => ({ n: i + k + 1, q })),
      },
      "Κουίζ " + (i + 1) + "–" + Math.min(i + 2, ch.quiz.length)
    );
  push({ kind: "closing" }, "Κλείσιμο");

  const total = list.reduce((a, s) => a + WEIGHTS[s.data.kind], 0);
  let acc = 0;
  return list.map((s, i) => {
    const w = (WEIGHTS[s.data.kind] / total) * 180;
    const slide: Slide = {
      id: `c${ci}-s${i}`,
      data: s.data,
      label: s.label,
      weight: w,
      start: acc,
      end: acc + w,
    };
    acc += w;
    return slide;
  });
}

export function fmtMin(m: number): string {
  const t = Math.round(m);
  const h = Math.floor(t / 60);
  const mm = t % 60;
  return `${h}:${mm.toString().padStart(2, "0")}`;
}

export const PARTS = [
  { name: "Μέρος 1 · Θεμέλια", a: "#22d3ee", b: "#14b8a6", glow: "34,211,238" },
  { name: "Μέρος 2 · Αντίπαλοι και Επιθέσεις", a: "#fb7185", b: "#f97316", glow: "251,113,133" },
  { name: "Μέρος 3 · Μηχανισμοί Προστασίας και Ασφαλής Μηχανική", a: "#a78bfa", b: "#6366f1", glow: "167,139,250" },
  { name: "Μέρος 4 · Λειτουργίες, Διερεύνηση και Διακυβέρνηση", a: "#fbbf24", b: "#34d399", glow: "251,191,36" },
];

export function partIndex(ch: Chapter): number {
  const m = ch.part.match(/Μέρος (\d)/);
  return m ? Number(m[1]) - 1 : 0;
}
