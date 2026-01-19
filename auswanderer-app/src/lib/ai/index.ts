/**
 * AI Module Exports
 */

// Types
export type {
  AIProvider,
  AIProviderConfig,
  AISettings,
  AIModel,
  AICapability,
  AIAdapter,
  AIRequest,
  AIMessage,
  AIResponse,
  AIUsage,
  AnalysisRequest,
  AnalysisResult,
  CountryScore,
  ModelUpdate,
  ModelUpdateType,
  CatalogCheck,
} from './types'

// Factory
export { getAIAdapter, getSpecificAdapter, getAvailableModels, clearAIConfigCache } from './factory'

// Analysis
export { analyzeEmigration, getMockAnalysis } from './analyze'

// Catalog Agent
export {
  runCatalogCheck,
  applyModelUpdate,
  dismissModelUpdate,
  getPendingUpdates,
  getRecentChecks,
} from './catalog-agent'

// Encryption
export {
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
  generateEncryptionKey,
  isEncryptionConfigured,
} from './encryption'

// Adapters (for direct use if needed)
export { ClaudeAdapter, OpenAIAdapter, GeminiAdapter } from './adapters'

