"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Menu,
  NotebookPen,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogoMark, Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { appHref } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sites", label: "Sites", icon: Building2 },
  { href: "/actions", label: "Actions", icon: ClipboardCheck },
  { href: "/log", label: "Daily log", icon: NotebookPen },
  { href: "/crew", label: "Crew", icon: Users },
  { href: "/reports", label: "Reports", icon: FileText },
];

type ShellProps = {
  companyName: string;
  userName: string;
  demo: boolean;
  clerkReady: boolean;
  basePath: string;
  sites: { slug: string; name: string }[];
  children: React.ReactNode;
};

export function AppShell({ companyName, userName, demo, clerkReady, basePath, sites, children }: ShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openPath, setOpenPath] = useState("");
  const [palette, setPalette] = useState(false);
  const reduce = useReducedMotion();
  const menuOpen = open && openPath === pathname;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const links = NAV.map((item) => ({ ...item, href: appHref(basePath, item.href) }));
  const dashboardHref = appHref(basePath, "/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-hivis focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="hidden min-h-screen flex-col bg-ink text-white lg:flex">
          <SidebarContent
            companyName={companyName}
            links={links}
            pathname={pathname}
            dashboardHref={dashboardHref}
            basePath={basePath}
          />
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
            <button
              type="button"
              className="rounded-lg p-2 lg:hidden"
              aria-label="Open menu"
              onClick={() => {
                setOpenPath(pathname);
                setOpen(true);
              }}
            >
              <Menu className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm text-muted-foreground sm:flex"
            >
              <Search className="size-3.5" />
              Search
              <kbd className="rounded bg-muted px-1.5 text-[10px]">⌘K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              {clerkReady ? (
                <>
                  <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/dashboard" afterCreateOrganizationUrl="/dashboard" />
                  <UserButton />
                </>
              ) : (
                <div className="flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1">
                  <span className="grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold text-hivis">MC</span>
                  <span className="text-sm">
                    <span className="block leading-none font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground">Superintendent</span>
                  </span>
                </div>
              )}
            </div>
          </header>
          {demo ? (
            <p className="border-b bg-hivis/40 px-4 py-2 text-sm text-ink">
              Demo data. Ridge &amp; Co. Builders is a sample company
              {clerkReady ? " kept in memory until a database is connected." : ". Add Clerk keys to require sign-in, and DATABASE_URL to store each company."}
            </p>
          ) : null}
          <motion.main
            id="main"
            className="px-4 py-6 sm:px-6 lg:px-8"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            {children}
          </motion.main>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-ink/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink text-white">
            <button type="button" className="absolute top-3 right-3 rounded-lg p-2" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </button>
            <SidebarContent
              companyName={companyName}
              links={links}
              pathname={pathname}
              dashboardHref={dashboardHref}
              basePath={basePath}
            />
          </div>
        </div>
      ) : null}

      {palette ? (
        <CommandPalette
          sites={sites}
          basePath={basePath}
          onClose={() => setPalette(false)}
        />
      ) : null}
    </div>
  );
}

function SidebarContent({
  companyName,
  links,
  pathname,
  dashboardHref,
  basePath,
}: {
  companyName: string;
  links: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  pathname: string;
  dashboardHref: string;
  basePath: string;
}) {
  return (
    <div className="flex h-full flex-col px-3 py-4">
      <Link href={dashboardHref} className="flex items-center gap-2 px-2 py-1 text-white">
        <LogoMark className="size-9 text-white" />
        <span>
          <Wordmark light className="text-[1.65rem] leading-none" />
          <span className="mt-1 block max-w-[10rem] truncate text-xs text-white/70">{companyName}</span>
        </span>
      </Link>
      <Link
        href={appHref(basePath, "/walks/new")}
        className={cn(buttonVariants({ size: "lg" }), "mt-5 bg-hivis text-ink hover:bg-hivis/90")}
      >
        <Plus />
        Start a walk
      </Link>
      <nav aria-label="Primary" className="mt-4 space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.href === dashboardHref && (pathname === basePath || pathname === `${basePath}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white",
                active && "bg-hivis font-medium text-ink hover:bg-hivis hover:text-ink",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function CommandPalette({
  sites,
  basePath,
  onClose,
}: {
  sites: { slug: string; name: string }[];
  basePath: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const pages = [
      ...NAV.map((item) => ({ label: item.label, href: appHref(basePath, item.href) })),
      { label: "Start a walk", href: appHref(basePath, "/walks/new") },
      ...sites.map((site) => ({ label: site.name, href: appHref(basePath, `/sites/${site.slug}`) })),
    ];
    const needle = query.trim().toLowerCase();
    return needle ? pages.filter((item) => item.label.toLowerCase().includes(needle)) : pages;
  }, [basePath, query, sites]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-ink/40 px-4 pt-[15vh]" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Search"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-foreground/10"
        onClick={(event) => event.stopPropagation()}
      >
        <label className="sr-only" htmlFor="command-search">
          Search pages and sites
        </label>
        <input
          id="command-search"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Sites, actions, walks"
          className="field rounded-none border-0 border-b"
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
            if (event.key === "Enter" && items[0]) {
              router.push(items[0].href);
              onClose();
            }
          }}
        />
        <ul className="max-h-80 overflow-auto p-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={onClose} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">
                {item.label}
              </Link>
            </li>
          ))}
          {!items.length ? <li className="px-3 py-6 text-sm text-muted-foreground">Nothing matches.</li> : null}
        </ul>
      </div>
    </div>
  );
}
