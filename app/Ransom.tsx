import type { CSSProperties } from "react";

const FONTS = ["font-abril", "font-alfa", "font-anton", "font-bowlby", "font-dmserif", "font-type"];
const SKINS = ["skin-black", "skin-white", "skin-gray", "skin-dots", "skin-news"];
const ROT = [-6, 4, -2, 7, -4, 3, -8, 5];

// ponytail: deterministic "random" per letter index, so SSR and client match
export default function Ransom({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span aria-label={text} role="img" className={`inline-flex items-end justify-center gap-[0.06em] ${className}`}>
      {[...text].map((ch, i) =>
        ch === " " ? (
          <span key={i} className="w-[0.35em]" />
        ) : (
          <span
            key={i}
            aria-hidden
            className={`cut ${SKINS[(i * 3 + 1) % SKINS.length]} ${FONTS[(i * 5 + 2) % FONTS.length]} tear-${i % 4}`}
            style={{ "--r": `${ROT[i % ROT.length]}deg`, "--d": `${delay + i * 70}ms`, fontSize: i % 3 === 1 ? "0.85em" : "1em" } as CSSProperties}
          >
            {i % 4 === 2 ? ch.toLowerCase() : ch.toUpperCase()}
          </span>
        ),
      )}
    </span>
  );
}
