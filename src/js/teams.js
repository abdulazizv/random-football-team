import { formation } from "./split.js";
import { avatarMarkup } from "./avatar.js";

// Players land one at a time on a beat - the draw should feel like a reveal,
// not a page render. 300ms reads as deliberate without dragging: a typical
// 12-player game finishes in about three and a half seconds.
const STAGGER_MS = 300;
const POP_MS = 380;

const reducedMotion = () =>
  globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// Results screen: one pitch card per team, players placed by computed formation.
export function renderTeams(container, teams) {
  container.textContent = "";
  container.className = `grid gap-4 ${columnsFor(teams.length)}`;

  const animate = !reducedMotion();
  let order = 0;

  for (const team of teams) {
    container.append(buildCard(team, animate, () => order++));
  }
}

// Two teams should sit side by side, not leave a gap in a three-wide row.
function columnsFor(count) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 4) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

function buildCard(team, animate, nextIndex) {
  const card = document.createElement("section");
  card.className =
    "overflow-hidden rounded-xl border border-white/20 bg-slate-900/80 shadow-xl";
  card.style.setProperty("--team", team.color);

  const head = document.createElement("header");
  head.className = "flex items-center gap-2.5 border-b border-white/10 px-4 py-3";

  const dot = document.createElement("span");
  dot.className = "h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--team)]";

  const name = document.createElement("h3");
  name.className = "font-bold tracking-tight text-white";
  name.textContent = team.name;

  const count = document.createElement("span");
  count.className = "ml-auto text-sm font-semibold tabular-nums text-slate-400";
  count.textContent = String(team.players.length);

  head.append(dot, name, count);

  const pitch = document.createElement("div");
  pitch.className = "relative h-72 bg-emerald-800";
  // Mown-grass stripes: an inline gradient rather than an arbitrary-value class,
  // which Tailwind drops silently when the value contains commas.
  pitch.style.backgroundImage =
    "repeating-linear-gradient(180deg, rgba(255,255,255,.05) 0 1.75rem, transparent 1.75rem 3.5rem)";

  const halfway = document.createElement("div");
  halfway.className = "absolute inset-x-[6%] top-1/2 h-px bg-white/25";
  const circle = document.createElement("div");
  circle.className =
    "absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25";
  pitch.append(halfway, circle);

  const rows = formation(team.players.length);
  let i = 0;
  rows.forEach((cols, r) => {
    for (let c = 0; c < cols; c++) {
      pitch.append(
        buildPlayer(team.players[i++], {
          top: ((r + 0.5) / rows.length) * 100,
          left: ((c + 0.5) / cols) * 100,
          index: nextIndex(),
          animate,
          color: team.color,
        })
      );
    }
  });

  card.append(head, pitch);
  return card;
}

function buildPlayer(player, { top, left, index, animate, color }) {
  const el = document.createElement("div");
  el.className =
    "absolute flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1";
  el.style.top = `${top}%`;
  el.style.left = `${left}%`;

  if (animate) {
    el.style.opacity = "0";
    el.style.transform = "translate(-50%, -50%) scale(.55)";
    // Overshoot easing so each player pops onto the pitch rather than fading in.
    el.style.transition =
      `opacity ${POP_MS}ms ease-out, transform ${POP_MS}ms cubic-bezier(.34, 1.56, .64, 1)`;
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translate(-50%, -50%) scale(1)";
    }, index * STAGGER_MS);
  }

  // The avatar is generated markup with no user data in it, so innerHTML is
  // safe here; the player's name below still goes through textContent.
  const figure = document.createElement("div");
  figure.className = "drop-shadow-lg";
  figure.innerHTML = avatarMarkup(player.avatar, color);

  const name = document.createElement("span");
  name.className =
    "max-w-full truncate border-b-2 border-[color:var(--team)] pb-0.5 text-xs font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,.7)]";
  // textContent so a name with quotes or angle brackets renders literally.
  name.textContent = player.name;

  el.append(figure, name);
  return el;
}
