import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getReport } from '../lib/api';
import ScoreRing from '../components/ScoreRing';
import LoadingSpinner from '../components/LoadingSpinner';

interface ReportData {
  idea_title: string;
  idea_description: string;
  overall_score: number;
  market_analysis: Record<string, unknown>;
  competition_analysis: Record<string, unknown>;
  technical_feasibility: Record<string, unknown>;
  business_model: Record<string, unknown>;
  risks: Record<string, unknown>;
  suggestions: Record<string, unknown>;
  summary: string;
}

export default function ReportPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchReport = async () => {
      try {
        const data = await getReport(id);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'));
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate, t]);

  if (loading) return <LoadingSpinner />;

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-red-400 mb-4">{error || 'Report not found'}</div>
        <Link
          to="/"
          className="px-6 py-2 bg-dark-600 text-white rounded-lg hover:bg-dark-500 transition-colors inline-block"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const renderSection = (key: string, data: Record<string, unknown>) => {
    if (!data) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 mb-6"
      >
        <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
          {t(`report.sections.${key}`)}
          {data.score !== undefined && (
            <span className="ml-auto text-sm font-normal text-gray-400">
              Score: {String(data.score)}/100
            </span>
          )}
        </h3>
        <div className="space-y-3 text-gray-300 text-sm" data-testid={`section-${key}`}>
          {Object.entries(data).map(([field, value]) => {
            if (field === 'score') return null;
            return (
              <div key={field} className="border-b border-dark-600 pb-2">
                <span className="text-gray-400 capitalize">{field.replace(/_/g, ' ')}: </span>
                {Array.isArray(value) ? (
                  <ul className="list-disc list-inside mt-1 ml-4">
                    {value.map((item, i) => (
                      <li key={i}>{String(item)}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-white">{String(value)}</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4" data-testid="result">
          {report.idea_title}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {report.summary}
        </p>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-12"
      >
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-4">
            {t('report.overallScore')}
          </h2>
          <ScoreRing score={report.overall_score} size="lg" />
        </div>
      </motion.div>

      {/* Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderSection('market', report.market_analysis)}
        {renderSection('competition', report.competition_analysis)}
        {renderSection('technical', report.technical_feasibility)}
        {renderSection('business', report.business_model)}
        {renderSection('risks', report.risks)}
        {renderSection('suggestions', report.suggestions)}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center gap-4 mt-12"
      >
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="px-6 py-3 bg-dark-600 text-white rounded-lg hover:bg-dark-500 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {t('report.share')}
        </button>
        <Link
          to="/"
          className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-gold text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          {t('report.newValidation')}
        </Link>
      </motion.div>
    </div>
  );
}
