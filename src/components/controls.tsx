"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createCrew, createSite, importSampleCompany, updateActionStatus, updateFindingStatus } from "@/lib/actions";
import type { ActionStatus } from "@/lib/types";

export function ActionStatusSelect({ id, status, demo }: { id: string; status: ActionStatus; demo: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);

  return (
    <label className="text-xs text-muted-foreground">
      Status
      <select
        className="field mt-1 h-9"
        value={value}
        disabled={pending}
        aria-label="Action status"
        onChange={async (event) => {
          const next = event.target.value as ActionStatus;
          setValue(next);
          setPending(true);
          const result = await updateActionStatus(id, next, demo);
          setPending(false);
          if (!result.ok) {
            setValue(status);
            toast.error(result.error);
            return;
          }
          toast.success(next === "closed" ? "Action closed." : "Action updated.");
          router.refresh();
        }}
      >
        <option value="open">Open</option>
        <option value="in_progress">In progress</option>
        <option value="closed">Closed</option>
      </select>
    </label>
  );
}

export function FindingStatusButton({ id, status, demo }: { id: string; status: "open" | "closed"; demo: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const next = status === "open" ? "closed" : "open";
  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm font-medium underline-offset-4 hover:underline disabled:opacity-50"
      onClick={async () => {
        setPending(true);
        const result = await updateFindingStatus(id, next, demo);
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(next === "closed" ? "Finding closed." : "Finding reopened.");
        router.refresh();
      }}
    >
      {status === "open" ? "Close finding" : "Reopen finding"}
    </button>
  );
}

export function ImportSampleButton({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      className="rounded-lg bg-hivis px-3 py-2 text-sm font-medium text-ink disabled:opacity-60"
      onClick={async () => {
        setPending(true);
        const result = await importSampleCompany(demo);
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Sample company loaded.");
        router.refresh();
      }}
    >
      {pending ? "Loading…" : "Load Ridge & Co. sample"}
    </button>
  );
}

export function SiteForm({ demo, basePath }: { demo: boolean; basePath: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        const result = await createSite(new FormData(event.currentTarget));
        setPending(false);
        if (result) setError(result.error);
      }}
    >
      <input type="hidden" name="demo" value={demo ? "1" : "0"} />
      <input type="hidden" name="basePath" value={basePath} />
      <Field label="Site name" name="name" placeholder="Harborline Apartments" />
      <Field label="Street address" name="address" placeholder="418 NW Harbor Ave" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" name="city" placeholder="Portland" />
        <Field label="State" name="region" placeholder="OR" />
      </div>
      <Field label="Phase" name="phase" placeholder="Level 3 framing" />
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      <button type="submit" disabled={pending} className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : "Add site"}
      </button>
    </form>
  );
}

export function CrewForm({
  demo,
  basePath,
  sites,
}: {
  demo: boolean;
  basePath: string;
  sites: { id: string; name: string }[];
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        const result = await createCrew(new FormData(event.currentTarget));
        setPending(false);
        if (result) setError(result.error);
      }}
    >
      <input type="hidden" name="demo" value={demo ? "1" : "0"} />
      <input type="hidden" name="basePath" value={basePath} />
      <Field label="Name" name="name" placeholder="Andre Walsh" />
      <label className="grid gap-1.5 text-sm font-medium">
        Role
        <select name="role" className="field" defaultValue="crew_lead">
          <option value="crew_lead">Crew lead</option>
          <option value="superintendent">Superintendent</option>
          <option value="safety">Safety</option>
        </select>
      </label>
      <Field label="Trade" name="trade" placeholder="Framing" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" placeholder="andre.walsh@ridgeco.example" />
        <Field label="Phone" name="phone" placeholder="(503) 555-0118" />
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        Home site
        <select name="siteId" className="field" defaultValue="">
          <option value="">Company-wide</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </label>
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      <button type="submit" disabled={pending} className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : "Add crew"}
      </button>
    </form>
  );
}

function Field({ label, name, placeholder, type = "text" }: { label: string; name: string; placeholder?: string; type?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input className="field" name={name} type={type} placeholder={placeholder} required />
    </label>
  );
}
