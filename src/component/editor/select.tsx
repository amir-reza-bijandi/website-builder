import useResize from '@/hook/canvas/use-resize';
import useCanvasStore from '@/store/canvas-store';
import { Direction } from '@/type/general-types';
import { cn } from '@/utility/general-utilities';
import { memo, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useMove from '@/hook/canvas/use-move';

export default memo(function CanvasSelect() {
  const { isSelectionVisible, selectedElementIdList } = useCanvasStore(
    useShallow((store) => ({
      isSelectionVisible: store.isSelectionVisible,
      selectedElementIdList: store.selectedElementIdList,
      elementList: store.elementList,
    })),
  );
  const zoomFactor = useCanvasStore.getState().view.zoomFactor;

  if (selectedElementIdList.length === 0 || !isSelectionVisible) return null;

  const elementRectList = selectedElementIdList.map((elementId) =>
    document.getElementById(elementId)!.getBoundingClientRect(),
  );
  const canvasRect = document.getElementById('canvas')!.getBoundingClientRect();

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
        const bottom = Math.abs(rect.bottom - canvasRect.bottom) / zoomFactor;
        if (min > bottom) {
          return bottom;
        } else {
          return min;
        }
      }, Number.MAX_SAFE_INTEGER),
    ) +
      top);

  return <CanvasSelectContainer rect={{ left, top, width, height }} />;
});

type CanvasSelectContainerProps = {
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

const CanvasSelectContainer = memo(function ({
  rect,
}: CanvasSelectContainerProps) {
  const canvasSelectContainerRef = useRef<HTMLDivElement>(null);
  const { zoomFactor, toolbox } = useCanvasStore(
    useShallow((store) => ({
      zoomFactor: store.view.zoomFactor,
      toolbox: store.toolbox,
    })),
  );
  // Retrigger reflow to apply animation
  useEffect(() => {
    const isResizing = useCanvasStore.getState().isResizing;
    if (!isResizing) {
      const canvasSelectContainer = canvasSelectContainerRef.current;
      if (canvasSelectContainer) {
        canvasSelectContainer.classList.remove('animate-fade-in');
        canvasSelectContainer.offsetHeight;
        canvasSelectContainer.classList.add('animate-fade-in');
      }
    }
  }, [rect]);

  const selectedElementIdList = useCanvasStore.getState().selectedElementIdList;
  const handleMove = useMove(selectedElementIdList);

  const handleMouseDown: React.MouseEventHandler = (e) => {
    const { clientX, clientY } = e;
    handleMove({ x: clientX, y: clientY });
  };

  return (
    <div
      ref={canvasSelectContainerRef}
      style={{
        transform: `translate(${rect.left}px, ${rect.top}px)`,
        width: rect.width,
        height: rect.height,
        boxShadow: `0 0 0 calc(2px / ${zoomFactor}) hsl(var(--primary))`,
      }}
      className={cn(
        'absolute left-0 top-0 z-30 flex animate-fade-in items-center justify-center',
        toolbox.action === 'PAN' && '*:pointer-events-none',
      )}
      onMouseDown={handleMouseDown}
    >
      <CanvasSelectResize />
    </div>
  );
});

function CanvasSelectResize() {
  const { zoomFactor } = useCanvasStore(
    useShallow((store) => ({
      zoomFactor: store.view.zoomFactor,
    })),
  );

  const selectedElementIdList = useCanvasStore.getState().selectedElementIdList;

  const handleResize = useResize(selectedElementIdList);

  const handleMouseDown = (
    { clientX, clientY }: React.MouseEvent,
    direction: Direction,
  ) => {
    handleResize({ x: clientX, y: clientY }, direction);
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
        className='pointer-events-auto absolute left-0 right-0 top-0 z-30 h-6 -translate-y-1/2 scale-y-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-n-resize'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'N');
        }}
      />
      {/* Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 right-0 top-0 z-30 w-6 translate-x-1/2 scale-x-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-e-resize'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'E');
        }}
      />
      {/* Bottom */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 right-0 z-30 h-6 translate-y-1/2 scale-y-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-s-resize'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'S');
        }}
      />
      {/* Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 top-0 z-30 w-6 -translate-x-1/2 scale-x-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-w-resize'
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'W');
        }}
      />
    </>
  );
}
