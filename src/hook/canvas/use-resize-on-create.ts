import useCanvasStore from '@/store/canvas-store';
import { Position } from '@/type/general-types';
import createElement from '@/utility/canvas/create-element';
import { useRef } from 'react';

export default function useResizeOnCreate() {
  const {
    toolbox,
    setToolbox,
    setResizing,
    isResizing,
    view,
    addElement,
    updateElement,
    setSelectedElementIdList,
  } = useCanvasStore();
  const initialMousePositionRef = useRef<Position>();
  const createdElementIdRef = useRef('');

  const handleResizingOnCreate = ({ clientX, clientY }: MouseEvent) => {
    if (toolbox.action === 'ADD' && toolbox.tool) {
      if (!isResizing) {
        setResizing(true);
      }
      const canvasRect = document
        .getElementById('canvas')!
        .getBoundingClientRect();
      if (initialMousePositionRef.current) {
        // Take zoom factor into account
        const scaledClientX = clientX / view.zoomFactor;
        const scaledClientY = clientY / view.zoomFactor;

        const scaledInitialClientX =
          initialMousePositionRef.current.x / view.zoomFactor;
        const scaledInitialClientY =
          initialMousePositionRef.current.y / view.zoomFactor;

        const scaledCanvasTop = canvasRect.top / view.zoomFactor;
        const scaledCanvasLeft = canvasRect.left / view.zoomFactor;
        const scaledCanvasBottom = canvasRect.bottom / view.zoomFactor;
        const scaledCanvasRight = canvasRect.right / view.zoomFactor;

        const left =
          scaledClientX - scaledInitialClientX >= 0
            ? scaledInitialClientX - scaledCanvasLeft
            : scaledClientX - scaledCanvasLeft;
        const top =
          scaledClientY - scaledInitialClientY >= 0
            ? scaledInitialClientY - scaledCanvasTop
            : scaledClientY - scaledCanvasTop;
        const right =
          scaledClientX - scaledInitialClientX >= 0
            ? scaledCanvasRight - scaledClientX
            : scaledCanvasRight - scaledInitialClientX;
        const bottom =
          scaledClientY - scaledInitialClientY >= 0
            ? scaledCanvasBottom - scaledClientY
            : scaledCanvasBottom - scaledInitialClientY;

        const element = createElement(toolbox.tool, {
          id: createdElementIdRef.current || undefined,
          position: {
            mode: 'ABSOLUTE',
            left,
            top,
            right,
            bottom,
          },
        });
        if (element) {
          if (!createdElementIdRef.current) {
            addElement(element);
            createdElementIdRef.current = element.id;
          } else {
            updateElement(element);
          }
        }
      }
    }
  };

  const handleResizeOnCreateEnd = () => {
    setResizing(false);

    // Select the newly created element
    if (createdElementIdRef.current) {
      setSelectedElementIdList([createdElementIdRef.current], true);
      setToolbox({ action: 'SELECT' });
      createdElementIdRef.current = '';
    }

    document.body.removeEventListener('mousemove', handleResizingOnCreate);
    document.body.removeEventListener('mouseup', handleResizeOnCreateEnd);
    document.body.removeEventListener('mouseleave', handleResizeOnCreateEnd);
  };

  const handleResizeOnCreate = (initialMousePositon: Position) => {
    if (toolbox.action === 'ADD' && !isResizing) {
      initialMousePositionRef.current = initialMousePositon;

      document.body.addEventListener('mousemove', handleResizingOnCreate);
      document.body.addEventListener('mouseup', handleResizeOnCreateEnd);
      document.body.addEventListener('mouseleave', handleResizeOnCreateEnd);
    }
  };
  return handleResizeOnCreate;
}
