// Application constants
export const APP_CONFIG = {
  name: 'Meta3Ventures',
  description: 'AI Innovation & Digital Transformation',
  url: 'https://meta3ventures.com',
  email: 'liron@meta3ventures.com',
  phone: '+972 52-844-4500',
  address: {
    street: 'Derech Menachem Begin 121',
    city: 'Tel Aviv-Yafo',
    country: 'Israel'
  }
} as const;

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/meta3ventures',
  linkedin: 'https://linkedin.com/company/meta3ventures',
  medium: 'https://medium.com/@meta3ventures'
} as const;

export const API_ENDPOINTS = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
} as const;

export const ROUTES = {
  home: '/',
  services: '/services',
  about: '/about',
  portfolio: '/portfolio',
  partners: '/partners',
  blog: '/blog',
  blogManagement: '/blog/manage',
  apply: '/apply',
  contact: '/contact',
  notFound: '/404'
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500
} as const;

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070
} as const;