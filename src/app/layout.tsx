import type { Metadata } from "next";
import { Suspense } from "react";
import { Fira_Code, Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/data";
import "./globals.css";

const mono = Fira_Code({ variable: "--font-mono", subsets: ["latin"] });
const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });

async function HeaderWithSettings() {
  return <SiteHeader settings={await getSettings()} />;
}

async function FooterWithSettings() {
  return <SiteFooter settings={await getSettings()} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: `${settings.ownerName} — Software Engineer`, description: settings.headline };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body><div className="page-shell"><Suspense fallback={<div className="site-header chrome-skeleton" aria-hidden="true" />}><HeaderWithSettings /></Suspense><main className="main-content">{children}</main><Suspense fallback={<div className="site-footer chrome-skeleton" aria-hidden="true" />}><FooterWithSettings /></Suspense></div></body>
    </html>
  );
}
