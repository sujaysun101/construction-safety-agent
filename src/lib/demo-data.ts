import { DEMO_ORG_ID } from "@/lib/brand";
import { shiftDate } from "@/lib/dates";
import type {
  ActionStatus,
  Category,
  CrewRole,
  Dataset,
  FindingStatus,
  Severity,
} from "@/lib/types";

function id(orgId: string, key: string): string {
  return `${orgId}__${key}`;
}

type FindingSeed = {
  key: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  boundingDescription: string;
  oshaCategory: string;
  status: FindingStatus;
  action?: {
    key: string;
    title: string;
    assignee: string;
    dueInDays: number;
    status: ActionStatus;
    closedDaysAgo?: number;
  };
};

type WalkSeed = {
  key: string;
  site: "harbor" | "cedar";
  daysAgo: number;
  by: string;
  weather: string;
  crewCount: number;
  notes: string;
  summary: string;
  photo: { file: string; caption: string };
  findings: FindingSeed[];
};

const WALKS: WalkSeed[] = [
  {
    key: "h18",
    site: "harbor",
    daysAgo: 18,
    by: "Maya Chen",
    weather: "Clear, 61°F",
    crewCount: 18,
    notes: "Level 2 was the only active floor before the crane pickup.",
    summary: "Level 2 was quiet. One housekeeping item in the east stair, corrected before lunch.",
    photo: { file: "housekeeping.svg", caption: "East stair landing with lumber stacked across the walk line" },
    findings: [
      {
        key: "h18-lumber",
        category: "housekeeping",
        severity: "low",
        title: "Scrap lumber stacked on the east stair landing",
        description: "Offcuts and a partial bunk of studs were sitting on the landing, narrowing the stair to a single file path.",
        boundingDescription: "Lower right of the frame, across the stair landing.",
        oshaCategory: "29 CFR 1926.25 — Housekeeping",
        status: "closed",
        action: {
          key: "h18-lumber-a",
          title: "Clear the east stair and restack lumber on the material rack.",
          assignee: "rosa",
          dueInDays: -17,
          status: "closed",
          closedDaysAgo: 18,
        },
      },
    ],
  },
  {
    key: "h15",
    site: "harbor",
    daysAgo: 15,
    by: "Luis Ortega",
    weather: "Overcast, 56°F",
    crewCount: 16,
    notes: "Hoist operator flagged the leading edge before the first lift.",
    summary: "Hoist area and the level 2 ladder needed attention. Both were closed the same afternoon.",
    photo: { file: "ppe.svg", caption: "Hoist edge with a hard hat left on the sawhorse" },
    findings: [
      {
        key: "h15-hat",
        category: "ppe",
        severity: "medium",
        title: "Hard hat left on the sawhorse at the hoist",
        description: "The only hard hat in the frame was sitting on the sawhorse. The leading edge at the hoist had no head protection staged for the crew working the lift.",
        boundingDescription: "Left third of the frame, on the sawhorse beside the hoist opening.",
        oshaCategory: "29 CFR 1926.100 — Head protection",
        status: "closed",
        action: {
          key: "h15-hat-a",
          title: "Put head protection back on at the hoist and keep a spare at the gate.",
          assignee: "andre",
          dueInDays: -15,
          status: "closed",
          closedDaysAgo: 15,
        },
      },
      {
        key: "h15-ladder",
        category: "fall",
        severity: "high",
        title: "Extension ladder at the level 2 shaft is not tied off",
        description: "The ladder rises through the shaft opening with no tie, hook, or second person footing it. The feet sit on a dusty slab.",
        boundingDescription: "Center of the frame, the ladder rising through the shaft.",
        oshaCategory: "29 CFR 1926.1053 — Ladders",
        status: "closed",
        action: {
          key: "h15-ladder-a",
          title: "Tie the shaft ladder off and reset the feet on clean concrete.",
          assignee: "andre",
          dueInDays: -15,
          status: "closed",
          closedDaysAgo: 15,
        },
      },
    ],
  },
  {
    key: "h13",
    site: "harbor",
    daysAgo: 13,
    by: "Maya Chen",
    weather: "High cloud, 58°F",
    crewCount: 15,
    notes: "West elevation temp power was feeding the saws.",
    summary: "Temporary power on the west elevation was the main issue, plus wrap left in the corridor.",
    photo: { file: "panel.svg", caption: "West elevation spider box and corridor egress" },
    findings: [
      {
        key: "h13-gfci",
        category: "electrical",
        severity: "medium",
        title: "Spider box on the west elevation has no GFCI",
        description: "The temporary spider box feeding the west saws has standard receptacles and no GFCI protection on a damp slab.",
        boundingDescription: "Upper left, the yellow spider box against the sill plate.",
        oshaCategory: "29 CFR 1926.404 — Wiring design and protection",
        status: "closed",
        action: {
          key: "h13-gfci-a",
          title: "Swap the west spider box for a GFCI unit before the saws start.",
          assignee: "priya",
          dueInDays: -12,
          status: "closed",
          closedDaysAgo: 12,
        },
      },
      {
        key: "h13-wrap",
        category: "housekeeping",
        severity: "low",
        title: "Shrink wrap blocking the corridor egress",
        description: "A pile of cardboard and shrink wrap sits in the corridor that the crew uses to reach the east stair.",
        boundingDescription: "Right half of the frame, along the corridor floor.",
        oshaCategory: "29 CFR 1926.25 — Housekeeping",
        status: "closed",
        action: {
          key: "h13-wrap-a",
          title: "Pull wrap and cardboard out of the corridor and into the dumpster.",
          assignee: "rosa",
          dueInDays: -13,
          status: "closed",
          closedDaysAgo: 13,
        },
      },
    ],
  },
  {
    key: "h11",
    site: "harbor",
    daysAgo: 11,
    by: "Luis Ortega",
    weather: "Wind, 54°F",
    crewCount: 17,
    notes: "South stair on level 3 is the path the framers are using.",
    summary: "The south stair opening on level 3 is still unprotected. That item stays open.",
    photo: { file: "opening.svg", caption: "Level 3 south stair opening without a cover or rails" },
    findings: [
      {
        key: "h11-opening",
        category: "fall",
        severity: "critical",
        title: "Unguarded floor opening at the south stair, level 3",
        description: "The stair opening is cut and the temporary rails have not been reset. A person can walk from the south deck straight onto the opening.",
        boundingDescription: "Center of the frame, the rectangular opening in the deck.",
        oshaCategory: "29 CFR 1926.502 — Fall protection systems criteria",
        status: "open",
        action: {
          key: "h11-opening-a",
          title: "Cover or rail the level 3 south stair opening before the crew starts.",
          assignee: "andre",
          dueInDays: -3,
          status: "open",
        },
      },
      {
        key: "h11-shield",
        category: "ppe",
        severity: "high",
        title: "Face shield hanging unused beside the chop saw",
        description: "The chop saw is set up and the face shield is hanging on a nail three feet away, not at the station.",
        boundingDescription: "Right of center, shield on a nail beside the saw table.",
        oshaCategory: "29 CFR 1926.102 — Eye and face protection",
        status: "closed",
        action: {
          key: "h11-shield-a",
          title: "Hang the face shield on the saw station and check it at the morning stretch.",
          assignee: "andre",
          dueInDays: -10,
          status: "closed",
          closedDaysAgo: 10,
        },
      },
    ],
  },
  {
    key: "h8",
    site: "harbor",
    daysAgo: 8,
    by: "Maya Chen",
    weather: "Light rain overnight, 52°F",
    crewCount: 14,
    notes: "Rain pooled along the west sill. Do not energize that panel until it is dry.",
    summary: "Rain left standing water at the temp panel. The cord is still running through it.",
    photo: { file: "cord.svg", caption: "Temp panel with a cord crossing standing water" },
    findings: [
      {
        key: "h8-cord",
        category: "electrical",
        severity: "high",
        title: "Extension cord run through standing water",
        description: "A yellow cord leaves the temporary panel and crosses a puddle before it reaches the saw. The panel itself is on a wet slab.",
        boundingDescription: "Foreground, the cord crossing the puddle in front of the panel.",
        oshaCategory: "29 CFR 1926.405 — Wiring methods, components, and equipment",
        status: "open",
        action: {
          key: "h8-cord-a",
          title: "Lift the cord out of the water, dry the slab, and re-route it overhead.",
          assignee: "priya",
          dueInDays: 1,
          status: "in_progress",
        },
      },
      {
        key: "h8-extinguisher",
        category: "housekeeping",
        severity: "medium",
        title: "Pallet parked in front of the fire extinguisher",
        description: "A pallet of sheathing blocks the extinguisher on the west wall. The sign is visible; the handle is not.",
        boundingDescription: "Left edge, the pallet against the extinguisher cabinet.",
        oshaCategory: "29 CFR 1926.150 — Fire protection",
        status: "closed",
        action: {
          key: "h8-extinguisher-a",
          title: "Move the pallet and keep a clear path to the extinguisher.",
          assignee: "rosa",
          dueInDays: -7,
          status: "closed",
          closedDaysAgo: 7,
        },
      },
    ],
  },
  {
    key: "h6",
    site: "harbor",
    daysAgo: 6,
    by: "Luis Ortega",
    weather: "Clearing, 55°F",
    crewCount: 16,
    notes: "South deck is where the wall crew is standing tomorrow.",
    summary: "The south deck guardrail is short one bay, and vests were not staged at the stair.",
    photo: { file: "edge.svg", caption: "South deck with one guardrail bay missing" },
    findings: [
      {
        key: "h6-rail",
        category: "fall",
        severity: "high",
        title: "Guardrail missing a bay on the south deck",
        description: "Posts are up, but one bay of top and mid rail is out. The gap lines up with the path from the material hoist.",
        boundingDescription: "Upper third of the frame, the open bay along the deck edge.",
        oshaCategory: "29 CFR 1926.502 — Fall protection systems criteria",
        status: "open",
        action: {
          key: "h6-rail-a",
          title: "Install the missing top and mid rail on the south deck before work starts.",
          assignee: "andre",
          dueInDays: 2,
          status: "open",
        },
      },
      {
        key: "h6-vest",
        category: "ppe",
        severity: "medium",
        title: "High-vis vest hooks empty at the level 3 stair",
        description: "The vest station at the stair has empty hooks. Crews are coming up the stair onto an active deck.",
        boundingDescription: "Lower left, the empty hooks beside the stair opening.",
        oshaCategory: "29 CFR 1926.95 — Criteria for personal protective equipment",
        status: "open",
        action: {
          key: "h6-vest-a",
          title: "Restock high-vis vests on the level 3 hooks before the morning start.",
          assignee: "andre",
          dueInDays: 3,
          status: "open",
        },
      },
    ],
  },
  {
    key: "h4",
    site: "harbor",
    daysAgo: 4,
    by: "Maya Chen",
    weather: "Dry, 57°F",
    crewCount: 15,
    notes: "Priya is mid-repair on the temp panel. Nails in the walkway were picked up.",
    summary: "The panel knockout is still open. Nails in the walkway were picked up the same morning.",
    photo: { file: "panel.svg", caption: "Temporary panel with an open knockout" },
    findings: [
      {
        key: "h4-knockout",
        category: "electrical",
        severity: "medium",
        title: "Open knockout on the temporary power panel",
        description: "A knockout on the side of the temp panel is open, with the interior visible. The panel is energized for the floor.",
        boundingDescription: "Center-left, the round opening on the side of the panel.",
        oshaCategory: "29 CFR 1926.405 — Wiring methods, components, and equipment",
        status: "open",
        action: {
          key: "h4-knockout-a",
          title: "Close the knockout with a listed plug before the panel is used tomorrow.",
          assignee: "priya",
          dueInDays: 4,
          status: "in_progress",
        },
      },
      {
        key: "h4-nails",
        category: "housekeeping",
        severity: "low",
        title: "Nails and offcuts in the main walkway",
        description: "Screws and short offcuts were scattered along the walkway between the stair and the saw.",
        boundingDescription: "Foreground, debris along the walkway boards.",
        oshaCategory: "29 CFR 1926.25 — Housekeeping",
        status: "closed",
        action: {
          key: "h4-nails-a",
          title: "Sweep the walkway and check it again at lunch.",
          assignee: "rosa",
          dueInDays: -4,
          status: "closed",
          closedDaysAgo: 4,
        },
      },
    ],
  },
  {
    key: "h1",
    site: "harbor",
    daysAgo: 1,
    by: "Luis Ortega",
    weather: "Light rain, 51°F",
    crewCount: 12,
    notes: "Saturday crew. Stair to level 3 is the only access while the hoist is down.",
    summary: "Short Saturday crew. The stair rail stops early, and hearing protection was not at the compressor.",
    photo: { file: "ladder.svg", caption: "Level 3 stair with the rail stopping short of the landing" },
    findings: [
      {
        key: "h1-rail",
        category: "fall",
        severity: "medium",
        title: "Stair rail stops short of the top landing",
        description: "The temporary handrail ends about two feet before the level 3 landing, right where people step off.",
        boundingDescription: "Top of the frame, where the rail ends before the landing.",
        oshaCategory: "29 CFR 1926.1052 — Stairways",
        status: "open",
        action: {
          key: "h1-rail-a",
          title: "Extend the handrail through the top landing on the level 3 stair.",
          assignee: "andre",
          dueInDays: 5,
          status: "open",
        },
      },
      {
        key: "h1-ears",
        category: "ppe",
        severity: "low",
        title: "Hearing protection not staged at the compressor",
        description: "The compressor is running beside the stair and the ear-muff hook on the cage is empty.",
        boundingDescription: "Lower right, empty hook on the compressor cage.",
        oshaCategory: "29 CFR 1926.101 — Hearing protection",
        status: "open",
        action: {
          key: "h1-ears-a",
          title: "Hang muffs on the compressor and note it on the morning check.",
          assignee: "andre",
          dueInDays: 6,
          status: "open",
        },
      },
    ],
  },
  {
    key: "c16",
    site: "cedar",
    daysAgo: 16,
    by: "Jonah Hale",
    weather: "Indoor, occupied building",
    crewCount: 6,
    notes: "Clinic is seeing patients on the west side. Keep the corridor clear.",
    summary: "Drywall scrap was in the public corridor and was pulled back the same morning.",
    photo: { file: "clinic.svg", caption: "Clinic corridor with drywall scrap in the walk path" },
    findings: [
      {
        key: "c16-scrap",
        category: "housekeeping",
        severity: "medium",
        title: "Drywall scrap in the public corridor",
        description: "Cut sheets were leaning into the corridor patients use to reach the east exit. The occupied side of the clinic was open.",
        boundingDescription: "Center of the frame, sheets leaning into the corridor.",
        oshaCategory: "29 CFR 1926.25 — Housekeeping",
        status: "closed",
        action: {
          key: "c16-scrap-a",
          title: "Move drywall scrap behind the dust barrier before the clinic opens.",
          assignee: "jonah",
          dueInDays: -16,
          status: "closed",
          closedDaysAgo: 16,
        },
      },
    ],
  },
  {
    key: "c9",
    site: "cedar",
    daysAgo: 9,
    by: "Jonah Hale",
    weather: "Indoor",
    crewCount: 7,
    notes: "Nurse station rough-in. Building power, not our temp panel.",
    summary: "The nurse station rough-in had daisy-chained power strips. They were removed.",
    photo: { file: "clinic.svg", caption: "Nurse station rough-in with power strips on the floor" },
    findings: [
      {
        key: "c9-strips",
        category: "electrical",
        severity: "low",
        title: "Daisy-chained power strips in the nurse station",
        description: "Two power strips were plugged into each other on the floor to feed chargers and a task light.",
        boundingDescription: "Along the base of the framed wall, strips on the floor.",
        oshaCategory: "29 CFR 1926.405 — Wiring methods, components, and equipment",
        status: "closed",
        action: {
          key: "c9-strips-a",
          title: "Remove the daisy chain and feed the task light from a single strip.",
          assignee: "jonah",
          dueInDays: -8,
          status: "closed",
          closedDaysAgo: 8,
        },
      },
    ],
  },
  {
    key: "c5",
    site: "cedar",
    daysAgo: 5,
    by: "Maya Chen",
    weather: "Indoor",
    crewCount: 5,
    notes: "Dust barrier checked before the clinic opened at 8.",
    summary: "The dust barrier was gapped at the ceiling and got taped before opening.",
    photo: { file: "clinic.svg", caption: "Dust barrier with a gap at the ceiling grid" },
    findings: [
      {
        key: "c5-dust",
        category: "housekeeping",
        severity: "low",
        title: "Gap at the top of the dust barrier",
        description: "The plastic barrier stopped short of the ceiling grid, so sanding dust could drift into the occupied corridor.",
        boundingDescription: "Top edge of the frame, the gap between plastic and the ceiling grid.",
        oshaCategory: "29 CFR 1926.25 — Housekeeping",
        status: "closed",
        action: {
          key: "c5-dust-a",
          title: "Tape the barrier to the ceiling grid and check it at the end of the day.",
          assignee: "jonah",
          dueInDays: -5,
          status: "closed",
          closedDaysAgo: 5,
        },
      },
    ],
  },
  {
    key: "c2",
    site: "cedar",
    daysAgo: 2,
    by: "Jonah Hale",
    weather: "Indoor",
    crewCount: 6,
    notes: "Finish material arrived early. It cannot stay in the exit route.",
    summary: "Finish material is sitting in the accessible route to the east exit.",
    photo: { file: "housekeeping.svg", caption: "Exit route with boxed finish material in the path" },
    findings: [
      {
        key: "c2-exit",
        category: "housekeeping",
        severity: "medium",
        title: "Finish material stored in the exit route",
        description: "Boxed casework and a stack of tile sit in the accessible route to the east exit. The route is the one the clinic uses.",
        boundingDescription: "Center-right, boxes sitting in the marked exit path.",
        oshaCategory: "29 CFR 1926.25 — Housekeeping",
        status: "open",
        action: {
          key: "c2-exit-a",
          title: "Move the casework and tile out of the east exit route before open.",
          assignee: "jonah",
          dueInDays: 2,
          status: "open",
        },
      },
    ],
  },
];

export function buildDemo(orgId: string = DEMO_ORG_ID): Dataset {
  const harborId = id(orgId, "site_harborline");
  const cedarId = id(orgId, "site_cedar");
  const siteId = { harbor: harborId, cedar: cedarId };

  const crewDefs: Array<{
    key: string;
    site: "harbor" | "cedar" | null;
    name: string;
    role: CrewRole;
    trade: string;
    email: string;
    phone: string;
  }> = [
    { key: "maya", site: null, name: "Maya Chen", role: "superintendent", trade: "General", email: "maya.chen@ridgeco.example", phone: "(503) 555-0142" },
    { key: "luis", site: null, name: "Luis Ortega", role: "safety", trade: "Safety", email: "luis.ortega@ridgeco.example", phone: "(503) 555-0177" },
    { key: "andre", site: "harbor", name: "Andre Walsh", role: "crew_lead", trade: "Framing", email: "andre.walsh@ridgeco.example", phone: "(503) 555-0118" },
    { key: "priya", site: "harbor", name: "Priya Shah", role: "crew_lead", trade: "Electrical", email: "priya.shah@ridgeco.example", phone: "(503) 555-0194" },
    { key: "rosa", site: "harbor", name: "Rosa Nguyen", role: "crew_lead", trade: "Concrete and cleanup", email: "rosa.nguyen@ridgeco.example", phone: "(503) 555-0160" },
    { key: "jonah", site: "cedar", name: "Jonah Hale", role: "crew_lead", trade: "Interiors", email: "jonah.hale@ridgeco.example", phone: "(503) 555-0133" },
  ];

  const crew = crewDefs.map((member) => ({
    id: id(orgId, `crew_${member.key}`),
    orgId,
    siteId: member.site ? siteId[member.site] : null,
    name: member.name,
    role: member.role,
    trade: member.trade,
    email: member.email,
    phone: member.phone,
  }));

  const crewId = Object.fromEntries(crewDefs.map((member) => [member.key, id(orgId, `crew_${member.key}`)]));

  const data: Dataset = {
    sites: [
      {
        id: harborId,
        orgId,
        slug: "harborline",
        name: "Harborline Apartments",
        address: "418 NW Harbor Ave",
        city: "Portland",
        region: "OR",
        phase: "Level 3 framing",
        status: "active",
        startedOn: shiftDate(-128),
      },
      {
        id: cedarId,
        orgId,
        slug: "cedar-street",
        name: "Cedar Street Clinic",
        address: "90 SW Cedar St",
        city: "Beaverton",
        region: "OR",
        phase: "Interior finishes",
        status: "active",
        startedOn: shiftDate(-74),
      },
    ],
    crew,
    walks: [],
    photos: [],
    findings: [],
    actions: [],
    logs: [],
  };

  for (const walk of WALKS) {
    const walkedOn = shiftDate(-walk.daysAgo);
    const walkId = id(orgId, `walk_${walk.key}`);
    const photoId = id(orgId, `photo_${walk.key}`);
    const createdAt = `${walkedOn}T15:00:00.000Z`;
    data.walks.push({
      id: walkId,
      orgId,
      siteId: siteId[walk.site],
      walkedOn,
      conductedBy: walk.by,
      weather: walk.weather,
      crewCount: walk.crewCount,
      notes: walk.notes,
      summary: walk.summary,
      createdAt,
    });
    data.photos.push({
      id: photoId,
      orgId,
      walkId,
      url: `/demo/${walk.photo.file}`,
      storage: "demo",
      caption: walk.photo.caption,
      mediaType: "image/svg+xml",
    });
    const titles: string[] = [];
    for (const finding of walk.findings) {
      const findingId = id(orgId, `finding_${finding.key}`);
      titles.push(finding.title);
      data.findings.push({
        id: findingId,
        orgId,
        siteId: siteId[walk.site],
        walkId,
        photoId,
        category: finding.category,
        severity: finding.severity,
        title: finding.title,
        description: finding.description,
        boundingDescription: finding.boundingDescription,
        oshaCategory: finding.oshaCategory,
        status: finding.status,
        sample: false,
        createdAt,
      });
      if (finding.action) {
        data.actions.push({
          id: id(orgId, `action_${finding.action.key}`),
          orgId,
          siteId: siteId[walk.site],
          findingId,
          title: finding.action.title,
          assigneeId: crewId[finding.action.assignee] ?? crew[0].id,
          dueOn: shiftDate(finding.action.dueInDays),
          status: finding.action.status,
          closedOn: finding.action.status === "closed" ? shiftDate(-(finding.action.closedDaysAgo ?? walk.daysAgo)) : null,
          note: "",
          createdAt,
        });
      }
    }
    data.logs.push({
      id: id(orgId, `log_${walk.key}`),
      orgId,
      siteId: siteId[walk.site],
      walkId,
      logDate: walkedOn,
      summary: walk.summary,
      crewOnSite: walk.crewCount,
      weather: walk.weather,
      narrative: `${walk.notes} ${titles.join(" ")}`,
      createdAt,
    });
  }

  return data;
}

export function emptyDataset(): Dataset {
  return { sites: [], crew: [], walks: [], photos: [], findings: [], actions: [], logs: [] };
}
