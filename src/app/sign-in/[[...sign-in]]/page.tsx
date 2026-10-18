import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { clerkAppearance, clerkConfigured } from "@/lib/brand";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell title="Sign in">
      {clerkConfigured() ? (
        <SignIn appearance={clerkAppearance} />
      ) : (
        <div>
          <h1 className="font-heading text-4xl font-semibold">Sign in</h1>
          <p className="mt-3 text-muted-foreground">
            Clerk keys are not set, so this preview opens the sample company without an account. Run <code className="text-foreground">npx clerk@latest init</code> for keyless dev keys, or add your own keys to require sign-in.
          </p>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-lg bg-hivis px-4 py-2 text-sm font-medium text-ink">
            Open the sample company
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
