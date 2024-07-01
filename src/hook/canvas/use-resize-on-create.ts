import useCanvasStore from '@/store/canvas-store';
import useSelectionStore from '@/store/selection-store';
import useToolboxStore from '@/store/toolbox-store';
import useViewStore from '@/store/view-store';
import { Position } from '@/type/general-types';
import createElement from '@/utility/canvas/create-element';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import getElementById from '@/utility/canvas/get-element-by-id';
import getOverlapTargetId from '@/utility/canvas/get-overlap-target-id';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

export default function useResizeOnCreate() {
  const { setResizing, isResizing, addElement, updateElement, elementList } =
    useCanvasStore(
      useShallow((store) => ({
        setResizing: store.setResizing,
        isResizing: store.isResizing,
        addElement: store.addElement,
        updateElement: store.updateElement,
        elementList: store.elementList,
      })),
    );
  const {
    action: toolboxAction,
    tool: toolboxTool,
    setToolbox,
  } = useToolboxStore();
  const zoomLevel = useViewStore((store) => store.zoomLevel);
  const {
    selectedElementIdList,
    setSelectedElementIdList,
    setLayer,
    setSelectionVisible,
  } = useSelectionStore(
    useShallow((store) => ({
      selectedElementIdList: store.selectedElementIdList,
      setSelectedElementIdList: store.setSelectedElementIdList,
      setLayer: store.setLayer,
      setSelectionVisible: store.setSelectionVisible,
    })),
  );
  const initialMousePositionRef = useRef<Position>();
  const createdElementIdRef = useRef('');

  const handleResizingOnCreate = ({ clientX, clientY }: MouseEvent) => {
    if (toolboxAction === 'ADD' && toolboxTool) {
      if (!isResizing) {
        setResizing(true);
      }
      const canvasRect = document
        .getElementById('canvas')!
        .getBoundingClientRect();
      if (initialMousePositionRef.current) {
        const { x: initialClientX, y: initialClientY } =
          initialMousePositionRef.current;

        const scaledClientX = clientX / zoomLevel;
        const scaledClientY = clientY / zoomLevel;

        const scaledInitialClientX = initialClientX / zoomLevel;
        const scaledInitialClientY = initialClientY / zoomLevel;

        let originTop = canvasRect.top / zoomLevel;
        let originLeft = canvasRect.left / zoomLevel;
        let originBottom = canvasRect.bottom / zoomLevel;
        let originRight = canvasRect.right / zoomLevel;

        let parentId = '';
        let layer = 0;

        if (elementList.length > 0) {
          // Get the bounding rect of all elements
          let targetList = elementList.filter((element) => {
            const elementRect = document
              .getElementById(element.id)!
              .getBoundingClientRect();
            return (
              element.type === 'FRAME' &&
              initialClientX >= elementRect.left &&
              initialClientX <= elementRect.left + elementRect.width &&
              initialClientY >= elementRect.top &&
              initialClientY <= elementRect.top + elementRect.height
            );
          });

          // Prevent creating elements outside of selection
          if (selectedElementIdList.length === 1) {
            // Filter targets that are inside selection
            const targetInSelectionList = targetList.filter(
              (element) =>
                getAncestorIdList(element.id)?.some(
                  (ancestorId) => ancestorId === selectedElementIdList[0],
                ) || element.id === selectedElementIdList[0],
            );
            if (targetInSelectionList.length) {
              targetList = targetInSelectionList;
            }
          }

          const targetId = getOverlapTargetId(
            targetList.map((target) => target.id),
          );

          if (targetId) {
            const targetElement = getElementById(targetId)!;
            const targetElementRect = document
              .getElementById(targetId)!
              .getBoundingClientRect();

            parentId = targetElement.id;
            layer = targetElement.layer + 1;
            originLeft = targetElementRect.left / zoomLevel;
            originTop = targetElementRect.top / zoomLevel;
            originBottom = targetElementRect.bottom / zoomLevel;
            originRight = targetElementRect.right / zoomLevel;
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

        const element = createElement(toolboxTool, {
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
            const currentLayer = useSelectionStore.getState().layer;
            if (element.layer !== currentLayer) {
              setLayer(element.layer);
            }
            createdElementIdRef.current = element.id;
            setSelectedElementIdList([createdElementIdRef.current], {
              isSelectionVisible: false,
            });
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
      setSelectionVisible(true);
      setToolbox({ action: 'SELECT' });
      createdElementIdRef.current = '';
    }

    document.body.removeEventListener('mousemove', handleResizingOnCreate);
    document.body.removeEventListener('mouseup', handleResizeOnCreateEnd);
    document.body.removeEventListener('mouseleave', handleResizeOnCreateEnd);
  };

  const handleResizeOnCreate = (initialMousePositon: Position) => {
    if (toolboxAction === 'ADD' && !isResizing) {
      initialMousePositionRef.current = initialMousePositon;

      document.body.addEventListener('mousemove', handleResizingOnCreate);
      document.body.addEventListener('mouseup', handleResizeOnCreateEnd);
      document.body.addEventListener('mouseleave', handleResizeOnCreateEnd);
    }
  };
  return handleResizeOnCreate;
}
