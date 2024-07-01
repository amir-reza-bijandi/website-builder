import useCurrentActionStore from '@/store/current-action-store';
import useElementStore from '@/store/element-store';
import useSelectionStore from '@/store/selection-store';
import useToolboxStore from '@/store/toolbox-store';
import calculateDrawingRect from '@/utility/canvas/calculate-drawing-rect';
import createElement from '@/utility/canvas/create-element';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import getElementById from '@/utility/canvas/get-element-by-id';
import getOverlapTargetId from '@/utility/canvas/get-overlap-target-id';
import getPointerTargetList from '@/utility/canvas/get-pointer-target-list';
import scaleWithzoomLevel from '@/utility/canvas/scale-with-zoom-level';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Position } from '@/type/general-types';

export default function useResizeOnCreate() {
  // STORE
  const { setResizing } = useCurrentActionStore(
    useShallow((store) => ({
      setResizing: store.setResizing,
    })),
  );
  const { addElement, updateElement } = useElementStore(
    useShallow((store) => ({
      addElement: store.addElement,
      updateElement: store.updateElement,
    })),
  );
  const { setToolbox } = useToolboxStore();
  const { setSelectedElementIdList, setLayer, setSelectionVisible } =
    useSelectionStore(
      useShallow((store) => ({
        setSelectedElementIdList: store.setSelectedElementIdList,
        setLayer: store.setLayer,
        setSelectionVisible: store.setSelectionVisible,
      })),
    );

  // REF
  const initialMousePositionRef = useRef<Position>();
  const originRef = useRef<Origin>();
  const createdElementIdRef = useRef('');

  // EVENT HANDLERS
  const handleResizingOnCreate = ({ clientX, clientY }: MouseEvent) => {
    const { action: toolboxAction, tool: toolboxTool } =
      useToolboxStore.getState();
    const isResizing = useCurrentActionStore.getState().isResizing;

    if (toolboxAction === 'ADD' && toolboxTool) {
      if (!isResizing) {
        setResizing(true);
      }

      if (initialMousePositionRef.current) {
        // Set origin element if not already
        if (!originRef.current) {
          originRef.current = getOrigin(initialMousePositionRef.current);
        }

        const { rect: originRect, layer, parentId } = originRef.current;

        const { x: initialClientX, y: initialClientY } =
          initialMousePositionRef.current;

        // Calculate position of the element
        const { left, right, top, bottom } = calculateDrawingRect(
          { x: initialClientX, y: initialClientY },
          { x: clientX, y: clientY },
          {
            left: originRect.left,
            right: originRect.right,
            top: originRect.top,
            bottom: originRect.bottom,
          },
        );

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
        })!;

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
  };

  const handleResizeOnCreateEnd = () => {
    const isResizing = useCurrentActionStore.getState().isResizing;

    if (isResizing) {
      setResizing(false);
    }

    // Make selection visible
    if (createdElementIdRef.current) {
      setSelectionVisible(true);

      // Enter select mode
      setToolbox({ action: 'SELECT' });
      originRef.current = undefined;
      createdElementIdRef.current = '';
    }

    document.body.removeEventListener('mousemove', handleResizingOnCreate);
    document.body.removeEventListener('mouseup', handleResizeOnCreateEnd);
    document.body.removeEventListener('mouseleave', handleResizeOnCreateEnd);
  };

  const handleResizeOnCreate = (initialMousePositon: Position) => {
    const toolboxAction = useToolboxStore.getState().action;
    const isResizing = useCurrentActionStore.getState().isResizing;

    if (toolboxAction === 'ADD' && !isResizing) {
      initialMousePositionRef.current = initialMousePositon;

      document.body.addEventListener('mousemove', handleResizingOnCreate);
      document.body.addEventListener('mouseup', handleResizeOnCreateEnd);
      document.body.addEventListener('mouseleave', handleResizeOnCreateEnd);
    }
  };
  return handleResizeOnCreate;
}

type Origin = {
  parentId: string;
  layer: number;
  rect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
};

function getOrigin(initialPointerPosition: Position): Origin {
  const canvasRect = document.getElementById('canvas')!.getBoundingClientRect();
  const elementList = useElementStore.getState().elementList;
  const selectedElementIdList =
    useSelectionStore.getState().selectedElementIdList;

  let top = canvasRect.top;
  let left = canvasRect.left;
  let bottom = canvasRect.bottom;
  let right = canvasRect.right;

  let parentId = '';
  let layer = 0;

  // Create element inside of another element
  if (elementList.length > 0) {
    // Filter elements that are under the mouse pointer
    let targetList = getPointerTargetList(
      initialPointerPosition.x,
      initialPointerPosition.y,
      ['FRAME'],
    );

    // Create the new element inside of selection
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

    // Select the target based on it's index
    const targetId = getOverlapTargetId(targetList.map((target) => target.id));

    if (targetId) {
      const targetElement = getElementById(targetId)!;
      const targetElementRect = scaleWithzoomLevel(
        document.getElementById(targetId)!.getBoundingClientRect(),
      );

      parentId = targetElement.id;
      layer = targetElement.layer + 1;
      left = targetElementRect.left;
      top = targetElementRect.top;
      bottom = targetElementRect.bottom;
      right = targetElementRect.right;
    }
  }

  return {
    parentId,
    layer,
    rect: {
      left,
      right,
      top,
      bottom,
    },
  };
}
