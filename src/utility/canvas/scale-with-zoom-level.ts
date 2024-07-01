import useCanvasStore from '@/store/canvas-store';

export default function scaleWithzoomLevel(rect: DOMRect) {
  const view = useCanvasStore.getState().view;
  return {
    top: rect.top / view.zoomLevel,
    left: rect.left / view.zoomLevel,
    bottom: rect.bottom / view.zoomLevel,
    right: rect.right / view.zoomLevel,
    width: rect.width / view.zoomLevel,
    height: rect.height / view.zoomLevel,
    x: rect.x / view.zoomLevel,
    y: rect.y / view.zoomLevel,
  } as DOMRect;
}
