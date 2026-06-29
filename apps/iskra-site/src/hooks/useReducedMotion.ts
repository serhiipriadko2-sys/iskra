import { useState, useEffect } from 'react';

function getReducedMotionFromQuery(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('reduced-motion') === '1';
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getReducedMotionFromQuery);

  useEffect(() => {
    setReduced(getReducedMotionFromQuery());
  }, []);

  return reduced;
}
