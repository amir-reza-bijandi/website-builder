import { useRef } from 'react';
import useCanvasStore from '@/store/canvas';
import CONFIG from '@/config';
import generateViewConfig from '@/lib/canvas/calculate-zoom';
import { cn } from '@/lib/utils';

export default function Canvas() {
  const { view, setView, isPanningAllowed } = useCanvasStore();
  const initialMousePositionRef = useRef({ x: 0, y: 0 });
  const initialViewOffsetRef = useRef({ x: 0, y: 0 });

  // Zoom in and out
  const handleZoomFactorChange: React.WheelEventHandler<HTMLElement> = ({
    deltaY,
    clientX,
    clientY,
    currentTarget,
    ctrlKey,
  }) => {
    if (ctrlKey) {
      // Calculate new zoom factor
      let newZoomFactor = view.zoomFactor;
      if (deltaY > 0)
        newZoomFactor = view.zoomFactor / CONFIG.ZOOM_FACTOR_MULTIPLIER;
      else newZoomFactor = view.zoomFactor * CONFIG.ZOOM_FACTOR_MULTIPLIER;

      const canvas = currentTarget.children[0];
      setView(generateViewConfig(canvas, newZoomFactor, clientX, clientY));
    }
  };

  const handlePanningStart: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
  }) => {
    if (isPanningAllowed) {
      initialMousePositionRef.current = { x: clientX, y: clientY };
      initialViewOffsetRef.current = { x: view.offsetX, y: view.offsetY };

      // Adding the panning event listeners to body to allow panning outside of the canvas
      document.body.addEventListener('mouseup', handlePanningEnd);
      document.body.addEventListener('mouseleave', handlePanningEnd);
      document.body.addEventListener('mousemove', handlePanning);
    }
  };
  ('relative flex h-full items-center justify-center overflow-hidden');

  const handlePanning = ({ clientX, clientY }: MouseEvent) => {
    const { x: initialClientX, y: initialClientY } =
      initialMousePositionRef.current;
    const { x: intialOffsetX, y: initialOffsetY } =
      initialViewOffsetRef.current;

    // Calculate the new offset based on the initial mouse postion and the current mouse position
    const offsetX = intialOffsetX + clientX - initialClientX;
    const offsetY = initialOffsetY + clientY - initialClientY;

    setView({ offsetX, offsetY });
  };

  const handlePanningEnd = () => {
    document.body.removeEventListener('mouseleave', handlePanningEnd);
    document.body.removeEventListener('mouseup', handlePanningEnd);
    document.body.removeEventListener('mousemove', handlePanning);
  };

  return (
    <main
      className={cn(
        'relative flex h-full items-center justify-center overflow-hidden',
        isPanningAllowed && 'cursor-grab active:cursor-grabbing',
      )}
      onWheel={handleZoomFactorChange}
      onMouseDown={handlePanningStart}
    >
      <div
        id='canvas'
        style={
          {
            transform: `translate(calc(${view.offsetX}px), calc(${view.offsetY}px)) scale(${view.zoomFactor})`,
          } as React.CSSProperties
        }
        className='absolute flex h-[10000px] w-[10000px] origin-top-left select-none items-center justify-center'
      >
        This is the center of the canvas
      </div>
    </main>
  );
}
