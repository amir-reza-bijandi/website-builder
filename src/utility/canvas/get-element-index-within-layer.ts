import useElementStore from '@/store/element-store';
import getElementById from './get-element-by-id';

export default function getElementIndexWithinLayer(elementId: string) {
  const elementList = useElementStore.getState().elementList;
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
