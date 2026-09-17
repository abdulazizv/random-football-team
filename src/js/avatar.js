// Generic player avatars drawn as inline SVG — no image assets, crisp at any
// size, and the jersey takes the team colour so a player reads as belonging to
// their side. The variant is the avatar index split.js already hands out
// uniquely within a team, so eleven players on one pitch all look distinct.

export const VARIANT_COUNT = 11;

const SKIN = ["#8D5524", "#C68642", "#E0AC69", "#F1C27D", "#5C3317"];
const HAIR = ["#1B1512", "#3B2A1F", "#6B4423", "#22303C", "#0F0D0C"];

// Each kit is a pattern painted over the base jersey colour. `light` is drawn
// on top of the team colour, so it must stay readable on every palette entry.
const KITS = [
  () => "",
  (c, l) => `<rect x="14" y="20" width="4" height="20" fill="${l}"/>
             <rect x="22" y="20" width="4" height="20" fill="${l}"/>`,
  (c, l) => `<rect x="10" y="24" width="20" height="4" fill="${l}"/>
             <rect x="10" y="32" width="20" height="4" fill="${l}"/>`,
  (c, l) => `<path d="M10 38 L30 18 L30 24 L14 40 Z" fill="${l}"/>`,
  (c, l) => `<path d="M20 19 H29 a3 3 0 0 1 3 3 V40 H20 Z" fill="${l}"/>`,
  (c, l) => `<path d="M8 24 L20 32 L32 24 V30 L20 38 L8 30 Z" fill="${l}"/>`,
  (c, l) => `<rect x="12" y="20" width="2" height="20" fill="${l}"/>
             <rect x="19" y="20" width="2" height="20" fill="${l}"/>
             <rect x="26" y="20" width="2" height="20" fill="${l}"/>`,
  (c, l) => `<rect x="10" y="27" width="20" height="6" fill="${l}"/>`,
  (c, l) => `<path d="M20 19 H29 a3 3 0 0 1 3 3 V29 H20 Z" fill="${l}"/>
             <path d="M8 29 H20 V40 H11 a3 3 0 0 1 -3 -3 Z" fill="${l}"/>`,
  (c, l) => `<path d="M8 40 L32 19 V40 Z" fill="${l}"/>`,
  (c, l) => `<rect x="10" y="19" width="20" height="3" fill="${l}"/>
             <rect x="10" y="37" width="20" height="3" fill="${l}"/>`,
];

const pick = (list, i) => list[i % list.length];

export function avatarMarkup(variant, color) {
  // Anything unexpected still has to draw something; an empty pitch slot would
  // be worse than a default kit.
  const v = Number.isInteger(variant) && variant >= 1 && variant <= VARIANT_COUNT ? variant : 1;
  const i = v - 1;
  const skin = pick(SKIN, i);
  const hair = pick(HAIR, i * 2 + 1);
  const kit = KITS[i](color, "#F8FAFC");

  return `<svg viewBox="0 0 40 56" width="40" height="56" role="img" aria-hidden="true">` +
    // legs
    `<rect x="14" y="44" width="5" height="10" rx="2" fill="${skin}"/>` +
    `<rect x="21" y="44" width="5" height="10" rx="2" fill="${skin}"/>` +
    // shorts
    `<path d="M11 39 H29 V45 a1 1 0 0 1 -1 1 H21 l-1 -3 -1 3 H12 a1 1 0 0 1 -1 -1 Z" fill="#111827"/>` +
    // jersey, with the kit pattern clipped to its shape
    `<clipPath id="j${v}"><path d="M11 19 h18 a3 3 0 0 1 3 3 v18 H8 V22 a3 3 0 0 1 3 -3 Z"/></clipPath>` +
    `<g clip-path="url(#j${v})">` +
      `<path d="M11 19 h18 a3 3 0 0 1 3 3 v18 H8 V22 a3 3 0 0 1 3 -3 Z" fill="${color}"/>` +
      kit +
    `</g>` +
    // sleeves
    `<path d="M11 19 L5 23 l3 5 4 -3 Z" fill="${color}"/>` +
    `<path d="M29 19 L35 23 l-3 5 -4 -3 Z" fill="${color}"/>` +
    // head and hair
    `<circle cx="20" cy="12" r="7" fill="${skin}"/>` +
    `<path d="M13 11 a7 7 0 0 1 14 0 a9 9 0 0 0 -14 0 Z" fill="${hair}"/>` +
    `<path d="M13 11 a7 7 0 0 1 14 0 v1 h-1 a6 6 0 0 0 -12 0 h-1 Z" fill="${hair}"/>` +
  `</svg>`;
}
