export const DEMO_ORG_ID = "org_demo_ridgeco";

export const DEMO_COMPANY = {
  name: "Ridge & Co. Builders",
  userName: "Maya Chen",
  userRole: "Superintendent",
};

export const CATEGORY_META = {
  ppe: { label: "PPE", color: "#C4841D", blurb: "Hard hats, eye and face, hearing, high-vis" },
  fall: { label: "Fall hazard", color: "#D1432F", blurb: "Edges, openings, ladders, rails" },
  housekeeping: { label: "Housekeeping", color: "#3D6B8C", blurb: "Egress, debris, stored material" },
  electrical: { label: "Electrical", color: "#6B4C9A", blurb: "Temp power, GFCI, cords, panels" },
} as const;

export const SEVERITY_META = {
  low: { label: "Low", className: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-50" },
  high: { label: "High", className: "bg-orange-100 text-orange-950 dark:bg-orange-950 dark:text-orange-50" },
  critical: { label: "Critical", className: "bg-red-100 text-red-950 dark:bg-red-950 dark:text-red-50" },
} as const;

export const STATUS_META = {
  open: { label: "Open", className: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-50" },
  in_progress: { label: "In progress", className: "bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-50" },
  closed: { label: "Closed", className: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50" },
} as const;

export const ROLE_LABEL = {
  superintendent: "Superintendent",
  crew_lead: "Crew lead",
  safety: "Safety",
} as const;

export const ACTION_CHART_COLORS = {
  open: "#E0A106",
  in_progress: "#3D6B8C",
  closed: "#3E8F62",
} as const;

export const clerkAppearance = {
  variables: {
    colorPrimary: "#1C3A2E",
    colorText: "#1A241C",
    colorTextSecondary: "#5C675E",
    colorBackground: "#FBF8F2",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#1A241C",
    borderRadius: "12px",
    fontFamily: "var(--font-figtree), Figtree, ui-sans-serif, sans-serif",
  },
  elements: {
    card: "shadow-none bg-transparent",
    headerTitle: "font-semibold",
    formButtonPrimary: "bg-[#1C3A2E] text-[#F4F7D8]",
    footerActionLink: "text-[#1C3A2E]",
  },
};

export function appHref(basePath: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!basePath) return normalized;
  return `${basePath}${normalized}`;
}

export function clerkConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}
