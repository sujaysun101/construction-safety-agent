"use client";

import { useMemo, useState } from "react";
import { saveWalk } from "@/lib/actions";
import { CATEGORY_META, SEVERITY_META } from "@/lib/brand";
import { shiftDate, todayIso } from "@/lib/dates";
import type { Category, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

type SiteOption = { id: string; name: string };
type CrewOption = { id: string; name: string; role: string; siteId: string | null; trade: string };

type Draft = {
  key: string;
  photoIndex: number;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  boundingDescription: string;
  oshaCategory: string;
  sample: boolean;
  include: boolean;
  assigneeId: string;
  dueOn: string;
  actionTitle: string;
};

const STEPS = ["Details", "Photos", "Findings"];

export function WalkComposer({
  sites,
  crew,
  conductedBy,
  demo,
  basePath,
}: {
  sites: SiteOption[];
  crew: CrewOption[];
  conductedBy: string;
  demo: boolean;
  basePath: string;
}) {
  const [step, setStep] = useState(0);
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [walkedOn, setWalkedOn] = useState(todayIso());
  const [walker, setWalker] = useState(conductedBy);
  const [weather, setWeather] = useState("Overcast, 54°F");
  const [crewCount, setCrewCount] = useState(12);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [summary, setSummary] = useState("");
  const [sample, setSample] = useState(false);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);

  const leads = useMemo(() => {
    const onSite = crew.filter((member) => member.role === "crew_lead" && (member.siteId === siteId || !member.siteId));
    return onSite.length ? onSite : crew.filter((member) => member.role === "crew_lead");
  }, [crew, siteId]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 6);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles(next);
    setPreviews(next.map((file) => URL.createObjectURL(file)));
    setDrafts([]);
    setSummary("");
  }

  async function readPhotos() {
    if (!files.length) {
      setError("Add at least one photo.");
      return;
    }
    setReading(true);
    setError("");
    try {
      const images = await Promise.all(files.map(fileToImage));
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const data = (await response.json()) as {
        error?: string;
        sample?: boolean;
        summary?: string;
        findings?: Array<Omit<Draft, "key" | "include" | "assigneeId" | "dueOn" | "actionTitle"> & { suggestedAction: string }>;
      };
      if (!response.ok) {
        setError(data.error || "The photos could not be read.");
        return;
      }
      const assignee = leads[0]?.id ?? crew[0]?.id ?? "";
      setSample(Boolean(data.sample));
      setSummary(data.summary || "Walk recorded.");
      setDrafts(
        (data.findings ?? []).map((finding, index) => ({
          key: `${index}-${finding.title}`,
          photoIndex: finding.photoIndex,
          category: finding.category,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          boundingDescription: finding.boundingDescription,
          oshaCategory: finding.oshaCategory,
          sample: Boolean(data.sample),
          include: true,
          assigneeId: assignee,
          dueOn: shiftDate(finding.severity === "critical" || finding.severity === "high" ? 2 : 5),
          actionTitle: finding.suggestedAction,
        })),
      );
      setStep(2);
    } catch {
      setError("The photos could not be read.");
    } finally {
      setReading(false);
    }
  }

  async function save() {
    if (!siteId) {
      setError("Choose a site.");
      return;
    }
    if (!crew.length) {
      setError("Add a crew lead before assigning actions.");
      return;
    }
    const kept = drafts.filter((draft) => draft.include);
    if (kept.some((draft) => !draft.assigneeId || !draft.actionTitle.trim())) {
      setError("Each finding needs an action and a crew lead.");
      return;
    }
    setSaving(true);
    setError("");
    const formData = new FormData();
    formData.set("demo", demo ? "1" : "0");
    formData.set("basePath", basePath);
    formData.set(
      "payload",
      JSON.stringify({
        siteId,
        walkedOn,
        conductedBy: walker,
        weather,
        crewCount,
        notes,
        summary: summary || "Walk recorded with no open findings.",
        sample,
        findings: kept.map((draft) => ({
          photoIndex: draft.photoIndex,
          category: draft.category,
          severity: draft.severity,
          title: draft.title,
          description: draft.description,
          boundingDescription: draft.boundingDescription,
          oshaCategory: draft.oshaCategory,
          sample: draft.sample,
          action: { title: draft.actionTitle, assigneeId: draft.assigneeId, dueOn: draft.dueOn },
        })),
      }),
    );
    files.forEach((file) => formData.append("files", file));
    try {
      const result = await saveWalk(formData);
      if (result) setError(result.error);
    } catch (error) {
      if (isRedirect(error)) throw error;
      setError("The walk could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <ol className="flex gap-2" aria-label="Walk steps">
        {STEPS.map((label, index) => (
          <li key={label} className={cn("rounded-full px-3 py-1 text-sm", index === step ? "bg-ink text-hivis" : "bg-muted text-muted-foreground")}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <section className="grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <label className="grid gap-1.5 text-sm font-medium">
            Site
            <select className="field" value={siteId} onChange={(event) => setSiteId(event.target.value)}>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Date
              <input className="field" type="date" value={walkedOn} onChange={(event) => setWalkedOn(event.target.value)} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Crew on site
              <input className="field" type="number" min={1} max={400} value={crewCount} onChange={(event) => setCrewCount(Number(event.target.value))} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Walked by
              <input className="field" value={walker} onChange={(event) => setWalker(event.target.value)} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Weather
              <input className="field" value={weather} onChange={(event) => setWeather(event.target.value)} />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium">
            Notes
            <textarea className="field min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What was happening on the floor?" />
          </label>
          <button type="button" className="h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground" onClick={() => setStep(1)}>
            Add photos
          </button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <label className="grid cursor-pointer gap-2 rounded-xl border border-dashed p-8 text-center">
            <span className="font-medium">Drop site photos or click to choose</span>
            <span className="text-sm text-muted-foreground">Up to 6 JPEG, PNG, or WebP files. People should stay out of the frame when you can.</span>
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(event) => addFiles(event.target.files)}
            />
          </label>
          {previews.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previews.map((src, index) => (
                <li key={src} className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob previews are not valid next/image sources */}
                  <img src={src} alt={`Selected site photo ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="h-10 rounded-lg border px-4 text-sm" onClick={() => setStep(0)}>
              Back
            </button>
            <button type="button" disabled={reading} className="h-10 rounded-lg bg-hivis px-4 text-sm font-medium text-ink disabled:opacity-60" onClick={readPhotos}>
              {reading ? "Reading the site…" : "Read photos"}
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="grid gap-4">
          {sample ? (
            <p className="rounded-xl bg-hivis/50 px-4 py-3 text-sm text-ink">
              Sample reading. Set ANTHROPIC_API_KEY to have Claude look at these photos. You can still file this walk.
            </p>
          ) : (
            <p className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">{summary}</p>
          )}
          {!drafts.length ? <p className="text-sm text-muted-foreground">No findings were returned. You can still save the walk.</p> : null}
          {drafts.map((draft, index) => (
            <article key={draft.key} className={cn("grid gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10", !draft.include && "opacity-50")}>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.include}
                    onChange={(event) => updateDraft(setDrafts, index, { include: event.target.checked })}
                  />
                  Keep
                </label>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", SEVERITY_META[draft.severity].className)}>{SEVERITY_META[draft.severity].label}</span>
                <span className="text-xs text-muted-foreground">{CATEGORY_META[draft.category].label} · Photo {draft.photoIndex + 1}</span>
              </div>
              <label className="grid gap-1 text-sm font-medium">
                Finding
                <input className="field" value={draft.title} onChange={(event) => updateDraft(setDrafts, index, { title: event.target.value })} />
              </label>
              <p className="text-sm text-muted-foreground">{draft.description}</p>
              <p className="text-sm"><span className="font-medium">In the frame: </span>{draft.boundingDescription}</p>
              <p className="text-xs text-muted-foreground">{draft.oshaCategory}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Severity
                  <select className="field" value={draft.severity} onChange={(event) => updateDraft(setDrafts, index, { severity: event.target.value as Severity })}>
                    {Object.entries(SEVERITY_META).map(([key, meta]) => (
                      <option key={key} value={key}>{meta.label}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Category
                  <select className="field" value={draft.category} onChange={(event) => updateDraft(setDrafts, index, { category: event.target.value as Category })}>
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                      <option key={key} value={key}>{meta.label}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                  Corrective action
                  <input className="field" value={draft.actionTitle} onChange={(event) => updateDraft(setDrafts, index, { actionTitle: event.target.value })} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Crew lead
                  <select className="field" value={draft.assigneeId} onChange={(event) => updateDraft(setDrafts, index, { assigneeId: event.target.value })}>
                    {crew.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} · {member.trade}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Due
                  <input className="field" type="date" value={draft.dueOn} onChange={(event) => updateDraft(setDrafts, index, { dueOn: event.target.value })} />
                </label>
              </div>
            </article>
          ))}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="h-10 rounded-lg border px-4 text-sm" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" disabled={saving} className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" onClick={save}>
              {saving ? "Saving the walk…" : "Save walk and daily log"}
            </button>
          </div>
        </section>
      ) : null}

      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
    </div>
  );
}

function updateDraft(setDrafts: React.Dispatch<React.SetStateAction<Draft[]>>, index: number, patch: Partial<Draft>) {
  setDrafts((current) => current.map((draft, itemIndex) => (itemIndex === index ? { ...draft, ...patch } : draft)));
}

function fileToImage(file: File): Promise<{ mediaType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const data = result.includes(",") ? result.split(",")[1] : result;
      resolve({ mediaType: file.type || "image/jpeg", data });
    };
    reader.onerror = () => reject(new Error("Could not read the photo."));
    reader.readAsDataURL(file);
  });
}

function isRedirect(error: unknown): boolean {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT");
}
