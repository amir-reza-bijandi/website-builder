import useCanvasStore from '@/store/canvas-store';
import { Position } from '@/type/general-types';
import createElement from '@/utility/canvas/create-element';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

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
    elementList,
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
      elementList: store.elementList,
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
        const { x: initialClientX, y: initialClientY } =
          initialMousePositionRef.current;

        const scaledClientX = clientX / view.zoomFactor;
        const scaledClientY = clientY / view.zoomFactor;

        const scaledInitialClientX = initialClientX / view.zoomFactor;
        const scaledInitialClientY = initialClientY / view.zoomFactor;

        let originTop = canvasRect.top / view.zoomFactor;
        let originLeft = canvasRect.left / view.zoomFactor;
        let originBottom = canvasRect.bottom / view.zoomFactor;
        let originRight = canvasRect.right / view.zoomFactor;

        let parentId = '';
        let layer = 0;

        if (elementList.length > 0) {
          // Get the bounding rect of all elements
          const targetElementRectList = elementList
            .map((element, index) => ({
              index,
              element,
              elementRect: document
                .getElementById(element.id)!
                .getBoundingClientRect(),
            }))
            // Filter possible target candidates based on the initial mouse position
            .filter(
              ({ elementRect, element }) =>
                element.type === 'FRAME' &&
                initialClientX >= elementRect.left &&
                initialClientX <= elementRect.left + elementRect.width &&
                initialClientY >= elementRect.top &&
                initialClientY <= elementRect.top + elementRect.height,
            )
            // Sort the list based on their index values
            .sort((a, b) => b.index - a.index);

          // Check whether target list is empty or not
          if (targetElementRectList.length) {
            let { elementRect: targetElementRect, index: targetIndex } =
              targetElementRectList[0];
            // Choose element with the highest index as the target
            let targetElement = elementList.at(targetIndex);

            // Check whether a selected element is in the target list
            const selectedTarget = targetElementRectList.find(({ element }) =>
              selectedElementIdList.includes(element.id),
            );

            // Use the selected element as the target
            if (selectedTarget) {
              targetElement = selectedTarget.element;
              targetElementRect = selectedTarget.elementRect;
            }

            if (targetElement) {
              parentId = targetElement.id;
              layer = targetElement.layer + 1;
              originLeft = targetElementRect.left / view.zoomFactor;
              originTop = targetElementRect.top / view.zoomFactor;
              originBottom = targetElementRect.bottom / view.zoomFactor;
              originRight = targetElementRect.right / view.zoomFactor;
            }
          }
        }

        // // Create the element as a child of an other element
        // if (selectedElementIdList.length === 1) {
        //   const elementCanvas = getElementById(selectedElementIdList[0])!;
        //   // Parent element has to be frame
        //   if (elementCanvas.type === 'FRAME') {
        //     const elementDOM = document.getElementById(
        //       selectedElementIdList[0],
        //     )!;
        //     const elementRect = elementDOM.getBoundingClientRect();

        //     // Check whether the new element is being created within the boundaries of it's parent
        //     if (
        //       initialClientX >= elementRect.left &&
        //       initialClientX <= elementRect.left + elementRect.width &&
        //       initialClientY >= elementRect.top &&
        //       initialClientY <= elementRect.top + elementRect.height
        //     ) {
        //       parentId = selectedElementIdList[0];
        //       layer = elementCanvas.layer + 1;
        //       originLeft = elementRect.left / view.zoomFactor;
        //       originTop = elementRect.top / view.zoomFactor;
        //       originBottom = elementRect.bottom / view.zoomFactor;
        //       originRight = elementRect.right / view.zoomFactor;
        //     }
        //   }
        // }

        // Calculate the position of the element
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
          // Create element for the first time
          if (!createdElementIdRef.current) {
            addElement(element);
            const currentLayer = useCanvasStore.getState().layer;
            if (element.layer > currentLayer) {
              setLayer(element.layer);
            }
            createdElementIdRef.current = element.id;
          } else {
            // Update the created element
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
