// Deterministic avatar placeholders for the instructor showcase, used until
// the backend provides real image URLs.

const PALETTES = [
  ['#12355b', '#2563eb'],
  ['#0f766e', '#0ea5e9'],
  ['#7c2d12', '#f59e0b'],
  ['#4c1d95', '#8b5cf6'],
  ['#831843', '#ec4899'],
  ['#14532d', '#22c55e'],
  ['#1e293b', '#64748b'],
]

function hashString(value) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function getInitials(name) {
  const words = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) {
    return '7.7'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Same instructor name → same avatar.
 */
export function getInstructorAvatar(name) {
  const cleanName = String(name ?? '').trim() || 'Instructor'
  const [from, to] = PALETTES[hashString(cleanName) % PALETTES.length]
  const initials = getInitials(cleanName)
  const gradientId = `avatar-${hashString(cleanName)}`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="${escapeXml(cleanName)}">
  <defs>
    <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}" />
      <stop offset="1" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="240" height="240" fill="url(#${gradientId})" />
  <circle cx="205" cy="35" r="70" fill="#ffffff" opacity="0.08" />
  <circle cx="120" cy="96" r="42" fill="#ffffff" opacity="0.16" />
  <path d="M38 240c0-45 37-74 82-74s82 29 82 74Z" fill="#ffffff" opacity="0.13" />
  <text x="120" y="115" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="62" font-weight="800" fill="#ffffff">${escapeXml(initials)}</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
