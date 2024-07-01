import { useEffect, useRef } from 'react';
import useCanvasStore from '@/store/canvas-store';
import { useShallow } from 'zustand/react/shallow';
import useToolboxStore, { type Toolbox } from '@/store/toolbox-store';

export default function usePanningWithSpaceKey() {
  const { isMoving, isResizing } = useCanvasStore(
    useShallow((store) => ({
      isMoving: store.isMoving,
      isResizing: store.isResizing,
    })),
  );
  const {
    setToolbox,
    action: toolboxAction,
    tool: toolboxTool,
  } = useToolboxStore();
  const isKeyDownRef = useRef(false);
  const lastToolboxSnapshot = useRef<Toolbox>();

  useEffect(() => {
    const handleAllowPanning = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isKeyDownRef.current) {
        if (toolboxAction !== 'PAN') {
          // Prevent panning when moving or resizing an element
          if (!isResizing && !isMoving) {
            lastToolboxSnapshot.current = {
              action: toolboxAction,
              tool: toolboxTool,
            };
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
          if (toolboxAction === 'PAN') {
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
  }, [setToolbox, toolboxAction, toolboxTool, isMoving, isResizing]);
}
