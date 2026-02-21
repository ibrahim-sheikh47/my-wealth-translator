import { useSelector } from 'react-redux';

export function useSubscription() {
  const { plan, billingCycle, paymentStatus, planExpiresAt } =
    useSelector((state) => state.userProfile);
  const { isProcessing, error, successMessage } =
    useSelector((state) => state.payment);

  const isPro        = plan === 'pro' || plan === 'enterprise';
  const isActive     = paymentStatus === 'active';
  const isCanceled   = paymentStatus === 'canceled';

  return {
    plan,
    billingCycle,
    paymentStatus,
    planExpiresAt,
    isPro,
    isActive,
    isCanceled,
    isProcessing,
    error,
    successMessage,
  };
}












