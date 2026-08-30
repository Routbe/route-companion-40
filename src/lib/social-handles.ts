/**
 * Handle-invoer & smart-paste parser voor sociale links.
 *
 * Sociale blokken bewaren enkel de platform-identifier (`block.kind`) en de
 * pure handle (`block.value`, zonder `@`). De publieke URL wordt pas bij het
 * renderen opgebouwd via `blockHref()` en de `base` uit BLOCK_KINDS.
 *
 * Client-safe: geen server-imports.
 */

import { BLOCK_KINDS } from "@/lib/profile";

/** Platform-specifieke extractieregels voor volledige geplakte URLs. */
const PLATFORM_PATTERNS: Record<string, RegExp[]> = {
  instagram: [/instagram\.com\/([A-Za-z0-9_.]+)/i],
  youtube: [/youtube\.com\/@?([A-Za-z0-9_.-]+)/i, /youtu\.be\/([A-Za-z0-9_.-]+)/i],
  tiktok: [/tiktok\.com\/@?([A-Za-z0-9_.]+)/i],
  x: [/(?:x|twitter)\.com\/([A-Za-z0-9_]+)/i],
  github: [/github\.com\/([A-Za-z0-9_-]+)/i],
  facebook: [/facebook\.com\/([A-Za-z0-9_.]+)/i],
  linkedin: [/linkedin\.com\/(?:in|company)\/([A-Za-z0-9_-]+)/i],
  bluesky: [/bsky\.app\/profile\/([A-Za-z0-9_.-]+)/i],
  spotify: [/open\.spotify\.com\/(?:user|artist)\/([A-Za-z0-9]+)/i],
  twitch: [/twitch\.tv\/([A-Za-z0-9_]+)/i],
  threads: [/threads\.(?:net|com)\/@?([A-Za-z0-9_.]+)/i],
  pinterest: [/pinterest\.[a-z.]+\/([A-Za-z0-9_]+)/i],
  snapchat: [/snapchat\.com\/add\/([A-Za-z0-9_.-]+)/i],
  telegram: [/t\.me\/([A-Za-z0-9_]+)/i],
  reddit: [/reddit\.com\/(u(?:ser)?\/[A-Za-z0-9_-]+|r\/[A-Za-z0-9_]+)/i],
  gitlab: [/gitlab\.com\/([A-Za-z0-9_.-]+)/i],
  kick: [/kick\.com\/([A-Za-z0-9_-]+)/i],
  dribbble: [/dribbble\.com\/([A-Za-z0-9_-]+)/i],
  behance: [/behance\.net\/([A-Za-z0-9_-]+)/i],
  codepen: [/codepen\.io\/([A-Za-z0-9_-]+)/i],
  vk: [/vk\.com\/([A-Za-z0-9_.]+)/i],
};

/** Het zichtbare prefix in het invoerveld, bv. `instagram.com/`. */
export function handlePrefix(kind: string): string | null {
  const def = BLOCK_KINDS.find((k) => k.kind === kind);
  if (!def?.base) return null;
  return def.base.replace(/^https?:\/\//, "");
}

/** Sociale blokken werken op handle-basis; custom links blijven volledige URLs. */
export const isHandleBlock = (kind: string) => handlePrefix(kind) !== null;

/**
 * Haalt de pure handle uit ruwe invoer: knipt `@`, spaties, volledige URLs,
 * querystrings (`?igsh=…`) en trailing slashes weg.
 */
export function extractHandle(kind: string, raw: string): string {
  let value = (raw ?? "").trim();
  if (!value) return "";

  const looksLikeUrl = /^(https?:\/\/|www\.)/i.test(value) || /[a-z0-9-]+\.[a-z]{2,}\//i.test(value);

  if (looksLikeUrl) {
    for (const pattern of PLATFORM_PATTERNS[kind] ?? []) {
      const match = value.match(pattern);
      if (match?.[1]) return match[1];
    }
    // Onbekend platform: neem het laatste betekenisvolle padsegment.
    const stripped = value
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split(/[?#]/)[0]!
      .replace(/\/+$/, "");
    const parts = stripped.split("/").filter(Boolean);
    if (parts.length > 1) value = parts[parts.length - 1]!;
  }

  return value
    .split(/[?#]/)[0]!
    .replace(/^\/+|\/+$/g, "")
    .replace(/^@+/, "")
    .trim();
}

/** Volledige publieke URL voor een platform + handle. */
export function socialUrl(kind: string, handle: string): string {
  const def = BLOCK_KINDS.find((k) => k.kind === kind);
  const clean = handle.replace(/^@+/, "").trim();
  if (!def?.base || !clean) return "";
  return `${def.base}${clean}`;
}
