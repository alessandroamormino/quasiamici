import type { Metadata } from "next";
import { Abril_Fatface, Alfa_Slab_One, Anton, Bowlby_One, DM_Serif_Display, Special_Elite } from "next/font/google";
import "./globals.css";

// ransom-note mix: every cut-out letter picks one of these
const abril = Abril_Fatface({ variable: "--nf-abril", weight: "400", subsets: ["latin"] });
const alfa = Alfa_Slab_One({ variable: "--nf-alfa", weight: "400", subsets: ["latin"] });
const anton = Anton({ variable: "--nf-anton", weight: "400", subsets: ["latin"] });
const bowlby = Bowlby_One({ variable: "--nf-bowlby", weight: "400", subsets: ["latin"] });
const dmserif = DM_Serif_Display({ variable: "--nf-dmserif", weight: "400", subsets: ["latin"] });
const type = Special_Elite({ variable: "--nf-type", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QUASI AMICI",
  description: "Tredici pezzi. Zero rimorsi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [abril, alfa, anton, bowlby, dmserif, type].map((f) => f.variable).join(" ");
  return (
    <html lang="it" className={`${fonts} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
