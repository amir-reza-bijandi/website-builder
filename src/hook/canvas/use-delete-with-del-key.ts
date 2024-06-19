import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useCanvasStore from '@/store/canvas-store';

export default function useDeleteWithDelKey() {
  const { deleteElement, selectedElementIdList, toolbox } = useCanvasStore(
    useShallow((store) => ({
      selectedElementIdList: store.selectedElementIdList,
      deleteElement: store.deleteElement,
      toolbox: store.toolbox,
    })),
  );

  useEffect(() => {
    const handleDeleteElement = (e: KeyboardEvent) => {
      if (toolbox.action === 'SELECT') {
        if (e.key === 'Delete') {
          if (selectedElementIdList.length > 0) {
            deleteElement(...selectedElementIdList);
          }
        }
      }
    };

    document.addEventListener('keydown', handleDeleteElement, false);
    return () => document.removeEventListener('keydown', handleDeleteElement);
  }, [selectedElementIdList, toolbox.action]);
}
