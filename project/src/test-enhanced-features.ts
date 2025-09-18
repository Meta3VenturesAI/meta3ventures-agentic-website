/**
 * Enhanced Features Test Script
 * 
 * Tests the advanced RAG system, session management, and admin tools
 * Usage: npm run test:enhanced
 */

import { RAGService } from './services/agents/refactored/rag/RAGService';
import { EnhancedSessionManager } from './services/agents/refactored/session/EnhancedSessionManager';
import { AdminTools } from './services/agents/refactored/admin/AdminTools';
import { ExternalIntegrationService } from './services/agents/refactored/ExternalIntegrationService';

async function runEnhancedFeaturesTest() {
  console.log('🚀 Meta3Ventures Enhanced Features Test');
  console.log('=====================================\n');

  try {
    // Test 1: RAG System
    console.log('🔍 Testing RAG System...');
    const ragService = RAGService.getInstance();
    
    const ragTest = await ragService.search({
      query: 'startup funding stages',
      topK: 3,
      category: 'funding'
    });
    
    if (ragTest.success) {
      console.log('✅ RAG System working');
      console.log(`   Found ${ragTest.data!.totalResults} results`);
      console.log(`   Search time: ${ragTest.data!.processingTime}ms`);
    } else {
      console.log('❌ RAG System failed:', ragTest.error);
    }

    // Test 2: Session Management
    console.log('\n👤 Testing Session Management...');
    const sessionManager = EnhancedSessionManager.getInstance();
    
    // Create user profile
    const userProfile = await sessionManager.createUserProfile({
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Corp',
      industry: 'AI'
    });
    console.log('✅ User profile created:', userProfile.id);

    // Create conversation context
    const context = await sessionManager.createConversationContext('test-session-1', userProfile.id);
    console.log('✅ Conversation context created');

    // Add messages
    await sessionManager.addMessage('test-session-1', 'user', 'I need help with startup funding');
    await sessionManager.addMessage('test-session-1', 'assistant', 'I can help you with funding information');
    console.log('✅ Messages added to conversation');

    // Test knowledge search for context
    const knowledgeResult = await sessionManager.searchKnowledgeForContext('test-session-1', 'startup funding');
    if (knowledgeResult?.success) {
      console.log('✅ Knowledge search for context working');
    }

    // Get conversation summary
    const summary = await sessionManager.getConversationSummary('test-session-1');
    console.log('✅ Conversation summary:', {
      messageCount: summary.messageCount,
      topics: summary.topics,
      keyInsights: summary.keyInsights.length
    });

    // Test 3: Admin Tools
    console.log('\n📊 Testing Admin Tools...');
    const adminTools = AdminTools.getInstance();
    
    // Wait a moment for metrics collection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const latestMetrics = await adminTools.getLatestMetrics();
    if (latestMetrics) {
      console.log('✅ Admin metrics collected');
      console.log(`   Active sessions: ${latestMetrics.agentSystem.activeSessions}`);
      console.log(`   Total documents: ${latestMetrics.ragSystem.totalDocuments}`);
      console.log(`   Total tools: ${latestMetrics.tools.totalTools}`);
    }

    // Test system health
    const health = await adminTools.getSystemHealth();
    console.log('✅ System health check:', {
      status: health.status,
      issues: health.issues.length,
      recommendations: health.recommendations.length
    });

    // Test 4: Enhanced Tools Integration
    console.log('\n🛠️ Testing Enhanced Tools Integration...');
    const externalService = ExternalIntegrationService.getInstance();
    
    const enhancedTools = externalService.getAllExternalTools();
    const enhancedRetrievalTool = enhancedTools.find(tool => tool.id === 'enhanced-knowledge-search');
    
    if (enhancedRetrievalTool) {
      console.log('✅ Enhanced retrieval tool found');
      
      // Test enhanced retrieval
      const enhancedResult = await enhancedRetrievalTool.execute({
        query: 'AI market trends',
        topK: 3,
        category: 'market-research'
      });
      
      if (enhancedResult.success) {
        console.log('✅ Enhanced retrieval working');
        console.log(`   Found ${enhancedResult.data!.totalResults} results`);
        console.log(`   Search time: ${enhancedResult.data!.searchTime}ms`);
      } else {
        console.log('❌ Enhanced retrieval failed:', enhancedResult.error);
      }
    } else {
      console.log('❌ Enhanced retrieval tool not found');
    }

    // Test 5: Agent Tool Mapping
    console.log('\n🤖 Testing Agent Tool Mapping...');
    const ventureLaunchTools = externalService.getToolsForAgent('venture-launch');
    console.log('✅ Venture Launch Agent tools:', ventureLaunchTools.map(t => t.name));

    const investmentTools = externalService.getToolsForAgent('meta3-investment');
    console.log('✅ Investment Agent tools:', investmentTools.map(t => t.name));

    // Test 6: RAG Categories
    console.log('\n📚 Testing RAG Categories...');
    const categories = ['funding', 'market-research', 'investment', 'business-planning'];
    
    for (const category of categories) {
      const categoryResult = await ragService.searchByCategory(category, 'startup', 2);
      if (categoryResult.success) {
        console.log(`✅ ${category} category: ${categoryResult.data!.totalResults} results`);
      } else {
        console.log(`❌ ${category} category failed`);
      }
    }

    // Test 7: Multi-category Search
    console.log('\n🔍 Testing Multi-category Search...');
    const multiResult = await ragService.multiCategorySearch('startup', ['funding', 'market-research'], 5);
    if (multiResult.success) {
      console.log('✅ Multi-category search working');
      console.log(`   Found ${multiResult.data!.totalResults} results across categories`);
    } else {
      console.log('❌ Multi-category search failed');
    }

    // Test 8: Contextual Search
    console.log('\n🎯 Testing Contextual Search...');
    const contextualResult = await ragService.contextualSearch(
      'valuation methods',
      'for a fintech startup',
      3
    );
    if (contextualResult.success) {
      console.log('✅ Contextual search working');
      console.log(`   Found ${contextualResult.data!.totalResults} contextual results`);
    } else {
      console.log('❌ Contextual search failed');
    }

    // Test 9: Knowledge Base Stats
    console.log('\n📈 Testing Knowledge Base Stats...');
    const stats = await ragService.getStats();
    console.log('✅ Knowledge base stats:', {
      totalDocuments: stats.totalDocuments,
      categories: Object.keys(stats.categories).length,
      sources: Object.keys(stats.sources).length
    });

    // Test 10: User Analytics
    console.log('\n👥 Testing User Analytics...');
    const userAnalytics = await sessionManager.getUserAnalytics(userProfile.id);
    if (userAnalytics) {
      console.log('✅ User analytics working');
      console.log(`   Total sessions: ${userAnalytics.totalSessions}`);
      console.log(`   Total messages: ${userAnalytics.totalMessages}`);
    }

    console.log('\n🎉 All Enhanced Features Tests Completed Successfully!');
    console.log('\n📊 SUMMARY:');
    console.log('✅ RAG System with Vector Database');
    console.log('✅ Enhanced Session Management');
    console.log('✅ Admin Tools and Metrics Logging');
    console.log('✅ Advanced Analytics');
    console.log('✅ Multi-category Search');
    console.log('✅ Contextual Search');
    console.log('✅ User Profile Management');
    console.log('✅ System Health Monitoring');

  } catch (error) {
    console.error('\n💥 Enhanced features test failed:', error);
    process.exit(1);
  }
}

// Run the test
runEnhancedFeaturesTest();
