import useCanvasStore from '@/store/canvas';
import { useEffect } from 'react';

export default function useAllowPanning() {
  const { setPanningAllowed } = useCanvasStore();
  useEffect(() => {
    const handleAllowPanning = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setPanningAllowed(true);
      }
    };
    const handlePreventPanning = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setPanningAllowed(false);
      }
    };
    document.addEventListener('keydown', handleAllowPanning);
    document.addEventListener('keyup', handlePreventPanning);
    return () => {
      document.removeEventListener('keydown', handleAllowPanning);
      document.removeEventListener('keyup', handlePreventPanning);
    };
  });
}
