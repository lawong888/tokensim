// ContextGrid.jsx
// The signature Claude Code /context visual: a dense block-map of colored
// cells where each cell represents a fixed number of tokens, colored by
// category in category order, then free space, then the reserved buffer.

import { CATEGORY_BY_KEY } from './contextModel'
import { useT } from './i18n'

// ┌─ YOUR DESIGN CHOICE (learning-mode contribution point #3) ────────────┐
// │ How many tokens does one cell represent, and how do partial cells     │
// │ round? Each cell ≈ window / CELL_COUNT tokens. We give every NON-EMPTY │
// │ category at least one cell so tiny slices (e.g. a small Summary on a   │
// │ 200k window) never silently vanish; free space fills the remainder.   │
// └───────────────────────────────────────────────────────────────────────┘
const CELL_COUNT = 240 // total cells in the grid

function buildCells(breakdown, total) {
  const perCell = total / CELL_COUNT
  const cells = []
  for (const cat of breakdown) {
    if (cat.key === 'freeSpace') continue // free space fills the remainder last
    // Any non-empty category gets at least one cell so it's never invisible.
    const n = cat.tokens > 0 ? Math.max(1, Math.round(cat.tokens / perCell)) : 0
    for (let i = 0; i < n && cells.length < CELL_COUNT; i++) cells.push(cat.key)
  }
  // Whatever's left over is free space.
  while (cells.length < CELL_COUNT) cells.push('freeSpace')
  return cells
}

export default function ContextGrid({ breakdown, total, isSendingRequest }) {
  const { t } = useT()
  const cells = buildCells(breakdown, total)

  return (
    <div
      className={`context-grid ${isSendingRequest ? 'sending' : ''}`}
      role="img"
      aria-label={t('grid.aria')}
    >
      {cells.map((key, i) => {
        const cat = CATEGORY_BY_KEY[key]
        // Free space + reserved buffer are themed via CSS (they need to flip
        // for dark mode); category accents stay inline (they read on both).
        const themed = key === 'freeSpace' || key === 'autocompactBuffer'
        const cls =
          key === 'freeSpace' ? 'grid-cell cell-free'
          : key === 'autocompactBuffer' ? 'grid-cell cell-reserved'
          : 'grid-cell'
        return (
          <span
            key={i}
            className={cls}
            style={themed ? undefined : { background: cat.color }}
            title={`${cat.glyph} ${t('cat.' + key)}`}
          />
        )
      })}
    </div>
  )
}
