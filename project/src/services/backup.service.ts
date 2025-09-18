/**
 * Automated Backup Service
 * Handles backup and recovery of form data
 */

import { dataStorage, FormType } from './data-storage.service';

interface BackupConfig {
  interval: number; // in milliseconds
  maxBackups: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

interface Backup {
  id: string;
  timestamp: string;
  data: unknown;
  size: number;
  checksum: string;
  version: string;
}

interface BackupMetadata {
  totalBackups: number;
  lastBackupTime: string;
  totalSize: number;
  backupHistory: BackupHistoryItem[];
}

interface BackupHistoryItem {
  id: string;
  timestamp: string;
  status: 'success' | 'failed';
  size?: number;
  error?: string;
}

class BackupService {
  private config: BackupConfig;
  private backupTimer: NodeJS.Timeout | null = null;
  private isBackingUp = false;
  private backupQueue: Set<string> = new Set();
  
  constructor() {
    this.config = {
      interval: 3600000, // 1 hour default
      maxBackups: 24, // Keep 24 hours of backups
      compressionEnabled: true,
      encryptionEnabled: false
    };
  }

  /**
   * Initialize automated backup system
   */
  initialize(config?: Partial<BackupConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Start automated backups
    this.startAutomatedBackup();
    
    // Set up event listeners for critical operations
    this.setupEventListeners();
    
    console.log('Backup service initialized with config:', this.config);
  }

  /**
   * Start automated backup timer
   */
  private startAutomatedBackup() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
    
    // Initial backup
    this.performBackup('automated');
    
    // Set up recurring backups
    this.backupTimer = setInterval(() => {
      this.performBackup('automated');
    }, this.config.interval);
  }

  /**
   * Perform backup
   */
  async performBackup(trigger: 'manual' | 'automated' | 'event'): Promise<boolean> {
    if (this.isBackingUp) {
      console.log('Backup already in progress, queueing...');
      return false;
    }
    
    this.isBackingUp = true;
    const backupId = this.generateBackupId();
    const startTime = Date.now();
    
    try {
      console.log(`Starting ${trigger} backup ${backupId}...`);
      
      // Get all form submissions
      const submissions = await dataStorage.getAllSubmissions();
      
      // Get analytics data (placeholder - implement when analytics method is available)
      const analytics = { events: [], metrics: {} };
      
      // Create backup data object
      const backupData = {
        submissions,
        analytics,
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          trigger,
          formCount: submissions.length,
          environment: import.meta.env.VITE_APP_ENV || 'development'
        }
      };
      
      // Compress data if enabled
      let processedData = backupData;
      if (this.config.compressionEnabled) {
        processedData = await this.compressData(backupData);
      }
      
      // Encrypt data if enabled
      if (this.config.encryptionEnabled) {
        processedData = await this.encryptData(processedData);
      }
      
      // Calculate checksum
      const checksum = await this.calculateChecksum(JSON.stringify(processedData));
      
      // Store backup
      const backup: Backup = {
        id: backupId,
        timestamp: new Date().toISOString(),
        data: processedData,
        size: JSON.stringify(processedData).length,
        checksum,
        version: '1.0.0'
      };
      
      await this.storeBackup(backup);
      
      // Clean up old backups
      await this.cleanupOldBackups();
      
      // Update metadata
      await this.updateBackupMetadata({
        id: backupId,
        timestamp: backup.timestamp,
        status: 'success',
        size: backup.size
      });
      
      const duration = Date.now() - startTime;
      console.log(`Backup ${backupId} completed in ${duration}ms`);
      
      // Notify success
      this.notifyBackupStatus('success', backupId, duration);
      
      return true;
      
    } catch (error) {
      console.error('Backup failed:', error);
      
      // Update metadata with failure
      await this.updateBackupMetadata({
        id: backupId,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Notify failure
      this.notifyBackupStatus('failed', backupId, 0, error);
      
      return false;
      
    } finally {
      this.isBackingUp = false;
      
      // Process any queued backups
      if (this.backupQueue.size > 0) {
        const nextTrigger = this.backupQueue.values().next().value;
        if (nextTrigger) {
          this.backupQueue.delete(nextTrigger);
          this.performBackup(nextTrigger as "event" | "manual" | "automated");
        }
      }
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      console.log(`Starting restore from backup ${backupId}...`);
      
      // Get backup
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }
      
      // Verify checksum
      const currentChecksum = await this.calculateChecksum(JSON.stringify(backup.data));
      if (currentChecksum !== backup.checksum) {
        throw new Error('Backup integrity check failed');
      }
      
      // Decrypt if needed
      let data = backup.data;
      if (this.config.encryptionEnabled) {
        data = await this.decryptData(data);
      }
      
      // Decompress if needed
      if (this.config.compressionEnabled) {
        data = await this.decompressData(data);
      }
      
      // Create restore point before restoring
      await this.performBackup('manual');
      
      // Clear current data
      await this.clearCurrentData();
      
      // Restore submissions
      if ((data as any).submissions && Array.isArray((data as any).submissions)) {
        for (const submission of (data as any).submissions) {
          await dataStorage.storeFormSubmission(submission);
        }
      }
      
      console.log(`Restore from backup ${backupId} completed successfully`);
      
      // Notify success
      this.notifyRestoreStatus('success', backupId);
      
      return true;
      
    } catch (error) {
      console.error('Restore failed:', error);
      
      // Notify failure
      this.notifyRestoreStatus('failed', backupId, error);
      
      return false;
    }
  }

  /**
   * Get list of available backups
   */
  async getAvailableBackups(): Promise<BackupMetadata> {
    try {
      const metadata = localStorage.getItem('backup_metadata');
      if (metadata) {
        return JSON.parse(metadata);
      }
      
      return {
        totalBackups: 0,
        lastBackupTime: '',
        totalSize: 0,
        backupHistory: []
      };
    } catch (error) {
      console.error('Failed to get backup metadata:', error);
      return {
        totalBackups: 0,
        lastBackupTime: '',
        totalSize: 0,
        backupHistory: []
      };
    }
  }

  /**
   * Export backup to file
   */
  async exportBackup(backupId: string) {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }
      
      const dataStr = JSON.stringify(backup, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `backup-${backupId}-${new Date().toISOString()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      console.log(`Backup ${backupId} exported successfully`);
      
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Import backup from file
   */
  async importBackup(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as Backup;
      
      // Verify backup structure
      if (!backup.id || !backup.data || !backup.checksum) {
        throw new Error('Invalid backup file format');
      }
      
      // Store imported backup
      await this.storeBackup(backup);
      
      console.log(`Backup ${backup.id} imported successfully`);
      return true;
      
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  
  private generateBackupId(): string {
    return `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private async compressData(data: unknown): Promise<any> {
    // Simple compression using JSON stringify with minimal whitespace
    // In production, use a proper compression library like pako
    return JSON.stringify(data);
  }
  
  private async decompressData(data: unknown): Promise<any> {
    // Decompress data
    return typeof data === 'string' ? JSON.parse(data) : data;
  }
  
  private async encryptData(data: unknown): Promise<any> {
    // In production, implement proper encryption
    // For now, just base64 encode
    return btoa(JSON.stringify(data));
  }
  
  private async decryptData(data: unknown): Promise<any> {
    // Decrypt data
    return JSON.parse(atob(data as string));
  }
  
  private async calculateChecksum(data: string): Promise<string> {
    // Simple checksum using hash
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  
  private async storeBackup(backup: Backup) {
    const key = `backup_${backup.id}`;
    
    // Store in localStorage for now
    // In production, use IndexedDB or external storage
    try {
      localStorage.setItem(key, JSON.stringify(backup));
    } catch (error) {
      // Handle storage quota exceeded
      console.error('Failed to store backup:', error);
      
      // Try to free up space by removing oldest backup
      await this.removeOldestBackup();
      
      // Retry
      localStorage.setItem(key, JSON.stringify(backup));
    }
  }
  
  private async getBackup(backupId: string): Promise<Backup | null> {
    const key = `backup_${backupId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  
  private async cleanupOldBackups() {
    const metadata = await this.getAvailableBackups();
    const backups = metadata.backupHistory
      .filter(b => b.status === 'success')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Remove backups beyond max limit
    if (backups.length > this.config.maxBackups) {
      const toRemove = backups.slice(this.config.maxBackups);
      for (const backup of toRemove) {
        const key = `backup_${backup.id}`;
        localStorage.removeItem(key);
      }
    }
  }
  
  private async removeOldestBackup() {
    const metadata = await this.getAvailableBackups();
    const oldestBackup = metadata.backupHistory
      .filter(b => b.status === 'success')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    
    if (oldestBackup) {
      const key = `backup_${oldestBackup.id}`;
      localStorage.removeItem(key);
    }
  }
  
  private async clearCurrentData() {
    // Clear all form submissions from storage
    // This is a placeholder - implement based on your data storage
    localStorage.removeItem('form_submissions');
    localStorage.removeItem('analytics_events');
  }
  
  private async updateBackupMetadata(historyItem: BackupHistoryItem) {
    const metadata = await this.getAvailableBackups();
    
    metadata.backupHistory.push(historyItem);
    metadata.totalBackups = metadata.backupHistory.filter(b => b.status === 'success').length;
    metadata.lastBackupTime = historyItem.timestamp;
    
    if (historyItem.size) {
      metadata.totalSize += historyItem.size;
    }
    
    // Keep only last 100 history items
    if (metadata.backupHistory.length > 100) {
      metadata.backupHistory = metadata.backupHistory.slice(-100);
    }
    
    localStorage.setItem('backup_metadata', JSON.stringify(metadata));
  }
  
  private setupEventListeners() {
    // Backup on important events
    window.addEventListener('beforeunload', () => {
      if (this.hasUnsavedChanges()) {
        this.performBackup('event');
      }
    });
    
    // Backup on form submission
    window.addEventListener('formSubmitted', () => {
      this.performBackup('event');
    });
  }
  
  private hasUnsavedChanges(): boolean {
    // Check if there are unsaved changes
    // This is a placeholder - implement based on your app logic
    return false;
  }
  
  private notifyBackupStatus(status: 'success' | 'failed', backupId: string, duration: number, error?: unknown) {
    window.dispatchEvent(new CustomEvent('backupStatus', {
      detail: { status, backupId, duration, error }
    }));
  }
  
  private notifyRestoreStatus(status: 'success' | 'failed', backupId: string, error?: unknown) {
    window.dispatchEvent(new CustomEvent('restoreStatus', {
      detail: { status, backupId, error }
    }));
  }

  /**
   * Stop automated backups
   */
  stop() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = null;
    }
  }
}

// Export singleton instance
export const backupService = new BackupService();

// Initialize on app start if enabled
if (typeof window !== 'undefined' && import.meta.env.VITE_ENABLE_BACKUPS !== 'false') {
  backupService.initialize();
}