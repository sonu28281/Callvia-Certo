import crypto from 'crypto';

export interface OverrideLog {
  id: string;
  sessionId: string;
  tenantId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  
  // Configuration
  originalConfig: {
    verificationMethods: {
      livenessCheck: boolean;
      digilocker: boolean;
      documentUpload: boolean;
    };
    documentTypes: string[];
    estimatedCost: number;
  };
  
  overrideConfig: {
    verificationMethods: {
      livenessCheck: boolean;
      digilocker: boolean;
      documentUpload: boolean;
      aadhaarOTP?: boolean;
      videoKYC?: boolean;
    };
    documentTypes: string[];
    estimatedCost: number;
  };
  
  // Changes
  addedModules: string[];
  removedModules: string[];
  costDelta: number;
  
  // Justification
  reason: string;
  reasonCategory?: 'compliance' | 'customer_request' | 'risk_assessment' | 'technical_issue' | 'other';
  notes?: string;
  
  // Authorization
  appliedBy: string;
  appliedByRole: string;
  appliedAt: Date;
  
  // Approval (for future)
  requiresApproval: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
}

class OverrideLogService {
  private logs: Map<string, OverrideLog> = new Map();
  private sessionOverrides: Map<string, string[]> = new Map(); // sessionId -> [logIds]

  /**
   * Log a KYC override
   */
  logOverride(params: {
    sessionId: string;
    tenantId: string;
    customerId?: string;
    customerName: string;
    customerEmail: string;
    originalConfig: OverrideLog['originalConfig'];
    overrideConfig: OverrideLog['overrideConfig'];
    reason: string;
    reasonCategory?: OverrideLog['reasonCategory'];
    notes?: string;
    appliedBy: string;
    appliedByRole: string;
    ipAddress?: string;
    userAgent?: string;
  }): OverrideLog {
    // Calculate changes
    const addedModules: string[] = [];
    const removedModules: string[] = [];
    
    // Check for added modules
    if (params.overrideConfig.verificationMethods.aadhaarOTP) {
      addedModules.push('Aadhaar OTP Verification');
    }
    if (params.overrideConfig.verificationMethods.videoKYC) {
      addedModules.push('Video KYC');
    }
    
    // Calculate cost delta
    const costDelta = params.overrideConfig.estimatedCost - params.originalConfig.estimatedCost;
    
    const log: OverrideLog = {
      id: crypto.randomUUID(),
      sessionId: params.sessionId,
      tenantId: params.tenantId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      originalConfig: params.originalConfig,
      overrideConfig: params.overrideConfig,
      addedModules,
      removedModules,
      costDelta,
      reason: params.reason,
      reasonCategory: params.reasonCategory,
      notes: params.notes,
      appliedBy: params.appliedBy,
      appliedByRole: params.appliedByRole,
      appliedAt: new Date(),
      requiresApproval: false, // For now, no approval required
      approved: true, // Auto-approved for now
      ipAddress: params.ipAddress,
      userAgent: params.userAgent
    };

    // Store log
    this.logs.set(log.id, log);
    
    // Index by session
    const sessionLogs = this.sessionOverrides.get(params.sessionId) || [];
    sessionLogs.push(log.id);
    this.sessionOverrides.set(params.sessionId, sessionLogs);

    console.log('📋 Override logged:', {
      sessionId: params.sessionId,
      customer: params.customerName,
      addedModules,
      costDelta: `+₹${costDelta.toFixed(2)}`,
      reason: params.reason
    });

    return log;
  }

  /**
   * Get all override logs for a session
   */
  getBySession(sessionId: string): OverrideLog[] {
    const logIds = this.sessionOverrides.get(sessionId) || [];
    return logIds
      .map(id => this.logs.get(id))
      .filter((log): log is OverrideLog => log !== undefined);
  }

  /**
   * Get all override logs for a tenant
   */
  getByTenant(tenantId: string): OverrideLog[] {
    return Array.from(this.logs.values())
      .filter(log => log.tenantId === tenantId);
  }

  /**
   * Get override log by ID
   */
  getById(id: string): OverrideLog | undefined {
    return this.logs.get(id);
  }

  /**
   * Get all override logs
   */
  getAll(): OverrideLog[] {
    return Array.from(this.logs.values());
  }

  /**
   * Get override statistics for a tenant
   */
  getStats(tenantId: string): {
    totalOverrides: number;
    totalCostDelta: number;
    averageCostDelta: number;
    mostAddedModule: string;
    overridesByCategory: Record<string, number>;
  } {
    const tenantLogs = this.getByTenant(tenantId);
    
    const totalOverrides = tenantLogs.length;
    const totalCostDelta = tenantLogs.reduce((sum, log) => sum + log.costDelta, 0);
    const averageCostDelta = totalOverrides > 0 ? totalCostDelta / totalOverrides : 0;
    
    // Count modules
    const moduleCounts: Record<string, number> = {};
    tenantLogs.forEach(log => {
      log.addedModules.forEach(module => {
        moduleCounts[module] = (moduleCounts[module] || 0) + 1;
      });
    });
    
    const mostAddedModule = Object.keys(moduleCounts).length > 0
      ? Object.keys(moduleCounts).reduce((a, b) => moduleCounts[a] > moduleCounts[b] ? a : b)
      : 'None';
    
    // Count by category
    const overridesByCategory: Record<string, number> = {};
    tenantLogs.forEach(log => {
      const category = log.reasonCategory || 'other';
      overridesByCategory[category] = (overridesByCategory[category] || 0) + 1;
    });
    
    return {
      totalOverrides,
      totalCostDelta,
      averageCostDelta,
      mostAddedModule,
      overridesByCategory
    };
  }

  /**
   * Check if a session has any overrides
   */
  hasOverride(sessionId: string): boolean {
    return (this.sessionOverrides.get(sessionId)?.length || 0) > 0;
  }

  /**
   * Get latest override for a session
   */
  getLatestOverride(sessionId: string): OverrideLog | undefined {
    const logs = this.getBySession(sessionId);
    if (logs.length === 0) return undefined;
    
    return logs.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime())[0];
  }
}

export const overrideLogService = new OverrideLogService();
