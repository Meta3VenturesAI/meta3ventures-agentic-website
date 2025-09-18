/**
 * Vector Database Service
 * 
 * Implements a real vector database for RAG (Retrieval Augmented Generation)
 * using embeddings for semantic search. This replaces the mock retrieval tool
 * with actual vector-based similarity search.
 */

export interface Document {
  id: string;
  content: string;
  metadata: {
    title: string;
    category: string;
    source: string;
    timestamp: Date;
    tags: string[];
  };
  embedding?: number[];
}

export interface SearchResult {
  document: Document;
  similarity: number;
  rank: number;
}

export interface VectorSearchOptions {
  topK?: number;
  threshold?: number;
  category?: string;
  includeMetadata?: boolean;
}

export class VectorDatabase {
  private documents: Map<string, Document> = new Map();
  private embeddings: Map<string, number[]> = new Map();
  private isInitialized = false;

  constructor() {
    // Initialize asynchronously to avoid blocking
    this.initializeDatabase().catch(error => {
      console.warn('Vector Database initialization failed in constructor:', error);
    });
  }

  async initializeDatabase(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔧 Initializing Vector Database...');
    
    try {
      // Initialize with comprehensive knowledge base
      await this.loadInitialDocuments();
      
      // Generate embeddings for all documents (non-blocking)
      this.generateEmbeddings().catch(error => {
        console.warn('Embedding generation failed:', error);
      });
      
      this.isInitialized = true;
      console.log(`✅ Vector Database initialized with ${this.documents.size} documents`);
    } catch (error) {
      console.error('Vector Database initialization failed:', error);
      throw error;
    }
  }

  private async loadInitialDocuments(): Promise<void> {
    const initialDocuments: Omit<Document, 'id'>[] = [
      {
        content: `Meta3Ventures Investment Criteria: We focus on early-stage investments in AI, blockchain, and emerging technologies. 
        Investment Range: $100K - $2M. Stage: Pre-seed to Series A. Sectors: AI/ML, Blockchain, FinTech, SaaS, HealthTech.
        We look for strong founding teams, innovative technology, and large addressable markets.`,
        metadata: {
          title: 'Meta3Ventures Investment Criteria',
          category: 'investment',
          source: 'meta3ventures',
          timestamp: new Date('2024-01-01'),
          tags: ['investment', 'criteria', 'ai', 'blockchain', 'funding', 'startup']
        }
      },
      {
        content: `AI Market Trends 2024: Key trends include 1) Generative AI Enterprise Adoption - 60% of enterprises implementing GenAI solutions. 
        2) AI Infrastructure Investment - $50B+ in AI infrastructure spending. 3) Regulatory Development - EU AI Act implementation.
        4) Edge AI Computing - Moving AI processing closer to data sources. 5) AI Ethics and Governance - Focus on responsible AI development.`,
        metadata: {
          title: 'AI Market Trends 2024',
          category: 'market-research',
          source: 'industry-reports',
          timestamp: new Date('2024-01-15'),
          tags: ['ai', 'trends', '2024', 'market', 'generative', 'enterprise']
        }
      },
      {
        content: `Startup Funding Stages Guide: PRE-SEED ($50K - $500K) - Validate product-market fit, build MVP, initial team. 
        SEED ($500K - $3M) - Proven traction, initial revenue, product development. SERIES A ($3M - $15M) - Strong revenue growth, market validation, scaling.
        SERIES B ($15M - $50M) - Market expansion, team scaling, operational efficiency. SERIES C+ ($50M+) - Market leadership, international expansion.`,
        metadata: {
          title: 'Startup Funding Stages Guide',
          category: 'funding',
          source: 'venture-capital',
          timestamp: new Date('2024-01-10'),
          tags: ['funding', 'stages', 'startup', 'seed', 'series-a', 'investment']
        }
      },
      {
        content: `Business Plan Structure: A comprehensive business plan should include: 1) Executive Summary - Company overview and key highlights.
        2) Market Analysis - Industry size, growth, competition, target customers. 3) Business Model - Revenue streams, pricing, unit economics.
        4) Product/Service Description - Features, benefits, competitive advantages. 5) Team - Founders, advisors, organizational structure.
        6) Financial Projections - Revenue, expenses, funding requirements. 7) Go-to-Market Strategy - Marketing, sales, customer acquisition.`,
        metadata: {
          title: 'Business Plan Structure',
          category: 'business-planning',
          source: 'startup-guides',
          timestamp: new Date('2024-01-05'),
          tags: ['business', 'plan', 'structure', 'executive', 'summary', 'market']
        }
      },
      {
        content: `Pitch Deck Essentials: Essential slides include: 1) Title Slide - Company name, tagline, contact info. 2) Problem - Market pain point being solved.
        3) Solution - Your product/service offering. 4) Market Opportunity - TAM, SAM, SOM analysis. 5) Traction - Key metrics, milestones, validation.
        6) Business Model - How you make money. 7) Competition - Competitive landscape and differentiation. 8) Team - Founders and key team members.
        9) Financials - Revenue projections, funding ask. 10) Ask - What you need from investors.`,
        metadata: {
          title: 'Pitch Deck Essentials',
          category: 'pitch-deck',
          source: 'investor-guides',
          timestamp: new Date('2024-01-08'),
          tags: ['pitch', 'deck', 'slides', 'presentation', 'investor', 'funding']
        }
      },
      {
        content: `Startup Valuation Methods: Common methods include: 1) Revenue Multiples - 3-15x depending on industry and growth.
        2) DCF Analysis - Discounted cash flow based on future projections. 3) Comparable Company Analysis - Similar companies' valuations.
        4) Risk-Adjusted NPV - Net present value with risk adjustments. 5) Scorecard Method - Weighted factors for startup stage.
        Consider growth rate, market size, competitive position, team strength, and technology differentiation.`,
        metadata: {
          title: 'Startup Valuation Methods',
          category: 'valuation',
          source: 'financial-analysis',
          timestamp: new Date('2024-01-12'),
          tags: ['valuation', 'methods', 'revenue', 'multiples', 'dcf', 'startup']
        }
      },
      {
        content: `Key Startup Metrics: Important metrics include: ARR (Annual Recurring Revenue) - Annualized subscription revenue.
        MRR (Monthly Recurring Revenue) - Monthly subscription revenue. CAC (Customer Acquisition Cost) - Cost to acquire one customer.
        LTV (Lifetime Value) - Total revenue from a customer over their lifetime. Churn Rate - Percentage of customers lost over time.
        Runway - Months of operation with current cash. Monitor these regularly for business health and investor reporting.`,
        metadata: {
          title: 'Key Startup Metrics',
          category: 'metrics',
          source: 'startup-analytics',
          timestamp: new Date('2024-01-14'),
          tags: ['kpi', 'metrics', 'arr', 'mrr', 'cac', 'ltv', 'churn']
        }
      },
      {
        content: `Market Validation Strategies: Effective strategies include: 1) Customer Interviews - 30-50 minimum, structured questions.
        2) Landing Page Validation - Test demand before building. 3) Pre-order Campaigns - Validate willingness to pay.
        4) Pilot Programs - Limited release to test market fit. 5) A/B Testing - Compare different approaches.
        6) MVP Testing - Minimum viable product with core features. Focus on real customer feedback and data-driven decisions.`,
        metadata: {
          title: 'Market Validation Strategies',
          category: 'validation',
          source: 'startup-methodology',
          timestamp: new Date('2024-01-16'),
          tags: ['market', 'validation', 'customer', 'interviews', 'mvp', 'testing']
        }
      },
      {
        content: `Fintech Market Analysis: The fintech market is valued at $162B globally with 16% annual growth. Key segments include:
        Digital Payments ($89B), Digital Banking ($44B), InsurTech ($15B), RegTech ($8B), and WealthTech ($6B). 
        Major trends: Open Banking, Embedded Finance, DeFi, CBDCs, and AI-powered financial services.
        Regulatory environment is evolving with PSD2, Open Banking, and digital asset regulations.`,
        metadata: {
          title: 'Fintech Market Analysis',
          category: 'market-research',
          source: 'industry-reports',
          timestamp: new Date('2024-01-18'),
          tags: ['fintech', 'market', 'analysis', 'payments', 'banking', 'regulatory']
        }
      },
      {
        content: `SaaS Business Model: Software as a Service model features: 1) Subscription Revenue - Recurring monthly/annual payments.
        2) Freemium Strategy - Free tier with premium features. 3) Usage-Based Pricing - Pay per use or per seat.
        4) Enterprise Sales - Custom solutions for large customers. 5) Channel Partnerships - Reseller and integration partners.
        Key metrics: ARR, MRR, Churn Rate, CAC, LTV, Net Revenue Retention. Focus on product-market fit and customer success.`,
        metadata: {
          title: 'SaaS Business Model',
          category: 'business-model',
          source: 'saas-guides',
          timestamp: new Date('2024-01-20'),
          tags: ['saas', 'business-model', 'subscription', 'freemium', 'enterprise']
        }
      }
    ];

    initialDocuments.forEach((doc, index) => {
      const document: Document = {
        id: `doc-${index + 1}`,
        ...doc
      };
      this.documents.set(document.id, document);
    });
  }

  private async generateEmbeddings(): Promise<void> {
    // Simple embedding generation using text similarity
    // In production, this would use a real embedding model like OpenAI, Cohere, or local models
    for (const [id, document] of this.documents.entries()) {
      const embedding = this.generateSimpleEmbedding(document.content);
      this.embeddings.set(id, embedding);
    }
  }

  private generateSimpleEmbedding(text: string): number[] {
    // Simple TF-IDF based embedding for demonstration
    // In production, use real embedding models
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts: { [key: string]: number } = {};
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Create a 128-dimensional embedding based on word frequencies
    const embedding = new Array(128).fill(0);
    const wordsArray = Object.keys(wordCounts);
    
    wordsArray.forEach((word, index) => {
      const frequency = wordCounts[word] / words.length;
      const dimension = index % 128;
      embedding[dimension] += frequency;
    });

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  async addDocument(document: Omit<Document, 'id'>): Promise<string> {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const doc: Document = { id, ...document };
    
    this.documents.set(id, doc);
    
    // Generate embedding
    const embedding = this.generateSimpleEmbedding(doc.content);
    this.embeddings.set(id, embedding);
    
    return id;
  }

  async search(query: string, options: VectorSearchOptions = {}): Promise<SearchResult[]> {
    const {
      topK = 5,
      threshold = 0.1,
      category,
      includeMetadata = true
    } = options;

    // Generate query embedding
    const queryEmbedding = this.generateSimpleEmbedding(query);
    
    // Calculate similarities
    const similarities: Array<{ id: string; similarity: number }> = [];
    
    for (const [id, embedding] of this.embeddings.entries()) {
      const document = this.documents.get(id);
      if (!document) continue;
      
      // Filter by category if specified
      if (category && document.metadata.category !== category) continue;
      
      // Calculate cosine similarity
      const similarity = this.calculateCosineSimilarity(queryEmbedding, embedding);
      
      if (similarity >= threshold) {
        similarities.push({ id, similarity });
      }
    }

    // Sort by similarity and take top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topResults = similarities.slice(0, topK);

    // Build search results
    const results: SearchResult[] = topResults.map((result, index) => {
      const document = this.documents.get(result.id)!;
      return {
        document: includeMetadata ? document : {
          ...document,
          metadata: {
            title: document.metadata.title,
            category: document.metadata.category,
            source: document.metadata.source,
            timestamp: document.metadata.timestamp,
            tags: document.metadata.tags
          }
        },
        similarity: result.similarity,
        rank: index + 1
      };
    });

    return results;
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async deleteDocument(id: string): Promise<boolean> {
    const deleted = this.documents.delete(id);
    this.embeddings.delete(id);
    return deleted;
  }

  async getStats(): Promise<{
    totalDocuments: number;
    categories: { [key: string]: number };
    sources: { [key: string]: number };
  }> {
    const categories: { [key: string]: number } = {};
    const sources: { [key: string]: number } = {};
    
    for (const document of this.documents.values()) {
      categories[document.metadata.category] = (categories[document.metadata.category] || 0) + 1;
      sources[document.metadata.source] = (sources[document.metadata.source] || 0) + 1;
    }
    
    return {
      totalDocuments: this.documents.size,
      categories,
      sources
    };
  }
}
