/**
 * Auto-save functionality for forms
 * Saves form progress to localStorage automatically
 */

export interface AutoSaveData {
  formId: string;
  formType: 'application' | 'contact' | 'other';
  currentStep?: number;
  data: Record<string, any>;
  lastSaved: string;
  sessionId: string;
  completionPercentage: number;
}

class AutoSaveManager {
  private static STORAGE_KEY = 'meta3_form_autosave';
  private static SAVE_INTERVAL = 30000; // 30 seconds
  private saveTimer: NodeJS.Timeout | null = null;
  private lastSaveTime: Date = new Date();

  /**
   * Save form data to localStorage
   */
  saveFormData(formId: string, data: Partial<AutoSaveData>): void {
    try {
      const existingSaves = this.getAllSaves();
      const sessionId = this.getSessionId();
      
      const saveData: AutoSaveData = {
        formId,
        formType: data.formType || 'other',
        currentStep: data.currentStep,
        data: data.data || {},
        lastSaved: new Date().toISOString(),
        sessionId,
        completionPercentage: data.completionPercentage || 0
      };

      existingSaves[formId] = saveData;
      localStorage.setItem(AutoSaveManager.STORAGE_KEY, JSON.stringify(existingSaves));
      this.lastSaveTime = new Date();
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('formAutoSaved', { 
        detail: { formId, timestamp: this.lastSaveTime }
      }));
    } catch (error) {
      console.error('Failed to auto-save form:', error);
    }
  }

  /**
   * Retrieve saved form data
   */
  getSavedData(formId: string): AutoSaveData | null {
    try {
      const saves = this.getAllSaves();
      return saves[formId] || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if there's a saved draft for a form
   */
  hasSavedDraft(formId: string): boolean {
    const saved = this.getSavedData(formId);
    return saved !== null && Object.keys(saved.data).length > 0;
  }

  /**
   * Clear saved data for a specific form
   */
  clearSavedData(formId: string): void {
    try {
      const saves = this.getAllSaves();
      delete saves[formId];
      localStorage.setItem(AutoSaveManager.STORAGE_KEY, JSON.stringify(saves));
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }

  /**
   * Get all saved forms
   */
  private getAllSaves(): Record<string, AutoSaveData> {
    try {
      const saved = localStorage.getItem(AutoSaveManager.STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(formId: string, getData: () => Partial<AutoSaveData>): void {
    this.stopAutoSave();
    
    this.saveTimer = setInterval(() => {
      const data = getData();
      if (data && Object.keys(data.data || {}).length > 0) {
        this.saveFormData(formId, data);
      }
    }, AutoSaveManager.SAVE_INTERVAL);
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }

  /**
   * Calculate form completion percentage
   */
  calculateCompletion(filledFields: number, totalFields: number): number {
    if (totalFields === 0) return 0;
    return Math.round((filledFields / totalFields) * 100);
  }

  /**
   * Get time since last save
   */
  getTimeSinceLastSave(): string {
    const now = new Date();
    const diff = now.getTime() - this.lastSaveTime.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  /**
   * Clean up old saves (older than 7 days)
   */
  cleanupOldSaves(): void {
    try {
      const saves = this.getAllSaves();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      Object.keys(saves).forEach(formId => {
        const saveDate = new Date(saves[formId].lastSaved);
        if (saveDate < sevenDaysAgo) {
          delete saves[formId];
        }
      });
      
      localStorage.setItem(AutoSaveManager.STORAGE_KEY, JSON.stringify(saves));
    } catch (error) {
      console.error('Failed to cleanup old saves:', error);
    }
  }

  /**
   * Check if draft should be restored (silently returns true if draft exists)
   */
  async promptRestoreDraft(formId: string): Promise<boolean> {
    const saved = this.getSavedData(formId);
    if (!saved) return false;
    
    // Silently restore if draft exists and is less than 7 days old
    const lastSaved = new Date(saved.lastSaved);
    const daysSinceLastSave = (Date.now() - lastSaved.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceLastSave < 7;
  }
  
  /**
   * Get draft info for display
   */
  getDraftInfo(formId: string): { lastSaved: Date; completionPercentage: number } | null {
    const saved = this.getSavedData(formId);
    if (!saved) return null;
    
    return {
      lastSaved: new Date(saved.lastSaved),
      completionPercentage: saved.completionPercentage || 0
    };
  }
}

// Export singleton instance
export const autoSaveManager = new AutoSaveManager();

// Clean up old saves on initialization
if (typeof window !== 'undefined') {
  autoSaveManager.cleanupOldSaves();
}