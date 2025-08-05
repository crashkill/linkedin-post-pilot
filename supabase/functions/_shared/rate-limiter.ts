// Rate Limiter para Edge Functions
// Controla o número de requisições por usuário

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyPrefix: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

export class RateLimiter {
  private config: RateLimitConfig
  private storage: Map<string, { count: number; resetTime: number }>

  constructor(config: RateLimitConfig) {
    this.config = config
    this.storage = new Map()
  }

  async checkLimit(userId: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${userId}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Limpar entradas expiradas
    this.cleanupExpired(windowStart)

    const userLimit = this.storage.get(key)
    
    if (!userLimit || userLimit.resetTime <= now) {
      // Primeira requisição ou janela expirada
      const resetTime = now + this.config.windowMs
      this.storage.set(key, { count: 1, resetTime })
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime
      }
    }

    if (userLimit.count >= this.config.maxRequests) {
      // Limite excedido
      return {
        allowed: false,
        remaining: 0,
        resetTime: userLimit.resetTime
      }
    }

    // Incrementar contador
    userLimit.count++
    this.storage.set(key, userLimit)

    return {
      allowed: true,
      remaining: this.config.maxRequests - userLimit.count,
      resetTime: userLimit.resetTime
    }
  }

  private cleanupExpired(windowStart: number): void {
    for (const [key, value] of this.storage.entries()) {
      if (value.resetTime <= windowStart) {
        this.storage.delete(key)
      }
    }
  }
}

// Configurações pré-definidas para diferentes tipos de API
export const rateLimitConfigs = {
  groq: {
    maxRequests: 10, // 10 requisições por minuto
    windowMs: 60 * 1000, // 1 minuto
    keyPrefix: 'groq'
  },
  gemini: {
    maxRequests: 15, // 15 requisições por minuto
    windowMs: 60 * 1000, // 1 minuto
    keyPrefix: 'gemini'
  },
  huggingface: {
    maxRequests: 5, // 5 requisições por minuto (geração de imagem é mais pesada)
    windowMs: 60 * 1000, // 1 minuto
    keyPrefix: 'huggingface'
  }
}

// Instâncias globais dos rate limiters
export const groqLimiter = new RateLimiter(rateLimitConfigs.groq)
export const geminiLimiter = new RateLimiter(rateLimitConfigs.gemini)
export const huggingfaceLimiter = new RateLimiter(rateLimitConfigs.huggingface)