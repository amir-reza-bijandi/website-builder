import useCanvasStore from '@/store/canvas-store';
import { memo, useEffect, useRef } from 'react';

export default memo(function CanvasSelect() {
  const selectedElementIdList = useCanvasStore(
    (store) => store.selectedElementIdList,
  );
  const isSelectionVisible = useCanvasStore(
    (store) => store.isSelectionVisible,
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
    <CanvasSelectContainer rect={{ left, top, width, height }}>
      <CanvasSelectResize />
    </CanvasSelectContainer>
  );
});

type CanvasSelectContainerProps = {
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  children: React.ReactNode;
};

function CanvasSelectContainer({ rect, children }: CanvasSelectContainerProps) {
  const canvasSelectContainerRef = useRef<HTMLDivElement>(null);
  const zoomFactor = useCanvasStore((store) => store.view.zoomFactor);
  // Retrigger reflow to apply animation
  useEffect(() => {
    const canvasSelectContainer = canvasSelectContainerRef.current;
    if (canvasSelectContainer) {
      canvasSelectContainer.classList.remove('animate-fade-in');
      canvasSelectContainer.offsetHeight;
      canvasSelectContainer.classList.add('animate-fade-in');
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
      className='pointer-events-none absolute left-0 top-0 z-40 flex animate-fade-in items-center justify-center'
    >
      {children}
    </div>
  );
}

function CanvasSelectResize() {
  const zoomFactor = useCanvasStore((store) => store.view.zoomFactor);
  return (
    <>
      {/* Top Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute left-0 top-0 z-40 flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-nw-resize before:absolute before:block before:h-6 before:w-6'
      />
      {/* Top Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute right-0 top-0 z-40 flex h-3 w-3 -translate-y-1/2 translate-x-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-ne-resize before:absolute before:block before:h-6 before:w-6'
      />
      {/* Bottom Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 right-0 z-40 flex h-3 w-3 translate-x-1/2 translate-y-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-se-resize before:absolute before:block before:h-6 before:w-6'
      />
      {/* Bottom Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 z-40 flex h-3 w-3 -translate-x-1/2 translate-y-1/2 scale-[calc(1/var(--zoom-factor))] animate-grow items-center justify-center rounded-full border-2 border-primary bg-background cursor-custom-sw-resize before:absolute before:block before:h-6 before:w-6'
      />
      {/* Top */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute left-0 right-0 top-0 z-30 h-6 -translate-y-1/2 scale-y-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-n-resize'
      />
      {/* Right */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 right-0 top-0 z-30 w-6 translate-x-1/2 scale-x-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-e-resize'
      />
      {/* Bottom */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 right-0 z-30 h-6 translate-y-1/2 scale-y-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-s-resize'
      />
      {/* Left */}
      <div
        style={{ '--zoom-factor': `${zoomFactor}` } as React.CSSProperties}
        className='pointer-events-auto absolute bottom-0 left-0 top-0 z-30 w-6 -translate-x-1/2 scale-x-[calc(1/var(--zoom-factor))] bg-transparent cursor-custom-w-resize'
      />
    </>
  );
}
