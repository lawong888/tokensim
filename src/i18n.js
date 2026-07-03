// i18n.js
// Tiny translation layer: a flat string table per language, a makeT(lang)
// helper with {var} interpolation, and a React context so any component can
// call t() without prop drilling. Add a language by adding a block to STRINGS.

import { createContext, useContext } from 'react'

export const STRINGS = {
  en: {
    'app.title': 'Context Window Simulator',
    'app.subtitleA': 'A Claude Code',
    'app.subtitleB': "-style view of what fills an agent's window",

    'config.title': 'Context Configuration',
    'config.loadProfile': 'Load realistic Claude Code profile',
    'config.mcpServers': 'MCP servers',

    'breakdown.title': 'Context Usage',

    'cat.systemPrompt': 'System prompt',
    'cat.systemTools': 'System tools',
    'cat.mcpTools': 'MCP tools',
    'cat.memory': 'Memory (CLAUDE.md)',
    'cat.customAgents': 'Custom agents',
    'cat.skills': 'Skills',
    'cat.messages': 'Messages (conversation)',
    'cat.summary': 'Summary',
    'cat.freeSpace': 'Free space',
    'cat.autocompactBuffer': 'Autocompact buffer',

    'unit.tokens': 'tokens',
    'unit.kb': 'KB',
    'word.none': 'none',
    'word.tools': 'tools',

    'msg.title': 'Messages (conversation)',
    'msg.empty': 'no messages yet — click “Ask LLM”',
    'role.user': 'User',
    'role.assistant': 'Assistant',
    'role.tool': 'Tool',
    'role.summary': 'Summary',

    'bill.current': 'Last request',
    'bill.session': 'Session',
    'bill.saved': 'Cache saved',
    'bill.req': 'req',
    'bill.tok': 'tok',
    'bill.currentTip': 'Cost of the most recent request (resent context as input + new output)',
    'bill.sessionTip': 'Cumulative cost this session',
    'bill.savedTip': 'Input cost saved by prompt caching this session (negative on the first cache write)',
    'bill.tokensTip': 'Total tokens generated',

    'ctl.model': 'Model',
    'ctl.window': 'Window',
    'ctl.inPrice': 'In $',
    'ctl.outPrice': 'Out $',
    'ctl.priceUnitTip': 'Toggle price unit: per 1M tokens ↔ per token',
    'ctl.themeTip': 'Toggle light / dark theme',
    'model.add': 'Add a model from the current price + window',
    'model.save': 'Save the current price + window to the selected model',
    'model.delete': 'Remove the selected model',
    'model.reset': 'Reset the model list to defaults',
    'model.namePrompt': 'Name for the new model:',
    'model.newName': 'My model',
    'ctl.ask': 'Ask LLM',
    'ctl.auto': 'Auto',
    'ctl.reset': 'Reset',
    'ctl.autocompact': 'Auto-Compact',
    'ctl.autocompactTip': 'Auto-Compact: summarize the oldest turns at the limit instead of dropping them',
    'ctl.cache': 'Cache',
    'ctl.cacheTip': 'Prompt caching: cache the stable overhead prefix (1.25× write, then 0.1× read)',
    'ctl.muteTip': 'Toggle Context Rot beep',

    'rot.title': 'Context Rot',
    'rot.none': 'HEALTHY',
    'rot.low': 'LOW',
    'rot.moderate': 'MODERATE',
    'rot.severe': 'SEVERE',
    'rot.detail': '{count} turns compacted (≈{tokens} degraded)',
    'rot.tooltip':
      'Context rot: as old turns are dropped or summarized away, the model loses access to earlier detail and its recall degrades. Summarizing (Auto-Compact) degrades slower than dropping, but still degrades.',
    'toast.lost': 'Context lost — {count} turns dropped (≈{tokens})',
    'toast.compacted': 'Auto-compacted {count} turns → summary (≈{tokens} freed)',

    'grid.aria': 'Context window composition',
    'lang.switch': '中文',
  },

  zh: {
    'app.title': '上下文窗口模拟器',
    'app.subtitleA': '以 Claude Code',
    'app.subtitleB': ' 风格展示代理上下文窗口中的内容',

    'config.title': '上下文配置',
    'config.loadProfile': '加载真实 Claude Code 配置',
    'config.mcpServers': 'MCP 服务器',

    'breakdown.title': '上下文用量',

    'cat.systemPrompt': '系统提示词',
    'cat.systemTools': '系统工具',
    'cat.mcpTools': 'MCP 工具',
    'cat.memory': '记忆 (CLAUDE.md)',
    'cat.customAgents': '自定义代理',
    'cat.skills': '技能',
    'cat.messages': '消息（对话）',
    'cat.summary': '摘要',
    'cat.freeSpace': '空闲空间',
    'cat.autocompactBuffer': '自动压缩缓冲区',

    'unit.tokens': '个令牌',
    'unit.kb': 'KB',
    'word.none': '无',
    'word.tools': '个工具',

    'msg.title': '消息（对话）',
    'msg.empty': '暂无消息 —— 点击"询问 LLM"',
    'role.user': '用户',
    'role.assistant': '助手',
    'role.tool': '工具',
    'role.summary': '摘要',

    'bill.current': '上次请求',
    'bill.session': '会话',
    'bill.saved': '缓存节省',
    'bill.req': '次请求',
    'bill.tok': '令牌',
    'bill.currentTip': '最近一次请求的成本（重新发送的上下文作为输入 + 新的输出）',
    'bill.sessionTip': '本次会话的累计成本',
    'bill.savedTip': '本次会话中提示缓存节省的输入成本（首次写入缓存时为负）',
    'bill.tokensTip': '已生成的令牌总数',

    'ctl.model': '模型',
    'ctl.window': '窗口',
    'ctl.inPrice': '输入 $',
    'ctl.outPrice': '输出 $',
    'ctl.priceUnitTip': '切换价格单位：每百万令牌 ↔ 每令牌',
    'ctl.themeTip': '切换浅色 / 深色主题',
    'model.add': '以当前价格与窗口新增模型',
    'model.save': '将当前价格与窗口保存到所选模型',
    'model.delete': '删除所选模型',
    'model.reset': '将模型列表恢复为默认',
    'model.namePrompt': '新模型的名称：',
    'model.newName': '我的模型',
    'ctl.ask': '询问 LLM',
    'ctl.auto': '自动',
    'ctl.reset': '重置',
    'ctl.autocompact': '自动压缩',
    'ctl.autocompactTip': '自动压缩：达到上限时对最旧的轮次进行摘要，而不是直接丢弃',
    'ctl.cache': '缓存',
    'ctl.cacheTip': '提示缓存：缓存稳定的开销前缀（写入 1.25×，之后读取 0.1×）',
    'ctl.muteTip': '切换上下文腐烂提示音',

    'rot.title': '上下文腐烂',
    'rot.none': '健康',
    'rot.low': '轻度',
    'rot.moderate': '中度',
    'rot.severe': '严重',
    'rot.detail': '已压缩 {count} 轮（约 {tokens} 退化）',
    'rot.tooltip':
      '上下文腐烂：随着旧的轮次被丢弃或被摘要压缩，模型无法再访问较早的细节，其回忆能力随之下降。摘要（自动压缩）比直接丢弃退化得更慢，但仍会退化。',
    'toast.lost': '上下文丢失 —— 丢弃了 {count} 轮（约 {tokens}）',
    'toast.compacted': '自动压缩 {count} 轮 → 摘要（约释放 {tokens}）',

    'grid.aria': '上下文窗口构成',
    'lang.switch': 'English',
  },
}

export function makeT(lang) {
  const table = STRINGS[lang] || STRINGS.en
  return function t(key, vars) {
    let s = table[key]
    if (s === undefined) s = STRINGS.en[key]
    if (s === undefined) return key
    if (vars) {
      for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]))
    }
    return s
  }
}

export const LangContext = createContext({ lang: 'en', setLang: () => {}, t: makeT('en') })

export function useT() {
  return useContext(LangContext)
}
