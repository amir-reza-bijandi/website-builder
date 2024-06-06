import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useCanvasStore from '@/store/canvas-store';

export default function useDelete() {
  const { deleteElement, isFocused, selectedElementIdList, toolbox } =
    useCanvasStore(
      useShallow((store) => ({
        selectedElementIdList: store.selectedElementIdList,
        deleteElement: store.deleteElement,
        isFocused: store.isFocused,
        toolbox: store.toolbox,
      })),
    );

  useEffect(() => {
    const handleDeleteElement = (e: KeyboardEvent) => {
      if (toolbox.action === 'SELECT') {
        if (e.key === 'Delete' && isFocused) {
          if (selectedElementIdList.length > 0) {
            deleteElement(...selectedElementIdList);
          }
        }
      }
    };

    document.addEventListener('keydown', handleDeleteElement, false);
    return () => document.removeEventListener('keydown', handleDeleteElement);
  }, [selectedElementIdList, isFocused, toolbox.action]);
}
