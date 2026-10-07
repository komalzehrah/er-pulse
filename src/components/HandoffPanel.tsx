import { useState } from "react";
import { generateHandoffSummary } from "@/lib/handoff.functions";

export function HandoffPanel({ snapshot }: { snapshot: () => { patients: string; staffing: string; alerts: string } }) {
  const [patients, setPatients] = useState("");
  const [staffing, setStaffing] = useState("");
  const [alertsTxt, setAlerts] = useState("");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fill = () => { const s = snapshot(); setPatients(s.patients); setStaffing(s.staffing); setAlerts(s.alerts); };

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const notes = `PATIENTS:\n${patients}\n\nSTAFFING:\n${staffing}\n\nALERTS / EMS:\n${alertsTxt}\n\nADDITIONAL NOTES:\n${extra || "none"}`;
      const r = await generateHandoffSummary({ data: { notes } });
      if (r.error) setError(r.error); else setSummary(r.summary);
    } catch { setError("Could not reach the AI service. Try again."); }
    finally { setLoading(false); }
  };

  const empty = !patients.trim() && !staffing.trim() && !alertsTxt.trim() && !extra.trim();
  const field = "w-full rounded-md border border-border bg-panel p-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <section className="panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">AI Shift Handoff Summary</h2>
        <button onClick={fill} className="rounded-md border border-border px-3 py-1 text-xs hover:bg-accent">Fill from dashboard</button>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <Label t="Patients" /><textarea rows={5} className={field} value={patients} onChange={(e) => setPatients(e.target.value)} placeholder="Current patients, acuity, pending tests…" />
          <Label t="Staffing" /><textarea rows={3} className={field} value={staffing} onChange={(e) => setStaffing(e.target.value)} placeholder="Who's clocked in, gaps, shift changes…" />
          <Label t="Alerts / EMS" /><textarea rows={3} className={field} value={alertsTxt} onChange={(e) => setAlerts(e.target.value)} placeholder="Local incidents, inbound ambulances…" />
          <Label t="Additional notes" /><textarea rows={2} className={field} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Anything else the next shift should know" />
          <button onClick={run} disabled={loading || empty} className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {loading ? "Generating summary…" : "Generate handoff summary"}
          </button>
        </div>
        <div className="rounded-md border border-border bg-panel p-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!error && !summary && <p className="text-sm text-muted-foreground">{loading ? "Writing the handoff…" : "Enter or auto-fill details, then generate a concise handoff for the incoming team."}</p>}
          {summary && !error && (
            <>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{summary.replace(/\*\*/g, "")}</div>
              <button onClick={() => navigator.clipboard.writeText(summary)} className="mt-3 rounded-md border border-border px-3 py-1 text-xs hover:bg-accent">Copy</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Label({ t }: { t: string }) {
  return <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{t}</div>;
}
