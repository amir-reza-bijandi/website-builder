import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useCanvasStore from '@/store/canvas-store';
import useSelectionStore from '@/store/selection-store';

export default function useDeleteWithDelKey() {
  const { deleteElement, toolbox } = useCanvasStore(
    useShallow((store) => ({
      deleteElement: store.deleteElement,
      toolbox: store.toolbox,
    })),
  );
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
      if (toolbox.action === 'SELECT') {
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
    toolbox.action,
    deleteElement,
    setLayer,
    setSelectedElementIdList,
  ]);
}
