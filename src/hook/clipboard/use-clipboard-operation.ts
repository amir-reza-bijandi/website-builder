import useCanvasStore from '@/store/canvas-store';
import useClipboardStore, {
  ClipboardStoreItem,
  ClipboardStoreOperation,
} from '@/store/clipboard-store';
import { CanvasStoreElement } from '@/type/canvas-store-types';
import getElementById from '@/utility/canvas/get-element-by-id';
import useDelete from '../canvas/use-delete';
import getDescendentIdList from '@/utility/canvas/get-descendent-id-list';
import scaleWithZoomFactor from '@/utility/canvas/scale-with-zoom-factor';

export default function useClipboardOperation(
  operation: ClipboardStoreOperation,
) {
  const selectedElementIdList = useCanvasStore(
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

    const elementList: CanvasStoreElement[] = elementIdList.map((elementId) =>
      JSON.parse(JSON.stringify(getElementById(elementId)!)),
    );

    const elementRectList = elementList.map((element) =>
      scaleWithZoomFactor(
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
