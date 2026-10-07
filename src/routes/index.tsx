import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  patients, staff, alerts, ems, beds, arrivals, shiftEnding,
  ESI_LABEL, ESI_TARGET, type ESI, type Alert,
} from "@/lib/ed-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ED Command — Emergency Department Dashboard" },
      { name: "description", content: "Live ED census, triage acuity, staffing ratios, EMS arrivals and local incident alerts." },
      { property: "og:title", content: "ED Command — Emergency Department Dashboard" },
      { property: "og:description", content: "Live ED census, triage acuity, staffing ratios, EMS arrivals and local incident alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const esiBg: Record<ESI, string> = { 1: "bg-esi1", 2: "bg-esi2", 3: "bg-esi3", 4: "bg-esi4", 5: "bg-esi5" };
const esiText: Record<ESI, string> = { 1: "text-esi1", 2: "text-esi2", 3: "text-esi3", 4: "text-esi4", 5: "text-esi5" };

function Dashboard() {
  // tick = minutes elapsed since load (sped up: 1 min every 10s), starts after mount to keep SSR stable
  const [tick, setTick] = useState(0);
  const [clock, setClock] = useState<string>("--:--");
  useEffect(() => {
    const upd = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    upd();
    const a = setInterval(upd, 10000);
    const b = setInterval(() => setTick((t) => t + 1), 10000);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);

  const [filter, setFilter] = useState<ESI | null>(null);
  const live = useMemo(() => patients.map((p) => ({ ...p, arrivedMinAgo: p.arrivedMinAgo + tick })), [tick]);
  const waiting = live.filter((p) => p.status === "waiting").sort((a, b) => a.esi - b.esi || b.arrivedMinAgo - a.arrivedMinAgo);
  const treating = live.filter((p) => p.status === "in-treatment").sort((a, b) => a.esi - b.esi);
  const avgWait = Math.round(waiting.reduce((s, p) => s + p.arrivedMinAgo, 0) / Math.max(waiting.length, 1));
  const overdue = waiting.filter((p) => p.arrivedMinAgo > ESI_TARGET[p.esi]);
  const counts = ([1, 2, 3, 4, 5] as ESI[]).map((e) => ({ e, w: waiting.filter((p) => p.esi === e).length, t: treating.filter((p) => p.esi === e).length }));
  const census = live.length;
  const highAlerts = alerts.filter((a) => a.impact === "high").length;

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-destructive grid place-items-center font-mono font-bold text-destructive-foreground">ED</div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">ED Command Center</h1>
            <p className="text-xs text-muted-foreground font-mono">MERCY GENERAL · MAIN EMERGENCY DEPT · NIGHT SHIFT</p>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono text-sm">
          {highAlerts > 0 && (
            <span className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/15 px-3 py-1 text-destructive">
              <span className="h-2 w-2 rounded-full bg-destructive animate-blink" /> {highAlerts} HIGH-IMPACT INCIDENTS
            </span>
          )}
          <span className="flex items-center gap-2 text-ok"><span className="h-2 w-2 rounded-full bg-ok animate-blink" />LIVE</span>
          <span className="text-2xl font-semibold text-foreground">{clock}</span>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi label="In Treatment" value={treating.length} sub={`of ${census} census`} tone="primary" />
        <Kpi label="Waiting Room" value={waiting.length} sub={`${overdue.length} past target`} tone={overdue.length > 3 ? "bad" : "warn"} />
        <Kpi label="Avg Wait" value={`${avgWait}m`} sub="door → provider" tone={avgWait > 60 ? "bad" : "warn"} />
        <Kpi label="Beds Occupied" value={`${beds.occupied}/${beds.total}`} sub={`${beds.cleaning} cleaning · ${beds.boarding} boarding`} tone={beds.occupied / beds.total > 0.85 ? "bad" : "ok"} />
        <Kpi label="EMS Inbound" value={ems.length} sub={`next in ${ems[0].eta}m`} tone="bad" />
        <Kpi label="Left w/o Seen" value="2" sub="last 12h · 3.1%" tone="ok" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left column */}
        <div className="xl:col-span-8 space-y-4">
          <Panel title="Seen vs Waiting by Severity (ESI)" right={<span className="text-xs text-muted-foreground">click a level to filter</span>}>
            <div className="grid grid-cols-5 gap-2">
              {counts.map(({ e, w, t }) => (
                <button key={e} onClick={() => setFilter(filter === e ? null : e)}
                  className={`rounded-md border p-3 text-left transition ${filter === e ? "border-primary bg-accent" : "border-border bg-panel hover:bg-accent"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-sm ${esiBg[e]}`} />
                    <span className="font-mono text-xs text-muted-foreground">ESI {e}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium">{ESI_LABEL[e]}</div>
                  <div className="mt-2 flex items-end gap-3 font-mono">
                    <div><div className="text-2xl font-semibold">{t}</div><div className="text-[10px] text-muted-foreground">SEEN</div></div>
                    <div><div className={`text-2xl font-semibold ${esiText[e]}`}>{w}</div><div className="text-[10px] text-muted-foreground">WAIT</div></div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted">
              {counts.map(({ e, w, t }) => (
                <div key={e} className={esiBg[e]} style={{ width: `${((w + t) / census) * 100}%` }} title={`ESI ${e}: ${w + t}`} />
              ))}
            </div>
          </Panel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title={`Waiting Room · ${waiting.length}`} right={<span className="text-xs text-muted-foreground">sorted by acuity</span>}>
              <ul className="divide-y divide-border">
                {waiting.filter((p) => !filter || p.esi === filter).map((p) => {
                  const late = p.arrivedMinAgo > ESI_TARGET[p.esi];
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-2">
                      <EsiBadge esi={p.esi} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p.complaint}</div>
                        <div className="font-mono text-xs text-muted-foreground">{p.id} · {p.name} · {p.age}y</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className={`text-sm font-semibold ${late ? "text-destructive" : "text-foreground"}`}>{p.arrivedMinAgo}m</div>
                        <div className="text-[10px] text-muted-foreground">target {ESI_TARGET[p.esi]}m</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title={`In Treatment · ${treating.length}`}>
              <ul className="divide-y divide-border">
                {treating.filter((p) => !filter || p.esi === filter).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2">
                    <EsiBadge esi={p.esi} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.complaint}</div>
                      <div className="font-mono text-xs text-muted-foreground">{p.location} · {p.provider}</div>
                      {p.pending && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.pending.map((x) => <span key={x} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-warn">⏳ {x}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-sm text-muted-foreground">{p.arrivedMinAgo}m</div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <Panel title="Arrivals — Actual vs Forecast (per hour)">
            <div className="flex h-36 items-end gap-2">
              {arrivals.map((a) => (
                <div key={a.h} className="flex flex-1 flex-col items-center gap-1">
                  <div className="relative flex h-28 w-full items-end justify-center gap-0.5">
                    <div className="w-1/2 rounded-t bg-muted-foreground/30" style={{ height: `${(a.forecast / 10) * 100}%` }} />
                    {a.actual !== undefined && <div className="w-1/2 rounded-t bg-primary" style={{ height: `${(a.actual / 10) * 100}%` }} />}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{a.h}:00</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary" />Actual</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-muted-foreground/30" />Forecast</span>
              <span className="ml-auto text-warn">03:00 running +100% over forecast — consider calling backup RN</span>
            </div>
          </Panel>
        </div>

        {/* Right column */}
        <div className="xl:col-span-4 space-y-4">
          <Panel title="EMS Inbound">
            <ul className="space-y-2">
              {ems.map((e) => (
                <li key={e.unit} className="flex items-center gap-3 rounded-md bg-panel p-2">
                  <div className="w-14 text-center font-mono">
                    <div className="text-xl font-semibold">{Math.max(e.eta - tick, 0)}</div>
                    <div className="text-[10px] text-muted-foreground">MIN</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {e.unit} <EsiBadge esi={e.esi} small />
                      {e.alert && <span className="rounded bg-destructive px-1.5 text-[10px] font-mono text-destructive-foreground">{e.alert}</span>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{e.summary}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Staff-to-Patient Ratios">
            <ul className="space-y-3">
              {staff.map((s) => {
                const ratio = census / Math.max(s.clockedIn, 1);
                const over = ratio > s.targetRatio;
                const pct = Math.min((ratio / (s.targetRatio * 1.5)) * 100, 100);
                return (
                  <li key={s.role}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">{s.role}</span>
                      <span className={`font-mono ${over ? "text-destructive" : "text-ok"}`}>1:{ratio.toFixed(1)} <span className="text-muted-foreground">/ 1:{s.targetRatio}</span></span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <div className={`h-full rounded-full ${over ? "bg-destructive" : "bg-ok"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
                      <span>{s.clockedIn}/{s.scheduled} clocked in</span>
                      {s.note && <span className="text-warn">{s.note}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 border-t border-border pt-3">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Shift ending soon</div>
              {shiftEnding.map((s) => (
                <div key={s.name} className="flex justify-between font-mono text-xs"><span>{s.name}</span><span className="text-muted-foreground">{s.inMin}m</span></div>
              ))}
            </div>
          </Panel>

          <Panel title="Local Incident Alerts">
            <ul className="space-y-2">
              {alerts.map((a) => <AlertItem key={a.id} a={a} />)}
            </ul>
          </Panel>

          <Panel title="Bed Board">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: beds.total }).map((_, i) => {
                const cls = i < beds.occupied - beds.boarding ? "bg-primary/70" : i < beds.occupied ? "bg-warn/80" : i < beds.occupied + beds.cleaning ? "bg-muted-foreground/40" : "bg-ok/30 border border-ok/60";
                return <div key={i} className={`aspect-square rounded-sm ${cls}`} title={`Bed ${i + 1}`} />;
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/70" />Occupied</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-warn/80" />Boarding</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-muted-foreground/40" />Cleaning</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-ok/30 border border-ok/60" />Open</span>
            </div>
          </Panel>
        </div>
      </div>
      <p className="text-center text-[11px] text-muted-foreground font-mono">Demo data · not connected to EHR, timekeeping or news feeds</p>
    </div>
  );
}

function Panel({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: ReactNode; sub: string; tone: "primary" | "ok" | "warn" | "bad" }) {
  const c = { primary: "text-primary", ok: "text-ok", warn: "text-warn", bad: "text-destructive" }[tone];
  const bar = { primary: "bg-primary", ok: "bg-ok", warn: "bg-warn", bad: "bg-destructive" }[tone];
  return (
    <div className="panel relative overflow-hidden p-3">
      <span className={`absolute left-0 top-0 h-full w-1 ${bar}`} />
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-3xl font-semibold ${c}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function EsiBadge({ esi, small }: { esi: ESI; small?: boolean }) {
  return (
    <span className={`grid place-items-center rounded font-mono font-bold text-primary-foreground ${esiBg[esi]} ${small ? "h-5 w-5 text-[10px]" : "h-8 w-8 text-sm"}`}>
      {esi}
    </span>
  );
}

const alertIcon: Record<Alert["type"], string> = { crime: "🚨", traffic: "🚗", weather: "⛈", "public-health": "🦠", event: "🎟" };

function AlertItem({ a }: { a: Alert }) {
  const tone = a.impact === "high" ? "border-destructive/60 bg-destructive/10" : a.impact === "medium" ? "border-warn/50 bg-warn/10" : "border-border bg-panel";
  const label = a.impact === "high" ? "text-destructive" : a.impact === "medium" ? "text-warn" : "text-muted-foreground";
  const ago = a.minAgo < 60 ? `${a.minAgo}m ago` : `${Math.round(a.minAgo / 60)}h ago`;
  return (
    <li className={`rounded-md border p-2.5 ${tone}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none">{alertIcon[a.type]}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{a.title}</div>
          <div className="text-xs text-muted-foreground">{a.detail}</div>
          <div className="mt-1 flex gap-2 font-mono text-[10px] text-muted-foreground">
            <span className={`font-semibold uppercase ${label}`}>{a.impact} impact</span>
            <span>· {a.distance}</span><span>· {ago}</span><span>· {a.source}</span>
          </div>
        </div>
      </div>
    </li>
  );
}
