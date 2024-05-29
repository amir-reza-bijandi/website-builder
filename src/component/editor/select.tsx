import useCanvasStore from '@/store/canvas-store';
import getElementById from '@/utility/canvas/get-element-by-id';
import { cn } from '@/utility/general-utilities';
import { memo, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

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

  const selectedElementId = selectedElementIdList[0];
  const selectedElementRect = document
    .getElementById(selectedElementId)!
    .getBoundingClientRect();
  const canvasRect = document.getElementById('canvas')!.getBoundingClientRect();

  const left = (selectedElementRect.left - canvasRect.left) / zoomFactor;
  const top = (selectedElementRect.top - canvasRect.top) / zoomFactor;

  const width = selectedElementRect.width / zoomFactor;
  const height = selectedElementRect.height / zoomFactor;

  return (
    <CanvasSelectContainer
      rect={{ left, top, width, height }}
      selectedElementId={selectedElementId}
    />
  );
});

type CanvasSelectContainerProps = {
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  selectedElementId: string;
};

const CanvasSelectContainer = memo(function ({
  rect,
  selectedElementId,
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
        'pointer-events-none absolute left-0 top-0 z-40 flex animate-fade-in items-center justify-center',
        toolbox.action === 'PAN' && '*:pointer-events-none',
      )}
    >
      <CanvasSelectResize elementId={selectedElementId} />
    </div>
  );
});

type CanvasSelectResizeProps = {
  elementId: string;
};
type ResizeDirection = 'NW' | 'NE' | 'SE' | 'SW' | 'N' | 'E' | 'S' | 'W';

function CanvasSelectResize({ elementId }: CanvasSelectResizeProps) {
  const { zoomFactor, updateElement, setResizing, isResizing } = useCanvasStore(
    useShallow((store) => ({
      zoomFactor: store.view.zoomFactor,
      updateElement: store.updateElement,
      setResizing: store.setResizing,
      isResizing: store.isResizing,
    })),
  );
  const initialMousePosition = useRef({ x: 0, y: 0 });
  const initialElementRectRef = useRef({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });
  const resizeDirectionRef = useRef<ResizeDirection>('N');
  const element = getElementById(elementId)!;

  const handleMouseDown = (
    { clientX, clientY }: React.MouseEvent,
    direction: ResizeDirection,
  ) => {
    if (element.position.mode === 'ABSOLUTE') {
      const { left, right, top, bottom } = element.position;
      initialMousePosition.current = { x: clientX, y: clientY };
      initialElementRectRef.current = {
        left: +left,
        right: +right,
        top: +top,
        bottom: +bottom,
      };
      resizeDirectionRef.current = direction;

      document.body.addEventListener('mousemove', handleResize);
      document.body.addEventListener('mouseup', handleResizeEnd);
      document.body.addEventListener('mouseleave', handleResizeEnd);
    }
  };

  const handleResize = ({ clientX, clientY, currentTarget }: MouseEvent) => {
    if (!isResizing) {
      setResizing(true);
    }
    const { x: initialClientX, y: initialClientY } =
      initialMousePosition.current;
    const {
      left: initialLeft,
      right: initialRight,
      top: initialTop,
      bottom: initialBottom,
    } = initialElementRectRef.current;

    const deltaX = (clientX - initialClientX) / zoomFactor;
    const deltaY = (clientY - initialClientY) / zoomFactor;

    let left = initialLeft;
    let right = initialRight;
    let top = initialTop;
    let bottom = initialBottom;

    if (resizeDirectionRef.current === 'NW') {
      left = initialLeft + deltaX;
      top = initialTop + deltaY;
      right = initialRight;
      bottom = initialBottom;
    } else if (resizeDirectionRef.current === 'NE') {
      left = initialLeft;
      top = initialTop + deltaY;
      right = initialRight - deltaX;
      bottom = initialBottom;
    } else if (resizeDirectionRef.current === 'SE') {
      left = initialLeft;
      top = initialTop;
      right = initialRight - deltaX;
      bottom = initialBottom - deltaY;
    } else if (resizeDirectionRef.current === 'SW') {
      left = initialLeft + deltaX;
      top = initialTop;
      right = initialRight;
      bottom = initialBottom - deltaY;
    } else if (resizeDirectionRef.current === 'N') {
      left = initialLeft;
      top = initialTop + deltaY;
      right = initialRight;
      bottom = initialBottom;
    } else if (resizeDirectionRef.current === 'E') {
      left = initialLeft;
      top = initialTop;
      right = initialRight - deltaX;
      bottom = initialBottom;
    } else if (resizeDirectionRef.current === 'S') {
      left = initialLeft;
      top = initialTop;
      right = initialRight;
      bottom = initialBottom - deltaY;
    } else if (resizeDirectionRef.current === 'W') {
      left = initialLeft + deltaX;
      top = initialTop;
      right = initialRight;
      bottom = initialBottom;
    }

    (currentTarget as HTMLBodyElement).style.cursor =
      `url('/cursor/${resizeDirectionRef.current.toLowerCase()}-resize.svg') 0 0, ${resizeDirectionRef.current.toLowerCase()}-resize`;

    updateElement({
      ...element,
      position: { mode: 'ABSOLUTE', left, right, top, bottom },
    });
  };

  const handleResizeEnd = (e: MouseEvent) => {
    (e.currentTarget as HTMLBodyElement).style.cursor =
      `url('/cursor/default.svg') 0 0, default`;
    setResizing(false);
    document.body.removeEventListener('mousemove', handleResize);
    document.body.removeEventListener('mouseup', handleResizeEnd);
    document.body.removeEventListener('mouseleave', handleResizeEnd);
  };

  return (
    <>
      {/* Top Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute left-0 top-0 z-40 flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-nw-resize before:absolute before:block before:h-6 before:w-6'
        onMouseDown={(e) => handleMouseDown(e, 'NW')}
      />
      {/* Top Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute right-0 top-0 z-40 flex h-3 w-3 -translate-y-1/2 translate-x-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-ne-resize before:absolute before:block before:h-6 before:w-6'
        onMouseDown={(e) => handleMouseDown(e, 'NE')}
      />
      {/* Bottom Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 right-0 z-40 flex h-3 w-3 translate-x-1/2 translate-y-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-se-resize before:absolute before:block before:h-6 before:w-6'
        onMouseDown={(e) => handleMouseDown(e, 'SE')}
      />
      {/* Bottom Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 z-40 flex h-3 w-3 -translate-x-1/2 translate-y-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-sw-resize before:absolute before:block before:h-6 before:w-6'
        onMouseDown={(e) => handleMouseDown(e, 'SW')}
      />
      {/* Top */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute left-0 right-0 top-0 z-30 h-6 -translate-y-1/2 scale-y-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-n-resize'
        onMouseDown={(e) => handleMouseDown(e, 'N')}
      />
      {/* Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 right-0 top-0 z-30 w-6 translate-x-1/2 scale-x-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-e-resize'
        onMouseDown={(e) => handleMouseDown(e, 'E')}
      />
      {/* Bottom */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 right-0 z-30 h-6 translate-y-1/2 scale-y-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-s-resize'
        onMouseDown={(e) => handleMouseDown(e, 'S')}
      />
      {/* Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 top-0 z-30 w-6 -translate-x-1/2 scale-x-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-w-resize'
        onMouseDown={(e) => handleMouseDown(e, 'W')}
      />
    </>
  );
}
