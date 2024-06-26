import useResize from '@/hook/canvas/use-resize';
import useCanvasStore from '@/store/canvas-store';
import { Direction } from '@/type/general-types';
import { cn } from '@/utility/general-utilities';
import { memo, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useMove from '@/hook/canvas/use-move';
import getElementById from '@/utility/canvas/get-element-by-id';
import { CanvasStoreElement } from '@/type/canvas-store-types';
import EditContextMenu from '../edit-context-menu';
import useSelectionStore from '@/store/selection-store';

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export default memo(function CanvasSelect() {
  const { isSelectionVisible, selectedElementIdList } = useSelectionStore(
    useShallow((store) => ({
      isSelectionVisible: store.isSelectionVisible,
      selectedElementIdList: store.selectedElementIdList,
    })),
  );

  const [rect, setRect] = useState<Rect>();

  // We need the zoom factor but we dont want it to cause rerenders
  const zoomFactor = useCanvasStore.getState().view.zoomFactor;

  const showSelection = selectedElementIdList.length > 0 && isSelectionVisible;

  useEffect(() => {
    if (showSelection) {
      const elementRectList = selectedElementIdList.map((elementId) =>
        document.getElementById(elementId)!.getBoundingClientRect(),
      );
      const canvasRect = document
        .getElementById('canvas')!
        .getBoundingClientRect();

      // Finding the lowest value for every direction to use for rendering select rectange
      const left = elementRectList.reduce((min, rect) => {
        const left = Math.abs(canvasRect.left - rect.left) / zoomFactor;
        if (min > left) {
          return left;
        } else {
          return min;
        }
      }, Number.MAX_SAFE_INTEGER);

      const top = elementRectList.reduce((min, rect) => {
        const result = Math.abs(canvasRect.top - rect.top) / zoomFactor;
        if (min > result) {
          return result;
        } else {
          return min;
        }
      }, Number.MAX_SAFE_INTEGER);

      const width =
        canvasRect.width / zoomFactor -
        (elementRectList.reduce((min, rect) => {
          const right = Math.abs(rect.right - canvasRect.right) / zoomFactor;
          if (min > right) {
            return right;
          } else {
            return min;
          }
        }, Number.MAX_SAFE_INTEGER) +
          left);

      const height =
        canvasRect.height / zoomFactor -
        (Math.abs(
          elementRectList.reduce((min, rect) => {
            const bottom =
              Math.abs(rect.bottom - canvasRect.bottom) / zoomFactor;
            if (min > bottom) {
              return bottom;
            } else {
              return min;
            }
          }, Number.MAX_SAFE_INTEGER),
        ) +
          top);

      setRect({ left, top, width, height });
    } else {
      setRect(undefined);
    }
  }, [selectedElementIdList, zoomFactor, isSelectionVisible, showSelection]);

  if (rect && showSelection) {
    return <CanvasSelectContainer rect={rect} />;
  } else {
    return null;
  }
});

type CanvasSelectContainerProps = {
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

/* We want the zoom factor changes to rerender the click targets of select rectangle
   and to not effect the calculations of rectangle postion, so we create a separate
   component */

const CanvasSelectContainer = memo(function ({
  rect: { left, top, width, height },
}: CanvasSelectContainerProps) {
  const canvasSelectContainerRef = useRef<HTMLDivElement>(null);
  const isClickedOnSelection = useRef(false);
  const isSelecting = useRef(false);
  const { zoomFactor, toolbox } = useCanvasStore(
    useShallow((store) => ({
      zoomFactor: store.view.zoomFactor,
      toolbox: store.toolbox,
    })),
  );
  const {
    hoverTargetId,
    isCrossLayerSelectionAllowed,
    setHoverTargetId,
    setSelectedElementIdList,
  } = useSelectionStore(
    useShallow((store) => ({
      setSelectedElementIdList: store.setSelectedElementIdList,
      setLayer: store.setLayer,
      hoverTargetId: store.hoverTargetId,
      setHoverTargetId: store.setHoverTargetId,
      isCrossLayerSelectionAllowed: store.isCrossLayerSelectionAllowed,
    })),
  );

  // Retrigger reflow to apply animation
  useEffect(() => {
    // Prevent filckering when resizing
    const isResizing = useCanvasStore.getState().isResizing;
    if (!isResizing) {
      const canvasSelectContainer = canvasSelectContainerRef.current;
      if (canvasSelectContainer) {
        canvasSelectContainer.classList.remove('animate-fade-in');
        canvasSelectContainer.offsetHeight;
        canvasSelectContainer.classList.add('animate-fade-in');
      }
    }
  }, [left, top, width, height]);

  const selectedElementIdList =
    useSelectionStore.getState().selectedElementIdList;
  const handleMove = useMove(selectedElementIdList);

  const handleMouseDown: React.MouseEventHandler = (e) => {
    if (e.button === 0) {
      if (toolbox.action === 'SELECT') {
        const { clientX, clientY } = e;
        // Moving element when it's selected
        handleMove({ x: clientX, y: clientY });

        // Deselect element when shift key is pressed
        if (e.shiftKey) {
          isClickedOnSelection.current = true;
        }
        isSelecting.current = true;
      }
    }
  };

  // Changing current layer with double click
  const handleDoubleClick: React.MouseEventHandler = ({ clientX, clientY }) => {
    if (toolbox.action === 'SELECT') {
      // Prevent double click if muliple elements are selected
      if (selectedElementIdList.length === 1) {
        const selectedElement = getElementById(selectedElementIdList[0])!;
        const elementList = useCanvasStore.getState().elementList;

        const children = elementList.filter((element) => {
          return (
            element.parentId === selectedElement.id &&
            element.layer - 1 === selectedElement.layer
          );
        });

        // Check whether the element has any children
        if (children.length) {
          // Finding the target of double click based on their position on the canvas
          const target = children.reduce((target, element) => {
            const elementRect = document
              .getElementById(element.id)!
              .getBoundingClientRect();

            const elementLeft = elementRect.left / zoomFactor;
            const elementTop = elementRect.top / zoomFactor;
            const elementRight = elementLeft + elementRect.width / zoomFactor;
            const elementBottom = elementTop + elementRect.height / zoomFactor;

            if (
              elementLeft <= clientX / zoomFactor &&
              clientX / zoomFactor <= elementRight &&
              elementTop <= clientY / zoomFactor &&
              clientY / zoomFactor <= elementBottom
            ) {
              return element;
            }
            return target;
          }, {} as CanvasStoreElement);

          if (target.id) {
            setSelectedElementIdList([target.id], {
              isSelectionVisible: true,
              layer: target.layer,
            });
          }
        }
      }
    }
  };

  // Prevent highlighting already selected elements
  const handleMouseMove: React.MouseEventHandler = ({ button }) => {
    if (toolbox.action === 'SELECT') {
      if (hoverTargetId) {
        setHoverTargetId('');
      }
      if (button === 0) {
        isSelecting.current = false;
      } else {
        isSelecting.current = true;
      }
    }
  };

  const handleMouseUp: React.MouseEventHandler = ({
    clientX,
    clientY,
    button,
  }) => {
    if (button === 0) {
      if (isSelecting.current && isClickedOnSelection.current) {
        const selectedElementIdList =
          useSelectionStore.getState().selectedElementIdList;
        setSelectedElementIdList(
          selectedElementIdList.filter((selectedElementId) => {
            const elementRect = document
              .getElementById(selectedElementId)!
              .getBoundingClientRect();

            const elementLeft = elementRect.left / zoomFactor;
            const elementTop = elementRect.top / zoomFactor;
            const elementRight = elementLeft + elementRect.width / zoomFactor;
            const elementBottom = elementTop + elementRect.height / zoomFactor;

            if (
              elementLeft <= clientX / zoomFactor &&
              clientX / zoomFactor <= elementRight &&
              elementTop <= clientY / zoomFactor &&
              clientY / zoomFactor <= elementBottom
            ) {
              return false;
            }
            return true;
          }),
        );
      }
      isSelecting.current = true;
      isClickedOnSelection.current = false;
    }
  };

  return (
    <EditContextMenu>
      <div
        ref={canvasSelectContainerRef}
        style={{
          transform: `translate(${left}px, ${top}px)`,
          width: width,
          height: height,
          boxShadow: `0 0 0 calc(2px / ${zoomFactor}) hsl(var(--primary))`,
        }}
        className={cn(
          'absolute left-0 top-0 z-30 flex animate-fade-in items-center justify-center',
          // Prevent interfering with pan mode
          toolbox.action === 'PAN' && '*:pointer-events-none',
          // Make it possible to select element that are blow the selection rectangle
          isCrossLayerSelectionAllowed && 'pointer-events-none',
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onMouseMove={handleMouseMove}
      >
        <CanvasSelectResize />
      </div>
    </EditContextMenu>
  );
});

function CanvasSelectResize() {
  const { zoomFactor } = useCanvasStore(
    useShallow((store) => ({
      zoomFactor: store.view.zoomFactor,
    })),
  );

  const selectedElementIdList =
    useSelectionStore.getState().selectedElementIdList;

  const handleResize = useResize(selectedElementIdList);

  const handleMouseDown = (
    { clientX, clientY, button }: React.MouseEvent,
    direction: Direction,
  ) => {
    if (button === 0) {
      // Resize elements
      handleResize({ x: clientX, y: clientY }, direction);
    }
  };

  return (
    <>
      {/* Top Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute left-0 top-0 z-40 flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-nw-resize before:absolute before:block before:h-6 before:w-6'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'NW');
        }}
      />
      {/* Top Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute right-0 top-0 z-40 flex h-3 w-3 -translate-y-1/2 translate-x-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-ne-resize before:absolute before:block before:h-6 before:w-6'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'NE');
        }}
      />
      {/* Bottom Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 right-0 z-40 flex h-3 w-3 translate-x-1/2 translate-y-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-se-resize before:absolute before:block before:h-6 before:w-6'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'SE');
        }}
      />
      {/* Bottom Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 z-40 flex h-3 w-3 -translate-x-1/2 translate-y-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-sw-resize before:absolute before:block before:h-6 before:w-6'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'SW');
        }}
      />
      {/* Top */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute left-0 right-0 top-0 z-30 h-3 -translate-y-full scale-y-[calc(1/var(--zoom-factor))] cursor-custom-n-resize'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'N');
        }}
      />
      {/* Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 right-0 top-0 z-30 w-3 translate-x-1/2 scale-x-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-e-resize'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'E');
        }}
      />
      {/* Bottom */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 right-0 z-30 h-3 translate-y-1/2 scale-y-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-s-resize'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'S');
        }}
      />
      {/* Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 top-0 z-30 w-3 -translate-x-full scale-x-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-w-resize'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'W');
        }}
      />
    </>
  );
}
