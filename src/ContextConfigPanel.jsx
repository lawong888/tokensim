// ContextConfigPanel.jsx
// Interactive controls that mutate the fixed-overhead config. Every change
// re-renders the grid, breakdown, and meter live so trainees can watch the
// window fill and free space shrink as they add MCP servers, skills, etc.

import { v4 as uuidv4 } from 'uuid'
import {
  PRESET_MCP,
  PRESET_SKILLS,
  PRESET_AGENTS,
  realisticProfile,
} from './contextModel'
import { useT } from './i18n'

export default function ContextConfigPanel({ config, setConfig }) {
  const { t } = useT()

  // Generic helper to patch one field of the config.
  const patch = (field, value) => setConfig((prev) => ({ ...prev, [field]: value }))

  const toggleInList = (field, id) =>
    setConfig((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((x) => x !== id)
        : [...prev[field], id],
    }))

  const addMcpServer = (preset) =>
    setConfig((prev) => ({
      ...prev,
      mcpServers: [...prev.mcpServers, { id: uuidv4(), name: preset.name, tools: preset.tools }],
    }))

  const removeMcpServer = (id) =>
    setConfig((prev) => ({ ...prev, mcpServers: prev.mcpServers.filter((s) => s.id !== id) }))

  return (
    <div className="config-panel">
      <div className="config-panel-head">
        <h3 className="section-title">{t('config.title')}</h3>
        <button className="profile-btn" onClick={() => setConfig(realisticProfile())}>
          {t('config.loadProfile')}
        </button>
      </div>

      {/* System prompt */}
      <div className="config-group">
        <label className="config-label">
          {t('cat.systemPrompt')}: <strong>{config.systemPromptTokens.toLocaleString()} {t('unit.tokens')}</strong>
        </label>
        <input
          type="range"
          min="1000"
          max="12000"
          step="200"
          value={config.systemPromptTokens}
          onChange={(e) => patch('systemPromptTokens', Number(e.target.value))}
        />
      </div>

      {/* System tools */}
      <div className="config-group">
        <label className="config-label">
          {t('cat.systemTools')}: <strong>{config.systemToolsTokens.toLocaleString()} {t('unit.tokens')}</strong>
        </label>
        <input
          type="range"
          min="2000"
          max="30000"
          step="500"
          value={config.systemToolsTokens}
          onChange={(e) => patch('systemToolsTokens', Number(e.target.value))}
        />
      </div>

      {/* MCP servers — the biggest lever */}
      <div className="config-group">
        <label className="config-label">{t('config.mcpServers')} ({config.mcpServers.length})</label>
        <div className="mcp-list">
          {config.mcpServers.map((s) => (
            <span key={s.id} className="mcp-chip">
              {s.name} · {s.tools} {t('word.tools')}
              <button className="chip-x" onClick={() => removeMcpServer(s.id)} aria-label={`Remove ${s.name}`}>×</button>
            </span>
          ))}
          {config.mcpServers.length === 0 && <span className="config-empty">{t('word.none')}</span>}
        </div>
        <div className="preset-row">
          {PRESET_MCP.map((p) => (
            <button key={p.name} className="preset-add" onClick={() => addMcpServer(p)}>
              + {p.name} ({p.tools})
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="config-group">
        <label className="config-label">{t('cat.skills')} ({config.enabledSkills.length})</label>
        <div className="toggle-row">
          {PRESET_SKILLS.map((sk) => (
            <button
              key={sk.id}
              className={`toggle-chip ${config.enabledSkills.includes(sk.id) ? 'on' : ''}`}
              onClick={() => toggleInList('enabledSkills', sk.id)}
            >
              {sk.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom agents */}
      <div className="config-group">
        <label className="config-label">{t('cat.customAgents')} ({config.enabledAgents.length})</label>
        <div className="toggle-row">
          {PRESET_AGENTS.map((ag) => (
            <button
              key={ag.id}
              className={`toggle-chip ${config.enabledAgents.includes(ag.id) ? 'on' : ''}`}
              onClick={() => toggleInList('enabledAgents', ag.id)}
            >
              {ag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Memory */}
      <div className="config-group">
        <label className="config-label">
          {t('cat.memory')}: <strong>{config.memoryKb} {t('unit.kb')}</strong>
        </label>
        <input
          type="range"
          min="0"
          max="40"
          step="1"
          value={config.memoryKb}
          onChange={(e) => patch('memoryKb', Number(e.target.value))}
        />
      </div>

      {/* Autocompact buffer */}
      <div className="config-group">
        <label className="config-label">
          {t('cat.autocompactBuffer')}: <strong>{config.autocompactTokens.toLocaleString()} {t('unit.tokens')}</strong>
        </label>
        <input
          type="range"
          min="0"
          max="60000"
          step="1000"
          value={config.autocompactTokens}
          onChange={(e) => patch('autocompactTokens', Number(e.target.value))}
        />
      </div>
    </div>
  )
}
