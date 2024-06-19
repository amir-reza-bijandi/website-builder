import useCanvasStore from '@/store/canvas-store';
import getElementById from './get-element-by-id';

export default function getElementIndexWithinLayer(elementId: string) {
  const elementList = useCanvasStore.getState().elementList;
  const targetElement = getElementById(elementId);
  if (!targetElement) return -1;
  return elementList
    .filter(
      (element) =>
        element.parentId === targetElement.parentId &&
        element.layer === targetElement.layer,
    )
    .findIndex((element) => element.id === targetElement.id);
}
