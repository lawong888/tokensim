// ContextGrid.jsx
// The signature Claude Code /context visual: a dense block-map of colored
// cells where each cell represents a fixed number of tokens, colored by
// category in category order, then free space, then the reserved buffer.

import { CATEGORY_BY_KEY } from './contextModel'
import { useT } from './i18n'

// ┌─ YOUR DESIGN CHOICE (learning-mode contribution point #3) ────────────┐
// │ How many tokens does one cell represent, and how do partial cells     │
// │ round? More cells = finer detail but a busier grid. Rounding decides  │
// │ whether tiny categories (e.g. a 2k memory slice on a 200k window)     │
// │ show up at all. Tune CELL_COUNT and the rounding in buildCells().     │
// └───────────────────────────────────────────────────────────────────────┘
const CELL_COUNT = 240 // total cells in the grid

function buildCells(breakdown, total) {
  const perCell = total / CELL_COUNT
  const cells = []
  for (const cat of breakdown) {
    // Math.round means a category smaller than half a cell disappears;
    // switch to Math.ceil to guarantee every non-empty category shows.
    const n = Math.round(cat.tokens / perCell)
    for (let i = 0; i < n && cells.length < CELL_COUNT; i++) cells.push(cat.key)
  }
  // Pad any rounding shortfall with free space so the grid is always full.
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
        return (
          <span
            key={i}
            className="grid-cell"
            style={{ background: cat.color }}
            title={`${cat.glyph} ${t('cat.' + key)}`}
          />
        )
      })}
    </div>
  )
}
