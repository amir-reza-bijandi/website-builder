import TreeView, {
  TreeViewReorderEventHandler,
  TreeViewSelectEventHandler,
} from '../ui/tree-view';
import useCanvasStore from '@/store/canvas-store';
import { CanvasElementType } from '@/type/element-property-types';
import { FrameIcon, ImageIcon, TypeIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import getDescendentIdList from '@/utility/canvas/get-descendent-id-list';

export default function ElementList() {
  const {
    elementList,
    selectedElementIdList,
    setSelectedElementIdList,
    setLayer,
  } = useCanvasStore(
    useShallow((store) => ({
      elementList: store.elementList,
      selectedElementIdList: store.selectedElementIdList,
      setSelectedElementIdList: store.setSelectedElementIdList,
      setLayer: store.setLayer,
    })),
  );

  const iconMap: Record<CanvasElementType, JSX.Element> = {
    FRAME: <FrameIcon size={16} />,
    TEXT: <TypeIcon size={16} />,
    IMAGE: <ImageIcon size={16} />,
  };

  const treeViewItemList = elementList.map((element) => ({
    id: element.id,
    parentId: element.parentId,
    value: element.displayName,
    layer: element.layer,
    icon: iconMap[element.type],
  }));

  const handleSelect: TreeViewSelectEventHandler = ({
    ctrlKey,
    selectedItemId,
    selectedItemLayer,
  }) => {
    // Check whether the id is empty or not
    if (selectedItemId) {
      const isElementSelected = selectedElementIdList.some(
        (selectedElementId) => selectedElementId === selectedItemId,
      );
      if (ctrlKey) {
        // Check if element is already selected
        if (isElementSelected) {
          // deselect the element
          setSelectedElementIdList(
            selectedElementIdList.filter(
              (selectedElementId) => selectedElementId !== selectedItemId,
            ),
            true,
          );
        } else {
          // Select multiple elements
          const childElements = getDescendentIdList(selectedItemId);

          const isDescendentSelected = selectedElementIdList
            .map((selectedElementId) => getAncestorIdList(selectedElementId))
            .some((ancestorIdList) =>
              ancestorIdList?.some((ancestorId) => {
                return ancestorId === selectedItemId;
              }),
            );

          const isAncestorSelected = getAncestorIdList(selectedItemId)?.some(
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
                selectedItemId,
              ],
              true,
            );
          }
          // Check if selected element is a child of some already selected element
          else if (isAncestorSelected) {
            return;
          } else {
            setSelectedElementIdList(
              [...selectedElementIdList, selectedItemId],
              true,
            );
          }
        }
        // Change the layer to the selected element's layer
        setLayer(selectedElementIdList.length > 1 ? 0 : selectedItemLayer);
      } else {
        const isElementSelected = selectedElementIdList.some(
          (selectedElement) => selectedElement === selectedItemId,
        );

        // Prevent selecting the element if it's already selected
        if (isElementSelected && selectedElementIdList.length === 1) return;

        setSelectedElementIdList([selectedItemId], true);
        setLayer(selectedItemLayer);
      }
    } else {
      setSelectedElementIdList([], false);
    }
  };

  const handleReorder: TreeViewReorderEventHandler = (e) => {
    console.log(e);
  };

  return (
    <TreeView
      itemList={treeViewItemList}
      selectedItemIdList={selectedElementIdList}
      onSelect={handleSelect}
      onReorder={handleReorder}
    />
  );
}
