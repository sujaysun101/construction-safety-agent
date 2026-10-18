import type { Metadata } from "next";
import { SiteForm } from "@/components/controls";

export const metadata: Metadata = { title: "New site" };

export default function NewSitePage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-heading text-4xl font-semibold">New site</h1>
      <p className="mt-2 mb-6 text-muted-foreground">A site is one job. Walks and trends stay with it.</p>
      <SiteForm demo={false} basePath="" />
    </div>
  );
}
