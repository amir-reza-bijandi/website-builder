import useCanvasStore from '@/store/canvas-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/utility/general-utilities';
import generateStyle from '@/utility/canvas/generate-style';
import type { CanvasStoreElement } from '@/type/canvas-store-types';
import useMove from '@/hook/canvas/use-move';
import EditContextMenu from '../edit-context-menu';
import useClipboardStore from '@/store/clipboard-store';
import useSelectionStore from '@/store/selection-store';
import { useEffect, useState } from 'react';

type WrapperProps = {
  element: CanvasStoreElement;
  children: React.ReactNode;
};

export default function Wrapper({ element, children }: WrapperProps) {
  const { toolbox, view, isResizing, isMoving } = useCanvasStore(
    useShallow((store) => ({
      toolbox: store.toolbox,
      view: store.view,
      isResizing: store.isResizing,
      isMoving: store.isMoving,
    })),
  );
  const {
    hoverTargetId,
    isCrossLayerSelectionAllowed,
    layer,
    selectedElementIdList,
    setHoverTargetId,
    setSelectedElementIdList,
  } = useSelectionStore((store) => ({
    setSelectedElementIdList: store.setSelectedElementIdList,
    selectedElementIdList: store.selectedElementIdList,
    layer: store.layer,
    setLayer: store.setLayer,
    hoverTargetId: store.hoverTargetId,
    setHoverTargetId: store.setHoverTargetId,
    isCrossLayerSelectionAllowed: store.isCrossLayerSelectionAllowed,
  }));
  const [showHighlight, setHighlight] = useState(false);
  const [isElementOutsideOfParentElement, setOutsideOfParentElement] =
    useState(false);

  const setPastePosition = useClipboardStore((store) => store.setPastePosition);
  const handleMove = useMove();
  const isElementSelected = selectedElementIdList.includes(element.id);

  useEffect(() => {
    // Prevent flashing of highlight by using it as a side effect
    if (
      !isMoving &&
      !isResizing &&
      (isElementSelected || hoverTargetId === element.id)
    ) {
      if (!showHighlight) {
        setHighlight(true);
      }
    } else {
      if (showHighlight) {
        setHighlight(false);
      }
    }

    if (element.parentId) {
      const parentElementRect = document
        .getElementById(element.parentId)!
        .getBoundingClientRect();
      const elementRect = document
        .getElementById(element.id)!
        .getBoundingClientRect();

      if (
        elementRect.left < parentElementRect.left ||
        elementRect.right > parentElementRect.right ||
        elementRect.top < parentElementRect.top ||
        elementRect.bottom > parentElementRect.bottom
      ) {
        if (!isElementOutsideOfParentElement) {
          setOutsideOfParentElement(true);
        }
      } else {
        if (isElementOutsideOfParentElement) {
          setOutsideOfParentElement(false);
        }
      }
    }
  }, [
    isMoving,
    isResizing,
    isElementSelected,
    hoverTargetId,
    showHighlight,
    setHighlight,
    element.id,
    element.parentId,
    isElementOutsideOfParentElement,
  ]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (toolbox.action === 'SELECT') {
      e.stopPropagation();
      if (e.button === 0) {
        if (!isElementSelected) {
          // Select multiple elements
          if (e.shiftKey) {
            setSelectedElementIdList([element.id], {
              behaviour: 'ADD',
              isSelectionVisible: true,
            });
          }
          // Select a single element
          else {
            setSelectedElementIdList([element.id], {
              behaviour: 'REPLACE',
              isSelectionVisible: true,
            });
          }
        }
        // Move element
        handleMove(
          e.shiftKey
            ? useSelectionStore.getState().selectedElementIdList
            : [element.id],
          { x: e.clientX, y: e.clientY },
        );
      }
    }
    /* Since this event prevents it's parent event from triggering
       We have to set the paste position here */
    if (e.button === 2) {
      setPastePosition({ x: e.clientX, y: e.clientY });
    }
  };

  // setup for the highlight effect of selectable elements
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    if (toolbox.action === 'SELECT') {
      e.stopPropagation();
      setHoverTargetId(element.id);
    }
  };

  const handleMouseLeave = () => {
    setHoverTargetId('');
  };

  return (
    <EditContextMenu>
      <div
        id={element.id}
        style={
          {
            ...generateStyle(element),
            boxShadow: `0 0 0 calc(2px / ${view.zoomFactor}) var(--tw-shadow-color)`,
          } as React.CSSProperties
        }
        onMouseDown={handleMouseDown}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'pointer-events-none shadow-transparent transition-[box-shadow]',
          showHighlight && 'shadow-primary',
          isElementSelected && isResizing && 'shadow-primary/50',
          // Make non-relevant elements non-interactive
          element.layer <= layer && 'pointer-events-auto',
          // Make every element interactive when cross layer selection mode is active
          isCrossLayerSelectionAllowed && 'pointer-events-auto',
          // Make it possible to select elements that are outside of parent element
          isElementOutsideOfParentElement && 'pointer-events-auto',
        )}
      >
        {children}
      </div>
    </EditContextMenu>
  );
}
