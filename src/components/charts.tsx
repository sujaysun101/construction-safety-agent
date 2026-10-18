"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ACTION_CHART_COLORS, CATEGORY_META } from "@/lib/brand";
import type { FindingPoint } from "@/lib/metrics";

export function FindingsChart({ data, height = 240 }: { data: FindingPoint[]; height?: number }) {
  const empty = data.every((point) => point.total === 0);
  if (empty) {
    return <p className="text-sm text-muted-foreground">No findings in this window yet. A walk will start the chart.</p>;
  }
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={8}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
          />
          <Bar dataKey="ppe" name="PPE" stackId="findings" fill={CATEGORY_META.ppe.color} isAnimationActive={false} />
          <Bar dataKey="fall" name="Fall hazard" stackId="findings" fill={CATEGORY_META.fall.color} isAnimationActive={false} />
          <Bar dataKey="housekeeping" name="Housekeeping" stackId="findings" fill={CATEGORY_META.housekeeping.color} isAnimationActive={false} />
          <Bar dataKey="electrical" name="Electrical" stackId="findings" fill={CATEGORY_META.electrical.color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActionsChart({ data, height = 220 }: { data: { key: "open" | "in_progress" | "closed"; label: string; value: number }[]; height?: number }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    return <p className="text-sm text-muted-foreground">No corrective actions yet.</p>;
  }
  const size = Math.min(height, 168);
  return (
    <div className="flex items-center gap-3" style={{ height }}>
      <PieChart width={size} height={size} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx={size / 2}
          cy={size / 2}
          innerRadius={size * 0.32}
          outerRadius={size * 0.46}
          paddingAngle={2}
          stroke="none"
          isAnimationActive={false}
        >
          {data.map((item) => (
            <Cell key={item.key} fill={ACTION_CHART_COLORS[item.key]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
      </PieChart>
      <ul className="space-y-2 text-sm">
        {data.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: ACTION_CHART_COLORS[item.key] }} />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartLegend() {
  return (
    <ul className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {Object.entries(CATEGORY_META).map(([key, meta]) => (
        <li key={key} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </li>
      ))}
    </ul>
  );
}
