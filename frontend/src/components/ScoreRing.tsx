import { useTranslation } from 'react-i18next';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreRing({ score, size = 'md' }: ScoreRingProps) {
  const { t } = useTranslation();
  
  const sizes = {
    sm: { outer: 80, stroke: 6, text: 'text-lg' },
    md: { outer: 120, stroke: 8, text: 'text-2xl' },
    lg: { outer: 160, stroke: 10, text: 'text-4xl' },
  };
  
  const { outer, stroke, text } = sizes[size];
  const radius = (outer - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;
  
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // gold
    return '#ef4444'; // red
  };
  
  const getScoreLabel = (score: number): string => {
    if (score >= 80) return t('report.scoreLabels.excellent');
    if (score >= 60) return t('report.scoreLabels.good');
    if (score >= 40) return t('report.scoreLabels.moderate');
    return t('report.scoreLabels.poor');
  };
  
  const color = getScoreColor(score);
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={outer} height={outer} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="score-ring"
          style={{ '--score-offset': dashOffset } as React.CSSProperties}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-display font-bold ${text}`} style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}
