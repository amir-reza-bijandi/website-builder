import useElementStore from '@/store/element-store';
import getElementById from './get-element-by-id';

export default function getDescendentIdList(
  elementId: string,
): string[] | null {
  try {
    const elementList = useElementStore.getState().elementList;
    const targetElement = getElementById(elementId);
    if (!targetElement) throw new Error('Element not found!');
    const filteredElementList = elementList
      .filter((element) => element.layer > targetElement.layer)
      .sort((a, b) => a.layer - b.layer);

    const result = filteredElementList.reduce((result, element) => {
      if (
        element.parentId === targetElement.id ||
        result.includes(element.parentId)
      ) {
        result.push(element.id);
      }
      return result;
    }, [] as string[]);

    return result.length > 0 ? result : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
