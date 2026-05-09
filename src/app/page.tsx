"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Violation {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location: string;
  recommendation: string;
}

interface Analysis {
  safetyScore: number;
  violations: Violation[];
  compliantItems: string[];
  immediateActions: string[];
  incidentLogEntry: string;
}

const severityColor: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaType(file.type || "image/jpeg");
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!imageBase64) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function downloadLog() {
    if (!analysis) return;
    const log = `CONSTRUCTION SITE SAFETY INCIDENT LOG\n${"=".repeat(40)}\nDate: ${new Date().toISOString()}\nSafety Score: ${analysis.safetyScore}/100\n\nVIOLATIONS FOUND: ${analysis.violations.length}\n${analysis.violations.map((v, i) => `\n${i + 1}. [${v.severity.toUpperCase()}] ${v.type}\n   Description: ${v.description}\n   Location: ${v.location}\n   Recommendation: ${v.recommendation}`).join("")}\n\nIMMEDIATE ACTIONS REQUIRED:\n${analysis.immediateActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nFORMAL LOG ENTRY:\n${analysis.incidentLogEntry}`;
    const blob = new Blob([log], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safety-incident-log-${Date.now()}.txt`;
    a.click();
  }

  const scoreColor = !analysis ? "" : analysis.safetyScore >= 80 ? "text-green-400" : analysis.safetyScore >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-slate-900 text-sm font-bold">!</div>
          <div>
            <h1 className="text-lg font-semibold">Construction Site Safety Agent</h1>
            <p className="text-xs text-slate-400">AI-powered PPE and hazard detection</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Upload Site Image</CardTitle>
            <CardDescription className="text-slate-400">Upload a photo from your construction site for instant safety analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-yellow-500 transition-colors"
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Site" className="max-h-64 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="text-slate-400">
                  <div className="text-4xl mb-2">📷</div>
                  <p>Click to upload site photo</p>
                  <p className="text-xs mt-1">JPG, PNG, WEBP supported</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button onClick={analyze} disabled={loading || !imageBase64} className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold">
              {loading ? "Analyzing..." : "Run Safety Analysis"}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700 text-center py-6">
                <div className={`text-4xl font-bold ${scoreColor}`}>{analysis.safetyScore}</div>
                <div className="text-slate-400 text-sm mt-1">Safety Score / 100</div>
              </Card>
              <Card className="bg-slate-800 border-slate-700 text-center py-6">
                <div className="text-4xl font-bold text-red-400">{analysis.violations.length}</div>
                <div className="text-slate-400 text-sm mt-1">Violations Found</div>
              </Card>
              <Card className="bg-slate-800 border-slate-700 text-center py-6">
                <div className="text-4xl font-bold text-green-400">{analysis.compliantItems.length}</div>
                <div className="text-slate-400 text-sm mt-1">Compliant Items</div>
              </Card>
            </div>

            {analysis.immediateActions.length > 0 && (
              <Card className="bg-red-900/30 border-red-500">
                <CardHeader><CardTitle className="text-red-400">Immediate Actions Required</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {analysis.immediateActions.map((a, i) => (
                      <li key={i} className="text-red-300 text-sm flex gap-2"><span>!</span>{a}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.violations.map((v, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={severityColor[v.severity]}>{v.severity.toUpperCase()}</Badge>
                    <span className="font-medium text-white">{v.type}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{v.description}</p>
                  <p className="text-slate-500 text-xs">Location: {v.location}</p>
                  <p className="text-yellow-400 text-sm bg-yellow-500/10 rounded p-2">Fix: {v.recommendation}</p>
                </CardContent>
              </Card>
            ))}

            <Button onClick={downloadLog} className="w-full bg-slate-700 hover:bg-slate-600">
              Download Incident Log (.txt)
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
