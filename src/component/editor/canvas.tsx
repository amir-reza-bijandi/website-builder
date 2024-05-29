import { useRef } from 'react';
import CONFIG from '@/config';
import useCanvasStore from '@/store/canvas-store';
import { cn } from '@/utility/general-utilities';
import createZoomView from '@/utility/canvas/create-zoom-view';
import createElement from '@/utility/canvas/create-element';
import CanvasRender from './render';
import CanvasSelect from './select';

export default function Canvas() {
  const {
    view,
    setView,
    toolbox,
    setToolbox,
    addElement,
    updateElement,
    setSelectedElementIdList,
    selectedElementIdList,
    isResizing,
    isMoving,
    isPanning,
    setPanning,
    setResizing,
  } = useCanvasStore();
  const initialMousePositionRef = useRef({ x: 0, y: 0 });
  const initialViewOffsetRef = useRef({ x: 0, y: 0 });
  const createdElementIdRef = useRef<string>('');

  const isPanningAllowed = toolbox.action === 'PAN';

  // Zoom in and out
  const handleZoomFactorChange: React.WheelEventHandler<HTMLElement> = ({
    deltaY,
    clientX,
    clientY,
    currentTarget,
    ctrlKey,
  }) => {
    if (ctrlKey) {
      // Prevent zoom if the user is moving or resizing an element or panning the canvas
      if (isMoving || isPanning || isResizing) return;

      // Calculate new zoom factor
      let newZoomFactor = view.zoomFactor;
      if (deltaY > 0)
        newZoomFactor = view.zoomFactor / CONFIG.ZOOM_FACTOR_MULTIPLIER;
      else newZoomFactor = view.zoomFactor * CONFIG.ZOOM_FACTOR_MULTIPLIER;

      // Check if new zoom factor is within the desired range
      if (
        newZoomFactor <= CONFIG.ZOOM_FACTOR_MAX &&
        newZoomFactor >= CONFIG.ZOOM_FACTOR_MIN
      ) {
        const canvas = currentTarget.children[0];
        setView(createZoomView(canvas, newZoomFactor, clientX, clientY));
      }
    }
  };

  const handleMouseDown: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
    currentTarget,
    target,
  }) => {
    const canvas = currentTarget.children[0];
    if (target === canvas && toolbox.action !== 'PAN') {
      if (selectedElementIdList[0]) {
        setSelectedElementIdList([], false);
      }
    }

    initialMousePositionRef.current = { x: clientX, y: clientY };
    initialViewOffsetRef.current = { x: view.offsetX, y: view.offsetY };

    // Panning Logic
    if (isPanningAllowed) {
      // Adding the panning event listeners to body to allow panning outside of the canvas
      document.body.addEventListener('mouseup', handlePanningEnd);
      document.body.addEventListener('mouseleave', handlePanningEnd);
      document.body.addEventListener('mousemove', handlePanning);
    } else {
      document.body.addEventListener('mousemove', handleResizeOnCreate);
      document.body.addEventListener('mouseup', handleResizeOnCreateEnd);
      document.body.addEventListener('mouseleave', handleResizeOnCreateEnd);
    }
  };

  const handlePanning = ({ clientX, clientY }: MouseEvent) => {
    if (!isPanning) {
      setPanning(true);
    }

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
    setPanning(false);
    // Show selection when stopping panning
    document.body.removeEventListener('mouseleave', handlePanningEnd);
    document.body.removeEventListener('mouseup', handlePanningEnd);
    document.body.removeEventListener('mousemove', handlePanning);
  };

  const handleResizeOnCreate = ({ clientX, clientY }: MouseEvent) => {
    if (toolbox.action === 'ADD' && toolbox.tool) {
      const { x: initialClientX, y: initialClientY } =
        initialMousePositionRef.current;
      const canvas = document.getElementById('canvas')!;
      const canvasRect = canvas.getBoundingClientRect();

      // Take zoom factor into account
      const scaledClientX = clientX / view.zoomFactor;
      const scaledClientY = clientY / view.zoomFactor;

      const scaledInitialClientX = initialClientX / view.zoomFactor;
      const scaledInitialClientY = initialClientY / view.zoomFactor;

      const scaledCanvasTop = canvasRect.top / view.zoomFactor;
      const scaledCanvasLeft = canvasRect.left / view.zoomFactor;
      const scaledCanvasBottom = canvasRect.bottom / view.zoomFactor;
      const scaledCanvasRight = canvasRect.right / view.zoomFactor;

      const left =
        scaledClientX - scaledInitialClientX >= 0
          ? scaledInitialClientX - scaledCanvasLeft
          : scaledClientX - scaledCanvasLeft;
      const top =
        scaledClientY - scaledInitialClientY >= 0
          ? scaledInitialClientY - scaledCanvasTop
          : scaledClientY - scaledCanvasTop;
      const right =
        scaledClientX - scaledInitialClientX >= 0
          ? scaledCanvasRight - scaledClientX
          : scaledCanvasRight - scaledInitialClientX;
      const bottom =
        scaledClientY - scaledInitialClientY >= 0
          ? scaledCanvasBottom - scaledClientY
          : scaledCanvasBottom - scaledInitialClientY;

      const element = createElement(toolbox.tool, {
        id: createdElementIdRef.current || undefined,
        position: {
          mode: 'ABSOLUTE',
          left,
          top,
          right,
          bottom,
        },
      });

      if (!isResizing) {
        setResizing(true);
      }

      if (element) {
        if (!createdElementIdRef.current) {
          addElement(element);
          createdElementIdRef.current = element.id;
        } else {
          updateElement(element);
        }
      }
    }
  };

  const handleResizeOnCreateEnd = () => {
    setResizing(false);
    if (createdElementIdRef.current) {
      setSelectedElementIdList([createdElementIdRef.current], true);
      setToolbox({ action: 'SELECT' });
      createdElementIdRef.current = '';
    }
    document.body.removeEventListener('mousemove', handleResizeOnCreate);
    document.body.removeEventListener('mouseup', handleResizeOnCreateEnd);
    document.body.removeEventListener('mouseleave', handleResizeOnCreateEnd);
  };

  return (
    <main
      className={cn(
        'relative flex h-full items-center justify-center overflow-hidden',
        toolbox.action === 'ADD' && 'cursor-custom-crosshair',
        isPanningAllowed && 'cursor-custom-grab active:cursor-custom-grabbing',
      )}
      onWheel={handleZoomFactorChange}
      onMouseDown={handleMouseDown}
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
        <CanvasRender />
        <CanvasSelect />
      </div>
    </main>
  );
}
