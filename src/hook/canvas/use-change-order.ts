import useSelectionStore from '@/store/selection-store';
import useElementStore, { ElementStoreElement } from '@/store/element-store';
import getElementById from '@/utility/canvas/get-element-by-id';
import { useShallow } from 'zustand/react/shallow';

type GroupedElementList = {
  parentId: string;
  filteredElementList: ElementStoreElement[];
}[];

export default function useChangeOrder(
  order: 'SEND_TO_BACK' | 'BRING_TO_FRONT',
) {
  const { elementList, changeElementOrder } = useElementStore(
    useShallow((store) => ({
      elementList: store.elementList,
      changeElementOrder: store.changeElementOrder,
    })),
  );
  const selectedElementIdList = useSelectionStore(
    (store) => store.selectedElementIdList,
  );

  const handleSendToBack = () => {
    // Map selected element IDs to their respective element
    const selectedElementList = selectedElementIdList
      .map((selementElementId) => getElementById(selementElementId)!)
      .sort(
        (a, b) =>
          elementList.findIndex((element) => element.id === a.id) -
          elementList.findIndex((element) => element.id === b.id),
      );

    // Group elements based on their parent element
    const groupedElementList = selectedElementList.reduce<GroupedElementList>(
      (result, element) => {
        const addedElementIndex = result.findIndex(
          (resultElement) => resultElement.parentId === element.parentId,
        );
        if (addedElementIndex !== -1) {
          result[addedElementIndex].filteredElementList.push(element);
        } else {
          result.push({
            parentId: element.parentId,
            filteredElementList: [element],
          });
        }
        return result;
      },
      [] as GroupedElementList,
    );

    groupedElementList.forEach(({ parentId, filteredElementList }) => {
      let targetElementIndex = 0;
      let filteredElementIdList: string[] = [];

      if (order === 'SEND_TO_BACK') {
        targetElementIndex = elementList.findIndex(
          (element) => element.parentId === parentId,
        )!;
      } else if (order === 'BRING_TO_FRONT') {
        targetElementIndex =
          elementList.length -
          1 -
          (JSON.parse(JSON.stringify(elementList)) as ElementStoreElement[])
            .reverse()
            .findIndex((element) => element.parentId === parentId)!;
      }

      const targetElement = elementList[targetElementIndex];

      filteredElementIdList = filteredElementList
        .map((element) => element.id)
        // Remove target element from the list
        .filter((elementId) => elementId !== targetElement.id);

      const isTargetInFilteredElementList = filteredElementList.some(
        (element) => element.id === targetElement.id,
      );

      if (isTargetInFilteredElementList) {
        /* Check whether elements are in their currect position or not
           and filter them out from the list if they are */
        filteredElementIdList = filteredElementIdList.filter(
          (elementId, index, array) => {
            return (
              targetElementIndex !==
              (order === 'BRING_TO_FRONT'
                ? elementList.findIndex((element) => element.id === elementId) +
                  array.length -
                  index
                : elementList.findIndex((element) => element.id === elementId) -
                  index -
                  1)
            );
          },
        );
      }

      changeElementOrder(
        filteredElementIdList,
        targetElement.id,
        order === 'BRING_TO_FRONT' ? 'AFTER' : 'BEFORE',
      );
    });
  };

  return handleSendToBack;
}
