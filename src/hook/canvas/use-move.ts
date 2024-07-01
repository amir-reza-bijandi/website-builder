import { useRef } from 'react';
import type { Position } from '@/type/general-types';
import getElementById from '@/utility/canvas/get-element-by-id';
import useSelectionStore from '@/store/selection-store';
import useElementStore, { ElementStoreElement } from '@/store/element-store';
import useViewStore from '@/store/view-store';
import useToolboxStore from '@/store/toolbox-store';
import useCurrentActionStore from '@/store/current-action-store';
import scaleWithZoomLevel from '@/utility/canvas/scale-with-zoom-level';

export default function useMove() {
  // STORE
  const setMoving = useCurrentActionStore((store) => store.setMoving);
  const updateElement = useElementStore((store) => store.updateElement);
  const toolboxAction = useToolboxStore((store) => store.action);
  const zoomLevel = useViewStore((store) => store.zoomLevel);
  const setSelectionVisible = useSelectionStore(
    (store) => store.setSelectionVisible,
  );

  // REF
  const targetListRef = useRef<ElementStoreElement[]>([]);
  const initialPointerPositionRef = useRef<Position>();

  // EVENT HANDLER
  const handleMoving = ({ clientX, clientY }: MouseEvent) => {
    const isMoving = useCurrentActionStore.getState().isMoving;
    if (!isMoving) {
      setMoving(true);
    }

    const { x: initialPointerX, y: initialPointerY } =
      initialPointerPositionRef.current!;

    const pointerX = clientX / zoomLevel;
    const pointerY = clientY / zoomLevel;

    // Calculate the amount mouse movement
    const deltaX = pointerX - initialPointerX;
    const deltaY = pointerY - initialPointerY;

    // Use the mouse movement to calculate the new position
    updateElement(
      ...targetListRef.current.map((element) => {
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
    const isSelectionVisible = useSelectionStore.getState().isSelectionVisible;

    // Hide selection when moving the element
    if (isSelectionVisible) {
      setSelectionVisible(false);
    }
  };

  const handleMoveEnd = () => {
    const isSelectionVisible = useSelectionStore.getState().isSelectionVisible;
    const isMoving = useCurrentActionStore.getState().isMoving;

    if (isMoving) {
      setMoving(false);
    }
    // Show the selection after moving is finished
    if (!isSelectionVisible) {
      setSelectionVisible(true);
    }
    document.body.removeEventListener('mousemove', handleMoving);
    document.body.removeEventListener('mouseleave', handleMoveEnd);
    document.body.removeEventListener('mouseup', handleMoveEnd);
  };

  const handleMove = (
    targetIdList: string[],
    initialPointerPosition: Position,
  ) => {
    targetListRef.current = targetIdList.map(
      (elementId) => getElementById(elementId)!,
    );

    const isEveryElementPositionedAbsolute = targetListRef.current.every(
      (element) => element.position.mode === 'ABSOLUTE',
    );

    if (toolboxAction === 'SELECT' && isEveryElementPositionedAbsolute) {
      initialPointerPositionRef.current = scaleWithZoomLevel(
        initialPointerPosition,
      );
      document.body.addEventListener('mousemove', handleMoving);
      document.body.addEventListener('mouseleave', handleMoveEnd);
      document.body.addEventListener('mouseup', handleMoveEnd);
    }
  };

  return handleMove;
}
