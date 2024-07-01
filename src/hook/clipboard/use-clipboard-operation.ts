import useClipboardStore, {
  ClipboardStoreItem,
  ClipboardStoreOperation,
} from '@/store/clipboard-store';
import { ElementStoreElement } from '@/store/element-store';
import getElementById from '@/utility/canvas/get-element-by-id';
import useDelete from '../canvas/use-delete';
import getDescendentIdList from '@/utility/canvas/get-descendent-id-list';
import scaleWithzoomLevel from '@/utility/canvas/scale-with-zoom-level';
import useSelectionStore from '@/store/selection-store';

export default function useClipboardOperation(
  operation: ClipboardStoreOperation,
) {
  const selectedElementIdList = useSelectionStore(
    (store) => store.selectedElementIdList,
  );
  const setStatus = useClipboardStore((store) => store.setStatus);
  const handleDelete = useDelete();

  const handleClipboardOperation = (...elementToOperateIdList: string[]) => {
    let elementIdList: string[] = [];

    if (elementToOperateIdList.length) {
      elementIdList = elementToOperateIdList;
    } else if (selectedElementIdList.length) {
      elementIdList = selectedElementIdList;
    }

    const elementList: ElementStoreElement[] = elementIdList.map((elementId) =>
      JSON.parse(JSON.stringify(getElementById(elementId)!)),
    );

    const elementRectList = elementList.map((element) =>
      scaleWithzoomLevel(
        document.getElementById(element.id)!.getBoundingClientRect(),
      ),
    );

    const descendentList = elementList.map(
      (element) =>
        getDescendentIdList(element.id)?.map(
          (descendentId) => getElementById(descendentId)!,
        ) ?? null,
    );

    const itemList = elementList.map<ClipboardStoreItem>((element, index) => [
      element,
      descendentList[index],
      elementRectList[index],
    ]);

    if (operation === 'CUT') {
      handleDelete(...elementIdList);
    }

    setStatus({ operation, itemList });
  };

  return handleClipboardOperation;
}
