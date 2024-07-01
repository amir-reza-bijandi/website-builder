import type { CanvasStoreView } from '@/type/canvas-store-types';
import useViewStore from '@/store/view-store';

export default function createZoomView(
  canvas: Element,
  zoomLevel: number,
  focusPointX?: number,
  focusPointY?: number,
): CanvasStoreView {
  const {
    zoomLevel: currentZoomLevel,
    offsetX: currentOffsetX,
    offsetY: currentOffsetY,
  } = useViewStore.getState();
  const currentzoomLevel = currentZoomLevel;
  const {
    x: canvasX,
    y: canvasY,
    width: canvasWidth,
    height: canvasHeight,
  } = canvas.getBoundingClientRect();

  // Get the distance between the focusPoint and the canvas
  const distantX = focusPointX ? focusPointX - canvasX : canvasWidth / 2;
  const distantY = focusPointY ? focusPointY - canvasY : canvasHeight / 2;

  // Scale the distance with the new zoom level
  const scaledDistantX = distantX * (zoomLevel / currentzoomLevel);
  const scaledDistantY = distantY * (zoomLevel / currentzoomLevel);

  // Calculate amount of extra movement needed for the canves
  const deltaDistantX = scaledDistantX - distantX;
  const deltaDistantY = scaledDistantY - distantY;

  // Calculate the new offset
  const offsetX = currentOffsetX - deltaDistantX;
  const offsetY = currentOffsetY - deltaDistantY;

  return {
    zoomLevel,
    zoomState: 'NORMAL',
    offsetX,
    offsetY,
  };
}
