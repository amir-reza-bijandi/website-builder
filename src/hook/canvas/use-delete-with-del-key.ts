import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useSelectionStore from '@/store/selection-store';
import useToolboxStore from '@/store/toolbox-store';
import useElementStore from '@/store/element-store';

export default function useDeleteWithDelKey() {
  const deleteElement = useElementStore((store) => store.deleteElement);
  const toolboxAction = useToolboxStore((store) => store.action);
  const { selectedElementIdList, setSelectedElementIdList, setLayer } =
    useSelectionStore(
      useShallow((store) => ({
        selectedElementIdList: store.selectedElementIdList,
        setSelectedElementIdList: store.setSelectedElementIdList,
        setLayer: store.setLayer,
      })),
    );

  useEffect(() => {
    const handleDeleteElement = (e: KeyboardEvent) => {
      if (toolboxAction === 'SELECT') {
        if (e.key === 'Delete') {
          if (selectedElementIdList.length > 0) {
            deleteElement(...selectedElementIdList);
            setSelectedElementIdList([], { isSelectionVisible: false });
            setLayer(0);
          }
        }
      }
    };

    document.addEventListener('keydown', handleDeleteElement, false);
    return () => document.removeEventListener('keydown', handleDeleteElement);
  }, [
    selectedElementIdList,
    toolboxAction,
    deleteElement,
    setLayer,
    setSelectedElementIdList,
  ]);
}
