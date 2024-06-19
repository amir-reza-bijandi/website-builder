import useCanvasStore from '@/store/canvas-store';
import { useShallow } from 'zustand/react/shallow';

export default function useDelete() {
  const { selectedElementIdList, deleteElement } = useCanvasStore(
    useShallow((store) => ({
      selectedElementIdList: store.selectedElementIdList,
      deleteElement: store.deleteElement,
    })),
  );

  const handleDelete = (...elementIdList: string[]) => {
    if (elementIdList.length > 0) {
      deleteElement(...elementIdList);
    } else {
      if (selectedElementIdList.length > 0) {
        deleteElement(...selectedElementIdList);
      }
    }
  };
  return handleDelete;
}
