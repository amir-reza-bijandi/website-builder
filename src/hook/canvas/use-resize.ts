import useCanvasStore from '@/store/canvas-store';
import type { AbsoluteRect, Direction, Position } from '@/type/general-types';
import getElementById from '@/utility/canvas/get-element-by-id';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

export default function useResize(elementIdList: string[]) {
  const {
    updateElement,
    isResizing,
    setResizing,
    zoomFactor,
    isSelectionVisible,
    setSelectionVisible,
  } = useCanvasStore(
    useShallow((store) => ({
      zoomFactor: store.view.zoomFactor,
      updateElement: store.updateElement,
      setResizing: store.setResizing,
      isResizing: store.isResizing,
      isSelectionVisible: store.isSelectionVisible,
      setSelectionVisible: store.setSelectionVisible,
    })),
  );

  const initialMousePositionRef = useRef<Position>();
  const initialElementRectListRef = useRef<(AbsoluteRect & { id: string })[]>();
  const resizeDirectionRef = useRef<Direction>();

  const canvas = document.getElementById('canvas')!;
  const elementList = elementIdList.map(
    (elementId) => getElementById(elementId)!,
  );

  const handleResizing = ({ clientX, clientY, currentTarget }: MouseEvent) => {
    if (!isResizing) {
      setResizing(true);
    }
    const { x: initialClientX, y: initialClientY } =
      initialMousePositionRef.current!;

    const deltaClientX = (clientX - initialClientX) / zoomFactor;
    const deltaClientY = (clientY - initialClientY) / zoomFactor;

    const canvasWidth = parseInt(getComputedStyle(canvas).width);
    const canvasHeight = parseInt(getComputedStyle(canvas).height);

    const initialSelectionRect = getSelectionRect(
      initialElementRectListRef.current!,
    );

    let resizedElementRectList: (AbsoluteRect & { id: string })[] =
      initialElementRectListRef.current!.map(
        ({
          id,
          left: initialLeft,
          right: initialRight,
          top: initialTop,
          bottom: initialBottom,
        }) => {
          const isConnectedToLeft = initialLeft === initialSelectionRect.left;
          const isConnectedToRight =
            initialRight === initialSelectionRect.right;
          const isConnectedToTop = initialTop === initialSelectionRect.top;
          const isConnectedToBottom =
            initialBottom === initialSelectionRect.bottom;

          const {
            left: selectionLeft,
            right: selectionRight,
            top: selectionTop,
            bottom: selectionBottom,
          } = initialSelectionRect;

          const deltaLeft = Math.abs(selectionLeft - initialLeft);
          const deltaRight = Math.abs(selectionRight - initialRight);
          const deltaTop = Math.abs(selectionTop - initialTop);
          const deltaBottom = Math.abs(selectionBottom - initialBottom);

          const initialSelectionWidth =
            canvasWidth - (selectionLeft + selectionRight);
          const initialSelectionHeight =
            canvasHeight - (selectionTop + selectionBottom);

          let left = initialLeft;
          let right = initialRight;
          let top = initialTop;
          let bottom = initialBottom;

          if (resizeDirectionRef.current === 'NW') {
            const selectionHeight = initialSelectionHeight + -deltaClientY;
            const ratioY = selectionHeight / initialSelectionHeight;
            const selectionWidth = initialSelectionWidth + -deltaClientX;
            const ratioX = selectionWidth / initialSelectionWidth;

            const originTop = canvasHeight - selectionBottom;
            const originBottom = selectionBottom;
            const originLeft = canvasWidth - selectionRight;
            const originRight = selectionRight;

            left = isConnectedToLeft
              ? initialLeft + deltaClientX
              : initialLeft + (deltaLeft * ratioX - deltaLeft - -deltaClientX);
            top = isConnectedToTop
              ? initialTop + deltaClientY
              : initialTop + (deltaTop * ratioY - deltaTop - -deltaClientY);
            right = isConnectedToRight
              ? initialRight
              : selectionRight + deltaRight * ratioX;
            bottom = isConnectedToBottom
              ? initialBottom
              : selectionBottom + deltaBottom * ratioY;

            if (top > originTop) top = originTop;
            if (bottom < originBottom) bottom = originBottom;
            if (left > originLeft) left = originLeft;
            if (right < originRight) right = originRight;
          } else if (resizeDirectionRef.current === 'NE') {
            const selectionHeight = initialSelectionHeight + -deltaClientY;
            const ratioY = selectionHeight / initialSelectionHeight;
            const selectionWidth = initialSelectionWidth + deltaClientX;
            const ratioX = selectionWidth / initialSelectionWidth;

            const originTop = canvasHeight - selectionBottom;
            const originBottom = selectionBottom;
            const originLeft = selectionLeft;
            const originRight = canvasWidth - selectionLeft;

            left = isConnectedToLeft
              ? initialLeft
              : selectionLeft + deltaLeft * ratioX;
            top = isConnectedToTop
              ? initialTop + deltaClientY
              : initialTop + (deltaTop * ratioY - deltaTop - -deltaClientY);
            right = isConnectedToRight
              ? initialRight - deltaClientX
              : initialRight +
                (deltaRight * ratioX - deltaRight - deltaClientX);
            bottom = isConnectedToBottom
              ? initialBottom
              : selectionBottom + deltaBottom * ratioY;

            if (top > originTop) top = originTop;
            if (bottom < originBottom) bottom = originBottom;
            if (left < originLeft) left = originLeft;
            if (right > originRight) right = originRight;
          } else if (resizeDirectionRef.current === 'SE') {
            const selectionHeight = initialSelectionHeight + deltaClientY;
            const ratioY = selectionHeight / initialSelectionHeight;
            const selectionWidth = initialSelectionWidth + deltaClientX;
            const ratioX = selectionWidth / initialSelectionWidth;

            const originTop = selectionTop;
            const originBottom = canvasWidth - selectionTop;
            const originLeft = selectionLeft;
            const originRight = canvasWidth - selectionLeft;

            left = isConnectedToLeft
              ? initialLeft
              : selectionLeft + deltaLeft * ratioX;
            top = isConnectedToTop
              ? initialTop
              : selectionTop + deltaTop * ratioY;
            right = isConnectedToRight
              ? initialRight - deltaClientX
              : initialRight +
                (deltaRight * ratioX - deltaRight - deltaClientX);
            bottom = isConnectedToBottom
              ? initialBottom - deltaClientY
              : initialBottom +
                (deltaBottom * ratioY - deltaBottom - deltaClientY);

            if (left < originLeft) left = originLeft;
            if (right > originRight) right = originRight;
            if (top < originTop) top = originTop;
            if (bottom > originBottom) bottom = originBottom;
          } else if (resizeDirectionRef.current === 'SW') {
            const selectionHeight = initialSelectionHeight + deltaClientY;
            const ratioY = selectionHeight / initialSelectionHeight;
            const selectionWidth = initialSelectionWidth + -deltaClientX;
            const ratioX = selectionWidth / initialSelectionWidth;

            const originTop = selectionTop;
            const originBottom = canvasWidth - selectionTop;
            const originLeft = canvasWidth - selectionRight;
            const originRight = selectionRight;

            left = isConnectedToLeft
              ? initialLeft + deltaClientX
              : initialLeft + (deltaLeft * ratioX - deltaLeft - -deltaClientX);
            top = isConnectedToTop
              ? initialTop
              : selectionTop + deltaTop * ratioY;
            right = isConnectedToRight
              ? initialRight
              : selectionRight + deltaRight * ratioX;
            bottom = isConnectedToBottom
              ? initialBottom - deltaClientY
              : initialBottom +
                (deltaBottom * ratioY - deltaBottom - deltaClientY);

            if (top < originTop) top = originTop;
            if (bottom > originBottom) bottom = originBottom;
            if (left > originLeft) left = originLeft;
            if (right < originRight) right = originRight;
          } else if (resizeDirectionRef.current === 'N') {
            const selectionHeight = initialSelectionHeight + -deltaClientY;
            const ratioY = selectionHeight / initialSelectionHeight;

            const originTop = canvasHeight - selectionBottom;
            const originBottom = selectionBottom;

            top = isConnectedToTop
              ? initialTop + deltaClientY
              : initialTop + (deltaTop * ratioY - deltaTop - -deltaClientY);
            bottom = isConnectedToBottom
              ? initialBottom
              : selectionBottom + deltaBottom * ratioY;

            if (top > originTop) top = originTop;
            if (bottom < originBottom) bottom = originBottom;
          } else if (resizeDirectionRef.current === 'E') {
            const selectionWidth = initialSelectionWidth + deltaClientX;
            const ratioX = selectionWidth / initialSelectionWidth;

            const originLeft = selectionLeft;
            const originRight = canvasWidth - selectionLeft;

            left = isConnectedToLeft
              ? initialLeft
              : selectionLeft + deltaLeft * ratioX;
            right = isConnectedToRight
              ? initialRight - deltaClientX
              : initialRight +
                (deltaRight * ratioX - deltaRight - deltaClientX);

            if (left < originLeft) left = originLeft;
            if (right > originRight) right = originRight;
          } else if (resizeDirectionRef.current === 'S') {
            const selectionHeight = initialSelectionHeight + deltaClientY;
            const ratioY = selectionHeight / initialSelectionHeight;

            const originTop = selectionTop;
            const originBottom = canvasWidth - selectionTop;

            top = isConnectedToTop
              ? initialTop
              : selectionTop + deltaTop * ratioY;
            bottom = isConnectedToBottom
              ? initialBottom - deltaClientY
              : initialBottom +
                (deltaBottom * ratioY - deltaBottom - deltaClientY);

            if (top < originTop) top = originTop;
            if (bottom > originBottom) bottom = originBottom;
          } else if (resizeDirectionRef.current === 'W') {
            const selectionWidth = initialSelectionWidth + -deltaClientX;
            const ratioX = selectionWidth / initialSelectionWidth;

            const originLeft = canvasWidth - selectionRight;
            const originRight = selectionRight;

            left = isConnectedToLeft
              ? initialLeft + deltaClientX
              : initialLeft + (deltaLeft * ratioX - deltaLeft - -deltaClientX);
            right = isConnectedToRight
              ? initialRight
              : selectionRight + deltaRight * ratioX;

            if (left > originLeft) left = originLeft;
            if (right < originRight) right = originRight;
          }
          return { id, left, right, top, bottom };
        },
      );

    (currentTarget as HTMLBodyElement).style.cursor =
      `url('/cursor/${resizeDirectionRef.current!.toLowerCase()}-resize.svg') 0 0, ${resizeDirectionRef.current!.toLowerCase()}-resize`;

    const resizedElementList = resizedElementRectList.map((elementRect) => {
      const element = getElementById(elementRect.id)!;
      return {
        ...element,
        position: {
          mode: element.position.mode,
          left: elementRect.left,
          right: elementRect.right,
          top: elementRect.top,
          bottom: elementRect.bottom,
        },
      };
    });

    updateElement(...resizedElementList);

    if (isSelectionVisible) {
      setSelectionVisible(false);
    }
  };

  const handleResizeEnd = (e: MouseEvent) => {
    (e.currentTarget as HTMLBodyElement).style.cursor =
      `url('/cursor/default.svg') 0 0, default`;
    setResizing(false);
    if (isSelectionVisible) {
      setSelectionVisible(true);
    }
    document.body.removeEventListener('mousemove', handleResizing);
    document.body.removeEventListener('mouseup', handleResizeEnd);
    document.body.removeEventListener('mouseleave', handleResizeEnd);
  };

  const handleResize = (
    initialMousePosition: Position,
    resizeDirection: Direction,
  ) => {
    if (elementList.every((element) => element.position.mode === 'ABSOLUTE')) {
      initialMousePositionRef.current = initialMousePosition;
      initialElementRectListRef.current = elementList.map((element) => ({
        id: element.id,
        left: element.position.mode === 'ABSOLUTE' ? +element.position.left : 0,
        right:
          element.position.mode === 'ABSOLUTE' ? +element.position.right : 0,
        top: element.position.mode === 'ABSOLUTE' ? +element.position.top : 0,
        bottom:
          element.position.mode === 'ABSOLUTE' ? +element.position.bottom : 0,
      }));
      resizeDirectionRef.current = resizeDirection;

      document.body.addEventListener('mousemove', handleResizing);
      document.body.addEventListener('mouseup', handleResizeEnd);
      document.body.addEventListener('mouseleave', handleResizeEnd);
    }
  };
  return handleResize;
}

function getSelectionRect(elementRectList: AbsoluteRect[]) {
  const left = elementRectList.reduce(
    (min, rect) => (rect.left < min ? rect.left : min),
    Number.MAX_SAFE_INTEGER,
  );

  const right = elementRectList.reduce(
    (min, rect) => (rect.right < min ? rect.right : min),
    Number.MAX_SAFE_INTEGER,
  );

  const top = elementRectList.reduce(
    (min, rect) => (rect.top < min ? rect.top : min),
    Number.MAX_SAFE_INTEGER,
  );

  const bottom = elementRectList.reduce(
    (min, rect) => (rect.bottom < min ? rect.bottom : min),
    Number.MAX_SAFE_INTEGER,
  );
  return {
    left,
    right,
    top,
    bottom,
  };
}
