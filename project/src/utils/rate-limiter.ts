/**
 * Rate Limiting Service
 * Implements client-side and API rate limiting
 */

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDuration: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

export class RateLimiterService {
  private storage: Map<string, RateLimitEntry> = new Map();
  private readonly STORAGE_PREFIX = 'rate_limit_';

  /**
   * Check if request is allowed
   */
  isAllowed(
    identifier: string,
    config: RateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
      blockDuration: 60 * 60 * 1000 // 1 hour
    }
  ): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
    const now = Date.now();
    const key = `${this.STORAGE_PREFIX}${identifier}`;
    
    // Get existing entry or create new one
    let entry = this.getEntry(key);
    
    // Check if currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
      };
    }

    // Reset window if expired
    if (now >= entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blockedUntil: undefined
      };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxAttempts) {
      // Block the identifier
      entry.blockedUntil = now + config.blockDuration;
      this.setEntry(key, entry);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil(config.blockDuration / 1000)
      };
    }

    // Increment count and allow
    entry.count++;
    this.setEntry(key, entry);

    return {
      allowed: true,
      remaining: config.maxAttempts - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Record failed attempt
   */
  recordFailedAttempt(identifier: string, config?: RateLimitConfig): void {
    this.isAllowed(identifier, config);
  }

  /**
   * Clear rate limit for identifier
   */
  clearRateLimit(identifier: string): void {
    const key = `${this.STORAGE_PREFIX}${identifier}`;
    this.storage.delete(key);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  /**
   * Get rate limit status without incrementing
   */
  getStatus(identifier: string, config: RateLimitConfig): { blocked: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = `${this.STORAGE_PREFIX}${identifier}`;
    const entry = this.getEntry(key);

    if (entry.blockedUntil && now < entry.blockedUntil) {
      return { blocked: true, remaining: 0, resetTime: entry.resetTime };
    }

    if (now >= entry.resetTime) {
      return { blocked: false, remaining: config.maxAttempts, resetTime: now + config.windowMs };
    }

    return {
      blocked: entry.count >= config.maxAttempts,
      remaining: Math.max(0, config.maxAttempts - entry.count),
      resetTime: entry.resetTime
    };
  }

  private getEntry(key: string): RateLimitEntry {
    // Try memory first
    let entry = this.storage.get(key);
    
    if (!entry && typeof localStorage !== 'undefined') {
      // Try localStorage
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          entry = JSON.parse(stored);
        } catch {
          // Invalid data, ignore
        }
      }
    }

    if (!entry) {
      entry = {
        count: 0,
        resetTime: Date.now() + (15 * 60 * 1000) // Default 15 minutes
      };
    }

    return entry;
  }

  private setEntry(key: string, entry: RateLimitEntry): void {
    // Store in memory
    this.storage.set(key, entry);
    
    // Persist to localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch {
        // Storage full or unavailable, ignore
      }
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    // Clean memory storage
    for (const [key, entry] of this.storage.entries()) {
      if (now >= entry.resetTime && (!entry.blockedUntil || now >= entry.blockedUntil)) {
        this.storage.delete(key);
      }
    }

    // Clean localStorage
    if (typeof localStorage !== 'undefined') {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '{}');
            if (now >= entry.resetTime && (!entry.blockedUntil || now >= entry.blockedUntil)) {
              keysToRemove.push(key);
            }
          } catch {
            // Invalid entry, remove it
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }
}

// Rate limit configurations for different operations
export const RATE_LIMIT_CONFIGS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDuration: 60 * 60 * 1000 // 1 hour
  },
  FORM_SUBMISSION: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 3,
    blockDuration: 5 * 60 * 1000 // 5 minutes
  },
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 100,
    blockDuration: 5 * 60 * 1000 // 5 minutes
  },
  LLM_REQUESTS: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 20,
    blockDuration: 2 * 60 * 1000 // 2 minutes
  }
};

// Export singleton instance
export const rateLimiter = new RateLimiterService();

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}
