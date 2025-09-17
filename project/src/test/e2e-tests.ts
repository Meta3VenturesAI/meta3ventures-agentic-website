/**
 * Critical E2E Test Cases
 * Implements comprehensive user journey tests for production flows
 */

import { E2ETestRunner, E2EStep } from './e2e-setup';

export class CriticalE2ETests {
  private runner: E2ETestRunner;

  constructor() {
    this.runner = new E2ETestRunner();
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Running Critical E2E Tests...\n');

    const tests = [
      this.testApplicationSubmissionFlow(),
      this.testContactFormSubmission(),
      this.testAgentInteractionFlow(),
      this.testAdminDashboardAccess(),
      this.testVirtualAssistantWidget()
    ];

    const results = await Promise.all(tests);

    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;

    console.log(`\n📊 E2E TEST SUMMARY`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 ALL E2E TESTS PASSED!');
    } else {
      console.log('\n⚠️ Some E2E tests failed - check logs above');
    }
  }

  private async testApplicationSubmissionFlow() {
    const steps: E2EStep[] = [
      {
        name: 'Navigate to application page',
        type: 'navigate',
        params: { url: '/apply' }
      },
      {
        name: 'Fill business name',
        type: 'type',
        params: {
          selector: 'input[name="businessName"]',
          text: 'Test Business Inc.'
        }
      },
      {
        name: 'Fill contact email',
        type: 'type',
        params: {
          selector: 'input[name="email"]',
          text: 'test@testbusiness.com'
        }
      },
      {
        name: 'Fill phone number',
        type: 'type',
        params: {
          selector: 'input[name="phone"]',
          text: '+1-555-0123'
        }
      },
      {
        name: 'Fill business description',
        type: 'type',
        params: {
          selector: 'textarea[name="description"]',
          text: 'A test business for E2E testing purposes'
        }
      },
      {
        name: 'Select industry',
        type: 'click',
        params: { selector: 'select[name="industry"]' }
      },
      {
        name: 'Click submit button',
        type: 'click',
        params: { selector: 'button[type="submit"]' }
      },
      {
        name: 'Wait for success message',
        type: 'wait',
        params: { selector: '.success-message' }
      },
      {
        name: 'Verify success message displayed',
        type: 'assert',
        params: {
          selector: '.success-message',
          condition: { type: 'visible' }
        }
      },
      {
        name: 'Take screenshot of success',
        type: 'screenshot',
        params: { filename: 'application-success.png' }
      }
    ];

    return this.runner.runUserJourney('Application Submission Flow', steps);
  }

  private async testContactFormSubmission() {
    const steps: E2EStep[] = [
      {
        name: 'Navigate to contact page',
        type: 'navigate',
        params: { url: '/#contact' }
      },
      {
        name: 'Fill contact name',
        type: 'type',
        params: {
          selector: 'input[name="name"]',
          text: 'John Doe'
        }
      },
      {
        name: 'Fill contact email',
        type: 'type',
        params: {
          selector: 'input[name="email"]',
          text: 'john@example.com'
        }
      },
      {
        name: 'Fill message',
        type: 'type',
        params: {
          selector: 'textarea[name="message"]',
          text: 'This is a test message for E2E testing'
        }
      },
      {
        name: 'Submit contact form',
        type: 'click',
        params: { selector: 'button[type="submit"]' }
      },
      {
        name: 'Wait for form submission',
        type: 'wait',
        params: { timeout: 3000 }
      },
      {
        name: 'Verify form submitted',
        type: 'assert',
        params: {
          selector: '.form-success',
          condition: { type: 'visible' }
        }
      }
    ];

    return this.runner.runUserJourney('Contact Form Submission', steps);
  }

  private async testAgentInteractionFlow() {
    const steps: E2EStep[] = [
      {
        name: 'Navigate to home page',
        type: 'navigate',
        params: { url: '/' }
      },
      {
        name: 'Wait for page load',
        type: 'wait',
        params: { timeout: 2000 }
      },
      {
        name: 'Open virtual assistant',
        type: 'click',
        params: { selector: '.virtual-assistant-trigger' }
      },
      {
        name: 'Wait for chat widget',
        type: 'wait',
        params: { selector: '.chat-widget' }
      },
      {
        name: 'Type message to agent',
        type: 'type',
        params: {
          selector: '.chat-input',
          text: 'Hello, I need help with my application'
        }
      },
      {
        name: 'Send message',
        type: 'click',
        params: { selector: '.send-button' }
      },
      {
        name: 'Wait for agent response',
        type: 'wait',
        params: { timeout: 5000 }
      },
      {
        name: 'Verify agent responded',
        type: 'assert',
        params: {
          selector: '.agent-message',
          condition: { type: 'visible' }
        }
      },
      {
        name: 'Screenshot agent interaction',
        type: 'screenshot',
        params: { filename: 'agent-chat.png' }
      }
    ];

    return this.runner.runUserJourney('Agent Interaction Flow', steps);
  }

  private async testAdminDashboardAccess() {
    const steps: E2EStep[] = [
      {
        name: 'Navigate to admin dashboard',
        type: 'navigate',
        params: { url: '/admin' }
      },
      {
        name: 'Wait for dashboard load',
        type: 'wait',
        params: { timeout: 3000 }
      },
      {
        name: 'Verify applications section',
        type: 'assert',
        params: {
          selector: '.applications-section',
          condition: { type: 'visible' }
        }
      },
      {
        name: 'Verify agent status section',
        type: 'assert',
        params: {
          selector: '.agent-status-section',
          condition: { type: 'visible' }
        }
      },
      {
        name: 'Click refresh agents button',
        type: 'click',
        params: { selector: '.refresh-agents-btn' }
      },
      {
        name: 'Wait for status update',
        type: 'wait',
        params: { timeout: 2000 }
      },
      {
        name: 'Verify provider status displayed',
        type: 'assert',
        params: {
          selector: '.provider-status',
          condition: { type: 'visible' }
        }
      },
      {
        name: 'Screenshot admin dashboard',
        type: 'screenshot',
        params: { filename: 'admin-dashboard.png' }
      }
    ];

    return this.runner.runUserJourney('Admin Dashboard Access', steps);
  }

  private async testVirtualAssistantWidget() {
    const steps: E2EStep[] = [
      {
        name: 'Navigate to home page',
        type: 'navigate',
        params: { url: '/' }
      },
      {
        name: 'Verify assistant widget exists',
        type: 'assert',
        params: {
          selector: '.virtual-assistant',
          condition: { type: 'visible' }
        }
      },
      {
        name: 'Click assistant toggle',
        type: 'click',
        params: { selector: '.assistant-toggle' }
      },
      {
        name: 'Wait for widget expansion',
        type: 'wait',
        params: { timeout: 1000 }
      },
      {
        name: 'Verify chat interface visible',
        type: 'assert',
        params: {
          selector: '.chat-interface',
          condition: { type: 'visible' }
        }
      },
      {
        name: 'Test quick action buttons',
        type: 'assert',
        params: {
          selector: '.quick-actions',
          condition: { type: 'visible' }
        }
      },
      {
        name: 'Click help button',
        type: 'click',
        params: { selector: '.help-button' }
      },
      {
        name: 'Wait for help response',
        type: 'wait',
        params: { timeout: 3000 }
      },
      {
        name: 'Verify help message displayed',
        type: 'assert',
        params: {
          selector: '.help-message',
          condition: { type: 'visible' }
        }
      }
    ];

    return this.runner.runUserJourney('Virtual Assistant Widget', steps);
  }
}

// Export test runner for external use
export const runCriticalE2ETests = async () => {
  const testSuite = new CriticalE2ETests();
  await testSuite.runAllTests();
};