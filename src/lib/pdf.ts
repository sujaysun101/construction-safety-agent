import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { CATEGORY_META, SEVERITY_META } from "@/lib/brand";
import { formatLong, isOverdue } from "@/lib/dates";
import type { CorrectiveAction, CrewMember, Finding, Site, Walk } from "@/lib/types";

type ReportInput = {
  companyName: string;
  site: Site;
  from: string;
  to: string;
  walks: Walk[];
  findings: Finding[];
  actions: CorrectiveAction[];
  crew: CrewMember[];
};

const ink = rgb(0.11, 0.16, 0.13);
const paper = rgb(0.98, 0.97, 0.94);
const hivis = rgb(0.86, 0.93, 0.32);
const muted = rgb(0.35, 0.4, 0.36);
const line = rgb(0.82, 0.8, 0.74);

function wrap(text: string, font: { widthOfTextAtSize: (value: string, size: number) => number }, size: number, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function buildSafetyReport(input: ReportInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const crewName = new Map(input.crew.map((member) => [member.id, member.name]));
  const walkDate = new Map(input.walks.map((walk) => [walk.id, walk.walkedOn]));

  let page = pdf.addPage([612, 792]);
  let y = 750;

  const newPage = () => {
    page = pdf.addPage([612, 792]);
    y = 750;
    page.drawRectangle({ x: 0, y: 760, width: 612, height: 32, color: ink });
    page.drawText("HiVis  ·  Safety report", { x: 40, y: 772, size: 10, font: bold, color: hivis });
    y = 730;
  };

  const ensure = (height: number) => {
    if (y - height < 48) newPage();
  };

  page.drawRectangle({ x: 0, y: 700, width: 612, height: 92, color: ink });
  page.drawText("HIVIS", { x: 40, y: 748, size: 22, font: bold, color: hivis });
  page.drawText("Daily safety report", { x: 120, y: 752, size: 12, font: regular, color: rgb(0.93, 0.94, 0.9) });
  page.drawText(input.companyName, { x: 40, y: 722, size: 11, font: regular, color: rgb(0.86, 0.9, 0.84) });
  y = 670;

  page.drawText(input.site.name, { x: 40, y, size: 20, font: bold, color: ink });
  y -= 18;
  page.drawText(`${input.site.address}, ${input.site.city}, ${input.site.region}  ·  ${input.site.phase}`, {
    x: 40,
    y,
    size: 10,
    font: regular,
    color: muted,
  });
  y -= 16;
  page.drawText(`${formatLong(input.from)} – ${formatLong(input.to)}`, { x: 40, y, size: 10, font: regular, color: muted });
  y -= 28;

  const openFindings = input.findings.filter((finding) => finding.status === "open").length;
  const openActions = input.actions.filter((action) => action.status !== "closed").length;
  const overdue = input.actions.filter((action) => isOverdue(action.dueOn, action.status)).length;
  const stats = [
    ["Walks", String(input.walks.length)],
    ["Findings", String(input.findings.length)],
    ["Open findings", String(openFindings)],
    ["Open actions", String(openActions)],
    ["Overdue", String(overdue)],
  ];
  stats.forEach(([label, value], index) => {
    const x = 40 + index * 108;
    page.drawRectangle({ x, y: y - 36, width: 100, height: 48, color: paper, borderColor: line, borderWidth: 1 });
    page.drawText(value, { x: x + 8, y: y - 8, size: 16, font: bold, color: ink });
    page.drawText(label, { x: x + 8, y: y - 26, size: 8, font: regular, color: muted });
  });
  y -= 64;

  const section = (title: string) => {
    ensure(36);
    page.drawText(title, { x: 40, y, size: 13, font: bold, color: ink });
    y -= 8;
    page.drawLine({ start: { x: 40, y }, end: { x: 572, y }, thickness: 1, color: line });
    y -= 16;
  };

  section("Findings");
  if (!input.findings.length) {
    page.drawText("No findings in this date range.", { x: 40, y, size: 10, font: regular, color: muted });
    y -= 20;
  }
  for (const finding of input.findings) {
    const body = wrap(`${finding.description} Where: ${finding.boundingDescription}`, regular, 9, 500);
    ensure(36 + body.length * 12);
    const when = walkDate.get(finding.walkId) ?? "";
    page.drawText(`${SEVERITY_META[finding.severity].label.toUpperCase()}  ·  ${CATEGORY_META[finding.category].label}  ·  ${when}`, {
      x: 40,
      y,
      size: 8,
      font: bold,
      color: muted,
    });
    y -= 12;
    page.drawText(finding.title, { x: 40, y, size: 11, font: bold, color: ink });
    y -= 12;
    for (const row of body) {
      page.drawText(row, { x: 40, y, size: 9, font: regular, color: ink });
      y -= 11;
    }
    page.drawText(finding.oshaCategory, { x: 40, y, size: 8, font: regular, color: muted });
    y -= 16;
  }

  section("Corrective actions");
  if (!input.actions.length) {
    page.drawText("No corrective actions in this date range.", { x: 40, y, size: 10, font: regular, color: muted });
    y -= 20;
  }
  for (const action of input.actions) {
    const finding = input.findings.find((item) => item.id === action.findingId);
    const row = wrap(action.title, regular, 9, 360);
    ensure(28 + row.length * 11);
    page.drawText(`${action.status.replace("_", " ")}  ·  due ${action.dueOn}  ·  ${crewName.get(action.assigneeId) ?? "Unassigned"}`, {
      x: 40,
      y,
      size: 8,
      font: bold,
      color: muted,
    });
    y -= 12;
    for (const lineText of row) {
      page.drawText(lineText, { x: 40, y, size: 10, font: regular, color: ink });
      y -= 12;
    }
    if (finding) {
      page.drawText(finding.title, { x: 40, y, size: 8, font: regular, color: muted });
      y -= 14;
    }
  }

  const pages = pdf.getPages();
  pages.forEach((item, index) => {
    item.drawText("Categories follow OSHA construction standards (29 CFR 1926) as a filing aid. HiVis is not a compliance certification.", {
      x: 40,
      y: 32,
      size: 7,
      font: regular,
      color: muted,
    });
    item.drawText(`${index + 1} / ${pages.length}`, { x: 540, y: 32, size: 8, font: regular, color: muted });
  });

  return pdf.save();
}
