import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ScoreRing from '../components/ScoreRing';

describe('LoadingSpinner', () => {
  it('renders spinner', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

describe('ScoreRing', () => {
  it('renders score value', () => {
    render(
      <BrowserRouter>
        <ScoreRing score={75} size="md" />
      </BrowserRouter>
    );
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('shows excellent label for high scores', () => {
    render(
      <BrowserRouter>
        <ScoreRing score={85} />
      </BrowserRouter>
    );
    expect(screen.getByText('report.scoreLabels.excellent')).toBeInTheDocument();
  });

  it('shows moderate label for medium scores', () => {
    render(
      <BrowserRouter>
        <ScoreRing score={50} />
      </BrowserRouter>
    );
    expect(screen.getByText('report.scoreLabels.moderate')).toBeInTheDocument();
  });

  it('shows poor label for low scores', () => {
    render(
      <BrowserRouter>
        <ScoreRing score={30} />
      </BrowserRouter>
    );
    expect(screen.getByText('report.scoreLabels.poor')).toBeInTheDocument();
  });
});
