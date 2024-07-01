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

      // Calculate new zoom level
      let newzoomLevel = view.zoomLevel;
      if (deltaY > 0) newzoomLevel = view.zoomLevel / CONFIG.ZOOM_FACTOR;
      else newzoomLevel = view.zoomLevel * CONFIG.ZOOM_FACTOR;

      // Check if new zoom level is within the desired range
      if (newzoomLevel > CONFIG.ZOOM_LEVEL_MAX) {
        setView({ ...view, zoomState: 'MAX' });
      } else if (newzoomLevel < CONFIG.ZOOM_LEVEL_MIN) {
        setView({ ...view, zoomState: 'MIN' });
      } else {
        const canvas = currentTarget.children[0];
        setView(createZoomView(canvas, newzoomLevel, clientX, clientY));
      }
    }
  };
  return handleZoom;
}
