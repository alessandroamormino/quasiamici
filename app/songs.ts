// soon: in scaletta ma non ancora uscita (niente audio/cover)
export type Song = { id: string; title: string; soon?: boolean };

// file in public/: audio/<id>.mp3, covers/<id>.jpg, lyrics/<id>.txt (da Suno)
export const audioUrl = (id: string) => `/audio/${id}.mp3`;
export const coverUrl = (id: string) => `/covers/${id}.jpg`;
export const lyricsUrl = (id: string) => `/lyrics/${id}.txt`;

// scaletta ufficiale, in ordine
export const songs: Song[] = [
  { id: "9941bcb6-8144-435b-99b7-37ed34d1142b", title: "Quasi Amici" },
  { id: "36e5270b-b195-4f00-b189-08e0fd1c2b97", title: "Prestanome" },
  { id: "dcedcaf7-bd58-4731-8430-6a0d2779fe2d", title: "Morte improvvisa (Desio dritto)" },
  { id: "10b7b38e-88a7-4846-bb30-4992a8646975", title: "Lei è di Bergamo" },
  { id: "648b1e3c-2e48-4c08-bf34-1d7d6c34fd1d", title: "“Andrea”" },
  { id: "66707181-3a5d-4500-bb90-d6e24b0629ad", title: "Corsia d'Emergenza" },
  { id: "3b5f627d-1016-4720-af84-ea34da52ee16", title: "Insopportabile" },
  { id: "f1b4f325-fe42-46a6-a233-81df2b3f3916", title: "Idealista" },
  { id: "33d48c03-2100-458b-87b4-94df447d428b", title: "Puoi lavorare?" },
  { id: "papi-te-quiero", title: "Papi te quiero", soon: true },
  { id: "e7f1a62a-a961-413e-a2f0-64b7141157e8", title: "Trenino Thomas" },
  { id: "49fddb9a-ff1f-4a1d-90c6-53fdf1599d48", title: "Outro" },
];

export const roman = (n: number) =>
  ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"][n - 1] ?? String(n);
