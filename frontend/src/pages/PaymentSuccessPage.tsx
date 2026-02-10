import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { verifyPayment } from '../lib/api';
import { useTokenStore } from '../store/tokenStore';

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = useTokenStore();
  
  const [tokensAdded, setTokensAdded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkoutId = searchParams.get('checkout_id');

  useEffect(() => {
    if (!checkoutId) {
      navigate('/');
      return;
    }

    const verifyAndUpdate = async () => {
      try {
        const result = await verifyPayment(checkoutId);
        if (result.status === 'completed') {
          setTokensAdded(result.tokens_added);
          await refresh();
        } else {
          // Still pending, poll again
          setTimeout(verifyAndUpdate, 2000);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'));
      } finally {
        setLoading(false);
      }
    };

    verifyAndUpdate();
  }, [checkoutId, navigate, refresh, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dark-600 border-t-accent-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-dark-600 text-white rounded-lg hover:bg-dark-500 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-bold text-white mb-4">
          {t('payment.success.title')}
        </h1>
        
        <p className="text-gray-400 mb-6">
          {t('payment.success.message')}
        </p>

        {tokensAdded !== null && (
          <div className="bg-dark-700 rounded-lg p-4 mb-8">
            <p className="text-2xl font-display font-bold text-accent-gold">
              {t('payment.success.tokensAdded', { count: tokensAdded })}
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-gradient-to-r from-accent-blue to-accent-gold text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          {t('payment.success.continue')}
        </button>
      </motion.div>
    </div>
  );
}
