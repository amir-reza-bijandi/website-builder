import { useRef } from 'react';
import useCanvasStore from '@/store/canvas-store';
import type { CanvasStoreElement } from '@/type/canvas-store-types';
import type { AbsoluteRect, Position } from '@/type/general-types';

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
  const initialElementRect = useRef<AbsoluteRect>();
  const initialMousePositionRef = useRef<Position>();

  const handleMoving = ({ clientX, clientY }: MouseEvent) => {
    // Only freely move elements that are positioned absolute
    if (element.position.mode === 'ABSOLUTE') {
      if (!isMoving) {
        setMoving(true);
      }

      const { x: initialClientX, y: initialClientY } =
        initialMousePositionRef.current!;

      const {
        left: elementLeft,
        right: elementRight,
        top: elementTop,
        bottom: elementBottom,
      } = initialElementRect.current!;

      const scaledClientX = clientX / view.zoomFactor;
      const scaledClientY = clientY / view.zoomFactor;

      // Calculate the amount mouse movement
      const deltaX = scaledClientX - initialClientX;
      const deltaY = scaledClientY - initialClientY;

      // Use the mouse movement to calculate the new position
      const left = elementLeft + deltaX;
      const top = elementTop + deltaY;
      const right = elementRight - deltaX;
      const bottom = elementBottom - deltaY;

      updateElement({
        ...element,
        position: { ...element.position, left, top, right, bottom },
      });

      // Hide selection when moving the element
      if (isSelectionVisible) {
        setSelectionVisible(false);
      }
    }
  };
  const handleMoveEnd = () => {
    setMoving(false);
    // Show the selection after moving is finished
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
        const { left, right, top, bottom } = element.position;

        initialMousePositionRef.current = {
          x: initialMousePosition.x / view.zoomFactor,
          y: initialMousePosition.y / view.zoomFactor,
        };

        initialElementRect.current = {
          left: +left,
          right: +right,
          top: +top,
          bottom: +bottom,
        };

        document.body.addEventListener('mousemove', handleMoving);
        document.body.addEventListener('mouseleave', handleMoveEnd);
        document.body.addEventListener('mouseup', handleMoveEnd);
      }
    }
  };

  return handleMove;
}
