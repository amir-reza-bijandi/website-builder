import { useRef } from 'react';
import useCanvasStore from '@/store/canvas-store';
import type { Position } from '@/type/general-types';
import getElementById from '@/utility/canvas/get-element-by-id';
import { useShallow } from 'zustand/react/shallow';
import useSelectionStore from '@/store/selection-store';

export default function useMove(elementIdList: string[]) {
  const { view, toolbox, isMoving, setMoving, updateElement } = useCanvasStore(
    useShallow((store) => ({
      view: store.view,
      toolbox: store.toolbox,
      isMoving: store.isMoving,
      setMoving: store.setMoving,
      updateElement: store.updateElement,
    })),
  );
  const { isSelectionVisible, setSelectionVisible } = useSelectionStore(
    useShallow((store) => ({
      isSelectionVisible: store.isSelectionVisible,
      setSelectionVisible: store.setSelectionVisible,
    })),
  );

  const initialMousePositionRef = useRef<Position>();
  const elementList = elementIdList.map(
    (elementId) => getElementById(elementId)!,
  );

  const handleMoving = ({ clientX, clientY }: MouseEvent) => {
    // Only freely move elements that are positioned absolute
    if (elementList.every((element) => element.position.mode === 'ABSOLUTE')) {
      if (!isMoving) {
        setMoving(true);
      }

      const { x: initialClientX, y: initialClientY } =
        initialMousePositionRef.current!;

      const scaledClientX = clientX / view.zoomFactor;
      const scaledClientY = clientY / view.zoomFactor;

      // Calculate the amount mouse movement
      const deltaX = scaledClientX - initialClientX;
      const deltaY = scaledClientY - initialClientY;

      // Use the mouse movement to calculate the new position
      updateElement(
        ...elementList.map((element) => {
          if (element.position.mode === 'ABSOLUTE') {
            if (
              typeof element.position.left === 'number' &&
              typeof element.position.top === 'number' &&
              typeof element.position.right === 'number' &&
              typeof element.position.bottom === 'number'
            ) {
              const left = element.position.left + deltaX;
              const top = element.position.top + deltaY;
              const right = element.position.right - deltaX;
              const bottom = element.position.bottom - deltaY;
              return {
                ...element,
                position: {
                  mode: element.position.mode,
                  left,
                  right,
                  top,
                  bottom,
                },
              };
            }
          }
          return element;
        }),
      );

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
      if (
        elementList.every((element) => element.position.mode === 'ABSOLUTE')
      ) {
        initialMousePositionRef.current = {
          x: initialMousePosition.x / view.zoomFactor,
          y: initialMousePosition.y / view.zoomFactor,
        };
        document.body.addEventListener('mousemove', handleMoving);
        document.body.addEventListener('mouseleave', handleMoveEnd);
        document.body.addEventListener('mouseup', handleMoveEnd);
      }
    }
  };

  return handleMove;
}
