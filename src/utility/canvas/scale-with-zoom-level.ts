import useViewStore from '@/store/view-store';

type Rect = Partial<Omit<DOMRect, 'toJSON'>> | Partial<DOMRect>;

export default function scaleWithZoomLevel<T extends Rect>(rect: T) {
  const zoomLevel = useViewStore.getState().zoomLevel;
  return {
    top: rect.top ? Math.round(rect.top / zoomLevel) : undefined,
    left: rect.left ? Math.round(rect.left / zoomLevel) : undefined,
    right: rect.right ? Math.round(rect.right / zoomLevel) : undefined,
    bottom: rect.bottom ? Math.round(rect.bottom / zoomLevel) : undefined,
    width: rect.width ? Math.round(rect.width / zoomLevel) : undefined,
    height: rect.height ? Math.round(rect.height / zoomLevel) : undefined,
    x: rect.x ? Math.round(rect.x / zoomLevel) : undefined,
    y: rect.y ? Math.round(rect.y / zoomLevel) : undefined,
  } as T;
}
