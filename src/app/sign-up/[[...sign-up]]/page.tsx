import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { clerkAppearance, clerkConfigured } from "@/lib/brand";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthShell title="Create account">
      {clerkConfigured() ? (
        <SignUp appearance={clerkAppearance} />
      ) : (
        <div>
          <h1 className="font-heading text-4xl font-semibold">Create an account</h1>
          <p className="mt-3 text-muted-foreground">
            Add Clerk keys to open real accounts and organizations. Until then, the sample company is ready to click through.
          </p>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-lg bg-hivis px-4 py-2 text-sm font-medium text-ink">
            Open the sample company
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
