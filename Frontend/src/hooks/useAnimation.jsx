/**
 * useAnimation - dÃ©lai portÃ© par la CSS uniquement.
 * L'ancienne version posait setTimeout + classe CSS (double dÃ©lai).
 */
export function useAnimation({ delay = 0, type = 'slide-in-up' } = {}) {
  return {
    isMounted: true,
    animationClass: 'animate-' + type,
    animationDelay: delay + 'ms',
  };
}

export default useAnimation;