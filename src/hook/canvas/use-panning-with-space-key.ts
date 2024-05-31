import { useEffect, useRef } from 'react';
import useCanvasStore from '@/store/canvas-store';
import { CanvasStoreToolbox } from '@/type/canvas-store-types';

export default function usePanningWithSpaceKey() {
  const { toolbox, setToolbox, isMoving, isResizing } = useCanvasStore();
  const isKeyDownRef = useRef(false);
  const lastToolboxSnapshot = useRef<CanvasStoreToolbox>();

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
        // Only stop panning if the user is not using the toolbox to select the pan tool
        if (lastToolboxSnapshot.current) {
          if (toolbox.action === 'PAN') {
            setToolbox(lastToolboxSnapshot.current);
            lastToolboxSnapshot.current = undefined;
          }
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
