import { useEffect } from 'react';

export default function usePreventDefaultBrowserZoom() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
    };
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  });
}
