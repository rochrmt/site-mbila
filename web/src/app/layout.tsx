import type { Metadata } from "next";
import { fontVariables } from "@/templates/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mbila, votre site professionnel en 2 minutes",
  description:
    "Créez le site vitrine de votre activité en quelques clics. Design professionnel, textes rédigés pour vous, en ligne instantanément sur votre-nom.mbila.ca.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
