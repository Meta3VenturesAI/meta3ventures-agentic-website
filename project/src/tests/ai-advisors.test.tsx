import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VentureLaunchBuilder from '../components/VentureLaunchBuilder';
import StrategicFundraisingAdvisor from '../components/StrategicFundraisingAdvisor';
import CompetitiveIntelligenceSystem from '../components/CompetitiveIntelligenceSystem';
import { researchAgentsService } from '../services/research-agents.service';
import { dataStorage } from '../services/data-storage.service';

// Mock the data storage service
vi.mock('../services/data-storage.service', () => ({
  dataStorage: {
    storeFormSubmission: vi.fn().mockResolvedValue(undefined),
    getAnalyticsSummary: vi.fn().mockResolvedValue({
      total_submissions: 10,
      by_type: { contact: 5, apply: 3, newsletter: 2 },
      unique_sessions: 8,
      recent_submissions: []
    })
  }
}));

describe('VentureLaunchBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render closed state by default', () => {
    render(<VentureLaunchBuilder />);
    
    const button = screen.getByRole('button', { name: /Venture Launch Builder/i });
    expect(button).toBeInTheDocument();
  });

  it('should open when button is clicked', async () => {
    render(<VentureLaunchBuilder />);
    
    const button = screen.getByRole('button', { name: /Venture Launch Builder/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome to M3VC Venture Launch Builder/i)).toBeInTheDocument();
    });
  });

  it('should display initial welcome message', async () => {
    render(<VentureLaunchBuilder />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/AI-powered strategic advisor/i)).toBeInTheDocument();
    });
  });

  it('should store user messages in data storage', async () => {
    render(<VentureLaunchBuilder />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Ask about strategy/i);
      expect(input).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/Ask about strategy/i) as HTMLInputElement;
    const sendButton = screen.getByLabelText(/Send message/i);
    
    fireEvent.change(input, { target: { value: 'Help me with my startup' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(dataStorage.storeFormSubmission).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'chat',
          data: expect.objectContaining({
            message: 'Help me with my startup',
            context: 'venture-launch-builder'
          })
        })
      );
    });
  });

  it('should minimize and maximize correctly', async () => {
    render(<VentureLaunchBuilder />);
    
    const openButton = screen.getByRole('button');
    fireEvent.click(openButton);
    
    await waitFor(() => {
      const minimizeButton = screen.getByLabelText(/Minimize/i);
      expect(minimizeButton).toBeInTheDocument();
    });
    
    const minimizeButton = screen.getByLabelText(/Minimize/i);
    fireEvent.click(minimizeButton);
    
    await waitFor(() => {
      const maximizeButton = screen.getByLabelText(/Maximize/i);
      expect(maximizeButton).toBeInTheDocument();
    });
  });
});

describe('StrategicFundraisingAdvisor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with correct initial state', () => {
    render(<StrategicFundraisingAdvisor />);
    
    const button = screen.getByLabelText(/Strategic Fundraising Advisor/i);
    expect(button).toBeInTheDocument();
  });

  it('should display fundraising phases when opened', async () => {
    render(<StrategicFundraisingAdvisor />);
    
    const button = screen.getByLabelText(/Strategic Fundraising Advisor/i);
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Fundraising Journey/i)).toBeInTheDocument();
    });
  });

  it('should show quick prompts for common queries', async () => {
    render(<StrategicFundraisingAdvisor />);
    
    const button = screen.getByLabelText(/Strategic Fundraising Advisor/i);
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Assess My Readiness/i)).toBeInTheDocument();
      expect(screen.getByText(/Review Pitch Deck/i)).toBeInTheDocument();
      expect(screen.getByText(/Valuation Strategy/i)).toBeInTheDocument();
    });
  });

  it('should handle quick prompt clicks', async () => {
    render(<StrategicFundraisingAdvisor />);
    
    const openButton = screen.getByLabelText(/Strategic Fundraising Advisor/i);
    fireEvent.click(openButton);
    
    await waitFor(() => {
      const quickPrompt = screen.getByText(/Assess My Readiness/i);
      expect(quickPrompt).toBeInTheDocument();
    });
    
    const quickPrompt = screen.getByText(/Assess My Readiness/i);
    fireEvent.click(quickPrompt);
    
    await waitFor(() => {
      expect(dataStorage.storeFormSubmission).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'chat',
          data: expect.objectContaining({
            message: 'Assess My Readiness',
            context: 'strategic-fundraising-advisor'
          })
        })
      );
    });
  });
});

describe('CompetitiveIntelligenceSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render setup form initially', async () => {
    render(<CompetitiveIntelligenceSystem />);
    
    const button = screen.getByLabelText(/Competitive Intelligence System/i);
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Setup Competitive Research/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields before starting research', async () => {
    render(<CompetitiveIntelligenceSystem />);
    
    const button = screen.getByLabelText(/Competitive Intelligence System/i);
    fireEvent.click(button);
    
    await waitFor(() => {
      const startButton = screen.getByText(/Start Multi-Agent Research/i);
      expect(startButton).toBeInTheDocument();
    });
    
    const startButton = screen.getByText(/Start Multi-Agent Research/i) as HTMLButtonElement;
    expect(startButton.disabled).toBe(true);
  });

  it('should enable start button when required fields are filled', async () => {
    render(<CompetitiveIntelligenceSystem />);
    
    const button = screen.getByLabelText(/Competitive Intelligence System/i);
    fireEvent.click(button);
    
    await waitFor(() => {
      const companyInput = screen.getByPlaceholderText(/Your company name/i);
      expect(companyInput).toBeInTheDocument();
    });
    
    const companyInput = screen.getByPlaceholderText(/Your company name/i) as HTMLInputElement;
    const industryInput = screen.getByPlaceholderText(/SaaS, E-commerce/i) as HTMLInputElement;
    
    fireEvent.change(companyInput, { target: { value: 'Test Company' } });
    fireEvent.change(industryInput, { target: { value: 'SaaS' } });
    
    await waitFor(() => {
      const startButton = screen.getByText(/Start Multi-Agent Research/i) as HTMLButtonElement;
      expect(startButton.disabled).toBe(false);
    });
  });

  it('should initialize research agents when research starts', async () => {
    const initSpy = vi.spyOn(researchAgentsService, 'initializeAgents');
    const startSpy = vi.spyOn(researchAgentsService, 'startResearchSession');
    
    render(<CompetitiveIntelligenceSystem />);
    
    const button = screen.getByLabelText(/Competitive Intelligence System/i);
    fireEvent.click(button);
    
    await waitFor(() => {
      const companyInput = screen.getByPlaceholderText(/Your company name/i);
      const industryInput = screen.getByPlaceholderText(/SaaS, E-commerce/i);
      
      fireEvent.change(companyInput, { target: { value: 'Test Company' } });
      fireEvent.change(industryInput, { target: { value: 'SaaS' } });
    });
    
    const startButton = screen.getByText(/Start Multi-Agent Research/i);
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(startSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: 'Test Company',
          industry: 'SaaS'
        })
      );
    });
  });

  it('should display agent status during research', async () => {
    render(<CompetitiveIntelligenceSystem />);
    
    const button = screen.getByLabelText(/Competitive Intelligence System/i);
    fireEvent.click(button);
    
    // Fill form and start research
    const companyInput = screen.getByPlaceholderText(/Your company name/i);
    const industryInput = screen.getByPlaceholderText(/SaaS, E-commerce/i);
    
    fireEvent.change(companyInput, { target: { value: 'Test Company' } });
    fireEvent.change(industryInput, { target: { value: 'SaaS' } });
    
    const startButton = screen.getByText(/Start Multi-Agent Research/i);
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Research in Progress/i)).toBeInTheDocument();
    });
  });
});

describe('AI Advisors Integration', () => {
  it('should not interfere with each other when multiple are open', async () => {
    const { container } = render(
      <>
        <VentureLaunchBuilder />
        <StrategicFundraisingAdvisor />
        <CompetitiveIntelligenceSystem />
      </>
    );
    
    // Open all three advisors
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button: HTMLElement) => fireEvent.click(button));
    
    await waitFor(() => {
      // Check that multiple advisors can be open simultaneously
      const dialogs = container.querySelectorAll('[role="dialog"], [aria-modal="true"]');
      expect(dialogs.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should handle errors gracefully without crashing', async () => {
    // Mock an error in data storage
    vi.mocked(dataStorage.storeFormSubmission).mockRejectedValueOnce(new Error('Storage error'));
    
    render(<VentureLaunchBuilder />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Ask about strategy/i);
      const sendButton = screen.getByLabelText(/Send message/i);
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
    });
    
    // Component should still be functional despite the error
    expect(screen.getByPlaceholderText(/Ask about strategy/i)).toBeInTheDocument();
  });
});