"use client";

import { useEffect, useRef, useState } from "react";
import Ransom from "./Ransom";
import { audioUrl, coverUrl, lyricsUrl, roman, songs } from "./songs";

const SNIPPET_MS = 10_000;
const HOVER_DELAY_MS = 180;

const fmt = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";

export default function Album() {
  const main = useRef<HTMLAudioElement>(null);
  const preview = useRef<HTMLAudioElement>(null);
  const timers = useRef<number[]>([]);

  const [entered, setEntered] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [previewing, setPreviewing] = useState<number | null>(null);
  const [blocked, setBlocked] = useState(false);

  // surface autoplay blocks instead of failing silently
  const play = (a: HTMLAudioElement) =>
    a.play().then(() => setBlocked(false)).catch((e) => { if (e.name === "NotAllowedError") setBlocked(true); });
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<Record<string, string>>({});

  const stopPreview = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    preview.current?.pause();
    if (main.current) main.current.volume = 1;
    setPreviewing(null);
  };

  const startPreview = (i: number) => {
    stopPreview();
    if (!entered || songs[i].soon || (i === current && playing)) return;
    timers.current.push(
      window.setTimeout(() => {
        const p = preview.current!;
        p.src = audioUrl(songs[i].id);
        p.onloadedmetadata = () => {
          // ponytail: start at ~30% in to skip intros; fine for 30s–3min tracks
          p.currentTime = Math.min(30, p.duration * 0.3);
          p.play().catch(() => {});
          if (main.current) main.current.volume = 0.15; // duck the main track
          setPreviewing(i);
          timers.current.push(window.setTimeout(stopPreview, SNIPPET_MS));
        };
      }, HOVER_DELAY_MS),
    );
  };

  const select = (i: number) => {
    stopPreview();
    if (i === current) return toggle();
    setCurrent(i);
    // start inside the click handler: strict browsers only allow play() during the gesture
    const a = main.current;
    if (a) { a.src = audioUrl(songs[i].id); play(a); }
  };

  const toggle = () => {
    const a = main.current;
    if (!a || current === null) return;
    if (a.paused) play(a);
    else a.pause();
  };

  // move by dir, skipping "coming soon" tracks
  const step = (c: number | null, dir: 1 | -1) => {
    let n = c ?? (dir === 1 ? -1 : 0);
    do n = (n + dir + songs.length) % songs.length;
    while (songs[n].soon);
    return n;
  };
  const next = () => setCurrent((c) => step(c, 1));
  const prev = () => {
    if (main.current && main.current.currentTime > 3) main.current.currentTime = 0;
    else setCurrent((c) => step(c, -1));
  };

  // new track selected → play it
  useEffect(() => {
    if (current !== null && main.current) play(main.current);
  }, [current]);

  const song = current !== null ? songs[current] : null;

  // lyrics are fetched only when someone asks for them
  useEffect(() => {
    if (!showLyrics || !song || song.id in lyrics) return;
    fetch(lyricsUrl(song.id))
      .then((r) => (r.ok ? r.text() : "Testo non disponibile."))
      .then((t) => setLyrics((l) => ({ ...l, [song.id]: t })));
  }, [showLyrics, song, lyrics]);

  // space = play/pause, arrows = prev/next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("button, input")) return;
      if (e.code === "Space") { e.preventDefault(); toggle(); }
      if (e.code === "ArrowRight") next();
      if (e.code === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const enter = () => {
    // unlock the preview element inside a user gesture (Safari autoplay policy)
    const p = preview.current!;
    p.muted = true;
    p.src = audioUrl(songs[0].id);
    p.play().then(() => { p.pause(); p.muted = false; }).catch(() => { p.muted = false; });
    setEntered(true);
  };

  return (
    <>
      <audio
        ref={main}
        src={song ? audioUrl(song.id) : undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={next}
      />
      <audio ref={preview} />

      {/* duotone collage of the covers behind everything */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 grid grid-cols-3 opacity-40 mix-blend-multiply sm:grid-cols-5">
        {[...songs, ...songs].filter((s) => !s.soon).map((s, i) => (
          <img key={i} src={coverUrl(s.id)} alt="" className="aspect-square w-full object-cover contrast-150 grayscale" />
        ))}
      </div>

      {/* intro gate: browsers block audio until the first click */}
      <div
        className={`fixed inset-0 z-50 grid place-items-center bg-punk/60 backdrop-blur-md transition-opacity duration-500 ${entered ? "pointer-events-none opacity-0" : ""}`}
      >
        <button onClick={enter} className="tape -rotate-3 px-8 py-4 text-3xl uppercase transition hover:scale-110 hover:rotate-0 sm:text-5xl">
          ▶ alza il volume
        </button>
      </div>

      <main className="mx-auto max-w-2xl px-5 pb-56 pt-14">
        <header className="mb-16 flex flex-col items-center">
          <h1 className="flex flex-col items-center gap-2 text-7xl drop-shadow-[0_6px_0_rgb(0_0_0/0.3)] sm:text-[8.5rem]">
            <Ransom text="QUASI" />
            <Ransom text="AMICI" delay={350} className="ml-16" />
          </h1>
          <div className="mt-6 flex flex-col items-end self-end text-lg sm:mr-6 sm:text-2xl">
            <span className="tape -rotate-2 px-3 py-0.5">{songs.length} pezzi</span>
            <span className="tape -mt-1 rotate-1 px-3 py-0.5">fatti con suno, senza vergogna</span>
          </div>
        </header>

        <ol className="group/list flex flex-col gap-5">
          {songs.map((s, i) => {
            const selected = i === current;
            const skin = selected ? "skin-acid" : i % 2 ? "skin-white" : "skin-black";
            const tilt = i % 2 ? "rotate-[1deg]" : "-rotate-[1deg]";
            return (
              <li
                key={s.id}
                className={`relative transition-all duration-300 ease-out drop-shadow-[4px_5px_0_rgb(0_0_0/0.35)]
                  group-hover/list:opacity-60 hover:z-10 hover:opacity-100! hover:drop-shadow-[8px_10px_0_rgb(0_0_0/0.45)]
                  ${selected ? "z-10 opacity-100! drop-shadow-[10px_12px_0_rgb(0_0_0/0.5)]" : ""}`}
              >
                <button
                  onClick={() => select(i)}
                  onMouseEnter={() => startPreview(i)}
                  onMouseLeave={stopPreview}
                  disabled={s.soon}
                  aria-current={selected}
                  className={`${skin} tear-card group/card relative flex w-full items-center gap-4 px-4 py-4 text-left transition-all duration-300 ease-out
                    hover:-translate-y-1 hover:scale-[1.04] hover:-rotate-2 disabled:cursor-not-allowed ${selected ? "scale-[1.07] -rotate-2" : tilt}`}
                >
                  {s.soon ? (
                    <span className="skin-dots grid size-14 shrink-0 rotate-2 place-items-center font-abril text-3xl">?</span>
                  ) : (
                    <img
                      src={coverUrl(s.id)}
                      alt=""
                      className={`shrink-0 rotate-2 object-cover transition-all duration-300 ease-out group-hover/card:grayscale-0
                        ${selected ? "size-24 grayscale-0" : "size-14 contrast-125 grayscale"}`}
                    />
                  )}
                  <span className="font-bowlby w-10 text-sm text-punk">{roman(i + 1)}</span>
                  <span className={`flex-1 uppercase leading-tight transition-all duration-300 ${selected ? "text-2xl" : "text-lg"}`}>
                    {s.title}
                  </span>
                  {s.soon && <span className="tape -rotate-3 px-2 py-0.5 text-xs uppercase">coming soon</span>}
                  {selected && playing && <Eq />}
                  {previewing === i && (
                    <span
                      className="absolute inset-x-0 bottom-0 h-1.5 origin-left bg-punk"
                      style={{ animation: `snippet ${SNIPPET_MS}ms linear forwards` }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </main>

      {/* player */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-500 ease-out ${song ? "translate-y-0" : "translate-y-[110%]"}`}
      >
        {/* lyrics drawer: grid-rows trick animates height smoothly */}
        <div className={`mx-auto grid max-w-2xl px-4 transition-all duration-500 ease-out ${showLyrics ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="skin-white tear-card mb-[-10px] max-h-[50vh] overflow-y-auto px-6 pb-8 pt-6">
              {song && (lyrics[song.id] ?? "…").split("\n").map((line, i) =>
                /^\s*\[.*\]\s*$/.test(line) ? (
                  <span key={i} className="mt-4 mb-1 inline-block -rotate-1 bg-punk px-2 text-xs uppercase text-white">
                    {line.trim().slice(1, -1)}
                  </span>
                ) : (
                  <p key={i} className="leading-relaxed">{line || " "}</p>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="skin-black tear-card pt-2">
          <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 pb-3 pt-4">
            {song && <img src={coverUrl(song.id)} alt="" className="size-14 shrink-0 -rotate-3 object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg uppercase">{song?.title}</p>
              {blocked && <p className="text-xs text-acid">il browser ha bloccato l&apos;audio: premi ▶</p>}
              <div className="flex items-center gap-2 text-xs text-paper/60">
                <span className="w-9 tabular-nums">{fmt(time)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={time}
                  onChange={(e) => { if (main.current) main.current.currentTime = +e.target.value; }}
                  aria-label="Posizione"
                  className="flex-1"
                />
                <span className="w-9 tabular-nums">{fmt(duration)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowLyrics((v) => !v)}
              aria-pressed={showLyrics}
              className={`px-2 py-1 text-xs uppercase transition hover:-rotate-3 ${showLyrics ? "tape" : "border border-paper/40 text-paper"}`}
            >
              testo
            </button>
            <div className="flex items-center gap-1">
              <Ctrl label="Precedente" onClick={prev} d="M6 5h2v14H6zM20 5v14L9 12z" />
              <button
                onClick={toggle}
                aria-label={playing ? "Pausa" : "Play"}
                className="tape grid size-12 place-items-center transition hover:scale-110 hover:rotate-6 active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="size-6 fill-current">
                  <path d={playing ? "M6 5h4v14H6zM14 5h4v14h-4z" : "M7 4v16l13-8z"} />
                </svg>
              </button>
              <Ctrl label="Successiva" onClick={next} d="M16 5h2v14h-2zM4 5v14l11-7z" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Ctrl({ label, onClick, d }: { label: string; onClick: () => void; d: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="grid size-10 place-items-center text-paper transition hover:scale-110 hover:text-acid active:scale-95">
      <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d={d} /></svg>
    </button>
  );
}

function Eq() {
  return (
    <span className="mr-2 flex h-5 items-end gap-0.5" aria-hidden>
      {[0, 0.2, 0.4].map((delay) => (
        <span key={delay} className="h-full w-1 origin-bottom bg-current" style={{ animation: `eq 0.8s ${delay}s ease-in-out infinite` }} />
      ))}
    </span>
  );
}
