import useViewStore from '@/store/view-store';

type Rect = Partial<Omit<DOMRect, 'toJSON'>> | Partial<DOMRect>;

export default function scaleWithzoomLevel<T extends Rect>(rect: T) {
  const zoomLevel = useViewStore.getState().zoomLevel;
  return {
    top: rect.top ? rect.top / zoomLevel : undefined,
    left: rect.left ? rect.left / zoomLevel : undefined,
    right: rect.right ? rect.right / zoomLevel : undefined,
    bottom: rect.bottom ? rect.bottom / zoomLevel : undefined,
    width: rect.width ? rect.width / zoomLevel : undefined,
    height: rect.height ? rect.height / zoomLevel : undefined,
    x: rect.x ? rect.x / zoomLevel : undefined,
    y: rect.y ? rect.y / zoomLevel : undefined,
  } as T;
}
