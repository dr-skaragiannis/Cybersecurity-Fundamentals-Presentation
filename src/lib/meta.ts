export const CH_ICONS = ["🔺", "🖥️", "🎯", "🦠", "🎣", "🌐", "🔐", "🪪", "🧑‍💻", "🔎", "🚨", "🕵️", "🛡️"];

export const stripNum = (t: string) => t.replace(/^\d+\.\s*/, "");

export const pad2 = (n: number) => n.toString().padStart(2, "0");

export const CALLOUT_META: Record<string, { icon: string; label: string }> = {
  example: { icon: "💡", label: "Παράδειγμα εφαρμογής" },
  note: { icon: "ℹ️", label: "Σημείωση" },
  key: { icon: "🔑", label: "Βασική ιδέα" },
};
