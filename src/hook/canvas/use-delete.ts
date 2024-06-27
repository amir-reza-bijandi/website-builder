import useCanvasStore from '@/store/canvas-store';
import useSelectionStore from '@/store/selection-store';
import { useShallow } from 'zustand/react/shallow';

export default function useDelete() {
  const deleteElement = useCanvasStore((store) => store.deleteElement);
  const { selectedElementIdList, setSelectedElementIdList, setLayer } =
    useSelectionStore(
      useShallow((store) => ({
        selectedElementIdList: store.selectedElementIdList,
        setSelectedElementIdList: store.setSelectedElementIdList,
        setLayer: store.setLayer,
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
    setSelectedElementIdList([], { isSelectionVisible: false });
    setLayer(0);
  };
  return handleDelete;
}
