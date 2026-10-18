"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Camera, ClipboardCheck, FileBarChart } from "lucide-react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo";

const features = [
  {
    icon: Camera,
    title: "A walk from the photos you already take",
    body: "Upload several shots from the floor. HiVis files PPE gaps, fall hazards, housekeeping, and electrical issues with a severity and where they sit in the frame.",
  },
  {
    icon: ClipboardCheck,
    title: "A name and a due date on every fix",
    body: "Corrective actions go to a crew lead. Open, in progress, or closed — the list is the thing you leave the site with.",
  },
  {
    icon: FileBarChart,
    title: "The trend, and a PDF for the file",
    body: "Each site shows findings over time and open versus closed actions. Export a branded report when the GC or the insurer asks.",
  },
];

export function Landing() {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="text-ink" />
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/sign-in" className="rounded-lg px-3 py-2 hover:bg-muted">
            Sign in
          </Link>
          <Link href="/sign-up" className="rounded-lg bg-ink px-3 py-2 font-medium text-hivis">
            Create account
          </Link>
        </nav>
      </header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">For small construction crews</p>
          <h1 className="mt-3 max-w-xl font-heading text-6xl leading-[0.92] font-semibold tracking-tight">
            Walk the site. Leave with the list.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            HiVis turns this morning&apos;s photos into findings, assigns the fix to a crew lead, and keeps the daily log with the job.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-lg bg-hivis px-4 py-2.5 text-sm font-medium text-ink">
              Open the app
            </Link>
            <Link href="/sign-in" className="rounded-lg border bg-card px-4 py-2.5 text-sm font-medium">
              Sign in
            </Link>
          </div>
        </motion.div>
        <motion.div
          className="rounded-3xl bg-ink p-5 text-white shadow-xl"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Harborline Apartments</span>
            <span>Level 3 framing</span>
          </div>
          <p className="mt-4 font-heading text-3xl font-semibold">South stair is still open.</p>
          <ul className="mt-4 space-y-2">
            {[
              ["Critical", "Unguarded floor opening", "Andre Walsh · overdue"],
              ["High", "Cord through standing water", "Priya Shah · in progress"],
              ["Medium", "Vest hooks empty at the stair", "Andre Walsh · due in 3 days"],
            ].map(([severity, title, meta]) => (
              <li key={title} className="rounded-xl bg-white/10 px-3 py-3">
                <p className="text-xs text-hivis">{severity}</p>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-white/65">{meta}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </main>
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 pb-8 md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article
              key={feature.title}
              className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 * index }}
            >
              <Icon className="size-5 text-ink" aria-hidden />
              <h2 className="mt-3 font-heading text-2xl font-semibold leading-tight">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </motion.article>
          );
        })}
      </section>
      <footer className="border-t px-6 py-4 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-heading text-xl font-semibold text-foreground">HiVis</span>
          <span>Daily safety walks for small contractors.</span>
        </div>
      </footer>
    </div>
  );
}
