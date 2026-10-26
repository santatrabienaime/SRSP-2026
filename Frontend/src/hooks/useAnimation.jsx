/**
 * useAnimation - delai porte par la CSS uniquement.
 * L'ancienne version posait setTimeout + classe CSS (double delai).
 */
export function useAnimation({ delay = 0, type = 'slide-in-up' } = {}) {
  return {
    isMounted: true,
    animationClass: 'animate-' + type,
    animationDelay: delay + 'ms',
  };
}

export default useAnimation;