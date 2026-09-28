import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Deck, { chapters, getDeck } from "./components/Deck";
import { PARTS, partIndex } from "./lib/build";
import { CH_ICONS, pad2, stripNum } from "./lib/meta";

interface Route {
  ci: number | null;
  s: number;
}

function parseHash(): Route {
  const m = window.location.hash.match(/^#\/c\/(\d+)(?:\/s\/(\d+))?/);
  if (!m) return { ci: null, s: 0 };
  const ci = Number(m[1]) - 1;
  if (ci < 0 || ci >= chapters.length) return { ci: null, s: 0 };
  return { ci, s: m[2] ? Number(m[2]) - 1 : 0 };
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const h = () => setRoute(parseHash());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const onIdx = useCallback((i: number) => {
    const cur = parseHash();
    if (cur.ci === null) return;
    const target = `#/c/${cur.ci + 1}/s/${i + 1}`;
    if (window.location.hash !== target) history.replaceState(null, "", target);
  }, []);

  if (route.ci === null) {
    return <Home />;
  }
  return (
    <Deck
      key={route.ci}
      ci={route.ci}
      start={route.s}
      onIdx={onIdx}
      onHome={() => (window.location.hash = "")}
      onChapter={(c) => (window.location.hash = `#/c/${c + 1}/s/1`)}
    />
  );
}

function Home() {
  const counts = useMemo(() => chapters.map((_, i) => getDeck(i).length), []);
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-badge">🛡️ Παρουσιάσεις διδασκαλίας · Landscape · Fullscreen</div>
        <h1>
          Κυβερνοασφάλεια <span>101</span>
        </h1>
        <p>
          Θεμελιώδεις Αρχές Κυβερνοασφάλειας — 13 κεφάλαια, καθένα με πλήρη παρουσίαση 3 ωρών βασισμένη στο βιβλίο: θεωρία,
          διαγράμματα, πραγματικά περιστατικά, εργαστήρια CLI, έργα και κουίζ.
        </p>
        <div className="home-stats">
          <div>
            <b>13</b>
            <span>κεφάλαια</span>
          </div>
          <div>
            <b>39</b>
            <span>ώρες διδασκαλίας</span>
          </div>
          <div>
            <b>{total}</b>
            <span>διαφάνειες</span>
          </div>
          <div>
            <b>39</b>
            <span>πραγματικά περιστατικά</span>
          </div>
        </div>
        <div className="home-keys">
          <kbd>←</kbd> <kbd>→</kbd> πλοήγηση · <kbd>F</kbd> πλήρης οθόνη · <kbd>O</kbd> επισκόπηση · <kbd>C</kbd> κεφάλαια ·{" "}
          <kbd>T</kbd> χρονόμετρο
        </div>
      </div>

      {PARTS.map((p, pi) => (
        <section key={pi} className="home-part" style={{ "--a": p.a, "--b": p.b } as CSSProperties}>
          <h2>{p.name}</h2>
          <div className="home-grid">
            {chapters.map((c, i) =>
              partIndex(c) !== pi ? null : (
                <a key={i} href={`#/c/${i + 1}/s/1`} className="home-card">
                  <div className="hc-top">
                    <span className="hc-ico">{CH_ICONS[i]}</span>
                    <span className="hc-n">{pad2(i + 1)}</span>
                  </div>
                  <div className="hc-t">{stripNum(c.title)}</div>
                  <div className="hc-meta">
                    <span>🖼 {counts[i]} διαφάνειες</span>
                    <span>⏱ 3 ώρες</span>
                  </div>
                  <div className="hc-go">Έναρξη παρουσίασης →</div>
                </a>
              )
            )}
          </div>
        </section>
      ))}
      <footer className="home-foot">Περιεχόμενο βασισμένο στο «Θεμελιώδεις Αρχές Κυβερνοασφάλειας — Complete Offline Edition».</footer>
    </div>
  );
}
