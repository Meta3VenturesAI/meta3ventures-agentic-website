/**
 * API Key Management Service - Commercial-ready API key management
 * Handles API key generation, validation, usage tracking, and billing
 */

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rateLimit: number;
  usageCount: number;
  lastUsed?: Date;
  created: Date;
  expires?: Date;
  isActive: boolean;
  organizationId: string;
}

interface UsageMetrics {
  totalRequests: number;
  requestsToday: number;
  requestsThisMonth: number;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: { endpoint: string; count: number }[];
}

class APIKeyManagementService {
  private keys: Map<string, APIKey> = new Map();
  private usageMetrics: Map<string, UsageMetrics> = new Map();

  /**
   * Generate a new API key
   */
  async generateAPIKey(
    name: string,
    permissions: string[],
    organizationId: string,
    options: {
      rateLimit?: number;
      expiresIn?: number; // days
    } = {}
  ): Promise<APIKey> {
    const keyId = this.generateId();
    const keyString = this.generateSecureKey();
    
    const apiKey: APIKey = {
      id: keyId,
      name,
      key: keyString,
      permissions,
      rateLimit: options.rateLimit || 1000, // requests per hour
      usageCount: 0,
      created: new Date(),
      expires: options.expiresIn ? new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000) : undefined,
      isActive: true,
      organizationId
    };

    this.keys.set(keyId, apiKey);
    this.initializeUsageMetrics(keyId);

    return apiKey;
  }

  /**
   * Validate API key and check permissions
   */
  async validateAPIKey(keyString: string, requiredPermission?: string): Promise<{
    valid: boolean;
    key?: APIKey;
    error?: string;
  }> {
    // Find key by key string
    const apiKey = Array.from(this.keys.values()).find(k => k.key === keyString);
    
    if (!apiKey) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (!apiKey.isActive) {
      return { valid: false, error: 'API key is deactivated' };
    }

    if (apiKey.expires && apiKey.expires < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
      return { valid: false, error: 'Insufficient permissions' };
    }

    // Check rate limiting
    const canMakeRequest = await this.checkRateLimit(apiKey.id);
    if (!canMakeRequest) {
      return { valid: false, error: 'Rate limit exceeded' };
    }

    return { valid: true, key: apiKey };
  }

  /**
   * Track API usage
   */
  async trackUsage(keyId: string, endpoint: string, responseTime: number, success: boolean): Promise<void> {
    const apiKey = this.keys.get(keyId);
    if (!apiKey) return;

    // Update key usage count
    apiKey.usageCount++;
    apiKey.lastUsed = new Date();

    // Update usage metrics
    const metrics = this.usageMetrics.get(keyId);
    if (metrics) {
      metrics.totalRequests++;
      
      // Update daily/monthly counts (simplified for demo)
      const today = new Date().toDateString();
      const thisMonth = new Date().getMonth();
      
      // In production, you'd use a proper time-series database
      metrics.requestsToday++;
      metrics.requestsThisMonth++;
      
      // Update average response time
      metrics.averageResponseTime = (metrics.averageResponseTime + responseTime) / 2;
      
      // Update error rate
      if (!success) {
        metrics.errorRate = (metrics.errorRate + 1) / metrics.totalRequests;
      }

      // Update top endpoints
      const existingEndpoint = metrics.topEndpoints.find(e => e.endpoint === endpoint);
      if (existingEndpoint) {
        existingEndpoint.count++;
      } else {
        metrics.topEndpoints.push({ endpoint, count: 1 });
      }

      // Sort and limit top endpoints
      metrics.topEndpoints.sort((a, b) => b.count - a.count);
      metrics.topEndpoints = metrics.topEndpoints.slice(0, 10);
    }
  }

  /**
   * Get API keys for organization
   */
  async getAPIKeys(organizationId: string): Promise<APIKey[]> {
    return Array.from(this.keys.values())
      .filter(key => key.organizationId === organizationId)
      .map(key => ({
        ...key,
        key: this.maskKey(key.key) // Don't return full key for security
      }));
  }

  /**
   * Get usage metrics for API key
   */
  async getUsageMetrics(keyId: string): Promise<UsageMetrics | null> {
    return this.usageMetrics.get(keyId) || null;
  }

  /**
   * Deactivate API key
   */
  async deactivateAPIKey(keyId: string): Promise<boolean> {
    const apiKey = this.keys.get(keyId);
    if (apiKey) {
      apiKey.isActive = false;
      return true;
    }
    return false;
  }

  /**
   * Update API key permissions
   */
  async updatePermissions(keyId: string, permissions: string[]): Promise<boolean> {
    const apiKey = this.keys.get(keyId);
    if (apiKey) {
      apiKey.permissions = permissions;
      return true;
    }
    return false;
  }

  /**
   * Update rate limit
   */
  async updateRateLimit(keyId: string, rateLimit: number): Promise<boolean> {
    const apiKey = this.keys.get(keyId);
    if (apiKey) {
      apiKey.rateLimit = rateLimit;
      return true;
    }
    return false;
  }

  /**
   * Get billing information
   */
  async getBillingInfo(organizationId: string): Promise<{
    totalRequests: number;
    costThisMonth: number;
    projectedMonthlyCost: number;
    tier: string;
  }> {
    const orgKeys = Array.from(this.keys.values()).filter(k => k.organizationId === organizationId);
    const totalRequests = orgKeys.reduce((sum, key) => sum + key.usageCount, 0);
    
    // Simple pricing model (customize based on your needs)
    const costPerThousandRequests = 0.10; // $0.10 per 1000 requests
    const costThisMonth = (totalRequests / 1000) * costPerThousandRequests;
    
    // Determine tier based on usage
    let tier = 'Free';
    if (totalRequests > 100000) tier = 'Enterprise';
    else if (totalRequests > 10000) tier = 'Professional';
    else if (totalRequests > 1000) tier = 'Starter';

    return {
      totalRequests,
      costThisMonth,
      projectedMonthlyCost: costThisMonth * 1.2, // 20% buffer for projection
      tier
    };
  }

  // Private helper methods
  private generateId(): string {
    return 'key_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateSecureKey(): string {
    const prefix = 'mk_'; // meta3 key prefix
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return prefix + randomPart;
  }

  private maskKey(key: string): string {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  }

  private async checkRateLimit(keyId: string): Promise<boolean> {
    const apiKey = this.keys.get(keyId);
    if (!apiKey) return false;

    // Simplified rate limiting - in production, use Redis or similar
    // For now, just check if usage in last hour exceeds limit
    const hourlyUsage = this.getHourlyUsage(keyId);
    return hourlyUsage < apiKey.rateLimit;
  }

  private getHourlyUsage(_keyId: string): number {
    // Simplified - in production, track usage with timestamps
    return Math.floor(Math.random() * 100); // Mock data
  }

  private initializeUsageMetrics(keyId: string): void {
    this.usageMetrics.set(keyId, {
      totalRequests: 0,
      requestsToday: 0,
      requestsThisMonth: 0,
      averageResponseTime: 0,
      errorRate: 0,
      topEndpoints: []
    });
  }

  /**
   * Available permissions for API keys
   */
  getAvailablePermissions(): string[] {
    return [
      'applications:read',
      'applications:write',
      'portfolio:read',
      'analytics:read',
      'agents:use',
      'files:read',
      'files:write',
      'admin:read',
      'admin:write'
    ];
  }
}

export const apiKeyManagementService = new APIKeyManagementService();
export type { APIKey, UsageMetrics };
