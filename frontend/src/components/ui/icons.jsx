// Minimal hand-rolled icon set to avoid adding an icon-library dependency
// for a handful of glyphs. Each icon accepts standard SVG props (className etc).
export const icons = {
  grid: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" />
    </svg>
  ),
  controller: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M5.5 6.5h9a3 3 0 013 3.6l-.7 3.2a2 2 0 01-3.5.9L12 12.5H8l-1.3 1.7a2 2 0 01-3.5-.9l-.7-3.2a3 3 0 013-3.6z" />
      <path d="M6.5 9v2.2M5.4 10.1h2.2" strokeLinecap="round" />
      <circle cx="14" cy="9.3" r="0.6" fill="currentColor" />
      <circle cx="15.3" cy="10.6" r="0.6" fill="currentColor" />
    </svg>
  ),
  user: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="10" cy="6.8" r="3.3" />
      <path d="M3.5 17c.7-3.6 3-5.6 6.5-5.6s5.8 2 6.5 5.6" strokeLinecap="round" />
    </svg>
  ),
  shield: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M10 2.7l6 2.2v4.4c0 4-2.6 6.9-6 8-3.4-1.1-6-4-6-8V4.9l6-2.2z" strokeLinejoin="round" />
      <path d="M7.3 10l1.8 1.8 3.6-3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trophy: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M6 3h8v3a4 4 0 01-8 0V3z" />
      <path d="M6 4H4a2 2 0 002 2M14 4h2a2 2 0 01-2 2" />
      <path d="M10 10v2.5M7.5 16.5h5M8.5 13.5h3v3h-3v-3z" />
    </svg>
  ),
  users: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="7" cy="6.5" r="2.3" />
      <path d="M2.7 16c.4-2.6 2.2-4.2 4.3-4.2S11.3 13.4 11.7 16" />
      <circle cx="14" cy="7.2" r="1.9" />
      <path d="M13 11.9c1.8.2 3.2 1.6 3.6 3.7" />
    </svg>
  ),
  settings: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="10" cy="10" r="2.4" />
      <path d="M10 3v1.6M10 15.4V17M17 10h-1.6M4.6 10H3M15 5l-1.1 1.1M6.1 13.9L5 15M15 15l-1.1-1.1M6.1 6.1L5 5" strokeLinecap="round" />
    </svg>
  ),
  menu: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
    </svg>
  ),
  bell: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M10 3.5c-2.2 0-4 1.8-4 4v2.3c0 .6-.2 1.2-.6 1.7L4.5 12.7c-.5.6-.1 1.6.7 1.6h9.6c.8 0 1.2-1 .7-1.6l-.9-1.2a2.7 2.7 0 01-.6-1.7V7.5c0-2.2-1.8-4-4-4z" />
      <path d="M8.2 16.2a1.8 1.8 0 003.6 0" strokeLinecap="round" />
    </svg>
  ),
  transactions: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M4 7h9l-2.2-2.2M16 13H7l2.2 2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  clipboard: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="5" y="4" width="10" height="13" rx="1.5" />
      <rect x="7.5" y="2.5" width="5" height="3" rx="1" />
      <path d="M7.5 9.5h5M7.5 12.5h5" strokeLinecap="round" />
    </svg>
  ),
  chevronDown: (props) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  ),
  globe: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="10" cy="10" r="7.2" />
      <path d="M2.8 10h14.4M10 2.8c1.8 2 2.8 4.5 2.8 7.2s-1 5.2-2.8 7.2c-1.8-2-2.8-4.5-2.8-7.2s1-5.2 2.8-7.2z" />
    </svg>
  ),
  sun: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="10" cy="10" r="3.4" />
      <path strokeLinecap="round" d="M10 2.5v1.6M10 15.9v1.6M17.5 10h-1.6M4.1 10H2.5M15.3 4.7l-1.1 1.1M5.8 14.2l-1.1 1.1M15.3 15.3l-1.1-1.1M5.8 5.8L4.7 4.7" />
    </svg>
  ),
  moon: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M16.5 12.3A6.8 6.8 0 017.7 3.5a7 7 0 108.8 8.8z" />
    </svg>
  ),
  logout: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M8 3.5H5a1.5 1.5 0 00-1.5 1.5v10A1.5 1.5 0 005 16.5h3" strokeLinecap="round" />
      <path d="M13 13.5l3.5-3.5L13 6.5M16 10H7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="9" cy="9" r="6" />
      <path d="M17 17l-3.5-3.5" strokeLinecap="round" />
    </svg>
  ),
  chevronLeft: (props) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M12.7 4.3a1 1 0 010 1.4L8.42 10l4.3 4.3a1 1 0 01-1.42 1.4l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  chevronRight: (props) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M7.3 15.7a1 1 0 010-1.4L11.58 10 7.3 5.7a1 1 0 011.42-1.4l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  upload: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M10 13V4M10 4L6.5 7.5M10 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13.5v1.8A1.7 1.7 0 005.7 17h8.6a1.7 1.7 0 001.7-1.7v-1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  image: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="2.5" y="3.5" width="15" height="13" rx="1.8" />
      <circle cx="7" cy="8" r="1.4" />
      <path d="M3 14.5l4.3-4.3a1.5 1.5 0 012.1 0l1.4 1.4M11.5 12l1.6-1.6a1.5 1.5 0 012.1 0l2.3 2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  play: (props) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M6.5 4.8a1 1 0 011.53-.85l7 4.2a1 1 0 010 1.7l-7 4.2A1 1 0 016.5 13.2V4.8z" />
    </svg>
  ),
  close: (props) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  ),
  pause: (props) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <rect x="5.5" y="4" width="3.2" height="12" rx="1" />
      <rect x="11.3" y="4" width="3.2" height="12" rx="1" />
    </svg>
  ),
  stop: (props) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <rect x="5" y="5" width="10" height="10" rx="1.5" />
    </svg>
  ),
  heart: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M10 17s-6.3-3.9-8.3-8A4.5 4.5 0 0110 5.4 4.5 4.5 0 0118.3 9c-2 4.1-8.3 8-8.3 8z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  heartFilled: (props) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 17s-6.3-3.9-8.3-8A4.5 4.5 0 0110 5.4 4.5 4.5 0 0118.3 9c-2 4.1-8.3 8-8.3 8z" />
    </svg>
  ),
  chat: (props) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M3 10.2c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5-3.1 6.5-7 6.5c-.9 0-1.8-.15-2.6-.45L4 17.5l1.1-3.1A6.2 6.2 0 013 10.2z"
        strokeLinejoin="round"
      />
    </svg>
  ),
};
