import { formatDay, shiftDate } from "@/lib/dates";
import type { CorrectiveAction, Finding, Walk } from "@/lib/types";

export type FindingPoint = {
  date: string;
  label: string;
  ppe: number;
  fall: number;
  housekeeping: number;
  electrical: number;
  total: number;
};

export function findingsSeries(findings: Finding[], walks: Walk[], days = 14): FindingPoint[] {
  const walkedOn = new Map(walks.map((walk) => [walk.id, walk.walkedOn]));
  const points: FindingPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = shiftDate(-offset);
    const point: FindingPoint = { date, label: formatDay(date), ppe: 0, fall: 0, housekeeping: 0, electrical: 0, total: 0 };
    for (const finding of findings) {
      if (walkedOn.get(finding.walkId) !== date) continue;
      point[finding.category] += 1;
      point.total += 1;
    }
    points.push(point);
  }
  return points;
}

export function actionSplit(actions: CorrectiveAction[]) {
  return [
    { key: "open" as const, label: "Open", value: actions.filter((action) => action.status === "open").length },
    { key: "in_progress" as const, label: "In progress", value: actions.filter((action) => action.status === "in_progress").length },
    { key: "closed" as const, label: "Closed", value: actions.filter((action) => action.status === "closed").length },
  ];
}

