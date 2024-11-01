import useElementStore from '@/store/element-store';
import useSelectionStore from '@/store/selection-store';
import getAncestorIdList from '@/utility/canvas/get-ancestor-id-list';
import { useEffect, useMemo, useState } from 'react';

export default function useExpand(elementId: string) {
  const [isExpanded, setExpand] = useState(false);

  const elementList = useElementStore((store) => store.elementList);

  const selectedElementIdList = useSelectionStore(
    (store) => store.selectedElementIdList,
  );

  // Check whether the current item is an ancestor of an selected item
  const isAncestorOfSelectedElement = useMemo(
    () =>
      selectedElementIdList
        .map((selectedElementId) => getAncestorIdList(selectedElementId))
        .some((list) => list?.some((ancestorId) => ancestorId === elementId)),
    // Element list is needed to cause a re-render when order of elements changes
    // eslint-disable-next-line
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
