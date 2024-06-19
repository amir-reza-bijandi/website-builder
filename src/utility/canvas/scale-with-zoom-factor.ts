import useCanvasStore from '@/store/canvas-store';

export default function scaleWithZoomFactor(rect: DOMRect) {
  const view = useCanvasStore.getState().view;
  return {
    top: rect.top / view.zoomFactor,
    left: rect.left / view.zoomFactor,
    bottom: rect.bottom / view.zoomFactor,
    right: rect.right / view.zoomFactor,
    width: rect.width / view.zoomFactor,
    height: rect.height / view.zoomFactor,
    x: rect.x / view.zoomFactor,
    y: rect.y / view.zoomFactor,
  } as DOMRect;
}
