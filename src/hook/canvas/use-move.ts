import useCanvasStore from '@/store/canvas-store';
import { CanvasStoreElement } from '@/type/canvas-store-types';
import { Position } from '@/type/general-types';
import { useRef } from 'react';

export default function useMove(element: CanvasStoreElement) {
  const {
    view,
    toolbox,
    isMoving,
    setMoving,
    updateElement,
    isSelectionVisible,
    setSelectionVisible,
  } = useCanvasStore();
  const initialMouseOffsetRef = useRef<Position>();

  const handleMoving = ({ clientX, clientY }: MouseEvent) => {
    if (element.position.mode === 'ABSOLUTE') {
      if (!isMoving) {
        setMoving(true);
      }

      const { x: initialClientOffsetX, y: initialClientOffsetY } =
        initialMouseOffsetRef.current!;

      // Take zoom factor into account
      const scaledClientX = clientX / view.zoomFactor;
      const scaledClientY = clientY / view.zoomFactor;

      const left = scaledClientX - initialClientOffsetX;
      const top = scaledClientY - initialClientOffsetY;
      const right = +element.position.right + +element.position.left - left;
      const bottom = +element.position.bottom + (+element.position.top - top);

      updateElement({
        ...element,
        position: { ...element.position, left, top, right, bottom },
      });

      if (isSelectionVisible) {
        setSelectionVisible(false);
      }
    }
  };
  const handleMoveEnd = () => {
    setMoving(false);
    if (isSelectionVisible) {
      setSelectionVisible(true);
    }
    document.body.removeEventListener('mousemove', handleMoving);
    document.body.removeEventListener('mouseleave', handleMoveEnd);
    document.body.removeEventListener('mouseup', handleMoveEnd);
  };

  const handleMove = (initialMousePosition: Position) => {
    if (toolbox.action === 'SELECT') {
      if (element.position.mode === 'ABSOLUTE') {
        initialMouseOffsetRef.current = {
          x: initialMousePosition.x / view.zoomFactor - +element.position.left,
          y: initialMousePosition.y / view.zoomFactor - +element.position.top,
        };
        document.body.addEventListener('mousemove', handleMoving);
        document.body.addEventListener('mouseleave', handleMoveEnd);
        document.body.addEventListener('mouseup', handleMoveEnd);
      }
    }
  };

  return handleMove;
}
