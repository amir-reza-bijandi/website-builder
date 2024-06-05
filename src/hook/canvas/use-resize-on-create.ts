import useCanvasStore from '@/store/canvas-store';
import { Position } from '@/type/general-types';
import createElement from '@/utility/canvas/create-element';
import getElementById from '@/utility/canvas/get-element-by-id';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

// useCanvasStore.subscribe(console.log);

export default function useResizeOnCreate() {
  const {
    toolbox,
    setToolbox,
    setResizing,
    isResizing,
    view,
    addElement,
    updateElement,
    selectedElementIdList,
    setSelectedElementIdList,
    setLayer,
  } = useCanvasStore(
    useShallow((store) => ({
      toolbox: store.toolbox,
      setToolbox: store.setToolbox,
      setResizing: store.setResizing,
      isResizing: store.isResizing,
      view: store.view,
      addElement: store.addElement,
      updateElement: store.updateElement,
      selectedElementIdList: store.selectedElementIdList,
      setSelectedElementIdList: store.setSelectedElementIdList,
      setLayer: store.setLayer,
    })),
  );
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

        let originTop = canvasRect.top / view.zoomFactor;
        let originLeft = canvasRect.left / view.zoomFactor;
        let originBottom = canvasRect.bottom / view.zoomFactor;
        let originRight = canvasRect.right / view.zoomFactor;

        let parentId = '';
        let layer = 0;
        if (selectedElementIdList.length === 1) {
          const elementDOM = document.getElementById(selectedElementIdList[0])!;
          const elementRect = elementDOM.getBoundingClientRect();
          const elementCanvas = getElementById(selectedElementIdList[0])!;
          if (
            clientX > elementRect.left &&
            clientX < elementRect.right &&
            clientY > elementRect.top &&
            clientY < elementRect.bottom
          ) {
            parentId = selectedElementIdList[0];
            layer = elementCanvas.layer + 1;
            originLeft = elementRect.left / view.zoomFactor;
            originTop = elementRect.top / view.zoomFactor;
            originBottom = elementRect.bottom / view.zoomFactor;
            originRight = elementRect.right / view.zoomFactor;
          }
        }

        const left =
          scaledClientX - scaledInitialClientX >= 0
            ? scaledInitialClientX - originLeft
            : scaledClientX - originLeft;
        const top =
          scaledClientY - scaledInitialClientY >= 0
            ? scaledInitialClientY - originTop
            : scaledClientY - originTop;
        const right =
          scaledClientX - scaledInitialClientX >= 0
            ? originRight - scaledClientX
            : originRight - scaledInitialClientX;
        const bottom =
          scaledClientY - scaledInitialClientY >= 0
            ? originBottom - scaledClientY
            : originBottom - scaledInitialClientY;

        const element = createElement(toolbox.tool, {
          id: createdElementIdRef.current || undefined,
          parentId,
          position: {
            mode: 'ABSOLUTE',
            left,
            top,
            right,
            bottom,
          },
          layer,
        });

        if (element) {
          if (!createdElementIdRef.current) {
            addElement(element);
            const currentLayer = useCanvasStore.getState().layer;
            if (element.layer > currentLayer) {
              setLayer(element.layer);
            }
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
