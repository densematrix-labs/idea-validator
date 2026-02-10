import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { validateIdea } from '../lib/api';
import { getDeviceId } from '../lib/fingerprint';
import { useTokenStore } from '../store/tokenStore';

const features = [
  { key: 'market', icon: '📊' },
  { key: 'competition', icon: '🎯' },
  { key: 'technical', icon: '⚙️' },
  { key: 'business', icon: '💰' },
  { key: 'risks', icon: '⚠️' },
  { key: 'suggestions', icon: '💡' },
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { canGenerate, freeTrialUsed, tokensRemaining, fetchStatus } = useTokenStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const deviceId = await getDeviceId();
      const result = await validateIdea(
        {
          idea_title: title,
          idea_description: description,
          language: i18n.language,
        },
        deviceId
      );
      navigate(`/report/${result.report_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const getCreditsText = (): string => {
    if (!freeTrialUsed) return t('home.form.freeTrialRemaining');
    if (tokensRemaining > 0) return `${tokensRemaining} ${t('pricing.features.validations', { count: tokensRemaining })}`;
    return t('home.form.noCredits');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
          {t('home.hero.title')}
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
          {t('home.hero.subtitle')}
        </p>
      </motion.section>

      {/* Form Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass rounded-2xl p-8 mb-16 max-w-3xl mx-auto"
      >
        <h2 className="font-display text-2xl font-bold text-white mb-6">
          {t('home.form.title')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              {t('home.form.ideaTitle')}
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('home.form.ideaTitlePlaceholder')}
              required
              minLength={3}
              maxLength={200}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
              data-testid="input-title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              {t('home.form.description')}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('home.form.descriptionPlaceholder')}
              required
              minLength={20}
              maxLength={5000}
              rows={6}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors resize-none"
              data-testid="input-description"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {getCreditsText()}
            </span>
            
            <button
              type="submit"
              disabled={isLoading || !canGenerate}
              className="px-8 py-3 bg-gradient-to-r from-accent-blue to-accent-gold text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              data-testid="generate-btn"
            >
              {isLoading ? t('home.form.validating') : t('home.form.submit')}
            </button>
          </div>
        </form>
      </motion.section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-12">
          {t('home.features.title')}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="glass rounded-xl p-6 hover:border-accent-blue/30 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-display font-semibold text-white mb-2">
                {t(`home.features.${feature.key}.title`)}
              </h3>
              <p className="text-gray-400 text-sm">
                {t(`home.features.${feature.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
