// contextModel.js
// Central, data-driven model for the Claude Code /context-style simulator.
// Single source of truth for: category definitions, token estimation,
// breakdown math, billing, autocompact (eviction), and context-rot severity.
//
// No real tokenizer is used — token counts are heuristic estimates so the
// simulation "feels" realistic without pulling in tiktoken/gpt-tokenizer.

import { v4 as uuidv4 } from 'uuid'

// ── Category definitions ────────────────────────────────────────────────
// The ORDER of this array is the render order in the grid, breakdown, meter,
// and legend. Every visual component maps over this list, so adding or
// recoloring a category is a one-line change here.
//
//   kind:      'input' | 'output' | 'mixed'  — drives billing
//   fixed:     overhead loaded before the first message (never evicted)
//   evictable: participates in autocompact
//   derived:   computed (free space), not a real token bucket
//   reserved:  a held-back region (autocompact buffer)
//
// Glyphs mirror Claude Code's /context output.
export const CATEGORIES = [
  { key: 'systemPrompt',      label: 'System prompt',       glyph: '⛁', color: '#3b82f6', kind: 'input',  fixed: true },
  { key: 'systemTools',       label: 'System tools',        glyph: '⛁', color: '#14b8a6', kind: 'input',  fixed: true },
  { key: 'mcpTools',          label: 'MCP tools',           glyph: '⛁', color: '#f97316', kind: 'input',  fixed: true },
  { key: 'memory',            label: 'Memory (CLAUDE.md)',  glyph: '⛁', color: '#8b5cf6', kind: 'input',  fixed: true },
  { key: 'customAgents',      label: 'Custom agents',       glyph: '⛁', color: '#ec4899', kind: 'input',  fixed: true },
  { key: 'skills',            label: 'Skills',              glyph: '⛁', color: '#eab308', kind: 'input',  fixed: true },
  { key: 'messages',          label: 'Messages',            glyph: '⛀', color: '#22c55e', kind: 'mixed',  evictable: true },
  { key: 'freeSpace',         label: 'Free space',          glyph: '⛶', color: '#e5e7eb', derived: true },
  { key: 'autocompactBuffer', label: 'Autocompact buffer',  glyph: '⛝', color: '#9ca3af', reserved: true },
]

export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]))

// Message roles map onto billing sides: user/tool = input, assistant = output.
// All three are sub-parts of the single "Messages" category, so they use the
// Messages green family (relating back to the Messages key in the breakdown);
// the emoji — not the color — distinguishes the role.
export const MESSAGE_ROLE_COLOR = {
  user: '#22c55e',      // the Messages category key green
  assistant: '#16a34a', // darker green
  tool: '#4ade80',      // lighter green
}
export const MESSAGE_ROLE_ICON = {
  user: '👤',
  assistant: '🤖',
  tool: '🔧',
}
export const MESSAGE_ROLE_LABEL = {
  user: 'User',
  assistant: 'Assistant',
  tool: 'Tool',
}

// ── Presets for the config panel ────────────────────────────────────────
export const PRESET_MCP = [
  { name: 'github', tools: 35 },
  { name: 'context7', tools: 5 },
  { name: 'jcodemunch', tools: 30 },
  { name: 'playwright', tools: 21 },
  { name: 'sentry', tools: 12 },
]

export const PRESET_SKILLS = [
  { id: 'brainstorming', name: 'brainstorming' },
  { id: 'systematic-debugging', name: 'systematic-debugging' },
  { id: 'test-driven-development', name: 'test-driven-development' },
  { id: 'writing-plans', name: 'writing-plans' },
  { id: 'frontend-design', name: 'frontend-design' },
  { id: 'code-review', name: 'code-review' },
]

export const PRESET_AGENTS = [
  { id: 'code-reviewer', name: 'code-reviewer' },
  { id: 'Explore', name: 'Explore' },
  { id: 'Plan', name: 'Plan' },
  { id: 'debugger', name: 'debugger' },
]

// ── Token-estimate heuristics ───────────────────────────────────────────
// ┌─ YOUR DESIGN CHOICE (learning-mode contribution point #1) ────────────┐
// │ These per-unit costs decide how realistic the simulation feels. Tune  │
// │ them (or make them non-linear) to match what you observe in a real    │
// │ /context readout. e.g. MCP tools dominate in tool-heavy setups.       │
// └───────────────────────────────────────────────────────────────────────┘
export const ESTIMATE = {
  perMcpTool: 800,       // each MCP tool's JSON schema
  perSkill: 120,         // each skill's one-line metadata entry
  perAgent: 350,         // each custom agent definition
  perMemoryKb: 260,      // tokens per KB of CLAUDE.md / memory
}

// Message generation bounds (tokens per message).
export const MSG_TOKENS = { min: 350, max: 1400 }

// ── Fixed-overhead computation ──────────────────────────────────────────
// Returns the token count for each of the six "fixed" (never-evicted)
// categories, derived from the current config.
export function computeFixedTokens(config) {
  return {
    systemPrompt: config.systemPromptTokens,
    systemTools: config.systemToolsTokens,
    mcpTools: config.mcpServers.reduce((s, srv) => s + srv.tools * ESTIMATE.perMcpTool, 0),
    memory: Math.round(config.memoryKb * ESTIMATE.perMemoryKb),
    customAgents: config.enabledAgents.length * ESTIMATE.perAgent,
    skills: config.enabledSkills.length * ESTIMATE.perSkill,
  }
}

export function sumTokens(list) {
  return list.reduce((s, t) => s + t.length, 0)
}

// Aggregate usage: fixed overhead + messages + reserved buffer vs. the window.
export function computeUsage(config, messages, total) {
  const fixed = computeFixedTokens(config)
  const fixedSum = Object.values(fixed).reduce((s, n) => s + n, 0)
  const msgs = sumTokens(messages)
  const reserved = Math.min(config.autocompactTokens, total)
  const used = fixedSum + msgs
  const free = Math.max(0, total - used - reserved)
  return { fixed, fixedSum, msgs, reserved, used, free, total }
}

// The token budget available to messages (what's left after fixed overhead
// and the reserved autocompact buffer). Messages must stay under this.
export function messageBudget(config, total) {
  const fixed = computeFixedTokens(config)
  const fixedSum = Object.values(fixed).reduce((s, n) => s + n, 0)
  const reserved = Math.min(config.autocompactTokens, total)
  return Math.max(0, total - fixedSum - reserved)
}

// ── Breakdown for the /context text panel and grid ──────────────────────
// Returns CATEGORIES (in order) each annotated with { tokens, pct }.
export function computeBreakdown(config, messages, total) {
  const u = computeUsage(config, messages, total)
  const tokensByKey = {
    ...u.fixed,
    messages: u.msgs,
    freeSpace: u.free,
    autocompactBuffer: u.reserved,
  }
  return CATEGORIES.map((c) => {
    const tokens = tokensByKey[c.key] ?? 0
    return { ...c, tokens, pct: total ? (tokens / total) * 100 : 0 }
  })
}

// ── Billing ─────────────────────────────────────────────────────────────
// Input  = all fixed overhead + user/tool message tokens.
// Output = assistant message tokens.
export function computeCost(config, messages, inputPrice, outputPrice) {
  const fixed = computeFixedTokens(config)
  const fixedSum = Object.values(fixed).reduce((s, n) => s + n, 0)
  const inputMsgTokens = sumTokens(messages.filter((m) => m.role !== 'assistant'))
  const outputMsgTokens = sumTokens(messages.filter((m) => m.role === 'assistant'))
  const inputTokens = fixedSum + inputMsgTokens
  return inputTokens * inputPrice + outputMsgTokens * outputPrice
}

// Anthropic-style prompt caching multipliers, applied to the cached (stable
// overhead) prefix: first use is a cache WRITE, later uses are cache READs.
export const CACHE_WRITE_MULT = 1.25
export const CACHE_READ_MULT = 0.1

// Accurate per-request cost.
//   input  = the entire resent context (overhead + every message) MINUS the
//            tokens the model newly generated this turn
//   output = only this turn's newly generated tokens (newOutputTokens)
// With caching on, the stable overhead prefix is billed at the write/read
// multiplier instead of full input price. Returns { cost, cacheSaved }, where
// cacheSaved is negative on the write turn and positive on read turns.
export function computeRequestCost({
  config,
  messages,
  newOutputTokens,
  inputPrice,
  outputPrice,
  caching,
  cacheWarm,
}) {
  const fixed = computeFixedTokens(config)
  const overhead = Object.values(fixed).reduce((s, n) => s + n, 0)
  const msgInput = Math.max(0, sumTokens(messages) - newOutputTokens)

  let overheadCost = overhead * inputPrice
  let cacheSaved = 0
  if (caching) {
    const mult = cacheWarm ? CACHE_READ_MULT : CACHE_WRITE_MULT
    overheadCost = overhead * inputPrice * mult
    cacheSaved = overhead * inputPrice - overheadCost // vs. paying full input for overhead
  }

  const cost = overheadCost + msgInput * inputPrice + newOutputTokens * outputPrice
  return { cost, cacheSaved }
}

// ── Autocompact / eviction ──────────────────────────────────────────────
// ┌─ YOUR DESIGN CHOICE (learning-mode contribution point #2) ────────────┐
// │ When messages exceed `budget`, which ones survive?                    │
// │ Default: drop OLDEST first (FIFO), matching the original simulator.   │
// │ Alternatives to try:                                                  │
// │   • summarize-and-keep-recent (replace old msgs with a small summary) │
// │   • always protect the FIRST user message (the original task)         │
// │   • drop by role (evict bulky tool results before conversation)       │
// │ Return { kept, dropped } — `dropped` feeds the Context Rot warning.   │
// └───────────────────────────────────────────────────────────────────────┘
export function compactMessages(messages, budget) {
  const kept = [...messages]
  const dropped = []
  let sum = sumTokens(kept)
  while (sum > budget && kept.length > 0) {
    const removed = kept.shift() // oldest
    dropped.push(removed)
    sum -= removed.length
  }
  return { kept, dropped }
}

// ── Context Rot severity ────────────────────────────────────────────────
// ┌─ YOUR DESIGN CHOICE (learning-mode contribution point #4) ────────────┐
// │ Map cumulative loss to a severity label. This encodes YOUR judgment   │
// │ of when discarded context becomes a real reliability risk. The badge  │
// │ color and label come straight from what you return here.              │
// └───────────────────────────────────────────────────────────────────────┘
export function rotSeverity({ events, tokensLost }) {
  if (events === 0) return 'none'
  if (tokensLost < 4000) return 'low'
  if (tokensLost < 20000) return 'moderate'
  return 'severe'
}

export const ROT_META = {
  none: { label: 'HEALTHY', color: '#2ad736' },
  low: { label: 'LOW', color: '#ffdd00' },
  moderate: { label: 'MODERATE', color: '#ffa500' },
  severe: { label: 'SEVERE', color: '#ff4444' },
}

// ── Factories ───────────────────────────────────────────────────────────
export function makeMessage(role) {
  const span = MSG_TOKENS.max - MSG_TOKENS.min
  return { id: uuidv4(), category: 'messages', role, length: Math.floor(Math.random() * span + MSG_TOKENS.min) }
}

// A lifelike starting configuration so trainees open on a realistic,
// already ~30-40%-full window instead of an empty one.
export function realisticProfile() {
  return {
    systemPromptTokens: 3200,
    systemToolsTokens: 12000,
    mcpServers: PRESET_MCP.slice(0, 2).map((m) => ({ id: uuidv4(), ...m })),
    enabledSkills: ['brainstorming', 'systematic-debugging', 'test-driven-development', 'writing-plans'],
    enabledAgents: ['code-reviewer', 'Explore'],
    memoryKb: 8,
    autocompactTokens: 45000,
  }
}

// ── Formatting helper ───────────────────────────────────────────────────
export function fmtTokens(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return `${n}`
}
