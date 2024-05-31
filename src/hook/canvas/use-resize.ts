import useCanvasStore from '@/store/canvas-store';
import type { AbsoluteRect, Direction, Position } from '@/type/general-types';
import getElementById from '@/utility/canvas/get-element-by-id';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

export default function useResize(elementId: string) {
  const { updateElement, isResizing, setResizing, zoomFactor } = useCanvasStore(
    useShallow((store) => ({
      zoomFactor: store.view.zoomFactor,
      updateElement: store.updateElement,
      setResizing: store.setResizing,
      isResizing: store.isResizing,
    })),
  );

  const initialMousePositionRef = useRef<Position>();
  const initialElementRectRef = useRef<AbsoluteRect>();
  const resizeDirectionRef = useRef<Direction>();

  const element = getElementById(elementId)!;
  const { position: elementPositon } = element;

  const handleResizing = ({ clientX, clientY, currentTarget }: MouseEvent) => {
    if (!isResizing) {
      setResizing(true);
    }
    const { x: initialClientX, y: initialClientY } =
      initialMousePositionRef.current!;
    const {
      left: initialLeft,
      right: initialRight,
      top: initialTop,
      bottom: initialBottom,
    } = initialElementRectRef.current!;

    const deltaX = (clientX - initialClientX) / zoomFactor;
    const deltaY = (clientY - initialClientY) / zoomFactor;

    let left = initialLeft;
    let right = initialRight;
    let top = initialTop;
    let bottom = initialBottom;

    if (resizeDirectionRef.current === 'NW') {
      left = initialLeft + deltaX;
      top = initialTop + deltaY;
      right = initialRight;
      bottom = initialBottom;
    } else if (resizeDirectionRef.current === 'NE') {
      left = initialLeft;
      top = initialTop + deltaY;
      right = initialRight - deltaX;
      bottom = initialBottom;
    } else if (resizeDirectionRef.current === 'SE') {
      left = initialLeft;
      top = initialTop;
      right = initialRight - deltaX;
      bottom = initialBottom - deltaY;
    } else if (resizeDirectionRef.current === 'SW') {
      left = initialLeft + deltaX;
      top = initialTop;
      right = initialRight;
      bottom = initialBottom - deltaY;
    } else if (resizeDirectionRef.current === 'N') {
      left = initialLeft;
      top = initialTop + deltaY;
      right = initialRight;
      bottom = initialBottom;
    } else if (resizeDirectionRef.current === 'E') {
      left = initialLeft;
      top = initialTop;
      right = initialRight - deltaX;
      bottom = initialBottom;
    } else if (resizeDirectionRef.current === 'S') {
      left = initialLeft;
      top = initialTop;
      right = initialRight;
      bottom = initialBottom - deltaY;
    } else if (resizeDirectionRef.current === 'W') {
      left = initialLeft + deltaX;
      top = initialTop;
      right = initialRight;
      bottom = initialBottom;
    }

    (currentTarget as HTMLBodyElement).style.cursor =
      `url('/cursor/${resizeDirectionRef.current!.toLowerCase()}-resize.svg') 0 0, ${resizeDirectionRef.current!.toLowerCase()}-resize`;

    updateElement({
      ...element,
      position: { mode: 'ABSOLUTE', left, right, top, bottom },
    });
  };

  const handleResizeEnd = (e: MouseEvent) => {
    (e.currentTarget as HTMLBodyElement).style.cursor =
      `url('/cursor/default.svg') 0 0, default`;
    setResizing(false);
    document.body.removeEventListener('mousemove', handleResizing);
    document.body.removeEventListener('mouseup', handleResizeEnd);
    document.body.removeEventListener('mouseleave', handleResizeEnd);
  };

  const handleResize = (
    initialMousePosition: Position,
    resizeDirection: Direction,
  ) => {
    if (elementPositon.mode === 'ABSOLUTE') {
      initialMousePositionRef.current = initialMousePosition;
      initialElementRectRef.current = {
        left: +elementPositon.left,
        right: +elementPositon.right,
        top: +elementPositon.top,
        bottom: +elementPositon.bottom,
      };
      resizeDirectionRef.current = resizeDirection;

      document.body.addEventListener('mousemove', handleResizing);
      document.body.addEventListener('mouseup', handleResizeEnd);
      document.body.addEventListener('mouseleave', handleResizeEnd);
    }
  };
  return handleResize;
}
