import { useEffect, useRef } from 'react';
import useCanvasStore from '@/store/canvas-store';

export default function usePanningWithSpaceKey() {
  const { toolbox, setToolbox, isMoving, isResizing } = useCanvasStore();
  const isKeyDownRef = useRef(false);
  const lastToolboxSnapshot = useRef(toolbox);

  useEffect(() => {
    const handleAllowPanning = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isKeyDownRef.current) {
        if (toolbox.action !== 'PAN') {
          // Prevent panning when moving or resizing an element
          if (!isResizing && !isMoving) {
            lastToolboxSnapshot.current = toolbox;
            setToolbox({ action: 'PAN' });
          }
        }
        isKeyDownRef.current = true;
      }
    };
    const handlePreventPanning = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (toolbox.action === 'PAN') {
          setToolbox(lastToolboxSnapshot.current);
        }
        isKeyDownRef.current = false;
      }
    };
    document.addEventListener('keydown', handleAllowPanning);
    document.addEventListener('keyup', handlePreventPanning);
    return () => {
      document.removeEventListener('keydown', handleAllowPanning);
      document.removeEventListener('keyup', handlePreventPanning);
    };
  }, [setToolbox, toolbox, isMoving, isResizing]);
}
