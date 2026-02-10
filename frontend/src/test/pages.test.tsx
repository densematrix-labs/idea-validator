import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PricingPage from '../pages/PricingPage';

// Mock the store
vi.mock('../store/tokenStore', () => ({
  useTokenStore: () => ({
    canGenerate: true,
    freeTrialUsed: false,
    tokensRemaining: 0,
    fetchStatus: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock the API
vi.mock('../lib/api', () => ({
  validateIdea: vi.fn().mockResolvedValue({
    report_id: 'test-id',
    overall_score: 80,
    summary: 'Test',
    market_analysis: {},
    competition_analysis: {},
    technical_feasibility: {},
    business_model: {},
    risks: {},
    suggestions: {},
  }),
  createCheckout: vi.fn().mockResolvedValue({
    checkout_url: 'https://checkout.example.com',
    checkout_id: 'checkout-123',
  }),
  getTokenStatus: vi.fn().mockResolvedValue({
    free_trial_used: false,
    tokens_remaining: 0,
    can_generate: true,
  }),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    expect(screen.getByText('home.hero.title')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    expect(screen.getByTestId('input-title')).toBeInTheDocument();
    expect(screen.getByTestId('input-description')).toBeInTheDocument();
    expect(screen.getByTestId('generate-btn')).toBeInTheDocument();
  });

  it('shows free trial message when not used', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    expect(screen.getByText('home.form.freeTrialRemaining')).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    expect(screen.getByText('home.features.market.title')).toBeInTheDocument();
    expect(screen.getByText('home.features.competition.title')).toBeInTheDocument();
    expect(screen.getByText('home.features.technical.title')).toBeInTheDocument();
    expect(screen.getByText('home.features.business.title')).toBeInTheDocument();
    expect(screen.getByText('home.features.risks.title')).toBeInTheDocument();
    expect(screen.getByText('home.features.suggestions.title')).toBeInTheDocument();
  });
});

describe('PricingPage', () => {
  it('renders pricing plans', () => {
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );
    expect(screen.getByText('pricing.title')).toBeInTheDocument();
    expect(screen.getByText('pricing.plans.starter.name')).toBeInTheDocument();
    expect(screen.getByText('pricing.plans.growth.name')).toBeInTheDocument();
    expect(screen.getByText('pricing.plans.pro.name')).toBeInTheDocument();
  });

  it('shows popular badge on growth plan', () => {
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );
    expect(screen.getByText('pricing.popular')).toBeInTheDocument();
  });

  it('renders buy buttons for all plans', () => {
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );
    const buyButtons = screen.getAllByText('pricing.buyNow');
    expect(buyButtons).toHaveLength(3);
  });
});
