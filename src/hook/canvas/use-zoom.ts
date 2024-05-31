import CONFIG from '@/config';
import useCanvasStore from '@/store/canvas-store';
import createZoomView from '@/utility/canvas/create-zoom-view';
import { useShallow } from 'zustand/react/shallow';

export default function useZoom() {
  const { isMoving, isPanning, isResizing, view, setView } = useCanvasStore(
    useShallow((store) => ({
      isPanning: store.isPanning,
      isMoving: store.isMoving,
      isResizing: store.isResizing,
      view: store.view,
      setView: store.setView,
    })),
  );

  const handleZoom: React.WheelEventHandler<HTMLElement> = ({
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
  return handleZoom;
}
