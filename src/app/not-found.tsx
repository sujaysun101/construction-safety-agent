import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">404</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold">That page is not on the job.</h1>
        <Link href="/" className="mt-4 inline-block text-sm font-medium underline">
          Back to HiVis
        </Link>
      </div>
    </div>
  );
}
