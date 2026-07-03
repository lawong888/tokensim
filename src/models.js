// models.js
// Editable, persisted model registry for the pricing simulation.
//
// Prices are per 1M tokens and were verified against public pricing in
// 2026-07 (Claude figures from the bundled claude-api reference; OpenAI/GLM
// from web search). `window` is each model's max context window. Everything is
// editable and persisted to localStorage — treat these as sensible defaults.
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'tokensim.models.v1'

export const DEFAULT_MODELS = [
  { id: 'claude-sonnet', name: 'Claude Sonnet 5',        window: 1000000, inPer1M: 3,    outPer1M: 15 },
  { id: 'claude-opus',   name: 'Claude Opus 4.8',        window: 1000000, inPer1M: 5,    outPer1M: 25 },
  { id: 'claude-haiku',  name: 'Claude Haiku 4.5',       window: 200000,  inPer1M: 1,    outPer1M: 5 },
  { id: 'openai-codex',  name: 'OpenAI Codex (GPT-5.5)', window: 1000000, inPer1M: 5,    outPer1M: 30 },
  { id: 'glm',           name: 'Zhipu GLM-4.6',          window: 200000,  inPer1M: 0.43, outPer1M: 1.74 },
]

export function cloneDefaults() {
  return DEFAULT_MODELS.map((m) => ({ ...m }))
}

export function loadModels() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore corrupt storage */
  }
  return cloneDefaults()
}

export function saveModels(models) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models))
  } catch {
    /* storage may be unavailable (private mode) — degrade gracefully */
  }
}

export function newModelId() {
  return `m-${uuidv4()}`
}
