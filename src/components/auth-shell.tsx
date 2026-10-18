import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo";

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-ink px-10 py-8 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark className="size-10 text-white" />
          <Wordmark light />
        </Link>
        <div>
          <p className="font-heading text-5xl leading-[0.95] font-semibold">Walk the site. Leave with the list.</p>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            <li className="rounded-xl bg-white/5 px-4 py-3">
              <span className="text-hivis">Critical · Fall</span>
              <p className="mt-1 text-white">Unguarded floor opening, south stair, level 3</p>
            </li>
            <li className="rounded-xl bg-white/5 px-4 py-3">
              <span className="text-hivis">High · Electrical</span>
              <p className="mt-1 text-white">Cord through standing water at the temp panel</p>
            </li>
            <li className="rounded-xl bg-white/5 px-4 py-3">
              <span className="text-hivis">Assigned</span>
              <p className="mt-1 text-white">Andre Walsh · due before the morning start</p>
            </li>
          </ul>
        </div>
        <p className="text-sm text-white/60">Daily safety walks for small construction crews.</p>
      </aside>
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="text-ink" />
            <Wordmark />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <h1 className="mb-6 font-heading text-4xl font-semibold lg:hidden">{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
