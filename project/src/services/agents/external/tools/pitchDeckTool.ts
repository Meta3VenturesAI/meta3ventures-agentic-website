import { AgentTool } from '../types';

/**
 * pitchDeckTool
 *
 * Creates a simple pitch deck structure for a startup.  Each slide is
 * represented as an object with a title and bullet points.  Real
 * implementations should generate actual presentation files (e.g. via
 * PptxGenJS).  Here we return a JSON structure for demonstration.
 */
export const pitchDeckTool: AgentTool = {
  id: 'pitch-deck-generator',
  name: 'Pitch Deck Generator',
  description: 'Creates a basic pitch deck outline for a startup.',
  category: 'document',
  parameters: {
    type: 'object',
    properties: {
      company: { type: 'string', description: 'Company name' },
      industry: { type: 'string', description: 'Industry or sector' },
      product: { type: 'string', description: 'Product or service description' },
      traction: { type: 'string', description: 'Key traction metrics or milestones' }
    },
    required: ['company', 'industry', 'product', 'traction']
  },
  async execute({ company, industry, product, traction }: { company: string; industry: string; product: string; traction: string }): Promise<any> {
    return [
      { title: `${company}: Introduction`, bullets: [`Industry: ${industry}`, `Mission: Describe the mission statement`] },
      { title: 'Problem & Solution', bullets: ['Problem: Describe the pain point', `Solution: ${product}`] },
      { title: 'Market Opportunity', bullets: ['Size and growth of the market', 'Target customer segments'] },
      { title: 'Traction', bullets: [traction] },
      { title: 'Business Model', bullets: ['Revenue streams', 'Pricing strategy'] },
      { title: 'Team', bullets: ['Founders and key team members'] },
      { title: 'Financials & Ask', bullets: ['Current financials', 'Funding requirements', 'Use of funds'] }
    ];
  }
};