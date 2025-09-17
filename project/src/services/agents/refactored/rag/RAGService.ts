/**
 * RAG (Retrieval Augmented Generation) Service
 * 
 * Provides advanced retrieval capabilities using vector embeddings
 * and semantic search for enhanced agent responses.
 */

import { VectorDatabase, Document, SearchResult, VectorSearchOptions } from './VectorDatabase';

export interface RAGQuery {
  query: string;
  context?: string;
  category?: string;
  topK?: number;
  threshold?: number;
  includeMetadata?: boolean;
}

export interface RAGResponse {
  success: boolean;
  data?: {
    query: string;
    results: SearchResult[];
    totalResults: number;
    processingTime: number;
    metadata: {
      timestamp: string;
      category?: string;
      threshold: number;
    };
  };
  error?: string;
}

export interface KnowledgeBaseStats {
  totalDocuments: number;
  categories: { [key: string]: number };
  sources: { [key: string]: number };
  lastUpdated: Date;
}

export class RAGService {
  private static instance: RAGService;
  private vectorDB: VectorDatabase;
  private isInitialized = false;

  constructor() {
    this.vectorDB = new VectorDatabase();
  }

  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🔧 Initializing RAG Service...');
    
    try {
      // Wait for vector database initialization with timeout
      await Promise.race([
        this.vectorDB.initializeDatabase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Vector DB initialization timeout')), 5000)
        )
      ]);
      
      this.isInitialized = true;
      console.log('✅ RAG Service initialized');
    } catch {
      console.warn('RAG Service initialization failed, continuing with limited functionality:', error);
      this.isInitialized = true; // Allow service to work with limited functionality
    }
  }

  async search(query: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const searchOptions: VectorSearchOptions = {
        topK: query.topK || 5,
        threshold: query.threshold || 0.1,
        category: query.category,
        includeMetadata: query.includeMetadata !== false
      };

      const results = await this.vectorDB.search(query.query, searchOptions);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          query: query.query,
          results,
          totalResults: results.length,
          processingTime,
          metadata: {
            timestamp: new Date().toISOString(),
            category: query.category,
            threshold: searchOptions.threshold!
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async addKnowledge(document: Omit<Document, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const id = await this.vectorDB.addDocument(document);
      return { success: true, id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getKnowledge(id: string): Promise<Document | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await this.vectorDB.getDocument(id);
    } catch {
      console.error('Error retrieving knowledge:', error);
      return null;
    }
  }

  async getAllKnowledge(): Promise<Document[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await this.vectorDB.getAllDocuments();
    } catch {
      console.error('Error retrieving all knowledge:', error);
      return [];
    }
  }

  async deleteKnowledge(id: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await this.vectorDB.deleteDocument(id);
    } catch {
      console.error('Error deleting knowledge:', error);
      return false;
    }
  }

  async getStats(): Promise<KnowledgeBaseStats> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const stats = await this.vectorDB.getStats();
      return {
        ...stats,
        lastUpdated: new Date()
      };
    } catch {
      console.error('Error getting stats:', error);
      return {
        totalDocuments: 0,
        categories: {},
        sources: {},
        lastUpdated: new Date()
      };
    }
  }

  async searchByCategory(category: string, query: string, topK: number = 5): Promise<RAGResponse> {
    return this.search({
      query,
      category,
      topK,
      threshold: 0.1,
      includeMetadata: true
    });
  }

  async searchFunding(query: string): Promise<RAGResponse> {
    return this.searchByCategory('funding', query, 3);
  }

  async searchMarketResearch(query: string): Promise<RAGResponse> {
    return this.searchByCategory('market-research', query, 3);
  }

  async searchInvestment(query: string): Promise<RAGResponse> {
    return this.searchByCategory('investment', query, 3);
  }

  async searchBusinessPlanning(query: string): Promise<RAGResponse> {
    return this.searchByCategory('business-planning', query, 3);
  }

  async searchValuation(query: string): Promise<RAGResponse> {
    return this.searchByCategory('valuation', query, 3);
  }

  async searchMetrics(query: string): Promise<RAGResponse> {
    return this.searchByCategory('metrics', query, 3);
  }

  async searchValidation(query: string): Promise<RAGResponse> {
    return this.searchByCategory('validation', query, 3);
  }

  async searchPitchDeck(query: string): Promise<RAGResponse> {
    return this.searchByCategory('pitch-deck', query, 3);
  }

  // Advanced search with context
  async contextualSearch(query: string, context: string, topK: number = 5): Promise<RAGResponse> {
    // Combine query and context for better search
    const enhancedQuery = `${query} ${context}`.trim();
    
    return this.search({
      query: enhancedQuery,
      context,
      topK,
      threshold: 0.15, // Slightly higher threshold for contextual search
      includeMetadata: true
    });
  }

  // Multi-category search
  async multiCategorySearch(query: string, categories: string[], topK: number = 5): Promise<RAGResponse> {
    const allResults: SearchResult[] = [];
    
    for (const category of categories) {
      const categoryResults = await this.searchByCategory(category, query, topK);
      if (categoryResults.success && categoryResults.data) {
        allResults.push(...categoryResults.data.results);
      }
    }

    // Sort by similarity and take top K
    allResults.sort((a, b) => b.similarity - a.similarity);
    const topResults = allResults.slice(0, topK);

    return {
      success: true,
      data: {
        query,
        results: topResults,
        totalResults: topResults.length,
        processingTime: 0, // Will be calculated by individual searches
        metadata: {
          timestamp: new Date().toISOString(),
          category: categories.join(','),
          threshold: 0.1
        }
      }
    };
  }
}
