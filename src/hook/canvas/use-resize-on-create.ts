import useCanvasStore from '@/store/canvas-store';
import { CanvasStoreElement } from '@/type/canvas-store-types';
import { Position } from '@/type/general-types';
import createElement from '@/utility/canvas/create-element';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import getElementIndexWithinLayer from '@/utility/canvas/get-element-index-within-layer';
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

        type Target = {
          index: number;
          element: CanvasStoreElement;
          elementRect: DOMRect;
        };

        if (elementList.length > 0) {
          // Get the bounding rect of all elements
          let targetList = elementList
            .map<Target>((element, index) => ({
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
            // Sort the list based on the element layer
            .sort((a, b) => b.element.layer - a.element.layer);

          // Prevent creating elements outside of selection
          if (selectedElementIdList.length === 1) {
            // Filter targets that are inside selection
            const targetInSelectionList = targetList.filter(
              ({ element }) =>
                getAncestorIdList(element.id)?.some(
                  (ancestorId) => ancestorId === selectedElementIdList[0],
                ) || element.id === selectedElementIdList[0],
            );
            if (targetInSelectionList.length) {
              targetList = targetInSelectionList;
            }
          }

          // Check whether target list is empty or not
          if (targetList.length) {
            // select the element with the highest layer value as target
            let { elementRect: targetElementRect, element: targetElement } =
              targetList[0];

            // Find targets that overlap each other
            const overlappingElements = targetList.reduce<
              { layer: number; elementList: typeof targetList }[]
            >((result, target, index) => {
              // Skip the first iteration
              if (index - 1 < 0) return result;

              // Check if the layer of the current element mathes the previous one
              if (
                target.element.layer === targetList[index - 1].element.layer
              ) {
                // Look for items that are already added to the result
                const resultItemIndex = result.findIndex(
                  ({ layer }) => layer === target.element.layer,
                );
                // If the item already exists add the current element to item
                if (resultItemIndex !== -1) {
                  result[resultItemIndex].elementList.push(target);
                }
                // Create a new item if item with the same layer does not exist
                else {
                  result.push({
                    layer: target.element.layer,
                    elementList: [targetList[index - 1], target],
                  });
                }
              }
              return result;
            }, []);

            if (overlappingElements.length) {
              // Check whether there is any element with higher layer value
              const maxOverlappingLayer = overlappingElements.at(0)!.layer;
              const maxLayer = targetList.at(0)!.element.layer;

              if (maxOverlappingLayer === maxLayer) {
                const maxOverlappingLayerElementList =
                  overlappingElements.at(0)!.elementList;
                const { element: target } = maxOverlappingLayerElementList
                  .map((target) => {
                    const ancestorIdList = getAncestorIdList(target.element.id);
                    if (ancestorIdList) {
                      const ancestorIndexSum = ancestorIdList.reduce<number>(
                        (ancestorIndexSumResult, ancestorId) => {
                          const ancestorIndex =
                            getElementIndexWithinLayer(ancestorId);
                          if (ancestorIndex !== -1)
                            return ancestorIndexSumResult + ancestorIndex;
                          else return ancestorIndexSumResult;
                        },
                        0,
                      );
                      return { indexSum: ancestorIndexSum, element: target };
                    } else {
                      return { indexSum: 0, element: target };
                    }
                  })
                  .sort((a, b) => b.indexSum - a.indexSum)
                  .at(0)!;
                targetElement = target.element;
                targetElementRect = target.elementRect;
              }
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
