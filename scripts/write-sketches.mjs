import { writeFileSync } from "node:fs";

const head = (title) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" role="img">
<title>${title}</title>
<rect width="800" height="520" fill="#E6E0D2"/>
<rect x="16" y="16" width="768" height="488" fill="none" stroke="#1C2B24" stroke-width="2"/>
<text x="32" y="44" fill="#5C675E" font-family="ui-sans-serif,sans-serif" font-size="14" letter-spacing="2">FIELD SKETCH</text>
<text x="32" y="492" fill="#1C2B24" font-family="ui-sans-serif,sans-serif" font-size="16">${title}</text>`;

const files = {
  "opening.svg": `${head("Unguarded floor opening")}
<g stroke="#1C2B24" fill="none" stroke-width="3">
  <path d="M40 120 H760"/>
  ${Array.from({ length: 8 }, (_, i) => `<path d="M${80 + i * 80} 120 V390"/>`).join("\n")}
  <path d="M40 390 H760"/>
</g>
<rect x="300" y="180" width="200" height="150" fill="#1C2B24"/>
<rect x="292" y="172" width="216" height="166" fill="none" stroke="#D6EE4A" stroke-width="6" stroke-dasharray="10 6"/>
<text x="318" y="260" fill="#D6EE4A" font-family="ui-sans-serif" font-size="16">OPENING</text>
</svg>`,
  "edge.svg": `${head("Missing guardrail bay")}
<path d="M40 360 H760" stroke="#1C2B24" stroke-width="4"/>
${[120, 220, 320, 520, 620, 720].map((x) => `<path d="M${x} 360 V180" stroke="#1C2B24" stroke-width="6"/>`).join("")}
<path d="M120 200 H320" stroke="#1C2B24" stroke-width="6"/>
<path d="M120 250 H320" stroke="#1C2B24" stroke-width="6"/>
<path d="M520 200 H720" stroke="#1C2B24" stroke-width="6"/>
<path d="M520 250 H720" stroke="#1C2B24" stroke-width="6"/>
<rect x="330" y="170" width="180" height="190" fill="#D6EE4A" fill-opacity="0.55" stroke="#1C2B24" stroke-dasharray="8 6"/>
<text x="360" y="270" fill="#1C2B24" font-family="ui-sans-serif" font-size="16">GAP</text>
</svg>`,
  "cord.svg": `${head("Cord through standing water")}
<rect x="80" y="140" width="120" height="180" fill="#3D4A45" stroke="#1C2B24" stroke-width="3"/>
<circle cx="140" cy="190" r="16" fill="none" stroke="#D6EE4A" stroke-width="4"/>
<circle cx="140" cy="240" r="16" fill="none" stroke="#E6E0D2" stroke-width="4"/>
<ellipse cx="420" cy="360" rx="180" ry="36" fill="#7FA3B5"/>
<path d="M140 320 C220 320 260 360 420 360" fill="none" stroke="#E2B423" stroke-width="10"/>
<rect x="250" y="300" width="280" height="90" fill="none" stroke="#D6EE4A" stroke-width="5" stroke-dasharray="8 6"/>
</svg>`,
  "ppe.svg": `${head("Hard hat left at the hoist")}
<path d="M80 360 H420" stroke="#1C2B24" stroke-width="8"/>
<path d="M120 360 V280 H200 V360" fill="none" stroke="#1C2B24" stroke-width="6"/>
<path d="M130 250 h60 q30 20 30 40 h-120 q0-20 30-40z" fill="#E2B423" stroke="#1C2B24" stroke-width="3"/>
<rect x="460" y="180" width="220" height="20" fill="#1C2B24"/>
<rect x="500" y="200" width="16" height="70" fill="#1C2B24"/>
<rect x="620" y="200" width="16" height="70" fill="#1C2B24"/>
<rect x="500" y="150" width="140" height="90" fill="none" stroke="#D6EE4A" stroke-width="5" stroke-dasharray="8 6"/>
<text x="520" y="140" fill="#1C2B24" font-size="14" font-family="ui-sans-serif">EMPTY HOOKS</text>
</svg>`,
  "housekeeping.svg": `${head("Material in the walk path")}
<path d="M80 80 V440" stroke="#1C2B24" stroke-width="8"/>
<path d="M80 120 H240" stroke="#1C2B24" stroke-width="6"/>
<path d="M80 200 H280" stroke="#1C2B24" stroke-width="6"/>
<path d="M80 280 H240" stroke="#1C2B24" stroke-width="6"/>
<rect x="300" y="240" width="180" height="28" fill="#C4A574" transform="rotate(-8 300 240)"/>
<rect x="320" y="280" width="160" height="28" fill="#A88858" transform="rotate(6 320 280)"/>
<rect x="340" y="200" width="200" height="140" fill="none" stroke="#D6EE4A" stroke-width="5" stroke-dasharray="8 6"/>
<rect x="620" y="160" width="40" height="90" fill="#D1432F"/>
<rect x="600" y="140" width="90" height="130" fill="none" stroke="#1C2B24" stroke-dasharray="6 4"/>
</svg>`,
  "panel.svg": `${head("Open knockout on temp panel")}
<rect x="260" y="90" width="280" height="320" fill="#3D4A45" stroke="#1C2B24" stroke-width="4"/>
<rect x="290" y="130" width="220" height="40" fill="#1C2B24"/>
<circle cx="340" cy="250" r="28" fill="#E6E0D2"/>
<circle cx="430" cy="250" r="28" fill="#2A2A2A"/>
<circle cx="520" cy="250" r="28" fill="#2A2A2A"/>
<circle cx="400" cy="330" r="22" fill="none" stroke="#D6EE4A" stroke-width="6"/>
<text x="300" y="450" fill="#1C2B24" font-size="14" font-family="ui-sans-serif">OPEN KNOCKOUT</text>
</svg>`,
  "ladder.svg": `${head("Stair rail stops short")}
<path d="M120 420 L360 120" stroke="#1C2B24" stroke-width="8"/>
<path d="M200 420 L440 120" stroke="#1C2B24" stroke-width="8"/>
${[0, 1, 2, 3, 4, 5].map((i) => {
  const y = 160 + i * 46;
  return `<path d="M${150 + i * 18} ${y} H${250 + i * 18}" stroke="#1C2B24" stroke-width="5"/>`;
}).join("")}
<path d="M90 400 L300 180" stroke="#1C2B24" stroke-width="6"/>
<circle cx="330" cy="150" r="8" fill="#D1432F"/>
<rect x="300" y="110" width="180" height="80" fill="none" stroke="#D6EE4A" stroke-width="5" stroke-dasharray="8 6"/>
<text x="470" y="160" fill="#1C2B24" font-size="14" font-family="ui-sans-serif">RAIL ENDS</text>
</svg>`,
  "clinic.svg": `${head("Corridor in an occupied clinic")}
<rect x="60" y="80" width="680" height="340" fill="#F4F0E6" stroke="#1C2B24" stroke-width="3"/>
<path d="M60 200 H740" stroke="#C9C2B2" stroke-width="2"/>
<rect x="420" y="230" width="46" height="140" fill="#E7E1D4" stroke="#1C2B24"/>
<rect x="470" y="250" width="46" height="120" fill="#DDD4C4" stroke="#1C2B24"/>
<rect x="400" y="210" width="180" height="180" fill="none" stroke="#D6EE4A" stroke-width="5" stroke-dasharray="8 6"/>
<text x="80" y="140" fill="#5C675E" font-size="14" font-family="ui-sans-serif">OCCUPIED SIDE</text>
<text x="430" y="200" fill="#1C2B24" font-size="14" font-family="ui-sans-serif">SCRAP</text>
</svg>`,
};

for (const [name, body] of Object.entries(files)) {
  writeFileSync(new URL(`../public/demo/${name}`, import.meta.url), body);
}
console.log(`wrote ${Object.keys(files).length} sketches`);
