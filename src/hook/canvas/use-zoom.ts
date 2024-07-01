import CONFIG from '@/config';
import useCurrentActionStore from '@/store/current-action-store';
import useViewStore from '@/store/view-store';
import createZoomView from '@/utility/canvas/create-zoom-view';
import { useShallow } from 'zustand/react/shallow';

export default function useZoom() {
  const { isMoving, isPanning, isResizing } = useCurrentActionStore(
    useShallow((store) => ({
      isPanning: store.isPanning,
      isMoving: store.isMoving,
      isResizing: store.isResizing,
    })),
  );

  const { offsetX, offsetY, zoomLevel, setView } = useViewStore();

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
      let newzoomLevel = zoomLevel;
      if (deltaY > 0) newzoomLevel = zoomLevel / CONFIG.ZOOM_FACTOR;
      else newzoomLevel = zoomLevel * CONFIG.ZOOM_FACTOR;

      const view = {
        offsetX,
        offsetY,
        zoomLevel,
      };

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
