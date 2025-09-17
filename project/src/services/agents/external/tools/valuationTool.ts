import { AgentTool } from '../types';

/**
 * valuationTool
 *
 * Estimates a startup’s valuation using simple revenue multiples.
 * Inputs: industry, annual revenue (USD), and year‑over‑year growth rate.
 * Returns: an estimated valuation range (low/high).  Industry multiples are
 * drawn from public market comparables as of 2024.  Replace this with
 * calls to a financial data provider for production use.
 */

const valuationMultiples: Record<string, number> = {
  'ai': 10,
  'fintech': 12,
  'healthcare': 8,
  'gaming': 7,
  'blockchain': 15
};

export const valuationTool: AgentTool = {
  id: 'valuation-estimator',
  name: 'Valuation Estimator',
  description: 'Estimates company valuation based on revenue, growth and industry multiples.',
  category: 'finance',
  parameters: {
    type: 'object',
    properties: {
      industry: { type: 'string', description: 'Industry (e.g. ai, fintech)' },
      revenue: { type: 'number', description: 'Annual revenue in millions USD' },
      growth: { type: 'number', description: 'Year‑over‑year growth rate (0.2 = 20%)' }
    },
    required: ['industry', 'revenue', 'growth']
  },
  async execute({ industry, revenue, growth }: { industry: string; revenue: number; growth: number }): Promise<{ low: number; high: number }> {
    const mult = valuationMultiples[industry.toLowerCase()];
    if (!mult) {
      throw new Error(`No valuation multiple available for industry '${industry}'.`);
    }
    // Adjust multiple slightly based on growth rate (higher growth → higher multiple)
    const adjustedMult = mult * (1 + growth);
    const baseValuation = revenue * adjustedMult;
    // Provide a range +/- 20%
    const low = parseFloat((baseValuation * 0.8).toFixed(2));
    const high = parseFloat((baseValuation * 1.2).toFixed(2));
    return { low, high };
  }
};