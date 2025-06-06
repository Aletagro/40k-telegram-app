import {useEffect, useCallback} from 'react';

export default function useDebounce(effect, dependencies, delay) {
  // eslint-disable-next-line
  const callback = useCallback(effect, dependencies);

  useEffect(() => {
    const timeout = setTimeout(callback, delay);
    return () => clearTimeout(timeout);
  }, [callback, delay]);
}
