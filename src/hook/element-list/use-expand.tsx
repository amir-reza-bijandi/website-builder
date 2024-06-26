import useCanvasStore from '@/store/canvas-store';
import useSelectionStore from '@/store/selection-store';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import { useEffect, useMemo, useState } from 'react';

export default function useExpand(elementId: string) {
  const [isExpanded, setExpand] = useState(false);

  const elementList = useCanvasStore((store) => store.elementList);

  const selectedElementIdList = useSelectionStore(
    (store) => store.selectedElementIdList,
  );

  // Check whether the current item is an ancestor of an selected item
  const isAncestorOfSelectedElement = useMemo(
    () =>
      selectedElementIdList
        .map((selectedElementId) => getAncestorIdList(selectedElementId))
        .some((list) => list?.some((ancestorId) => ancestorId === elementId)),
    [selectedElementIdList, elementId, elementList],
  );

  useEffect(() => {
    if (isAncestorOfSelectedElement) {
      setExpand(true);
    }
  }, [isAncestorOfSelectedElement]);

  const handleExpand: React.MouseEventHandler = (e) => {
    /* Since there is a parent child relationship between items, 
       this prevents clicking on the child to trigger the same 
       event for the parent */
    e.stopPropagation();
    setExpand((lastState) => !lastState);
  };

  return { isExpanded, handleExpand, isAncestorOfSelectedElement };
}
