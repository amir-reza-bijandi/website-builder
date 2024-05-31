import useCanvasStore from '@/store/canvas-store';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Position } from '@/type/general-types';

export default function usePanning() {
  const { toolbox, isPanning, setPanning, view, setView } = useCanvasStore(
    useShallow((store) => ({
      toolbox: store.toolbox,
      isPanning: store.isPanning,
      setPanning: store.setPanning,
      view: store.view,
      setView: store.setView,
    })),
  );

  const initialMousePositionRef = useRef<Position>();
  const initialCanvasOffsetRef = useRef<Position>();

  const handlePanning = ({ clientX, clientY }: MouseEvent) => {
    const isPanningAllowd =
      useCanvasStore.getState().toolbox.action === 'PAN' ? true : false;

    if (isPanningAllowd) {
      if (!isPanning) {
        setPanning(true);
      }

      let offsetX = 0;
      let offsetY = 0;

      // Calculate the new offset based on the initial mouse postion and the current mouse position
      if (initialMousePositionRef.current && initialCanvasOffsetRef.current) {
        offsetX =
          initialCanvasOffsetRef.current.x +
          clientX -
          initialMousePositionRef.current.x;
        offsetY =
          initialCanvasOffsetRef.current.y +
          clientY -
          initialMousePositionRef.current.y;
      }

      setView({ offsetX, offsetY });
    }
  };

  const handlePanEnd = () => {
    setPanning(false);
    document.body.removeEventListener('mouseleave', handlePanEnd);
    document.body.removeEventListener('mouseup', handlePanEnd);
    document.body.removeEventListener('mousemove', handlePanning);
  };

  const handlePan = (mousePosition: { x: number; y: number }) => {
    if (toolbox.action === 'PAN' && !isPanning) {
      initialMousePositionRef.current = mousePosition;
      initialCanvasOffsetRef.current = { x: view.offsetX, y: view.offsetY };

      document.body.addEventListener('mousemove', handlePanning);
      document.body.addEventListener('mouseup', handlePanEnd);
      document.body.addEventListener('mouseleave', handlePanEnd);
    }
  };

  return handlePan;
}
