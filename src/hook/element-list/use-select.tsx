import useSelectionStore from '@/store/selection-store';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import getDescendentIdList from '@/utility/canvas/get-descendent-id-list';
import { useShallow } from 'zustand/react/shallow';

export default function useSelect() {
  const { selectedElementIdList, setSelectedElementIdList, setLayer } =
    useSelectionStore(
      useShallow((store) => ({
        selectedElementIdList: store.selectedElementIdList,
        setSelectedElementIdList: store.setSelectedElementIdList,
        setLayer: store.setLayer,
      })),
    );

  const handleSelect = (
    elementId: string,
    layer: number,
    multiSelect: boolean,
  ) => {
    // Check whether the id is empty or not
    if (elementId) {
      const isElementSelected = selectedElementIdList.some(
        (selectedElementId) => selectedElementId === elementId,
      );
      if (multiSelect) {
        // Check if element is already selected
        if (isElementSelected) {
          // deselect the element
          setSelectedElementIdList(
            selectedElementIdList.filter(
              (selectedElementId) => selectedElementId !== elementId,
            ),
            { isSelectionVisible: true },
          );
        } else {
          // Select multiple elements
          const childElements = getDescendentIdList(elementId);

          const isDescendentSelected = selectedElementIdList
            .map((selectedElementId) => getAncestorIdList(selectedElementId))
            .some((ancestorIdList) =>
              ancestorIdList?.some((ancestorId) => {
                return ancestorId === elementId;
              }),
            );

          const isAncestorSelected = getAncestorIdList(elementId)?.some(
            (ancestorId) =>
              selectedElementIdList.some(
                (selectedElementId) => selectedElementId === ancestorId,
              ),
          );

          // Check if th e selected element is the parent of some already selected elements
          if (isDescendentSelected) {
            setSelectedElementIdList(
              [
                ...selectedElementIdList.filter(
                  (selectedElementId) =>
                    !childElements?.includes(selectedElementId),
                ),
                elementId,
              ],
              { isSelectionVisible: true },
            );
          }
          // Check if selected element is a child of some already selected element
          else if (isAncestorSelected) {
            return;
          } else {
            setSelectedElementIdList([...selectedElementIdList, elementId], {
              isSelectionVisible: true,
            });
          }
        }
        // Change the layer to the selected element's layer
        setLayer(selectedElementIdList.length > 1 ? 0 : layer);
      } else {
        const isElementSelected = selectedElementIdList.some(
          (selectedElement) => selectedElement === elementId,
        );

        // Prevent selecting the element if it's already selected
        if (isElementSelected && selectedElementIdList.length === 1) return;

        setSelectedElementIdList([elementId], {
          isSelectionVisible: true,
          layer,
        });
      }
    } else {
      setSelectedElementIdList([], { isSelectionVisible: false });
    }
  };
  return handleSelect;
}
