// Deterministic, generated card artwork.
//
// Each training type always produces the same illustration: the key is the
// session's `training_type_description` (falling back to its title), the
// palette/icon are chosen from that key, and the image is an inline SVG data
// URI. That keeps cards consistent for the same training type and removes the
// dependency on external placeholder photos.

const THEMES = [
  {
    name: 'ai',
    keywords: ['intelligence', 'artificial', 'machine learning', ' ia ', 'ai ', 'apprentissage'],
    from: '#1e1b4b',
    to: '#6d28d9',
    accent: '#c4b5fd',
    glyph: 'network',
  },
  {
    name: 'security',
    keywords: ['security', 'securite', 'cyber', 'hacking', 'protection', 'phishing'],
    from: '#450a0a',
    to: '#b91c1c',
    accent: '#fecaca',
    glyph: 'shield',
  },
  {
    name: 'web',
    keywords: ['web', 'html', 'css', 'javascript', 'frontend', 'front-end', 'developpement'],
    from: '#0f766e',
    to: '#0ea5e9',
    accent: '#a5f3fc',
    glyph: 'code',
  },
  {
    name: 'cloud',
    keywords: ['cloud', 'nuage', 'aws', 'azure', 'infrastructure'],
    from: '#0c4a6e',
    to: '#38bdf8',
    accent: '#bae6fd',
    glyph: 'cloud',
  },
  {
    name: 'data',
    keywords: ['data', 'donnees', 'analyse', 'analytics', 'statistique', 'base de donnees'],
    from: '#78350f',
    to: '#f59e0b',
    accent: '#fde68a',
    glyph: 'chart',
  },
  {
    name: 'mobile',
    keywords: ['mobile', 'android', 'ios', 'application'],
    from: '#14532d',
    to: '#22c55e',
    accent: '#bbf7d0',
    glyph: 'phone',
  },
  {
    name: 'design',
    keywords: ['design', 'graphique', 'graphic', 'ux', 'ui', 'creation'],
    from: '#831843',
    to: '#ec4899',
    accent: '#fbcfe8',
    glyph: 'palette',
  },
  {
    name: 'office',
    keywords: ['office', 'bureautique', 'excel', 'word', 'powerpoint', 'productivite'],
    from: '#1e293b',
    to: '#475569',
    accent: '#cbd5e1',
    glyph: 'document',
  },
]

const FALLBACK_THEME = {
  name: 'training',
  from: '#12355b',
  to: '#2563eb',
  accent: '#bfdbfe',
  glyph: 'document',
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'aux',
  'd',
  'de',
  'des',
  'du',
  'en',
  'et',
  'for',
  'in',
  'introduction',
  'la',
  'le',
  'les',
  'of',
  'on',
  'the',
  'to',
])

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function hashString(value) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function pickTheme(key) {
  const normalized = ` ${normalize(key)} `

  const matched = THEMES.find((theme) =>
    theme.keywords.some((keyword) => normalized.includes(keyword))
  )

  if (matched) {
    return matched
  }

  return THEMES[hashString(key) % THEMES.length] ?? FALLBACK_THEME
}

function getInitials(key) {
  const words = normalize(key)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))

  if (words.length === 0) {
    return '7.77'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

function getShortName(key) {
  const name = String(key ?? '').trim()

  if (!name) {
    return 'Training session'
  }

  return name.length > 42 ? `${name.slice(0, 39)}…` : name
}

function renderGlyph(theme) {
  const stroke = theme.accent

  switch (theme.glyph) {
    case 'network':
      return `
        <g fill="none" stroke="${stroke}" stroke-width="5" opacity="0.9">
          <path d="M690 430 L810 190 L990 300 L900 470 L730 500 Z" />
          <path d="M690 430 L990 300 M810 190 L900 470 M730 500 L990 300" />
        </g>
        <g fill="${stroke}">
          <circle cx="690" cy="430" r="16" />
          <circle cx="810" cy="190" r="16" />
          <circle cx="990" cy="300" r="16" />
          <circle cx="900" cy="470" r="16" />
          <circle cx="730" cy="500" r="16" />
        </g>
      `
    case 'shield':
      return `
        <g fill="none" stroke="${stroke}" stroke-width="6" opacity="0.9">
          <path d="M850 150 L1010 205 V330 C1010 430 930 490 850 520 C770 490 690 430 690 330 V205 Z" />
          <path d="M785 335 L835 385 L920 285" stroke-width="10" />
        </g>
      `
    case 'code':
      return `
        <g fill="none" stroke="${stroke}" stroke-width="8" opacity="0.9">
          <path d="M790 220 L690 330 L790 440" />
          <path d="M920 220 L1020 330 L920 440" />
          <path d="M880 200 L830 460" />
        </g>
      `
    case 'cloud':
      return `
        <g fill="none" stroke="${stroke}" stroke-width="6" opacity="0.9">
          <path d="M725 430 C660 430 630 385 650 345 C620 270 690 225 750 250 C780 185 890 185 925 250 C1000 240 1040 300 1015 355 C1060 400 1025 450 970 450 H730 Z" />
        </g>
      `
    case 'chart':
      return `
        <g fill="${stroke}" opacity="0.9">
          <rect x="700" y="360" width="70" height="140" rx="10" />
          <rect x="800" y="290" width="70" height="210" rx="10" />
          <rect x="900" y="220" width="70" height="280" rx="10" />
          <rect x="1000" y="320" width="70" height="180" rx="10" />
        </g>
      `
    case 'phone':
      return `
        <g fill="none" stroke="${stroke}" stroke-width="7" opacity="0.9">
          <rect x="790" y="150" width="230" height="430" rx="34" />
          <path d="M860 190 H950" stroke-width="10" />
          <path d="M885 535 H925" stroke-width="10" />
        </g>
      `
    case 'palette':
      return `
        <g fill="none" stroke="${stroke}" stroke-width="6" opacity="0.9">
          <path d="M860 170 C960 170 1030 240 1020 330 C1010 420 930 440 880 415 C830 390 800 425 815 470 C830 520 760 530 720 480 C660 405 690 260 770 205 C800 185 830 170 860 170 Z" />
        </g>
        <g fill="${stroke}">
          <circle cx="800" cy="300" r="18" />
          <circle cx="870" cy="260" r="18" />
          <circle cx="940" cy="300" r="18" />
        </g>
      `
    case 'document':
    default:
      return `
        <g fill="none" stroke="${stroke}" stroke-width="6" opacity="0.9">
          <path d="M790 160 H940 L1010 230 V500 H790 Z" />
          <path d="M940 160 V230 H1010" />
          <path d="M845 300 H955 M845 355 H955 M845 410 H920" stroke-width="8" />
        </g>
      `
  }
}

/**
 * Returns a stable SVG data URI for a training type.
 * Same training type (same description) → same image.
 */
export function getTrainingImage(trainingTypeDescription, sessionTitle) {
  const key = String(trainingTypeDescription ?? '').trim() || String(sessionTitle ?? '').trim() || 'Training session'
  const theme = pickTheme(key)
  const initials = getInitials(key)
  const shortName = getShortName(trainingTypeDescription || sessionTitle)
  const gradientId = `training-${hashString(key)}`
  const patternId = `dots-${gradientId}`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" role="img" aria-label="${escapeXml(shortName)}">
  <defs>
    <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.from}" />
      <stop offset="1" stop-color="${theme.to}" />
    </linearGradient>
    <pattern id="${patternId}" width="44" height="44" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="#ffffff" opacity="0.16" />
    </pattern>
  </defs>
  <rect width="1200" height="600" fill="url(#${gradientId})" />
  <rect width="1200" height="600" fill="url(#${patternId})" />
  <circle cx="1050" cy="90" r="280" fill="#ffffff" opacity="0.06" />
  <circle cx="1120" cy="540" r="200" fill="#ffffff" opacity="0.05" />
  ${renderGlyph(theme)}
  <text x="90" y="280" font-family="Inter, Arial, sans-serif" font-size="168" font-weight="800" fill="#ffffff" opacity="0.96">${escapeXml(initials)}</text>
  <text x="94" y="340" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="600" fill="#ffffff" opacity="0.78">${escapeXml(shortName)}</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
