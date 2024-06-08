import useCanvasStore from '@/store/canvas-store';
import getElementById from './get-element-by-id';

export default function getAncestorIdList(elementId: string): string[] | null {
  const elementList = useCanvasStore.getState().elementList;
  try {
    const targetElement = getElementById(elementId);
    if (!targetElement) throw new Error('Element not found!');

    // Filter element that are in lower layers and sort them from higher layers to lower
    const filteredElementList = elementList
      .filter((element) => element.layer < targetElement.layer)
      .sort((a, b) => b.layer - a.layer);

    const result = filteredElementList.reduce(
      (result, element) => {
        if (element.id === result.at(-1)) {
          if (element.parentId) {
            result.push(element.parentId);
          }
        }
        return result;
      },
      [targetElement.parentId],
    );

    return result.length > 0 ? result : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
