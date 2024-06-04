import type { CanvasStoreView } from '@/type/canvas-store-types';
import useCanvasStore from '@/store/canvas-store';

export default function createZoomView(
  canvas: Element,
  zoomFactor: number,
  focusPointX?: number,
  focusPointY?: number,
): CanvasStoreView {
  const { view } = useCanvasStore.getState();
  const newZoomFactor = zoomFactor;
  const currentZoomFactor = view.zoomFactor;
  const {
    x: canvasX,
    y: canvasY,
    width: canvasWidth,
    height: canvasHeight,
  } = canvas.getBoundingClientRect();

  // Get the distance between the focusPoint and the canvas
  const distantX = focusPointX ? focusPointX - canvasX : canvasWidth / 2;
  const distantY = focusPointY ? focusPointY - canvasY : canvasHeight / 2;

  // Scale the distance with the new zoom factor
  const scaledDistantX = distantX * (newZoomFactor / currentZoomFactor);
  const scaledDistantY = distantY * (newZoomFactor / currentZoomFactor);

  // Calculate amount of extra movement needed for the canves
  const deltaDistantX = scaledDistantX - distantX;
  const deltaDistantY = scaledDistantY - distantY;

  // Calculate the new offset
  const offsetX = view.offsetX - deltaDistantX;
  const offsetY = view.offsetY - deltaDistantY;

  return { zoomFactor: newZoomFactor, zoomState: 'NORMAL', offsetX, offsetY };
}
