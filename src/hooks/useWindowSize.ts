import { useLayoutEffect, useState } from 'react';

const useWindowSize = (): { width: number; height: number } => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const updateSize = (): void => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return { width, height };
};

export default useWindowSize;
