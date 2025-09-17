/**
 * Enhanced Retrieval Tool
 * 
 * Advanced knowledge base search using vector embeddings and semantic search.
 * This replaces the mock retrieval tool with real RAG capabilities.
 */

import { AgentTool } from './types';
import { RAGService } from '../rag/RAGService';

export const enhancedRetrievalTool: AgentTool = {
  id: 'enhanced-knowledge-search',
  name: 'Enhanced Knowledge Search',
  description: 'Advanced semantic search using vector embeddings for comprehensive knowledge retrieval.',
  category: 'information',
  parameters: {
    type: 'object',
    properties: {
      query: { 
        type: 'string', 
        description: 'The search query string',
        required: true
      },
      topK: { 
        type: 'integer', 
        description: 'Number of results to return (1-10)',
        default: 5
      },
      category: {
        type: 'string',
        description: 'Knowledge category to search in (funding, market-research, investment, business-planning, valuation, metrics, validation, pitch-deck)',
        default: 'all'
      },
      threshold: {
        type: 'number',
        description: 'Similarity threshold (0.0-1.0)',
        default: 0.1
      },
      context: {
        type: 'string',
        description: 'Additional context to improve search relevance',
        default: ''
      },
      includeMetadata: {
        type: 'boolean',
        description: 'Include document metadata in results',
        default: true
      }
    },
    required: ['query']
  },
  async execute({ 
    query, 
    topK = 5, 
    category = 'all', 
    threshold = 0.1, 
    context = '', 
    includeMetadata = true 
  }: { 
    query: string; 
    topK?: number; 
    category?: string;
    threshold?: number;
    context?: string;
    includeMetadata?: boolean;
  }): Promise<any> {
    try {
      console.log(`🔍 Enhanced retrievalTool called with query="${query}", topK=${topK}, category="${category}"`);
      
      const ragService = RAGService.getInstance();
      
      // Perform the search
      const searchResult = await ragService.search({
        query,
        context,
        category: category === 'all' ? undefined : category,
        topK: Math.min(Math.max(topK, 1), 10), // Clamp between 1 and 10
        threshold,
        includeMetadata
      });

      if (!searchResult.success) {
        return {
          success: false,
          error: searchResult.error || 'Search failed'
        };
      }

      // Format results for agent consumption
      const formattedResults = searchResult.data!.results.map((result, index) => ({
        id: result.document.id,
        title: result.document.metadata.title,
        content: result.document.content,
        similarity: Math.round(result.similarity * 100) / 100,
        rank: result.rank,
        metadata: includeMetadata ? {
          category: result.document.metadata.category,
          source: result.document.metadata.source,
          timestamp: result.document.metadata.timestamp,
          tags: result.document.metadata.tags
        } : undefined
      }));

      return {
        success: true,
        data: {
          query,
          category: category === 'all' ? 'all' : category,
          results: formattedResults,
          totalResults: searchResult.data!.totalResults,
          searchTime: searchResult.data!.processingTime,
          metadata: {
            source: 'enhanced-rag-system',
            timestamp: searchResult.data!.metadata.timestamp,
            version: '2.0.0',
            threshold: searchResult.data!.metadata.threshold
          }
        }
      };
    } catch {
      console.error('Enhanced retrieval tool error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};
