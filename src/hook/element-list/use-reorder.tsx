import { ElementListContext } from '@/component/panel/element-list/element-list';
import useCanvasStore from '@/store/canvas-store';
import useSelectionStore from '@/store/selection-store';
import { Placement } from '@/type/general-types';
import getDescendentIdList from '@/utility/canvas/get-descendent-id-list';
import getElementById from '@/utility/canvas/get-element-by-id';
import { useContext } from 'react';

export default function useReorder(
  id: string,
  selectOnReleaseRef: React.MutableRefObject<boolean>,
) {
  const changeElementOrder = useCanvasStore(
    (store) => store.changeElementOrder,
  );
  const { dropStatus, setDropStatus, isDraggingRef, isMouseDownRef } =
    useContext(ElementListContext);

  const handleReorder = () => {
    isMouseDownRef.current = true;
    document.body.addEventListener('mouseup', handleDrop);
  };

  const handleDrop = () => {
    if (isDraggingRef.current) {
      setDropStatus((lastState) => {
        if (lastState.dropLocation) {
          // We need the latest changes in selected elements
          const selectedElementIdList =
            useSelectionStore.getState().selectedElementIdList;

          // Prevent dropping the element on itself
          if (
            selectedElementIdList.length !== 1 ||
            selectedElementIdList[0] !== lastState.targetId
          ) {
            const targetElement = getElementById(lastState.targetId)!;
            if (
              targetElement.type === 'FRAME' ||
              lastState.dropLocation !== 'INSIDE'
            ) {
              // Prevent droping the element inside an non-frame parent
              changeElementOrder(
                useSelectionStore.getState().selectedElementIdList,
                lastState.targetId,
                lastState.dropLocation,
              );
            }
          }
        }
        return { dropLocation: null, targetId: '' };
      });
      selectOnReleaseRef.current = false;
      isDraggingRef.current = false;
    }
    isMouseDownRef.current = false;
    document.body.removeEventListener('mouseup', handleDrop);
  };

  const handleDrag: React.MouseEventHandler = (e) => {
    const EDGE_CENTER_HITBOX = 10;
    const selectedElementIdList =
      useSelectionStore.getState().selectedElementIdList;
    if (isMouseDownRef.current) {
      isDraggingRef.current = true;
    }
    if (isMouseDownRef.current) {
      const { clientX, clientY, currentTarget } = e;
      e.stopPropagation();
      const targetRect = currentTarget.getBoundingClientRect();
      const deltaY = clientY - targetRect.top;
      let dropLocation: Placement | null = null;

      if (
        clientX >= targetRect.left &&
        clientX <= targetRect.left + targetRect.width
      ) {
        if (deltaY < EDGE_CENTER_HITBOX) {
          dropLocation = 'BEFORE';
        } else if (deltaY > targetRect.height - EDGE_CENTER_HITBOX) {
          dropLocation = 'AFTER';
        } else {
          dropLocation = 'INSIDE';
        }
      }

      // Prevent unnecessary rerender when hovering over items
      if (
        dropLocation !== dropStatus.dropLocation ||
        id !== dropStatus.targetId
      ) {
        // Prevent changing drop target when hovering descendents
        const descendentList = selectedElementIdList
          .map((itemId) => getDescendentIdList(itemId))
          .flat();
        const isDescendent = descendentList.includes(id);
        if (isDescendent) return;

        setDropStatus({ dropLocation, targetId: id });
      }
    }
  };
  return { handleReorder, handleDrag };
}
