import useCanvasStore from '@/store/canvas';
import { useEffect, useRef } from 'react';

export default function useAllowPanning() {
  const { setPanningAllowed } = useCanvasStore();
  const isKeyDownRef = useRef(false);

  useEffect(() => {
    const handleAllowPanning = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isKeyDownRef.current) {
        setPanningAllowed(true);
        isKeyDownRef.current = true;
      }
    };
    const handlePreventPanning = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isKeyDownRef.current = false;
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
