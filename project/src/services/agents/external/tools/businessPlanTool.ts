import { AgentTool } from '../types';

/**
 * businessPlanTool
 *
 * Generates a basic business plan outline given a company name, industry and
 * product description.  In a real implementation, you could use a
 * language model to flesh out the sections or assemble a templated
 * document with rich formatting (e.g. PDF or DOCX).  Here we return a
 * plain object for demonstration purposes.
 */
export const businessPlanTool: AgentTool = {
  id: 'business-plan-generator',
  name: 'Business Plan Generator',
  description: 'Generates a structured business plan outline for a given venture.',
  category: 'document',
  parameters: {
    type: 'object',
    properties: {
      company: { type: 'string', description: 'Company name' },
      industry: { type: 'string', description: 'Industry or sector' },
      product: { type: 'string', description: 'Brief description of the product or service' }
    },
    required: ['company', 'industry', 'product']
  },
  async execute({ company, industry, product }: { company: string; industry: string; product: string }): Promise<any> {
    return {
      company,
      industry,
      executiveSummary: `${company} is an innovative ${industry} startup focused on delivering ${product} to its target market.`,
      problem: 'Describe the problem your product solves.',
      solution: 'Describe your unique solution.',
      marketAnalysis: 'Summarise market size, growth rate and competitive landscape.',
      businessModel: 'Explain how you will make money.',
      goToMarket: 'Outline your marketing and sales strategy.',
      team: 'Highlight key team members and advisors.',
      financials: 'Provide revenue projections and funding requirements.'
    };
  }
};