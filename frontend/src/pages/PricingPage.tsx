import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { createCheckout } from '../lib/api';
import { getDeviceId } from '../lib/fingerprint';

const plans = [
  {
    key: 'starter',
    sku: 'validator_3',
    tokens: 3,
    popular: false,
  },
  {
    key: 'growth',
    sku: 'validator_10',
    tokens: 10,
    popular: true,
  },
  {
    key: 'pro',
    sku: 'validator_30',
    tokens: 30,
    popular: false,
  },
];

export default function PricingPage() {
  const { t } = useTranslation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (sku: string) => {
    setError(null);
    setLoadingPlan(sku);

    try {
      const deviceId = await getDeviceId();
      const { checkout_url } = await createCheckout(sku, deviceId);
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'));
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-lg text-gray-400">
          {t('pricing.subtitle')}
        </p>
      </motion.div>

      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            className={`relative glass rounded-2xl p-8 ${
              plan.popular ? 'border-accent-blue ring-2 ring-accent-blue/20' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-blue text-white text-xs font-semibold rounded-full">
                {t('pricing.popular')}
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-bold text-white mb-2">
                {t(`pricing.plans.${plan.key}.name`)}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {t(`pricing.plans.${plan.key}.desc`)}
              </p>
              <div className="font-display text-4xl font-bold text-white">
                {t(`pricing.plans.${plan.key}.price`)}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('pricing.features.validations', { count: plan.tokens })}
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('pricing.features.detailed')}
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('pricing.features.share')}
              </li>
            </ul>

            <button
              onClick={() => handlePurchase(plan.sku)}
              disabled={loadingPlan !== null}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                plan.popular
                  ? 'bg-gradient-to-r from-accent-blue to-accent-gold text-white hover:opacity-90'
                  : 'bg-dark-600 text-white hover:bg-dark-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loadingPlan === plan.sku ? '...' : t('pricing.buyNow')}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
