import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Note: React and React DOM are now used directly without mocking
// This allows real component testing with proper functionality

// Mock React DOM for test environment
vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
  hydrateRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));

// Mock React for test environment
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    createElement: vi.fn((type, props, ...children) => {
      if (typeof type === 'string') {
        return { type, props: { ...props, children }, children };
      }
      return { type, props: { ...props, children }, children };
    }),
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock navigator
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    share: vi.fn(),
  },
});

// Mock localStorage with actual storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
global.localStorage = localStorageMock as any;

// Mock sessionStorage with actual storage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
global.sessionStorage = sessionStorageMock as any;

// Mock DOM environment for React testing
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:5173',
    origin: 'http://localhost:5173',
    protocol: 'http:',
    host: 'localhost:5173',
    hostname: 'localhost',
    port: '5173',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock document for React testing
Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName: string) => {
    const element = {
      tagName: tagName.toUpperCase(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      style: {},
      className: '',
      id: '',
      textContent: '',
      innerHTML: '',
      tabIndex: 0,
      focus: vi.fn(),
      blur: vi.fn(),
    };
    // Make it a proper Node-like object
    Object.setPrototypeOf(element, Node.prototype);
    return element;
  }),
  writable: true,
});

// Mock document.head and document.body
Object.defineProperty(document, 'head', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
  },
  writable: true,
});

Object.defineProperty(document, 'body', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
  },
  writable: true,
});

// Mock console methods to prevent test noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};