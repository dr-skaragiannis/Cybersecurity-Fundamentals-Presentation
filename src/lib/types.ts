export type Block =
  | { type: "p"; text: string }
  | { type: "table"; caption: string; head: string[]; rows: string[][] }
  | { type: "callout"; kind: string; title: string; text: string }
  | { type: "code"; text: string }
  | { type: "ul"; items: string[] };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Task {
  pill: string;
  name: string;
  instr: string;
  hint: string;
  cmd: string;
  ok: string;
}

export interface Phase {
  badge: string;
  name: string;
  dur: string;
  objs: string[];
  steps: Block[];
}

export interface Milestone {
  num: string;
  title: string;
  desc: string;
  spec: string[];
  deliv: string;
}

export interface Project {
  badge: string;
  title: string;
  desc: string;
  meta: string[];
  milestones: Milestone[];
  deliverables: string[];
  env: string[];
}

export interface QuizItem {
  q: string;
  opts: { k: string; v: string }[];
  ans: string;
  exp: string;
}

export interface Chapter {
  part: string;
  time: string;
  title: string;
  subtitle: string;
  outcomes: string[];
  intro: string[];
  sections: Section[];
  terms: { name: string; def: string }[];
  summary: string[];
  review: string[];
  cli: { title: string; desc: string; meta: string[]; tasks: Task[] };
  lab: {
    title: string;
    desc: string;
    meta: string[];
    env: string[];
    phases: Phase[];
    checklist: string[];
  };
  projects: Project[];
  quizTitle: string;
  quiz: QuizItem[];
}

/* ---------- authored extras ---------- */
export interface Incident {
  after: number; // inserted after section index (0-based)
  year: string;
  name: string;
  org: string;
  icon: string;
  tag: string;
  story: string[]; // 3 steps
  stats: { v: string; l: string }[];
  lesson: string;
  concept: string;
}

export type DiagramKind =
  | "flow"
  | "cycle"
  | "layers"
  | "stack"
  | "hub"
  | "triangle"
  | "timeline"
  | "compare"
  | "matrix"
  | "funnel";

export interface DiagramNode {
  t: string;
  d?: string;
  items?: string[];
}

export interface Diagram {
  after: number;
  kind: DiagramKind;
  title: string;
  subtitle?: string;
  nodes: DiagramNode[];
  center?: string;
  axes?: [string, string];
  note: string;
}

export interface Extras {
  incidents: Incident[];
  diagrams: Diagram[];
  myths?: { myth: string; fact: string }[];
}

/* ---------- slides ---------- */
export type SlideData =
  | { kind: "cover" }
  | { kind: "agenda" }
  | { kind: "outcomes" }
  | { kind: "intro"; idx: number }
  | {
      kind: "text";
      sec: number;
      opener: boolean;
      text: string;
      layout: number;
      icon: string;
    }
  | { kind: "table"; sec: number; opener: boolean; block: Extract<Block, { type: "table" }> }
  | { kind: "callout"; sec: number; block: Extract<Block, { type: "callout" }> }
  | { kind: "diagram"; d: Diagram; sec: number }
  | { kind: "incident"; i: Incident; n: number }
  | { kind: "myths"; items: { myth: string; fact: string }[] }
  | { kind: "terms"; items: { name: string; def: string }[]; part: number }
  | { kind: "summary" }
  | { kind: "break"; upto: number }
  | { kind: "review"; items: { n: number; q: string }[] }
  | { kind: "cliIntro" }
  | { kind: "cliTasks"; tasks: Task[] }
  | { kind: "labIntro" }
  | { kind: "phase"; p: Phase; n: number }
  | { kind: "checklist" }
  | { kind: "projectIntro"; pi: number }
  | { kind: "milestones"; pi: number; ms: Milestone[]; part: number }
  | { kind: "quiz"; items: { n: number; q: QuizItem }[]; part: number }
  | { kind: "closing" };

export interface Slide {
  id: string;
  data: SlideData;
  label: string; // short label for overview
  weight: number;
  start: number; // minutes
  end: number;
}
